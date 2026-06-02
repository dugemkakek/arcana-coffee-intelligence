// @arcana/ai-adapters — interface definitions.

import type { AIProviderName } from '@arcana/shared-types';

// =====================================================================
// Roast analysis
// =====================================================================

export interface RoastSampleLite {
  t: number;       // seconds from t=0
  bt: number;      // °C
  et: number;      // °C
  ror?: number;    // °C / min
}

export interface RoastEventLite {
  type: 'charge' | 'tp' | 'dry_end' | 'fc_start' | 'fc_end' | 'sc_start' | 'sc_end' | 'drop' | 'cool' | 'note';
  t: number;
  value?: string;
}

export interface RoastAnalysisRequest {
  /** Down-sampled / re-bucketed sample series (≤ ~500 points recommended). */
  samples: RoastSampleLite[];
  events: RoastEventLite[];
  greenWeightKg?: number;
  roastedWeightKg?: number;
  durationSec: number;
  operator?: string;
  machine?: { manufacturer: string; model: string };
  /** Free-form operator notes. */
  notes?: string;
  /** Output language for the summary. Default 'en'. */
  language?: 'en' | 'id';
}

export interface RoastAnalysisResponse {
  /** Plain-text summary, 2–4 sentences. */
  summary: string;
  /** Development phase as percent of total roast (yellowing → first crack end). 0–100. */
  developmentPct: number;
  /** RoR stability score 0–10. Higher = more stable. */
  rorStabilityScore: number;
  /** Identified issues (e.g. "Crash at 7:30", "Baked finish"). */
  issues: string[];
  /** Actionable recommendations for the next roast. */
  recommendations: string[];
  /** Which provider + model produced this. */
  provider: AIProviderName;
  modelName: string;
  /** Token usage for billing. */
  tokensUsed: { prompt: number; completion: number; total: number };
  /** Provider latency, ms. */
  latencyMs: number;
}

// =====================================================================
// Provider interface
// =====================================================================

export interface AIProvider {
  readonly name: AIProviderName;
  readonly modelName: string;
  analyzeRoast(req: RoastAnalysisRequest): Promise<RoastAnalysisResponse>;
}

// =====================================================================
// Errors
// =====================================================================

export class AIProviderError extends Error {
  constructor(
    public readonly provider: AIProviderName,
    public readonly statusCode: number,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(`[${provider}] ${message}`);
    this.name = 'AIProviderError';
  }
}
