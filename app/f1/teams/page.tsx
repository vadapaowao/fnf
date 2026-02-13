import { getConstructorStandings } from "@/lib/f1";
// Keep TeamCard in root since teams are separate from drivers
import TeamCard from "@/components/f1/TeamCard";

export default async function TeamsPage() {
    const teamStandings = await getConstructorStandings("2026");

    return (
        <main className="flex-1 overflow-y-auto bg-background-dark">
            <div className="container mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="mb-2 font-['Chakra_Petch'] text-5xl font-bold text-white">
                        CONSTRUCTORS CHAMPIONSHIP
                    </h1>
                    <p className="text-gray-400">2026 season team standings and profiles</p>
                </div>

                {/* 2023 Data Notice */}
                <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="text-sm text-amber-400">
                        <span className="font-bold">📊 Showing 2023 Season Data</span> — 2026
                        standings will be available once the season begins
                    </p>
                </div>

                {/* Team Cards Grid */}
                {teamStandings.length > 0 ? (
                    <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {teamStandings.map((standing) => (
                            <TeamCard key={standing.constructor.constructorId} standing={standing} season="2023" />
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
