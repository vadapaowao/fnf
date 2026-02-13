import { type Race } from "@/lib/f1";

interface GridIntelPanelProps {
    race: Race;
}

export default function GridIntelPanel({ race }: GridIntelPanelProps) {
    const schedule = [
        { day: "FRI", time: "12:30", name: "Practice 1", active: false },
        { day: "SAT", time: "15:00", name: "Qualifying", active: false },
        { day: "SUN", time: new Date(race.time).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }), name: "Grand Prix", active: true },
    ];

    return (
        <aside className="w-96 bg-surface-dark/95 border-l border-white/10 p-6 z-20 overflow-y-auto custom-scrollbar shadow-2xl relative">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase">Race Intel</h3>
                <span className="text-xs bg-grid-primary/20 text-grid-primary px-2 py-1 rounded font-mono">
                    ROUND {race.round}
                </span>
            </div>

            {/* Circuit Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                    { icon: "straighten", label: "Circuit", val: race.circuitName.split(" ")[0], unit: "" },
                    { icon: "repeat", label: "Round", val: String(race.round), unit: "" },
                    { icon: "alt_route", label: "Location", val: race.locality.substring(0, 8), unit: "" },
                    { icon: "event", label: "Date", val: new Date(race.date).getDate().toString(), unit: new Date(race.date).toLocaleDateString("en-US", { month: "short" }) },
                ].map((stat, idx) => (
                    <div
                        key={idx}
                        className="bg-background-dark/50 p-4 rounded-lg border border-white/5 hover:border-grid-primary/30 transition-colors group"
                    >
                        <div className="flex items-center gap-2 mb-2 text-gray-500">
                            <span className="material-icons text-sm group-hover:text-grid-primary transition-colors">
                                {stat.icon}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-mono font-bold text-white">
                            {stat.val}
                            <span className="text-sm text-gray-500 ml-1">{stat.unit}</span>
                        </p>
                    </div>
                ))}
            </div>

            {/* Lap Record */}
            <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-icons text-6xl text-white">timer</span>
                </div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">
                    Circuit Info
                </h4>
                <div className="relative z-10">
                    <p className="text-xl font-mono font-bold text-grid-primary neon-text">
                        {race.circuitName}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="w-1.5 h-1.5 bg-grid-primary rounded-full"></span>
                        <p className="text-xs text-gray-300">
                            {race.locality}, {race.country}
                        </p>
                    </div>
                </div>
            </div>

            {/* Weekend Schedule */}
            <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Weekend Schedule
                </h4>
                <div className="space-y-4 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                    {schedule.map((event, idx) => (
                        <div key={idx} className="flex items-center gap-4 relative">
                            <div
                                className={`w-10 text-[10px] font-mono font-bold text-right ${event.active ? "text-grid-primary" : "text-gray-500"
                                    }`}
                            >
                                {event.day}
                            </div>
                            <div
                                className={`w-2.5 h-2.5 rounded-full border-2 border-surface-dark z-10 ${event.active
                                        ? "bg-grid-primary shadow-[0_0_8px_#f91f1f]"
                                        : "bg-gray-700"
                                    }`}
                            ></div>
                            <div
                                className={`flex-1 p-3 rounded-lg border relative overflow-hidden ${event.active
                                        ? "bg-background-dark/80 border-grid-primary/30"
                                        : "bg-background-dark/30 border-white/5"
                                    }`}
                            >
                                {event.active && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-grid-primary"></div>
                                )}
                                <div className="flex justify-between items-center">
                                    <span
                                        className={`text-xs font-bold ${event.active ? "text-white uppercase" : "text-gray-300"
                                            }`}
                                    >
                                        {event.name}
                                    </span>
                                    <span
                                        className={`text-[10px] font-mono ${event.active ? "text-grid-primary font-bold" : "text-gray-500"
                                            }`}
                                    >
                                        {event.time}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex justify-center">
                <button className="text-xs text-gray-500 hover:text-white flex items-center gap-1 transition-colors font-display uppercase tracking-wider">
                    FULL STATS BREAKDOWN{" "}
                    <span className="material-icons text-sm">arrow_forward</span>
                </button>
            </div>
        </aside>
    );
}
