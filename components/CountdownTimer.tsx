"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type CountdownTimerProps = {
  targetIso: string;
  variant?: "full" | "compact";
};

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isValid: boolean;
  totalMs: number;
};

function getCountdown(targetIso: string): CountdownState {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const rawDelta = target - now;

  if (Number.isNaN(target)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isValid: false, totalMs: 0 };
  }

  const delta = Math.max(rawDelta, 0);
  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  const seconds = Math.floor((delta / 1000) % 60);

  return { days, hours, minutes, seconds, isValid: true, totalMs: rawDelta };
}

type FlipUnitProps = {
  label: string;
  value: number;
  minDigits?: number;
};

function FlipUnit({ label, value, minDigits = 2 }: FlipUnitProps) {
  const display = String(value).padStart(minDigits, "0");

  return (
    <div className="border border-[#2A2A2A] bg-[#070707] px-3 py-3 md:px-4">
      <div className="relative h-12 overflow-hidden border border-[#1D1D1D] bg-[#050505] px-3 py-2 md:h-[58px]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={display}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-3 top-2 font-mono text-3xl font-black leading-none tracking-[0.16em] text-[#F4F4F4] md:text-4xl"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8C8C8C]">{label}</p>
    </div>
  );
}

function CompactFlipUnit({ label, value, minDigits = 2 }: FlipUnitProps) {
  const display = String(value).padStart(minDigits, "0");

  return (
    <div className="border border-[#262626] bg-[#070707] px-1.5 py-1.5">
      <div className="relative h-8 overflow-hidden border border-[#1A1A1A] bg-[#040404] px-1.5 py-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={display}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute left-1.5 top-1 font-mono text-lg font-black leading-none tracking-[0.08em] text-[#F4F4F4]"
          >
            {display}
          </motion.span>
        </AnimatePresence>
      </div>
      <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8C8C8C]">{label}</p>
    </div>
  );
}

export default function CountdownTimer({ targetIso, variant = "full" }: CountdownTimerProps) {
  const [state, setState] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isValid: true,
    totalMs: 0
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    setState(getCountdown(targetIso));

    const interval = setInterval(() => {
      setState(getCountdown(targetIso));
    }, 1000);

    return () => clearInterval(interval);
  }, [targetIso]);

  if (!hydrated) {
    return <p className="text-xs uppercase tracking-[0.12em] text-[#8E8E8E]">Loading countdown...</p>;
  }

  if (!state.isValid) {
    return <p className="text-xs uppercase tracking-[0.12em] text-[#8E8E8E]">Countdown unavailable</p>;
  }

  const raceStartMs = new Date(targetIso).getTime();
  const weekendStartMs = raceStartMs - 52 * 60 * 60 * 1000;
  const weekendEndMs = raceStartMs + 4 * 60 * 60 * 1000;
  const nowMs = Date.now();
  const isWeekendLive = nowMs >= weekendStartMs && nowMs < weekendEndMs;
  const isWeekendDone = nowMs >= weekendEndMs;

  if (isWeekendDone) {
    return (
      <div className="border border-[#2B2B2B] bg-[#070707] px-3 py-2">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#E10600]">Race Week Done! Onto the next🏎️</p>
      </div>
    );
  }

  if (isWeekendLive) {
    return (
      <div className="border border-[#2B2B2B] bg-[#070707] px-3 py-2">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-[#E10600]">Race Weekend is Live</p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="w-full max-w-[420px] border border-[#2D2D2D] bg-[#080808] p-2.5">
        <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#E10600]">Race Countdown</p>
        <div className="grid grid-cols-4 gap-1.5">
          <CompactFlipUnit label="Days" value={state.days} minDigits={2} />
          <CompactFlipUnit label="Hours" value={state.hours} />
          <CompactFlipUnit label="Mins" value={state.minutes} />
          <CompactFlipUnit label="Secs" value={state.seconds} />
        </div>
      </div>
    );
  }

  const lessThan24Hours = state.totalMs < 24 * 60 * 60 * 1000;

  return (
    <div
      className="border border-[#2D2D2D] bg-[#080808] px-4 py-4"
      style={lessThan24Hours ? { boxShadow: "0 0 18px rgba(225,6,0,0.24)" } : undefined}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E10600]">Race Countdown</p>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <FlipUnit label="Days" value={state.days} />
        <FlipUnit label="Hours" value={state.hours} />
        <FlipUnit label="Minutes" value={state.minutes} />
        <FlipUnit label="Seconds" value={state.seconds} />
      </div>
    </div>
  );
}
