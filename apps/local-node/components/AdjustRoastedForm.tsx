// Inline form for recording a manual delta against roasted inventory. On the
// Inventory page Roasted tab. Validates that product + location are picked.

'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adjustRoasted, ApiError, type Product, type RoastedInventoryRow } from '@/lib/api';

interface Props {
  products: Product[];
  // Distinct location list derived from the current roasted inventory.
  locations: Array<{ id: string; name: string }>;
  // Pre-selected (e.g. when user clicks "adjust" on a specific row). Optional.
  initialProductId?: string;
  initialLocationId?: string;
}

export function AdjustRoastedForm({ products, locations, initialProductId, initialLocationId }: Props) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    productId: initialProductId ?? (products[0]?.id ?? ''),
    locationId: initialLocationId ?? (locations[0]?.id ?? ''),
    deltaKg: '',
    reason: 'manual_adjustment' as 'roast_batch' | 'sale_sync' | 'writeoff' | 'manual_adjustment',
    refId: '',
  });
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      adjustRoasted({
        productId: form.productId,
        locationId: form.locationId,
        deltaKg: Number(form.deltaKg),
        reason: form.reason,
        refId: form.refId.trim() || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['roasted-inventory'] });
      qc.invalidateQueries({ queryKey: ['plan'] });
      setForm((f) => ({ ...f, deltaKg: '', refId: '' }));
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : (e as Error).message),
  });

  const canSubmit =
    form.productId &&
    form.locationId &&
    form.deltaKg.trim() !== '' &&
    Number.isFinite(Number(form.deltaKg)) &&
    Number(form.deltaKg) !== 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        mut.mutate();
      }}
      className="card bg-bean-50 space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="lg:col-span-2">
          <label className="label">Product</label>
          <select className="input" value={form.productId} onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))} required>
            <option value="" disabled>Select product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Location</label>
          <select className="input" value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))} required>
            <option value="" disabled>Select location…</option>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Δ kg (signed)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            placeholder="-0.25 or +5.0"
            value={form.deltaKg}
            onChange={(e) => setForm((f) => ({ ...f, deltaKg: e.target.value }))}
            required
          />
        </div>
        <div>
          <label className="label">Reason</label>
          <select
            className="input"
            value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value as typeof form.reason }))}
          >
            <option value="manual_adjustment">Manual adjustment</option>
            <option value="roast_batch">Roast batch landed</option>
            <option value="sale_sync">Sale sync</option>
            <option value="writeoff">Write-off</option>
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="label">Reference (optional)</label>
          <input className="input" placeholder="e.g. roaster log note" value={form.refId} onChange={(e) => setForm((f) => ({ ...f, refId: e.target.value }))} />
        </div>
      </div>

      {error && <p className="text-sm text-roast-700">⚠ {error}</p>}
      {mut.isSuccess && <p className="text-sm text-bean-600">✓ Adjustment recorded.</p>}

      <div className="flex gap-2 justify-end">
        <button type="submit" className="btn-primary" disabled={!canSubmit || mut.isPending}>
          {mut.isPending ? 'Saving…' : 'Record adjustment'}
        </button>
      </div>
    </form>
  );
}

// Suppress unused import warning for RoastedInventoryRow type-only usage.
export type { RoastedInventoryRow };
