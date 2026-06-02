# Artisan JSON format — quick reference

This is a distilled cheat-sheet of the Artisan `.json` profile format for
quick reference when working on the importer. The full research is in
[`RESEARCH-roaster-data-formats.md`](../../RESEARCH-roaster-data-formats.md).

## What is it?

Artisan (https://artisan-scope.org) is the world's most-used free roast
logging software. Its `.json` export is the **safe, portable** serialization
of its in-memory `ProfileData` TypedDict.

- **Do NOT use `.alog` files.** They are Python `pickle` dumps — fragile,
  unsafe to load cross-version, and offer no advantage over `.json`.
- **Do use `.json` files.** They are the canonical "export for sharing"
  format and what the importer consumes.

## Required fields (must have for a valid roast)

| Field            | Type              | Notes |
|------------------|-------------------|-------|
| `timex`          | `list[float]`     | Seconds from t=0, monotonically increasing |
| `temp1`          | `list[float]`     | BT (bean temp) in °C, same length as `timex` |
| `temp2`          | `list[float]`     | ET (exhaust temp) in °C, same length as `timex` |
| `specialevents`  | `list[int]`       | Sample indices of roast events |
| `specialeventstype` | `list[int]`    | Event type per index (see enum below) |

## Event type enum (`specialeventstype`)

| Code | Canonical name | Description |
|------|----------------|-------------|
| 0    | `charge`       | CHARGE — beans loaded, t=0 of the roast |
| 1    | `dry_end`      | DRY END — yellowing complete |
| 2    | `fc_start`     | FC START — first crack begins |
| 3    | `fc_end`       | FC END — first crack finishes |
| 4    | `sc_start`     | SC START — second crack begins |
| 5    | `sc_end`       | SC END — second crack finishes |
| 6    | `drop`         | DROP — beans ejected |
| 7    | `cool`         | COOL END — cooling complete |
| 8+   | `note`         | Custom / power / airflow / etc. |

## Optional but useful fields

| Field              | Type                       | Notes |
|--------------------|----------------------------|-------|
| `delta1`, `delta2` | `list[float]`              | RoR per channel, computed by Artisan (savitzky-golay smoothed) |
| `roastdate`        | `str`                      | Human-readable date (locale-dependent) |
| `roastisodate`     | `str`                      | ISO 8601 timestamp — use this for `capturedAt` |
| `roastepoch`       | `int`                      | Unix epoch seconds — fallback timestamp |
| `roastertype`      | `str`                      | Free text (e.g. "VNT 2.5kg") |
| `operator`         | `str`                      | Free text (operator name) |
| `organization`     | `str`                      | Free text (roastery name) |
| `weight`           | `[in, out, unit]`          | Tuple — unit is `g`, `kg`, `lb`, or `oz` |
| `beans`            | `str`                      | Free text bean description |
| `roastUUID`        | `str`                      | Optional — Artisan generates when uploading to artisan.plus |
| `CHARGE_BT/ET`     | `float`                    | Temps at charge |
| `FCs_time`         | `float`                    | Seconds at FC start |
| `DROP_time`        | `float`                    | Seconds at drop |
| `AUC`              | `int`                      | Area-under-curve (Artisan's "roast progress" metric) |
| `weight_loss`      | `float` (percent)          | Green → roasted weight loss |
| `total_yield`      | `float` (percent)          | 100 − weight_loss |

## How Arcana processes it

1. **Parse** with `parseArtisanJson(buffer)` from `@arcana/importers`.
2. **Resample** `timex/temp1/temp2` to a **1-second grid** via linear interpolation
   (so we can store uniformly). This is the canonical internal sample rate.
3. **Compute RoR** if `delta1` is missing — backward 30s difference × 60 (°C/min).
4. **Normalize events** to canonical names (see enum above).
5. **Normalize weights** to kg regardless of source unit.
6. **Persist** to SQLite via Prisma (`RoastSession`, `RoastSamplePoint`, `RoastEvent`).

## Resources

- **Full research:** [`RESEARCH-roaster-data-formats.md`](../../RESEARCH-roaster-data-formats.md)
- **Source of truth:** Artisan's `src/artisanlib/atypes.py` — the `ProfileData` TypedDict
- **Importer code:** `packages/importers/src/artisan-json.ts`
- **Sample file:** `apps/local-node/public/samples/sample-roast.json`
