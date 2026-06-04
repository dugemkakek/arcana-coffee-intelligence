// Inline form for adding a new Product. Used on the Inventory page Roasted
// tab so the user can register a SKU (e.g. "Espresso Blend", "Sumatra Single")
// before they can have roasted stock for it.

'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addProduct, ApiError } from '@/lib/api';

export function AddProductForm({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    roastStyle: 'medium' as 'light' | 'medium' | 'dark',
    defaultBatchSizeKg: '',
  });
  const [error, setError] = useState<string | null>(null);

  const mut = useMutation({
    mutationFn: () =>
      addProduct({
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        roastStyle: form.roastStyle,
        defaultBatchSizeKg: form.defaultBatchSizeKg ? Number(form.defaultBatchSizeKg) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['plan'] });
      onClose();
    },
    onError: (e) => setError(e instanceof ApiError ? e.message : (e as Error).message),
  });

  const canSubmit = form.code.trim() && form.name.trim();

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
          <input className="input font-mono" placeholder="ESP-BLEND-01" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Name *</label>
          <input className="input" placeholder="Arcana Espresso Blend" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </div>
        <div>
          <label className="label">Roast style</label>
          <select className="input" value={form.roastStyle} onChange={(e) => setForm((f) => ({ ...f, roastStyle: e.target.value as 'light' | 'medium' | 'dark' }))}>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <label className="label">Default batch (kg)</label>
          <input
            className="input"
            type="number"
            step="0.01"
            min="0"
            placeholder="2.5"
            value={form.defaultBatchSizeKg}
            onChange={(e) => setForm((f) => ({ ...f, defaultBatchSizeKg: e.target.value }))}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">Description</label>
          <input className="input" placeholder="Notes about the blend" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>
      </div>

      {error && <p className="text-sm text-roast-700">⚠ {error}</p>}

      <div className="flex gap-2 justify-end pt-1">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={mut.isPending}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={!canSubmit || mut.isPending}>
          {mut.isPending ? 'Saving…' : 'Add product'}
        </button>
      </div>
    </form>
  );
}
