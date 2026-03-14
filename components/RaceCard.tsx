import Link from "next/link";

import LocalDateTimeText from "@/components/f1/LocalDateTimeText";
import type { Race } from "@/lib/f1";
import { formatRaceWeekendRange } from "@/lib/f1";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RaceCardProps = {
  race: Race;
};

export default function RaceCard({ race }: RaceCardProps) {
  return (
    <Link href={`/f1/race/${race.round}`} className="group block">
      <Card className="h-full border-border/80 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:border-primary/60">
        <CardHeader>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Race {race.round}</p>
          <CardTitle className="mt-1 text-xl">{race.raceName}</CardTitle>
          <CardDescription>{formatRaceWeekendRange(race.date)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-sm text-foreground">{race.circuitName}</p>
          <p className="text-sm text-muted-foreground">
            {race.locality}, {race.country}
          </p>
          <p className="pt-1 text-xs uppercase tracking-[0.08em] text-muted-foreground">
            Race Start:{" "}
            <LocalDateTimeText
              iso={`${race.date}T${race.time}`}
              options={{
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
                timeZoneName: "short"
              }}
            />
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
