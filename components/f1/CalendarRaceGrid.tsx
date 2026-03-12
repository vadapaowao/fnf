"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Race } from "@/lib/f1";

type CalendarRaceGridProps = {
  races: Race[];
};

function getRaceStartMs(race: Race) {
  return new Date(`${race.date}T${race.time}`).getTime();
}

function formatCountdown(totalMs: number) {
  if (totalMs <= 0) {
    return "LIVE";
  }

  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return `${String(days).padStart(2, "0")}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(
    2,
    "0"
  )}m ${String(seconds).padStart(2, "0")}s`;
}

export default function CalendarRaceGrid({ races }: CalendarRaceGridProps) {
  const initialSelectedRound = useMemo(() => {
    const nowMs = Date.now();
    const upcomingRace = races.find((race) => getRaceStartMs(race) >= nowMs);
    return (upcomingRace ?? races[0])?.round ?? "";
  }, [races]);

  const [selectedRound, setSelectedRound] = useState(initialSelectedRound);
  const [nowMs, setNowMs] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedRound) {
      setSelectedRound(initialSelectedRound);
      return;
    }

    if (!races.some((race) => race.round === selectedRound)) {
      setSelectedRound(initialSelectedRound);
    }
  }, [initialSelectedRound, races, selectedRound]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {races.map((race) => {
        const raceStartMs = getRaceStartMs(race);
        const isPast = raceStartMs < nowMs;
        const isSelected = race.round === selectedRound;
        const countdown = formatCountdown(raceStartMs - nowMs);

        return (
          <article
            key={race.round}
            className={`rounded-xl border transition-all ${isPast
              ? "border-white/5 bg-background-dark/50 opacity-70"
              : "border-white/10 bg-gradient-to-br from-surface-dark to-background-dark"
              } ${isSelected ? "ring-1 ring-grid-primary/70" : ""}`}
          >
            <button
              type="button"
              onClick={() => setSelectedRound(race.round)}
              className="w-full p-6 text-left"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs font-mono text-gray-500">
                  ROUND {String(race.round).padStart(2, "0")}
                </span>
                <span
                  className={`rounded px-2 py-1 text-[10px] font-bold ${isPast
                    ? "bg-gray-800 text-gray-500"
                    : "bg-grid-primary/20 text-grid-primary"
                    }`}
                >
                  {isPast ? "FINISHED" : "UPCOMING"}
                </span>
              </div>

              <div className="mb-2 flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-bold text-white transition-colors group-hover:text-grid-primary">
                  {race.raceName}
                </h3>
                {isSelected && !isPast && (
                  <span className="rounded border border-grid-primary/40 bg-grid-primary/10 px-2 py-1 text-[10px] font-mono font-bold text-grid-primary">
                    {countdown}
                  </span>
                )}
              </div>

              <div className="mb-4 flex items-center gap-2 text-gray-400">
                <span className="material-icons text-sm">location_on</span>
                <span className="text-sm">
                  {race.locality}, {race.country}
                </span>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <span className="material-icons text-sm">event</span>
                <span className="text-sm font-mono">
                  {new Date(`${race.date}T00:00:00Z`).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="mt-4 border-t border-white/5 pt-4">
                <p className="truncate text-xs text-gray-500">{race.circuitName}</p>
              </div>
            </button>

            <div className="border-t border-white/5 px-6 py-3">
              <Link
                href={`/f1/race/${race.round}`}
                className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-grid-primary hover:text-white"
              >
                Open Race
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
