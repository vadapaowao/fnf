import { notFound } from "next/navigation";
import {
    F1_SEASON,
    getConstructorById,
    getConstructorStandings,
    getTeamDrivers,
} from "@/lib/f1";
import TeamProfile from "@/components/f1/TeamProfile";
import StatsGrid from "@/components/f1/StatsGrid";
import DriverCard from "@/components/f1/drivers/DriverCard";

type Params = {
    constructorId: string;
};

export async function generateStaticParams(): Promise<Params[]> {
    const teams = await getConstructorStandings(F1_SEASON);
    return teams.map((standing) => ({
        constructorId: standing.constructor.constructorId,
    }));
}

export default async function TeamPage({ params }: { params: Params }) {
    const standing = await getConstructorById(params.constructorId, F1_SEASON);

    if (!standing) {
        notFound();
    }

    const { constructor: team, position, points, wins } = standing;
    const teamDrivers = await getTeamDrivers(params.constructorId, F1_SEASON);

    // Build stats for StatsGrid
    const stats = [
        {
            icon: "🏆",
            label: "Race Wins",
            value: wins,
            color: "purple" as const,
        },
        {
            icon: "🎯",
            label: "Championship Position",
            value: `P${position}`,
            color: "pink" as const,
        },
        {
            icon: "⭐",
            label: "Points",
            value: points,
            color: "orange" as const,
        },
        {
            icon: "👥",
            label: "Drivers",
            value: teamDrivers.length,
            color: "cyan" as const,
        },
    ];

    return (
        <main className="flex-1 overflow-y-auto bg-background-dark">
            <div className="container mx-auto px-6 py-12">
                {/* Team Profile Hero */}
                <div className="mb-12">
                    <TeamProfile team={team} position={position} points={points} wins={wins} />
                </div>

                {/* Statistics Section */}
                <div className="mb-12">
                    <h2 className="mb-6 font-['Chakra_Petch'] text-3xl font-bold text-white">
                        Team Statistics
                    </h2>
                    <StatsGrid stats={stats} columns={4} />
                </div>

                {/* Current Drivers Section */}
                <div>
                    <h2 className="mb-6 font-['Chakra_Petch'] text-3xl font-bold text-white">
                        Current Drivers
                    </h2>
                    {teamDrivers.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {teamDrivers.map((driver) => (
                                <DriverCard
                                    key={driver.driverId}
                                    driver={driver}
                                    teamId={team.constructorId}
                                    teamName={team.name}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-gray-800 bg-black/40 p-12 text-center">
                            <p className="text-gray-400">No driver data available for this team.</p>
                        </div>
                    )}
                </div>

                {/* Team Information */}
                <div className="mt-12 rounded-lg border border-gray-800 bg-black/40 p-6">
                    <h3 className="mb-4 font-['Chakra_Petch'] text-xl font-bold text-white">
                        Team Information
                    </h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-gray-400">Team Name</span>
                            <span className="font-medium text-white">{team.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-800 pb-2">
                            <span className="text-gray-400">Nationality</span>
                            <span className="font-medium text-white">{team.nationality}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Constructor ID</span>
                            <span className="font-mono font-bold text-purple-400">{team.constructorId}</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
