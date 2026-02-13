"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type CountdownTimerProps = {
  targetIso: string;
};

type CountdownState = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
  totalMs: number;
};

function getCountdown(targetIso: string): CountdownState {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const delta = target - now;

  if (Number.isNaN(target) || delta <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true, totalMs: 0 };
  }

  const days = Math.floor(delta / (1000 * 60 * 60 * 24));
  const hours = Math.floor((delta / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((delta / (1000 * 60)) % 60);
  const seconds = Math.floor((delta / 1000) % 60);

  return { days, hours, minutes, seconds, done: false, totalMs: delta };
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

export default function CountdownTimer({ targetIso }: CountdownTimerProps) {
  const [state, setState] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    done: false,
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
    return <p className="text-sm uppercase tracking-[0.12em] text-[#8E8E8E]">Loading countdown...</p>;
  }

  if (state.done) {
    return (
      <div className="border border-[#2B2B2B] bg-[#070707] px-4 py-4">
        <p className="text-base font-black uppercase tracking-[0.12em] text-[#E10600]">Race weekend is live</p>
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
