#!/usr/bin/env bash
# build-installer.sh — build the Windows installer locally.
# Requires Wine on Linux/macOS to actually run electron-builder for win
# targets. On Windows, just call pnpm dist:win directly.

set -euo pipefail
cd "$(dirname "$0")/../.."

echo "▶ Building server…"
pnpm --filter @arcana/local-node build:server

echo "▶ Building UI (static export)…"
pnpm --filter @arcana/local-node build:ui

echo "▶ Building Windows installer…"
pnpm --filter @arcana/local-node dist:win

echo "✓ Done. Installer at: apps/local-node/release/"
