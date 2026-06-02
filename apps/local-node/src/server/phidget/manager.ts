// @arcana/local-node — Phidget22 device manager (two-channel).
//
// Wraps the phidget22 npm package behind the same TemperatureSource
// interface as the simulator. Discovers attached TMP1101 thermocouple
// modules, opens them on demand, and emits LiveSample events at the
// configured data interval (default 1000ms = 1Hz).
//
// Two-channel behavior:
//   - First TMP1101 found (or BT_DEVICE_SERIAL) → BT
//   - Second TMP1101 found (or ET_DEVICE_SERIAL) → ET
//   - If only one sensor is found, ET is estimated as BT + 15°C and
//     the emitted sample has `etEstimated: true` so the UI can show
//     a "ET estimated" banner
//
// The Phidget22 library handles USB + VINT Hub transports transparently.
// On Windows 7+ you need the Phidget22 driver installed. Without the
// driver, this module will fail to attach and the UI will fall back to
// the simulator.

import { EventEmitter } from 'node:events';
import type { PhidgetNS } from './phidget-types.js';
import type { LiveDeviceInfo, LiveSample, TemperatureSource } from './types.js';

interface SensorHandle {
  raw: any; // phidget22.TemperatureSensor
  channel: 'bt' | 'et';
  lastTempC: number;
  lastUpdatedAt: number;
}

export class PhidgetManager extends EventEmitter implements TemperatureSource {
  readonly kind = 'phidget' as const;
  private phidget: PhidgetNS | null = null;
  private btSensor: SensorHandle | null = null;
  private etSensor: SensorHandle | null = null;
  private dataIntervalMs = 1000;
  private startTimeMs = 0;
  private attached = false;
  /** Set of serials explicitly assigned (or auto-discovered) to BT/ET. */
  private serialsAssigned: { bt?: number; et?: number } = {};

  // ---------- Device discovery ----------

  async listDevices(): Promise<LiveDeviceInfo[]> {
    if (!this.phidget) {
      this.phidget = await import('phidget22');
    }
    return new Promise((resolve, reject) => {
      try {
        const manager = new this.phidget!.Manager();
        const devices: LiveDeviceInfo[] = [];
        manager.onAttach = (phidget: any) => {
          if (phidget.getClassName && phidget.getClassName() === 'TemperatureSensor') {
            devices.push({
              id: String(phidget.getDeviceSerialNumber()),
              label: `TMP1101 #${phidget.getDeviceSerialNumber()} on hub port ${phidget.getHubPort() ?? '?'}`,
              channels: phidget.getChannelCount ? phidget.getChannelCount() : 1,
              isConnected: false,
            });
          }
        };
        manager.open();
        setTimeout(() => {
          try {
            manager.close();
          } catch {
            // ignore
          }
          resolve(devices);
        }, 1500);
      } catch (err) {
        reject(err as Error);
      }
    });
  }

  // ---------- Two-channel connect ----------

  /**
   * Open a temperature source by deviceId. For backwards compat the
   * single-arg form just opens BT on the given sensor. If you want to
   * pick a specific BT and ET, use the env vars BT_DEVICE_SERIAL /
   * ET_DEVICE_SERIAL or call connectBtEt(btSerial, etSerial).
   */
  async connect(deviceId: string): Promise<void> {
    const serial = Number(deviceId);
    if (Number.isNaN(serial)) {
      throw new Error(`PhidgetManager: invalid device id "${deviceId}" (must be a number)`);
    }
    await this.connectBtEt(serial, undefined);
  }

  /**
   * Open BT and optionally ET on specific TMP1101 serials.
   * If `etSerial` is undefined, the manager will auto-discover a second
   * TMP1101 on the same hub and use it for ET. If no second sensor is
   * found, ET will be estimated.
   */
  async connectBtEt(btSerial: number, etSerial: number | undefined): Promise<void> {
    if (!this.phidget) {
      this.phidget = await import('phidget22');
    }

    this.emit('state', 'connecting');

    try {
      this.btSensor = await this.openSensor(btSerial, 'bt');
      this.serialsAssigned.bt = btSerial;
    } catch (err) {
      this.emit('state', 'error');
      throw new Error(`Failed to open BT sensor (serial=${btSerial}): ${(err as Error).message}`);
    }

    // If ET serial is explicitly given, use it. Otherwise auto-discover
    // a different TMP1101 on the same hub.
    let resolvedEtSerial = etSerial;
    if (resolvedEtSerial == null) {
      const discovered = await this.discoverEtSerial(btSerial);
      resolvedEtSerial = discovered ?? undefined;
    }

    if (resolvedEtSerial != null) {
      try {
        this.etSensor = await this.openSensor(resolvedEtSerial, 'et');
        this.serialsAssigned.et = resolvedEtSerial;
      } catch (err) {
        // ET is optional — log and continue with estimate
        this.emit(
          'error',
          new Error(
            `Failed to open ET sensor (serial=${resolvedEtSerial}): ${(err as Error).message}. ` +
              'Falling back to BT-only mode with ET estimated.',
          ),
        );
        this.etSensor = null;
      }
    }

    this.startTimeMs = Date.now();
    this.attached = true;
    this.emit('state', 'connected');
  }

  // ---------- Internals ----------

  private async openSensor(serial: number, channel: 'bt' | 'et'): Promise<SensorHandle> {
    return new Promise((resolve, reject) => {
      const TS = this.phidget!.TemperatureSensor;
      const sensor = new TS();
      const handle: SensorHandle = { raw: sensor, channel, lastTempC: 0, lastUpdatedAt: 0 };

      sensor.onAttach = () => {
        resolve(handle);
      };
      sensor.onError = (code: number, description: string) => {
        this.emit('error', new Error(`${channel.toUpperCase()} sensor error ${code}: ${description}`));
      };
      sensor.onTemperatureChange = (temperature: number) => {
        handle.lastTempC = temperature;
        handle.lastUpdatedAt = Date.now();
        this.maybeEmitSample();
      };

      sensor.setDeviceSerialNumber(serial);
      sensor.setChannel(0);
      sensor.setDataInterval(this.dataIntervalMs);
      sensor.open().catch((err: Error) => {
        reject(err);
      });
    });
  }

  /**
   * Open a Manager briefly, listen for attaches, and return the first
   * TMP1101 serial that is NOT the BT one. Returns undefined if no
   * second sensor is found within 1500ms.
   */
  private async discoverEtSerial(btSerial: number): Promise<number | undefined> {
    return new Promise((resolve) => {
      try {
        const manager = new this.phidget!.Manager();
        let found: number | undefined;
        const t = setTimeout(() => {
          try {
            manager.close();
          } catch {
            // ignore
          }
          resolve(found);
        }, 1500);
        manager.onAttach = (phidget: any) => {
          if (phidget.getClassName && phidget.getClassName() === 'TemperatureSensor') {
            const serial = phidget.getDeviceSerialNumber();
            if (serial !== btSerial && found == null) {
              found = serial;
              clearTimeout(t);
              try {
                manager.close();
              } catch {
                // ignore
              }
              resolve(found);
            }
          }
        };
        manager.open();
      } catch {
        resolve(undefined);
      }
    });
  }

  /**
   * Emit a combined LiveSample using the most recent reading from
   * each sensor. Throttled implicitly by the fact that we only call
   * this from the onTemperatureChange handlers.
   *
   * If only BT has reported, ET is estimated as BT + 15°C and the
   * sample is marked with `etEstimated: true`.
   */
  private maybeEmitSample(): void {
    if (!this.attached || !this.btSensor) return;
    const t = Math.floor((Date.now() - this.startTimeMs) / 1000);
    const bt = round1(this.btSensor.lastTempC);

    let et: number;
    let etEstimated: boolean;
    if (this.etSensor && this.etSensor.lastTempC > 0) {
      et = round1(this.etSensor.lastTempC);
      etEstimated = false;
    } else {
      et = round1(this.btSensor.lastTempC + 15);
      etEstimated = true;
    }

    const sample: LiveSample = {
      t,
      bt,
      et,
      etEstimated,
      btChannel: this.serialsAssigned.bt,
      etChannel: etEstimated ? 'estimated' : this.serialsAssigned.et,
    };
    this.emit('sample', sample);
  }

  // ---------- Lifecycle ----------

  async disconnect(): Promise<void> {
    for (const s of [this.btSensor, this.etSensor]) {
      if (s) {
        try {
          await s.raw.close();
        } catch {
          // ignore
        }
      }
    }
    this.btSensor = null;
    this.etSensor = null;
    this.serialsAssigned = {};
    this.attached = false;
    this.emit('state', 'disconnected');
  }

  isConnected(): boolean {
    return this.attached;
  }

  setDataInterval(ms: number): void {
    this.dataIntervalMs = Math.max(20, Math.min(60_000, ms));
  }

  // ---------- Subscriptions ----------

  onSample(handler: (s: LiveSample) => void): () => void {
    this.on('sample', handler);
    return () => this.off('sample', handler);
  }

  onError(handler: (err: Error) => void): () => void {
    this.on('error', handler);
    return () => this.off('error', handler);
  }

  onStateChange(handler: (state: 'disconnected' | 'connecting' | 'connected' | 'error') => void): () => void {
    this.on('state', handler);
    return () => this.off('state', handler);
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
