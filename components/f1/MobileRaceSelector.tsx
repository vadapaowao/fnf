"use client";

import { useRouter } from "next/navigation";

import type { Race } from "@/lib/f1";

type MobileRaceSelectorProps = {
  races: Race[];
  currentRound: string;
};

export default function MobileRaceSelector({ races, currentRound }: MobileRaceSelectorProps) {
  const router = useRouter();

  return (
    <div className="border-b border-white/10 bg-[#080808] px-3 py-2.5 sm:px-4 sm:py-3 xl:hidden">
      <label htmlFor="mobile-race-selector" className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-grid-primary">
        Select race
      </label>
      <div className="relative">
        <select
          id="mobile-race-selector"
          value={currentRound}
          onChange={(event) => router.push(`/f1/race/${event.target.value}`)}
          className="min-h-12 w-full appearance-none rounded-lg border border-white/10 bg-[#111] px-3 py-2.5 pr-10 text-sm font-semibold text-white outline-none focus:border-grid-primary"
        >
          {races.map((race) => (
            <option key={race.round} value={race.round}>
              R{String(race.round).padStart(2, "0")} · {race.raceName}
            </option>
          ))}
        </select>
        <span className="material-icons pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-base text-grid-primary">
          expand_more
        </span>
      </div>
    </div>
  );
}
