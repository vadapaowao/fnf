import CountdownTimer from "@/components/CountdownTimer";
import StandingsSwitcher from "@/components/f1/StandingsSwitcher";
import DataStatus from "@/components/f1/DataStatus";
import { F1_SEASON, getConstructorStandings, getDriverStandings, getDriverStandingsAtRound, getRaceCalendar, getRaceDetailByRound, getRaceRecapByRound, isScheduledRace, isUpcomingRace } from "@/lib/f1";
import { getLastCompletedRace } from "@/lib/f1-product";

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
  const lastCompletedRace = getLastCompletedRace(races);
  const previousCompletedRace = lastCompletedRace
    ? [...races].reverse().find((race) => Number(race.round) < Number(lastCompletedRace.round)) ?? null
    : null;
  const [latestResult, latestRecap, previousDriverStandings, roundDriverStandings] = await Promise.all([
    lastCompletedRace ? getRaceDetailByRound(lastCompletedRace.round) : Promise.resolve(null),
    lastCompletedRace ? getRaceRecapByRound(lastCompletedRace.round) : Promise.resolve(null),
    previousCompletedRace
      ? getDriverStandingsAtRound(F1_SEASON, previousCompletedRace.round, { silent: true })
      : Promise.resolve([]),
    lastCompletedRace
      ? getDriverStandingsAtRound(F1_SEASON, lastCompletedRace.round, { silent: true })
      : Promise.resolve([])
  ]);
  const previousPositions = new Map(previousDriverStandings.map((entry) => [entry.driver.driverId, Number(entry.position)]));
  const championshipMovement = roundDriverStandings
    .map((entry) => {
      const previousPosition = previousPositions.get(entry.driver.driverId);
      const currentPosition = Number(entry.position);
      return {
        driver: `${entry.driver.givenName} ${entry.driver.familyName}`,
        movement: previousPosition ? previousPosition - currentPosition : 0,
        position: currentPosition
      };
    })
    .filter((entry) => entry.movement !== 0)
    .sort((left, right) => Math.abs(right.movement) - Math.abs(left.movement))
    .slice(0, 3);
  const podium = latestRecap?.podium.slice(0, 3) ?? [];
  const checkedAt = new Date().toISOString();

  return (
    <main className="flex-1 overflow-y-auto bg-background-dark">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 md:py-12">
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px] lg:items-start">
          <section className="rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(18,18,18,0.94),rgba(6,6,6,0.98))] p-4 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-grid-primary">Quick results</p>
            <h1 className="mt-3 font-display text-4xl font-black italic tracking-tight text-white sm:text-5xl md:text-6xl">
              Standings
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-400">
              Latest result, the current driver order, and the constructor table in one place.
            </p>
            <DataStatus checkedAt={checkedAt} source="Jolpica + FastF1" status="Results checked" className="mt-3" />

            <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Latest result</p>
                {latestResult ? (
                  <>
                    <h2 className="mt-3 text-2xl font-black text-white">{latestResult.race.raceName}</h2>
                    <p className="mt-1 text-sm text-gray-400">
                      {latestResult.circuit.name} • {latestResult.circuit.location}
                    </p>
                    <div className="mt-5 space-y-2 text-sm text-gray-300">
                      {podium.map((entry) => (
                        <div key={`${entry.position}-${entry.driver}`} className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2.5">
                          <span className="font-mono text-xs font-black text-grid-primary">P{entry.position}</span>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-white">{entry.driver}</p>
                            <p className="truncate text-xs text-gray-500">{entry.constructor}</p>
                          </div>
                        </div>
                      ))}
                      {podium.length === 0 ? <p>Race result not available yet.</p> : null}
                      <p className="pt-2 text-xs text-gray-400">
                        Fastest lap: <span className="font-bold text-white">{latestRecap?.fastestLap?.driver ?? "Not available yet"}</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="mt-3 text-sm text-gray-400">No completed race yet.</p>
                )}
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4 sm:p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">Next lights out</p>
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

          <section className="rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(18,18,18,0.94),rgba(6,6,6,0.98))] p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-grid-primary">At a glance</p>
            <div className="mt-5 space-y-4 text-sm text-gray-300">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Driver leader</p>
                <p className="mt-2 text-lg font-bold text-white">{driverStandings[0] ? `${driverStandings[0].driver.givenName} ${driverStandings[0].driver.familyName}` : "Unavailable"}</p>
                <p className="mt-1 text-gray-400">{driverStandings[0]?.points ?? "—"} points</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Constructor leader</p>
                <p className="mt-2 text-lg font-bold text-white">{constructorStandings[0]?.constructor.name ?? "Unavailable"}</p>
                <p className="mt-1 text-gray-400">{constructorStandings[0]?.points ?? "—"} points</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Championship movement</p>
                {championshipMovement.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {championshipMovement.map((entry) => (
                      <div key={entry.driver} className="flex items-center justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate font-semibold text-white">{entry.driver}</span>
                        <span className={entry.movement > 0 ? "font-mono font-bold text-emerald-400" : "font-mono font-bold text-red-400"}>
                          {entry.movement > 0 ? `+${entry.movement}` : entry.movement} to P{entry.position}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-400">
                    {previousDriverStandings.length > 0 && roundDriverStandings.length > 0
                      ? "No position changes after the latest round."
                      : "Round-by-round standings not available yet."}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        <StandingsSwitcher
          driverRows={toDriverRows(driverStandings)}
          constructorRows={toConstructorRows(constructorStandings)}
        />
      </div>
    </main>
  );
}
