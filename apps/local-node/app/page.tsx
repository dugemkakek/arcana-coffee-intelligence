'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchRoasts, API_URL } from '@/lib/api';

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['roasts'],
    queryFn: () => fetchRoasts(50, 0),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2>Roasts</h2>
        <div className="flex gap-2">
          <Link href="/roasts/live" className="btn-secondary">
            🔴 Live
          </Link>
          <Link href="/import" className="btn-primary">
            + Import Roast
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-bean-600">Loading roasts…</p>}

      {error && (
        <div className="card border-roast-500 bg-roast-50">
          <p className="text-roast-700 font-medium">Failed to load roasts</p>
          <p className="text-sm text-bean-700 mt-1">
            Is the API running at <code className="font-mono">{API_URL}</code>?
          </p>
          <p className="text-xs text-bean-500 mt-2">{(error as Error).message}</p>
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-bean-600 mb-4">No roasts yet.</p>
          <Link href="/import" className="btn-primary">
            Import your first Artisan export
          </Link>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-bean-100 text-left text-sm">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Bean / lot</th>
                <th className="px-6 py-3">Weight (g)</th>
                <th className="px-6 py-3">Source</th>
                <th className="px-6 py-3">AI</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id} className="border-t border-bean-100 hover:bg-bean-50">
                  <td className="px-6 py-3 text-sm">
                    {new Date(r.roastDate).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <div className="font-medium">{r.greenLot.name}</div>
                    <div className="text-xs text-bean-500 font-mono">{r.greenLot.code}</div>
                  </td>
                  <td className="px-6 py-3 text-sm">
                    {r.greenWeightKg != null && r.roastedWeightKg != null
                      ? `${(r.greenWeightKg * 1000).toFixed(0)} → ${(r.roastedWeightKg * 1000).toFixed(0)}`
                      : '—'}
                  </td>
                  <td className="px-6 py-3 text-xs text-bean-600">
                    {r.source}
                    {r.sourceFile && (
                      <div className="font-mono text-bean-400">{r.sourceFile}</div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-xs">
                    {r.aiAnalyses.length > 0 ? (
                      <span className="text-roast-700 font-medium">✓ analyzed</span>
                    ) : (
                      <span className="text-bean-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <Link href={`/roasts/${r.id}`} className="text-roast-600 hover:text-roast-700 text-sm font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
