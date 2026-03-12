import Link from "next/link";
import { ConstructorStanding } from "@/lib/f1";

interface TeamCardProps {
    standing: ConstructorStanding;
}

export default function TeamCard({ standing }: TeamCardProps) {
    const { constructor: team, position, points, wins } = standing;

    return (
        <Link
            href={`/f1/team/${team.constructorId}`}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-black/40 p-6 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20"
        >
            {/* Background Glow on Hover */}
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-purple-500/0 blur-2xl transition-all group-hover:bg-purple-500/10"></div>

            <div className="relative z-10">
                {/* Position Badge */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-purple-500/30 bg-purple-500/10 font-display text-xl font-bold text-purple-400">
                    {position}
                </div>

                {/* Team Name */}
                <h3 className="mb-2 font-display text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">
                    {team.name}
                </h3>

                {/* Nationality */}
                <p className="mb-6 text-sm text-gray-400">{team.nationality}</p>

                {/* Stats */}
                <div className="flex justify-between border-t border-white/10 pt-4">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                            Points
                        </p>
                        <p className="font-mono text-lg font-bold text-white">{points}</p>
                    </div>
                    <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500">
                            Wins
                        </p>
                        <p className="font-mono text-lg font-bold text-white">{wins}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
