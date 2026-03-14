"use client";

import { useEffect, useMemo, useState } from "react";

import type { RaceReplayData } from "@/lib/f1";
import { cn } from "@/lib/utils";

type RaceBattleModeProps = {
  replay?: RaceReplayData | null;
};

type ReplayTrace = RaceReplayData["traces"][number];

type LapDelta = {
  lap: number;
  deltaMs: number;
  faster: "left" | "right" | "tie";
};

function formatGap(ms: number) {
  const sign = ms >= 0 ? "+" : "-";
  const absolute = Math.abs(ms);
  const seconds = absolute / 1000;
  return `${sign}${seconds.toFixed(seconds >= 10 ? 1 : 2)}s`;
}

function formatAverage(ms: number) {
  const seconds = Math.abs(ms) / 1000;
  return `${ms >= 0 ? "+" : "-"}${seconds.toFixed(3)}s/lap`;
}

function buildLapTimes(trace: ReplayTrace) {
  return trace.cumulativeMs.map((value, index) => {
    const previous = index > 0 ? trace.cumulativeMs[index - 1] ?? 0 : 0;
    return value - previous;
  });
}

function buildLapDeltas(left: ReplayTrace, right: ReplayTrace): LapDelta[] {
  const leftLapTimes = buildLapTimes(left);
  const rightLapTimes = buildLapTimes(right);
  const lapCount = Math.min(leftLapTimes.length, rightLapTimes.length);

  return Array.from({ length: lapCount }, (_, index) => {
    const deltaMs = (leftLapTimes[index] ?? 0) - (rightLapTimes[index] ?? 0);

    return {
      lap: index + 1,
      deltaMs,
      faster: deltaMs < -1 ? "left" : deltaMs > 1 ? "right" : "tie"
    };
  });
}

function getSegmentWinner(deltas: LapDelta[]) {
  const total = deltas.reduce((sum, lap) => sum + lap.deltaMs, 0);

  if (Math.abs(total) < 1) {
    return "Even";
  }

  return total < 0 ? "Left" : "Right";
}

export default function RaceBattleMode({ replay }: RaceBattleModeProps) {
  const traces = useMemo(
    () => [...(replay?.traces ?? [])].sort((left, right) => left.finishPosition - right.finishPosition),
    [replay?.traces]
  );

  const [leftId, setLeftId] = useState(traces[0]?.driverId ?? "");
  const [rightId, setRightId] = useState(traces[1]?.driverId ?? "");

  useEffect(() => {
    setLeftId((current) => (traces.some((trace) => trace.driverId === current) ? current : traces[0]?.driverId ?? ""));
    setRightId((current) => {
      if (traces.some((trace) => trace.driverId === current && current !== (traces[0]?.driverId ?? ""))) {
        return current;
      }

      return traces[1]?.driverId ?? traces[0]?.driverId ?? "";
    });
  }, [traces]);

  const leftTrace = traces.find((trace) => trace.driverId === leftId) ?? traces[0] ?? null;
  const rightTrace =
    traces.find((trace) => trace.driverId === rightId && trace.driverId !== leftTrace?.driverId) ??
    traces.find((trace) => trace.driverId !== leftTrace?.driverId) ??
    null;

  const lapDeltas = useMemo(() => {
    if (!leftTrace || !rightTrace) {
      return [];
    }

    return buildLapDeltas(leftTrace, rightTrace);
  }, [leftTrace, rightTrace]);

  const maxDeltaMs = useMemo(() => lapDeltas.reduce((max, lap) => Math.max(max, Math.abs(lap.deltaMs)), 1), [lapDeltas]);
  const leftFasterLaps = lapDeltas.filter((lap) => lap.faster === "left").length;
  const rightFasterLaps = lapDeltas.filter((lap) => lap.faster === "right").length;
  const averageDeltaMs =
    lapDeltas.length > 0 ? lapDeltas.reduce((sum, lap) => sum + lap.deltaMs, 0) / lapDeltas.length : 0;
  const finalGapMs =
    leftTrace && rightTrace
      ? (leftTrace.cumulativeMs[leftTrace.cumulativeMs.length - 1] ?? 0) - (rightTrace.cumulativeMs[rightTrace.cumulativeMs.length - 1] ?? 0)
      : 0;
  const third = Math.max(Math.floor(lapDeltas.length / 3), 1);
  const segmentLabels = [
    { label: "Opening third", winner: getSegmentWinner(lapDeltas.slice(0, third)) },
    { label: "Middle third", winner: getSegmentWinner(lapDeltas.slice(third, third * 2)) },
    { label: "Final third", winner: getSegmentWinner(lapDeltas.slice(third * 2)) }
  ];

  if (traces.length < 2) {
    return (
      <article className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-5">
        <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">Head to Head</p>
        <h2 className="mt-2 font-display text-2xl font-bold text-white">No duel data yet</h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">
          Replay data is not ready for this race yet.
        </p>
      </article>
    );
  }

  return (
    <details className="group/battle rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 marker:content-none">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">Head to Head</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Pick two drivers</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            Lap by lap, not just the classified order.
          </p>
        </div>

        <span className="material-icons text-grid-primary transition-transform duration-200 group-open/battle:rotate-180">
          expand_more
        </span>
      </summary>

      <div className="border-t border-white/10 p-5">
        <div className="grid gap-3 lg:grid-cols-2">
          <label className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Driver A</p>
            <select
              className="mt-2 w-full truncate bg-transparent pr-6 text-sm font-bold text-white outline-none"
              value={leftTrace?.driverId ?? ""}
              onChange={(event) => {
                const nextId = event.target.value;
                setLeftId(nextId);
                if (nextId === rightId) {
                  const fallback = traces.find((trace) => trace.driverId !== nextId)?.driverId ?? nextId;
                  setRightId(fallback);
                }
              }}
            >
              {traces.map((trace) => (
                <option key={trace.driverId} value={trace.driverId} className="bg-[#0B0B0B]">
                  {trace.code} · {trace.name}
                </option>
              ))}
            </select>
          </label>

          <label className="min-w-0 rounded-lg border border-white/10 bg-black/20 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Driver B</p>
            <select
              className="mt-2 w-full truncate bg-transparent pr-6 text-sm font-bold text-white outline-none"
              value={rightTrace?.driverId ?? ""}
              onChange={(event) => {
                const nextId = event.target.value;
                setRightId(nextId);
                if (nextId === leftId) {
                  const fallback = traces.find((trace) => trace.driverId !== nextId)?.driverId ?? nextId;
                  setLeftId(fallback);
                }
              }}
            >
              {traces.map((trace) => (
                <option key={trace.driverId} value={trace.driverId} className="bg-[#0B0B0B]">
                  {trace.code} · {trace.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {leftTrace && rightTrace ? (
          <>
            <div className="mt-4 grid gap-3 md:grid-cols-4">
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Finish gap</p>
                <p className="mt-2 text-xl font-black text-white">{formatGap(finalGapMs)}</p>
                <p className="mt-1 text-[11px] text-gray-500">
                  P{leftTrace.finishPosition} vs P{rightTrace.finishPosition}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Avg lap delta</p>
                <p className="mt-2 text-xl font-black text-white">{formatAverage(averageDeltaMs)}</p>
                <p className="mt-1 text-[11px] text-gray-500">{lapDeltas.length} shared laps</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">{leftTrace.code} faster laps</p>
                <p className="mt-2 text-xl font-black text-white">{leftFasterLaps}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">{rightTrace.code} faster laps</p>
                <p className="mt-2 text-xl font-black text-white">{rightFasterLaps}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {segmentLabels.map((segment) => (
                <div key={segment.label} className="min-w-0 rounded-lg border border-white/10 bg-black/20 px-4 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">{segment.label}</p>
                  <p className="mt-2 truncate text-sm font-bold text-white">
                    {segment.winner === "Left" ? leftTrace.name : segment.winner === "Right" ? rightTrace.name : "Even split"}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">Lap-by-lap gap</p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Bars to the left mean {leftTrace.code} was quicker on that lap. Bars to the right mean {rightTrace.code} was quicker.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-300">
                  Scroll laps
                </span>
              </div>

              <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                {lapDeltas.map((lap) => {
                  const width = `${Math.max((Math.abs(lap.deltaMs) / maxDeltaMs) * 100, Math.abs(lap.deltaMs) > 0 ? 6 : 0)}%`;

                  return (
                    <div key={lap.lap} className="grid grid-cols-[46px_minmax(0,1fr)_82px] items-center gap-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Lap {lap.lap}</p>
                      <div className="relative h-6 overflow-hidden rounded-full bg-[#0A0A0A]">
                        <div className="absolute inset-y-0 left-1/2 w-px bg-white/10" />
                        {lap.deltaMs < 0 ? (
                          <div
                            className={cn("absolute inset-y-0 right-1/2 rounded-l-full", "bg-grid-primary/80")}
                            style={{ width }}
                          />
                        ) : lap.deltaMs > 0 ? (
                          <div
                            className="absolute inset-y-0 left-1/2 rounded-r-full bg-white/75"
                            style={{ width }}
                          />
                        ) : null}
                      </div>
                      <p className="text-right text-[11px] font-semibold text-gray-300">{formatGap(lap.deltaMs)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </details>
  );
}
