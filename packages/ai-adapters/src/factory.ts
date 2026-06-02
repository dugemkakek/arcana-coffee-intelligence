// @arcana/ai-adapters — provider factory.

import type { AIProvider, AIProviderName } from './types.js';
import { MinimaxAdapter } from './minimax.js';
import { AnthropicAdapter } from './anthropic.js';
import { OpenRouterAdapter } from './openrouter.js';

export function createProvider(name: AIProviderName): AIProvider {
  switch (name) {
    case 'minimax': {
      const apiKey = requireEnv('MINIMAX_API_KEY');
      const model = process.env.MINIMAX_MODEL;
      const baseUrl = process.env.MINIMAX_BASE_URL;
      return new MinimaxAdapter({ apiKey, model, baseUrl });
    }
    case 'anthropic':
      return new AnthropicAdapter(process.env.ANTHROPIC_MODEL);
    case 'openrouter':
      return new OpenRouterAdapter(process.env.OPENROUTER_MODEL);
    case 'local':
      throw new Error('Local LLM adapter is not implemented in v0.1');
    default:
      throw new Error(`Unknown AI provider: ${name as string}`);
  }
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}
