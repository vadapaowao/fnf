import TrackMap from "@/components/TrackMap";
import CountdownTimer from "@/components/CountdownTimer";
import type { Race, RaceRecap, RaceReplayData, TrackSector } from "@/lib/f1";

interface TrackHeroProps {
  race: Race;
  trackSvgPath?: string | null;
  sectors?: TrackSector[];
  drsZoneCount?: string;
  recap?: RaceRecap | null;
  replay?: RaceReplayData | null;
}

export default function TrackHero({ race, trackSvgPath, sectors, drsZoneCount, recap, replay }: TrackHeroProps) {
  return (
    <section className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-[#0A0A0A] px-4 py-5 md:px-6 md:py-6">
      <header className="mb-5 border border-[#232323] bg-[#0D0D0D] px-4 py-4 md:px-5">
        <div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E10600]">Race {race.round}</p>
            <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#F4F4F4] md:text-4xl">{race.raceName}</h1>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A9A9A] md:text-sm">
                {race.circuitName} | {race.locality}, {race.country}
              </p>
              <div className="w-full sm:w-auto sm:min-w-[360px] sm:max-w-[420px]">
                <CountdownTimer targetIso={`${race.date}T${race.time}`} variant="compact" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <TrackMap
        circuitId={race.circuitId}
        trackSvgPath={trackSvgPath ?? null}
        sectors={sectors}
        drsZoneCount={drsZoneCount}
        recap={recap}
        replay={replay}
      />
    </section>
  );
}
