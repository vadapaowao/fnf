import type { Metadata } from "next";

import FootballHub from "@/components/FootballHub";
import { footballFixtures, laLigaStandings } from "@/lib/football";

export const metadata: Metadata = {
  title: "The Pitch — Football Hub",
  description: "The Arena football hub with fixtures, standings, and matchday context.",
  openGraph: {
    title: "The Arena",
    description: "Live F1 standings, driver profiles, race intel, and football fixtures.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function FootballPage() {
  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Football</p>
        <h1 className="text-4xl font-semibold tracking-tight">Fixtures + Standings</h1>
        <p className="text-muted-foreground">Upcoming Champions League and La Liga fixtures, plus current La Liga table.</p>
      </section>

      <FootballHub fixtures={footballFixtures} standings={laLigaStandings} />
    </div>
  );
}
