import { getRaceCalendar, getRaceDetailByRound, getRaceRecapByRound, getRaceReplayByRound, getRaceWeekendSessionsWithResults } from "@/lib/f1";
import RaceSidebar from "@/components/f1/RaceSidebar";
import TrackHero from "@/components/f1/TrackHero";
import RaceIntelPanel from "@/components/f1/RaceIntelPanel";
import { getFeaturedRace } from "@/lib/f1-product";

export default async function F1GridPage() {
  const races = await getRaceCalendar();
  const currentRace = getFeaturedRace(races) ?? races[0];

  const [raceDetail, recap, replay, sessions] = await Promise.all([
    getRaceDetailByRound(currentRace.round),
    getRaceRecapByRound(currentRace.round),
    getRaceReplayByRound(currentRace.round),
    getRaceWeekendSessionsWithResults(currentRace)
  ]);

  return (
    <main className="flex-1 flex overflow-hidden relative">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none z-0 bg-grid-pattern-size"></div>
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
    </main>
  );
}
