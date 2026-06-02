'use client';

import { use } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchRoast, fetchAnalysis, analyzeRoast, API_URL } from '@/lib/api';
import { RoastChart } from '@/components/RoastChart';

export default function RoastDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15 passes params as a Promise
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

  if (roastQ.isLoading) return <p className="text-bean-600">Loading roast…</p>;
  if (roastQ.error) {
    return (
      <div className="card border-roast-500 bg-roast-50">
        <p className="text-roast-700 font-medium">Failed to load roast</p>
        <p className="text-sm text-bean-700 mt-1">{(roastQ.error as Error).message}</p>
      </div>
    );
  }
  const roast = roastQ.data;

  const eventMarkers = roast.events.map((e) => ({
    t: e.timestampMs / 1000,
    label: e.eventType,
  }));

  return (
    <div>
      <Link href="/" className="text-sm text-bean-600 hover:text-bean-900">
        ← Back to roasts
      </Link>

      <div className="mt-3 mb-6 flex items-start justify-between">
        <div>
          <h2>{roast.greenLot.name}</h2>
          <p className="text-sm text-bean-600 font-mono">{roast.greenLot.code}</p>
          <p className="text-xs text-bean-500 mt-1">
            {new Date(roast.roastDate).toLocaleString()} · {roast.source}
            {roast.sourceFile && ` · ${roast.sourceFile}`}
          </p>
        </div>
        <button
          onClick={() => analyzeMut.mutate()}
          disabled={analyzeMut.isPending}
          className="btn-primary"
        >
          {analyzeMut.isPending ? 'Analyzing…' : '🤖 Analyze with AI'}
        </button>
      </div>

      {/* Roast curve chart */}
      <div className="card mb-6">
        <h3 className="text-base font-semibold mb-4">Roast curve</h3>
        <RoastChart samples={roast.samplePoints} events={eventMarkers} />
        <p className="text-xs text-bean-500 mt-2">
          {roast.samplePoints.length} samples · {roast.events.length} events
        </p>
      </div>

      {/* Events list */}
      <div className="card mb-6">
        <h3 className="text-base font-semibold mb-3">Events</h3>
        {roast.events.length === 0 ? (
          <p className="text-sm text-bean-500">No events recorded.</p>
        ) : (
          <ul className="text-sm divide-y divide-bean-100">
            {roast.events.map((e) => (
              <li key={e.id} className="py-2 flex justify-between">
                <span className="font-mono text-roast-700">{formatEventLabel(e.eventType)}</span>
                <span className="text-bean-700 font-mono">{formatTime(e.timestampMs / 1000)}</span>
                {e.value && <span className="text-bean-500 text-xs">{e.value}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* AI analysis */}
      <div className="card">
        <h3 className="text-base font-semibold mb-3">AI analysis</h3>

        {analysisQ.isLoading && <p className="text-sm text-bean-600">Loading…</p>}

        {!analysisQ.data && !analysisQ.isLoading && (
          <div>
            <p className="text-sm text-bean-500 mb-3">No analysis yet for this roast.</p>
            {analyzeMut.error && (
              <p className="text-sm text-roast-600">
                Analysis failed: {(analyzeMut.error as Error).message}
              </p>
            )}
          </div>
        )}

        {analysisQ.data && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-bean-500">
              <span>Provider: <code className="font-mono">{analysisQ.data.provider}</code></span>
              <span>Model: <code className="font-mono">{analysisQ.data.modelName}</code></span>
              <span>{new Date(analysisQ.data.createdAt).toLocaleString()}</span>
            </div>

            <p className="text-bean-800 leading-relaxed">{analysisQ.data.summaryText}</p>

            <div className="grid grid-cols-2 gap-3">
              <Stat label="Development %" value={analysisQ.data.analysis.developmentPct.toFixed(1) + '%'} />
              <Stat label="RoR stability" value={analysisQ.data.analysis.rorStabilityScore.toFixed(1) + ' / 10'} />
            </div>

            {analysisQ.data.analysis.issues.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-bean-700 mb-2">Issues observed</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-bean-700">
                  {analysisQ.data.analysis.issues.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>
              </div>
            )}

            {analysisQ.data.analysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-bean-700 mb-2">Recommendations</h4>
                <ul className="list-disc pl-5 space-y-1 text-sm text-bean-700">
                  {analysisQ.data.analysis.recommendations.map((r, idx) => (
                    <li key={idx}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bean-100 rounded-md p-3">
      <div className="text-xs text-bean-600 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold text-bean-900 mt-1">{value}</div>
    </div>
  );
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatEventLabel(t: string): string {
  const map: Record<string, string> = {
    charge: 'CHARGE',
    tp: 'TURNING POINT',
    dry_end: 'DRY END',
    fc_start: 'FIRST CRACK START',
    fc_end: 'FIRST CRACK END',
    sc_start: 'SECOND CRACK START',
    sc_end: 'SECOND CRACK END',
    drop: 'DROP',
    cool: 'COOL END',
    note: 'NOTE',
  };
  return map[t] ?? t.toUpperCase();
}
