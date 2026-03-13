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
    return "Your follow list becomes the quick route back in before the weekend starts.";
  }

  if (state === "live") {
    return "Your follows stay pinned while the live weekend is moving.";
  }

  return "Your follows become the fastest route into the post-race recap loop.";
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
    <article className={`rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-5 ${className ?? ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">My Pit Wall</p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">Follow mode</h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">{getStateCopy(state)}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-gray-300">
          {count} saved
        </span>
      </div>

      {!hasLoaded ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-black/20 px-4 py-6 text-center">
          <p className="text-sm text-gray-400">Loading follow list...</p>
        </div>
      ) : recentItems.length === 0 ? (
        <div className="mt-5 rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-6">
          <p className="text-sm text-gray-300">No follows yet.</p>
          <p className="mt-2 text-[11px] leading-relaxed text-gray-500">
            Follow a race, driver, or team. This card then becomes a compact return surface for the product.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-2">
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
    </article>
  );
}

