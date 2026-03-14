import DriverCard from "@/components/f1/drivers/DriverCard";
import StandingsAccordion from "@/components/f1/StandingsAccordion";
import { F1_SEASON, getDriverStandings } from "@/lib/f1";

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
  haas: "#B6BABD"
};

export default async function DriversPage() {
  const standings = await getDriverStandings(F1_SEASON);
  const teamsRepresented = new Set(standings.map((standing) => standing.constructors[0]?.constructorId).filter(Boolean)).size;
  const nationalitiesRepresented = new Set(standings.map((standing) => standing.driver.nationality)).size;

  return (
    <main className="flex-1 overflow-y-auto bg-background-dark">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2 font-display text-4xl font-bold text-white md:text-5xl">
            {F1_SEASON} DRIVERS
          </h1>
          <p className="text-gray-400">
            Full grid, one page. Pick a driver and get the season quickly.
          </p>
        </div>

        {standings.length > 0 ? (
          <section className="mb-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <article className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark">
              <div className="border-b border-white/5 px-6 py-4">
                <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">Driver Directory</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-white">
                  {`${standings.length} drivers on the ${F1_SEASON} grid`}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                  Pick a driver and go straight to results, teammate numbers, and season form.
                </p>
              </div>

              <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
                <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Grid Size</p>
                  <p className="mt-2 text-3xl font-black text-white">{standings.length}</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Teams</p>
                  <p className="mt-2 text-3xl font-black text-white">{teamsRepresented}</p>
                  <p className="mt-1 text-[11px] text-gray-500">teams</p>
                </div>
                <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Nationalities</p>
                  <p className="mt-2 text-3xl font-black text-white">{nationalitiesRepresented}</p>
                  <p className="mt-1 text-[11px] text-gray-500">nationalities</p>
                </div>
              </div>
            </article>

            <StandingsAccordion
              eyebrow="Current Standings"
              title={`${F1_SEASON} Driver Table`}
              subtitle="Championship order right now. Open the full table if you want the whole thing."
              rows={standings.map((standing) => ({
                rank: standing.position,
                name: `${standing.driver.givenName} ${standing.driver.familyName}`,
                context: standing.constructors[0]?.name ?? "Team unavailable",
                meta: standing.driver.code ? `${standing.driver.code} • ${standing.wins} wins` : `${standing.wins} wins`,
                value: `${standing.points} pts`,
                accentColor: TEAM_TONES[standing.constructors[0]?.constructorId ?? ""] ?? "#E10600"
              }))}
            />
          </section>
        ) : null}

        {standings.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-12 text-center">
            <p className="text-lg text-gray-400">Driver list unavailable.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {standings.map((standing) => (
              <DriverCard
                key={standing.driver.driverId}
                driver={standing.driver}
                teamId={standing.constructors[0]?.constructorId}
                teamName={standing.constructors[0]?.name}
                standing={standing}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
