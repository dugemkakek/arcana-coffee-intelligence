// @arcana/local-node — roast simulator.
//
// Generates a realistic synthetic roast curve so the live capture UI
// can be developed and tested without a real Phidget plugged in. The
// curve is parameterised by `profile` (light / medium / dark) and
// slightly randomized so it doesn't look identical every time.
//
// Curve shape (in real time):
//   0:00  charge     BT 200°C (or 180°C for light), ET 220°C
//   0:00  - 0:30     turning point: BT dips to ~95°C
//   0:30  - 4:30     drying phase:  BT rises slowly to ~150°C
//   4:30  dry end    color change to brown
//   4:30  - 8:00     maillard:      BT rises 150 -> 195°C
//   8:00  FC start   first crack
//   8:00  - 9:30     development:   BT rises 195 -> 215°C
//   9:30  drop
//   9:30  - 10:00    cool
//
// Sample rate: 1 Hz.

import { EventEmitter } from 'node:events';
import type { LiveSample, LiveDeviceInfo, RoastEventType, TemperatureSource } from './types.js';

export type RoastProfile = 'light' | 'medium' | 'dark';

interface ProfileParams {
  chargeBT: number;
  chargeET: number;
  dropBT: number;
  dropT: number; // total seconds including charge + drop
  fcStartT: number;
  fcStartBT: number;
  dryEndT: number;
  dryEndBT: number;
}

const PROFILES: Record<RoastProfile, ProfileParams> = {
  light: { chargeBT: 195, chargeET: 215, dropBT: 205, dropT: 540, fcStartT: 430, fcStartBT: 192, dryEndT: 260, dryEndBT: 145 },
  medium: { chargeBT: 200, chargeET: 220, dropBT: 215, dropT: 570, fcStartT: 470, fcStartBT: 195, dryEndT: 290, dryEndBT: 150 },
  dark: { chargeBT: 205, chargeET: 225, dropBT: 225, dropT: 600, fcStartT: 500, fcStartBT: 198, dryEndT: 320, dryEndBT: 155 },
};

export class RoastSimulator extends EventEmitter implements TemperatureSource {
  readonly kind = 'simulator' as const;
  private timer: NodeJS.Timeout | null = null;
  private connected = false;
  private profile: RoastProfile = 'medium';
  private sampleCount = 0;
  private randSeed = 0;

  constructor() {
    super();
  }

  async listDevices(): Promise<LiveDeviceInfo[]> {
    return [
      {
        id: 'simulator',
        label: `Simulated VNT 2.5kg (${this.profile} profile)`,
        channels: 2,
        isConnected: this.connected,
      },
    ];
  }

  async connect(deviceId: string): Promise<void> {
    if (deviceId !== 'simulator') {
      throw new Error(`Simulator: unknown device "${deviceId}"`);
    }
    if (this.timer) {
      // already running; just re-emit a heartbeat
      return;
    }
    this.connected = true;
    this.sampleCount = 0;
    this.randSeed = Date.now() & 0xffff;
    this.emit('state', 'connected');
    this.timer = setInterval(() => this.tick(), 1000);
    // immediate first sample (charge) so the UI gets immediate feedback
    this.tick();
  }

  async disconnect(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.connected = false;
    this.emit('state', 'disconnected');
  }

  isConnected(): boolean {
    return this.connected;
  }

  setProfile(p: RoastProfile): void {
    this.profile = p;
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

  /** Generate the next sample (one tick of the simulator). */
  private tick(): void {
    const t = this.sampleCount;
    this.sampleCount += 1;
    if (t > PROFILES[this.profile].dropT + 30) {
      // stop on its own after cool
      void this.disconnect();
      return;
    }
    const sample = this.computeSample(t);
    this.emit('sample', sample);
  }

  private computeSample(t: number): LiveSample {
    const p = PROFILES[this.profile];

    // BT curve: piecewise linear interpolation between anchor points
    const anchors: Array<[number, number]> = [
      [0, p.chargeBT],
      [1, 100],        // TP drop
      [2, 95],         // TP bottom
      [p.dryEndT, p.dryEndBT],
      [p.fcStartT, p.fcStartBT],
      [p.dropT, p.dropBT],
      [p.dropT + 30, p.dropBT - 25], // cool
    ];

    let bt: number;
    if (t <= anchors[0][0]) bt = anchors[0][1];
    else if (t >= anchors[anchors.length - 1][0]) bt = anchors[anchors.length - 1][1];
    else {
      // find bracketing pair
      for (let i = 0; i < anchors.length - 1; i++) {
        if (t >= anchors[i][0] && t <= anchors[i + 1][0]) {
          const f = (t - anchors[i][0]) / (anchors[i + 1][0] - anchors[i][0]);
          bt = anchors[i][1] + f * (anchors[i + 1][1] - anchors[i][1]);
          break;
        }
      }
      bt = anchors[anchors.length - 1][1];
    }

    // ET curve: generally 10-15°C above BT, with a sharper initial drop
    const etAnchors: Array<[number, number]> = [
      [0, p.chargeET],
      [1, 170],        // sharp drop with BT
      [3, 160],
      [p.dryEndT, p.dryEndBT + 35],
      [p.fcStartT, p.fcStartBT + 20],
      [p.dropT, p.dropBT + 12],
      [p.dropT + 30, p.dropBT - 15],
    ];
    let et: number;
    if (t <= etAnchors[0][0]) et = etAnchors[0][1];
    else if (t >= etAnchors[etAnchors.length - 1][0]) et = etAnchors[etAnchors.length - 1][1];
    else {
      for (let i = 0; i < etAnchors.length - 1; i++) {
        if (t >= etAnchors[i][0] && t <= etAnchors[i + 1][0]) {
          const f = (t - etAnchors[i][0]) / (etAnchors[i + 1][0] - etAnchors[i][0]);
          et = etAnchors[i][1] + f * (etAnchors[i + 1][1] - etAnchors[i][1]);
          break;
        }
      }
      et = etAnchors[etAnchors.length - 1][1];
    }

    // Add small noise so the chart looks real
    const noise = (this.randSeed * (t + 1)) % 1000;
    const btJitter = ((noise / 1000) - 0.5) * 0.6;
    const etJitter = (((noise * 7) % 1000) / 1000 - 0.5) * 0.6;
    bt += btJitter;
    et += etJitter;

    return {
      t,
      bt: round1(bt),
      et: round1(et),
      etEstimated: false, // simulator always generates both channels
    };
  }
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ---- Reference event schedule, used by the route that seeds the UI ----

export const SIMULATOR_EVENTS: Array<{ t: number; type: RoastEventType }> = [
  { t: 0, type: 'charge' },
  { t: 1, type: 'tp' },
  { t: PROFILES.medium.dryEndT, type: 'dry_end' },
  { t: PROFILES.medium.fcStartT, type: 'fc_start' },
  { t: PROFILES.medium.dropT, type: 'drop' },
  { t: PROFILES.medium.dropT + 30, type: 'cool' },
];
