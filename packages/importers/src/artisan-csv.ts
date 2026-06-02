// @arcana/importers — Artisan CSV parser (stub).
//
// Real Artisan CSV export has a variable structure (date line, then a
// header row, then time / temp1 / temp2 / events). Implementing the
// full parser is deferred to v0.2 — the JSON path covers v0.1.
//
// This stub returns a clear error so users get a helpful message.

import type { RoastSessionImport } from './types.js';

export interface ParseArtisanCsvOptions {
  sourceFile?: string;
}

export function parseArtisanCsv(
  input: string | Buffer,
  _options: ParseArtisanCsvOptions = {},
): RoastSessionImport {
  const text = typeof input === 'string' ? input : input.toString('utf-8');
  const firstLine = text.split(/\r?\n/, 1)[0] ?? '';

  throw new Error(
    'Artisan CSV import is not yet implemented in v0.1. ' +
      'Please re-export from Artisan using File → Export → "Artisan JSON (.json)" — ' +
      'that format is fully supported. (Detected CSV header: "' +
      firstLine.slice(0, 80) +
      '…")',
  );
}
