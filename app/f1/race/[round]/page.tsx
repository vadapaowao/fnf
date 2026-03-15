import { notFound } from "next/navigation";

import RaceIntelPanel from "@/components/f1/RaceIntelPanel";
import RaceSidebar from "@/components/f1/RaceSidebar";
import TrackHero from "@/components/f1/TrackHero";
import { getRaceCalendar, getRaceDetailByRound, getRacePageBundle, isScheduledRace } from "@/lib/f1";

export const revalidate = 60;

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
  const { races, race, detail, recap, replay, sessions } = bundle;

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="absolute inset-0 z-0 bg-grid bg-grid-pattern-size opacity-20 pointer-events-none" />
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <RaceSidebar races={races} highlightedRound={Number(params.round)} />
        <TrackHero
          race={race}
          trackSvgPath={detail.circuit.trackSvgPath}
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
          sessions={sessions}
          sectors={detail.circuit.sectors}
          recap={recap}
        />
      </div>
    </main>
  );
}
