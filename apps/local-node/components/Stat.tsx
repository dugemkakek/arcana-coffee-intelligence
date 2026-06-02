// Small reusable stat tile used in the roast detail header row.
// Shown as: small uppercase label + large bold value + optional unit/sub.

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent?: 'bean' | 'roast' | 'default';
}

const ACCENT: Record<NonNullable<Props['accent']>, string> = {
  bean: 'text-bean-900',
  roast: 'text-roast-700',
  default: 'text-bean-900',
};

export function Stat({ label, value, unit, sub, accent = 'default' }: Props) {
  return (
    <div className="bg-bean-50 rounded-lg border border-bean-100 px-4 py-3 flex flex-col gap-0.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-bean-500">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <div className={`text-2xl font-bold tabular-nums ${ACCENT[accent]}`}>
          {value}
        </div>
        {unit && <div className="text-xs text-bean-500 font-medium">{unit}</div>}
      </div>
      {sub && <div className="text-[11px] text-bean-500">{sub}</div>}
    </div>
  );
}
