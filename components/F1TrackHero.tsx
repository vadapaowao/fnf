import F1TelemetryPanel from "@/components/F1TelemetryPanel";
import TrackMap from "@/components/TrackMap";
import type { RaceDetail } from "@/lib/f1";

type F1TrackHeroProps = {
  detail: RaceDetail;
};

export default function F1TrackHero({ detail }: F1TrackHeroProps) {
  return (
    <section className="border border-[#262626] bg-[#0A0A0A] text-[#F3F3F3]">
      <div className="grid lg:grid-cols-[1.45fr_1fr]">
        <div className="relative border-b border-[#1f1f1f] px-5 py-6 lg:border-b-0 lg:px-7 lg:py-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E10600]">Race {detail.race.round}</p>
              <h1 className="mt-2 text-3xl font-black uppercase leading-none tracking-tight md:text-4xl">
                {detail.race.raceName}
              </h1>
              <p className="mt-2 text-sm uppercase tracking-[0.12em] text-[#9E9E9E]">
                {detail.circuit.name} | {detail.circuit.location}, {detail.circuit.country}
              </p>
            </div>
          </div>

          <TrackMap
            circuitId={detail.circuit.circuitId}
            trackSvgPath={detail.circuit.trackSvgPath}
            sectors={detail.circuit.sectors}
            drsZoneCount={detail.circuit.drsZones}
            className="border-0 bg-transparent p-0"
          />
        </div>

        <F1TelemetryPanel detail={detail} />
      </div>
    </section>
  );
}
