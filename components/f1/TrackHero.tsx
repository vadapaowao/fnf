import TrackMap from "@/components/TrackMap";
import type { Race, TrackSector } from "@/lib/f1";

interface TrackHeroProps {
  race: Race;
  trackSvgPath?: string | null;
  sectors?: TrackSector[];
  drsZoneCount?: string;
}

export default function TrackHero({ race, trackSvgPath, sectors, drsZoneCount }: TrackHeroProps) {
  return (
    <section className="flex-1 bg-[#0A0A0A] px-4 py-5 md:px-6 md:py-6">
      <header className="mb-5 border border-[#232323] bg-[#0D0D0D] px-4 py-4 md:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E10600]">Race {race.round}</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#F4F4F4] md:text-4xl">{race.raceName}</h1>
        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9A9A9A] md:text-sm">
          {race.circuitName} | {race.locality}, {race.country}
        </p>
      </header>

      <TrackMap
        circuitId={race.circuitId}
        trackSvgPath={trackSvgPath ?? null}
        sectors={sectors}
        drsZoneCount={drsZoneCount}
      />
    </section>
  );
}
