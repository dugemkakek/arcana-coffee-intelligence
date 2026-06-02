# Sample roasts

This directory contains a small, anonymized sample Artisan `.json` export
so users can try the Arcana import flow without first needing their own
roast data.

## Files

- **`sample-roast.json`** — a 12-minute VNT 2.5kg roast, anonymized (operator
  name, lot code, and date are fake). Ethiopia Guji Natural, medium-light
  development target. The file is hand-crafted to demonstrate:

  - a typical 3-phase curve (drying, Maillard, development)
  - a clean first crack
  - normal RoR decline with a mild flick in the Maillard phase
  - the four main events (charge, dry end, FC start, drop)
  - 1-second sample spacing (resampled to 1s by the importer)

## How to use

1. Run `pnpm dev` at the monorepo root
2. Open `http://localhost:3000`
3. Click **Import Roast**
4. Drop this `sample-roast.json` into the upload zone
5. Click **🤖 Analyze with AI** on the resulting roast detail page
6. You should see a structured AI summary with development %, RoR stability,
   issues, and recommendations

## How to add your own sample

Export a roast from Artisan:

1. In Artisan, open a completed roast
2. **File → Export → Artisan JSON (.json)**
3. Anonymize operator name, lot name, and date if you want to share publicly
4. Save into this directory

That's it — it'll show up in the import flow automatically.
