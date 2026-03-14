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

function getFastF1BundlePath(season: string, round: string) {
  return path.join(process.cwd(), "public", "data", "fastf1", season, `round-${round}.json`);
}

export async function getFastF1RaceBundle(season: string, round: string): Promise<FastF1RaceBundle | null> {
  try {
    const filePath = getFastF1BundlePath(season, round);
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as FastF1RaceBundle;
  } catch {
    return null;
  }
}
