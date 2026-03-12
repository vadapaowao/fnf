import type { DriverSeasonResult } from "@/lib/driver-profile";

type SeasonPaceChartProps = {
    data: DriverSeasonResult[];
    accentColor?: string;
    season: string;
};

function getBarHeight(position: number | null, fieldSize: number) {
    if (!position || position <= 0) {
        return 10;
    }

    return Math.max(((fieldSize + 1 - position) / fieldSize) * 100, 10);
}

export default function SeasonPaceChart({ data, accentColor = "#E10600", season }: SeasonPaceChartProps) {
    const fieldSize = 20;

    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-display text-lg font-bold uppercase text-white">Season Pace</h3>
                        <p className="mt-1 text-xs font-mono uppercase tracking-[0.14em] text-gray-500">{season} race-by-race form</p>
                    </div>
                </div>
                <div className="mt-6 rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center">
                    <p className="text-sm text-gray-400">No race results available yet for this season.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h3 className="font-display text-lg font-bold uppercase text-white">Season Pace</h3>
                    <p className="mt-1 text-xs font-mono uppercase tracking-[0.14em] text-gray-500">{season} grid versus finish trend</p>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                    <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-white/60" />
                        Grid
                    </span>
                    <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accentColor }} />
                        Finish
                    </span>
                </div>
            </div>

            <div className="mt-6 overflow-x-auto pb-2 custom-scrollbar">
                <div className="relative min-w-[720px]">
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="border-t border-white/5" />
                        ))}
                    </div>

                    <div className="relative flex h-64 items-end gap-3">
                        {data.map((entry) => (
                            <div key={`${entry.round}-${entry.raceName}`} className="group flex min-w-[52px] flex-1 flex-col items-center">
                                <div className="relative flex h-56 w-full items-end justify-center gap-1">
                                    <div
                                        className="w-3 rounded-t-full bg-gradient-to-t from-white/10 to-white/60 transition-transform duration-200 group-hover:scale-y-105"
                                        style={{ height: `${getBarHeight(entry.grid, fieldSize)}%` }}
                                    />
                                    {entry.finish ? (
                                        <div
                                            className="w-3 rounded-t-full transition-transform duration-200 group-hover:scale-y-105"
                                            style={{
                                                height: `${getBarHeight(entry.finish, fieldSize)}%`,
                                                background: `linear-gradient(to top, ${accentColor}33, ${accentColor})`,
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="flex h-8 w-3 items-center justify-center rounded-full border border-dashed"
                                            style={{ borderColor: `${accentColor}80`, color: accentColor }}
                                        >
                                            <span className="text-[8px] font-black">X</span>
                                        </div>
                                    )}

                                    <div className="pointer-events-none absolute bottom-full mb-3 min-w-[140px] rounded-lg border border-white/10 bg-[#0B0B0B] px-3 py-2 text-left opacity-0 shadow-2xl transition-opacity duration-150 group-hover:opacity-100">
                                        <p className="text-[10px] font-black uppercase tracking-[0.12em] text-grid-primary">{entry.raceName}</p>
                                        <p className="mt-1 text-[11px] text-gray-200">
                                            Grid {entry.grid ? `P${entry.grid}` : "TBD"} • Finish {entry.finishLabel}
                                        </p>
                                        <p className="mt-1 text-[10px] text-gray-500">{entry.points.toFixed(0)} pts • {entry.status}</p>
                                    </div>
                                </div>

                                <p className="mt-3 text-[10px] font-mono font-bold uppercase tracking-[0.12em] text-gray-500">
                                    {entry.label}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
