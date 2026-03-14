import Image from "next/image";
import Link from "next/link";

import { getRaceCalendar, getTrackSvgPathByCircuitId, isUpcomingRace } from "@/lib/f1";

function formatRaceDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function GridPreviewSection() {
  const raceCalendar = await getRaceCalendar();
  const upcomingRaces = raceCalendar.filter(isUpcomingRace).slice(0, 3).map((race) => ({
    ...race,
    trackSvgPath: getTrackSvgPathByCircuitId(race.circuitId),
  }));

  return (
    <section className="relative -mt-10 overflow-hidden bg-transparent pb-24 pt-10 md:-mt-14 md:pt-14">
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-grid-pattern-landing bg-grid-pattern-size opacity-10" />
      <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-primary/10 blur-[120px]" />
      <div className="container relative z-10 mx-auto px-4">
        <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Next Three Rounds</p>
            <h2 className="mb-2 mt-3 font-display text-5xl font-bold italic tracking-tighter text-white md:text-7xl">
              LIGHTS OUT AHEAD
            </h2>
            <p className="max-w-md font-body text-gray-400">
              Three races coming up. Pick one and get straight into the weekend.
            </p>
          </div>
          <Link
            href="/f1"
            className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:text-primary"
          >
            <span className="border-b border-primary pb-1">Open F1</span>
            <span className="material-icons text-sm">arrow_forward</span>
          </Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {upcomingRaces.map((race) => (
            <Link
              key={race.round}
              href={`/f1/race/${race.round}`}
              className="block min-w-0"
            >
              <div className="glass-card group relative h-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-surface-dark to-black p-6 transition-all hover:-translate-y-1 hover:border-primary/40">
                <div className="flex items-center gap-3">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                    Round {race.round}
                  </span>
                </div>
                <div className="mb-4 mt-8 flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/20 px-4 opacity-80 transition-opacity group-hover:opacity-100">
                  {race.trackSvgPath ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={race.trackSvgPath}
                        alt={`${race.circuitName} track map`}
                        fill
                        unoptimized
                        className="object-contain [filter:brightness(0)_saturate(100%)_invert(100%)_drop-shadow(0_0_8px_rgba(255,40,0,0.45))]"
                        sizes="(min-width: 1024px) 30vw, 100vw"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px]">
                      <p className="font-mono text-xl font-bold uppercase tracking-[0.26em] text-gray-600">Track Map</p>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-gray-500">Loading circuit</p>
                    </div>
                  )}
                </div>
                <div className="mb-6 space-y-1">
                  <h3 className="font-display text-3xl font-bold text-white">
                    {race.raceName}
                  </h3>
                  <p className="font-body text-sm uppercase tracking-wider text-gray-400">
                    {race.locality}, {race.country}
                  </p>
                </div>
                <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 font-display text-xs uppercase text-gray-500">Race Date</p>
                    <p className="font-mono text-sm text-primary">{formatRaceDate(race.date)}</p>
                  </div>
                  <div>
                    <p className="mb-1 font-display text-xs uppercase text-gray-500">Circuit</p>
                    <p className="truncate text-sm text-gray-300">{race.circuitName}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
