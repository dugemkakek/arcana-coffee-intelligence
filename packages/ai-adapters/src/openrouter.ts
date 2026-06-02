// @arcana/ai-adapters — OpenRouter adapter (stub for v0.1).

import { AIProviderError, type AIProvider, type RoastAnalysisRequest, type RoastAnalysisResponse } from './types.js';

export class OpenRouterAdapter implements AIProvider {
  readonly name = 'openrouter' as const;
  readonly modelName: string;

  constructor(modelName: string = 'anthropic/claude-sonnet-4-6') {
    this.modelName = modelName;
  }

  async analyzeRoast(_req: RoastAnalysisRequest): Promise<RoastAnalysisResponse> {
    throw new AIProviderError(
      this.name,
      501,
      'OpenRouter adapter is not implemented in v0.1. Set AI_PROVIDER=minimax or implement this adapter.',
    );
  }
}
