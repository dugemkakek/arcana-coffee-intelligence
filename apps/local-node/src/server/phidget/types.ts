// @arcana/local-node — phidget module types.
//
// Common interface for live temperature sources. The Phidget22 device
// manager and the simulator both implement this, so the rest of the
// app doesn't care which is in use.

export type RoastEventType =
  | 'charge'
  | 'tp'
  | 'dry_end'
  | 'fc_start'
  | 'fc_end'
  | 'sc_start'
  | 'sc_end'
  | 'drop'
  | 'cool'
  | 'note';

export interface LiveSample {
  /** Time since charge, in seconds. Always >= 0. */
  t: number;
  /** Bean temperature, °C. */
  bt: number;
  /** Exhaust temperature, °C. May be estimated (see `etEstimated`). */
  et: number;
  /** True when ET is computed from BT (e.g. +15°C) rather than a real sensor. */
  etEstimated?: boolean;
  /** Which channel produced BT, for diagnostics. */
  btChannel?: number;
  /** Which channel produced ET (or 'estimated'). */
  etChannel?: number | 'estimated';
}

export interface LiveDeviceInfo {
  /** Stable ID for selection. For Phidget: serial number. For simulator: 'simulator'. */
  id: string;
  /** Human-readable label. */
  label: string;
  /** Phidget22 channel count (number of thermocouples). Simulator: 2. */
  channels: number;
  /** True when this source is currently the active one. */
  isConnected: boolean;
}

export type LiveSource = 'phidget' | 'simulator';

export interface TemperatureSource {
  readonly kind: LiveSource;
  /** List devices available for connection. Resolves when scan is complete. */
  listDevices(): Promise<LiveDeviceInfo[]>;
  /** Connect to a specific device by ID. Resolves when the source is emitting samples. */
  connect(deviceId: string): Promise<void>;
  /** Disconnect the current device. */
  disconnect(): Promise<void>;
  /** True if a device is currently connected and emitting. */
  isConnected(): boolean;
  /** Subscribe to live samples. Returns an unsubscribe fn. */
  onSample(handler: (s: LiveSample) => void): () => void;
  /** Subscribe to error events (device disconnected, sensor fault, etc.). */
  onError(handler: (err: Error) => void): () => void;
  /** Subscribe to connection state changes. */
  onStateChange(handler: (state: 'disconnected' | 'connecting' | 'connected' | 'error') => void): () => void;
}
