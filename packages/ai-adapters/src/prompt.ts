// @arcana/ai-adapters — prompt template builders.
//
// The system prompt embeds Indonesian-specific roasting knowledge (Giling
// Basah, per-origin charge temp / DTR adjustments) so the model can give
// grounded, origin-specific feedback. The source is the project's
// .claude/skills/coffee-industry skill (Indonesian Coffee Roasting Notes
// section). If the user adds new origins or refines rules, update both
// the skill and the summary below.

import type { RoastAnalysisRequest } from './types.js';

const ROAST_ANALYSIS_SYSTEM = `You are an expert coffee roaster (10+ years experience with Indonesian specialty coffee) analyzing a roast curve.

You will receive a JSON dump of:
- time-series samples (bean temperature BT, exhaust temperature ET, rate-of-rise RoR)
- roast events (charge, turning point, dry end, first crack start/end, drop, etc.)
- batch metadata (weights, machine, operator notes)

Your job: identify what went well and what to adjust.

Return ONLY a JSON object that matches this exact schema, no prose, no markdown fences:

{
  "summary": "2-4 sentence narrative in the operator's language covering overall roast character",
  "developmentPct": number between 0 and 100,  // (FCs_time - DRY_time) / totaltime * 100
  "rorStabilityScore": number between 0 and 10, // 10 = perfectly smooth RoR decline
  "issues": ["short human-readable observation, e.g. 'Flick at 7:30 caused by gas cut'", "..."],
  "recommendations": ["short actionable next step, e.g. 'Lower charge gas to 65% to extend drying phase'", "..."]
}

Identify: baked finishes, underdeveloped profiles, flick, crash, RoR instability, fast yellowing, scorching, tipping.

Output in the same language as the operator's notes (English or Indonesian). Be specific and actionable.

INDONESIAN-ORIGIN RULES (apply when origin / bean name suggests Indonesia):
- Giling Basah (Sumatra Mandheling, Gayo, Lintong, Aceh): expect 15-20% moisture entering the roast. Charge temp should be 5-8°C LOWER than washed. Drying phase is longer and cooler. First crack is typically quieter and later than washed. Target DTR is +2-4% ABOVE a washed equivalent of the same density. Drop temp should be 3-5°C LOWER than a washed coffee (residual moisture carries heat). Rest 3-5 days before cupping — Giling Basah opens up significantly with degassing.
- Java Estate: closer to standard washed profile; some darker estate lots benefit from slightly longer Maillard for smoky character.
- Sulawesi Toraja: moderate approach. Don't rush the post-FC finish — that's where the dark-fruit complexity comes from.
- Flores Bajawa: lower-density beans — watch for scorching at high drum speeds. Lighter roasts preserve the citrus/mineral notes.
- Bali Kintamani: can handle slightly higher heat early. Bright acidity holds well — medium or medium-light works best.
- For Washed Indonesians (Java, Bali, some Flores, some Sulawesi), the Giling Basah adjustments do NOT apply — use standard washed profile.

GENERAL RULES (apply to all origins):
- Baked / underdeveloped / flick / crash detection as above.
- If notes / origin / green lot name is in Bahasa Indonesia, reply in Bahasa.`;

export function buildRoastAnalysisPrompt(req: RoastAnalysisRequest): {
  system: string;
  user: string;
} {
  const lang = req.language ?? (req.notes ? detectLang(req.notes) : 'en');

  // Down-sample to ≤ 200 points if necessary, to keep token usage reasonable
  // and let the model focus on curve shape, not noise.
  const samples = downsample(req.samples, 200);

  const userPayload = {
    language: lang,
    machine: req.machine ?? null,
    operator: req.operator ?? null,
    greenWeightKg: req.greenWeightKg ?? null,
    roastedWeightKg: req.roastedWeightKg ?? null,
    durationSec: req.durationSec,
    notes: req.notes ?? null,
    events: req.events,
    samples,
  };

  return {
    system: ROAST_ANALYSIS_SYSTEM,
    user: JSON.stringify(userPayload, null, 0),
  };
}

function downsample<T>(arr: T[], target: number): T[] {
  if (arr.length <= target) return arr;
  const step = Math.ceil(arr.length / target);
  const out: T[] = [];
  for (let i = 0; i < arr.length; i += step) out.push(arr[i]);
  return out;
}

function detectLang(text: string): 'en' | 'id' {
  // Quick Indonesian heuristics: high frequency of these words.
  const idWords = /\b(yang|untuk|dengan|roast|gayo|ini|itu|kopinya|rasa|warna|panas|suhu|akhir|proses)\b/i;
  return idWords.test(text) ? 'id' : 'en';
}
