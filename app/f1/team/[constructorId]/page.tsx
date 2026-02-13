import { notFound } from "next/navigation";
import {
    getConstructorById,
    getConstructorStandings,
    getTeamDrivers,
} from "@/lib/f1";
import TeamProfile from "@/components/f1/TeamProfile";
import StatsGrid from "@/components/f1/StatsGrid";
import DriverCard from "@/components/f1/drivers/DriverCard";
import { getDriverStandings } from "@/lib/f1";

type Params = {
    constructorId: string;
};

export async function generateStaticParams(): Promise<Params[]> {
    const teams = await getConstructorStandings("2025");
    return teams.map((standing) => ({
        constructorId: standing.constructor.constructorId,
    }));
}

export default async function TeamPage({ params }: { params: Params }) {
    const standing = await getConstructorById(params.constructorId, "2026");

    if (!standing) {
        notFound();
    }

    const { constructor: team, position, points, wins } = standing;
    const teamDrivers = await getTeamDrivers(params.constructorId, "2025");

    // Get full driver standings to display driver cards
    const allDriverStandings = await getDriverStandings("2025");
    const teamDriverStandings = allDriverStandings.filter((driverStanding) =>
        driverStanding.constructors.some((c) => c.constructorId === params.constructorId)
    );

    // Build stats for StatsGrid
    const stats = [
        {
            icon: "🏆",
            label: "Race Wins (2023)",
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
                {/* 2023 Data Notice */}
                <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                    <p className="text-sm text-amber-400">
                        <span className="font-bold">📊 Showing 2023 Season Data</span> — Statistics will update once the 2026 season begins
                    </p>
                </div>

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
                    {teamDriverStandings.length > 0 ? (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {teamDriverStandings.map((driverStanding) => (
                                <DriverCard
                                    key={driverStanding.driver.driverId}
                                    standing={driverStanding}
                                    season="2023"
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
