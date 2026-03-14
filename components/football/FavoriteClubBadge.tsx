"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import { useFavoriteClub } from "@/hooks/useFavoriteClub";
import type { Club } from "@/lib/football-api";
import { cn } from "@/lib/utils";

type FavoriteClubBadgeProps = {
  className?: string;
  compact?: boolean;
};

type FavoriteClubResponse = {
  club: Club;
};

export default function FavoriteClubBadge({ className, compact = false }: FavoriteClubBadgeProps) {
  const { favoriteClubId, hasLoaded } = useFavoriteClub();
  const [club, setClub] = useState<Club | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!favoriteClubId) {
      setClub(null);
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

        return (await response.json()) as FavoriteClubResponse;
      })
      .then((payload) => {
        if (payload?.club) {
          setClub(payload.club);
        } else {
          setClub(null);
        }
      })
      .catch(() => {
        setClub(null);
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [favoriteClubId]);

  if (!hasLoaded) {
    return (
      <div className={cn("rounded-full border border-[rgba(0,230,118,0.12)] bg-[#07110A] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A9E8C]", className)}>
        Loading club...
      </div>
    );
  }

  if (!favoriteClubId) {
    return (
      <div className={cn("rounded-full border border-[rgba(0,230,118,0.12)] bg-[#07110A] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A9E8C]", className)}>
        My Club: Unset
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[rgba(0,230,118,0.18)] bg-[#07110A] px-3 py-2 text-white",
        className
      )}
    >
      {club?.crest ? (
        <Image
          src={club.crest}
          alt={club.name}
          width={compact ? 20 : 24}
          height={compact ? 20 : 24}
          className="rounded-full bg-white/5 object-contain"
        />
      ) : (
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(0,230,118,0.18)] bg-[#0A1A0C] text-[10px] font-bold text-[#69F0AE]">
          FC
        </span>
      )}
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#69F0AE]">My Club</p>
        <p className="truncate text-xs font-semibold text-white">{club?.shortName ?? (loading ? "Loading..." : `Club ${favoriteClubId}`)}</p>
      </div>
    </div>
  );
}
