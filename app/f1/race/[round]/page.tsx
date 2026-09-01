import { notFound } from "next/navigation";

import RaceWorkspace from "@/components/f1/RaceWorkspace";
import { getRaceCalendar, getRaceDetailByRound, getRacePageBundle, isScheduledRace } from "@/lib/f1";

export const revalidate = 1800;

type RaceDetailPageProps = {
  params: {
    round: string;
  };
};

export async function generateStaticParams() {
  const races = await getRaceCalendar();
  return races.filter(isScheduledRace).map((race) => ({ round: race.round }));
}

export async function generateMetadata({ params }: RaceDetailPageProps) {
  const detail = await getRaceDetailByRound(params.round);

  if (!detail) {
    return {
      title: "Race Not Found",
    };
  }

  return {
    title: `${detail.race.raceName} (Round ${detail.race.round}) — The Grid`,
    description: `${detail.race.raceName} at ${detail.circuit.name}, ${detail.circuit.location}`,
  };
}

export default async function RaceDetailPage({ params }: RaceDetailPageProps) {
  const bundle = await getRacePageBundle(params.round);

  if (!bundle) {
    notFound();
  }
  const { races, race, detail, recap, replay, sessions, runtime } = bundle;

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid bg-grid-pattern-size opacity-20 pointer-events-none" />
      <RaceWorkspace
        races={races}
        race={race}
        trackSvgPath={detail.circuit.trackSvgPath}
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
