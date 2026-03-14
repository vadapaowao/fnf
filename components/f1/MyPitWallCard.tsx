"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useFollowedEntities } from "@/components/f1/follow-store";
import { getProductRaceState, type ProductRaceState } from "@/lib/f1-product";
import type { Race } from "@/lib/f1";

type MyPitWallCardProps = {
  race?: Race;
  className?: string;
};

function getStateCopy(state: ProductRaceState) {
  if (state === "upcoming") {
    return "The races and drivers you save stay parked here.";
  }

  if (state === "live") {
    return "Your saved picks stay here while the weekend is on.";
  }

  return "Saved picks are still here when you are checking what changed.";
}

function getEntityIcon(type: "race" | "driver" | "team") {
  if (type === "race") {
    return "flag";
  }

  if (type === "driver") {
    return "sports_motorsports";
  }

  return "garage";
}

export default function MyPitWallCard({ race, className }: MyPitWallCardProps) {
  const { items, count, hasLoaded } = useFollowedEntities();
  const state = useMemo(() => (race ? getProductRaceState(race) : "upcoming"), [race]);
  const recentItems = items.slice(0, 4);

  return (
    <details className={`group rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark ${className ?? ""}`}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-5 py-4 marker:content-none">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">Following</p>
          <h2 className="mt-2 font-display text-xl font-bold text-white">Saved list</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">{getStateCopy(state)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-gray-300">
            {count} saved
          </span>
          <span className="material-icons text-grid-primary transition-transform duration-200 group-open:rotate-180">
            expand_more
          </span>
        </div>
      </summary>

      <div className="border-t border-white/10 px-5 pb-5 pt-4">
        {!hasLoaded ? (
          <div className="rounded-lg border border-white/10 bg-black/20 px-4 py-6 text-center">
            <p className="text-sm text-gray-400">Loading saved list...</p>
          </div>
        ) : recentItems.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-6">
            <p className="text-sm text-gray-300">Nothing saved yet.</p>
            <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
              Save a race, driver, or team and it lands here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-4 py-3 transition-colors hover:border-white/20 hover:bg-black/30"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="material-icons text-sm" style={{ color: item.accentColor ?? "#E10600" }}>
                      {getEntityIcon(item.type)}
                    </span>
                    <p className="truncate text-sm font-bold text-white">{item.label}</p>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-gray-500">{item.subtitle}</p>
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">Open</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </details>
  );
}
