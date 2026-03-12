"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Race } from "@/lib/f1";

interface RaceSidebarProps {
    races: Race[];
    currentRaceRound?: number;
    highlightedRound?: number;
}

export default function RaceSidebar({ races, currentRaceRound, highlightedRound }: RaceSidebarProps) {
    const SIDEBAR_SCROLL_KEY = "f1-race-sidebar-scroll-top";
    const SIDEBAR_SEARCH_KEY = "f1-race-sidebar-search";

    const now = new Date();
    const activeRound = highlightedRound ?? currentRaceRound;
    const pathname = usePathname();
    const listRef = useRef<HTMLDivElement | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const savedQuery = sessionStorage.getItem(SIDEBAR_SEARCH_KEY);
        if (savedQuery) {
            setSearchTerm(savedQuery);
        }
    }, []);

    useEffect(() => {
        sessionStorage.setItem(SIDEBAR_SEARCH_KEY, searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        const list = listRef.current;
        if (!list) return;

        const savedScroll = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) ?? "0");
        if (Number.isFinite(savedScroll) && savedScroll > 0) {
            list.scrollTop = savedScroll;
        }
    }, [pathname]);

    const persistScroll = () => {
        const list = listRef.current;
        if (!list) return;
        sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(list.scrollTop));
    };

    const getRaceStatus = (race: Race) => {
        const raceDate = new Date(race.date);
        if (raceDate < now) return "FINISHED";
        if (activeRound && String(activeRound) === race.round) return "LIVE";
        return "UPCOMING";
    };

    const filteredRaces = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return races;

        return races.filter((race) =>
            [race.raceName, race.circuitName, race.locality, race.country, `round ${race.round}`]
                .join(" ")
                .toLowerCase()
                .includes(query)
        );
    }, [races, searchTerm]);

    return (
        <aside className="w-80 border-r border-white/10 flex flex-col bg-background-dark/80 backdrop-blur-sm z-10 shrink-0 h-full overflow-hidden">
            <div className="p-6 border-b border-white/10">
                <h2 className="text-xs font-bold text-grid-primary uppercase tracking-widest mb-1">
                    Select Race
                </h2>
                <div className="relative">
                    <span className="material-icons absolute left-3 top-2.5 text-gray-500 text-sm">
                        search
                    </span>
                    <input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        className="w-full bg-surface-dark/50 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm focus:border-grid-primary focus:ring-0 placeholder-gray-600 text-white outline-none"
                        placeholder="Filter Grand Prix..."
                        type="text"
                    />
                </div>
            </div>
            <div ref={listRef} onScroll={persistScroll} className="overflow-y-auto custom-scrollbar flex-1 p-4 space-y-3">
                {filteredRaces.map((race) => {
                    const status = getRaceStatus(race);
                    const isActive = activeRound && race.round === String(activeRound);

                    return (
                        <Link
                            key={race.round}
                            href={`/f1/race/${race.round}`}
                            onClick={persistScroll}
                            className={`group cursor-pointer p-4 rounded-lg border transition-all block ${isActive
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
                                    <button
                                        type="button"
                                        onClick={(event) => {
                                            event.preventDefault();
                                            event.stopPropagation();
                                            window.open("https://www.fancode.com", "_blank", "noopener,noreferrer");
                                        }}
                                        className="flex items-center gap-1 text-[10px] bg-grid-primary text-black px-1.5 py-0.5 rounded font-bold animate-pulse hover:bg-white"
                                    >
                                        <span className="material-icons text-[10px]">live_tv</span> WATCH LIVE
                                    </button>
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
                                    <p className="text-xs text-gray-400">{race.locality}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
                {filteredRaces.length === 0 && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                            No races match: {searchTerm}
                        </p>
                    </div>
                )}
            </div>
        </aside>
    );
}
