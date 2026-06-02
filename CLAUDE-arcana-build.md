# CLAUDE.md — Arcana v0.1 build orientation

This file is the **starting point for any AI agent (or human) working on the
v0.1 codebase**. It supersedes the broader `CLAUDE-cropster-saas.md` for
day-to-day tasks; the broader file is the long-term product vision and is
authoritative for non-v0.1 questions.

## What is v0.1?

The first end-to-end vertical slice. The user can:

1. Open the Arcana app (web UI in dev, Electron app in production)
2. Upload an Artisan `.json` roast export
3. See the roast curve + events in the browser
4. Click "Analyze with AI" and get structured feedback (development %, RoR
   stability, issues, recommendations)
5. Browse past roasts from the list page

Everything runs **locally** on the roastery PC. No VPS, no cloud sync, no
auth. The only network call is to the configured LLM provider (MiniMax by
default) when the user clicks Analyze.

## Repo map (v0.1)

```
arcana/
├── apps/
│   ├── ai-service/        Fastify service on :4001 — proxies to LLM provider
│   └── local-node/        Fastify + Next.js + Electron — the user-facing app
│       ├── src/server/    Fastify on :4000
│       ├── src/ui/        Next.js 15 App Router
│       ├── electron/      Electron main + preload + builder config
│       ├── public/samples/sample-roast.json
│       └── scripts/       dev.sh, build-installer.sh
├── packages/
│   ├── ai-adapters/       AIProvider interface + MiniMax, Anthropic, OpenRouter
│   ├── db-local/          Prisma schema (SQLite) + generated client
│   ├── importers/         Artisan JSON parser → canonical RoastSessionImport
│   └── shared-types/      Cross-package types
├── docs/
│   ├── architecture/      C4 diagrams (context, containers)
│   └── importers/         (empty in v0.1 — see RESEARCH-roaster-data-formats.md)
├── .claude/skills/        8 LobeHub skills (auto-loaded by Claude Code)
├── .github/               Workflows, issue/PR templates, SECURITY, CODEOWNERS
├── output/vps.prisma      VPS schema (referenced by docs, not built yet)
├── scripts/               Monorepo-level scripts
├── CHANGELOG.md           Keep a Changelog format
├── LICENSE                MIT
└── README.md              Quick start + architecture overview
```

## Quick commands

```bash
# Install
pnpm install

# Set up DB
pnpm --filter @arcana/db-local prisma migrate dev --name init
pnpm --filter @arcana/db-local seed          # creates demo tenant

# Run both services
pnpm dev                                    # parallel: local-node + ai-service

# Smoke test
curl http://localhost:4001/health           # ai-service
curl http://localhost:4000/api/health       # local-node API

# Typecheck + tests
pnpm typecheck
pnpm test

# Build Windows installer (Win 7+)
pnpm dist:win
# → apps/local-node/release/Arcana Coffee Intelligence Setup 0.1.0.exe
```

## The v0.1 schema is here

- **Local DB schema**: `packages/db-local/prisma/schema.prisma` (SQLite in v0.1)
- **VPS DB schema** (not built yet, referenced by docs): `output/vps.prisma`

> **Heads up:** the `CLAUDE-cropster-saas.md` and the spec docs reference
> `output/local.prisma` and `output/vps.prisma`. In v0.1 we moved the
> local schema to `packages/db-local/prisma/schema.prisma` (since the
> monorepo now owns it). `output/vps.prisma` is still in place for when
> we start VPS work.

## What v0.1 does NOT include

Per the user's explicit decision: defer these to later milestones.

- **VPS backend** (`apps/vps-api/`) — comes in v0.2 with multi-tenant auth
- **Supplier marketplace module** — see `CLAUDE-supplier-supplement.md`
- **POS / e-commerce sync** — v0.3+
- ~~**Live Phidget capture** (direct USB reading)~~ — ✅ **shipped in v0.2** (live UI at `/roasts/live`, simulator + PhidgetManager, WebSocket streaming)
- **Kaffelogic `.klog` native import** — v1.5+ (closed format, no public spec)
- ~~**Live roast telemetry view** (real-time BT/ET/RoR graph)~~ — ✅ **shipped in v0.2** (real-time SVG chart in the live page)
- **Inventory + production planning UI** — v0.3+

## Live capture (v0.2)

The user can capture a roast in real time instead of using Artisan + export.

**Two interchangeable sources** (selected by `LIVE_SOURCE` env var, default `simulator`):

- **`simulator`** — generates a realistic synthetic roast curve (light/medium/dark profiles) so the live UI can be developed + tested without a real Phidget plugged in.
- **`phidget`** — wraps the `phidget22` npm package, discovers attached TMP1101 thermocouple modules, opens them on demand, emits `LiveSample` events at the configured data interval (default 1Hz). Requires the Phidget22 driver installed system-wide.

**End-to-end flow:**
1. User clicks 🔴 Live on the home page → `/roasts/live`
2. Select device → connect
3. Start session → server returns sessionId, LiveSessionStore starts buffering
4. Fire events via WebSocket (charge, tp, dry_end, fc_start, fc_end, drop, etc.) — low latency
5. Stop & save → server persists the buffered samples + events to Prisma with `source='live'`
6. User navigates to `/roasts/[id]` to see the persisted roast and run AI analysis (same path as imported roasts)

**Where the code lives:**
- `apps/local-node/src/server/phidget/` — `TemperatureSource` interface, `RoastSimulator`, `PhidgetManager`
- `apps/local-node/src/server/live/session.ts` — `LiveSessionStore` singleton (in-memory buffer)
- `apps/local-node/src/server/index.ts` — REST endpoints (`/api/live/*`) + WebSocket `/ws/live`
- `apps/local-node/app/roasts/live/page.tsx` — the UI page (real-time SVG chart + event buttons)

**To use a real Phidget:**
1. Install the Phidget22 driver from https://www.phidgets.com/docs/Operating_System_Support (Windows 7+ supported)
2. Plug in a TMP1101 thermocouple module on a VINT Hub
3. Set `LIVE_SOURCE=phidget` in `.env`
4. The `GET /api/live/devices` endpoint will now list the discovered TMP1101

**Known limitation (v0.2):** a single TMP1101 maps to BT only; ET is currently estimated as `BT + 15°C`. To get real ET, plug a second TMP1101 into the VINT Hub. Two-channel mapping is on the v0.3 roadmap.

## Indonesian coffee knowledge base

The repo includes a custom LobeHub skill at `.claude/skills/coffee-industry/`
(originally authored by the project owner at
[`dugemkakek/coffee-industry-ai`](https://github.com/dugemkakek/coffee-industry-ai),
reformatted from Hermes-agent format to LobeHub SKILL.md format with YAML
frontmatter). It is **automatically loaded** when coffee-related keywords
appear (kopi, espresso, roast, cupping, Giling Basah, DTR, RoR, Sumatra, etc.).

The most directly used slice of the skill is the **Indonesian Coffee
Roasting Notes** section, which is mirrored in the system prompt of
`packages/ai-adapters/src/prompt.ts` so the LLM gives origin-specific
(Gayo / Java / Toraja / Bajawa / Kintamani / Mandheling) advice even
when the skill isn't loaded.

Reference docs in the skill:
- `SKILL.md` — main knowledge base (sourcing, roasting, cupping, ops, regulatory)
- `references/BREWING_KNOWLEDGE.md` — extraction, brew methods, milk, defects
- `references/SCHEMAS.md` — JSON schemas (cupping scores, supply chain, sourcing)
- `references/CATALOG.md` — 18-SKU product reference
- `references/QUICKREF.md` — human-readable cheat sheet
- `references/EXAMPLE_PROMPTS.md` — realistic prompt templates
- `references/AGENT_SOURCES.md` — research digest (capped at Feb 2026)
- `CHANGELOG-coffee-industry.md` — upstream version history

## How to extend

When you add a feature:

1. Update the relevant Prisma schema first (likely `packages/db-local/`)
2. Run `pnpm --filter @arcana/db-local prisma migrate dev --name your_feature`
3. Add the importer / AI logic in the appropriate `packages/*` package
4. Add the server route in `apps/local-node/src/server/index.ts`
5. Add the UI in `apps/local-node/src/ui/app/`
6. Update `CHANGELOG.md` under `[Unreleased]`
7. Add a sample file under `apps/local-node/public/samples/` if relevant
8. Update `docs/architecture/c4-containers.md` if the container boundaries change

## Where the skills help

The 8 LobeHub skills in `.claude/skills/` auto-load when relevant code is
touched. The most useful mappings:

| Touching... | Skill that helps |
|---|---|
| `packages/db-local/` | `affaan-m-ecc-prisma-patterns` |
| Any TypeScript | `lobehub-lobehub-typescript` |
| `apps/local-node/src/ui/` | `affaan-m-ecc-frontend-patterns` |
| Tailwind / shadcn-ui | `openclaw-skills-shadcn-ui` |
| `apps/local-node/src/ui/components/RoastChart.tsx` | `shubhamsaboo-awesome-llm-apps-visualization-expert` |
| `packages/importers/` design tokens, design system | `wshobson-agents-design-system-patterns` |
| `packages/ai-adapters/` | `davila7-claude-code-templates-ai-product` |
| `docs/architecture/` | `davila7-claude-code-templates-c4-architecture` |
