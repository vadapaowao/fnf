import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";

import DriverIdentityAvatar from "@/components/f1/drivers/DriverIdentityAvatar";
import LeclercSoundboard from "@/components/f1/LeclercSoundboard";
import { getDriverProfile } from "@/lib/driver-profile";
import { getDriverStandings, getRaceCalendar } from "@/lib/f1";
import { getNextRace } from "@/lib/f1-product";

export const revalidate = 60;

export async function generateMetadata() {
  return {
    title: "Charles Leclerc — The GRID",
    description: "Charles Leclerc standings, recent results, teammate numbers, links, and the audio button.",
  };
}

function formatDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function LeclercPage() {
  const [profile, standings, races] = await Promise.all([
    getDriverProfile("leclerc"),
    getDriverStandings(),
    getRaceCalendar(),
  ]);

  if (!profile) {
    notFound();
  }

  const position = Number(profile.standing.position || profile.season.position || 0);
  const currentPoints = Number(profile.standing.points || profile.season.points || 0);
  const driverAhead = position > 1 ? standings.find((entry) => Number(entry.position) === position - 1) ?? null : null;
  const gapToAhead = driverAhead ? Math.max(0, Number(driverAhead.points) - currentPoints) : 0;
  const nextRace = getNextRace(races) ?? races[0] ?? null;
  const recentResults = [...profile.season.recentResults].slice(-5).reverse();
  const headToHead = profile.headToHead.current;
  const leclercPhotoCandidates = [
    "/images/leclerc-easter.jpg",
    "/images/leclerc-easter.jpeg",
    "/images/leclerc-easter.png",
    "/images/charles-leclerc.jpg"
  ];
  const leclercPhoto = leclercPhotoCandidates.find((candidate) =>
    existsSync(path.join(process.cwd(), "public", candidate.replace(/^\//, "")))
  ) ?? null;

  return (
    <main className="flex-1 overflow-y-auto bg-background-dark">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-300 transition-colors hover:border-[#FF9F6A]/45 hover:text-white"
          >
            <span className="material-icons text-sm">arrow_back</span>
            Back to grid
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="https://www.instagram.com/charles_leclerc/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#FF9F6A]/30 bg-[#140C0B] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#FFD0B5] transition-colors hover:border-[#FF9F6A]/55 hover:text-white"
            >
              Charles IG
            </a>
            <a
              href="https://www.instagram.com/scuderiaferrari/"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-white/20 hover:text-white"
            >
              Ferrari IG
            </a>
            <a
              href="https://www.ferrari.com/en-EN/formula1/charles-leclerc"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-white/20 hover:text-white"
            >
              Ferrari Profile
            </a>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-[#FF9F6A]/22 bg-[radial-gradient(circle_at_top_right,rgba(255,159,106,0.18),transparent_30%),linear-gradient(145deg,#140C0B_0%,#090909_72%)] p-6 shadow-[0_28px_90px_rgba(225,6,0,0.18)] md:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_360px] xl:items-center">
            <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)] md:items-center">
              <div className="flex justify-center md:justify-start">
                {leclercPhoto ? (
                  <div className="relative h-[220px] w-[220px] overflow-hidden rounded-[2rem] border border-[#FF9F6A]/30 bg-black/20 shadow-[0_0_40px_rgba(255,159,106,0.18)]">
                    <Image
                      src={leclercPhoto}
                      alt="Charles Leclerc"
                      fill
                      priority
                      className="object-cover"
                      sizes="220px"
                    />
                  </div>
                ) : (
                  <DriverIdentityAvatar
                    givenName={profile.standing.driver.givenName}
                    familyName={profile.standing.driver.familyName}
                    accentColor="#FF9F6A"
                    variant="hero"
                  />
                )}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-300">
                    I just came here for Charles Leclerc 🌶️
                  </span>
                </div>

                <h1 className="mt-4 font-display text-5xl font-black italic leading-[0.9] tracking-tight text-white md:text-6xl">
                  Charles
                  <span className="block text-[#FFB48A]">Leclerc</span>
                </h1>

                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300">
                  Where Charles sits, who is ahead of him, and everything you open when the obsession kicks in.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.16em] text-gray-400">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">{profile.season.teamName}</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">{profile.standing.driver.nationality}</span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-2">{profile.season.points} pts this season</span>
                </div>
              </div>
            </div>

            <LeclercSoundboard src="/audio/leclerc-kid-made-with-Voicemod.mp3" />
          </div>
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <article className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(6,6,6,0.98))] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF9F6A]">Standings context</p>
            <h2 className="mt-2 font-display text-3xl font-black italic text-white">Where Charles actually sits</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Current spot</p>
                <p className="mt-2 text-2xl font-black text-white">P{position || "—"}</p>
                <p className="mt-1 text-xs text-gray-500">{currentPoints} pts</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Driver ahead</p>
                <p className="mt-2 text-xl font-black text-white">
                  {driverAhead ? `${driverAhead.driver.givenName} ${driverAhead.driver.familyName}` : "No one"}
                </p>
                <p className="mt-1 text-xs text-gray-500">{driverAhead?.constructors[0]?.name ?? "Championship leader"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Gap upward</p>
                <p className="mt-2 text-2xl font-black text-white">{gapToAhead}</p>
                <p className="mt-1 text-xs text-gray-500">points to next place</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-[#FF9F6A]/18 bg-[radial-gradient(circle_at_top_right,rgba(255,159,106,0.12),transparent_38%),linear-gradient(145deg,#141010_0%,#090909_80%)] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFB48A]">Open more tabs</p>
            <h2 className="mt-2 font-display text-3xl font-black italic text-white">Go deeper</h2>
            <div className="mt-5 grid gap-3">
              {[
                {
                  title: "Charles Instagram",
                  href: "https://www.instagram.com/charles_leclerc/",
                  note: "The main account.",
                },
                {
                  title: "Scuderia Ferrari",
                  href: "https://www.instagram.com/scuderiaferrari/",
                  note: "Ferrari's side of the chaos.",
                },
                {
                  title: "Ferrari profile",
                  href: "https://www.ferrari.com/en-EN/formula1/charles-leclerc",
                  note: "Official Ferrari page.",
                },
              ].map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-white/10 bg-black/20 p-4 transition-colors hover:border-[#FF9F6A]/40"
                >
                  <p className="text-sm font-black text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-gray-400">{item.note}</p>
                </a>
              ))}
            </div>
          </article>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <article className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(6,6,6,0.98))] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF9F6A]">Latest results</p>
            <h2 className="mt-2 font-display text-3xl font-black italic text-white">Recent weekends</h2>
            <div className="mt-5 space-y-3">
              {recentResults.map((result) => (
                <div key={`${result.round}-${result.raceName}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-300">
                    R{result.round}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{result.raceName}</p>
                    <p className="truncate text-[11px] text-gray-500">{formatDate(result.date)} • {result.circuitName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white">{result.finishLabel}</p>
                    <p className="text-[11px] text-gray-500">{result.points} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(6,6,6,0.98))] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FF9F6A]">Garage check</p>
            <h2 className="mt-2 font-display text-3xl font-black italic text-white">Teammate receipts</h2>
            {headToHead ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Grid H2H</p>
                    <p className="mt-2 text-xl font-black text-white">{headToHead.gridHeadToHead.driver}-{headToHead.gridHeadToHead.teammate}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Finish H2H</p>
                    <p className="mt-2 text-xl font-black text-white">{headToHead.finishHeadToHead.driver}-{headToHead.finishHeadToHead.teammate}</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Points split</p>
                    <p className="mt-2 text-xl font-black text-white">{headToHead.pointsSplit.driver}-{headToHead.pointsSplit.teammate}</p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-300">
                  The other Ferrari still sets the line. Right now that line runs through {headToHead.teammate.name}.
                </p>
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-400">Teammate numbers are not available yet.</p>
            )}
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-[#FF9F6A]/18 bg-[radial-gradient(circle_at_top_right,rgba(255,159,106,0.12),transparent_38%),linear-gradient(145deg,#141010_0%,#090909_80%)] p-6">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Next up</p>
            <h3 className="mt-2 font-display text-2xl font-black italic text-white">{nextRace?.raceName ?? "Race not loaded"}</h3>
            <p className="mt-2 text-sm text-gray-400">
              {nextRace ? `${nextRace.circuitName} • ${nextRace.locality}, ${nextRace.country}` : "Calendar not available"}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-300">
              Next weekend will either calm everyone down or make the edits even worse.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
