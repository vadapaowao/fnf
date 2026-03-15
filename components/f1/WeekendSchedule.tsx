import { getRaceSessionDurationMs, type RaceSession } from "@/lib/f1";
import LocalDateTimeText from "@/components/f1/LocalDateTimeText";

interface WeekendScheduleProps {
    sessions: RaceSession[];
}

function hasResolvedSessionState(session: RaceSession) {
    return Boolean(session.resultLabel || session.resultValue || session.officialUrl);
}

export default function WeekendSchedule({ sessions }: WeekendScheduleProps) {
    const now = new Date();

    return (
        <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Weekend Schedule
            </h4>
            <div className="space-y-2">
                {sessions.map((session) => {
                    const sessionDate = session.startsAt ? new Date(session.startsAt) : null;
                    const isRace = session.code === "RACE";
                    const startMs = sessionDate ? sessionDate.getTime() : Number.NaN;
                    const endMs = startMs + getRaceSessionDurationMs(session.code);
                    const sessionState = hasResolvedSessionState(session)
                        ? "completed"
                        : now.getTime() < startMs
                            ? "upcoming"
                            : now.getTime() <= endMs
                                ? "live"
                                : "completed";
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
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-grid-primary">{session.resultLabel}</p>
                                        <p className="mt-1 text-xs font-bold text-white">{session.resultValue}</p>
                                    </>
                                ) : sessionState === "live" ? (
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-grid-primary">Live now</p>
                                ) : sessionDate ? (
                                    <span className="text-xs font-mono text-gray-400">
                                        <LocalDateTimeText
                                            iso={sessionDate.toISOString()}
                                            fallback="TBD"
                                            options={{ hour: "2-digit", minute: "2-digit", hour12: false }}
                                        />
                                    </span>
                                ) : (
                                    <span className="text-xs font-mono text-gray-400">TBD</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
