# Changelog

All notable changes to **Arcana Coffee Intelligence** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2026-06-05

### Added
- **Sidebar + Inventory + Plan pages**
  - Replaced the top-nav with a left sidebar (`components/AppShell.tsx`). Four tabs: Live, Roasts, Inventory, Plan. Active tab computed via `usePathname()`. Mobile (<lg) collapses to a horizontal scrollable top strip.
  - **Inventory page** (`/inventory`) — two-tab view (Green / Roasted). Green tab: list of `GreenLot` rows with a current-vs-initial stock progress bar; inline "Add lot" form (code, name, origin, region, farm, variety, process, initial kg). Roasted tab: list of `RoastedInventory` rows by product+location; inline "Add product" form + "Manual adjustment" form (delta kg, reason select, optional ref).
  - **Plan page** (`/plan`) — server-rendered digest in three cards: Stock alerts (`onHandKg < 1.0`), Roast next (FIFO of oldest 5 active green lots), Recent roasts (last 5). No JS required to view.
  - 8 new REST endpoints on the local-node API: `GET/POST /api/inventory/green`, `GET/POST /api/inventory/green/:id/movement`, `GET /api/inventory/roasted`, `POST /api/inventory/roasted/adjustment`, `GET/POST /api/products`, `GET /api/plan`. All scoped to the seeded `demo-roastery` tenant. Stock-changing writes wrap in a Prisma transaction with the matching audit row (`GreenMovement` or `InventoryAdjustment`).
  - `lib/api.ts` extended with typed clients for the new endpoints.
  - New client components: `AddGreenLotForm`, `AddProductForm`, `AdjustRoastedForm`. All use React Query mutations and invalidate the relevant query keys on success.
  - `package.json` bumps to v0.3.0 in the sidebar footer.

## [0.2.0] - 2026-06-05

### Added
- **Live Phidget capture**
  - Server-side Phidget module with two interchangeable `TemperatureSource` implementations:
    - `RoastSimulator` — realistic synthetic roast curve (light/medium/dark profiles). Default in dev.
    - `PhidgetManager` — wraps the `phidget22` npm package, discovers attached TMP1101 thermocouple modules, opens them on demand.
  - `LiveSessionStore` (singleton) — holds the active live roast in memory, buffers samples + events, persists to Prisma with `source='live'` on stop.
  - REST endpoints under `/api/live/`:
    - `GET /api/live/source` — info about the active temperature source
    - `GET /api/live/devices` — list available devices
    - `POST /api/live/connect` `{deviceId}` — connect to a device (e.g. `simulator`)
    - `POST /api/live/disconnect`
    - `POST /api/live/sessions/start` `{greenLotId?, greenLotName?, operatorUserId?}` → `{sessionId, startedAt, greenLot}`
    - `POST /api/live/sessions/event` `{type, value?}` → `{t}` (charge, tp, dry_end, fc_start, fc_end, sc_start, sc_end, drop, cool, note)
    - `POST /api/live/sessions/stop` → `{roastId}`
  - WebSocket `/ws/live` — bidirectional: server pushes `sample` / `event` / `state`, client can send `event` or `ping`.
  - Server-side broadcast throttle: max 10 Hz so the UI doesn't drown in samples.
- **Two-channel BT/ET Phidget mapping**
  - `PhidgetManager` refactored to open two TMP1101 sensors (one for BT, one for ET) on the same VINT Hub instead of guessing ET as `BT + 15°C`.
  - Auto-discovery: if `BT_DEVICE_SERIAL` / `ET_DEVICE_SERIAL` are unset, the first / second TMP1101 found on the hub are used.
  - `LiveSample` shape extended with `etEstimated`, `btChannel`, `etChannel` flags.
  - Graceful degradation: if only 1 sensor is found, ET falls back to `BT + 15°C` with `etEstimated: true`.
  - Simulator marked `etEstimated: false` (it always generates both channels).
  - Live UI shows a yellow "Exhaust temp is estimated" banner when `etEstimated` is true.
  - `.env.example` documents the new `BT_DEVICE_SERIAL` / `ET_DEVICE_SERIAL` env vars.
- **Live UI page** `apps/local-node/app/roasts/live/page.tsx`:
  - 3-step workflow: device → session → events.
  - Real-time SVG chart with event markers.
  - Live KPI readout: elapsed, BT, ET, RoR (5s window), sample count.
  - Event button row (10 buttons).
  - "🔴 Live" button in the home page header.
  - On stop, navigates to the persisted roast's detail page.
- `phidget22@^3.25.1` and `@fastify/websocket@^11.2.0` dependencies added.
- `RoastSummary.machine` field added so the home + detail pages can show the roaster model.
- `MockAdapter` (deterministic offline AI provider) for testing without an API key.
- `CONTRIBUTING.md` with setup, conventions, and project layout.

### Fixed
- **Code review pass** (from `arcana-coffee-intelligence-review.md`):
  - `package.json` — `clean` script now uses `rimraf` for Windows compat.
  - `package.json` — `dev` script runs `prisma:generate` first so the Prisma client is ready before any service starts.
  - `package.json` — `build` script uses explicit pnpm filter ordering so dependent packages build before consumers.
  - `tsconfig.base.json` — `verbatimModuleSyntax: true` (companion to `moduleResolution: "Bundler"`); added `noImplicitReturns` and `noUncheckedIndexedAccess`.
  - `.env.example` — `MINIMAX_BASE_URL` lowercased; `LOCAL_NODE_PORT` renamed to `LOCAL_NODE_API_PORT` for clarity; server + electron main + dev.sh updated to match.
  - `.gitignore` — removed duplicate `.DS_Store` entry.
  - `CHANGELOG.md` — `[Unreleased]` contents moved to `[0.2.0]` so it actually represents shipped work; URL comparison footnotes at the bottom.
- `prisma generate` was required as a separate step before any service could start; now wired into `pnpm dev`.

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
- **Custom `coffee-industry` LobeHub skill** at `.claude/skills/coffee-industry/` — Indonesian coffee industry knowledge base (sourcing, roasting, cupping, ops, regulatory, BPOM/SNI/Halal, Giling Basah). Auto-loaded on coffee-related keywords. Reformat of the team's `coffee-industry-ai` from Hermes-agent format to LobeHub SKILL.md format.

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

[Unreleased]: https://github.com/dugemkakek/arcana-coffee-intelligence/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/dugemkakek/arcana-coffee-intelligence/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/dugemkakek/arcana-coffee-intelligence/releases/tag/v0.1.0
