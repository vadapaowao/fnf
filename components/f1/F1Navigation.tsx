"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type F1NavigationProps = {
  season?: string;
};

const desktopNavItems = [
  { href: "/f1", label: "Race" },
  { href: "/f1/standings", label: "Standings" },
  { href: "/f1/calendar", label: "Calendar" },
  { href: "/f1/drivers", label: "Drivers" },
  { href: "/f1/teams", label: "Teams" }
] as const;

const mobilePrimaryItems = [
  { href: "/f1", label: "Race", icon: "sports_motorsports" },
  { href: "/f1/calendar", label: "Calendar", icon: "calendar_month" },
  { href: "/f1/standings", label: "Standings", icon: "leaderboard" }
] as const;

const mobileMoreItems = [
  { href: "/f1/drivers", label: "Drivers", detail: "Every driver and season profile", icon: "person" },
  { href: "/f1/teams", label: "Teams", detail: "Constructors, lineups, and form", icon: "groups" },
  { href: "/f1/leclerc", label: "Charles", detail: "You know why this is here", icon: "local_fire_department" },
  { href: "/", label: "Landing", detail: "Back to The Grid home", icon: "home" }
] as const;

export default function F1Navigation({ season = "2026" }: F1NavigationProps) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/f1") {
      return pathname === "/f1" || pathname.startsWith("/f1/race/");
    }

    return pathname.startsWith(href);
  };

  const moreIsActive = mobileMoreItems.slice(0, 3).some((item) => pathname.startsWith(item.href));

  return (
    <>
      <div className="relative z-40 shrink-0 border-b border-white/10 bg-background-dark/95 backdrop-blur-xl">
        <header className="flex h-14 items-center justify-between px-3 sm:px-4 md:h-16 md:px-6">
          <div className="flex min-w-0 items-center gap-3 md:gap-4">
            <Link
              href="/"
              aria-label="The Grid home"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/30 text-lg text-white"
            >
              🏎️
            </Link>
            <Link
              href="/f1"
              className="inline-flex min-h-11 min-w-0 items-center border-l border-white/20 pl-3 font-display text-base font-bold uppercase tracking-[0.18em] text-white sm:text-lg sm:tracking-[0.22em] md:pl-4 md:text-xl"
            >
              The Grid
            </Link>
          </div>

          <nav className="hidden items-center gap-8 text-sm font-medium uppercase tracking-[0.16em] text-gray-400 md:flex">
            {desktopNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-11 items-center ${
                  isActive(item.href) ? "text-white" : "transition-colors hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <span className="shrink-0 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 md:border-0 md:bg-transparent md:px-0 md:py-0 md:tracking-[0.18em]">
            {season}
          </span>
        </header>
      </div>

      {moreOpen ? (
        <div className="fixed inset-0 z-[70] md:hidden">
          <button
            type="button"
            aria-label="Close more navigation"
            className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm"
            onClick={() => setMoreOpen(false)}
          />
          <nav
            aria-label="More navigation"
            className="custom-scrollbar absolute inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] max-h-[calc(100dvh-5.25rem-env(safe-area-inset-bottom))] overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-[#0B0B0B] shadow-[0_24px_80px_rgba(0,0,0,0.75)]"
          >
            <div className="sticky top-0 z-10 flex min-h-12 items-center justify-between border-b border-white/10 bg-[#0B0B0B] px-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gray-400">More from The Grid</p>
              <button
                type="button"
                aria-label="Close more navigation"
                onClick={() => setMoreOpen(false)}
                className="inline-flex h-11 w-11 items-center justify-center text-gray-300"
              >
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="grid gap-2 p-3">
              {mobileMoreItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex min-h-14 items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                    isActive(item.href)
                      ? "border-grid-primary/40 bg-grid-primary/10 text-white"
                      : "border-white/10 bg-black/20 text-gray-300"
                  }`}
                >
                  <span className="material-icons text-xl text-grid-primary">{item.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-white">{item.label}</span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500">{item.detail}</span>
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}

      <nav
        aria-label="Primary mobile navigation"
        className="fixed inset-x-0 bottom-0 z-[80] border-t border-white/10 bg-[#080808]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <div className="grid h-16 grid-cols-4">
          {mobilePrimaryItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
                  active ? "text-white" : "text-gray-500"
                }`}
              >
                <span className={`material-icons text-xl ${active ? "text-grid-primary" : ""}`}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            aria-expanded={moreOpen}
            onClick={() => setMoreOpen((current) => !current)}
            className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
              moreOpen || moreIsActive ? "text-white" : "text-gray-500"
            }`}
          >
            <span className={`material-icons text-xl ${moreOpen || moreIsActive ? "text-grid-primary" : ""}`}>more_horiz</span>
            <span>More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
