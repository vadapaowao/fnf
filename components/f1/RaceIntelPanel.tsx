import { getRaceWeekendSessions, type Race, type RaceRecap, type RaceSession, type TrackSector } from "@/lib/f1";

interface RaceIntelPanelProps {
    race: Race;
    circuitStats?: {
        lengthKm: string;
        turns: string;
        drsZones: string;
        firstGrandPrix: string;
    };
    lastWinner?: {
        driver: string;
        constructor: string;
        year: string;
    };
    fastestLap?: {
        driver: string;
        time: string;
        year: string;
    };
    recap?: RaceRecap | null;
    sessions?: RaceSession[];
    sectors?: TrackSector[];
}

export default function RaceIntelPanel({
    race,
    circuitStats,
    lastWinner,
    fastestLap,
    recap,
    sessions,
    sectors,
}: RaceIntelPanelProps) {
    const defaultSessions: RaceSession[] = sessions || getRaceWeekendSessions(race);
    const hasRaceFinished = new Date(`${race.date}T${race.time}`).getTime() < Date.now();

    return (
        <aside className="w-96 bg-surface-dark/95 border-l border-white/10 p-6 z-20 overflow-y-auto custom-scrollbar shadow-2xl relative">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase">Race Intel</h3>
                <span className="text-xs bg-grid-primary/20 text-grid-primary px-2 py-1 rounded font-mono">
                    ROUND {race.round}
                </span>
            </div>

            {/* Circuit Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                    {
                        icon: "straighten",
                        label: "Length",
                        val: circuitStats?.lengthKm || "5.3",
                        unit: "km",
                    },
                    {
                        icon: "turn_slight_right",
                        label: "Turns",
                        val: circuitStats?.turns || "14",
                        unit: "",
                    },
                    {
                        icon: "fast_forward",
                        label: "DRS",
                        val: circuitStats?.drsZones || "3",
                        unit: "zones",
                    },
                    {
                        icon: "event",
                        label: "First GP",
                        val: circuitStats?.firstGrandPrix || "1996",
                        unit: "",
                    },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-background-dark/50 p-4 rounded-lg border border-white/5 hover:border-grid-primary/30 transition-colors group"
                    >
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <span className="material-icons text-sm group-hover:text-grid-primary transition-colors">
                                {stat.icon}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-mono font-bold text-white">
                            {stat.val}
                            {stat.unit && <span className="text-sm text-gray-500 ml-1">{stat.unit}</span>}
                        </p>
                    </div>
                ))}
            </div>

            {/* Circuit Info */}
            <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-icons text-6xl text-white">location_on</span>
                </div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">
                    Circuit Info
                </h4>
                <div className="relative z-10">
                    <p className="text-xl font-mono font-bold text-grid-primary neon-text">
                        {race.circuitName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 bg-grid-primary rounded-full"></span>
                        <p className="text-xs text-gray-300">
                            {race.locality}, {race.country}
                        </p>
                    </div>
                </div>
            </div>

            {/* Last Winner */}
            {lastWinner && (
                <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-[#2B0A0A] via-[#170707] to-[#090909] border border-grid-primary/35 relative overflow-hidden shadow-[0_0_18px_rgba(225,6,0,0.28)]">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-70 pointer-events-none"></div>
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0)_38%)] pointer-events-none"></div>
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <span className="material-icons text-6xl text-white">emoji_events</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">
                        Last Winner
                    </h4>
                    <div className="relative z-10">
                        <p className="text-xl font-mono font-bold text-[#FFF1E7]">{lastWinner.driver}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 bg-accent-gold rounded-full"></span>
                            <p className="text-xs text-[#F9D7CA]">
                                {lastWinner.constructor} • {lastWinner.year}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Fastest Lap */}
            {fastestLap && (
                <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-icons text-6xl text-white">timer</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">
                        Fastest Lap
                    </h4>
                    <div className="relative z-10">
                        <p className="text-xl font-mono font-bold text-accent-green">{fastestLap.time}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 bg-accent-green rounded-full"></span>
                            <p className="text-xs text-gray-300">
                                {fastestLap.driver} • {fastestLap.year}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Race Recap */}
            {recap && (
                <details className="group mb-8 rounded-xl border border-grid-primary/25 bg-gradient-to-br from-[#120808] to-[#080808]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 marker:content-none">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-grid-primary">Race Recap</p>
                            <p className="mt-2 text-sm font-bold text-white">{recap.headline}</p>
                            <p className="mt-1 text-[11px] text-gray-400">Open for key moments, sector story, and strategy pivots.</p>
                        </div>
                        <span className="material-icons text-grid-primary transition-transform duration-200 group-open:rotate-180">
                            expand_more
                        </span>
                    </summary>

                    <div className="border-t border-white/10 px-5 pb-5 pt-4">
                        <p className="text-xs leading-relaxed text-gray-300">{recap.winnerStory}</p>
                        <p className="mt-3 text-[11px] text-gray-300">{recap.decisivePitWindow}</p>

                        {recap.fastestLap && (
                            <p className="mt-2 text-[11px] text-accent-green">
                                Fastest lap: {recap.fastestLap.driver} • {recap.fastestLap.lapTime} (Lap {recap.fastestLap.lap})
                            </p>
                        )}

                        {recap.biggestGainer && (
                            <p className="mt-2 text-[11px] text-gray-300">
                                Biggest gainer: {recap.biggestGainer.driver} (+{recap.biggestGainer.positionsGained}, P
                                {recap.biggestGainer.started} to P{recap.biggestGainer.finished})
                            </p>
                        )}

                        <div className="mt-4 space-y-2">
                            {recap.keyMoments.map((moment) => (
                                <details key={moment.title} className="group/moment rounded-lg border border-white/10 bg-black/30">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 marker:content-none">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-grid-primary">{moment.title}</p>
                                        <span className="material-icons text-sm text-grid-primary/80 transition-transform duration-200 group-open/moment:rotate-180">
                                            expand_more
                                        </span>
                                    </summary>
                                    <p className="border-t border-white/10 px-3 pb-3 pt-2 text-[11px] leading-relaxed text-gray-300">
                                        {moment.detail}
                                    </p>
                                </details>
                            ))}
                        </div>

                        <div className="mt-4 grid gap-2">
                            {recap.sectorNarrative.map((sector) => (
                                <details key={sector.sector} className="group/sector rounded-lg border border-white/10 bg-black/20">
                                    <summary className="flex cursor-pointer list-none items-center justify-between p-3 marker:content-none">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-200">{sector.sector}</p>
                                        <span className="material-icons text-sm text-gray-400 transition-transform duration-200 group-open/sector:rotate-180">
                                            expand_more
                                        </span>
                                    </summary>
                                    <p className="border-t border-white/10 px-3 pb-3 pt-2 text-[11px] leading-relaxed text-gray-400">
                                        {sector.summary}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </details>
            )}

            {!recap && hasRaceFinished && (
                <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-300">Race Recap</p>
                    <p className="mt-2 text-[11px] text-gray-400">Recap feed is still syncing for this race.</p>
                </div>
            )}

            {/* Weekend Schedule */}
            <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Weekend Schedule
                </h4>
                <div className="space-y-2">
                    {defaultSessions.map((session) => {
                        const sessionDate = session.startsAt ? new Date(session.startsAt) : null;
                        const isRace = session.code === "RACE";

                        return (
                            <div
                                key={session.code}
                                className={`flex items-center justify-between p-3 rounded-lg ${isRace
                                        ? "bg-grid-primary/10 border border-grid-primary/30"
                                        : "bg-white/5 border border-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-2 h-2 rounded-full ${isRace ? "bg-grid-primary" : "bg-gray-600"
                                            }`}
                                    ></div>
                                    <div>
                                        <p className={`text-xs font-bold ${isRace ? "text-white" : "text-gray-300"}`}>
                                            {session.label}
                                        </p>
                                        {sessionDate && (
                                            <p className="text-[10px] text-gray-500">
                                                {sessionDate.toLocaleDateString("en-US", {
                                                    weekday: "short",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs font-mono text-gray-400">
                                    {sessionDate
                                        ? sessionDate.toLocaleTimeString("en-US", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            hour12: false,
                                        })
                                        : "TBD"}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Telemetry Sectors */}
            {sectors && sectors.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Sector Analysis
                    </h4>
                    <div className="space-y-3">
                        {sectors.map((sector) => (
                            <div
                                key={sector.id}
                                className="p-4 rounded-lg bg-gradient-to-r from-surface-dark to-background-dark border border-white/5"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <span
                                        className={`w-2 h-2 rounded-full ${sector.id === "S1"
                                                ? "bg-primary"
                                                : sector.id === "S2"
                                                    ? "bg-accent-green"
                                                    : "bg-accent-gold"
                                            }`}
                                    ></span>
                                    <span className="text-xs font-bold text-white">{sector.name}</span>
                                </div>
                                <p className="text-[10px] text-gray-400 leading-relaxed">{sector.telemetry}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </aside>
    );
}
