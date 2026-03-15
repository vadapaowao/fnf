import CountdownTimer from "@/components/CountdownTimer";
import StandingsAccordion from "@/components/f1/StandingsAccordion";
import { F1_SEASON, getConstructorStandings, getDriverStandings, getRaceCalendar, getRaceDetailByRound, getRaceRecapByRound, isScheduledRace, isUpcomingRace } from "@/lib/f1";

export const revalidate = 21600;

function toDriverRows(standings: Awaited<ReturnType<typeof getDriverStandings>>) {
  return standings.map((entry) => ({
    rank: entry.position,
    name: `${entry.driver.givenName} ${entry.driver.familyName}`,
    context: entry.constructors[0]?.name ?? "Team unavailable",
    meta: entry.driver.nationality,
    value: `${entry.points} pts`
  }));
}

function toConstructorRows(standings: Awaited<ReturnType<typeof getConstructorStandings>>) {
  return standings.map((entry) => ({
    rank: entry.position,
    name: entry.constructor.name,
    context: `${entry.wins} win${entry.wins === "1" ? "" : "s"}`,
    meta: entry.constructor.nationality,
    value: `${entry.points} pts`
  }));
}

export default async function StandingsPage() {
  const [rawRaces, driverStandings, constructorStandings] = await Promise.all([
    getRaceCalendar(),
    getDriverStandings(F1_SEASON),
    getConstructorStandings(F1_SEASON)
  ]);
  const races = rawRaces.filter(isScheduledRace);

  const nextRace = races.find(isUpcomingRace) ?? null;
  const lastCompletedRace = [...races].reverse().find((race) => !isUpcomingRace(race)) ?? null;
  const [latestResult, latestRecap] = await Promise.all([
    lastCompletedRace ? getRaceDetailByRound(lastCompletedRace.round) : Promise.resolve(null),
    lastCompletedRace ? getRaceRecapByRound(lastCompletedRace.round) : Promise.resolve(null)
  ]);

  return (
    <main className="flex-1 overflow-y-auto bg-background-dark">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start">
          <section className="rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(18,18,18,0.94),rgba(6,6,6,0.98))] p-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-grid-primary">Quick results</p>
            <h1 className="mt-3 font-display text-5xl font-black italic tracking-tight text-white md:text-6xl">
              Standings
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400">
              Latest result, the current driver order, and the constructor table in one place.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Latest result</p>
                {latestResult ? (
                  <>
                    <h2 className="mt-3 text-2xl font-black text-white">{latestResult.race.raceName}</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      {latestResult.circuit.name} • {latestResult.circuit.location}
                    </p>
                    <div className="mt-5 space-y-2 text-sm text-gray-300">
                      <p>
                        Winner: <span className="font-bold text-white">{latestRecap?.podium[0]?.driver ?? latestResult.stats.lastWinner.driver}</span>
                      </p>
                      <p>
                        Team: <span className="font-bold text-white">{latestRecap?.podium[0]?.constructor ?? latestResult.stats.lastWinner.constructor}</span>
                      </p>
                      <p>
                        Fastest lap: <span className="font-bold text-white">{latestRecap?.fastestLap?.driver ?? latestResult.stats.fastestLap.driver}</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-400">No completed race yet.</p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">Next lights out</p>
                {nextRace ? (
                  <>
                    <h2 className="mt-3 text-2xl font-black text-white">{nextRace.raceName}</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      {nextRace.circuitName} • {nextRace.locality}, {nextRace.country}
                    </p>
                    <div className="mt-5">
                      <CountdownTimer targetIso={`${nextRace.date}T${nextRace.time}`} variant="compact" />
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-400">Season calendar unavailable.</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(18,18,18,0.94),rgba(6,6,6,0.98))] p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-grid-primary">At a glance</p>
            <div className="mt-5 space-y-4 text-sm text-gray-300">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">Driver leader</p>
                <p className="mt-2 text-lg font-bold text-white">{driverStandings[0] ? `${driverStandings[0].driver.givenName} ${driverStandings[0].driver.familyName}` : "Unavailable"}</p>
                <p className="mt-1 text-gray-400">{driverStandings[0]?.points ?? "—"} points</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">Constructor leader</p>
                <p className="mt-2 text-lg font-bold text-white">{constructorStandings[0]?.constructor.name ?? "Unavailable"}</p>
                <p className="mt-1 text-gray-400">{constructorStandings[0]?.points ?? "—"} points</p>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <StandingsAccordion
            eyebrow="Drivers"
            title="Driver standings"
            subtitle="The current championship order."
            rows={toDriverRows(driverStandings)}
          />
          <StandingsAccordion
            eyebrow="Constructors"
            title="Constructor standings"
            subtitle="How the team fight looks right now."
            rows={toConstructorRows(constructorStandings)}
          />
        </div>
      </div>
    </main>
  );
}
