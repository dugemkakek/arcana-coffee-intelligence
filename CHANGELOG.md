# Changelog

All notable changes to **Arcana Coffee Intelligence** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Live Phidget capture (v0.2 — complete)**
  - Server-side Phidget module with two interchangeable `TemperatureSource` implementations:
    - `RoastSimulator` — realistic synthetic roast curve (light/medium/dark profiles). Default in dev. Set `LIVE_SOURCE=phidget` to opt out.
    - `PhidgetManager` — wraps the `phidget22` npm package, discovers attached TMP1101 thermocouple modules, opens them on demand, emits `LiveSample` events at the configured data interval (default 1Hz).
  - `LiveSessionStore` (singleton) — holds the active live roast in memory, buffers samples + events, persists to Prisma with `source='live'` on stop
  - REST endpoints:
    - `GET /api/live/source` — info about the active temperature source
    - `GET /api/live/devices` — list available devices
    - `POST /api/live/connect` `{deviceId}` — connect to a device (e.g. `simulator`)
    - `POST /api/live/disconnect`
    - `POST /api/live/sessions/start` `{greenLotId?, greenLotName?, operatorUserId?}` → `{sessionId, startedAt, greenLot}`
    - `POST /api/live/sessions/event` `{type, value?}` → `{t}` (charge, tp, dry_end, fc_start, fc_end, sc_start, sc_end, drop, cool, note)
    - `POST /api/live/sessions/stop` → `{roastId}` (persists to Prisma, can be analyzed like imported roasts)
  - WebSocket `/ws/live` — bidirectional: server pushes `sample` / `event` / `state` messages, client can send `event` or `ping` messages
  - Server-side broadcast throttle: max 10 Hz so the UI doesn't drown in samples
- **Live UI page** `apps/local-node/app/roasts/live/page.tsx`:
  - 3-step workflow: device → session → events
  - Real-time SVG chart (lightweight inline SVG instead of Recharts so it renders instantly without a layout dance) with event markers
  - Live KPI readout: elapsed, BT, ET, RoR (5s window), sample count
  - Event button row (10 buttons: charge, tp, dry_end, fc_start, fc_end, sc_start, sc_end, drop, cool, note)
  - "🔴 Live" button in the home page header
  - On stop, navigates to the persisted roast's detail page (where AI analysis is also available)
- `RoastSummary.machine` field added so the home + detail pages can show the roaster model
- `phidget22@^3.25.1` and `@fastify/websocket@^11.2.0` dependencies added to `@arcana/local-node`

### Fixed
- Removed unused private fields in `PhidgetManager` (strict TS caught them)
- Used the correct `@fastify/websocket` v11 type import (`WebSocket` from the package's namespace export)
- Added `machine` to the `/api/roasts` list and `/api/roasts/:id` responses (was missing, detail page was reading undefined)

## [0.1.0] - 2026-06-02

### Added
- **Monorepo scaffold** — pnpm workspace with `apps/` and `packages/` directories
- **local-node app** — Fastify backend + Next.js 15 + Electron + electron-builder
  - Upload Artisan `.json` export via the web UI
  - Stores roasts in a local SQLite database via Prisma
  - List page (`/`) shows all imported roasts
  - Import page (`/import`) with drag-and-drop file upload
  - Detail page (`/roasts/[id]`) with KPI tiles, phase breakdown bar, BT/ET/RoR time-series chart, events list, and AI analysis card
- **ai-service app** — standalone Fastify service on port 4001
  - `POST /analyze/roast` endpoint returning structured AI feedback
  - `GET /health` endpoint for smoke tests
  - Pluggable adapter system: **MiniMax (default)**, Anthropic + OpenRouter stubs, plus a `mock` provider for offline testing
  - System prompt embeds Indonesian-origin roasting rules (Giling Basah, per-origin DTR, drop-temp adjustments)
- **packages/db-local** — Prisma schema migrated from root `local.prisma`, switched to SQLite
- **packages/importers** — Artisan JSON parser producing canonical `RoastSessionImport` shape, with linear-interpolation resampling to 1s grid
- **packages/ai-adapters** — `AIProvider` interface + MiniMax implementation + Anthropic + OpenRouter + mock adapters
- **packages/shared-types** — shared TypeScript types
- **Sample Artisan JSON** in `apps/local-node/public/samples/sample-roast.json` for testing
- **C4 architecture diagrams** in `docs/architecture/`
- **GitHub community files** — issue templates, PR template, CI workflow, SECURITY.md, CODEOWNERS
- **Windows 7+ installer** via electron-builder + NSIS
- **Research doc** `RESEARCH-roaster-data-formats.md` covering Artisan, Kaffelogic, and Phidget data formats
- **Custom `coffee-industry` LobeHub skill** at `.claude/skills/coffee-industry/` — Indonesian coffee industry knowledge base (sourcing, roasting, cupping, ops, regulatory, BPOM/SNI/Halal, Giling Basah). Auto-loaded on coffee-related keywords. Reformat of `dugemkakek/coffee-industry-ai` from Hermes-agent format to LobeHub SKILL.md format.

### Documentation
- `README.md` with quick start, supported hardware, architecture overview
- `CHANGELOG.md` (this file)
- `LICENSE` (MIT)
- `CLAUDE-arcana-build.md` — agent orientation guide for v0.1
- Updated `CLAUDE-cropster-saas.md` with new schema path references

### Fixed
- **Prisma schema relations** — added all missing back-relations on `Tenant` and `Product`, plus explicit `@relation` names for the `RoastProfile ↔ RoastSession` two-path ambiguity (Prisma 5 is strict about this)
- **Tailwind content paths** — `tailwind.config.ts` now scans `app/`, `components/`, `lib/`, `src/shared/` (where the UI actually lives) instead of the old `src/ui/` path, so classes like `h-80` and `w-full` are generated for the chart container
- **Chart container height** — `RoastChart` uses an explicit inline `style={{ height: 440 }}` as a safety net so the chart always renders even if Tailwind class generation misses
- **Next 15 app directory layout** — moved `app/`, `components/`, `lib/` from `src/ui/` to the project root (Next 15 standard), added `@` and `@shared/*` path aliases to `tsconfig.json` and `next.config.mjs` webpack config
- **TypeScript strict catches** — `ai-service` `setErrorHandler` typed as `(err: Error, ...)`; `local-node` `let aiRes` given explicit shape; dropped unused imports (`z`, `existsSync`, `readFile`, `mkdir` in `local-node` server)
- **Wrong import** — `ai-adapters/factory.ts` was importing `AIProviderName` from the local types module; it actually lives in `@arcana/shared-types`
- **Prisma env loading** — added `packages/db-local/.env` with `DATABASE_URL_LOCAL` (Prisma looks for `.env` co-located with the schema)
- **Next 15 static export** — dropped `output: 'export'` (incompatible with dynamic `[id]` route); Electron wrapper now spawns both `next start` and the Fastify server as child processes and waits for both ports to open
- **Redesigned `/roasts/[id]` page** — added 4 KPI tiles (weight, total time, peak BT, dev %), phase breakdown bar, polished events + AI analysis cards; bumped chart top margin from 8 → 56 so the legend is no longer clipped

### Notes
- VPS backend (`apps/vps-api/`) is deferred to v0.2+
- Supplier marketplace module is deferred
- Kaffelogic `.klog` native import is deferred (closed format, no public spec)
- Live Phidget capture is deferred to v0.2+
