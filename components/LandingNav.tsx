"use client";

import Link from "next/link";

export default function LandingNav() {
    return (
        <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
            <div className="glass-panel rounded-full px-6 py-3 flex items-center justify-between gap-8 max-w-2xl w-full shadow-2xl shadow-primary/20 border-t border-white/10">
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
                    <a href="#" className="hover:text-accent-gold transition-colors">
                        Drops
                    </a>
                </div>
                <button className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors uppercase tracking-wider font-display">
                    Sign In
                </button>
            </div>
        </nav>
    );
}
