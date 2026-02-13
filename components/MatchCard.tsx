"use client";

import { Star } from "lucide-react";
import { useEffect, useState } from "react";

import type { Fixture } from "@/lib/football";
import { formatFixtureDate } from "@/lib/football";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MatchCardProps = {
  fixture: Fixture;
  isFavorite?: boolean;
  onToggleFavorite?: (team: string) => void;
};

export default function MatchCard({ fixture, isFavorite = false, onToggleFavorite }: MatchCardProps) {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return (
    <Card className={cn("border-border/80", isFavorite ? "border-primary/70" : "")}>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {fixture.competition}
          </span>
          {onToggleFavorite ? (
            <Button
              type="button"
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleFavorite(fixture.homeTeam)}
              className="gap-1"
            >
              <Star className={cn("h-4 w-4", isFavorite ? "fill-current" : "")} />
              {isFavorite ? "Favorite" : "Set Favorite"}
            </Button>
          ) : null}
        </div>
        <CardTitle className="text-lg">
          {fixture.homeTeam} <span className="text-muted-foreground">vs</span> {fixture.awayTeam}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p suppressHydrationWarning>{hydrated ? formatFixtureDate(fixture.kickoffUtc) : "Loading local kickoff..."}</p>
        <p>{fixture.venue}</p>
      </CardContent>
    </Card>
  );
}
