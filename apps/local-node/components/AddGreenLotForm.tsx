// Inline form for adding a new green lot. Client component. Uses React Query
// mutation. On success, invalidates the ['green-lots'] and ['plan'] queries
// so the inventory list and the plan digest both refresh.

'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addGreenLot, ApiError } from '@/lib/api';

export function AddGreenLotForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    code: '',
    name: '',
    originCountry: 'ID',
    region: '',
    farm: '',
    variety: '',
    process: '',
    initialStockKg: '',
  });
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      addGreenLot({
        code: form.code.trim(),
        name: form.name.trim(),
        originCountry: form.originCountry.trim() || undefined,
        region: form.region.trim() || undefined,
        farm: form.farm.trim() || undefined,
        variety: form.variety.trim() || undefined,
        process: form.process.trim() || undefined,
        initialStockKg: Number(form.initialStockKg),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['green-lots'] });
      qc.invalidateQueries({ queryKey: ['plan'] });
      onClose();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : (e as Error).message),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const canSubmit = form.code.trim() && form.name.trim() && Number(form.initialStockKg) >= 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        mut.mutate();
      }}
      className="card bg-bean-50 space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label">Code *</label>
          <input className="input font-mono" placeholder="GAYO-001" value={form.code} onChange={set('code')} required />
        </div>
        <div>
          <label className="label">Name *</label>
          <input className="input" placeholder="Gayo Wine Process" value={form.name} onChange={set('name')} required />
        </div>
        <div>
          <label className="label">Origin country</label>
          <input className="input" value={form.originCountry} onChange={set('originCountry')} maxLength={2} />
        </div>
        <div>
          <label className="label">Region</label>
          <input className="input" placeholder="Aceh" value={form.region} onChange={set('region')} />
        </div>
        <div>
          <label className="label">Farm</label>
          <input className="input" value={form.farm} onChange={set('farm')} />
        </div>
        <div>
          <label className="label">Variety</label>
          <input className="input" placeholder="Typica, Bourbon, …" value={form.variety} onChange={set('variety')} />
        </div>
        <div>
          <label className="label">Process</label>
          <input className="input" placeholder="Washed, Natural, Honey, Giling Basah" value={form.process} onChange={set('process')} />
        </div>
        <div>
          <label className="label">Initial stock (kg) *</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            value={form.initialStockKg}
            onChange={set('initialStockKg')}
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-roast-700">⚠ {error}</p>}

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={mut.isPending}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={!canSubmit || mut.isPending}>
          {mut.isPending ? 'Saving…' : 'Add lot'}
        </button>
      </div>
    </form>
  );
}
