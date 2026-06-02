# Changelog

All notable changes to **Arcana Coffee Intelligence** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

### Notes
- VPS backend (`apps/vps-api/`) is deferred to v0.2+
- Supplier marketplace module is deferred
- Kaffelogic `.klog` native import is deferred (closed format, no public spec)
- Live Phidget capture is deferred to v0.2+
