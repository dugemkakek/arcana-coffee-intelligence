// @arcana/local-node — phidget module entry point.
//
// Exports the singleton TemperatureSource chosen by the LIVE_SOURCE env
// var (default: 'simulator'). Set LIVE_SOURCE=phidget to use a real
// TMP1101 module.

import { RoastSimulator } from './simulator.js';
import { PhidgetManager } from './manager.js';
import type { TemperatureSource } from './types.js';

const source: TemperatureSource =
  process.env.LIVE_SOURCE === 'phidget' ? new PhidgetManager() : new RoastSimulator();

if (process.env.LIVE_SOURCE === 'phidget' && process.env.NODE_ENV !== 'production') {
  console.log('[phidget] LIVE_SOURCE=phidget — will attempt to use a real TMP1101 device.');
  console.log('[phidget] Set LIVE_SOURCE=simulator (or unset it) to fall back to synthetic data.');
} else if (process.env.LIVE_SOURCE !== 'phidget') {
  console.log('[phidget] LIVE_SOURCE=simulator — using synthetic roast data.');
}

export { RoastSimulator, PhidgetManager };
export type { LiveDeviceInfo, LiveSample, LiveSource, RoastEventType, TemperatureSource } from './types.js';
export default source;
