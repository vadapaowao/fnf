import { notFound } from "next/navigation";
import { getRaceCalendar, getRaceDetailByRound } from "@/lib/f1";
import RaceSidebar from "@/components/f1/RaceSidebar";
import TrackHero from "@/components/f1/TrackHero";
import RaceIntelPanel from "@/components/f1/RaceIntelPanel";

type RaceDetailPageProps = {
  params: {
    round: string;
  };
};

export async function generateStaticParams() {
  const races = await getRaceCalendar();
  return races.map((race) => ({ round: race.round }));
}

export async function generateMetadata({ params }: RaceDetailPageProps) {
  const detail = await getRaceDetailByRound(params.round);

  if (!detail) {
    return {
      title: "Race Not Found",
    };
  }

  return {
    title: `${detail.race.raceName} (Round ${detail.race.round}) - Arena F1`,
    description: `${detail.race.raceName} at ${detail.circuit.name}, ${detail.circuit.location}`,
  };
}

export default async function RaceDetailPage({ params }: RaceDetailPageProps) {
  const races = await getRaceCalendar();
  const detail = await getRaceDetailByRound(params.round);

  if (!detail) {
    notFound();
  }

  return (
    <main className="flex-1 flex overflow-hidden relative">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none z-0 bg-grid-pattern-size"></div>
      <RaceSidebar
        races={races}
        highlightedRound={Number(params.round)}
      />
      <TrackHero
        race={detail.race}
        trackSvgPath={detail.circuit.trackSvgPath}
      />
      <RaceIntelPanel
        race={detail.race}
        circuitStats={{
          lengthKm: detail.circuit.lengthKm,
          turns: detail.circuit.turns,
          drsZones: detail.circuit.drsZones,
          firstGrandPrix: detail.circuit.firstGrandPrix,
        }}
        lastWinner={detail.stats.lastWinner}
        fastestLap={detail.stats.fastestLap}
        sectors={detail.circuit.sectors}
      />
    </main>
  );
}
