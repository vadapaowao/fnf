"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

import { getRaceSessionDurationMs, type RaceSession } from "@/lib/f1";

type RaceWeekendTimelineProps = {
  sessions: RaceSession[];
};

function getSessionState(sessions: RaceSession[], index: number) {
  const now = Date.now();
  const thisStart = new Date(sessions[index].startsAt).getTime();
  const thisEnd = thisStart + getRaceSessionDurationMs(sessions[index].code);

  if (now >= thisStart && now < thisEnd) {
    return "active";
  }

  if (now < thisStart) {
    return "upcoming";
  }

  return "done";
}

export default function RaceWeekendTimeline({ sessions }: RaceWeekendTimelineProps) {
  const states = useMemo(() => sessions.map((_, index) => getSessionState(sessions, index)), [sessions]);

  const activeIndex = Math.max(states.findIndex((state) => state === "active"), 0);
  const progress = sessions.length > 1 ? (activeIndex / (sessions.length - 1)) * 100 : 100;

  return (
    <section className="border border-[#252525] bg-[#0A0A0A] px-4 py-5 md:px-6">
      <div className="mb-4 flex items-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E10600]">Weekend Sequence</p>
      </div>

      <div className="relative mb-4 h-[8px] border border-[#2B2B2B] bg-[#111111]">
        <motion.div
          className="absolute left-0 top-0 h-full bg-[#E10600]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ boxShadow: "0 0 14px rgba(225,6,0,0.36)" }}
        />
      </div>

      <div className="grid gap-3 md:grid-cols-5">
        {sessions.map((session, index) => {
          const state = states[index];
          const startsAt = new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit"
          }).format(new Date(session.startsAt));

          const classes =
            state === "active"
              ? "border-[#E10600] bg-[#200706] text-[#FFE9E8]"
              : state === "done"
                ? "border-[#333333] bg-[#101010] text-[#8B8B8B]"
                : "border-[#2D2D2D] bg-[#0F0F0F] text-[#D2D2D2]";

          return (
            <motion.article
              key={session.code}
              initial={{ x: -24 }}
              animate={{ x: 0 }}
              transition={{ duration: 0.22, ease: "easeOut", delay: index * 0.05 }}
              className={`border px-3 py-3 ${classes}`}
              style={state === "active" ? { boxShadow: "0 0 16px rgba(225,6,0,0.24)" } : undefined}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em]">{session.code}</p>
              <p className="mt-1 text-sm font-black uppercase tracking-[0.08em]">{session.label}</p>
              <p className="mt-2 text-[11px] uppercase tracking-[0.12em]">{startsAt}</p>
            </motion.article>
          );
        })}
      </div>
    </section>
  );
}
