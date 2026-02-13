interface StatItem {
    label: string;
    value: string;
    icon: string;
    color: string;
}

interface DriverStatsProps {
    wins: string;
    poles?: string;
    rank: string;
}

export default function DriverStats({ wins, poles = "N/A", rank }: DriverStatsProps) {
    const stats: StatItem[] = [
        { label: "Wins", value: wins, icon: "emoji_events", color: "text-accent-gold" },
        { label: "Poles", value: poles, icon: "speed", color: "text-primary" },
        { label: "Rank", value: `#${rank}`, icon: "trending_up", color: "text-accent-green" },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12 mt-12 lg:mt-0">
            {stats.map((stat, i) => (
                <div
                    key={i}
                    className="glass-card p-6 rounded-xl border border-white/5 hover:border-primary/30 transition-all group stat-card-gradient"
                >
                    <div className="flex justify-between items-start mb-4">
                        <span className={`material-icons ${stat.color} opacity-80 text-xl`}>
                            {stat.icon}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 font-display">
                            {stat.label}
                        </span>
                    </div>
                    <h3 className="text-3xl lg:text-4xl font-bold font-mono text-white group-hover:scale-105 transition-transform origin-left">
                        {stat.value}
                    </h3>
                </div>
            ))}

            <style jsx>{`
        .glass-card {
          background: rgba(21, 21, 21, 0.6);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .stat-card-gradient {
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0.03) 0%,
            rgba(255, 255, 255, 0.01) 100%
          );
        }
      `}</style>
        </div>
    );
}
