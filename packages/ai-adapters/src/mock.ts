// @arcana/ai-adapters — Mock provider.
//
// A deterministic, no-network "AI" that derives basic stats from the
// sample series. Use this to demo the full import -> analyze -> display
// flow without configuring an LLM provider, or in CI / offline tests.
//
// Produces plausible-looking analysis by:
//   - computing development % from charge -> FC start vs total time
//   - computing RoR stability from rolling variance
//   - generating canned issues/recommendations based on observed patterns

import type { AIProvider, RoastAnalysisRequest, RoastAnalysisResponse } from './types.js';
import type { AIProviderName } from '@arcana/shared-types';

export class MockAdapter implements AIProvider {
  readonly name: AIProviderName = 'mock';
  readonly modelName = 'mock-stats-v1';

  async analyzeRoast(req: RoastAnalysisRequest): Promise<RoastAnalysisResponse> {
    // Simulate a tiny amount of work so the UI shows the "Analyzing..." state
    await new Promise((r) => setTimeout(r, 400));

    const start = Date.now();
    const samples = req.samples;
    const events = req.events;

    // ---- 1) Development %: charge -> FC start, as fraction of total ----
    const charge = events.find((e) => e.type === 'charge')?.t ?? 0;
    const fcStart = events.find((e) => e.type === 'fc_start')?.t ?? null;
    const drop = events.find((e) => e.type === 'drop')?.t ?? req.durationSec;
    const totalSec = Math.max(1, drop - charge);
    const devPct =
      fcStart != null ? Math.max(0, Math.min(100, ((fcStart - charge) / totalSec) * 100)) : 0;

    // ---- 2) RoR stability: std-dev of (BT[i+1] - BT[i]) across the curve ----
    const rorDeltas: number[] = [];
    for (let i = 1; i < samples.length; i++) {
      const dt = samples[i].t - samples[i - 1].t;
      if (dt <= 0) continue;
      const dBT = samples[i].bt - samples[i - 1].bt;
      rorDeltas.push((dBT / dt) * 60); // °C/min
    }
    const mean = rorDeltas.reduce((a, b) => a + b, 0) / Math.max(1, rorDeltas.length);
    const variance = rorDeltas.reduce((acc, x) => acc + (x - mean) ** 2, 0) / Math.max(1, rorDeltas.length);
    const stdDev = Math.sqrt(variance);
    // 0..10 scale: stddev of 0 = 10/10, stddev of 5+ = 0/10
    const rorStabilityScore = Math.max(0, Math.min(10, 10 - stdDev * 2));

    // ---- 3) Issues & recommendations based on heuristics ----
    const issues: string[] = [];
    const recommendations: string[] = [];

    if (devPct < 18) {
      issues.push(`Underdeveloped profile — development time is only ${devPct.toFixed(1)}% (target 18–22% for most filter roasts).`);
      recommendations.push('Extend the development phase by ~30s before drop, or push FC start earlier by ~15s.');
    } else if (devPct > 25) {
      issues.push(`Extended development (${devPct.toFixed(1)}%) — risk of baked finish and muted acidity.`);
      recommendations.push('Pull drop earlier by ~15s on the next attempt; consider dropping at start of FC + 1:00 instead of +1:30.');
    } else {
      issues.push(`Development phase on target (${devPct.toFixed(1)}%).`);
    }

    if (rorStabilityScore < 5) {
      issues.push(`RoR is unstable (stability ${rorStabilityScore.toFixed(1)}/10). Likely a flick or crash in the Maillard phase.`);
      recommendations.push('Smooth gas reductions by 5% per step instead of 10% cuts; add 200g more charge weight if drum is under-loaded.');
    } else if (rorStabilityScore >= 8) {
      issues.push(`Excellent RoR stability (${rorStabilityScore.toFixed(1)}/10) — clean declining curve.`);
    }

    // Peak BT check
    const peakBT = samples.reduce((m, s) => Math.max(m, s.bt), 0);
    if (peakBT > 230) {
      issues.push(`High peak bean temperature (${peakBT.toFixed(1)}°C) — approaching second crack territory.`);
    }
    if (peakBT < 195) {
      issues.push(`Peak bean temp is low (${peakBT.toFixed(1)}°C) — profile may be under-roasted for the intended style.`);
    }

    if (issues.length === 0) {
      issues.push('No major issues detected — solid execution.');
    }
    if (recommendations.length === 0) {
      recommendations.push('Repeat this profile and log cupping notes — a strong candidate for the reference library.');
    }

    // ---- 4) Summary narrative ----
    const summary = [
      `Mock analysis of a ${(req.durationSec / 60).toFixed(1)}-min roast${req.machine ? ` on a ${req.machine.manufacturer} ${req.machine.model}` : ''}.`,
      `Development was ${devPct.toFixed(1)}% (target 18–22%) with RoR stability ${rorStabilityScore.toFixed(1)}/10.`,
      `Peak BT reached ${peakBT.toFixed(1)}°C.`,
      `${issues.length === 1 && issues[0].startsWith('No major') ? 'Overall execution looks clean.' : `${issues.length} observation(s) and ${recommendations.length} recommendation(s) below.`}`,
    ].join(' ');

    return {
      summary,
      developmentPct: +devPct.toFixed(2),
      rorStabilityScore: +rorStabilityScore.toFixed(2),
      issues,
      recommendations,
      provider: this.name,
      modelName: this.modelName,
      tokensUsed: { prompt: 0, completion: 0, total: 0 },
      latencyMs: Date.now() - start,
    };
  }
}
