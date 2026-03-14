import { F1_SEASON, getConstructorStandings, getDriverStandings } from "@/lib/f1";
import StandingsAccordion from "@/components/f1/StandingsAccordion";
import TeamCard from "@/components/f1/TeamCard";

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
};

export default async function TeamsPage() {
    const [teamStandings, driverStandings] = await Promise.all([
        getConstructorStandings(F1_SEASON),
        getDriverStandings(F1_SEASON),
    ]);
    const totalWins = teamStandings.reduce((sum, standing) => sum + Number(standing.wins), 0);

    return (
        <main className="flex-1 overflow-y-auto bg-background-dark">
            <div className="container mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="mb-2 font-display text-5xl font-bold text-white">
                        {F1_SEASON} TEAMS
                    </h1>
                    <p className="text-gray-400">Every team on the grid, with lineups and season form.</p>
                </div>

                {teamStandings.length > 0 ? (
                    <section className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        <article className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark">
                            <div className="border-b border-white/5 px-6 py-4">
                                <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">Team Directory</p>
                                <h2 className="mt-2 font-display text-3xl font-bold text-white">
                                    {teamStandings.length} teams
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-400">
                                    Open any team for drivers, points flow, and race-by-race form.
                                </p>
                            </div>

                            <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
                                <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Teams</p>
                                    <p className="mt-2 text-3xl font-black text-white">{teamStandings.length}</p>
                                </div>
                                <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Grid Drivers</p>
                                    <p className="mt-2 text-3xl font-black text-white">{driverStandings.length}</p>
                                </div>
                                <div className="rounded-lg border border-white/5 bg-black/20 p-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Team Wins</p>
                                    <p className="mt-2 text-3xl font-black text-white">{totalWins}</p>
                                </div>
                            </div>
                        </article>

                        <StandingsAccordion
                            eyebrow="Constructor Standings"
                            title={`${F1_SEASON} Team Table`}
                            subtitle="Championship order right now. Open the full table if you want it all."
                            rows={teamStandings.map((standing) => ({
                                rank: standing.position,
                                name: standing.constructor.name,
                                context: standing.constructor.nationality,
                                meta: `${standing.wins} wins`,
                                value: `${standing.points} pts`,
                                accentColor: TEAM_TONES[standing.constructor.constructorId] ?? "#E10600"
                            }))}
                        />
                    </section>
                ) : null}

                {teamStandings.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {teamStandings.map((standing) => (
                            <TeamCard
                                key={standing.constructor.constructorId}
                                standing={standing}
                                drivers={driverStandings.filter((driver) =>
                                    driver.constructors.some((constructor) => constructor.constructorId === standing.constructor.constructorId)
                                )}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="rounded-lg border border-gray-800 bg-black/40 p-12 text-center">
                        <p className="text-gray-400">No team data available for this season.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
