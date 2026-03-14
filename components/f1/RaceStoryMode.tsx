"use client";

import { useMemo, useState } from "react";

import type { RaceRecap } from "@/lib/f1";
import type { ProductRaceState, TrackDnaProfile } from "@/lib/f1-product";
import { cn } from "@/lib/utils";

type RaceStoryModeProps = {
  recap?: RaceRecap | null;
  dna: TrackDnaProfile;
  state: ProductRaceState;
};

type StoryChapter = {
  id: string;
  title: string;
  eyebrow: string;
  detail: string;
  tag: string;
};

function getStateLabel(state: ProductRaceState) {
  if (state === "upcoming") {
    return "Preview";
  }

  if (state === "live") {
    return "Live";
  }

  return "Complete";
}

export default function RaceStoryMode({ recap, dna, state }: RaceStoryModeProps) {
  const chapters = useMemo<StoryChapter[]>(() => {
    const launch = recap?.keyMoments[0];
    const middle = recap?.keyMoments[1];
    const finish = recap?.keyMoments[recap.keyMoments.length - 1];

    return [
      {
        id: "launch",
        eyebrow: "Opening phase",
        title: launch?.title ?? dna.watchpoints[0]?.title ?? "Launch pressure",
        detail: launch?.detail ?? dna.watchpoints[0]?.detail ?? "Start procedure and first-stint track position shape the first part of the race.",
        tag: dna.watchpoints[0]?.phase ?? "Launch"
      },
      {
        id: "strategy",
        eyebrow: "Strategy swing",
        title: middle?.title ?? "Pit window and tyre shape",
        detail: recap?.decisivePitWindow ?? middle?.detail ?? dna.watchpoints[1]?.detail ?? "The strategic middle phase usually decides whether track position can be traded for fresher tyres.",
        tag: dna.watchpoints[1]?.phase ?? "Strategy"
      },
      {
        id: "finish",
        eyebrow: "Closing phase",
        title: finish?.title ?? "Chequered phase",
        detail: recap?.winnerStory ?? finish?.detail ?? dna.watchpoints[2]?.detail ?? "Late-race execution decides whether the pressure points convert into the final result.",
        tag: dna.watchpoints[2]?.phase ?? "Finish"
      }
    ];
  }, [dna.watchpoints, recap]);

  const [activeChapterId, setActiveChapterId] = useState(chapters[0]?.id ?? "launch");
  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId) ?? chapters[0];

  return (
    <details className="group/story rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 p-5 marker:content-none">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">Race Story</p>
            <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-300">
              {getStateLabel(state)}
            </span>
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Open the story</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            Three beats: the start, the swing, and the finish.
          </p>
        </div>

        <span className="material-icons text-grid-primary transition-transform duration-200 group-open/story:rotate-180">
          expand_more
        </span>
      </summary>

      <div className="border-t border-white/10 p-5">
        <div className="grid gap-2 md:grid-cols-3">
          {chapters.map((chapter, index) => {
            const isActive = chapter.id === activeChapterId;

            return (
              <button
                key={chapter.id}
                type="button"
                onClick={() => setActiveChapterId(chapter.id)}
                className={cn(
                  "rounded-lg border px-4 py-3 text-left transition-colors",
                  isActive ? "border-grid-primary/40 bg-grid-primary/10" : "border-white/10 bg-black/20 hover:border-white/20"
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                  {String(index + 1).padStart(2, "0")} • {chapter.eyebrow}
                </p>
                <p className="mt-2 text-sm font-bold text-white">{chapter.title}</p>
              </button>
            );
          })}
        </div>

        {activeChapter ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-grid-primary">{activeChapter.tag}</p>
                <h3 className="mt-2 text-xl font-black text-white">{activeChapter.title}</h3>
              </div>
              <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-300">
                {dna.archetype}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-gray-300">{activeChapter.detail}</p>

            {recap?.podium?.length ? (
              <div className="mt-4 grid gap-2 md:grid-cols-3">
                {recap.podium.map((entry) => (
                  <div key={`${entry.position}-${entry.driver}`} className="rounded-lg border border-white/10 bg-[#090909] px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">P{entry.position}</p>
                    <p className="mt-1 text-sm font-bold text-white">{entry.driver}</p>
                    <p className="mt-1 text-[11px] text-gray-500">{entry.constructor}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </details>
  );
}
