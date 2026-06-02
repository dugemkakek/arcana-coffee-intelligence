// Smoke test for the Artisan JSON parser.

import { describe, it, expect } from 'vitest';
import { parseArtisanJson } from './artisan-json.js';

const sampleArtisanJson = JSON.stringify({
  mode: 'C',
  timeindex: [10, -1, 25, 30, -1, -1, 50, 60],
  timex: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
  temp1: [200, 100, 90, 120, 150, 175, 195, 205, 210, 212, 215, 218, 220],
  temp2: [220, 180, 160, 170, 185, 200, 210, 220, 225, 228, 230, 232, 235],
  delta1: [10, 8, 6, 5, 5, 6, 7, 8, 8, 7, 6, 5, 4],
  delta2: [12, 10, 8, 7, 7, 8, 9, 10, 10, 9, 8, 7, 6],
  specialevents: [2, 5, 8, 12],
  specialeventstype: [0, 1, 2, 6],
  specialeventsvalue: [0, 0, 0, 0],
  beans: 'Ethiopia Guji Natural',
  weight: [500, 420, 'g'],
  roastertype: 'VNT 2.5kg',
  operator: 'test-operator',
  roastisodate: '2026-06-01T10:00:00Z',
  totaltime: 600,
  weight_loss: 16.0,
});

describe('parseArtisanJson', () => {
  it('parses a valid Artisan export', () => {
    const result = parseArtisanJson(sampleArtisanJson);
    expect(result.source).toBe('artisan-json');
    expect(result.capturedAt).toBe('2026-06-01T10:00:00Z');
    expect(result.durationSec).toBe(600);
    expect(result.machine?.model).toBe('VNT 2.5kg');
    expect(result.machine?.manufacturer).toBe('VNT');
    expect(result.operator).toBe('test-operator');
    expect(result.greenWeightKg).toBeCloseTo(0.5, 5);
    expect(result.roastedWeightKg).toBeCloseTo(0.42, 5);
    expect(result.notes).toBe('Ethiopia Guji Natural');

    // Resampled to 1s grid: 0..60 inclusive = 61 samples
    expect(result.samples.length).toBe(61);
    expect(result.samples[0].t).toBe(0);
    expect(result.samples[60].t).toBe(60);
    expect(result.samples[10].bt).toBeCloseTo(90, 1);

    // Events: charge @ 10s, dry_end @ 25s, fc_start @ 40s, drop @ 60s
    expect(result.events).toHaveLength(4);
    expect(result.events.map((e) => e.type)).toEqual(['charge', 'dry_end', 'fc_start', 'drop']);
    expect(result.events[0].t).toBe(10);
    expect(result.events[3].t).toBe(60);
  });

  it('throws on invalid JSON', () => {
    expect(() => parseArtisanJson('not json')).toThrow(/parse failed/);
  });

  it('throws on non-roast profile (no timex)', () => {
    expect(() => parseArtisanJson(JSON.stringify({ beans: 'X' }))).toThrow(/no timex/);
  });

  it('extracts meta payload for round-tripping', () => {
    const result = parseArtisanJson(sampleArtisanJson);
    expect(result.meta?.weight_loss).toBe(16.0);
    expect(result.meta?.roastertype).toBe('VNT 2.5kg');
  });
});
