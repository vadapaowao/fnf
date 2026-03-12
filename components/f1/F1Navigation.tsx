"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface F1NavigationProps {
    season?: string;
}

export default function F1Navigation({ season = "2026" }: F1NavigationProps) {
    const pathname = usePathname();

    const isActive = (path: string) => {
        if (path === "/f1") {
            return pathname === "/f1";
        }
        return pathname.startsWith(path);
    };

    return (
        <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-background-dark z-20 shrink-0">
            <div className="flex items-center gap-4">
                <Link
                    href="/"
                    className="flex items-center gap-0.5 logo-text text-xl tracking-tighter cursor-pointer group"
                >
                    <span className="text-primary font-bold group-hover:text-white transition-colors">
                        A
                    </span>
                    <span className="text-white group-hover:text-primary transition-colors">r</span>
                    <span className="text-black bg-white px-1 rounded-sm ml-0.5 font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                        A
                    </span>
                </Link>
                <h1 className="text-xl font-bold tracking-widest uppercase neon-text border-l border-white/20 pl-4 ml-2 font-display">
                    The Grid
                </h1>
            </div>
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
                <Link
                    href="/f1"
                    className={`hover:text-grid-primary transition-colors font-display ${isActive("/f1") && !pathname.includes("/calendar") && !pathname.includes("/drivers") && !pathname.includes("/teams")
                            ? "text-white border-b-2 border-grid-primary pb-5 mt-5"
                            : ""
                        }`}
                >
                    RACE
                </Link>
                <Link
                    href="/f1/calendar"
                    className={`hover:text-grid-primary transition-colors font-display ${isActive("/f1/calendar") ? "text-white border-b-2 border-grid-primary pb-5 mt-5" : ""
                        }`}
                >
                    CALENDAR
                </Link>
                <Link
                    href="/f1/drivers"
                    className={`hover:text-grid-primary transition-colors font-display ${isActive("/f1/drivers") ? "text-white border-b-2 border-grid-primary pb-5 mt-5" : ""
                        }`}
                >
                    DRIVERS
                </Link>
                <Link
                    href="/f1/teams"
                    className={`hover:text-grid-primary transition-colors font-display ${isActive("/f1/teams") ? "text-white border-b-2 border-grid-primary pb-5 mt-5" : ""
                        }`}
                >
                    TEAMS
                </Link>
            </nav>
            <div className="flex items-center gap-4">
                <span className="text-xs text-gray-500 uppercase font-display">Season {season}</span>
            </div>
        </header>
    );
}
