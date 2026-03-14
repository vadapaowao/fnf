"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { type Race } from "@/lib/f1";
import { getFeaturedRace, getProductRaceState } from "@/lib/f1-product";

interface RaceSidebarProps {
  races: Race[];
  currentRaceRound?: number;
  highlightedRound?: number;
}

export default function RaceSidebar({ races, currentRaceRound, highlightedRound }: RaceSidebarProps) {
  const SIDEBAR_SCROLL_KEY = "f1-race-sidebar-scroll-top";
  const SIDEBAR_SEARCH_KEY = "f1-race-sidebar-search";

  const now = new Date();
  const featuredRace = getFeaturedRace(races, now);
  const activeRound = highlightedRound ?? currentRaceRound ?? Number(featuredRace?.round ?? 0);
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
    if (!list) {
      return;
    }

    const savedScroll = Number(sessionStorage.getItem(SIDEBAR_SCROLL_KEY) ?? "0");
    if (Number.isFinite(savedScroll) && savedScroll > 0) {
      list.scrollTop = savedScroll;
    }
  }, [pathname]);

  const persistScroll = () => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    sessionStorage.setItem(SIDEBAR_SCROLL_KEY, String(list.scrollTop));
  };

  const getRaceStatus = (race: Race) => {
    const state = getProductRaceState(race, now);
    if (state === "live") return "LIVE";
    if (state === "finished") return activeRound && String(activeRound) === race.round ? "RECAP" : "FINISHED";
    return "UPCOMING";
  };

  const filteredRaces = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return races;
    }

    return races.filter((race) =>
      [race.raceName, race.circuitName, race.locality, race.country, `round ${race.round}`]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [races, searchTerm]);

  return (
    <aside className="z-10 flex h-full w-80 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-background-dark/80 backdrop-blur-sm">
      <div className="border-b border-white/10 p-6">
        <h2 className="mb-1 text-xs font-bold uppercase tracking-widest text-grid-primary">
          Select Race
        </h2>
        <div className="relative">
          <span className="material-icons absolute left-3 top-2.5 text-sm text-gray-500">
            search
          </span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-lg border border-white/10 bg-surface-dark/50 py-2 pl-9 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-grid-primary focus:ring-0"
            placeholder="Filter Grand Prix..."
            type="text"
          />
        </div>
      </div>
      <div ref={listRef} onScroll={persistScroll} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
        {filteredRaces.map((race) => {
          const status = getRaceStatus(race);
          const isActive = activeRound && race.round === String(activeRound);

          return (
            <Link
              key={race.round}
              href={`/f1/race/${race.round}`}
              onClick={persistScroll}
              className={`group relative block cursor-pointer rounded-lg border p-4 transition-all ${
                isActive
                  ? "neon-border scale-[1.02] overflow-hidden border-grid-primary bg-grid-primary/10 bg-stripes"
                  : "border-white/5 opacity-60 hover:border-grid-primary/50 hover:bg-white/5"
              }`}
            >
              {isActive ? (
                <div className="absolute -right-8 -top-8 h-16 w-16 rounded-bl-full bg-gradient-to-br from-grid-primary/20 to-transparent" />
              ) : null}
              <div className="relative z-10 mb-2 flex items-start justify-between">
                <span className={`text-[10px] font-mono ${isActive ? "font-bold text-grid-primary" : "text-gray-500"}`}>
                  R{String(race.round).padStart(2, "0")} • {new Date(race.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
                {isActive && status === "LIVE" ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      window.open("https://www.fancode.com", "_blank", "noopener,noreferrer");
                    }}
                    className="flex items-center gap-1 rounded bg-grid-primary px-1.5 py-0.5 text-[10px] font-bold text-black animate-pulse hover:bg-white"
                  >
                    <span className="material-icons text-[10px]">live_tv</span>
                    WATCH LIVE
                  </button>
                ) : null}
                {!isActive ? <span className="font-mono text-xs text-gray-500">{status}</span> : null}
              </div>
              <div className="relative z-10 flex items-center gap-3">
                <div
                  className={`w-1 rounded-full transition-colors ${
                    isActive
                      ? "h-10 bg-grid-primary shadow-[0_0_10px_#f91f1f]"
                      : "h-8 bg-gray-700 group-hover:bg-grid-primary"
                  }`}
                />
                <div className="flex-1">
                  <h3
                    className={`font-bold uppercase text-white transition-colors ${
                      isActive ? "text-lg leading-tight" : "text-sm group-hover:text-grid-primary"
                    }`}
                  >
                    {race.raceName.replace("Grand Prix", "GP")}
                  </h3>
                  <p className="text-xs text-gray-400">{race.locality}</p>
                </div>
              </div>
            </Link>
          );
        })}
        {filteredRaces.length === 0 ? (
          <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              No races match: {searchTerm}
            </p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
