"use client";

import { useEffect, useState } from "react";

import LiveMatchCard from "@/components/football/LiveMatchCard";
import { useFavoriteClub } from "@/hooks/useFavoriteClub";
import type { Club, Match } from "@/lib/football-api";

type FavoriteClubPayload = {
  club: Club;
  upcomingMatches: Match[];
};

export default function FavoriteClubNextMatch() {
  const { favoriteClubId, hasLoaded } = useFavoriteClub();
  const [payload, setPayload] = useState<FavoriteClubPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!favoriteClubId) {
      setPayload(null);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/football/club/${favoriteClubId}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        return (await response.json()) as FavoriteClubPayload;
      })
      .then((nextPayload) => {
        setPayload(nextPayload);
      })
      .catch(() => {
        setPayload(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [favoriteClubId]);

  return (
    <section className="space-y-4">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#00E676]">Your Club&apos;s Next Match</p>
        <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">Pinned fixture</h2>
      </div>

      {!hasLoaded ? (
        <div className="rounded-2xl border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C] p-6 text-sm text-[#8A9E8C]">Loading favorite club...</div>
      ) : !favoriteClubId ? (
        <div className="rounded-2xl border border-dashed border-[rgba(0,230,118,0.12)] bg-[#0A1A0C] p-6 text-sm text-[#8A9E8C]">
          Set a club from any club page and its next fixture will stay pinned here.
        </div>
      ) : loading ? (
        <div className="rounded-2xl border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C] p-6 text-sm text-[#8A9E8C]">Loading fixture...</div>
      ) : payload?.upcomingMatches?.[0] ? (
        <div className="space-y-2">
          <p className="text-sm text-[#8A9E8C]">{payload.club.name}</p>
          <LiveMatchCard match={payload.upcomingMatches[0]} className="min-w-0" />
        </div>
      ) : (
        <div className="rounded-2xl border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C] p-6 text-sm text-[#8A9E8C]">Data unavailable.</div>
      )}
    </section>
  );
}
