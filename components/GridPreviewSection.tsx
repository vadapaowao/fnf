import Link from "next/link";
import { getRaceCalendar, isUpcomingRace } from "@/lib/f1";

function formatRaceDate(date: string) {
    return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

export default async function GridPreviewSection() {
    const raceCalendar = await getRaceCalendar();
    const upcomingRaces = raceCalendar.filter(isUpcomingRace).slice(0, 3);

    return (
        <section className="relative overflow-hidden bg-background-dark py-24">
            <div className="absolute left-0 top-0 h-full w-full bg-grid-pattern-landing bg-grid-pattern-size opacity-10 pointer-events-none"></div>
            <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-[100px]"></div>
            <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-primary/10 blur-[120px]"></div>
            <div className="container relative z-10 mx-auto px-4">
                <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Next Three Rounds</p>
                        <h2 className="mb-2 mt-3 font-display text-5xl font-bold italic tracking-tighter text-white md:text-7xl">
                            LIGHTS OUT AHEAD
                        </h2>
                        <p className="max-w-md font-body text-gray-400">
                            Upcoming Grand Prix schedule with enough context to make the page feel alive before the weekend even starts.
                        </p>
                    </div>
                    <Link
                        href="/f1"
                        className="inline-flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:text-primary"
                    >
                        <span className="border-b border-primary pb-1">Enter The Grid</span>
                        <span className="material-icons text-sm">arrow_forward</span>
                    </Link>
                </div>
                <div className="grid gap-6 lg:grid-cols-3">
                    {upcomingRaces.map((race, index) => (
                        <Link
                            key={race.round}
                            href={`/f1/race/${race.round}`}
                            className="block min-w-0"
                        >
                            <div className="glass-card group relative h-full overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-surface-dark to-black p-6 transition-all hover:-translate-y-1 hover:border-primary/40">
                                <div className="flex items-center justify-between gap-3">
                                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                                        Round {race.round}
                                    </span>
                                    <span className="font-mono text-sm text-gray-500">0{index + 1}</span>
                                </div>
                                <div className="mb-4 mt-8 flex h-32 items-center justify-center opacity-80 transition-opacity group-hover:opacity-100">
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
                                <div className="mb-6 space-y-1">
                                    <h3 className="font-display text-3xl font-bold text-white">
                                        {race.raceName}
                                    </h3>
                                    <p className="font-body text-sm uppercase tracking-wider text-gray-400">
                                        {race.locality}, {race.country}
                                    </p>
                                </div>
                                <div className="grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
                                    <div>
                                        <p className="mb-1 text-xs uppercase text-gray-500 font-display">Race Date</p>
                                        <p className="text-sm font-mono text-primary">{formatRaceDate(race.date)}</p>
                                    </div>
                                    <div>
                                        <p className="mb-1 text-xs uppercase text-gray-500 font-display">Circuit</p>
                                        <p className="truncate text-sm text-gray-300">{race.circuitName}</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
