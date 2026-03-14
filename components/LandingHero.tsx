import Image from "next/image";
import Link from "next/link";

import type { ConstructorStanding, DriverStanding, Race } from "@/lib/f1";

type LandingHeroProps = {
  nextRace: Race | null;
  leadDriver: DriverStanding | null;
  leadConstructor: ConstructorStanding | null;
};

function formatRaceDate(race: Race | null) {
  if (!race) {
    return "Calendar loading";
  }

  return new Date(`${race.date}T${race.time}`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatRaceTime(race: Race | null) {
  if (!race) {
    return "TBD";
  }

  return new Date(`${race.date}T${race.time}`).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

export default function LandingHero({ nextRace, leadDriver, leadConstructor }: LandingHeroProps) {
  return (
    <header id="hero" className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 z-0 overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(180,20,0,0.35)_0%,#000_70%)]">
        <Image
          alt="Formula 1 racing car"
          className="h-full w-full object-cover opacity-35 contrast-125 saturate-110"
          src="/images/f1-hero.jpg"
          fill
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.78)_62%,rgba(0,0,0,0.94)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(225,6,0,0.22),transparent_34%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] opacity-20" />
        <div className="absolute -left-24 top-24 h-64 w-64 rounded-full bg-primary/20 blur-[110px]" />
        <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-[#8F130A]/20 blur-[120px]" />
      </div>

      <div className="relative z-20 container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-center">
          <div className="max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary font-display">
                2026 Formula 1 Dashboard
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Track-first race intelligence
              </span>
            </div>
            <h1 className="mt-6 font-display text-6xl font-black italic leading-[0.88] tracking-tighter text-white drop-shadow-[0_0_28px_rgba(225,6,0,0.58)] md:text-8xl lg:text-[9rem]">
              THE GRID
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl">
              The ultimate Formula 1 dashboard. Drivers, circuits, race intel — all in one place.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                href="/f1"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-primary px-8 py-4 font-display text-sm font-bold uppercase tracking-[0.24em] text-white shadow-[0_0_24px_rgba(225,6,0,0.34)] transition-transform duration-300 hover:scale-105"
              >
                <span className="relative z-10">Enter The Grid</span>
                <span className="material-icons relative z-10 text-sm transition-transform group-hover:translate-x-1">arrow_forward</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>
              <div className="flex flex-wrap gap-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-2">24 Rounds</span>
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-2">11 Constructors</span>
                <span className="rounded-full border border-white/10 bg-black/25 px-3 py-2">Full 2026 Grid</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(225,6,0,0.14),transparent_40%)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(155deg,rgba(18,18,18,0.95),rgba(6,6,6,0.98))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Race Control</p>
                  <p className="mt-1 text-lg font-black uppercase tracking-tight text-white">What matters next</p>
                </div>
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Live Product Signal
                </span>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-primary/15 bg-[linear-gradient(145deg,rgba(225,6,0,0.1),rgba(15,15,15,0.96))] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary">Next Lights Out</p>
                    <h2 className="mt-3 font-display text-3xl font-black italic leading-none text-white">
                      {nextRace?.raceName ?? "Season Loading"}
                    </h2>
                    <p className="mt-3 text-sm uppercase tracking-[0.14em] text-gray-400">
                      {nextRace?.circuitName ?? "Circuit data incoming"}
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-300">
                    R{nextRace?.round ?? "—"}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Date</p>
                    <p className="mt-2 font-mono text-xl font-bold text-white">{formatRaceDate(nextRace)}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">UTC Start</p>
                    <p className="mt-2 font-mono text-xl font-bold text-white">{formatRaceTime(nextRace)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <article className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Driver Lead</p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {leadDriver ? `${leadDriver.driver.givenName} ${leadDriver.driver.familyName}` : "Standings loading"}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                    <span className="font-mono text-white">{leadDriver?.points ?? "—"} pts</span>
                    <span className="font-mono text-white">{leadDriver?.wins ?? "—"} wins</span>
                  </div>
                </article>
                <article className="rounded-[1.5rem] border border-white/10 bg-black/25 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Constructor Lead</p>
                  <p className="mt-3 text-2xl font-black text-white">
                    {leadConstructor?.constructor.name ?? "Standings loading"}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-400">
                    <span className="font-mono text-white">{leadConstructor?.points ?? "—"} pts</span>
                    <span className="font-mono text-white">{leadConstructor?.wins ?? "—"} wins</span>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 opacity-50">
        <span className="text-[10px] uppercase tracking-widest text-primary font-display">Scroll</span>
        <div className="h-12 w-[1px] bg-gradient-to-b from-primary to-transparent" />
      </div>
    </header>
  );
}
