import RaceIntelPanel from "@/components/f1/RaceIntelPanel";
import RaceSidebar from "@/components/f1/RaceSidebar";
import TrackHero from "@/components/f1/TrackHero";
import { getFeaturedRaceBundle } from "@/lib/f1";

export const revalidate = 60;

export default async function F1GridPage() {
  const bundle = await getFeaturedRaceBundle();

  if (!bundle) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background-dark px-6 text-sm text-gray-400">
        Race data unavailable.
      </main>
    );
  }

  const { races, race, detail, recap, replay, sessions } = bundle;

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid bg-grid-pattern-size opacity-20 pointer-events-none" />
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <RaceSidebar races={races} currentRaceRound={Number(race.round)} />
        <TrackHero
          race={race}
          trackSvgPath={detail.circuit.trackSvgPath || null}
          sectors={detail.circuit.sectors}
          drsZoneCount={detail.circuit.drsZones}
          recap={recap}
          replay={replay}
        />
        <RaceIntelPanel
          race={race}
          circuitStats={{
            lengthKm: detail.circuit.lengthKm,
            turns: detail.circuit.turns,
            drsZones: detail.circuit.drsZones,
            firstGrandPrix: detail.circuit.firstGrandPrix,
          }}
          lastWinner={detail.stats.lastWinner}
          fastestLap={detail.stats.fastestLap}
          sectors={detail.circuit.sectors}
          recap={recap}
          sessions={sessions}
        />
      </div>
    </main>
  );
}
