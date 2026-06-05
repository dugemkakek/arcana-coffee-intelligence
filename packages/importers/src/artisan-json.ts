// @arcana/importers — Artisan JSON parser.
//
// Parses an Artisan `.json` export (the `getProfile()` shape) into the
// canonical `RoastSessionImport` shape.
//
// Reference: see `docs/importers/artisan-format.md` and
// `RESEARCH-roaster-data-formats.md` §2 for the source schema.
//
// Key transformations:
//   - Map Artisan's `specialeventstype` integer enum to canonical event types
//   - Resample `timex/temp1/temp2` to a 1s grid via linear interpolation
//   - Compute `ror` from `delta1`/`delta2` (Artisan's smoothed RoR) or
//     fall back to a finite-difference calculation
//   - Normalize weights from Artisan's `[in, out, unit]` tuple

import type {
  RoastEvent,
  RoastEventType,
  RoastSample,
  RoastSessionImport,
} from './types.js';

// =====================================================================
// Artisan schema (subset we care about — see research doc for full list)
// =====================================================================

interface ArtisanProfile {
  mode?: 'C' | 'F';
  timeindex?: number[];
  timex?: number[];
  temp1?: number[];
  temp2?: number[];
  delta1?: number[];
  delta2?: number[];
  ambientTemp?: number;
  extradevices?: number[];
  extratimex?: number[][];
  extratemp1?: number[][];
  extratemp2?: number[][];
  specialevents?: number[];
  specialeventstype?: number[];
  specialeventsvalue?: number[];
  specialeventsStrings?: string[];
  title?: string;
  beans?: string;
  weight?: [number | string, number | string, string];
  volume?: [number | string, number | string, string];
  density?: [number | string, number | string, string];
  density_roasted?: [number | string, number | string, string];
  defects_weight?: number;
  roastertype?: string;
  roastersize?: number;
  operator?: string;
  organization?: string;
  machinesetup?: string;
  drumspeed?: string;
  roastdate?: string;
  roastisodate?: string;
  roastepoch?: number;
  roasttzoffset?: number;
  whole_color?: number;
  ground_color?: number;
  color_system?: string;
  beansize_min?: string;
  beansize_max?: string;
  moisture_greens?: number;
  moisture_roasted?: number;
  ambient_humidity?: number;
  ambient_pressure?: number;
  AUC?: number;
  AUCbegin?: string;
  weight_loss?: number;
  total_yield?: number;
  totaltime?: number;
  dryphasetime?: number;
  finishphasetime?: number;
  fcs_ror?: number;
  total_ror?: number;
  CHARGE_BT?: number;
  CHARGE_ET?: number;
  TP_time?: number;
  DRY_time?: number;
  FCs_time?: number;
  FCe_time?: number;
  SCs_time?: number;
  SCe_time?: number;
  DROP_time?: number;
  COOL_time?: number;
  roastUUID?: string;
  [key: string]: unknown;
}

// Artisan's `specialeventstype` enum. See `RESEARCH-roaster-data-formats.md` §2.
// https://github.com/artisan-roaster-scope/artisan/blob/master/src/artisanlib/events.py
const ARTISAN_EVENT_TYPE: Record<number, RoastEventType> = {
  0: 'charge',       // CHARGE / beans loaded
  1: 'dry_end',      // DRY END (yellowing)
  2: 'fc_start',     // FC START (first crack start)
  3: 'fc_end',       // FC END
  4: 'sc_start',     // SC START
  5: 'sc_end',       // SC END
  6: 'drop',         // DROP (beans ejected)
  7: 'cool',         // COOL end
  8: 'note',         // custom / power / airflow event
  9: 'note',
  10: 'note',
  11: 'note',
};

// =====================================================================
// Public API
// =====================================================================

export interface ParseArtisanJsonOptions {
  /** Resample target interval in seconds. Default 1. Set to 0 to skip. */
  resampleSec?: number;
  /** Source filename for traceability. */
  sourceFile?: string;
  /** If true, keep raw `meta` payload. Default true. */
  keepMeta?: boolean;
}

/**
 * Parse an Artisan `.json` export buffer into a canonical roast record.
 *
 * @throws if the input is not valid JSON or doesn't have a `timex` array.
 */
export function parseArtisanJson(
  input: string | Buffer,
  options: ParseArtisanJsonOptions = {},
): RoastSessionImport {
  const text = typeof input === 'string' ? input : input.toString('utf-8');
  let profile: ArtisanProfile;
  try {
    profile = JSON.parse(text);
  } catch (err) {
    throw new Error(
      `Artisan JSON parse failed: ${(err as Error).message}. Is this a valid Artisan .json export?`,
    );
  }

  return profileToImport(profile, options);
}

/** Lower-level: take an already-parsed Artisan profile object. */
export function profileToImport(
  profile: ArtisanProfile,
  options: ParseArtisanJsonOptions = {},
): RoastSessionImport {
  const resampleSec = options.resampleSec ?? 1;
  const timex = profile.timex ?? [];
  const temp1 = profile.temp1 ?? [];
  const temp2 = profile.temp2 ?? [];
  const delta1 = profile.delta1 ?? [];
  const delta2 = profile.delta2 ?? [];

  if (timex.length === 0) {
    throw new Error(
      'Artisan profile has no timex[] array — this is not a roast record. ' +
        'Make sure you exported the full session, not a settings file.',
    );
  }

  // ----------------------------------------------------------
  // 1) Build samples
  // ----------------------------------------------------------
  const rawSamples: RoastSample[] = [];
  for (let i = 0; i < timex.length; i++) {
    const t = timex[i];
    const bt = temp1[i];
    const et = temp2[i];
    if (typeof t !== 'number' || !Number.isFinite(t)) continue;
    // skip points where both temps are null (Artisan pads arrays with None)
    if (bt == null && et == null) continue;

    const ror = pickFinite(delta1[i], delta2[i]) ?? computeRor(temp1, i) ?? undefined;

    rawSamples.push({
      t,
      bt: typeof bt === 'number' && Number.isFinite(bt) ? bt : 0,
      et: typeof et === 'number' && Number.isFinite(et) ? et : 0,
      ror,
    });
  }

  // Resample to 1s grid (or whatever target).
  const samples =
    resampleSec > 0 ? resampleLinear(rawSamples, resampleSec) : rawSamples;

  // ----------------------------------------------------------
  // 2) Build events
  // ----------------------------------------------------------
  const events: RoastEvent[] = [];
  const special = profile.specialevents ?? [];
  const specialType = profile.specialeventstype ?? [];
  const specialVal = profile.specialeventsvalue ?? [];
  for (let i = 0; i < special.length; i++) {
    const idx = special[i];
    const typeNum = specialType[i];
    if (typeof idx !== 'number' || idx < 0 || idx >= timex.length) continue;
    const type = ARTISAN_EVENT_TYPE[typeNum!] ?? 'note';
    const value = specialVal[i] != null ? String(specialVal[i]!) : undefined;
    events.push({ type, t: timex[idx]!, value });
  }
  events.sort((a, b) => a.t - b.t);

  // ----------------------------------------------------------
  // 3) Metadata
  // ----------------------------------------------------------
  const greenWeightKg = pickWeightKg(profile.weight, 0);
  const roastedWeightKg = pickWeightKg(profile.weight, 1);

  const machine = profile.roastertype
    ? { manufacturer: guessManufacturer(profile.roastertype), model: profile.roastertype }
    : undefined;

  const capturedAt =
    profile.roastisodate ??
    (profile.roastepoch
      ? new Date(profile.roastepoch * 1000).toISOString()
      : new Date().toISOString());

  const durationSec =
    typeof profile.totaltime === 'number'
      ? profile.totaltime
      : samples.length > 0
        ? samples[samples.length - 1]!.t - samples[0]!.t
        : 0;

  // ----------------------------------------------------------
  // 4) Compose
  // ----------------------------------------------------------
  const result: RoastSessionImport = {
    source: 'artisan-json',
    sourceFile: options.sourceFile,
    capturedAt,
    durationSec,
    machine,
    operator: profile.operator,
    greenWeightKg,
    roastedWeightKg,
    samples,
    events,
    notes: profile.beans,
  };

  if (options.keepMeta !== false) {
    result.meta = {
      roastUUID: profile.roastUUID,
      roastertype: profile.roastertype,
      roastersize: profile.roastersize,
      machinesetup: profile.machinesetup,
      drumspeed: profile.drumspeed,
      whole_color: profile.whole_color,
      ground_color: profile.ground_color,
      color_system: profile.color_system,
      beansize_min: profile.beansize_min,
      beansize_max: profile.beansize_max,
      moisture_greens: profile.moisture_greens,
      moisture_roasted: profile.moisture_roasted,
      ambient_humidity: profile.ambient_humidity,
      ambient_pressure: profile.ambient_pressure,
      // Computed (Artisan side)
      AUC: profile.AUC,
      weight_loss: profile.weight_loss,
      total_yield: profile.total_yield,
      fcs_ror: profile.fcs_ror,
      total_ror: profile.total_ror,
      CHARGE_BT: profile.CHARGE_BT,
      CHARGE_ET: profile.CHARGE_ET,
      TP_time: profile.TP_time,
      DRY_time: profile.DRY_time,
      FCs_time: profile.FCs_time,
      FCe_time: profile.FCe_time,
      SCs_time: profile.SCs_time,
      SCe_time: profile.SCe_time,
      DROP_time: profile.DROP_time,
      COOL_time: profile.COOL_time,
    };
  }

  return result;
}

// =====================================================================
// Helpers
// =====================================================================

function pickFinite(...vals: (number | undefined | null)[]): number | undefined {
  for (const v of vals) {
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return undefined;
}

/** Compute RoR via 30s window backward difference. °C/min. */
function computeRor(tempArr: number[], i: number): number | null {
  if (i < 1) return null;
  const dt = 30;
  const j = Math.max(0, i - dt);
  const dtSec = i - j;
  if (dtSec <= 0) return null;
  const t1 = tempArr[i];
  const t2 = tempArr[j];
  if (typeof t1 !== 'number' || typeof t2 !== 'number') return null;
  if (!Number.isFinite(t1) || !Number.isFinite(t2)) return null;
  return ((t1 - t2) / dtSec) * 60;
}

/** Resample a sorted list of (t, bt, et, ror) to a uniform `stepSec` grid. */
function resampleLinear(samples: RoastSample[], stepSec: number): RoastSample[] {
  if (samples.length < 2) return samples;
  const out: RoastSample[] = [];
  const tStart = samples[0]!.t;
  const tEnd = samples[samples.length - 1]!.t;
  let j = 0;
  for (let t = tStart; t <= tEnd + 0.0001; t = +(t + stepSec).toFixed(3)) {
    // advance j until samples[j+1].t >= t
    while (j + 1 < samples.length && samples[j + 1]!.t < t) j++;
    const a = samples[j]!;
    const b = samples[j + 1] ?? a;
    if (a.t === b.t || j + 1 >= samples.length) {
      out.push({ ...a, t: +t.toFixed(3) });
      continue;
    }
    const f = (t - a.t) / (b.t - a.t);
    out.push({
      t: +t.toFixed(3),
      bt: +lerp(a.bt, b.bt, f).toFixed(2),
      et: +lerp(a.et, b.et, f).toFixed(2),
      ror: a.ror != null && b.ror != null ? +lerp(a.ror!, b.ror!, f).toFixed(2) : a.ror ?? b.ror,
    });
  }
  return out;
}

function lerp(a: number, b: number, f: number): number {
  return a + (b - a) * f;
}

/**
 * Artisan stores weights as a tuple `[in, out, unit]` (or `[in, '', unit]`).
 * Unit can be 'g', 'kg', 'lb', 'oz'. Normalize to kg.
 */
function pickWeightKg(weight: ArtisanProfile['weight'], idx: 0 | 1): number | undefined {
  if (!weight) return undefined;
  const raw = weight[idx];
  if (raw == null || raw === '') return undefined;
  const num = typeof raw === 'number' ? raw : parseFloat(String(raw));
  if (!Number.isFinite(num)) return undefined;
  const unit = (weight[2] || 'g').toLowerCase();
  switch (unit) {
    case 'kg':
      return num;
    case 'g':
      return num / 1000;
    case 'lb':
      return num * 0.4535924;
    case 'oz':
      return num * 0.0283495;
    default:
      return undefined;
  }
}

/** Best-effort guess at manufacturer from the roastertype string. */
function guessManufacturer(roastertype: string): string {
  const s = roastertype.toLowerCase();
  if (s.includes('vnt')) return 'VNT';
  if (s.includes('probat')) return 'Probat';
  if (s.includes('loring')) return 'Loring';
  if (s.includes('diedrich')) return 'Diedrich';
  if (s.includes('kaffelogic') || s.includes('nano')) return 'Kaffelogic';
  if (s.includes('aillio') || s.includes('bullet')) return 'Aillio';
  if (s.includes('sandbox')) return 'Sandbox';
  if (s.includes('ikawa')) return 'Ikawa';
  return roastertype;
}
