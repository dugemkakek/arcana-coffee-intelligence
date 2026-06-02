// Shared API types between server and UI.

export interface RoastSummary {
  id: string;
  roastDate: string;
  greenWeightKg: number | null;
  roastedWeightKg: number | null;
  source: string;
  sourceFile: string | null;
  notes: string | null;
  greenLot: { id: string; name: string; code: string };
  aiAnalyses: Array<{
    id: string;
    createdAt: string;
    provider: string;
    summaryText: string;
  }>;
}

export interface RoastDetail extends RoastSummary {
  events: Array<{
    id: string;
    eventType: string;
    timestampMs: number;
    value: string | null;
  }>;
  samplePoints: Array<{
    id: string;
    timestampMs: number;
    beanTempC: number | null;
    exhaustTempC: number | null;
    ror: number | null;
  }>;
  aiAnalyses: Array<{
    id: string;
    createdAt: string;
    provider: string;
    modelName: string;
    summaryText: string;
    analysisJson: string;
  }>;
}

export interface ImportResult {
  roastId: string;
  source: string;
  sampleCount: number;
  eventCount: number;
  durationSec: number;
}

export interface AnalysisResponse {
  analysisId: string;
  provider: string;
  modelName: string;
  summary: string;
  developmentPct: number;
  rorStabilityScore: number;
  issues: string[];
  recommendations: string[];
  tokensUsed: { prompt: number; completion: number; total: number };
  latencyMs: number;
}
