// @arcana/ai-adapters — MiniMax (default) adapter.
//
// MiniMax exposes an OpenAI-compatible chat completions API at
// https://api.MiniMax.chat/v1. We hit it with the standard messages
// format, ask for JSON, and validate the response with Zod.
//
// Env:
//   MINIMAX_API_KEY      (required)
//   MINIMAX_MODEL        (default 'MiniMax-Text-01')
//   MINIMAX_BASE_URL     (default 'https://api.MiniMax.chat/v1')

import { z } from 'zod';
import { AIProviderError, type AIProvider, type RoastAnalysisRequest, type RoastAnalysisResponse } from './types.js';
import { buildRoastAnalysisPrompt } from './prompt.js';

const RoastAnalysisSchema = z.object({
  summary: z.string().min(20).max(1000),
  developmentPct: z.number().min(0).max(100),
  rorStabilityScore: z.number().min(0).max(10),
  issues: z.array(z.string()).max(10),
  recommendations: z.array(z.string()).max(10),
});

export interface MinimaxAdapterConfig {
  apiKey: string;
  model?: string;
  baseUrl?: string;
  /** Request timeout, ms. Default 30000. */
  timeoutMs?: number;
}

export class MinimaxAdapter implements AIProvider {
  readonly name = 'minimax' as const;
  readonly modelName: string;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(config: MinimaxAdapterConfig) {
    if (!config.apiKey) {
      throw new Error('MinimaxAdapter: MINIMAX_API_KEY is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.baseUrl ?? 'https://api.MiniMax.chat/v1').replace(/\/$/, '');
    this.modelName = config.model ?? 'MiniMax-Text-01';
    this.timeoutMs = config.timeoutMs ?? 30_000;
  }

  async analyzeRoast(req: RoastAnalysisRequest): Promise<RoastAnalysisResponse> {
    const { system, user } = buildRoastAnalysisPrompt(req);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    const start = Date.now();
    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      clearTimeout(timeout);
      throw new AIProviderError(this.name, 0, `Network error: ${(err as Error).message}`, err);
    }
    clearTimeout(timeout);
    const latencyMs = Date.now() - start;

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new AIProviderError(this.name, res.status, `HTTP ${res.status}: ${body.slice(0, 500)}`);
    }

    const payload = (await res.json()) as MinimaxChatResponse;
    const raw = payload.choices?.[0]?.message?.content;
    if (typeof raw !== 'string') {
      throw new AIProviderError(this.name, 502, 'Empty or malformed completion');
    }

    // Parse + validate the JSON. The model is told to return JSON only,
    // but we still defend against garbage.
    let parsed: z.infer<typeof RoastAnalysisSchema>;
    try {
      const obj = JSON.parse(raw);
      parsed = RoastAnalysisSchema.parse(obj);
    } catch (err) {
      throw new AIProviderError(this.name, 502, `Model output failed validation: ${(err as Error).message}`, err);
    }

    return {
      ...parsed,
      provider: this.name,
      modelName: this.modelName,
      tokensUsed: {
        prompt: payload.usage?.prompt_tokens ?? 0,
        completion: payload.usage?.completion_tokens ?? 0,
        total: payload.usage?.total_tokens ?? 0,
      },
      latencyMs,
    };
  }
}

// ---- MiniMax API response types (subset) ------------------------------

interface MinimaxChatResponse {
  id?: string;
  model?: string;
  choices?: Array<{
    index?: number;
    message?: { role?: string; content?: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}
