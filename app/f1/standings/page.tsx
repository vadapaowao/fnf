import Link from "next/link";

import LocalDateTimeText from "@/components/f1/LocalDateTimeText";
import {
  F1_SEASON,
  getConstructorStandings,
  getDriverStandings,
  getRaceCalendar,
  getRaceRecapByRound,
} from "@/lib/f1";
import { getLastCompletedRace, getNextRace } from "@/lib/f1-product";

export const revalidate = 60;

const TEAM_TONES: Record<string, string> = {
  red_bull: "#1E41FF",
  ferrari: "#DC0000",
  mercedes: "#00D2BE",
  mclaren: "#FF8000",
  aston_martin: "#006F62",
  alpine: "#0090FF",
  williams: "#005AFF",
  rb: "#2B4562",
  sauber: "#52E252",
  haas: "#B6BABD",
  audi: "#7A7A7A",
  cadillac: "#7A4CFF",
};

function getRaceStartMs(date: string, time: string) {
  return new Date(`${date}T${time}`).getTime();
}

export default async function StandingsPage() {
  const [races, driverStandings, constructorStandings] = await Promise.all([
    getRaceCalendar(),
    getDriverStandings(F1_SEASON),
    getConstructorStandings(F1_SEASON),
  ]);

  const nowMs = Date.now();
  const completedRaces = [...races]
    .filter((race) => getRaceStartMs(race.date, race.time) < nowMs)
    .sort((left, right) => getRaceStartMs(right.date, right.time) - getRaceStartMs(left.date, left.time));

  const latestRace = getLastCompletedRace(races);
  const recentRaces = completedRaces.slice(0, 3);
  const [latestRecap, recentRecaps] = await Promise.all([
    latestRace ? getRaceRecapByRound(latestRace.round) : Promise.resolve(null),
    Promise.all(recentRaces.map((race) => getRaceRecapByRound(race.round))),
  ]);
  const nextRace = getNextRace(races);

  return (
    <main className="flex-1 overflow-y-auto bg-background-dark">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-grid-primary">Standings</p>
            <h1 className="mt-3 font-display text-4xl font-black italic text-white md:text-5xl">{F1_SEASON} Standings</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
              Last result, driver table, constructor table. That is the page.
            </p>
          </div>
          <Link
            href="/f1"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-300 transition-colors hover:border-grid-primary/40 hover:text-white"
          >
            <span className="material-icons text-sm">arrow_back</span>
            Back to F1
          </Link>
        </div>

        <section className="mb-8 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(225,6,0,0.12),transparent_36%),linear-gradient(145deg,rgba(18,18,18,0.96),rgba(6,6,6,0.98))] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-grid-primary">Latest result</p>
            <h2 className="mt-2 font-display text-3xl font-black italic text-white">
              {latestRace?.raceName ?? "Result unavailable"}
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              {latestRace ? `${latestRace.circuitName} • ${latestRace.locality}, ${latestRace.country}` : "Completed race data unavailable"}
            </p>

            {latestRecap ? (
              <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Winner</p>
                  <p className="mt-2 text-3xl font-black text-white">{latestRecap.podium[0]?.driver ?? "—"}</p>
                  <p className="mt-1 text-sm text-gray-400">{latestRecap.podium[0]?.constructor ?? "Constructor unavailable"}</p>
                  <p className="mt-4 text-xs leading-relaxed text-gray-400">{latestRecap.headline}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Podium</p>
                  <div className="mt-4 space-y-3">
                    {latestRecap.podium.map((entry) => (
                      <div key={`${entry.position}-${entry.driver}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                        <span className="rounded-full border border-white/10 bg-black/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-300">
                          P{entry.position}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-white">{entry.driver}</p>
                          <p className="truncate text-[11px] text-gray-500">{entry.constructor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-5 text-sm text-gray-400">
                Recap not available yet.
              </div>
            )}
          </article>

          <article className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(6,6,6,0.98))] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-grid-primary">At a Glance</p>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Driver leader</p>
                <p className="mt-2 text-2xl font-black text-white">
                  {driverStandings[0] ? `${driverStandings[0].driver.givenName} ${driverStandings[0].driver.familyName}` : "—"}
                </p>
                <p className="mt-1 text-xs text-gray-500">{driverStandings[0]?.points ?? "—"} pts</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Constructor leader</p>
                <p className="mt-2 text-2xl font-black text-white">{constructorStandings[0]?.constructor.name ?? "—"}</p>
                <p className="mt-1 text-xs text-gray-500">{constructorStandings[0]?.points ?? "—"} pts</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Next lights out</p>
                <p className="mt-2 text-xl font-black text-white">{nextRace?.raceName ?? "TBD"}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {nextRace ? (
                    <LocalDateTimeText
                      iso={`${nextRace.date}T${nextRace.time}`}
                      options={{
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZoneName: "short"
                      }}
                    />
                  ) : "Calendar unavailable"}
                </p>
              </div>
            </div>
          </article>
        </section>

        {recentRaces.length > 0 ? (
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-grid-primary">Recent rounds</p>
                <h2 className="mt-1 font-display text-2xl font-black italic text-white">Last three rounds</h2>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {recentRaces.map((race, index) => {
                const recap = recentRecaps[index];
                return (
                  <Link
                    key={race.round}
                    href={`/f1/race/${race.round}`}
                    className="rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(6,6,6,0.98))] p-5 transition-colors hover:border-grid-primary/35"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500">Round {race.round}</p>
                    <h3 className="mt-2 font-display text-2xl font-black italic text-white">{race.raceName}</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      <LocalDateTimeText
                        iso={`${race.date}T${race.time}`}
                        options={{
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZoneName: "short"
                        }}
                      />
                    </p>
                    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-grid-primary">Winner</p>
                      <p className="mt-2 text-lg font-black text-white">{recap?.podium[0]?.driver ?? "Recap not ready"}</p>
                      <p className="mt-1 text-xs text-gray-500">{recap?.podium[0]?.constructor ?? race.circuitName}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-2">
          <article className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(6,6,6,0.98))]">
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-grid-primary">Drivers</p>
              <h2 className="mt-2 font-display text-3xl font-black italic text-white">Driver Championship</h2>
            </div>
            <div className="overflow-x-auto px-3 py-3">
              <table className="min-w-full border-separate border-spacing-y-2 text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                    <th className="px-3 py-2">Pos</th>
                    <th className="px-3 py-2">Driver</th>
                    <th className="px-3 py-2">Team</th>
                    <th className="px-3 py-2 text-right">Wins</th>
                    <th className="px-3 py-2 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {driverStandings.map((standing) => {
                    const accent = TEAM_TONES[standing.constructors[0]?.constructorId ?? ""] ?? "#E10600";
                    return (
                      <tr key={standing.driver.driverId} className="bg-black/20">
                        <td className="rounded-l-xl border border-r-0 border-white/10 px-3 py-3 text-sm font-black text-white">P{standing.position}</td>
                        <td className="border-y border-white/10 px-3 py-3">
                          <Link href={`/f1/driver/${standing.driver.driverId}`} className="font-bold text-white transition-colors hover:text-grid-primary">
                            {standing.driver.givenName} {standing.driver.familyName}
                          </Link>
                          <p className="text-[11px] text-gray-500">{standing.driver.code ?? standing.driver.nationality}</p>
                        </td>
                        <td className="border-y border-white/10 px-3 py-3 text-sm text-gray-300">{standing.constructors[0]?.name ?? "—"}</td>
                        <td className="border-y border-white/10 px-3 py-3 text-right text-sm text-gray-300">{standing.wins}</td>
                        <td className="rounded-r-xl border border-l-0 border-white/10 px-3 py-3 text-right text-sm font-black" style={{ color: accent }}>
                          {standing.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>

          <article className="overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(18,18,18,0.96),rgba(6,6,6,0.98))]">
            <div className="border-b border-white/10 px-6 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-grid-primary">Teams</p>
              <h2 className="mt-2 font-display text-3xl font-black italic text-white">Constructor Championship</h2>
            </div>
            <div className="overflow-x-auto px-3 py-3">
              <table className="min-w-full border-separate border-spacing-y-2 text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                    <th className="px-3 py-2">Pos</th>
                    <th className="px-3 py-2">Team</th>
                    <th className="px-3 py-2 text-right">Wins</th>
                    <th className="px-3 py-2 text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {constructorStandings.map((standing) => {
                    const accent = TEAM_TONES[standing.constructor.constructorId ?? ""] ?? "#E10600";
                    return (
                      <tr key={standing.constructor.constructorId} className="bg-black/20">
                        <td className="rounded-l-xl border border-r-0 border-white/10 px-3 py-3 text-sm font-black text-white">P{standing.position}</td>
                        <td className="border-y border-white/10 px-3 py-3">
                          <Link href={`/f1/team/${standing.constructor.constructorId}`} className="font-bold text-white transition-colors hover:text-grid-primary">
                            {standing.constructor.name}
                          </Link>
                          <p className="text-[11px] text-gray-500">{standing.constructor.nationality}</p>
                        </td>
                        <td className="border-y border-white/10 px-3 py-3 text-right text-sm text-gray-300">{standing.wins}</td>
                        <td className="rounded-r-xl border border-l-0 border-white/10 px-3 py-3 text-right text-sm font-black" style={{ color: accent }}>
                          {standing.points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
