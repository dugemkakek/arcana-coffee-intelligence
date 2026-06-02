// @arcana/ai-service — Fastify server.
//
// Exposes a small JSON API:
//   GET  /health             → { status, provider, model, uptimeSec }
//   POST /analyze/roast      → RoastAnalysisRequest → RoastAnalysisResponse
//
// Reads AI_PROVIDER from env to select the adapter (minimax default).

import Fastify from 'fastify';
import { z } from 'zod';
import { createProvider, AIProviderError, type AIProvider, type RoastAnalysisRequest } from '@arcana/ai-adapters';
import type { AIProviderName, HealthResponse } from '@arcana/shared-types';

const PORT = Number(process.env.AI_SERVICE_PORT ?? 4001);
const HOST = process.env.AI_SERVICE_HOST ?? '0.0.0.0';
const PROVIDER_NAME = (process.env.AI_PROVIDER ?? 'minimax') as AIProviderName;

const startedAt = Date.now();

async function main() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? 'info',
      transport: { target: 'pino-pretty', options: { colorize: true } },
    },
  });

  // Lazy provider — fail fast on boot if env vars are missing.
  let provider: AIProvider;
  try {
    provider = createProvider(PROVIDER_NAME);
    app.log.info({ provider: provider.name, model: provider.modelName }, 'AI provider initialized');
  } catch (err) {
    app.log.error({ err }, 'Failed to initialize AI provider');
    // Don't exit — health check will report degraded and `/analyze/roast`
    // will surface the error to the caller. Useful for partial-boot scenarios.
    provider = new ErroringProvider(PROVIDER_NAME, (err as Error).message);
  }

  // ----------------------------------------------------------
  // Routes
  // ----------------------------------------------------------

  app.get('/health', async (): Promise<HealthResponse> => {
    const status: HealthResponse['status'] =
      provider instanceof ErroringProvider ? 'degraded' : 'ok';
    return {
      status,
      provider: provider.name,
      model: provider.modelName,
      uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
    };
  });

  // Request schema — light validation, the adapter does the rest.
  const AnalyzeBody = z.object({
    samples: z
      .array(
        z.object({
          t: z.number(),
          bt: z.number(),
          et: z.number(),
          ror: z.number().optional(),
        }),
      )
      .min(2)
      .max(10_000),
    events: z
      .array(
        z.object({
          type: z.enum([
            'charge',
            'tp',
            'dry_end',
            'fc_start',
            'fc_end',
            'sc_start',
            'sc_end',
            'drop',
            'cool',
            'note',
          ]),
          t: z.number(),
          value: z.string().optional(),
        }),
      )
      .default([]),
    greenWeightKg: z.number().positive().optional(),
    roastedWeightKg: z.number().positive().optional(),
    durationSec: z.number().nonnegative(),
    operator: z.string().optional(),
    machine: z
      .object({
        manufacturer: z.string(),
        model: z.string(),
      })
      .optional(),
    notes: z.string().max(2000).optional(),
    language: z.enum(['en', 'id']).optional(),
  });

  app.post('/analyze/roast', async (req, reply) => {
    const parse = AnalyzeBody.safeParse(req.body);
    if (!parse.success) {
      return reply.code(400).send({
        error: 'Invalid request body',
        code: 'INVALID_INPUT',
        details: parse.error.flatten(),
      });
    }

    try {
      const result = await provider.analyzeRoast(parse.data as RoastAnalysisRequest);
      app.log.info(
        {
          provider: result.provider,
          model: result.modelName,
          tokens: result.tokensUsed.total,
          latencyMs: result.latencyMs,
        },
        'roast analyzed',
      );
      return reply.send(result);
    } catch (err) {
      if (err instanceof AIProviderError) {
        app.log.error({ err, provider: err.provider, statusCode: err.statusCode }, 'AI provider error');
        return reply.code(err.statusCode >= 400 && err.statusCode < 600 ? 502 : 500).send({
          error: err.message,
          code: 'AI_PROVIDER_ERROR',
        });
      }
      app.log.error({ err }, 'unexpected error');
      return reply.code(500).send({ error: 'Internal server error', code: 'INTERNAL' });
    }
  });

  // Default error handler with consistent shape
  app.setErrorHandler((err, _req, reply) => {
    app.log.error({ err }, 'unhandled error');
    reply.code(500).send({ error: err.message ?? 'Internal server error', code: 'INTERNAL' });
  });

  // ----------------------------------------------------------
  // Boot
  // ----------------------------------------------------------

  try {
    await app.listen({ port: PORT, host: HOST });
    app.log.info(`ai-service ready on http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error({ err }, 'failed to start');
    process.exit(1);
  }
}

// Stand-in provider used when the real one failed to init, so /health
// still responds and other endpoints can surface a clear 503.
class ErroringProvider implements AIProvider {
  readonly name: AIProviderName;
  readonly modelName: string = 'unavailable';

  constructor(name: AIProviderName, public readonly initError: string) {
    this.name = name;
  }

  async analyzeRoast(): Promise<never> {
    throw new AIProviderError(this.name, 503, `Provider not initialized: ${this.initError}`);
  }
}

main().catch((err) => {
  console.error('fatal:', err);
  process.exit(1);
});
