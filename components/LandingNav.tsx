"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingNav() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <div className="glass-panel max-w-2xl w-full shadow-2xl shadow-primary/20 border-t border-white/10">
                <div className="rounded-full px-5 py-3 flex items-center justify-between gap-4 md:px-6">
                    <div className="flex items-center gap-0.5 logo-text text-xl tracking-tighter">
                        <span className="text-primary font-bold">A</span>
                        <span className="text-white">r</span>
                        <span className="text-black bg-white px-1 rounded-sm ml-0.5 font-bold">A</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400 font-display uppercase tracking-widest">
                        <Link href="/f1" className="hover:text-primary transition-colors cursor-pointer">
                            The Grid
                        </Link>
                        <Link href="/football" className="hover:text-accent-green transition-colors">
                            The Pitch
                        </Link>
                        <Link href="/drops" className="hover:text-accent-gold transition-colors">
                            Drops
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/drops"
                            className="hidden md:inline-flex bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors uppercase tracking-wider font-display"
                        >
                            Get Early Access
                        </Link>
                        <button
                            type="button"
                            aria-expanded={menuOpen}
                            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                            onClick={() => setMenuOpen((current) => !current)}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white transition-colors hover:border-primary/40 hover:text-primary md:hidden"
                        >
                            <span className="material-icons text-[20px]">{menuOpen ? "close" : "menu"}</span>
                        </button>
                    </div>
                </div>

                {menuOpen ? (
                    <div className="border-t border-white/10 bg-[rgba(7,7,7,0.96)] px-4 py-4 md:hidden">
                        <div className="flex flex-col gap-2">
                            <Link
                                href="/f1"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-200 transition-colors hover:border-primary/40 hover:text-white"
                            >
                                The Grid
                            </Link>
                            <Link
                                href="/football"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-200 transition-colors hover:border-accent-green/40 hover:text-white"
                            >
                                The Pitch
                            </Link>
                            <Link
                                href="/drops"
                                onClick={() => setMenuOpen(false)}
                                className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition-colors hover:border-primary hover:bg-primary/15"
                            >
                                Get Early Access
                            </Link>
                        </div>
                    </div>
                ) : null}
            </div>
        </nav>
    );
}
