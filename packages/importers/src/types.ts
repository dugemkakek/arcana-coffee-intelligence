// @arcana/importers — canonical roast session import shape.
//
// Every importer (Artisan JSON, Artisan CSV, Phidget live, Kaffelogic klog)
// must produce a `RoastSessionImport` that conforms to this shape.
// The local-node server then maps this to Prisma models for persistence.

export type RoastEventType =
  | 'charge'
  | 'tp'              // turning point
  | 'dry_end'         // yellowing / first yellow
  | 'fc_start'        // first crack start
  | 'fc_end'          // first crack end
  | 'sc_start'        // second crack start
  | 'sc_end'          // second crack end
  | 'drop'            // beans ejected
  | 'cool'            // cooling end
  | 'note';

export type RoastSampleSource = 'artisan-json' | 'artisan-csv' | 'phidget-live' | 'kaffelogic-klog' | 'manual';

export interface RoastSample {
  /** Seconds from t=0 (t=0 = charge by default). Always non-negative. */
  t: number;
  /** Bean temperature, °C. */
  bt: number;
  /** Exhaust temperature, °C. */
  et: number;
  /** Rate of rise, °C / minute. Computed if source doesn't provide it. */
  ror?: number;
  /** Ambient temperature, °C. Optional. */
  ambient?: number;
  /** Gas / heat setting (0–100 or device-specific). */
  gas?: number;
  /** Airflow / fan setting (0–100 or device-specific). */
  airflow?: number;
}

export interface RoastEvent {
  type: RoastEventType;
  /** Seconds from t=0. */
  t: number;
  /** Optional human-readable value (e.g. custom event name or numeric setting). */
  value?: string;
}

export interface RoastSessionImport {
  source: RoastSampleSource;
  /** Original filename, if imported from a file. */
  sourceFile?: string;
  /** When the roast happened (ISO 8601). */
  capturedAt: string;
  /** Total roast duration in seconds (charge → drop). */
  durationSec: number;
  /** Machine metadata, if known. */
  machine?: { model: string; manufacturer: string; serialNumber?: string };
  /** Operator (free text, matches the local `User.name` if linked). */
  operator?: string;
  /** Green / roasted weight in kg. */
  greenWeightKg?: number;
  roastedWeightKg?: number;
  /** Time-indexed samples, sorted by `t`. */
  samples: RoastSample[];
  /** Roast events, sorted by `t`. */
  events: RoastEvent[];
  /** Free-form notes. */
  notes?: string;
  /** Optional metadata preserved for round-tripping. */
  meta?: Record<string, unknown>;
}
