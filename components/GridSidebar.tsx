"use client";

import { type Race } from "@/lib/f1";

interface GridSidebarProps {
    races: Race[];
    currentRaceRound?: number;
}

export default function GridSidebar({ races, currentRaceRound = 1 }: GridSidebarProps) {
    const now = new Date();

    const getRaceStatus = (race: Race) => {
        const raceDate = new Date(race.date);
        if (raceDate < now) return "FINISHED";
        if (String(currentRaceRound) === race.round) return "LIVE";
        return "UPCOMING";
    };

    return (
        <aside className="w-80 border-r border-white/10 flex flex-col bg-background-light/50 dark:bg-background-dark/80 backdrop-blur-sm z-10 shrink-0 h-full overflow-hidden">
            <div className="p-6 border-b border-white/10">
                <h2 className="text-xs font-bold text-grid-primary uppercase tracking-widest mb-1">
                    Select Race
                </h2>
                <div className="relative">
                    <span className="material-icons absolute left-3 top-2.5 text-gray-500 text-sm">
                        search
                    </span>
                    <input
                        className="w-full bg-surface-dark/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:border-grid-primary focus:ring-0 placeholder-gray-600 text-white outline-none"
                        placeholder="Filter Grand Prix..."
                        type="text"
                    />
                </div>
            </div>
            <div className="overflow-y-auto custom-scrollbar flex-1 p-4 space-y-3">
                {races.map((race) => {
                    const status = getRaceStatus(race);
                    const isActive = race.round === String(currentRaceRound);

                    return (
                        <div
                            key={race.round}
                            className={`group cursor-pointer p-4 rounded-lg border transition-all ${isActive
                                ? "border-grid-primary bg-grid-primary/10 bg-stripes relative overflow-hidden neon-border transform scale-[1.02]"
                                : "border-white/5 hover:bg-white/5 hover:border-grid-primary/50 opacity-60"
                                }`}
                        >
                            {isActive && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-grid-primary/20 to-transparent rounded-bl-full -mr-8 -mt-8"></div>
                            )}
                            <div className="flex justify-between items-start mb-2 relative z-10">
                                <span
                                    className={`text-[10px] font-mono ${isActive ? "text-grid-primary font-bold" : "text-gray-500"
                                        }`}
                                >
                                    R{String(race.round).padStart(2, "0")} •{" "}
                                    {new Date(race.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "2-digit",
                                    })}
                                </span>
                                {isActive && status === "LIVE" && (
                                    <span className="flex items-center gap-1 text-[10px] bg-grid-primary text-black px-1.5 py-0.5 rounded font-bold animate-pulse">
                                        <span className="material-icons text-[10px]">live_tv</span> LIVE
                                    </span>
                                )}
                                {!isActive && (
                                    <span className="text-xs text-gray-500 font-mono">{status}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 relative z-10">
                                <div
                                    className={`w-1 rounded-full ${isActive
                                        ? "bg-grid-primary h-10 shadow-[0_0_10px_#f91f1f]"
                                        : "bg-gray-700 h-8 group-hover:bg-grid-primary"
                                        } transition-colors`}
                                ></div>
                                <div className="flex-1">
                                    <h3
                                        className={`font-bold uppercase text-white ${isActive
                                            ? "text-lg leading-tight"
                                            : "text-sm group-hover:text-grid-primary"
                                            } transition-colors`}
                                    >
                                        {race.raceName.replace("Grand Prix", "GP")}
                                    </h3>
                                    <p className="text-xs text-gray-400">
                                        {race.locality}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}
