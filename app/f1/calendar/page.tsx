import Link from "next/link";
import { getRaceCalendar } from "@/lib/f1";

export default async function CalendarPage() {
    const races = await getRaceCalendar();
    const now = new Date();

    return (
        <main className="flex-1 overflow-y-auto bg-background-dark">
            <div className="container mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 font-display">
                        2026 CALENDAR
                    </h1>
                    <p className="text-gray-400">
                        {races.length} races across the season
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {races.map((race) => {
                        const raceDate = new Date(race.date);
                        const isPast = raceDate < now;
                        const isUpcoming = !isPast;

                        return (
                            <Link
                                key={race.round}
                                href={`/f1/race/${race.round}`}
                                className="group block"
                            >
                                <div
                                    className={`p-6 rounded-xl border transition-all hover:scale-[1.02] ${isUpcoming
                                            ? "bg-gradient-to-br from-surface-dark to-background-dark border-white/10 hover:border-grid-primary/50"
                                            : "bg-background-dark/50 border-white/5 opacity-60 hover:opacity-80"
                                        }`}
                                >
                                    {/* Round and Status */}
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-mono text-gray-500">
                                            ROUND {String(race.round).padStart(2, "0")}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold px-2 py-1 rounded ${isPast
                                                    ? "bg-gray-800 text-gray-500"
                                                    : "bg-grid-primary/20 text-grid-primary"
                                                }`}
                                        >
                                            {isPast ? "FINISHED" : "UPCOMING"}
                                        </span>
                                    </div>

                                    {/* Race Name */}
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-grid-primary transition-colors font-display">
                                        {race.raceName}
                                    </h3>

                                    {/* Location */}
                                    <div className="flex items-center gap-2 text-gray-400 mb-4">
                                        <span className="material-icons text-sm">location_on</span>
                                        <span className="text-sm">
                                            {race.locality}, {race.country}
                                        </span>
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-2 text-gray-300">
                                        <span className="material-icons text-sm">event</span>
                                        <span className="text-sm font-mono">
                                            {raceDate.toLocaleDateString("en-US", {
                                                month: "long",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>

                                    {/* Circuit */}
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <p className="text-xs text-gray-500 truncate">
                                            {race.circuitName}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </main>
    );
}
