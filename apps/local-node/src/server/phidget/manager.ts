// @arcana/local-node — Phidget22 device manager.
//
// Wraps the phidget22 npm package behind the same TemperatureSource
// interface as the simulator. Discovers attached TMP1101 thermocouple
// modules, opens them on demand, and emits LiveSample events at the
// configured data interval (default 1000ms = 1Hz).
//
// The Phidget22 library handles USB + VINT Hub transports transparently.
// On Windows 7+ you need the Phidget22 driver installed (we'll add
// that note to the docs in a later chunk). Without the driver, this
// module will fail to attach and the UI will fall back to the simulator.

import { EventEmitter } from 'node:events';
// phidget22 is a native module. We import it lazily inside connect()
// so the simulator-only path doesn't need the binary.
// eslint-disable-next-line @typescript-eslint/no-var-requires
type PhidgetNS = typeof import('phidget22');
import type { LiveDeviceInfo, LiveSample, TemperatureSource } from './types.js';

export class PhidgetManager extends EventEmitter implements TemperatureSource {
  readonly kind = 'phidget' as const;
  private phidget: PhidgetNS | null = null;
  private temperatureSensor: any = null; // phidget22.TemperatureSensor
  private dataIntervalMs = 1000;
  private startTimeMs = 0;
  private attached = false;

  async listDevices(): Promise<LiveDeviceInfo[]> {
    // Lazy-load phidget22 — only if a real device is asked for
    if (!this.phidget) {
      this.phidget = await import('phidget22');
    }
    return new Promise((resolve, reject) => {
      try {
        // The Manager class finds all attached Phidget22 devices
        const manager = new this.phidget!.Manager();
        const devices: LiveDeviceInfo[] = [];
        manager.onAttach = (phidget: any) => {
          // Only TemperatureSensor class (TMP1101) is what we care about
          if (phidget.getClassName && phidget.getClassName() === 'TemperatureSensor') {
            devices.push({
              id: String(phidget.getDeviceSerialNumber()),
              label: `TMP1101 #${phidget.getDeviceSerialNumber()} on ${phidget.getHubPort() ?? '?'}`,
              channels: phidget.getChannelCount ? phidget.getChannelCount() : 2,
              isConnected: false,
            });
          }
        };
        manager.open();
        // Give it 1.5s to discover devices
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

  async connect(deviceId: string): Promise<void> {
    if (!this.phidget) {
      this.phidget = await import('phidget22');
    }
    const serial = Number(deviceId);
    if (Number.isNaN(serial)) {
      throw new Error(`PhidgetManager: invalid device id "${deviceId}" (must be a number)`);
    }

    this.emit('state', 'connecting');

    return new Promise((resolve, reject) => {
      try {
        const TS = this.phidget!.TemperatureSensor;
        const sensor = new TS();

        sensor.onAttach = () => {
          this.attached = true;
          this.startTimeMs = Date.now();
          this.emit('state', 'connected');
          resolve();
        };
        sensor.onDetach = () => {
          this.attached = false;
          this.emit('state', 'disconnected');
        };
        sensor.onError = (code: number, description: string) => {
          this.emit('error', new Error(`Phidget error ${code}: ${description}`));
        };
        sensor.onTemperatureChange = (temperature: number) => {
          if (!this.attached) return;
          const t = Math.floor((Date.now() - this.startTimeMs) / 1000);
          // TemperatureSensor has a single thermocouple input, not two.
          // Real VNT setups have two TMP1101 modules — one for BT, one for ET.
          // For a single TMP1101 we map the same reading to both channels
          // so the chart at least shows something. The user can wire up
          // the second TMP1101 in a later iteration.
          const sample: LiveSample = {
            t,
            bt: round1(temperature),
            et: round1(temperature + 15), // estimate; replace with real ET channel
          };
          this.emit('sample', sample);
        };

        sensor.setDeviceSerialNumber(serial);
        sensor.setChannel(0);
        sensor.setDataInterval(this.dataIntervalMs);
        sensor.open().catch((err: Error) => {
          this.emit('error', err);
          this.emit('state', 'error');
          reject(err);
        });
        this.temperatureSensor = sensor;
      } catch (err) {
        this.emit('error', err as Error);
        this.emit('state', 'error');
        reject(err as Error);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.temperatureSensor) {
      try {
        await this.temperatureSensor.close();
      } catch {
        // ignore — closing an already-closed sensor throws
      }
      this.temperatureSensor = null;
    }
    this.attached = false;
    this.emit('state', 'disconnected');
  }

  isConnected(): boolean {
    return this.attached;
  }

  setDataInterval(ms: number): void {
    this.dataIntervalMs = Math.max(20, Math.min(60_000, ms));
  }

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
