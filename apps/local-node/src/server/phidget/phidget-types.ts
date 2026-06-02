// @arcana/local-node — phidget22 type alias.
//
// We import the native module lazily (only when LIVE_SOURCE=phidget) so
// the simulator-only path doesn't need the native binary on disk.
// This file just re-exports the type for use in other modules.

export type PhidgetNS = typeof import('phidget22');
