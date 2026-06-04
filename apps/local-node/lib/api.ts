// Centralized API client for the Next.js UI.

import type { RoastSummary, RoastDetail, ImportResult, AnalysisResponse } from '../src/shared/api';

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

// =================================================================
// v0.3: inventory + products + plan
// =================================================================

export interface GreenLot {
  id: string;
  code: string;
  name: string;
  originCountry: string | null;
  region: string | null;
  farm: string | null;
  variety: string | null;
  process: string | null;
  initialStockKg: number;
  currentStockKg: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  movements?: Array<{ createdAt: string; type: string; quantityKg: number }>;
}

export interface GreenMovement {
  id: string;
  greenLotId: string;
  type: 'inbound' | 'adjustment' | 'transfer';
  quantityKg: number;
  fromLocationId: string | null;
  toLocationId: string | null;
  reason: string | null;
  createdAt: string;
}

export interface RoastedInventoryRow {
  id: string;
  productId: string;
  locationId: string;
  onHandKg: number;
  updatedAt: string;
  product: { id: string; code: string; name: string; roastStyle: string | null; active: boolean };
  location: { id: string; name: string };
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  roastStyle: string | null;
  defaultBatchSizeKg: number | null;
  active: boolean;
}

export interface PlanDigest {
  lowStock: Array<{
    inventoryId: string;
    productId: string;
    productName: string;
    productCode: string;
    roastStyle: string | null;
    location: string;
    onHandKg: number;
    thresholdKg: number;
  }>;
  fifo: Array<{
    greenLotId: string;
    code: string;
    name: string;
    currentStockKg: number;
    daysOld: number;
  }>;
  recentRoasts: Array<{
    id: string;
    roastDate: string;
    source: string;
    greenLot: { id: string; name: string; code: string };
    machine: { id: string; name: string } | null;
    greenWeightKg: number | null;
    roastedWeightKg: number | null;
  }>;
  generatedAt: string;
}

export async function fetchGreenLots(): Promise<{ lots: GreenLot[] }> {
  return jsonFetch('/api/inventory/green');
}

export async function fetchGreenMovements(lotId: string): Promise<{ movements: GreenMovement[] }> {
  return jsonFetch(`/api/inventory/green/${lotId}/movements`);
}

export async function addGreenLot(body: {
  code: string;
  name: string;
  originCountry?: string;
  region?: string;
  farm?: string;
  variety?: string;
  process?: string;
  initialStockKg: number;
}): Promise<GreenLot> {
  return jsonFetch('/api/inventory/green', { method: 'POST', body: JSON.stringify(body) });
}

export async function addGreenMovement(
  lotId: string,
  body: {
    type: 'inbound' | 'adjustment' | 'transfer';
    quantityKg: number;
    fromLocationId?: string;
    toLocationId?: string;
    reason?: string;
  },
): Promise<{ movement: GreenMovement; lot: GreenLot }> {
  return jsonFetch(`/api/inventory/green/${lotId}/movement`, { method: 'POST', body: JSON.stringify(body) });
}

export async function fetchRoastedInventory(): Promise<{ items: RoastedInventoryRow[] }> {
  return jsonFetch('/api/inventory/roasted');
}

export async function adjustRoasted(body: {
  productId: string;
  locationId: string;
  deltaKg: number;
  reason: 'roast_batch' | 'sale_sync' | 'writeoff' | 'manual_adjustment';
  refId?: string;
}): Promise<{ adjustment: { id: string }; inventory: RoastedInventoryRow }> {
  return jsonFetch('/api/inventory/roasted/adjustment', { method: 'POST', body: JSON.stringify(body) });
}

export async function fetchProducts(): Promise<{ products: Product[] }> {
  return jsonFetch('/api/products');
}

export async function addProduct(body: {
  code: string;
  name: string;
  description?: string;
  roastStyle?: 'light' | 'medium' | 'dark';
  defaultBatchSizeKg?: number;
}): Promise<Product> {
  return jsonFetch('/api/products', { method: 'POST', body: JSON.stringify(body) });
}

export async function fetchPlan(): Promise<PlanDigest> {
  return jsonFetch('/api/plan');
}

export { API_URL };
