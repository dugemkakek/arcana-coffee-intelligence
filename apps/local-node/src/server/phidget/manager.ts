// @arcana/local-node — Phidget 1048 (PhidgetTemperatureSensor 4-Input) via raw HID.
//
// The phidget22 user-mode library's Manager pattern requires either the
// Phidget22 kernel driver (Phidget22Service + phidget22.sys) or a
// libusb-compatible driver bound to the device. On Windows hosts where
// only the user-mode phidget22.dll is present and the device is bound to
// the standard HIDClass driver, Manager.onAttach never fires and direct
// TemperatureSensor.open() times out — even though the Phidget Control
// Panel can still read the device via raw Win32 HID APIs.
//
// To get the device working in that environment we bypass phidget22
// entirely and read HID input reports directly with `node-hid`.
//
// HID input report format (hypothesis, byte 9 = status, 10 bytes total):
//   [0]    : report id
//   [1..2] : channel 0, int16 little-endian, value / 100 = °C
//   [3..4] : channel 1
//   [5..6] : channel 2
//   [7..8] : channel 3
//   [9]    : status
//
// Adjust BT_CHANNEL / ET_CHANNEL env vars if the roaster wires probes to
// different physical channels on the 1048.

import { EventEmitter } from 'node:events';
import type {
  LiveDeviceInfo,
  LiveSample,
  TemperatureSource,
} from './types.js';

const PHIDGET_VID = 0x06c2;
const TEMP_SENSOR_4INPUT_PID = 0x0032; // Phidget 1048

interface TempCelsius {
  bt: number;
  et: number;
  etEstimated: boolean;
}

export class PhidgetManager extends EventEmitter implements TemperatureSource {
  readonly kind = 'phidget' as const;
  private hid: any | null = null;
  private dataIntervalMs = 1000;
  private startTimeMs = 0;
  private attached = false;
  private btChannel = 0;
  private etChannel = 1;
  private lastBt = 0;
  private lastEt = 0;

  constructor() {
    super();
    const bt = Number(process.env.BT_CHANNEL ?? 0);
    const et = Number(process.env.ET_CHANNEL ?? 1);
    if (!Number.isNaN(bt) && bt >= 0 && bt <= 3) this.btChannel = bt;
    if (!Number.isNaN(et) && et >= 0 && et <= 3) this.etChannel = et;
  }

  // ---------- Device discovery ----------

  async listDevices(): Promise<LiveDeviceInfo[]> {
    const hid = await import('node-hid');
    const all: any[] = hid.devices();
    return all
      .filter((d) => d.vendorId === PHIDGET_VID && d.productId === TEMP_SENSOR_4INPUT_PID)
      .map((d) => ({
        id: String(d.serialNumber ?? d.path),
        label: `PhidgetTemperatureSensor 4-Input #${d.serialNumber ?? '?'}`,
        channels: 4,
        isConnected: false,
      }));
  }

  // ---------- Two-channel connect (kept for back-compat) ----------

  /**
   * Open the first matching device. The `deviceId` is currently ignored
   * — we only support the PN_1048 (4-input thermocouple) right now.
   */
  async connect(deviceId: string): Promise<void> {
    void deviceId; // currently unused; PN_1048 is auto-selected
    await this.connectFirst();
  }

  /**
   * Open BT and ET on the first matching device. Per-channel serials
   * don't apply to a 4-input board (it's one device, multiple channels),
   * so we just open the device and read the configured channels.
   */
  async connectBtEt(_btSerial: number | undefined, _etSerial: number | undefined): Promise<void> {
    void _btSerial;
    void _etSerial;
    await this.connectFirst();
  }

  private async connectFirst(): Promise<void> {
    this.emit('state', 'connecting');
    const hid = await import('node-hid');
    const matches: any[] = hid
      .devices()
      .filter((d: any) => d.vendorId === PHIDGET_VID && d.productId === TEMP_SENSOR_4INPUT_PID);
    if (matches.length === 0) {
      const err = new Error('No PhidgetTemperatureSensor 4-Input (VID 06C2 / PID 0032) found on HID');
      this.emit('error', err);
      this.emit('state', 'error');
      throw err;
    }
    const path = matches[0].path as string;
    try {
      this.hid = new hid.HID(path);
    } catch (e) {
      const err = e as Error;
      this.emit('error', new Error(`Failed to open HID device: ${err.message}`));
      this.emit('state', 'error');
      throw err;
    }
    this.hid.on('data', (buf: Buffer) => this.handleReport(buf));
    this.hid.on('error', (e: Error) => {
      this.emit('error', e);
      this.emit('state', 'error');
    });

    this.startTimeMs = Date.now();
    this.attached = true;
    this.emit('state', 'connected');
  }

  private handleReport(buf: Buffer): void {
    if (!this.attached) return;
    if (buf.length < 9) return;
    // 1 byte report id, then 4×int16 LE temperatures in 0.01°C units.
    const ch0 = buf.readInt16LE(1) / 100;
    const ch1 = buf.readInt16LE(3) / 100;
    const ch2 = buf.readInt16LE(5) / 100;
    const ch3 = buf.readInt16LE(7) / 100;
    const channels = [ch0, ch1, ch2, ch3];
    this.lastBt = channels[this.btChannel] ?? 0;
    this.lastEt = channels[this.etChannel] ?? this.lastBt + 15;
    this.maybeEmitSample();
  }

  // ---------- Lifecycle ----------

  async disconnect(): Promise<void> {
    if (this.hid) {
      try {
        this.hid.close();
      } catch {
        // ignore
      }
      this.hid = null;
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

  // ---------- Internals ----------

  private maybeEmitSample(): void {
    if (!this.attached) return;
    const t = Math.floor((Date.now() - this.startTimeMs) / 1000);
    // If BT and ET are configured for the same physical channel, ET is
    // the same as BT — don't claim it's "estimated".
    const etEstimated = this.etChannel !== this.btChannel && this.lastEt === this.lastBt + 15;
    const sample: LiveSample = {
      t,
      bt: round1(this.lastBt),
      et: round1(this.lastEt),
      etEstimated,
      btChannel: this.btChannel,
      etChannel: etEstimated ? 'estimated' : this.etChannel,
    };
    this.emit('sample', sample);
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}
