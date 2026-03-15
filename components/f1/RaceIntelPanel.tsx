import { getRaceSessionDurationMs, getRaceWeekendSessions, type Race, type RaceRecap, type RaceSession, type TrackSector } from "@/lib/f1";
import LocalDateTimeText from "@/components/f1/LocalDateTimeText";
import MyPitWallCard from "@/components/f1/MyPitWallCard";
import WinnerHypeButton from "@/components/f1/WinnerHypeButton";
import { getProductRaceState, getTrackDnaProfile, getTrackWatchlistHeading } from "@/lib/f1-product";

interface RaceIntelPanelProps {
    race: Race;
    circuitStats?: {
        lengthKm: string;
        turns: string;
        drsZones: string;
        firstGrandPrix: string;
    };
    lastWinner?: {
        driver: string;
        constructor: string;
        year: string;
    };
    fastestLap?: {
        driver: string;
        time: string;
        year: string;
    };
    recap?: RaceRecap | null;
    sessions?: RaceSession[];
    sectors?: TrackSector[];
}

function hasResolvedSessionState(session: RaceSession) {
    return Boolean(session.resultLabel || session.resultValue || session.officialUrl);
}

function resolveWeekendPulse(sessions: RaceSession[], now: Date) {
    const nowMs = now.getTime();
    let liveSession: RaceSession | null = null;
    let nextSession: RaceSession | null = null;

    for (const session of sessions) {
        const startMs = new Date(session.startsAt).getTime();
        const endMs = startMs + getRaceSessionDurationMs(session.code);
        const sessionResolved = hasResolvedSessionState(session);

        if (!sessionResolved && Number.isFinite(startMs) && startMs <= nowMs && nowMs <= endMs) {
            liveSession = session;
            break;
        }

        if (!nextSession && Number.isFinite(startMs) && startMs > nowMs) {
            nextSession = session;
        }
    }

    return {
        liveSession,
        nextSession,
        lastSession: sessions
            .filter((session) => hasResolvedSessionState(session) || new Date(session.startsAt).getTime() < nowMs)
            .sort((left, right) => new Date(right.startsAt).getTime() - new Date(left.startsAt).getTime())[0] ?? null
    };
}

function getSessionState(session: RaceSession, now: Date) {
    const startMs = new Date(session.startsAt).getTime();
    const endMs = startMs + getRaceSessionDurationMs(session.code);
    const nowMs = now.getTime();

    if (hasResolvedSessionState(session)) {
        return "completed";
    }

    if (nowMs < startMs) {
        return "upcoming";
    }

    if (nowMs <= endMs) {
        return "live";
    }

    return "completed";
}

export default function RaceIntelPanel({
    race,
    circuitStats,
    lastWinner,
    fastestLap,
    recap,
    sessions,
}: RaceIntelPanelProps) {
    const defaultSessions: RaceSession[] = sessions || getRaceWeekendSessions(race);
    const hasRaceFinished = new Date(`${race.date}T${race.time}`).getTime() < Date.now();
    const now = new Date();
    const raceState = getProductRaceState(race);
    const trackDna = getTrackDnaProfile(race.circuitId);
    const watchlistHeading = getTrackWatchlistHeading(raceState);
    const weekendPulse = resolveWeekendPulse(defaultSessions, now);
    const featuredSession = weekendPulse.liveSession ?? weekendPulse.nextSession ?? weekendPulse.lastSession;

    return (
        <aside className="w-[352px] bg-surface-dark/95 border-l border-white/10 p-5 z-20 overflow-y-auto custom-scrollbar shadow-2xl relative xl:w-[368px]">
            <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                <div>
                    <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase">Weekend</h3>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                        {raceState === "upcoming" ? "Weekend pending" : raceState === "live" ? "Weekend live" : "Weekend complete"}
                    </p>
                </div>
                <span className="text-xs bg-grid-primary/20 text-grid-primary px-2 py-1 rounded font-mono">
                    ROUND {race.round}
                </span>
            </div>

            <MyPitWallCard race={race} className="mb-8" />

            {featuredSession ? (
                <div className="mb-8 overflow-hidden rounded-xl border border-[#E10600]/25 bg-[linear-gradient(135deg,#120909_0%,#090909_100%)]">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F56D67]">Right Now</p>
                            <p className="mt-1 text-xs text-gray-400">
                                {weekendPulse.liveSession
                                    ? "Live session"
                                    : weekendPulse.nextSession
                                        ? "Next session"
                                        : "Latest result"}
                            </p>
                        </div>
                        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                            {weekendPulse.liveSession ? "Live" : weekendPulse.nextSession ? "Up next" : "Done"}
                        </span>
                    </div>

                    <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="text-lg font-black text-white">{featuredSession.label}</p>
                                {featuredSession.resultValue ? (
                                    <p className="mt-1 text-[11px] text-gray-300">
                                        {featuredSession.resultLabel}: {featuredSession.resultValue}
                                    </p>
                                ) : (
                                    <p className="mt-1 text-[11px] text-gray-400">
                                        <LocalDateTimeText
                                            iso={featuredSession.startsAt}
                                            options={{
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: false,
                                                timeZoneName: "short"
                                            }}
                                        />
                                    </p>
                                )}
                            </div>

                            {weekendPulse.liveSession ? (
                                <a
                                    href="https://www.fancode.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-lg border border-[#E10600]/40 bg-[#1B0909] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-[#E10600] hover:bg-[#230A0A]"
                                >
                                    <span className="material-icons text-sm">live_tv</span>
                                    Watch Live
                                </a>
                            ) : null}
                        </div>

                        <p className="mt-3 text-[11px] leading-relaxed text-gray-300">
                            {weekendPulse.liveSession
                                ? "This session is on right now."
                                : weekendPulse.nextSession
                                    ? "This is the next one on the clock."
                                    : "Weekend done. Result is in."}
                        </p>
                    </div>
                </div>
            ) : null}

            <details className="group mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-grid-primary">Circuit</p>
                        <p className="mt-1 text-[11px] text-gray-500">The numbers that matter here.</p>
                    </div>
                    <span className="material-icons text-grid-primary transition-transform duration-200 group-open:rotate-180">
                        expand_more
                    </span>
                </summary>
                <div className="grid grid-cols-2 gap-3 border-t border-white/10 px-5 pb-5 pt-4">
                    {[
                        {
                            icon: "straighten",
                            label: "Length",
                            val: circuitStats?.lengthKm ?? "—",
                            unit: "km",
                        },
                        {
                            icon: "turn_slight_right",
                            label: "Turns",
                            val: circuitStats?.turns ?? "—",
                            unit: "",
                        },
                        {
                            icon: "fast_forward",
                            label: "DRS",
                            val: circuitStats?.drsZones ?? "—",
                            unit: "zones",
                        },
                        {
                            icon: "event",
                            label: "First GP",
                            val: circuitStats?.firstGrandPrix ?? "—",
                            unit: "",
                        },
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
                                {stat.unit && <span className="text-sm text-gray-500 ml-1">{stat.unit}</span>}
                            </p>
                        </div>
                    ))}
                </div>
            </details>

            {/* Circuit Info */}
            <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-icons text-6xl text-white">location_on</span>
                </div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">
                    Track
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

            <details className="group mb-6 rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-grid-primary">Track Traits</p>
                        <p className="mt-1 text-[11px] text-gray-500">{trackDna.archetype}</p>
                    </div>
                    <span className="material-icons text-grid-primary transition-transform duration-200 group-open:rotate-180">
                        expand_more
                    </span>
                </summary>
                <div className="border-t border-white/10 px-5 pb-5 pt-4">
                    <p className="text-sm leading-relaxed text-gray-300">{trackDna.summary}</p>
                    <p className="mt-3 text-[11px] text-gray-500">{trackDna.fanHook}</p>

                    <div className="mt-4 grid gap-2">
                        {trackDna.metrics.map((metric) => (
                            <div key={metric.label} className="rounded-lg border border-white/10 bg-black/20 px-3 py-3">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">{metric.label}</p>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white">{metric.value}</span>
                                </div>
                                <p className="mt-2 text-[11px] leading-relaxed text-gray-400">{metric.detail}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </details>

            <details className="group mb-8 rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 marker:content-none">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-grid-primary">{watchlistHeading.title}</p>
                        <p className="mt-1 text-[11px] text-gray-500">{watchlistHeading.subtitle}</p>
                    </div>
                    <span className="material-icons text-grid-primary transition-transform duration-200 group-open:rotate-180">
                        expand_more
                    </span>
                </summary>
                <div className="space-y-3 border-t border-white/10 px-5 pb-5 pt-4">
                    {trackDna.watchpoints.map((watchpoint) => (
                        <div key={`${watchpoint.phase}-${watchpoint.title}`} className="rounded-lg border border-white/10 bg-black/20 p-4">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-grid-primary">{watchpoint.phase}</p>
                                <span className="h-2 w-2 rounded-full bg-grid-primary" />
                            </div>
                            <p className="mt-2 text-sm font-bold text-white">{watchpoint.title}</p>
                            <p className="mt-2 text-[11px] leading-relaxed text-gray-400">{watchpoint.detail}</p>
                        </div>
                    ))}
                </div>
            </details>

            {/* Last Winner */}
            {lastWinner && (
                <div className="mb-8 overflow-hidden rounded-2xl border border-[#F86B6B]/35 bg-[radial-gradient(circle_at_top_right,rgba(248,107,107,0.26),transparent_42%),linear-gradient(145deg,#140809_0%,#0A0A0A_64%)] shadow-[0_14px_35px_rgba(225,6,0,0.22)]">
                    <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#FF8F8F]">Last Winner Here</p>
                        <span className="rounded-full border border-[#FF7E7E]/50 bg-[#2A0F10] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#FFD4D4]">
                            Recent
                        </span>
                    </div>
                    <div className="relative p-4">
                        <div className="pointer-events-none absolute right-3 top-3 h-14 w-14 rounded-full bg-[#E10600]/20 blur-xl" />
                        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-2 py-1">
                            <span className="material-icons text-sm text-[#FFD9B8]">emoji_events</span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#FFD9B8]">Last winner here</span>
                        </div>
                        <WinnerHypeButton
                            driver={lastWinner.driver}
                            className="mt-3 inline-flex rounded-md border border-transparent px-1 text-left text-2xl font-black tracking-tight text-white transition-colors hover:border-[#FF9A9A]/40 hover:bg-[#220B0C]"
                        />
                        <p className="mt-1 text-xs text-[#F0B3B3]">{lastWinner.constructor} • {lastWinner.year}</p>
                    </div>
                </div>
            )}

            {/* Fastest Lap */}
            {fastestLap && (
                <div className="mb-8 p-5 rounded-xl bg-gradient-to-br from-surface-dark to-background-dark border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <span className="material-icons text-6xl text-white">timer</span>
                    </div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10">
                        Fastest Lap
                    </h4>
                    <div className="relative z-10">
                        <p className="text-xl font-mono font-bold text-accent-green">{fastestLap.time}</p>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="w-1.5 h-1.5 bg-accent-green rounded-full"></span>
                            <p className="text-xs text-gray-300">
                                {fastestLap.driver} • {fastestLap.year}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Race Recap */}
            {recap && (
                <details className="group mb-8 rounded-xl border border-grid-primary/25 bg-gradient-to-br from-[#120808] to-[#080808]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 marker:content-none">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-grid-primary">Race Recap</p>
                            <p className="mt-2 text-sm font-bold text-white">{recap.headline}</p>
                            <p className="mt-1 text-[11px] text-gray-400">Open for the key moments and the pit window.</p>
                        </div>
                        <span className="material-icons text-grid-primary transition-transform duration-200 group-open:rotate-180">
                            expand_more
                        </span>
                    </summary>

                    <div className="border-t border-white/10 px-5 pb-5 pt-4">
                        <p className="text-xs leading-relaxed text-gray-300">{recap.winnerStory}</p>
                        <p className="mt-3 text-[11px] text-gray-300">{recap.decisivePitWindow}</p>

                        {recap.fastestLap && (
                            <p className="mt-2 text-[11px] text-accent-green">
                                Fastest lap: {recap.fastestLap.driver} • {recap.fastestLap.lapTime} (Lap {recap.fastestLap.lap})
                            </p>
                        )}

                        {recap.biggestGainer && (
                            <p className="mt-2 text-[11px] text-gray-300">
                                Biggest gainer: {recap.biggestGainer.driver} (+{recap.biggestGainer.positionsGained}, P
                                {recap.biggestGainer.started} to P{recap.biggestGainer.finished})
                            </p>
                        )}

                        <div className="mt-4 space-y-2">
                            {recap.keyMoments.map((moment) => (
                                <details key={moment.title} className="group/moment rounded-lg border border-white/10 bg-black/30">
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 marker:content-none">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-grid-primary">{moment.title}</p>
                                        <span className="material-icons text-sm text-grid-primary/80 transition-transform duration-200 group-open/moment:rotate-180">
                                            expand_more
                                        </span>
                                    </summary>
                                    <p className="border-t border-white/10 px-3 pb-3 pt-2 text-[11px] leading-relaxed text-gray-300">
                                        {moment.detail}
                                    </p>
                                </details>
                            ))}
                        </div>

                        <div className="mt-4 grid gap-2">
                            {recap.sectorNarrative.map((sector) => (
                                <details key={sector.sector} className="group/sector rounded-lg border border-white/10 bg-black/20">
                                    <summary className="flex cursor-pointer list-none items-center justify-between p-3 marker:content-none">
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-200">{sector.sector}</p>
                                        <span className="material-icons text-sm text-gray-400 transition-transform duration-200 group-open/sector:rotate-180">
                                            expand_more
                                        </span>
                                    </summary>
                                    <p className="border-t border-white/10 px-3 pb-3 pt-2 text-[11px] leading-relaxed text-gray-400">
                                        {sector.summary}
                                    </p>
                                </details>
                            ))}
                        </div>
                    </div>
                </details>
            )}

            {!recap && hasRaceFinished && (
                <div className="mb-8 rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-300">Race Recap</p>
                    <p className="mt-2 text-[11px] text-gray-400">Recap not available yet.</p>
                </div>
            )}

            {/* Weekend Schedule */}
            <div className="mb-6">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                    Weekend Schedule
                </h4>
                <div className="space-y-2">
                    {defaultSessions.map((session) => {
                        const sessionDate = session.startsAt ? new Date(session.startsAt) : null;
                        const isRace = session.code === "RACE";
                        const sessionState = getSessionState(session, now);
                        const showResult = sessionState === "completed" && Boolean(session.resultValue);

                        return (
                            <div
                                key={session.code}
                                className={`flex items-center justify-between p-3 rounded-lg ${isRace
                                        ? "bg-grid-primary/10 border border-grid-primary/30"
                                        : "bg-white/5 border border-white/5"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-2 h-2 rounded-full ${isRace ? "bg-grid-primary" : "bg-gray-600"
                                            }`}
                                    ></div>
                                    <div>
                                        <p className={`text-xs font-bold ${isRace ? "text-white" : "text-gray-300"}`}>
                                            {session.label}
                                        </p>
                                        {sessionDate && (
                                            <p className="text-[10px] text-gray-500">
                                                <LocalDateTimeText
                                                    iso={session.startsAt}
                                                    options={{
                                                        weekday: "short",
                                                        month: "short",
                                                        day: "numeric"
                                                    }}
                                                />
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    {showResult ? (
                                        <>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-grid-primary">
                                                {session.resultLabel}
                                            </p>
                                            <p className="mt-1 text-xs font-bold text-white">{session.resultValue}</p>
                                        </>
                                    ) : sessionState === "live" ? (
                                        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-grid-primary">Live now</p>
                                    ) : (
                                        <span className="text-xs font-mono text-gray-400">
                                            {sessionDate ? (
                                                <LocalDateTimeText
                                                    iso={session.startsAt}
                                                    options={{
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        hour12: false,
                                                        timeZoneName: "short"
                                                    }}
                                                />
                                            ) : "TBD"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </aside>
    );
}
