import Image from "next/image";
import Link from "next/link";

import LocalDateTimeText from "@/components/f1/LocalDateTimeText";
import { getRaceCalendar, getTrackSvgPathByCircuitId, isUpcomingRace } from "@/lib/f1";

export default async function GridPreviewSection() {
  const raceCalendar = await getRaceCalendar();
  const upcomingRaces = raceCalendar.filter(isUpcomingRace).slice(0, 3);

  if (upcomingRaces.length === 0) {
    return null;
  }

  return (
    <section className="relative overflow-hidden bg-black px-4 pb-20 pt-6">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px] opacity-10" />
      <div className="absolute left-0 top-12 h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Lights out ahead</p>
            <h2 className="mt-2 font-display text-4xl font-black italic tracking-tight text-white md:text-6xl">
              Next three rounds
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-gray-400">
            The next stretch of the season, with local race times for you.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {upcomingRaces.map((race) => {
            const trackSvgPath = getTrackSvgPathByCircuitId(race.circuitId);

            return (
              <Link
                key={race.round}
                href={`/f1/race/${race.round}`}
                className="group rounded-[1.75rem] border border-white/10 bg-[linear-gradient(165deg,rgba(17,17,17,0.96),rgba(6,6,6,0.98))] p-5 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                    Round {race.round}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                    {race.country}
                  </span>
                </div>

                <div className="mt-6 flex h-40 items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-black/30 px-4">
                  {trackSvgPath ? (
                    <Image
                      src={trackSvgPath}
                      alt={`${race.circuitName} map`}
                      width={420}
                      height={180}
                      className="h-full w-full object-contain opacity-90 [filter:brightness(0)_invert(1)] transition-opacity duration-300 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]">
                      <span className="font-mono text-3xl font-black tracking-[0.22em] text-white/20">TRACK</span>
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <h3 className="font-display text-3xl font-black italic text-white">
                    {race.raceName.replace("Grand Prix", "GP")}
                  </h3>
                  <p className="mt-1 text-sm uppercase tracking-[0.14em] text-gray-500">
                    {race.circuitName} • {race.locality}
                  </p>
                </div>

                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Lights out</p>
                  <p className="mt-2 text-sm text-gray-200">
                    <LocalDateTimeText
                      iso={`${race.date}T${race.time}`}
                      fallback={race.date}
                      options={{
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZoneName: "short"
                      }}
                    />
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
