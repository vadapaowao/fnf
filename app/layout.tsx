import type { Metadata } from "next";
import { Chakra_Petch, Space_Grotesk } from "next/font/google";

import "@/styles/globals.css";

const chakraPetch = Chakra_Petch({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-chakra-petch",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://grid.local"),
  title: "The Grid — F1 Dashboard 2026",
  description:
    "The ultimate Formula 1 fan dashboard. Live race intel, driver dossiers, circuit data, and constructor standings for the 2026 season.",
  openGraph: {
    title: "The Grid — F1 Dashboard 2026",
    description: "Live F1 race intel, driver stats, and circuit data for the 2026 season.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Grid — F1 Dashboard 2026",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${chakraPetch.variable} ${spaceGrotesk.variable} min-h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-white font-body antialiased selection:bg-primary selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
