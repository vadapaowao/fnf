"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed left-0 right-0 top-6 z-50 flex justify-center px-4">
      <div className="glass-panel w-full max-w-2xl border-t border-white/10 shadow-2xl shadow-primary/20">
        <div className="flex items-center justify-between gap-4 rounded-full px-5 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-sm font-black uppercase tracking-[0.16em] text-white">
              G
            </Link>
            <Link href="/f1" className="font-display text-sm font-bold uppercase tracking-[0.28em] text-white md:text-base">
              The Grid
            </Link>
          </div>

          <div className="hidden items-center gap-8 font-display text-sm font-medium uppercase tracking-widest text-gray-400 md:flex">
            <Link href="/f1" className="transition-colors hover:text-primary">
              The Grid
            </Link>
            <Link href="/drops" className="transition-colors hover:text-white">
              Drops
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/drops"
              className="hidden rounded-full bg-white px-4 py-2 font-display text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-primary hover:text-white md:inline-flex"
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
                href="/drops"
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-200 transition-colors hover:border-white/20 hover:text-white"
              >
                Drops
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
