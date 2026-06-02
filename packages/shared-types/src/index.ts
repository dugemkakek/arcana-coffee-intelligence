// @arcana/shared-types — public entry point.
//
// Place types here only if they are used by 2+ packages. Otherwise keep
// them co-located with the package that owns them.

export type AIProviderName = 'minimax' | 'anthropic' | 'openrouter' | 'local' | 'mock';

export type RoastEventType =
  | 'charge'
  | 'tp'
  | 'dry_end'
  | 'fc_start'
  | 'fc_end'
  | 'sc_start'
  | 'sc_end'
  | 'drop'
  | 'cool'
  | 'note';

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  provider: AIProviderName;
  model: string;
  uptimeSec: number;
}
