# @arcana/local-node

The main desktop app for Arcana. Combines:

- **Fastify API** on port 4000 (`src/server/`)
- **Next.js 15 UI** on port 3000 (`src/ui/`)
- **Electron wrapper** for the Windows installer (`electron/`)

## Development

```bash
# from the monorepo root
pnpm dev:local-node
# → UI   : http://localhost:3000
# → API  : http://localhost:4000
```

The `dev` script runs both the API and UI in parallel via `concurrently`.

## Build

```bash
pnpm --filter @arcana/local-node build
```

## Windows installer

```bash
pnpm --filter @arcana/local-node dist:win
# → apps/local-node/release/Arcana Coffee Intelligence Setup 0.1.0.exe
```

Built with `electron-builder` 22.x and Electron 13.x — the last Electron major
that supports Windows 7 SP1.

## Layout

```
src/
├── server/         Fastify REST API
├── shared/         Types shared between server and UI
└── ui/             Next.js 15 App Router
    ├── app/        Pages: /, /import, /roasts/[id]
    ├── components/ UI primitives
    └── lib/        API client
electron/           Electron main process + preload + builder config
public/
└── samples/        Bundled sample Artisan JSON for the demo
```
