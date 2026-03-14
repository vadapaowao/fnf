"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface F1NavigationProps {
    season?: string;
}

export default function F1Navigation({ season = "2026" }: F1NavigationProps) {
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const navItems = [
        { href: "/f1", label: "RACE" },
        { href: "/f1/standings", label: "STANDINGS" },
        { href: "/f1/calendar", label: "CALENDAR" },
        { href: "/f1/drivers", label: "DRIVERS" },
        { href: "/f1/teams", label: "TEAMS" },
    ] as const;

    const isActive = (path: string) => {
        if (path === "/f1") {
            return pathname === "/f1";
        }
        return pathname.startsWith(path);
    };

    return (
        <div className="relative z-20 shrink-0 border-b border-white/10 bg-background-dark">
            <header className="flex h-16 items-center justify-between px-4 md:px-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/25 text-lg text-white transition-colors hover:border-grid-primary/40"
                    >
                        🏎️
                    </Link>
                    <h1 className="text-lg font-bold tracking-[0.22em] uppercase neon-text border-l border-white/20 pl-4 ml-2 font-display md:text-xl">
                        The Grid
                    </h1>
                </div>

                <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                    {navItems.map((item) => {
                        const active =
                            item.href === "/f1"
                                ? isActive("/f1") && !pathname.includes("/standings") && !pathname.includes("/calendar") && !pathname.includes("/drivers") && !pathname.includes("/teams") && !pathname.includes("/leclerc")
                                : isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`hover:text-grid-primary transition-colors font-display ${active ? "text-white border-b-2 border-grid-primary pb-5 mt-5" : ""}`}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="flex items-center gap-3">
                    <span className="hidden text-xs text-gray-500 uppercase font-display sm:inline">Season {season}</span>
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
                        {navItems.map((item) => {
                            const active =
                                item.href === "/f1"
                                    ? isActive("/f1") && !pathname.includes("/standings") && !pathname.includes("/calendar") && !pathname.includes("/drivers") && !pathname.includes("/teams") && !pathname.includes("/leclerc")
                                    : isActive(item.href);

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMenuOpen(false)}
                                    className={`rounded-lg border px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] transition-colors ${active
                                        ? "border-grid-primary/40 bg-grid-primary/10 text-white"
                                        : "border-white/10 bg-black/20 text-gray-300 hover:border-grid-primary/30 hover:text-white"
                                        }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            ) : null}
        </div>
    );
}
