type StatItem = {
    icon: string;
    label: string;
    value: string | number;
    color: "cyan" | "purple" | "pink" | "orange" | "green";
};

type StatsGridProps = {
    stats: StatItem[];
    columns?: 2 | 3 | 4;
};

const colorClasses: Record<StatItem["color"], { bg: string; text: string; glow: string }> = {
    cyan: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        glow: "group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]",
    },
    purple: {
        bg: "bg-purple-500/10",
        text: "text-purple-400",
        glow: "group-hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]",
    },
    pink: {
        bg: "bg-pink-500/10",
        text: "text-pink-400",
        glow: "group-hover:shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    },
    orange: {
        bg: "bg-orange-500/10",
        text: "text-orange-400",
        glow: "group-hover:shadow-[0_0_15px_rgba(251,146,60,0.3)]",
    },
    green: {
        bg: "bg-green-500/10",
        text: "text-green-400",
        glow: "group-hover:shadow-[0_0_15px_rgba(34,197,94,0.3)]",
    },
};

export default function StatsGrid({ stats, columns = 3 }: StatsGridProps) {
    const gridCols = {
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-2 sm:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={`grid gap-4 ${gridCols[columns]}`}>
            {stats.map((stat, index) => {
                const colors = colorClasses[stat.color];
                return (
                    <div
                        key={index}
                        className={`group relative overflow-hidden rounded-lg border border-gray-800 ${colors.bg} p-6 backdrop-blur-sm transition-all duration-300 hover:border-gray-700 ${colors.glow}`}
                    >
                        {/* Icon */}
                        <div className={`mb-3 text-3xl ${colors.text}`}>{stat.icon}</div>

                        {/* Value */}
                        <div className={`mb-1 font-['Space_Grotesk'] text-3xl font-bold ${colors.text}`}>
                            {stat.value}
                        </div>

                        {/* Label */}
                        <div className="text-sm text-gray-400">{stat.label}</div>

                        {/* Decorative corner accent */}
                        <div
                            className={`absolute -right-6 -top-6 h-16 w-16 rounded-full ${colors.bg} opacity-30 blur-xl transition-opacity duration-300 group-hover:opacity-50`}
                        />
                    </div>
                );
            })}
        </div>
    );
}
