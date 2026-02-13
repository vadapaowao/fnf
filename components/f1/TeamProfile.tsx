import { Constructor } from "@/lib/f1";

interface TeamProfileProps {
    team: Constructor;
    position: string;
    points: string;
    wins: string;
}

export default function TeamProfile({
    team,
    position,
    points,
    wins,
}: TeamProfileProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-black/40 p-8 backdrop-blur-sm">
            {/* Background Glow */}
            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl"></div>

            <div className="relative z-10">
                {/* Championship Position Badge */}
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2">
                    <span className="font-display text-sm font-bold uppercase tracking-wider text-purple-400">
                        P{position}
                    </span>
                    <span className="text-xs text-gray-400">Championship</span>
                </div>

                {/* Team Name */}
                <h1 className="mb-4 font-display text-5xl font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                        {team.name}
                    </span>
                </h1>

                {/* Nationality */}
                <p className="mb-8 text-lg text-gray-400">{team.nationality}</p>

                {/* Stats Row */}
                <div className="flex gap-8">
                    <div>
                        <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-500">
                            Points
                        </p>
                        <p className="font-mono text-3xl font-bold text-white">{points}</p>
                    </div>
                    <div>
                        <p className="mb-1 text-sm font-medium uppercase tracking-wider text-gray-500">
                            Wins
                        </p>
                        <p className="font-mono text-3xl font-bold text-white">{wins}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
