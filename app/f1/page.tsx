import RaceIntelPanel from "@/components/f1/RaceIntelPanel";
import RaceSidebar from "@/components/f1/RaceSidebar";
import TrackHero from "@/components/f1/TrackHero";
import {
  getRaceCalendar,
  getRaceDetailByRound,
  getRaceRecapByRound,
  getRaceReplayByRound,
  getRaceWeekendSessionsWithResults,
} from "@/lib/f1";
import { getFeaturedRace } from "@/lib/f1-product";

export const revalidate = 60;

export default async function F1GridPage() {
  const races = await getRaceCalendar();
  const currentRace = getFeaturedRace(races) ?? races[0] ?? null;

  if (!currentRace) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background-dark px-6 text-sm text-gray-400">
        Race data unavailable.
      </main>
    );
  }

  const [raceDetail, recap, replay, sessions] = await Promise.all([
    getRaceDetailByRound(currentRace.round),
    getRaceRecapByRound(currentRace.round),
    getRaceReplayByRound(currentRace.round),
    getRaceWeekendSessionsWithResults(currentRace),
  ]);

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid bg-grid-pattern-size opacity-20 pointer-events-none" />
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <RaceSidebar races={races} currentRaceRound={Number(currentRace.round)} />
        <TrackHero
          race={currentRace}
          trackSvgPath={raceDetail?.circuit.trackSvgPath || null}
          sectors={raceDetail?.circuit.sectors}
          drsZoneCount={raceDetail?.circuit.drsZones}
          recap={recap}
          replay={replay}
        />
        <RaceIntelPanel
          race={currentRace}
          circuitStats={raceDetail ? {
            lengthKm: raceDetail.circuit.lengthKm,
            turns: raceDetail.circuit.turns,
            drsZones: raceDetail.circuit.drsZones,
            firstGrandPrix: raceDetail.circuit.firstGrandPrix,
          } : undefined}
          lastWinner={raceDetail?.stats.lastWinner}
          fastestLap={raceDetail?.stats.fastestLap}
          sectors={raceDetail?.circuit.sectors}
          recap={recap}
          sessions={sessions}
        />
      </div>
    </main>
  );
}
