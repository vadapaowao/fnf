import type { MatchEvent } from "@/lib/football-api";

type MatchTimelineProps = {
  events: MatchEvent[];
};

export default function MatchTimeline({ events }: MatchTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C] p-6 text-sm text-[#8A9E8C]">
        Data unavailable.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C] p-6">
      <div className="space-y-4">
        {events.map((event, index) => (
          <div key={event.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(0,230,118,0.18)] bg-[#07110A] text-lg">
                {event.icon}
              </div>
              {index !== events.length - 1 ? <div className="mt-2 h-full w-px bg-[rgba(0,230,118,0.12)]" /> : null}
            </div>
            <div className="flex-1 rounded-2xl border border-[rgba(0,230,118,0.08)] bg-[#07110A] px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#69F0AE]">
                    {event.minute}&apos;{event.injuryTime ? `+${event.injuryTime}` : ""}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">{event.playerName}</p>
                  <p className="mt-1 text-[11px] text-[#8A9E8C]">{event.detail}</p>
                  {event.relatedPlayerName ? <p className="mt-1 text-[11px] text-[#8A9E8C]">{event.relatedPlayerName}</p> : null}
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A9E8C]">{event.teamName ?? "Match Event"}</p>
                  {event.scoreLabel ? <p className="mt-1 font-mono text-sm font-bold text-white">{event.scoreLabel}</p> : null}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
