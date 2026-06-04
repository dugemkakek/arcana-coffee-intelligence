// @arcana/local-node — Plan page (v0.3).
//
// Server component. Fetches /api/plan server-side (no-store) and renders the
// three digest cards: stock alerts, FIFO green-lot suggestion, recent roasts.
// Hardcoded 1.0 kg low-stock threshold lives in the API; we don't duplicate
// it in the UI.

import Link from 'next/link';
import { API_URL, type PlanDigest } from '@/lib/api';

async function fetchPlan(): Promise<PlanDigest | null> {
  try {
    const res = await fetch(`${API_URL}/api/plan`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as PlanDigest;
  } catch {
    return null;
  }
}

function fmtKg(kg: number): string {
  return `${kg.toFixed(2)} kg`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export default async function PlanPage() {
  const plan = await fetchPlan();

  return (
    <div className="space-y-6">
      <div>
        <h2>Plan</h2>
        <p className="text-sm text-bean-500">
          What to roast next, based on your stock and recent activity.
        </p>
      </div>

      {!plan ? (
        <div className="card border-roast-500 bg-roast-50">
          <p className="text-roast-700 font-medium">Failed to load plan digest</p>
          <p className="text-xs text-bean-500 mt-2">
            Make sure the local-node API is running and reachable.
          </p>
        </div>
      ) : (
        <>
          {/* Card 1: stock alerts */}
          <section className="card space-y-3">
            <header className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-bean-900">⚠ Stock alerts</h3>
              <span className="text-xs text-bean-500">
                threshold: {plan.lowStock[0]?.thresholdKg.toFixed(2) ?? '1.00'} kg
              </span>
            </header>
            {plan.lowStock.length === 0 ? (
              <p className="text-sm text-bean-600">All roasted products are above the low-stock threshold.</p>
            ) : (
              <ul className="divide-y divide-bean-100">
                {plan.lowStock.map((row) => (
                  <li key={row.inventoryId} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{row.productName}</div>
                      <div className="text-xs text-bean-500">
                        <span className="font-mono">{row.productCode}</span>
                        {row.roastStyle && <> · <span className="capitalize">{row.roastStyle}</span></>}
                        <> · {row.location}</>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-roast-700 font-semibold tabular-nums">{fmtKg(row.onHandKg)}</div>
                      <Link href="/inventory" className="text-xs text-roast-600 hover:text-roast-700 font-medium">
                        Restock →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Card 2: FIFO suggestion */}
          <section className="card space-y-3">
            <header className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-bean-900">🌱 Roast next (FIFO)</h3>
              <span className="text-xs text-bean-500">oldest {plan.fifo.length} active green {plan.fifo.length === 1 ? 'lot' : 'lots'}</span>
            </header>
            {plan.fifo.length === 0 ? (
              <p className="text-sm text-bean-600">No active green lots. Add one from the Inventory page to get a FIFO suggestion.</p>
            ) : (
              <ul className="divide-y divide-bean-100">
                {plan.fifo.map((lot) => (
                  <li key={lot.greenLotId} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{lot.name}</div>
                      <div className="text-xs text-bean-500">
                        <span className="font-mono">{lot.code}</span> · {lot.daysOld} day{lot.daysOld === 1 ? '' : 's'} on hand
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold tabular-nums">{fmtKg(lot.currentStockKg)}</div>
                      <div className="text-xs text-bean-500">
                        oldest first
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Card 3: recent roasts */}
          <section className="card space-y-3">
            <header className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-bean-900">📜 Recent roasts</h3>
              <Link href="/" className="text-xs text-roast-600 hover:text-roast-700 font-medium">
                All roasts →
              </Link>
            </header>
            {plan.recentRoasts.length === 0 ? (
              <p className="text-sm text-bean-600">No roasts recorded yet.</p>
            ) : (
              <ul className="divide-y divide-bean-100">
                {plan.recentRoasts.map((r) => (
                  <li key={r.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium">{r.greenLot.name}</div>
                      <div className="text-xs text-bean-500">
                        {fmtDate(r.roastDate)} · <span className="font-mono">{r.source}</span>
                        {r.machine && <> · {r.machine.name}</>}
                      </div>
                    </div>
                    <div className="text-right text-xs text-bean-700">
                      {r.greenWeightKg != null && r.roastedWeightKg != null ? (
                        <>
                          {(r.greenWeightKg * 1000).toFixed(0)}g → {(r.roastedWeightKg * 1000).toFixed(0)}g
                        </>
                      ) : (
                        <span className="text-bean-400">—</span>
                      )}
                      <div>
                        <Link
                          href={`/roasts/${r.id}`}
                          className="text-roast-600 hover:text-roast-700 font-medium"
                        >
                          Open →
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-[11px] text-bean-400 text-right">
            Generated {new Date(plan.generatedAt).toLocaleString()}
          </p>
        </>
      )}
    </div>
  );
}
