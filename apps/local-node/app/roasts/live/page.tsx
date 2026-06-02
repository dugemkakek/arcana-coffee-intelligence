'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

// =====================================================================
// Types — mirror the server's `LiveSample` and the WebSocket message shapes
// =====================================================================

type RoastEventType =
  | 'charge'
  | 'tp'
  | 'dry_end'
  | 'fc_start'
  | 'fc_end'
  | 'sc_start'
  | 'sc_end'
  | 'drop'
  | 'cool'
  | 'note';

interface LiveSample {
  t: number;
  bt: number;
  et: number;
}

type SourceState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface WsHello {
  type: 'hello';
  source: 'phidget' | 'simulator';
  connected: boolean;
  sessionId: string | null;
}
interface WsSample {
  type: 'sample';
  sample: LiveSample;
  sessionId: string;
}
interface WsEvent {
  type: 'event';
  sessionId: string;
  event: { type: RoastEventType; t: number; value?: string };
}
interface WsState {
  type: 'state';
  state: SourceState;
}
interface WsError {
  type: 'error';
  message: string;
}
type WsMessage = WsHello | WsSample | WsEvent | WsState | WsError;

const EVENT_BUTTONS: { type: RoastEventType; label: string; color: string }[] = [
  { type: 'charge', label: 'CHARGE', color: 'bg-bean-700 hover:bg-bean-800' },
  { type: 'tp', label: 'TP', color: 'bg-bean-500 hover:bg-bean-600' },
  { type: 'dry_end', label: 'DRY END', color: 'bg-roast-300 hover:bg-roast-400' },
  { type: 'fc_start', label: 'FC START', color: 'bg-roast-500 hover:bg-roast-600' },
  { type: 'fc_end', label: 'FC END', color: 'bg-roast-600 hover:bg-roast-700' },
  { type: 'sc_start', label: 'SC START', color: 'bg-roast-700 hover:bg-roast-800' },
  { type: 'sc_end', label: 'SC END', color: 'bg-roast-800 hover:bg-roast-900' },
  { type: 'drop', label: 'DROP', color: 'bg-bean-900 hover:bg-black' },
  { type: 'cool', label: 'COOL', color: 'bg-bean-400 hover:bg-bean-500' },
  { type: 'note', label: 'NOTE', color: 'bg-bean-300 hover:bg-bean-400 text-bean-900' },
];

// =====================================================================
// Page
// =====================================================================

export default function LivePage() {
  const router = useRouter();
  const [sourceKind, setSourceKind] = useState<'phidget' | 'simulator'>('simulator');
  const [sourceState, setSourceState] = useState<SourceState>('disconnected');
  const [devices, setDevices] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [samples, setSamples] = useState<LiveSample[]>([]);
  const [events, setEvents] = useState<Array<{ type: RoastEventType; t: number }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [stopping, setStopping] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const samplesRef = useRef<LiveSample[]>([]);
  const lastEventTRef = useRef<number>(0);

  // ---- WebSocket lifecycle ------------------------------------------------
  useEffect(() => {
    const wsUrl = API_URL.replace(/^http/, 'ws') + '/ws/live';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      // console.debug('[ws] open');
    };
    ws.onmessage = (e) => {
      let msg: WsMessage;
      try {
        msg = JSON.parse(e.data);
      } catch {
        return;
      }
      if (msg.type === 'hello') {
        setSourceKind(msg.source);
        if (msg.sessionId) setSessionId(msg.sessionId);
      } else if (msg.type === 'state') {
        setSourceState(msg.state);
      } else if (msg.type === 'sample') {
        samplesRef.current = [...samplesRef.current, msg.sample].slice(-720); // keep last 12 min
        setSamples(samplesRef.current);
      } else if (msg.type === 'event') {
        setEvents((prev) => [...prev, { type: msg.event.type, t: msg.event.t }]);
        lastEventTRef.current = msg.event.t;
      } else if (msg.type === 'error') {
        setError(msg.message);
      }
    };
    ws.onerror = () => setError('WebSocket connection failed');
    ws.onclose = () => {
      wsRef.current = null;
    };

    return () => {
      ws.close();
    };
  }, []);

  // ---- Initial device load ------------------------------------------------
  useEffect(() => {
    fetch(`${API_URL}/api/live/devices`)
      .then((r) => r.json())
      .then((d: { devices: Array<{ id: string; label: string }> }) => {
        setDevices(d.devices);
        if (d.devices.length > 0) setSelectedDevice(d.devices[0].id);
      })
      .catch((err) => setError(`Failed to load devices: ${err.message}`));
  }, []);

  // ---- Actions ------------------------------------------------------------
  const connect = useCallback(async () => {
    setError(null);
    const res = await fetch(`${API_URL}/api/live/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId: selectedDevice }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      setError(e.error ?? `Connect failed (${res.status})`);
    }
  }, [selectedDevice]);

  const disconnect = useCallback(async () => {
    await fetch(`${API_URL}/api/live/disconnect`, { method: 'POST' });
    setSamples([]);
    setEvents([]);
    samplesRef.current = [];
  }, []);

  const startSession = useCallback(async () => {
    setError(null);
    const res = await fetch(`${API_URL}/api/live/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      setError(e.error ?? `Start failed (${res.status})`);
      return;
    }
    const { sessionId: sid } = await res.json();
    setSessionId(sid);
    setSamples([]);
    setEvents([]);
    samplesRef.current = [];
  }, []);

  const fireEvent = useCallback((type: RoastEventType) => {
    // Send via WebSocket for low latency; fall back to HTTP if ws is dead
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'event', eventType: type }));
    } else {
      fetch(`${API_URL}/api/live/sessions/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      }).catch((err) => setError(err.message));
    }
  }, []);

  const stopSession = useCallback(async () => {
    setStopping(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/live/sessions/stop`, { method: 'POST' });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        setError(e.error ?? `Stop failed (${res.status})`);
        return;
      }
      const { roastId } = await res.json();
      // Disconnect the source
      await fetch(`${API_URL}/api/live/disconnect`, { method: 'POST' });
      // Navigate to the detail page
      router.push(`/roasts/${roastId}`);
    } finally {
      setStopping(false);
    }
  }, [router]);

  // ---- Derived UI state ---------------------------------------------------
  const lastSample = samples.length > 0 ? samples[samples.length - 1] : null;
  const isLive = sourceState === 'connected' && sessionId !== null;
  const roR = computeRoR(samples);
  const elapsedSec = lastSample?.t ?? 0;

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/" className="text-xs text-bean-500 hover:text-bean-700">
            ← All roasts
          </Link>
          <h1 className="text-3xl font-bold text-bean-900 mt-1">Live roast</h1>
          <p className="text-sm text-bean-500 mt-1">
            Capture a roast in real time from a connected Phidget or the simulator.
          </p>
        </div>
        <SourceBadge kind={sourceKind} state={sourceState} />
      </div>

      {error && (
        <div className="card border-roast-500 bg-roast-50">
          <p className="text-sm text-roast-700 font-medium">{error}</p>
        </div>
      )}

      {/* ---------- Two-column layout ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: device + session control */}
        <div className="lg:col-span-1 space-y-4">
          {/* Device connection card */}
          <div className="card !p-5">
            <h2 className="text-sm font-semibold text-bean-900 mb-3">1. Device</h2>
            <label className="label">Temperature source</label>
            <select
              className="input mb-3"
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              disabled={isLive}
            >
              {devices.length === 0 && <option value="">No devices detected</option>}
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              {!isLive ? (
                <button
                  onClick={connect}
                  disabled={!selectedDevice}
                  className="btn-primary flex-1"
                >
                  Connect
                </button>
              ) : (
                <button onClick={disconnect} className="btn-secondary flex-1">
                  Disconnect
                </button>
              )}
            </div>
          </div>

          {/* Session control card */}
          <div className="card !p-5">
            <h2 className="text-sm font-semibold text-bean-900 mb-3">2. Session</h2>
            {!sessionId ? (
              <button
                onClick={startSession}
                disabled={sourceState !== 'connected'}
                className="btn-primary w-full"
              >
                {sourceState === 'connected' ? 'Start session' : 'Connect a device first'}
              </button>
            ) : (
              <>
                <div className="bg-bean-50 rounded p-3 mb-3 text-xs font-mono text-bean-600 break-all">
                  {sessionId}
                </div>
                <button
                  onClick={stopSession}
                  disabled={stopping}
                  className="btn-primary w-full"
                >
                  {stopping ? 'Saving…' : 'Stop & save roast'}
                </button>
              </>
            )}
          </div>

          {/* Live KPIs */}
          <div className="card !p-5">
            <h2 className="text-sm font-semibold text-bean-900 mb-3">Live readings</h2>
            <div className="space-y-2 text-sm">
              <Kpi label="Elapsed" value={formatMinSec(elapsedSec)} mono />
              <Kpi label="Bean temp" value={lastSample ? `${lastSample.bt.toFixed(1)} °C` : '—'} mono />
              <Kpi label="Exhaust temp" value={lastSample ? `${lastSample.et.toFixed(1)} °C` : '—'} mono />
              <Kpi label="RoR (5s)" value={roR != null ? `${roR.toFixed(1)} °C/min` : '—'} mono />
              <Kpi label="Samples" value={String(samples.length)} mono />
            </div>
          </div>
        </div>

        {/* Right: chart + events */}
        <div className="lg:col-span-2 space-y-4">
          {/* Chart */}
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-bean-900">Roast curve</h2>
              <div className="text-xs text-bean-500">
                {isLive ? '🔴 LIVE' : sessionId ? 'Paused' : 'No active session'}
              </div>
            </div>
            <LiveChart samples={samples} events={events} />
          </div>

          {/* Event buttons */}
          <div className="card !p-5">
            <h2 className="text-sm font-semibold text-bean-900 mb-3">3. Mark events</h2>
            <p className="text-xs text-bean-500 mb-3">
              {isLive
                ? 'Click to fire an event at the current time.'
                : 'Events are enabled during a live session.'}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {EVENT_BUTTONS.map((b) => (
                <button
                  key={b.type}
                  onClick={() => fireEvent(b.type)}
                  disabled={!isLive}
                  className={`${b.color} text-bean-50 text-xs font-semibold py-2 px-2 rounded transition disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            {events.length > 0 && (
              <ul className="mt-4 text-xs divide-y divide-bean-100">
                {events.map((e, idx) => (
                  <li key={idx} className="py-1.5 flex items-center justify-between">
                    <span className="font-mono font-semibold text-roast-700">{e.type.toUpperCase()}</span>
                    <span className="font-mono text-bean-700">{formatMinSec(e.t)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// Sub-components
// =====================================================================

function SourceBadge({ kind, state }: { kind: string; state: SourceState }) {
  const dot = state === 'connected' ? 'bg-green-500' : state === 'error' ? 'bg-roast-600' : 'bg-bean-400';
  return (
    <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-bean-100 text-bean-700">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span className="font-medium">{kind}</span>
      <span className="text-bean-500">·</span>
      <span>{state}</span>
    </div>
  );
}

function Kpi({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-bean-500">{label}</span>
      <span className={`text-bean-900 font-semibold ${mono ? 'font-mono tabular-nums' : ''}`}>{value}</span>
    </div>
  );
}

function LiveChart({ samples, events }: { samples: LiveSample[]; events: Array<{ type: RoastEventType; t: number }> }) {
  // Lightweight inline SVG chart — no Recharts dep here so the live
  // view renders instantly without the ResponsiveContainer layout
  // dance. Plenty for a single-machine "watch the curve in real time"
  // use case.
  if (samples.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-bean-500 text-sm">
        Connect a device, start a session, and the curve will appear here.
      </div>
    );
  }

  const W = 800;
  const H = 320;
  const PAD_L = 56;
  const PAD_R = 56;
  const PAD_T = 24;
  const PAD_B = 36;

  const tMin = 0;
  const tMax = Math.max(60, samples[samples.length - 1].t + 5);
  const tRange = tMax - tMin;
  const yMin = 60;
  const yMax = 240;
  const yRange = yMax - yMin;

  const x = (t: number) => PAD_L + ((t - tMin) / tRange) * (W - PAD_L - PAD_R);
  const y = (temp: number) => H - PAD_B - ((temp - yMin) / yRange) * (H - PAD_T - PAD_B);

  // Smooth the path a touch
  const btPath = samples.map((s, i) => `${i === 0 ? 'M' : 'L'} ${x(s.t).toFixed(1)} ${y(s.bt).toFixed(1)}`).join(' ');
  const etPath = samples.map((s, i) => `${i === 0 ? 'M' : 'L'} ${x(s.t).toFixed(1)} ${y(s.et).toFixed(1)}`).join(' ');

  return (
    <div className="w-full" style={{ height: 360 }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
        {/* Grid + axes */}
        {[80, 120, 160, 200, 240].map((temp) => (
          <g key={temp}>
            <line
              x1={PAD_L}
              y1={y(temp)}
              x2={W - PAD_R}
              y2={y(temp)}
              stroke="#dcc4a0"
              strokeOpacity={0.5}
              strokeDasharray="2 4"
            />
            <text x={PAD_L - 8} y={y(temp) + 4} textAnchor="end" fontSize={10} fill="#8a5e2f">
              {temp}°
            </text>
          </g>
        ))}

        {/* X axis ticks every minute */}
        {Array.from({ length: Math.ceil(tMax / 60) + 1 }, (_, i) => i * 60)
          .filter((t) => t <= tMax)
          .map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                y1={H - PAD_B}
                x2={x(t)}
                y2={H - PAD_B + 4}
                stroke="#8a5e2f"
              />
              <text x={x(t)} y={H - PAD_B + 16} textAnchor="middle" fontSize={10} fill="#6d4722">
                {Math.floor(t / 60)}:{(t % 60).toString().padStart(2, '0')}
              </text>
            </g>
          ))}

        {/* Lines */}
        <path d={btPath} fill="none" stroke="#e2610a" strokeWidth={2.25} />
        <path d={etPath} fill="none" stroke="#8a5e2f" strokeWidth={2.25} />

        {/* Event markers */}
        {events.map((e, i) => (
          <g key={i}>
            <line
              x1={x(e.t)}
              y1={PAD_T}
              x2={x(e.t)}
              y2={H - PAD_B}
              stroke="#bf4a05"
              strokeOpacity={0.6}
              strokeDasharray="2 4"
            />
            <text
              x={x(e.t) + 3}
              y={PAD_T + 10}
              fontSize={9}
              fontWeight={600}
              fill="#bf4a05"
            >
              {e.type.toUpperCase()}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// =====================================================================
// Helpers
// =====================================================================

function formatMinSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** RoR via 30s backward difference on BT. °C/min. */
function computeRoR(samples: LiveSample[]): number | null {
  if (samples.length < 2) return null;
  const last = samples[samples.length - 1];
  // find sample ~30s before last
  let j = samples.length - 1;
  while (j > 0 && last.t - samples[j].t < 30) j--;
  if (j === samples.length - 1) return null;
  const dt = last.t - samples[j].t;
  if (dt <= 0) return null;
  return ((last.bt - samples[j].bt) / dt) * 60;
}
