#!/usr/bin/env bash
# dev.sh — monorepo root dev runner.
# Starts apps/local-node and apps/ai-service in parallel.

set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ Arcana dev (parallel)"
echo "  - local-node UI  : http://localhost:3000"
echo "  - local-node API : http://localhost:4000"
echo "  - ai-service     : http://localhost:4001"

pnpm -r --parallel --stream run dev
