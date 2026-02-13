import { type RaceSession } from "@/lib/f1";

interface WeekendScheduleProps {
    sessions: RaceSession[];
}

export default function WeekendSchedule({ sessions }: WeekendScheduleProps) {
    return (
        <div className="mb-6">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Weekend Schedule
            </h4>
            <div className="space-y-2">
                {sessions.map((session) => {
                    const sessionDate = session.startsAt ? new Date(session.startsAt) : null;
                    const isRace = session.code === "RACE";

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
                                            {sessionDate.toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <span className="text-xs font-mono text-gray-400">
                                {sessionDate
                                    ? sessionDate.toLocaleTimeString("en-US", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        hour12: false,
                                    })
                                    : "TBD"}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
