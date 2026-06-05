# Contributing to Arcana Coffee Intelligence

Thanks for your interest! This document covers everything you need to get
the project running locally, plus the conventions we use for branches,
commits, and PRs.

## Prerequisites

- **Node.js 20+** — `nvm use` in the repo root picks up the pinned version from `.nvmrc`
- **pnpm 9+** — `corepack enable && corepack prepare pnpm@9.12.0 --activate`
- **Windows 7+ / macOS / Linux** for development
  - **Windows required** to build the installer (electron-builder)
  - **Phidget22 driver** required only if you want to capture real roasts from a TMP1101

## Setup

```bash
# 1. Clone and install
git clone https://github.com/dugemkakek/arcana-coffee-intelligence.git
cd arcana-coffee-intelligence
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env — at minimum set DATABASE_URL_LOCAL and AI_PROVIDER=mock
# AI_PROVIDER=mock is the default — no API key needed to try the full
# import + analyze flow. Set MINIMAX_API_KEY (or ANTHROPIC_API_KEY)
# only when you want real AI analysis.

# 3. Set up the local database
pnpm prisma:migrate
pnpm --filter @arcana/db-local prisma db seed   # optional demo data

# 4. Run all services
pnpm dev
# → UI:  http://localhost:3000
# → API: http://localhost:4000
# → AI:  http://localhost:4001
```

## Development workflow

- All changes should pass `pnpm typecheck` and `pnpm test` before opening a PR.
- Format code with `pnpm format` (Prettier is wired up; no manual formatting).
- If you modify a Prisma schema, run `pnpm prisma:migrate` and commit the generated migration.
- Add a note to the `[Unreleased]` section of `CHANGELOG.md` for any user-visible change.
- Don't commit `.env`, `dev.db`, `node_modules/`, `dist/`, or `release/` — all are in `.gitignore`.

## Editor setup

- `.editorconfig` is committed; most editors pick it up automatically.
- VS Code: recommended extensions and settings live in `.vscode/`.
- JetBrains: `.idea/` directories are fully gitignored — please don't commit them.

## Branch & commit conventions

- Branch names: `feat/short-description`, `fix/short-description`, `chore/short-description`
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):
  - `feat: ...` — new user-facing feature
  - `fix: ...` — bug fix
  - `chore: ...` — internal change (deps, tooling, docs)
- All PRs target `main`.

## Project layout

```
apps/
  ai-service/      Fastify service on :4001 — proxies to the LLM provider
  local-node/      Fastify backend + Next.js 15 + Electron + electron-builder
                   (the user-facing app, ships as the Windows installer)
packages/
  ai-adapters/     AIProvider interface + MiniMax / Anthropic / OpenRouter / mock
  db-local/        Prisma schema (SQLite in v0.1)
  importers/       Artisan JSON / CSV parsers
  shared-types/    Cross-package TypeScript types
docs/              Architecture, importers, research
.claude/skills/    8 LobeHub skills (auto-loaded by Claude Code)
.github/           CI, issue / PR templates, SECURITY, CODEOWNERS
```

## Questions?

Open a [GitHub Discussion](https://github.com/dugemkakek/arcana-coffee-intelligence/discussions) or file an issue.
