'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  fetchGreenLots,
  fetchRoastedInventory,
  fetchProducts,
  type GreenLot,
  type Product,
  type RoastedInventoryRow,
} from '@/lib/api';
import { Stat } from '@/components/Stat';
import { AddGreenLotForm } from '@/components/AddGreenLotForm';
import { AddProductForm } from '@/components/AddProductForm';
import { AdjustRoastedForm } from '@/components/AdjustRoastedForm';

type Tab = 'green' | 'roasted';

function statusBadge(status: string) {
  const color =
    status === 'active'
      ? 'bg-bean-100 text-bean-700'
      : status === 'finished'
      ? 'bg-roast-100 text-roast-700'
      : 'bg-bean-200 text-bean-500';
  return <span className={`text-xs font-medium px-2 py-0.5 rounded ${color}`}>{status}</span>;
}

function GreenTable({ lots }: { lots: GreenLot[] }) {
  if (lots.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-bean-600 mb-4">No green lots yet.</p>
        <p className="text-xs text-bean-500">Add your first lot above to start tracking inventory.</p>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden p-0">
      <table className="w-full">
        <thead className="bg-bean-100 text-left text-sm">
          <tr>
            <th className="px-6 py-3">Code</th>
            <th className="px-6 py-3">Name / origin</th>
            <th className="px-6 py-3">Variety / process</th>
            <th className="px-6 py-3">Stock (kg)</th>
            <th className="px-6 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {lots.map((lot) => {
            const pct = lot.initialStockKg > 0 ? Math.min(100, (lot.currentStockKg / lot.initialStockKg) * 100) : 0;
            return (
              <tr key={lot.id} className="border-t border-bean-100 hover:bg-bean-50">
                <td className="px-6 py-3 font-mono text-sm">{lot.code}</td>
                <td className="px-6 py-3">
                  <div className="font-medium">{lot.name}</div>
                  <div className="text-xs text-bean-500">
                    {[lot.originCountry, lot.region, lot.farm].filter(Boolean).join(' · ')}
                  </div>
                </td>
                <td className="px-6 py-3 text-sm text-bean-700">
                  {[lot.variety, lot.process].filter(Boolean).join(' · ') || <span className="text-bean-400">—</span>}
                </td>
                <td className="px-6 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium tabular-nums">
                      {lot.currentStockKg.toFixed(2)} <span className="text-xs text-bean-500">/ {lot.initialStockKg.toFixed(2)}</span>
                    </span>
                  </div>
                  <div className="mt-1 h-1 w-24 bg-bean-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-roast-500"
                      style={{ width: `${pct}%` }}
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </td>
                <td className="px-6 py-3">{statusBadge(lot.status)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RoastedTable({ rows }: { rows: RoastedInventoryRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-bean-600 mb-4">No roasted stock recorded yet.</p>
        <p className="text-xs text-bean-500">Add a product and record a manual adjustment below to get started.</p>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden p-0">
      <table className="w-full">
        <thead className="bg-bean-100 text-left text-sm">
          <tr>
            <th className="px-6 py-3">Product</th>
            <th className="px-6 py-3">Style</th>
            <th className="px-6 py-3">On hand (kg)</th>
            <th className="px-6 py-3">Location</th>
            <th className="px-6 py-3">Updated</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-bean-100 hover:bg-bean-50">
              <td className="px-6 py-3">
                <div className="font-medium">{r.product.name}</div>
                <div className="text-xs text-bean-500 font-mono">{r.product.code}</div>
              </td>
              <td className="px-6 py-3 text-sm capitalize">{r.product.roastStyle ?? <span className="text-bean-400">—</span>}</td>
              <td className="px-6 py-3 text-sm tabular-nums font-medium">{r.onHandKg.toFixed(2)}</td>
              <td className="px-6 py-3 text-sm">{r.location.name}</td>
              <td className="px-6 py-3 text-xs text-bean-500">
                {new Date(r.updatedAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function InventoryTabs({
  initialGreen,
  initialRoasted,
  initialProducts,
  initialLocations,
}: {
  initialGreen: { lots: GreenLot[] };
  initialRoasted: { items: RoastedInventoryRow[] };
  initialProducts: { products: Product[] };
  initialLocations: Array<{ id: string; name: string }>;
}) {
  const [tab, setTab] = useState<Tab>('green');
  const [addingLot, setAddingLot] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);

  const green = useQuery({
    queryKey: ['green-lots'],
    queryFn: fetchGreenLots,
    initialData: initialGreen,
  });
  const roasted = useQuery({
    queryKey: ['roasted-inventory'],
    queryFn: fetchRoastedInventory,
    initialData: initialRoasted,
  });
  const products = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    initialData: initialProducts,
  });

  const locations = initialLocations;

  const totalGreenKg = (green.data?.lots ?? []).reduce((s, l) => s + l.currentStockKg, 0);
  const activeLots = (green.data?.lots ?? []).filter((l) => l.status === 'active').length;
  const totalRoastedKg = (roasted.data?.items ?? []).reduce((s, r) => s + r.onHandKg, 0);
  const productCount = (products.data?.products ?? []).filter((p) => p.active).length;

  return (
    <div className="space-y-6">
      {/* Summary tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Green on hand" value={`${totalGreenKg.toFixed(1)} kg`} />
        <Stat label="Active green lots" value={String(activeLots)} />
        <Stat label="Roasted on hand" value={`${totalRoastedKg.toFixed(1)} kg`} />
        <Stat label="Active products" value={String(productCount)} />
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-bean-200">
        <button
          onClick={() => setTab('green')}
          aria-current={tab === 'green' ? 'page' : undefined}
          className={[
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
            tab === 'green' ? 'border-roast-500 text-roast-700' : 'border-transparent text-bean-600 hover:text-bean-900',
          ].join(' ')}
        >
          🌱 Green
        </button>
        <button
          onClick={() => setTab('roasted')}
          aria-current={tab === 'roasted' ? 'page' : undefined}
          className={[
            'px-4 py-2 text-sm font-medium border-b-2 -mb-px',
            tab === 'roasted' ? 'border-roast-500 text-roast-700' : 'border-transparent text-bean-600 hover:text-bean-900',
          ].join(' ')}
        >
          ☕ Roasted
        </button>
      </div>

      {tab === 'green' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Green coffee lots</h2>
            {!addingLot && (
              <button className="btn-primary" onClick={() => setAddingLot(true)}>
                + Add lot
              </button>
            )}
          </div>
          {addingLot && <AddGreenLotForm onClose={() => setAddingLot(false)} />}
          {green.isLoading && <p className="text-bean-600">Loading…</p>}
          {green.isError && (
            <div className="card border-roast-500 bg-roast-50">
              <p className="text-roast-700 font-medium">Failed to load green lots</p>
              <p className="text-xs text-bean-500 mt-2">{(green.error as Error).message}</p>
            </div>
          )}
          {green.data && <GreenTable lots={green.data.lots} />}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Roasted inventory</h2>
            {!addingProduct && (
              <button className="btn-secondary" onClick={() => setAddingProduct(true)}>
                + Add product
              </button>
            )}
          </div>
          {addingProduct && <AddProductForm onClose={() => setAddingProduct(false)} />}

          {roasted.isLoading && <p className="text-bean-600">Loading…</p>}
          {roasted.isError && (
            <div className="card border-roast-500 bg-roast-50">
              <p className="text-roast-700 font-medium">Failed to load roasted inventory</p>
              <p className="text-xs text-bean-500 mt-2">{(roasted.error as Error).message}</p>
            </div>
          )}
          {roasted.data && (
            <RoastedTable rows={roasted.data.items} />
          )}

          {/* Manual adjustment form is always visible at the bottom of the Roasted tab. */}
          {products.data && products.data.products.length > 0 && locations.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-bean-900">Manual adjustment</h3>
              <AdjustRoastedForm products={products.data.products} locations={locations} />
            </div>
          ) : (
            <div className="card bg-bean-100 text-sm text-bean-700">
              Add at least one product and one location before recording an adjustment.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
