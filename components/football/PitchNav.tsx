"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import FavoriteClubBadge from "@/components/football/FavoriteClubBadge";
import { FOOTBALL_COMPETITIONS } from "@/lib/football-api";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/football", label: "Home" },
  ...FOOTBALL_COMPETITIONS.map((competition) => ({
    href: `/football/${competition.slug}`,
    label: competition.shortLabel === "UCL" ? "UCL" : competition.name,
  })),
] as const;

export default function PitchNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-[rgba(0,230,118,0.12)] bg-[rgba(5,14,7,0.92)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-display uppercase tracking-[0.18em] text-white">
            <span className="text-[#00E676]">The</span>
            <span className="italic">Pitch</span>
          </Link>
          <nav className="hidden items-center gap-5 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/football" ? pathname === "/football" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[11px] font-bold uppercase tracking-[0.16em] transition-colors",
                    active ? "text-white" : "text-[#8A9E8C] hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <FavoriteClubBadge className="hidden sm:inline-flex" compact />
          <button
            type="button"
            aria-label={menuOpen ? "Close football navigation" : "Open football navigation"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(0,230,118,0.12)] bg-[#07110A] text-white transition-colors hover:border-[#00E676]/40 hover:text-[#69F0AE] lg:hidden"
          >
            <span className="material-icons text-[20px]">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="border-t border-[rgba(0,230,118,0.12)] bg-[rgba(7,17,10,0.98)] px-4 py-4 lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            <FavoriteClubBadge className="mb-2 w-full justify-start rounded-2xl" />
            {NAV_ITEMS.map((item) => {
              const active = item.href === "/football" ? pathname === "/football" : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "rounded-2xl border px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] transition-colors",
                    active
                      ? "border-[#00E676]/30 bg-[#00E676]/10 text-white"
                      : "border-[rgba(0,230,118,0.12)] bg-[#07110A] text-[#8A9E8C] hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
