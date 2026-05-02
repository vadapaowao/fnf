import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Grid — Formula 1",
  description: "Formula 1 race intel, driver profiles, team pages, calendar, and standings.",
  openGraph: {
    title: "The Grid — Formula 1",
    description: "Formula 1 race intel, driver profiles, team pages, calendar, and standings.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function FootballLayout({ children }: { children: React.ReactNode }) {
  return children;
}
