import "server-only";

import { readFile } from "fs/promises";
import path from "path";

import type { RaceRecap, RaceReplayData } from "@/lib/f1";

export type FastF1RaceBundle = {
  source: "FastF1";
  season: string;
  round: string;
  generatedAt: string;
  recap: RaceRecap;
  replay: RaceReplayData;
};

const FASTF1_BUNDLE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const fastF1BundleCache = new Map<string, { createdAt: number; promise: Promise<FastF1RaceBundle | null> }>();

function getFastF1BundlePath(season: string, round: string) {
  return path.join(process.cwd(), "public", "data", "fastf1", season, `round-${round}.json`);
}

export async function getFastF1RaceBundle(season: string, round: string): Promise<FastF1RaceBundle | null> {
  const cacheKey = `${season}:${round}`;
  const cached = fastF1BundleCache.get(cacheKey);

  if (cached && Date.now() - cached.createdAt < FASTF1_BUNDLE_CACHE_TTL_MS) {
    return cached.promise;
  }

  const promise = (async () => {
    try {
      const filePath = getFastF1BundlePath(season, round);
      const raw = await readFile(filePath, "utf8");
      return JSON.parse(raw) as FastF1RaceBundle;
    } catch {
      return null;
    }
  })();

  fastF1BundleCache.set(cacheKey, {
    createdAt: Date.now(),
    promise
  });

  return promise;
}
