"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { buttonVariants } from "@/components/ui/button";

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card/80 p-8 shadow-premium md:p-12">
      <div className="absolute inset-0 bg-premium-grid bg-grid opacity-60" aria-hidden="true" />
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-sm font-semibold uppercase tracking-[0.2em] text-primary"
        >
          Sports Core
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
          className="text-4xl font-semibold tracking-tight text-foreground md:text-6xl"
        >
          Live Sports. Zero Noise.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.12 }}
          className="max-w-2xl text-base text-muted-foreground md:text-lg"
        >
          Race weekends, football fixtures, and standings in one fast, focused dashboard built for core fans.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.18 }}
          className="flex flex-wrap items-center gap-3"
        >
          <Link href="/f1" className={buttonVariants({ size: "lg" })}>
            Explore F1 Calendar
          </Link>
          <Link href="/football" className={buttonVariants({ variant: "secondary", size: "lg" })}>
            Open Football Hub
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
