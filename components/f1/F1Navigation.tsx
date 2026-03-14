"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type F1NavigationProps = {
  season?: string;
};

const navItems = [
  { href: "/f1", label: "Race" },
  { href: "/f1/standings", label: "Standings" },
  { href: "/f1/calendar", label: "Calendar" },
  { href: "/f1/drivers", label: "Drivers" },
  { href: "/f1/teams", label: "Teams" }
] as const;

export default function F1Navigation({ season = "2026" }: F1NavigationProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/f1") {
      return pathname === "/f1" || pathname.startsWith("/f1/race/");
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="relative z-20 shrink-0 border-b border-white/10 bg-background-dark">
      <header className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-lg text-white">
            🏎️
          </Link>
          <Link href="/f1" className="border-l border-white/20 pl-4 font-display text-lg font-bold uppercase tracking-[0.22em] text-white md:text-xl">
            The Grid
          </Link>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium uppercase tracking-[0.16em] text-gray-400 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "text-white" : "transition-colors hover:text-white"}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs uppercase tracking-[0.18em] text-gray-500 sm:inline">Season {season}</span>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close F1 navigation" : "Open F1 navigation"}
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-black/20 text-gray-300 transition-colors hover:border-grid-primary/40 hover:text-white md:hidden"
          >
            <span className="material-icons text-[20px]">{menuOpen ? "close" : "menu"}</span>
          </button>
        </div>
      </header>

      {menuOpen ? (
        <nav className="border-t border-white/10 bg-[#070707] px-4 py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`rounded-lg border px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] transition-colors ${
                  isActive(item.href)
                    ? "border-grid-primary/40 bg-grid-primary/10 text-white"
                    : "border-white/10 bg-black/20 text-gray-300 hover:border-grid-primary/30 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </div>
  );
}
