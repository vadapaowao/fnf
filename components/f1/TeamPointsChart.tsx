import type { TeamSeasonSnapshot } from "@/lib/team-profile";

type TeamPointsChartProps = {
  snapshot: TeamSeasonSnapshot;
  accentColor?: string;
  title?: string;
};

function getBarHeight(points: number, peak: number) {
  if (peak <= 0) {
    return 10;
  }

  return Math.max((points / peak) * 100, 10);
}

export default function TeamPointsChart({
  snapshot,
  accentColor = "#E10600",
  title = "Race Points Flow"
}: TeamPointsChartProps) {
  const peakPoints = snapshot.raceSeries.reduce((best, race) => Math.max(best, race.points), 0);

  if (snapshot.raceSeries.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
        <h3 className="font-display text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">No race data available for this season.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-white">{title}</h3>
          <p className="mt-1 text-xs font-mono uppercase tracking-[0.16em] text-gray-500">
            {snapshot.season} points scored per round
          </p>
        </div>
        <span className="rounded border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-300">
          Avg {snapshot.averagePoints} pts
        </span>
      </div>

      <div className="mt-6 overflow-x-auto pb-2 custom-scrollbar">
        <div className="relative min-w-[720px]">
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="border-t border-white/5" />
            ))}
          </div>

          <div className="relative flex h-64 items-end gap-3">
            {snapshot.raceSeries.map((race) => (
              <div key={`${snapshot.season}-${race.round}-${race.raceName}`} className="group flex min-w-[52px] flex-1 flex-col items-center">
                <div className="relative flex h-56 w-full items-end justify-center">
                  <div
                    className="w-5 rounded-t-full transition-transform duration-200 group-hover:scale-y-105"
                    style={{
                      height: `${getBarHeight(race.points, peakPoints)}%`,
                      background: `linear-gradient(to top, ${accentColor}30, ${accentColor})`
                    }}
                  />

                  <div className="pointer-events-none absolute bottom-full mb-3 min-w-[160px] rounded-lg border border-white/10 bg-[#0B0B0B] px-3 py-2 text-left opacity-0 shadow-2xl transition-opacity duration-150 group-hover:opacity-100">
                    <p className="text-[10px] font-black uppercase tracking-[0.12em] text-grid-primary">{race.raceName}</p>
                    <p className="mt-1 text-[11px] text-gray-200">{race.points.toFixed(0)} points • Best {race.bestFinish}</p>
                    <p className="mt-1 text-[10px] text-gray-500">{race.podiums} podiums • {race.wins} wins</p>
                  </div>
                </div>

                <p className="mt-3 text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-gray-500">
                  {race.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
