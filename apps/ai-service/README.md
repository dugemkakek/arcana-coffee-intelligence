# @arcana/ai-service

Standalone Fastify service that normalizes LLM calls for the Arcana local-node app.

## Endpoints

| Method | Path             | Description                                   |
| ------ | ---------------- | --------------------------------------------- |
| GET    | `/health`        | Provider + model + uptime                     |
| POST   | `/analyze/roast` | Run AI analysis on a roast session            |

## Configuration

Set these env vars (see `.env.example` in the repo root):

| Variable          | Default                          | Notes                |
| ----------------- | -------------------------------- | -------------------- |
| `AI_PROVIDER`     | `minimax`                        | `minimax \| anthropic \| openrouter` |
| `AI_SERVICE_PORT` | `4001`                           |                      |
| `AI_SERVICE_HOST` | `0.0.0.0`                        |                      |
| `MINIMAX_API_KEY` | —                                | required when `AI_PROVIDER=minimax` |
| `MINIMAX_MODEL`   | `MiniMax-Text-01`                |                      |
| `MINIMAX_BASE_URL`| `https://api.MiniMax.chat/v1`    |                      |

## Development

```bash
pnpm --filter @arcana/ai-service dev
# → http://localhost:4001
```

## Smoke test

```bash
curl http://localhost:4001/health
# → {"status":"ok","provider":"minimax","model":"MiniMax-Text-01","uptimeSec":3}
```
