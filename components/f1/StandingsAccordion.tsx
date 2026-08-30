type StandingsAccordionRow = {
  rank: string;
  name: string;
  context: string;
  meta?: string;
  value: string;
  accentColor?: string;
};

type StandingsAccordionProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  rows: StandingsAccordionRow[];
};

export default function StandingsAccordion({
  eyebrow,
  title,
  subtitle,
  rows
}: StandingsAccordionProps) {
  const leader = rows[0];

  return (
    <details open className="group/standings min-w-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark">
      <summary className="flex cursor-pointer list-none flex-col items-start justify-between gap-4 p-4 marker:content-none sm:flex-row sm:p-6">
        <div className="min-w-0 max-w-full">
          <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">{eyebrow}</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-white">{title}</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-gray-400">{subtitle}</p>

          {leader ? (
            <div className="mt-4 inline-grid max-w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-3 sm:gap-3 sm:px-4">
              <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-gray-300">
                P{leader.rank}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{leader.name}</p>
                <p className="truncate text-[11px] text-gray-500">{leader.context}</p>
              </div>
              <span className="shrink-0 text-sm font-black" style={{ color: leader.accentColor ?? "#E10600" }}>
                {leader.value}
              </span>
            </div>
          ) : null}
        </div>

        <div className="flex shrink-0 self-start items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">Full table</span>
          <span className="material-icons text-base text-grid-primary transition-transform duration-200 group-open/standings:rotate-180">
            expand_more
          </span>
        </div>
      </summary>

      <div className="min-w-0 border-t border-white/10 px-3 pb-3 pt-2 sm:px-4 sm:pb-4">
        <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
          {rows.map((row) => (
            <div
              key={`${row.rank}-${row.name}`}
              className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-3 sm:gap-4 sm:px-4"
            >
              <span className="rounded-full border border-white/10 bg-black/30 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-gray-300">
                P{row.rank}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{row.name}</p>
                <p className="truncate text-[11px] text-gray-500">{row.context}</p>
                {row.meta ? <p className="truncate text-[10px] uppercase tracking-[0.14em] text-gray-600">{row.meta}</p> : null}
              </div>

              <span className="whitespace-nowrap text-right text-xs font-black text-white sm:text-sm" style={{ color: row.accentColor ?? "#FFFFFF" }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}
