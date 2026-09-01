"use client";

import { useState } from "react";

import MobileRaceSelector from "@/components/f1/MobileRaceSelector";
import RaceIntelPanel from "@/components/f1/RaceIntelPanel";
import RaceSidebar from "@/components/f1/RaceSidebar";
import TrackHero from "@/components/f1/TrackHero";
import type { Race, RaceRecap, RaceReplayData, RaceSession, TrackSector } from "@/lib/f1";
import type { RaceRuntimeState } from "@/lib/f1-product";

type MobileRaceTab = "track" | "weekend" | "story" | "compare";

type RaceWorkspaceProps = {
  races: Race[];
  race: Race;
  trackSvgPath?: string | null;
  sectors?: TrackSector[];
  drsZoneCount?: string;
  recap?: RaceRecap | null;
  replay?: RaceReplayData | null;
  sessions: RaceSession[];
  runtime: RaceRuntimeState;
  circuitStats: {
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
};

const tabs: Array<{ id: MobileRaceTab; label: string; icon: string }> = [
  { id: "track", label: "Track", icon: "route" },
  { id: "weekend", label: "Weekend", icon: "schedule" },
  { id: "story", label: "Story", icon: "auto_stories" },
  { id: "compare", label: "Compare", icon: "compare_arrows" }
];

export default function RaceWorkspace({
  races,
  race,
  trackSvgPath,
  sectors,
  drsZoneCount,
  recap,
  replay,
  sessions,
  runtime,
  circuitStats,
  lastWinner,
  fastestLap
}: RaceWorkspaceProps) {
  const [mobileTab, setMobileTab] = useState<MobileRaceTab>(runtime.raceState === "live" ? "weekend" : "track");

  const showTrack = () => {
    setMobileTab("track");
    window.setTimeout(() => {
      document.getElementById("race-highlights-player")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  };

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto xl:flex-row xl:overflow-hidden">
      <RaceSidebar races={races} currentRaceRound={Number(race.round)} className="hidden xl:flex" />
      <MobileRaceSelector races={races} currentRound={race.round} />

      <div className="border-b border-white/10 bg-[#080808] px-3 py-2 xl:hidden">
        <div className="grid grid-cols-4 gap-1 rounded-xl border border-white/10 bg-black/30 p-1" role="tablist" aria-label="Race sections">
          {tabs.map((tab) => {
            const active = mobileTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setMobileTab(tab.id)}
                className={`flex min-h-12 min-w-0 flex-col items-center justify-center gap-0.5 rounded-lg px-1 text-xs font-semibold transition-colors ${
                  active ? "bg-grid-primary text-white" : "text-gray-500"
                }`}
              >
                <span className="material-icons text-lg">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <TrackHero
        race={race}
        trackSvgPath={trackSvgPath}
        sectors={sectors}
        drsZoneCount={drsZoneCount}
        recap={recap}
        replay={replay}
        runtime={runtime}
        mobileTab={mobileTab}
        onSelectTrack={showTrack}
      />
      <RaceIntelPanel
        race={race}
        circuitStats={circuitStats}
        lastWinner={lastWinner}
        fastestLap={fastestLap}
        sectors={sectors}
        recap={recap}
        sessions={sessions}
        runtime={runtime}
        className={mobileTab === "weekend" ? "block" : "hidden xl:block"}
      />
    </div>
  );
}
