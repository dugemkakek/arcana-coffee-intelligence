# Roaster Data Format Research

Research target: **Arcana Coffee Intelligence** import layer for data from:
- VNT 2.5kg roaster + Phidget thermocouple controller (paired with Artisan roast software)
- Kaffelogic Nano 7e sample roaster (paired with Kaffelogic Studio)

Researched 2026-06-02 via GitHub source + Phidget docs + Kaffelogic/Artisan web properties.

---

## 1. Kaffelogic Studio (Nano 7e / 7 sample roaster)

**Source:** `flaper87/kaffelogic-studio-container` Dockerfile on GitHub. The Studio Linux version is `kaffelogic-studio_5.0.14_amd64.deb` (current at research time).

### File extensions
- `*.klog` — roast log files (one per finished roast). Generated on the roaster and synced to a "roaster sync folder" via the Wireless Connect Module or USB. **This is the only file type we need to import.**
- `*.klprog` — roast profile files (target curve definitions, set points, fan/drum steps). Not roast history — used to *run* roasts. Lower priority for import.

### Known facts (from Kaffelogic support portal)
- Klog files are **created on the roaster** and copied to a local "sync folder" configured in Kaffelogic Studio.
- The roaster has on-board flash memory; logs are written there first, then sync copies them to the host.
- Studio is the only supported way to view/export logs; format is **closed binary**, not documented publicly.

### What's likely inside a `.klog` (inferred)
- Header with roaster model + firmware version
- Roast metadata: timestamp, profile name, batch weight, bean type
- Time-series samples: BT (bean temp), ET (exhaust temp), RoR, fan/drum step, charge/drop event markers
- RoR is computed by Studio, not on the roaster.

### Implication for Arcana
- We have **three realistic import paths** for Kaffelogic:
  1. **Reverse-engineer the binary `.klog`** — risky; format is undocumented and could break with firmware updates.
  2. **Ask the user to export from Studio** — Studio does not expose a public export. Users must screenshot/CSV via Studio's UI → still image/CSV.
  3. **Live capture from the roaster USB** — Studio's Linux deb talks to the roaster over USB. We can replicate that protocol. Kaffelogic publishes a Wireless Connect Module API; the same over-USB protocol may be usable.
- **Recommendation:** add Kaffelogic import to v1.5+. For v1, treat Kaffelogic as "manual CSV upload" — roaster exports the visible Studio graph data via copy-paste / screenshot OCR is impractical.
- For now, **defer** native Kaffelogic import. Track the closed-format issue; revisit if Kaffelogic publishes a spec or Studio adds export.

### Source URLs
- https://kaffelogic.com/pages/downloads (Studio download)
- https://kaffelogic.com/pages/profiles (profile guide, no format docs)
- https://kaffelogic.com/wiki (Jira Service Desk portal — no public wiki docs)
- https://github.com/flaper87/kaffelogic-studio-container (Dockerfile, version reference)

---

## 2. Artisan Roast Software (`.alog`, `.json`, `.csv`)

**Source:** `artisan-roaster-scope/artisan` v4.0.2 / v4.0.3 on GitHub (`src/artisan.py` 1.7MB monolith + `src/artisanlib/atypes.py` for the schema). This is **the most important import path for Arcana** because Artisan is what runs on the VNT 2.5kg + Phidget.

### File formats
| Format | What it is | Editable? | Use case |
|---|---|---|---|
| `.alog` | Python `pickle` dump of a Python `dict` | No (binary) | Native Artisan format |
| `.json` | Pretty-printed `ProfileData` TypedDict | Yes | **Best for import** |
| `.csv` | Custom Artisan CSV (temp + time columns) | Yes | Spreadsheet-friendly |
| `.xml` | Probat Pilot XML, Cropster XML, Aillio R1, RoastLogger (all legacy/exporter) | – | Optional exports |

### `.alog` (binary pickle)
- Root: a Python `dict` of `ProfileData` keys (see below).
- Loads via `pickle.load()` — but pickle is **not** a portable format and changes between Python versions.
- **Don't use `.alog` directly in Arcana.** Use `.json` instead — same data, safer, no pickle security risk.

### `.json` (recommended for Arcana import)
- Serialized via `getProfile()` → `json_dump(..., indent=None, separators=(',',':'))` (compact, no whitespace).
- Schema is a `ProfileData` TypedDict. Key fields for Arcana:
  - **Metadata**: `mode`, `roastdate`, `roastisodate`, `roastepoch`, `roasttzoffset`, `roastUUID`, `operator`, `organization`, `roastertype`, `roastersize`, `machinesetup`, `drumspeed`
  - **Beans**: `beans`, `weight` (tuple: in, out, unit), `volume`, `density`, `density_roasted`, `beansize_min`, `beansize_max`, `color_system`, `whole_color`, `ground_color`
  - **Timeseries arrays** (all `list[float]`, index-aligned):
    - `timex` — elapsed seconds (relative to t=0 of the roast)
    - `temp1` — BT (bean temp) in °C
    - `temp2` — ET (exhaust temp) in °C
    - `delta1`, `delta2` — RoR per channel
    - `extradevices: list[int]` — extra device IDs (e.g., ambient, inlet)
    - `extratimex`, `extratemp1`, `extratemp2` — `list[list[float]]` parallel to extradevices
  - **Events** (index-aligned):
    - `specialevents: list[int]` — sample indices
    - `specialeventstype: list[int]` — enum: 0=charge, 1=dry end, 2=FC start, 3=FC end, 4=SC start, 5=SC end, 6=drop, 7=cool, 8=custom
    - `specialeventsvalue: list[float]` — gas/heat value at event
  - **Computed** (in `ComputedProfileInformation` TypedDict, nested): `CHARGE_BT`, `CHARGE_ET`, `TP_time`, `DRY_time`, `FCs_time`, `FCs_BT`, `DROP_time`, `DROP_BT`, `totaltime`, `dryphasetime`, `finishphasetime`, `total_ror`, `fcs_ror`, `weight_loss`, `total_yield`, `AUC`, etc.
  - **Ambient** (single float): `ambientTemp`, `ambient_humidity`, `ambient_pressure`
- Artisan v4+ also stores an **EdDSA signature** (`signature` field, signed with `artisan_public_key.pem` in `includes/`) to detect tampered profiles. We should **not** validate the signature on import — just import the data.

### `.csv` (alternative import)
- Header: `Date,Time,Temp1 (BT),Temp2 (ET),Delta1 (RoR),Delta2,Extra1,Extra2,...`
- Read by `importCSV()` → parsed row-by-row into the same internal model.
- Easier to parse than JSON for non-Python consumers, but loses events and metadata.

### Implication for Arcana
- **v1 import path: Artisan `.json`** — full fidelity, no binary parsing. We get BT, ET, RoR (computed by Artisan), events, weights, profile metadata, computed AUC/ROR, ambient readings.
- Optional: `.csv` import for users with simpler needs.
- **Defer: `.alog`** — pickle is fragile; the JSON export exists for a reason.
- **Sample rate:** default 2s/sample for Artisan (3s in some modes). We just resample to a fixed 1s grid on import.

### Source URLs
- https://artisan-scope.org/ (project home)
- https://github.com/artisan-roaster-scope/artisan (source, master branch)
- `src/artisan.py` lines 14675–15050 for `exportJSON` / `exportCSV` / `importJSON` / `importCSV`
- `src/artisanlib/atypes.py` for the full `ProfileData` + `ComputedProfileInformation` schema

---

## 3. VNT 2.5kg roaster + Phidget thermocouple

**Source:** Phidget product docs (TMP1101, HUB0001) on phidgets.com; Artisan's documented Phidget device support.

### How it works
- VNT 2.5kg is a **production drum roaster with no native software** — the operator brings their own data logger.
- The standard pairing is **Phidget thermocouple module (TMP1101 K/J/T-type)** connected via a **VINT Hub (HUB0000/HUB0001)** to a PC.
- **Artisan** reads from the Phidget via the `phidget22` Python library (Artisan's `phidget.py` driver in older versions, now part of `async_comm.py`).
- So the data path is: **VNT thermocouples → Phidget TMP1101 → VINT Hub → USB → Phidget22 driver → Artisan → Artisan .json/.alog** (or .csv export).

### Phidget data model
- **Data Interval**: time between data events (ms). Default 1000ms, configurable down to 20ms.
- **Data Rate**: reciprocal (Hz). Default 1 Hz, can go up to 50 Hz.
- **Channels**: K-type thermocouple reads −200°C to +1250°C. J-type: −40°C to +750°C. T-type: −200°C to +350°C.
- **Resolution**: 15-bit oversampled from 12-bit.
- **Output unit**: °C by default (F optional).
- **Events**: phidget22 emits `attach`, `detach`, `temperatureChange`, `error` events.
- Two read modes: **event-driven** (default; fires on change) and **polling** (app requests at a fixed interval).

### What ends up in Artisan
- `temp1` = BT (channel 0 of TMP1101, typically K-type, inserted in bean mass)
- `temp2` = ET (channel 1 of TMP1101, K-type, in exhaust path)
- `delta1`/`delta2` = RoR (computed by Artisan via Savitzky-Golay smoothing)
- `timex` = seconds since `t=0` (typically t=0 = charge, but depends on Artisan setup)
- Events fired from the keyboard or by clicking on the Artisan curve

### Implication for Arcana
- **We don't talk to the Phidget directly in v1.** The user runs Artisan on the same machine and exports to JSON at end of roast. Arcana's import layer just reads the Artisan JSON.
- **Optional v2:** add a Node-side Phidget22 wrapper (`phidget22` npm package) for direct live capture. Same shape as Artisan's arrays.
- The Phidget data shape is **simpler** than Artisan's — we can write a generic Phidget importer that produces a normalized Arcana roast session without going through Artisan at all.

### Source URLs
- https://www.phidgets.com/?prodid=1202 (TMP1101 specs)
- https://www.phidgets.com/docs/Polling_vs_Events (data model)
- https://www.phidgets.com/docs/Operating_System_Support (Windows 7+ supported)

---

## 4. Implications for the Arcana import layer

### Common normalized shape
Every importer must produce this canonical roast record:

```ts
type RoastSessionImport = {
  source: 'artisan-json' | 'artisan-csv' | 'phidget-live' | 'kaffelogic-klog' | 'manual';
  sourceFile?: string;
  capturedAt: string;          // ISO 8601
  durationSec: number;
  machine?: { model: string; manufacturer: string };
  operator?: string;
  greenWeightKg?: number;
  roastedWeightKg?: number;
  samples: Array<{
    t: number;                 // seconds from t=0
    bt: number;                // °C
    et: number;                // °C
    ror?: number;              // °C/min, computed
    ambient?: number;          // °C
  }>;
  events: Array<{
    type: 'charge' | 'tp' | 'dry_end' | 'fc_start' | 'fc_end' | 'sc_start' | 'sc_end' | 'drop' | 'cool' | 'note';
    t: number;                 // seconds from t=0
    value?: string;
  }>;
  notes?: string;
};
```

### v1 import paths (priority order)
1. **Artisan JSON** (`.json` export from Artisan). Full fidelity, easy to parse, covers VNT/Phidget use case completely. **This is the v1 path.**
2. **Artisan CSV** (`.csv` export). Fallback when JSON is unavailable.
3. **Manual entry** — operator types events + a few BT/ET samples, system interpolates.

### v2+ import paths (deferred)
4. **Live Phidget capture** — Node `phidget22` package, write samples straight into the DB.
5. **Live Kaffelogic capture** — reverse-engineer the Studio-roaster USB protocol (risky).
6. **Native `.klog` parser** — when/if the format is documented or reverse-engineered.

### Sample rate normalization
- Artisan default = 2s/sample. Some users run 1s or 3s.
- Phidget default = 1s/sample.
- Arcana stores samples at 1s grid: resample on import using **linear interpolation** between the two surrounding source samples.

### What we DO NOT need to worry about (v1)
- `.alog` pickle parsing (use `.json` instead).
- Kaffelogic `.klog` (closed binary, no public spec).
- Cropster API (different project, different data model).
- RoastLogger / Pilot XML (legacy, not used by our target user).

---

## Decision summary

| Source | v1 import? | Format used | Effort |
|---|---|---|---|
| VNT + Phidget via Artisan | ✅ Yes | `.json` export | Low — one parser, one mapping |
| VNT + Phidget via Artisan (fallback) | ✅ Yes | `.csv` export | Low |
| Kaffelogic Studio | ❌ v1.5+ | `.klog` (TBD) | High — closed binary, no spec |
| Direct Phidget live | ❌ v2 | `phidget22` events | Medium |
| Direct Kaffelogic live | ❌ v2+ | USB protocol TBD | Very high |

**Bottom line:** v1 needs only **Artisan JSON** and **Artisan CSV** importers. The Kaffelogic story is "encourage the user to keep using Kaffelogic Studio" until a real import path opens up.
