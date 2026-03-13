"use client";

import Link from "next/link";
import { useState } from "react";

export default function DropsPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="min-h-screen bg-background-dark px-4 py-24 text-white">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_right,rgba(225,6,0,0.16),transparent_35%),linear-gradient(145deg,#111111_0%,#080808_65%)] p-8 shadow-[0_25px_80px_rgba(225,6,0,0.15)] md:p-12">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Arena Access</p>
        <h1 className="mt-4 font-display text-5xl font-black tracking-tight text-white md:text-7xl">
          DROPS
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-400 md:text-lg">
          Exclusive Arena merch. Coming soon.
        </p>

        <div className="mt-10 rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Notify Me</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email"
              className="h-12 flex-1 rounded-2xl border border-white/10 bg-[#090909] px-4 text-sm text-white outline-none transition-colors placeholder:text-gray-500 focus:border-primary/40"
            />
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-bold uppercase tracking-[0.18em] text-black transition-colors hover:bg-primary hover:text-white"
            >
              Notify Me
            </button>
          </div>

          {submitted ? (
            <p className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-white">
              You&apos;re on the list. We&apos;ll notify you when the first drop goes live.
            </p>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              No backend yet. This is the launch waitlist UI.
            </p>
          )}
        </div>

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-gray-400 transition-colors hover:text-white"
        >
          <span aria-hidden="true">←</span>
          Back to Arena
        </Link>
      </div>
    </main>
  );
}
