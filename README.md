# Arcana Coffee Intelligence

> A Cropster alternative for Indonesian micro-roasteries, with a **free core** (roast telemetry, inventory, POS sync) and a **paid AI layer** (roast curve analysis, production planning, supplier insights).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node 20+](https://img.shields.io/badge/node-%E2%89%A520.0.0-brightgreen)](./.nvmrc)
[![pnpm 9+](https://img.shields.io/badge/pnpm-%E2%89%A59.0.0-orange)](https://pnpm.io)

## Status

**v0.1.0** — first end-to-end vertical slice.
- ✅ Import Artisan `.json` exports (VNT 2.5kg + Phidget thermocouples)
- ✅ AI-powered roast curve analysis (default: MiniMax)
- ✅ Minimal web UI to list, import, and review roasts
- ✅ Local-only build (VPS integration deferred to v0.2+)
- ✅ Windows 7+ installer via electron-builder

**Roadmap:** see [CHANGELOG.md](./CHANGELOG.md) for shipped features and `CLAUDE-cropster-saas.md` for the full product vision.

## Supported hardware (v0.1)

| Roaster | Software | Import path |
|---|---|---|
| VNT 2.5kg | Artisan + Phidget TMP1101 | Export `.json` from Artisan → upload in UI |
| Any roaster | Artisan | Same as above |
| Kaffelogic Nano 7e | Kaffelogic Studio | **Coming in v1.5+** (closed `.klog` format) |

## Architecture

A monorepo with three services (only the first two are built in v0.1):

```
┌─────────────────────────────────────────────────────────────┐
│ apps/local-node      Fastify + Next.js 15 + Electron         │
│   → user-facing desktop app (this is the installable .exe)  │
│                                                              │
│ apps/ai-service      Fastify + LLM adapters                  │
│   → normalizes AI calls to MiniMax / Anthropic / OpenRouter │
│                                                              │
│ apps/vps-api         (v0.2+, not built yet)                  │
│   → central SaaS for tenants, billing, cross-roastery data  │
└─────────────────────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ packages/db-local         Prisma + SQLite (this PC)         │
│ packages/db-vps           Prisma + Postgres (cloud, later)  │
│ packages/importers        Artisan JSON / CSV parsers         │
│ packages/ai-adapters      LLM provider interfaces            │
│ packages/shared-types     Cross-package TypeScript types     │
└─────────────────────────────────────────────────────────────┘
```

Detailed C4 diagrams in [`docs/architecture/`](./docs/architecture/).

## Quick start (development)

```bash
# 1. Install Node 20 + pnpm 9
nvm use          # picks up .nvmrc
npm install -g pnpm@9

# 2. Install deps
pnpm install

# 3. Configure env
cp .env.example .env
# Edit .env: set DATABASE_URL_LOCAL + MINIMAX_API_KEY

# 4. Set up the local DB
pnpm prisma:migrate

# 5. Run both services
pnpm dev
# → local-node UI  : http://localhost:3000
# → ai-service API : http://localhost:4001

# 6. Try the import flow
# Open http://localhost:3000 → "Import Roast" → drop
# apps/local-node/public/samples/sample-roast.json
```

## Build the Windows installer

```bash
pnpm dist:win
# → apps/local-node/release/Arcana Coffee Intelligence Setup 0.1.0.exe
```

The installer is built with `electron-builder` and supports Windows 7 SP1 and newer (32-bit and 64-bit).

## Repository layout

```
arcana-coffee-intelligence/
├── apps/
│   ├── local-node/       # Main desktop app (Fastify + Next.js + Electron)
│   └── ai-service/       # AI normalization service
├── packages/
│   ├── db-local/         # Prisma schema + generated client (SQLite)
│   ├── importers/        # Artisan JSON / CSV parsers
│   ├── ai-adapters/      # LLM provider interfaces (MiniMax, Anthropic, OpenRouter)
│   └── shared-types/     # Cross-package TypeScript types
├── docs/
│   ├── architecture/     # C4 diagrams
│   └── importers/        # Format docs
├── .claude/              # Claude Code config + installed skills
├── .github/              # CI, issue / PR templates
├── scripts/              # Build & dev scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── package.json
```

## Tech stack

- **Language:** TypeScript 5.5 (strict mode)
- **Package manager:** pnpm 9 workspaces
- **Backend:** Fastify (local-node, ai-service)
- **Frontend:** Next.js 15 + React 19 + Tailwind CSS 4 + shadcn/ui
- **Database:** Prisma + SQLite (local) → Postgres (VPS, later)
- **AI:** MiniMax (default) with Anthropic + OpenRouter + local-LLM adapters
- **Installer:** electron-builder 22 + NSIS, target Windows 7+
- **Charts:** Recharts (roast curves) via the `visualization-expert` skill
- **Validation:** Zod (structured LLM output, API request/response)

## License

[MIT](./LICENSE) — free for commercial and personal use.
