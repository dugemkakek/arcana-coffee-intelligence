#!/usr/bin/env bash
# dev.sh — run the local-node app in dev mode (server + UI in parallel).
# Called by the root `pnpm dev` script.

set -euo pipefail
cd "$(dirname "$0")/.."

echo "▶ local-node dev"
echo "  - API: http://localhost:${LOCAL_NODE_API_PORT:-4000}"
echo "  - UI : http://localhost:3000"

# Start server in background
pnpm dev:server &
SERVER_PID=$!

# Trap to clean up
trap 'kill $SERVER_PID 2>/dev/null || true' EXIT INT TERM

# Start UI in foreground
pnpm dev:ui
