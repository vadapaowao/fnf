"use client";

import Link from "next/link";
import { useState } from "react";

export default function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 top-0 z-50">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/90 via-black/55 to-transparent" />
      <div className="relative flex justify-center px-4 pb-3 pt-4">
        <div className="w-full max-w-3xl rounded-full border border-white/10 bg-[rgba(8,8,8,0.8)] shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4 rounded-full px-5 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/30 text-lg text-white">
              🏎️
            </Link>
            <Link href="/f1" className="font-display text-sm font-bold uppercase tracking-[0.28em] text-white md:text-base">
              The Grid
            </Link>
          </div>

          <div className="hidden items-center gap-8 font-display text-sm font-medium uppercase tracking-widest text-gray-400 md:flex">
            <Link href="/f1" className="transition-colors hover:text-primary">
              The Grid
            </Link>
            <Link href="/f1/standings" className="transition-colors hover:text-white">
              Standings
            </Link>
          </div>

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
                  href="/f1/standings"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-gray-200 transition-colors hover:border-white/20 hover:text-white"
                >
                  Standings
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
