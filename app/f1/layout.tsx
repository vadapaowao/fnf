import type { Metadata } from "next";

import F1Navigation from "@/components/f1/F1Navigation";

export const metadata: Metadata = {
    title: "The Grid — F1 Hub",
    description: "Live F1 standings, driver dossiers, race intel, and weekend analysis inside The Arena.",
    openGraph: {
        title: "The Arena",
        description: "Live F1 standings, driver profiles, race intel, and football fixtures.",
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
