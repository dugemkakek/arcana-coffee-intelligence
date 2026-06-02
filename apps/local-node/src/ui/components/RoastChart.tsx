'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';

interface Sample {
  timestampMs: number;
  beanTempC: number | null;
  exhaustTempC: number | null;
  ror: number | null;
}

interface EventMarker {
  t: number;
  label: string;
}

interface Props {
  samples: Sample[];
  events: EventMarker[];
}

const EVENT_COLOR: Record<string, string> = {
  charge: '#a87a47',
  tp: '#8a5e2f',
  dry_end: '#f57e1f',
  fc_start: '#e2610a',
  fc_end: '#bf4a05',
  sc_start: '#923608',
  sc_end: '#6f2b0c',
  drop: '#241408',
  cool: '#503319',
  note: '#6d4722',
};

export function RoastChart({ samples, events }: Props) {
  const data = samples.map((s) => ({
    t: +(s.timestampMs / 1000).toFixed(1),
    BT: s.beanTempC,
    ET: s.exhaustTempC,
    RoR: s.ror,
  }));

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dcc4a0" />
          <XAxis
            dataKey="t"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(t) => `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`}
            label={{ value: 'time (mm:ss)', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#6d4722' }}
            stroke="#8a5e2f"
            fontSize={11}
          />
          <YAxis
            yAxisId="temp"
            domain={[0, 260]}
            label={{ value: '°C', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#6d4722' }}
            stroke="#8a5e2f"
            fontSize={11}
          />
          <YAxis
            yAxisId="ror"
            orientation="right"
            domain={[0, 40]}
            label={{ value: '°C/min', angle: 90, position: 'insideRight', fontSize: 12, fill: '#923608' }}
            stroke="#923608"
            fontSize={11}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#faf6f1', border: '1px solid #dcc4a0', borderRadius: 4, fontSize: 12 }}
            labelFormatter={(t) => `${Math.floor(Number(t) / 60)}:${(Number(t) % 60).toString().padStart(2, '0')}`}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />

          <Line yAxisId="temp" type="monotone" dataKey="BT" name="Bean Temp" stroke="#e2610a" dot={false} strokeWidth={2} />
          <Line yAxisId="temp" type="monotone" dataKey="ET" name="Exhaust Temp" stroke="#8a5e2f" dot={false} strokeWidth={2} />
          <Line yAxisId="ror" type="monotone" dataKey="RoR" name="Rate of Rise" stroke="#923608" dot={false} strokeWidth={1.5} strokeDasharray="4 2" />

          {events.map((e) => (
            <ReferenceLine
              key={`${e.t}-${e.label}`}
              yAxisId="temp"
              x={e.t}
              stroke={EVENT_COLOR[e.label] ?? '#503319'}
              strokeDasharray="3 3"
              label={{ value: e.label.toUpperCase(), position: 'top', fontSize: 9, fill: EVENT_COLOR[e.label] ?? '#503319' }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
