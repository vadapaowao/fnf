import RaceWorkspace from "@/components/f1/RaceWorkspace";
import { getFeaturedRaceBundle } from "@/lib/f1";

export const revalidate = 1800;

export default async function F1GridPage() {
  const bundle = await getFeaturedRaceBundle();

  if (!bundle) {
    return (
      <main className="flex flex-1 items-center justify-center bg-background-dark px-6 text-sm text-gray-400">
        Race data unavailable.
      </main>
    );
  }

  const { races, race, detail, recap, replay, sessions, runtime } = bundle;

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid bg-grid-pattern-size opacity-20 pointer-events-none" />
      <RaceWorkspace
        races={races}
        race={race}
        trackSvgPath={detail.circuit.trackSvgPath || null}
        sectors={detail.circuit.sectors}
        drsZoneCount={detail.circuit.drsZones}
        recap={recap}
        replay={replay}
        sessions={sessions}
        runtime={runtime}
        circuitStats={{
          lengthKm: detail.circuit.lengthKm,
          turns: detail.circuit.turns,
          drsZones: detail.circuit.drsZones,
          firstGrandPrix: detail.circuit.firstGrandPrix,
        }}
        lastWinner={detail.stats.lastWinner}
        fastestLap={detail.stats.fastestLap}
      />
    </main>
  );
}
