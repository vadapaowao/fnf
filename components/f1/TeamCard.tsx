import Link from "next/link";

import type { ConstructorStanding, DriverStanding } from "@/lib/f1";
import { formatTeamBadge } from "@/lib/f1-formatting";

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

interface TeamCardProps {
    standing: ConstructorStanding;
    drivers?: DriverStanding[];
}

export default function TeamCard({ standing, drivers = [] }: TeamCardProps) {
    const { constructor: team, points, wins } = standing;
    const accentColor = TEAM_TONES[team.constructorId] ?? "#E10600";

    return (
        <Link
            href={`/f1/team/${team.constructorId}`}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark transition-all duration-200 hover:border-grid-primary/40 hover:shadow-[0_18px_50px_rgba(225,6,0,0.18)]"
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-75 blur-2xl"
                style={{ background: `linear-gradient(90deg, ${accentColor}66, transparent 70%)` }}
            />

            <div className="relative p-6">
                <div className="mb-5 flex items-center gap-3">
                    <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.18em] text-gray-300">
                        {formatTeamBadge(team.constructorId)}
                    </span>
                </div>

                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">{team.nationality}</p>
                        <h3 className="mt-2 font-display text-2xl font-bold tracking-tight text-white">
                            {team.name}
                        </h3>
                    </div>
                    <div
                        className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/20 font-display text-2xl font-black text-white"
                        style={{ boxShadow: `inset 0 0 0 1px ${accentColor}55` }}
                    >
                        {team.name.slice(0, 2).toUpperCase()}
                    </div>
                </div>

                <div className="mt-6 rounded-lg border border-white/5 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Season Points</p>
                            <p className="mt-1 text-2xl font-black text-white">{points}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Wins</p>
                            <p className="mt-1 text-2xl font-black text-white">{wins}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Drivers</p>
                            <p className="mt-1 text-2xl font-black" style={{ color: accentColor }}>{drivers.length || "—"}</p>
                        </div>
                    </div>

                    <div
                        className="mt-4 h-1.5 rounded-full"
                        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
                    />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    {drivers.slice(0, 2).map((driver) => (
                        <span
                            key={driver.driver.driverId}
                            className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-300"
                        >
                            {driver.driver.code || `${driver.driver.givenName.charAt(0)}${driver.driver.familyName.charAt(0)}`}
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    );
}
