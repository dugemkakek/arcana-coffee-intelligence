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
  charge: '#8a5e2f',
  tp: '#a87a47',
  dry_end: '#f57e1f',
  fc_start: '#e2610a',
  fc_end: '#bf4a05',
  sc_start: '#923608',
  sc_end: '#6f2b0c',
  drop: '#241408',
  cool: '#503319',
  note: '#6d4722',
};

const EVENT_LABEL: Record<string, string> = {
  charge: 'CHARGE',
  tp: 'TP',
  dry_end: 'DRY',
  fc_start: 'FC',
  fc_end: 'FC end',
  sc_start: 'SC',
  sc_end: 'SC end',
  drop: 'DROP',
  cool: 'COOL',
  note: 'NOTE',
};

export function RoastChart({ samples, events }: Props) {
  const data = samples.map((s) => ({
    t: +(s.timestampMs / 1000).toFixed(1),
    BT: s.beanTempC,
    ET: s.exhaustTempC,
    RoR: s.ror,
  }));

  return (
    <div className="w-full" style={{ height: 440 }}>
      {samples.length === 0 ? (
        <div className="flex items-center justify-center h-full text-bean-500 text-sm">
          No sample data for this roast.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {/*
            Layout (px from top, generous so legend + event labels never get clipped):
              - top:        56  (legend band)
              - right:      56  (right axis °C/min label)
              - left:       56   (left axis °C label)
              - bottom:     40   (X axis label)
          */}
          <LineChart data={data} margin={{ top: 56, right: 56, left: 16, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#dcc4a0" strokeOpacity={0.6} />
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, 'dataMax']}
              tickFormatter={(t) => `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`}
              label={{ value: 'time (mm:ss)', position: 'insideBottom', offset: -12, fontSize: 12, fill: '#6d4722' }}
              stroke="#8a5e2f"
              fontSize={11}
              tick={{ fill: '#6d4722' }}
            />
            <YAxis
              yAxisId="temp"
              domain={[60, 240]}
              tickFormatter={(t) => `${t}°`}
              label={{ value: '°C', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: '#6d4722' }}
              stroke="#8a5e2f"
              fontSize={11}
              tick={{ fill: '#6d4722' }}
              width={48}
            />
            <YAxis
              yAxisId="ror"
              orientation="right"
              domain={[0, 30]}
              tickFormatter={(t) => `${t}°/m`}
              label={{ value: 'RoR °C/min', angle: 90, position: 'insideRight', offset: 10, fontSize: 12, fill: '#923608' }}
              stroke="#923608"
              fontSize={11}
              tick={{ fill: '#923608' }}
              width={56}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#faf6f1', border: '1px solid #dcc4a0', borderRadius: 4, fontSize: 12 }}
              labelFormatter={(t) => `t = ${Math.floor(Number(t) / 60)}:${(Number(t) % 60).toString().padStart(2, '0')}`}
              formatter={(value: number | null, name: string) => [
                value != null ? value.toFixed(1) : '—',
                name,
              ]}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="line"
              wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
            />

            <Line yAxisId="temp" type="monotone" dataKey="BT" name="Bean Temp" stroke="#e2610a" dot={false} strokeWidth={2.25} />
            <Line yAxisId="temp" type="monotone" dataKey="ET" name="Exhaust Temp" stroke="#8a5e2f" dot={false} strokeWidth={2.25} />
            <Line yAxisId="ror" type="monotone" dataKey="RoR" name="Rate of Rise" stroke="#923608" dot={false} strokeWidth={1.5} strokeDasharray="5 3" />

            {events.map((e) => (
              <ReferenceLine
                key={`${e.t}-${e.label}`}
                yAxisId="temp"
                x={e.t}
                stroke={EVENT_COLOR[e.label] ?? '#503319'}
                strokeWidth={1.25}
                strokeDasharray="2 4"
                label={{
                  value: EVENT_LABEL[e.label] ?? e.label.toUpperCase(),
                  position: 'top',
                  fontSize: 9,
                  fontWeight: 600,
                  fill: EVENT_COLOR[e.label] ?? '#503319',
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
