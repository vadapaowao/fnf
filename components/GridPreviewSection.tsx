import Link from "next/link";
import { getRaceCalendar, isUpcomingRace } from "@/lib/f1";

export default async function GridPreviewSection() {
    const raceCalendar = await getRaceCalendar();
    const upcomingRaces = raceCalendar.filter(isUpcomingRace).slice(0, 3);

    return (
        <section className="relative py-24 bg-background-dark overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern-landing opacity-10 pointer-events-none bg-grid-pattern-size"></div>
            <div className="absolute -left-40 top-20 w-96 h-96 bg-primary/10 rounded-full blur-[100px]"></div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <div>
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-2 font-display italic">
                            ON THE GRID
                        </h2>
                        <p className="text-gray-400 max-w-md font-body">
                            Upcoming Grand Prix schedule. Don&apos;t miss the lights out.
                        </p>
                    </div>
                </div>
                <div className="flex overflow-x-auto gap-6 pb-8 scrollbar-hide snap-x snap-mandatory">
                    {upcomingRaces.map((race) => (
                        <Link
                            key={race.round}
                            href={`/f1/race/${race.round}`}
                            className="min-w-[320px] md:min-w-[400px] snap-center cursor-pointer block"
                        >
                            <div className="glass-card rounded-2xl p-6 h-full relative overflow-hidden group hover:border-primary/50 transition-colors bg-gradient-to-br from-surface-dark to-black">
                                <div className="mt-8 mb-4 h-32 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                    <svg
                                        className="w-full h-full stroke-white stroke-2 drop-shadow-[0_0_8px_rgba(255,40,0,0.5)]"
                                        fill="none"
                                        preserveAspectRatio="xMidYMid meet"
                                        viewBox="0 0 100 80"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M25,50 L25,45 L35,40 L40,42 L55,40 L60,35 L58,25 L65,20 L75,22 L80,25 L75,35 L70,38 L72,45 L65,55 L55,52 L45,60 L35,62 L25,58 L20,55 Z"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            transform="translate(5, 5) scale(1.1)"
                                        ></path>
                                    </svg>
                                </div>
                                <div className="space-y-1 mb-6">
                                    <h3 className="text-3xl font-bold text-white font-display">
                                        {race.raceName}
                                    </h3>
                                    <p className="text-gray-400 text-sm uppercase tracking-wider font-body">
                                        {race.circuitName}
                                    </p>
                                </div>
                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-xs text-gray-500 uppercase font-display mb-1">Race Date</p>
                                    <p className="text-sm font-mono text-primary">
                                        {new Date(race.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
