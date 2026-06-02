'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchRoast, fetchAnalysis, analyzeRoast } from '@/lib/api';
import { RoastChart } from '@/components/RoastChart';
import { Stat } from '@/components/Stat';

export default function RoastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const roastQ = useQuery({ queryKey: ['roast', id], queryFn: () => fetchRoast(id) });
  const analysisQ = useQuery({
    queryKey: ['analysis', id],
    queryFn: () => fetchAnalysis(id),
    retry: false,
  });

  const analyzeMut = useMutation({
    mutationFn: () => analyzeRoast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analysis', id] });
      queryClient.invalidateQueries({ queryKey: ['roast', id] });
    },
  });

  if (roastQ.isLoading) {
    return (
      <div className="text-center py-16 text-bean-500">Loading roast…</div>
    );
  }
  if (roastQ.error) {
    return (
      <div className="card border-roast-500 bg-roast-50">
        <p className="text-roast-700 font-medium">Failed to load roast</p>
        <p className="text-sm text-bean-700 mt-1">{(roastQ.error as Error).message}</p>
      </div>
    );
  }
  const roast = roastQ.data;

  // --- Derived stats ----------------------------------------------------
  const eventMarkers = roast.events.map((e) => ({
    t: e.timestampMs / 1000,
    label: e.eventType,
  }));

  const findEvent = (t: string) => roast.events.find((e) => e.eventType === t);
  const chargeEvent = findEvent('charge');
  const dryEndEvent = findEvent('dry_end');
  const fcStartEvent = findEvent('fc_start');
  const dropEvent = findEvent('drop');

  const toSec = (e: { timestampMs: number } | undefined) => (e ? e.timestampMs / 1000 : null);
  const chargeSec = toSec(chargeEvent) ?? 0;
  const dropSec = toSec(dropEvent) ?? (roast.samplePoints.at(-1)?.timestampMs ?? 0) / 1000;
  const drySec = toSec(dryEndEvent);
  const fcSec = toSec(fcStartEvent);
  const totalSec = Math.max(1, dropSec - chargeSec);

  const dryingPct = drySec != null ? Math.max(0, ((drySec - chargeSec) / totalSec) * 100) : null;
  const maillardPct =
    drySec != null && fcSec != null ? Math.max(0, ((fcSec - drySec) / totalSec) * 100) : null;
  const devPct = fcSec != null ? Math.max(0, ((dropSec - fcSec) / totalSec) * 100) : null;

  const peakBT = roast.samplePoints.reduce(
    (m, s) => (s.beanTempC != null && s.beanTempC > m ? s.beanTempC : m),
    0,
  );

  const greenG = roast.greenWeightKg != null ? (roast.greenWeightKg * 1000).toFixed(0) : null;
  const roastedG = roast.roastedWeightKg != null ? (roast.roastedWeightKg * 1000).toFixed(0) : null;
  const lossPct =
    greenG && roastedG ? ((((+greenG) - +roastedG) / +greenG) * 100).toFixed(1) : null;

  const dateStr = new Date(roast.roastDate).toLocaleString();

  return (
    <div className="space-y-6">
      {/* ---------- Header strip ---------- */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-xs text-bean-500 hover:text-bean-700">
            ← All roasts
          </Link>
          <h1 className="text-3xl font-bold text-bean-900 mt-1 leading-tight">
            {roast.greenLot.name}
          </h1>
          <p className="text-sm text-bean-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <code className="font-mono text-xs text-bean-400">{roast.greenLot.code}</code>
            <span>·</span>
            <span>{dateStr}</span>
            {roast.machine && (
              <>
                <span>·</span>
                <span>{roast.machine.manufacturer} {roast.machine.model}</span>
              </>
            )}
            <span>·</span>
            <span className="px-1.5 py-0.5 rounded bg-bean-100 text-bean-700 text-[10px] font-semibold uppercase">
              {roast.source}
            </span>
            {roast.sourceFile && (
              <>
                <span>·</span>
                <code className="font-mono text-xs text-bean-400">{roast.sourceFile}</code>
              </>
            )}
          </p>
        </div>
        <button
          onClick={() => analyzeMut.mutate()}
          disabled={analyzeMut.isPending}
          className="btn-primary shrink-0"
        >
          {analyzeMut.isPending ? 'Analyzing…' : analysisQ.data ? 'Re-analyze' : '🤖 Analyze with AI'}
        </button>
      </div>

      {/* ---------- KPI tiles ---------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Weight in → out"
          value={greenG && roastedG ? `${greenG}→${roastedG}` : '—'}
          unit="g"
          sub={lossPct ? `loss ${lossPct}%` : undefined}
          accent="bean"
        />
        <Stat
          label="Total time"
          value={formatMinSec(totalSec)}
          accent="default"
          sub={chargeEvent ? `from ${formatMinSec(chargeSec)}` : undefined}
        />
        <Stat
          label="Peak bean temp"
          value={peakBT ? peakBT.toFixed(0) : '—'}
          unit="°C"
          accent="roast"
        />
        <Stat
          label="Dev time ratio"
          value={
            analysisQ.data
              ? `${analysisQ.data.analysis.developmentPct.toFixed(0)}%`
              : devPct != null
                ? `${devPct.toFixed(0)}%`
                : '—'
          }
          sub="after first crack"
          accent="roast"
        />
      </div>

      {/* ---------- Phase breakdown ---------- */}
      <div className="card !p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-bean-900">Roast phases</h2>
          <div className="text-xs text-bean-500">
            based on {roast.events.length} event{roast.events.length === 1 ? '' : 's'}
          </div>
        </div>
        <div className="flex h-8 rounded-md overflow-hidden border border-bean-100">
          {dryingPct != null && (
            <div
              className="bg-roast-200 flex items-center justify-center text-[11px] font-semibold text-roast-800"
              style={{ width: `${dryingPct}%` }}
              title={`Drying ${dryingPct.toFixed(1)}%`}
            >
              {dryingPct > 12 ? `Drying ${dryingPct.toFixed(0)}%` : ''}
            </div>
          )}
          {maillardPct != null && (
            <div
              className="bg-roast-400 flex items-center justify-center text-[11px] font-semibold text-white"
              style={{ width: `${maillardPct}%` }}
              title={`Maillard ${maillardPct.toFixed(1)}%`}
            >
              {maillardPct > 8 ? `Maillard ${maillardPct.toFixed(0)}%` : ''}
            </div>
          )}
          {devPct != null && (
            <div
              className="bg-bean-700 flex items-center justify-center text-[11px] font-semibold text-bean-50"
              style={{ width: `${devPct}%` }}
              title={`Development ${devPct.toFixed(1)}%`}
            >
              {devPct > 8 ? `Dev ${devPct.toFixed(0)}%` : ''}
            </div>
          )}
          {dryingPct == null && maillardPct == null && devPct == null && (
            <div className="w-full bg-bean-100 flex items-center justify-center text-xs text-bean-500">
              No events to break down
            </div>
          )}
        </div>
        <div className="flex justify-between text-[11px] text-bean-500 mt-1.5 px-0.5">
          <span>CHARGE</span>
          <span>{drySec != null ? 'DRY' : '—'}</span>
          <span>{fcSec != null ? 'FC' : '—'}</span>
          <span>DROP</span>
        </div>
      </div>

      {/* ---------- Roast curve ---------- */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-semibold text-bean-900">Roast curve</h2>
          <div className="text-xs text-bean-500">
            {roast.samplePoints.length} samples
          </div>
        </div>
        <RoastChart samples={roast.samplePoints} events={eventMarkers} />
      </div>

      {/* ---------- Two-column row: events + AI analysis ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Events */}
        <div className="card">
          <h2 className="text-base font-semibold text-bean-900 mb-3">Events</h2>
          {roast.events.length === 0 ? (
            <p className="text-sm text-bean-500">No events recorded.</p>
          ) : (
            <ul className="text-sm divide-y divide-bean-100">
              {roast.events.map((e) => (
                <li key={e.id} className="py-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold tracking-wider text-roast-700 bg-roast-50 px-2 py-0.5 rounded">
                    {formatEventLabel(e.eventType)}
                  </span>
                  <span className="text-bean-700 font-mono tabular-nums">
                    {formatMinSec(e.timestampMs / 1000)}
                  </span>
                  {e.value && (
                    <span className="text-bean-500 text-xs font-mono">{e.value}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* AI analysis */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-bean-900">AI analysis</h2>
            {analysisQ.data && (
              <span className="text-[10px] font-mono text-bean-400">
                {analysisQ.data.provider}/{analysisQ.data.modelName}
              </span>
            )}
          </div>

          {!analysisQ.data && !analysisQ.isLoading && (
            <div>
              <p className="text-sm text-bean-500 mb-3">
                No analysis yet for this roast. Click <strong>Analyze with AI</strong> above to
                run the provider on this curve.
              </p>
              {analyzeMut.error && (
                <p className="text-sm text-roast-600">
                  Analysis failed: {(analyzeMut.error as Error).message}
                </p>
              )}
            </div>
          )}

          {analysisQ.data && (
            <div className="space-y-4">
              <p className="text-sm text-bean-800 leading-relaxed">
                {analysisQ.data.summaryText}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <Stat
                  label="Development"
                  value={analysisQ.data.analysis.developmentPct.toFixed(1)}
                  unit="%"
                  accent="roast"
                />
                <Stat
                  label="RoR stability"
                  value={analysisQ.data.analysis.rorStabilityScore.toFixed(1)}
                  unit="/ 10"
                  accent="bean"
                />
              </div>

              {analysisQ.data.analysis.issues.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-bean-500 uppercase tracking-wider mb-1.5">
                    Issues
                  </h3>
                  <ul className="space-y-1 text-sm text-bean-700">
                    {analysisQ.data.analysis.issues.map((i, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-roast-500 font-bold">•</span>
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysisQ.data.analysis.recommendations.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-semibold text-bean-500 uppercase tracking-wider mb-1.5">
                    Recommendations
                  </h3>
                  <ul className="space-y-1 text-sm text-bean-700">
                    {analysisQ.data.analysis.recommendations.map((r, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-bean-500 font-bold">→</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-[10px] text-bean-400 pt-1 border-t border-bean-100">
                {new Date(analysisQ.data.createdAt).toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatMinSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatEventLabel(t: string): string {
  const map: Record<string, string> = {
    charge: 'CHARGE',
    tp: 'TURNING POINT',
    dry_end: 'DRY END',
    fc_start: 'FC START',
    fc_end: 'FC END',
    sc_start: 'SC START',
    sc_end: 'SC END',
    drop: 'DROP',
    cool: 'COOL END',
    note: 'NOTE',
  };
  return map[t] ?? t.toUpperCase();
}
