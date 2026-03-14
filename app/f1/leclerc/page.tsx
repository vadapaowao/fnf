import fs from "node:fs";
import path from "node:path";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import LeclercSoundboard from "@/components/f1/LeclercSoundboard";
import DriverIdentityAvatar from "@/components/f1/drivers/DriverIdentityAvatar";
import { getDriverProfile } from "@/lib/driver-profile";
import { F1_SEASON, getDriverStandings } from "@/lib/f1";

export const metadata = {
  title: "Charles Leclerc",
  description: "Charles Leclerc results, standing, gap to the next car ahead, and the good internet stuff."
};

function getLeclercImagePath() {
  const candidates = ["leclerc-easter.jpg", "leclerc-easter.jpeg", "leclerc-easter.png", "charles-leclerc.jpg"];

  for (const file of candidates) {
    if (fs.existsSync(path.join(process.cwd(), "public", "images", file))) {
      return `/images/${file}`;
    }
  }

  return null;
}

export default async function LeclercPage() {
  const [profile, standings] = await Promise.all([getDriverProfile("leclerc", F1_SEASON), getDriverStandings(F1_SEASON)]);

  if (!profile) {
    notFound();
  }

  const leclercIndex = standings.findIndex((entry) => entry.driver.driverId === "leclerc");
  const driverAbove = leclercIndex > 0 ? standings[leclercIndex - 1] : null;
  const pointsGap = driverAbove ? Math.max(Number(driverAbove.points) - Number(profile.standing.points), 0) : 0;
  const headToHead = profile.headToHead.current;
  const recentResults = [...profile.season.recentResults].slice(-5).reverse();
  const imagePath = getLeclercImagePath();
  const driverName = `${profile.standing.driver.givenName} ${profile.standing.driver.familyName}`;
  const profileLinks = [
    {
      label: "Instagram",
      href: "https://www.instagram.com/charles_leclerc/",
      tone: "border-[#FF9F6A]/30 hover:border-[#FF9F6A]/55"
    },
    {
      label: "Ferrari",
      href: "https://www.ferrari.com/en-EN/formula1/charles-leclerc",
      tone: "border-white/10 hover:border-white/30"
    },
    {
      label: "F1 Profile",
      href: "https://www.formula1.com/en/drivers/charles-leclerc",
      tone: "border-white/10 hover:border-white/30"
    }
  ] as const;

  return (
    <main className="flex-1 overflow-y-auto bg-black">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-300 transition-colors hover:border-[#FF9F6A]/35 hover:text-white"
          >
            <span className="material-icons text-sm">arrow_back</span>
            Back to grid
          </Link>
        </div>

        <section className="relative overflow-hidden rounded-[2rem] border border-[#FF9F6A]/20 bg-[radial-gradient(circle_at_top_right,rgba(255,159,106,0.14),transparent_30%),linear-gradient(150deg,#160C0B_0%,#080808_58%,#050505_100%)] p-6 md:p-8">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:36px_36px] opacity-10" />
          <div className="relative grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-end">
            <div>
              {imagePath ? (
                <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/20">
                  <Image src={imagePath} alt="Charles Leclerc" fill className="object-cover" sizes="280px" priority />
                </div>
              ) : (
                <DriverIdentityAvatar
                  givenName={profile.standing.driver.givenName}
                  familyName={profile.standing.driver.familyName}
                  accentColor="#FF9F6A"
                  variant="hero"
                  className="mx-auto"
                />
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#FFB48A]">Charles Leclerc</p>
              <h1 className="mt-3 font-display text-5xl font-black italic tracking-tight text-white md:text-7xl">
                You know why you clicked.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base">
                Standing, gap, recent form, and the internet essentials. Nothing extra.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {profileLinks.slice(0, 2).map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`rounded-full border bg-black/30 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-colors ${link.tone}`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_360px]">
          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(18,18,18,0.92),rgba(6,6,6,0.98))] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">Current standing</p>
                <p className="mt-3 font-display text-5xl font-black italic text-white">P{profile.standing.position}</p>
                <p className="mt-2 text-sm text-gray-400">{profile.standing.points} points</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(18,18,18,0.92),rgba(6,6,6,0.98))] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">One place up</p>
                <p className="mt-3 text-2xl font-black text-white">
                  {driverAbove ? `${driverAbove.driver.givenName} ${driverAbove.driver.familyName}` : "Already at the top"}
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  {driverAbove ? `${driverAbove.points} points` : "Nothing to chase there"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(18,18,18,0.92),rgba(6,6,6,0.98))] p-5">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">Gap up the road</p>
                <p className="mt-3 font-display text-5xl font-black italic text-white">{driverAbove ? `${pointsGap}` : "0"}</p>
                <p className="mt-2 text-sm text-gray-400">points</p>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(18,18,18,0.92),rgba(6,6,6,0.98))] p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFB48A]">Recent results</p>
              <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {recentResults.map((result) => (
                  <div key={`${result.round}-${result.raceName}`} className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Round {result.round}</p>
                    <h2 className="mt-2 text-lg font-bold text-white">{result.raceName}</h2>
                    <p className="mt-1 text-sm text-gray-400">{result.circuitName}</p>
                    <div className="mt-4 flex items-center justify-between text-sm">
                      <span className="text-gray-400">Finish</span>
                      <span className="font-bold text-white">{result.finishLabel}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-gray-400">Points</span>
                      <span className="font-bold text-white">{result.points}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <LeclercSoundboard />

            <div className="rounded-2xl border border-[#FF9F6A]/20 bg-[linear-gradient(160deg,#17100E,#090909)] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFB48A]">Profiles</p>
              <div className="mt-4 space-y-3">
                {profileLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between rounded-xl border bg-black/20 px-4 py-3 text-sm font-bold text-white transition-colors ${link.tone}`}
                  >
                    <span>{link.label}</span>
                    <span className="material-icons text-base">open_in_new</span>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(18,18,18,0.92),rgba(6,6,6,0.98))] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFB48A]">Teammate check</p>
              {headToHead ? (
                <>
                  <h2 className="mt-3 text-2xl font-black text-white">{headToHead.teammate.name}</h2>
                  <div className="mt-4 space-y-2 text-sm text-gray-300">
                    <p>Finish battle: <span className="font-bold text-white">{headToHead.finishHeadToHead.driver} - {headToHead.finishHeadToHead.teammate}</span></p>
                    <p>Points split: <span className="font-bold text-white">{headToHead.pointsSplit.driver} - {headToHead.pointsSplit.teammate}</span></p>
                    <p>Average finish: <span className="font-bold text-white">P{headToHead.averageFinish.driver} vs P{headToHead.averageFinish.teammate}</span></p>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-gray-400">Teammate comparison not available yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-[#FF9F6A]/20 bg-[linear-gradient(160deg,#17100E,#090909)] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFB48A]">Status</p>
              <p className="mt-3 text-lg font-bold text-white">{driverName}</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">{profile.bio}</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
