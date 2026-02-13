import { DriverCareerStats } from "@/lib/f1";

interface CareerTimelineProps {
    events: DriverCareerStats;
}

export default function CareerTimeline({ events }: CareerTimelineProps) {
    // Create timeline from career stats with safe defaults
    const totalWins = events?.totalWins ?? 0;
    const totalPodiums = events?.totalPodiums ?? 0;
    const totalPoles = events?.totalPoles ?? 0;

    const timelineEvents = [
        {
            year: "Career",
            team: "Formula 1 Stats",
            event: `${totalWins} wins • ${totalPodiums} podiums • ${totalPoles} poles`,
            active: true,
            highlight: totalWins > 0,
        },
    ];

    return (
        <div>
            <h3 className="text-lg font-bold text-white uppercase font-display mb-6 border-l-4 border-primary pl-4">
                Career Statistics
            </h3>

            <div className="space-y-0 relative">
                {/* Vertical Line */}
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary via-white/10 to-transparent"></div>

                {timelineEvents.map((item, index) => (
                    <div key={index} className="flex gap-6 group">
                        {/* Timeline Dot */}
                        <div className="relative z-10 flex flex-col items-center">
                            <div
                                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center bg-surface-dark transition-colors ${item.active
                                    ? "border-primary shadow-[0_0_15px_rgba(255,40,0,0.5)]"
                                    : "border-white/10 group-hover:border-white"
                                    }`}
                            >
                                {item.highlight ? (
                                    <span className="material-icons text-amber-400 text-sm">
                                        emoji_events
                                    </span>
                                ) : (
                                    <div
                                        className={`w-2 h-2 rounded-full ${item.active ? "bg-primary" : "bg-gray-500"
                                            }`}
                                    ></div>
                                )}
                            </div>
                        </div>

                        {/* Event Content */}
                        <div className="pb-8 pt-1 flex-1 border-b border-white/5 group-last:border-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span
                                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${item.active
                                            ? "bg-primary text-white"
                                            : "bg-white/5 text-gray-400"
                                            }`}
                                    >
                                        {item.year}
                                    </span>
                                    <h4 className="text-xl font-bold text-white mt-2 font-display">
                                        {item.team}
                                    </h4>
                                    <p className="text-sm text-gray-400 mt-1">{item.event}</p>
                                </div>
                                {item.highlight && (
                                    <span className="text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-400/30 px-2 py-1 rounded bg-amber-400/5">
                                        Winner
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
