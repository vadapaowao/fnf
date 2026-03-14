import type { Metadata } from "next";

import F1Navigation from "@/components/f1/F1Navigation";

export const metadata: Metadata = {
    title: "The Grid — Formula 1",
    description: "Race weekends, standings, drivers, teams, and track notes for the 2026 season.",
    openGraph: {
        title: "The Grid — Formula 1",
        description: "Race weekends, standings, drivers, teams, and track notes for the 2026 season.",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
    },
};

export default function F1Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background-dark">
            <F1Navigation season="2026" />
            {children}
        </div>
    );
}
