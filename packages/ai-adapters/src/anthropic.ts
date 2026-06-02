// @arcana/ai-adapters — Anthropic adapter (stub for v0.1).
//
// The MiniMax adapter is the default in v0.1. This stub keeps the
// interface parity so the AI service can route by `AI_PROVIDER=anthropic`
// in v0.2 once we wire up the real implementation.

import { AIProviderError, type AIProvider, type RoastAnalysisRequest, type RoastAnalysisResponse } from './types.js';

export class AnthropicAdapter implements AIProvider {
  readonly name = 'anthropic' as const;
  readonly modelName: string;

  constructor(modelName: string = 'claude-sonnet-4-6') {
    this.modelName = modelName;
  }

  async analyzeRoast(_req: RoastAnalysisRequest): Promise<RoastAnalysisResponse> {
    throw new AIProviderError(
      this.name,
      501,
      'Anthropic adapter is not implemented in v0.1. Set AI_PROVIDER=minimax or implement this adapter.',
    );
  }
}
