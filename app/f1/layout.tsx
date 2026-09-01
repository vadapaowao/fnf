import type { Metadata } from "next";

import F1Navigation from "@/components/f1/F1Navigation";

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
        title: "The Grid — Formula 1",
    },
};

export default function F1Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-dvh min-h-dvh flex-col overflow-hidden bg-background-dark">
            <F1Navigation season="2026" />
            <div className="flex min-h-0 flex-1 flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
                {children}
            </div>
        </div>
    );
}
