"use client";

import { useMemo, useState } from "react";

import MatchCard from "@/components/MatchCard";
import StandingsTable from "@/components/StandingsTable";
import type { Fixture, Standing } from "@/lib/football";

type FootballHubProps = {
  fixtures: Fixture[];
  standings: Standing[];
};

export default function FootballHub({ fixtures, standings }: FootballHubProps) {
  const [favoriteClub, setFavoriteClub] = useState<string>("Real Madrid");

  const orderedFixtures = useMemo(
    () =>
      [...fixtures].sort((a, b) => {
        const aFav = a.homeTeam === favoriteClub || a.awayTeam === favoriteClub;
        const bFav = b.homeTeam === favoriteClub || b.awayTeam === favoriteClub;

        if (aFav === bFav) {
          return new Date(a.kickoffUtc).getTime() - new Date(b.kickoffUtc).getTime();
        }

        return aFav ? -1 : 1;
      }),
    [fixtures, favoriteClub]
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Upcoming Fixtures</h2>
          <p className="text-sm text-muted-foreground">
            Favorite club: <span className="font-medium text-foreground">{favoriteClub}</span>
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {orderedFixtures.map((fixture) => (
            <MatchCard
              key={fixture.id}
              fixture={fixture}
              isFavorite={fixture.homeTeam === favoriteClub || fixture.awayTeam === favoriteClub}
              onToggleFavorite={setFavoriteClub}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Table</h2>
        <StandingsTable standings={standings} />
      </section>
    </div>
  );
}
