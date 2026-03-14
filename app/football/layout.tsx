import type { Metadata } from "next";

import PitchNav from "@/components/football/PitchNav";

export const metadata: Metadata = {
  title: "The Pitch — Football Hub",
  description: "Live scores, standings, club dossiers, and match intel inside The Arena.",
  openGraph: {
    title: "The Arena",
    description: "Live F1 standings, driver profiles, race intel, and football fixtures.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function FootballLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050E07] text-white">
      <PitchNav />
      <main className="pitch-texture min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
