import { type Race, type RaceSession, type TrackSector } from "@/lib/f1";

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
    sessions?: RaceSession[];
    sectors?: TrackSector[];
}

export default function RaceIntelPanel({
    race,
    circuitStats,
    lastWinner,
    fastestLap,
    sessions,
    sectors,
}: RaceIntelPanelProps) {
    const defaultSessions: RaceSession[] = sessions || [
        { code: "FP1", label: "Practice 1", startsAt: "" },
        { code: "FP2", label: "Practice 2", startsAt: "" },
        { code: "FP3", label: "Practice 3", startsAt: "" },
        { code: "QUALI", label: "Qualifying", startsAt: "" },
        { code: "RACE", label: "Grand Prix", startsAt: race.date + "T" + race.time },
    ];

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
                <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-icons text-6xl text-white">emoji_events</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">
                        Last Winner
                    </h4>
                    <div className="relative z-10">
                        <p className="text-xl font-mono font-bold text-white">{lastWinner.driver}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 bg-accent-gold rounded-full"></span>
                            <p className="text-xs text-gray-300">
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
