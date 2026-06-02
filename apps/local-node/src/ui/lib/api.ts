// Centralized API client for the Next.js UI.

import type { RoastSummary, RoastDetail, ImportResult, AnalysisResponse } from '@arcana/shared-types';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(public readonly status: number, message: string, public readonly code?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function jsonFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let errBody: { error?: string; code?: string } = {};
    try {
      errBody = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(res.status, errBody.error ?? `HTTP ${res.status}`, errBody.code);
  }
  return (await res.json()) as T;
}

export async function fetchRoasts(limit = 50, offset = 0): Promise<{
  total: number;
  items: RoastSummary[];
}> {
  return jsonFetch(`/api/roasts?limit=${limit}&offset=${offset}`);
}

export async function fetchRoast(id: string): Promise<RoastDetail> {
  return jsonFetch(`/api/roasts/${id}`);
}

export async function fetchSamples(id: string): Promise<{
  id: string;
  samples: Array<{ timestampMs: number; beanTempC: number | null; exhaustTempC: number | null; ror: number | null }>;
}> {
  return jsonFetch(`/api/roasts/${id}/samples`);
}

export async function fetchAnalysis(id: string): Promise<{
  id: string;
  provider: string;
  modelName: string;
  summaryText: string;
  analysis: { developmentPct: number; rorStabilityScore: number; issues: string[]; recommendations: string[] };
  createdAt: string;
}> {
  return jsonFetch(`/api/roasts/${id}/analysis`);
}

export async function importRoast(file: File): Promise<ImportResult> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_URL}/api/roasts/import`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) {
    let errBody: { error?: string; code?: string } = {};
    try {
      errBody = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(res.status, errBody.error ?? `HTTP ${res.status}`, errBody.code);
  }
  return (await res.json()) as ImportResult;
}

export async function analyzeRoast(id: string): Promise<AnalysisResponse> {
  return jsonFetch(`/api/roasts/${id}/analyze`, { method: 'POST' });
}

export async function fetchHealth(): Promise<{ status: string; uptimeSec: number; aiServiceUrl: string }> {
  return jsonFetch('/api/health');
}

export { API_URL };
