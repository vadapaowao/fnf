"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Race } from "@/lib/f1";
import { getFeaturedRace, getProductRaceState } from "@/lib/f1-product";
import { trackGridEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface RaceSidebarProps {
  races: Race[];
  currentRaceRound?: number;
  highlightedRound?: number;
  className?: string;
}

function isScheduledSidebarRace(race: Race) {
  return race.status !== "canceled" && /^\d+$/.test(race.round);
}

export default function RaceSidebar({ races, currentRaceRound, highlightedRound, className }: RaceSidebarProps) {
  const SIDEBAR_SEARCH_KEY = "f1-race-sidebar-search";

  const scheduledRaces = useMemo(() => races.filter(isScheduledSidebarRace), [races]);
  const now = new Date();
  const featuredRace = getFeaturedRace(scheduledRaces, now);
  const activeRound = highlightedRound ?? currentRaceRound ?? Number(featuredRace?.round ?? 0);
  const pathname = usePathname();
  const listRef = useRef<HTMLDivElement | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [raceFilter, setRaceFilter] = useState<"all" | "next" | "finished">("all");

  useEffect(() => {
    const savedQuery = sessionStorage.getItem(SIDEBAR_SEARCH_KEY);
    if (savedQuery) {
      setSearchTerm(savedQuery);
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem(SIDEBAR_SEARCH_KEY, searchTerm);
  }, [searchTerm]);

  const getRaceStatus = (race: Race) => {
    const state = getProductRaceState(race, now);
    if (state === "live") return "LIVE";
    if (state === "finished") return activeRound && String(activeRound) === race.round ? "RECAP" : "FINISHED";
    return "UPCOMING";
  };

  const filteredRaces = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const stateFilteredRaces = scheduledRaces.filter((race) => {
      const state = getProductRaceState(race);
      if (raceFilter === "next") return state === "upcoming" || state === "live";
      if (raceFilter === "finished") return state === "finished";
      return true;
    });

    if (!query) return stateFilteredRaces;

    return stateFilteredRaces.filter((race) =>
      [race.raceName, race.circuitName, race.locality, race.country, `round ${race.round}`]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [raceFilter, scheduledRaces, searchTerm]);

  useEffect(() => {
    const list = listRef.current;
    const activeRace = list?.querySelector<HTMLElement>(`[data-race-round="${activeRound}"]`);

    if (!list || !activeRace) return;

    list.scrollTop = Math.max(activeRace.offsetTop - (list.clientHeight - activeRace.clientHeight) / 2, 0);
  }, [activeRound, filteredRaces, pathname]);

  return (
    <aside className={cn("z-10 flex h-full w-80 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-background-dark/80 backdrop-blur-sm", className)}>
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
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-black/25 p-1" aria-label="Filter races">
          {(["all", "next", "finished"] as const).map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setRaceFilter(filter)}
              className={`min-h-9 rounded-md px-2 text-xs font-bold uppercase tracking-[0.1em] transition-colors ${
                raceFilter === filter ? "bg-white text-black" : "text-gray-500 hover:text-white"
              }`}
            >
              {filter === "next" ? "Next" : filter}
            </button>
          ))}
        </div>
      </div>
      <div ref={listRef} className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-4">
        {filteredRaces.map((race) => {
          const status = getRaceStatus(race);
          const isActive = activeRound && race.round === String(activeRound);

          return (
            <Link
              key={race.round}
              href={`/f1/race/${race.round}`}
              data-race-round={race.round}
              onClick={() => trackGridEvent("race_selected", {
                race: race.raceName,
                round: race.round,
                source: "desktop_sidebar",
                status: status.toLowerCase()
              })}
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
                <span className={`text-xs font-mono ${isActive ? "font-bold text-grid-primary" : "text-gray-500"}`}>
                  R{String(race.round).padStart(2, "0")} • {new Date(race.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
                <span className={`font-mono text-xs ${status === "LIVE" ? "font-bold text-grid-primary" : "text-gray-500"}`}>
                  {status}
                </span>
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
