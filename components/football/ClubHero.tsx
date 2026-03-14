"use client";

import Image from "next/image";

import { useFavoriteClub } from "@/hooks/useFavoriteClub";
import type { Club } from "@/lib/football-api";
import { cn } from "@/lib/utils";

type ClubHeroProps = {
  club: Club;
};

export default function ClubHero({ club }: ClubHeroProps) {
  const { favoriteClubId, setFavoriteClubId, hasLoaded } = useFavoriteClub();
  const isFavorite = hasLoaded && favoriteClubId === club.id;

  return (
    <section className="overflow-hidden rounded-[2rem] border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C]">
      <div className="pitch-texture relative p-8 md:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,230,118,0.12),transparent_35%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-[rgba(0,230,118,0.12)] bg-[#07110A] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
              {club.crest ? (
                <Image src={club.crest} alt={club.name} width={96} height={96} className="h-full w-full object-contain" />
              ) : (
                <span className="font-display text-3xl font-bold uppercase text-[#69F0AE]">{club.tla}</span>
              )}
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#69F0AE]">Club Dossier</p>
              <h1 className="mt-4 font-display text-4xl font-black italic tracking-tight text-white md:text-6xl">{club.name}</h1>
              <div className="mt-5 flex flex-wrap gap-2">
                {[club.founded ? `Founded ${club.founded}` : null, club.venue, club.area.name]
                  .filter((item): item is string => Boolean(item))
                  .map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-[rgba(0,230,118,0.12)] bg-[#07110A] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A9E8C]"
                    >
                      {item}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setFavoriteClubId(isFavorite ? null : club.id)}
            className={cn(
              "inline-flex h-12 items-center justify-center rounded-full border px-5 text-sm font-bold uppercase tracking-[0.18em] transition-colors",
              isFavorite
                ? "border-[#00E676]/40 bg-[#00E676]/15 text-white"
                : "border-[rgba(0,230,118,0.12)] bg-[#07110A] text-[#69F0AE] hover:border-[#00E676]/35 hover:text-white"
            )}
          >
            {isFavorite ? "My Club" : "Set As My Club"}
          </button>
        </div>
      </div>
    </section>
  );
}
