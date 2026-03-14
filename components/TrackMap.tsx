"use client";

import { motion } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import type { RaceRecap, RaceReplayData, TrackSector } from "@/lib/f1";
import { getTrackSectorInsight } from "@/lib/track-sector-insights";
import { cn } from "@/lib/utils";

type TrackMapProps = {
  circuitId: string;
  trackSvgPath: string | null;
  className?: string;
  sectors?: TrackSector[];
  drsZoneCount?: number | string;
  recap?: RaceRecap | null;
  replay?: RaceReplayData | null;
};

type TrackSvgData = {
  viewBox: string;
  pathData: string;
  nativeStrokeWidth: number | null;
};

type TrackLayout = {
  sectorStops: [number, number, number, number];
  drsFractions: number[];
};

type TooltipPosition = {
  x: number;
  y: number;
};

type SectorDisplay = {
  id: TrackSector["id"];
  name: string;
  telemetry: string;
  start: number;
  end: number;
};

type SectorIntel = {
  id: TrackSector["id"];
  name: string;
  telemetry: string;
  turnRange: string;
  phaseFocus: string;
  pressureProfile: string;
  lengthPct: number;
};

type SegmentPath = {
  id: string;
  pathData: string;
};

type SectorPath = {
  id: TrackSector["id"];
  pathData: string;
};

type TooltipCopy = {
  title: string;
  body: string;
  detail?: string;
};

type SelectionMode = "hover" | "manual";

type ReplayMoment = {
  id: string;
  title: string;
  detail: string;
  checkpointMs: number;
};

const TRACK_LAYOUTS: Record<string, TrackLayout> = {
  albert_park: { sectorStops: [0, 0.32, 0.66, 1], drsFractions: [0.08, 0.36, 0.62, 0.86] },
  jeddah: { sectorStops: [0, 0.3, 0.63, 1], drsFractions: [0.1, 0.42, 0.78] },
  bahrain: { sectorStops: [0, 0.34, 0.68, 1], drsFractions: [0.14, 0.47, 0.82] },
  suzuka: { sectorStops: [0, 0.37, 0.71, 1], drsFractions: [0.19] },
  shanghai: { sectorStops: [0, 0.35, 0.69, 1], drsFractions: [0.16, 0.56] },
  miami: { sectorStops: [0, 0.33, 0.66, 1], drsFractions: [0.13, 0.48, 0.79] },
  imola: { sectorStops: [0, 0.31, 0.66, 1], drsFractions: [0.55] },
  monaco: { sectorStops: [0, 0.34, 0.67, 1], drsFractions: [0.58] },
  catalunya: { sectorStops: [0, 0.3, 0.65, 1], drsFractions: [0.15, 0.72] },
  villeneuve: { sectorStops: [0, 0.33, 0.68, 1], drsFractions: [0.19, 0.51, 0.86] },
  red_bull_ring: { sectorStops: [0, 0.3, 0.63, 1], drsFractions: [0.08, 0.39, 0.74] },
  silverstone: { sectorStops: [0, 0.36, 0.71, 1], drsFractions: [0.22, 0.63] },
  spa: { sectorStops: [0, 0.33, 0.69, 1], drsFractions: [0.09, 0.58] },
  hungaroring: { sectorStops: [0, 0.34, 0.67, 1], drsFractions: [0.17, 0.74] },
  zandvoort: { sectorStops: [0, 0.35, 0.69, 1], drsFractions: [0.21, 0.73] },
  monza: { sectorStops: [0, 0.32, 0.67, 1], drsFractions: [0.16, 0.62] },
  baku: { sectorStops: [0, 0.31, 0.64, 1], drsFractions: [0.14, 0.79] },
  marina_bay: { sectorStops: [0, 0.34, 0.68, 1], drsFractions: [0.18, 0.47, 0.81] },
  americas: { sectorStops: [0, 0.33, 0.67, 1], drsFractions: [0.1, 0.57] },
  rodriguez: { sectorStops: [0, 0.31, 0.66, 1], drsFractions: [0.09, 0.44, 0.84] },
  interlagos: { sectorStops: [0, 0.34, 0.69, 1], drsFractions: [0.15, 0.72] },
  las_vegas: { sectorStops: [0, 0.34, 0.67, 1], drsFractions: [0.11, 0.43] },
  losail: { sectorStops: [0, 0.35, 0.69, 1], drsFractions: [0.17] },
  yas_marina: { sectorStops: [0, 0.32, 0.66, 1], drsFractions: [0.23, 0.77] }
};

const DEFAULT_LAYOUT: TrackLayout = {
  sectorStops: [0, 0.33, 0.66, 1],
  drsFractions: [0.2, 0.55]
};

const REPLAY_SPEEDS = [0.75, 1, 1.5, 2] as const;
const TRACK_FRAME_HEIGHT_CLASS = "h-[clamp(270px,36vw,460px)]";

const DEFAULT_SECTORS: TrackSector[] = [
  {
    id: "S1",
    name: "Sector 1",
    telemetry: "Opening phase where launch rotation and front-end bite decide delta."
  },
  {
    id: "S2",
    name: "Sector 2",
    telemetry: "Mid-lap velocity zone with drag efficiency and balance sensitivity."
  },
  {
    id: "S3",
    name: "Sector 3",
    telemetry: "Braking-to-traction section where deployment timing shapes final split."
  }
];

const SECTOR_IDS: TrackSector["id"][] = ["S1", "S2", "S3"];

const TRACK_TURN_COUNTS: Record<string, number> = {
  albert_park: 14,
  jeddah: 27,
  bahrain: 15,
  suzuka: 18,
  shanghai: 16,
  miami: 19,
  imola: 19,
  monaco: 19,
  catalunya: 14,
  villeneuve: 14,
  red_bull_ring: 10,
  silverstone: 18,
  spa: 19,
  hungaroring: 14,
  zandvoort: 14,
  monza: 11,
  baku: 20,
  marina_bay: 19,
  americas: 20,
  rodriguez: 17,
  interlagos: 15,
  las_vegas: 17,
  losail: 16,
  yas_marina: 16
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hashReplayKey(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function getReplayDriverColor(driverId: string, finishPosition: number) {
  const hash = hashReplayKey(driverId);
  if (Number.isFinite(finishPosition) && finishPosition > 0) {
    const hue = (((finishPosition - 1) % 24) * (360 / 24) + 4) % 360;
    return `hsl(${hue.toFixed(1)} 72% 52%)`;
  }

  const fallbackHue = hash % 360;
  const fallbackSaturation = 65 + (hash % 18);
  const fallbackLightness = 46 + ((hash >> 3) % 12);
  return `hsl(${fallbackHue} ${fallbackSaturation}% ${fallbackLightness}%)`;
}

function resolveDistanceAtReplayTime(cumulativeMs: number[], replayTimeMs: number) {
  if (cumulativeMs.length === 0) {
    return { distanceLaps: 0, trackFraction: 0 };
  }

  const clampedTime = Math.max(replayTimeMs, 0);
  let low = 0;
  let high = cumulativeMs.length - 1;
  let firstHigherOrEqual = cumulativeMs.length;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const current = cumulativeMs[mid] ?? 0;

    if (current >= clampedTime) {
      firstHigherOrEqual = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  if (firstHigherOrEqual >= cumulativeMs.length) {
    const finalDistance = cumulativeMs.length;
    return { distanceLaps: finalDistance, trackFraction: finalDistance % 1 };
  }

  const lapEnd = cumulativeMs[firstHigherOrEqual] ?? 0;
  const lapStart = firstHigherOrEqual > 0 ? cumulativeMs[firstHigherOrEqual - 1] ?? 0 : 0;
  const lapSpan = Math.max(lapEnd - lapStart, 1);
  const lapProgress = clamp((clampedTime - lapStart) / lapSpan, 0, 1);
  const distanceLaps = firstHigherOrEqual + lapProgress;

  return { distanceLaps, trackFraction: distanceLaps % 1 };
}

function buildSegmentPolyline(
  pathElement: SVGPathElement | null,
  pathLength: number,
  startFraction: number,
  endFraction: number
): string | null {
  if (!pathElement || pathLength <= 0) {
    return null;
  }

  const start = clamp(startFraction, 0, 1) * pathLength;
  const end = clamp(endFraction, 0, 1) * pathLength;

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  const span = end - start;
  const sampleCount = Math.max(20, Math.ceil(span / 6));
  const chunks: string[] = [];

  for (let index = 0; index <= sampleCount; index += 1) {
    const distance = start + (span * index) / sampleCount;
    const point = pathElement.getPointAtLength(distance);
    chunks.push(`${index === 0 ? "M" : "L"} ${point.x.toFixed(3)} ${point.y.toFixed(3)}`);
  }

  return chunks.join(" ");
}

function parseDrsCount(value: number | string | undefined, fallback: number) {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return Math.floor(numeric);
    }
  }

  return fallback;
}

function canonicalizeSectorId(value: unknown): TrackSector["id"] | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (normalized === "S1" || normalized === "SECTOR1" || normalized === "1") {
    return "S1";
  }

  if (normalized === "S2" || normalized === "SECTOR2" || normalized === "2") {
    return "S2";
  }

  if (normalized === "S3" || normalized === "SECTOR3" || normalized === "3") {
    return "S3";
  }

  return null;
}

function getFallbackTelemetry(circuitId: string) {
  return `Telemetry feed unavailable for ${circuitId.replace(/_/g, " ")}.`;
}

function parseStrokeOnlyClasses(svgText: string): Set<string> {
  const classes = new Set<string>();
  const styleBlocks = Array.from(svgText.matchAll(/\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g));

  for (const [, className, rules] of styleBlocks) {
    const normalizedRules = rules.toLowerCase().replace(/\s+/g, "");
    const hasStroke = normalizedRules.includes("stroke:");
    const hasNoFill = normalizedRules.includes("fill:none");

    if (hasStroke && hasNoFill) {
      classes.add(className);
    }
  }

  return classes;
}

function parseFillNoneClasses(svgText: string): Set<string> {
  const classes = new Set<string>();
  const styleBlocks = Array.from(svgText.matchAll(/\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g));

  for (const [, className, rules] of styleBlocks) {
    const normalizedRules = rules.toLowerCase().replace(/\s+/g, "");
    if (normalizedRules.includes("fill:none")) {
      classes.add(className);
    }
  }

  return classes;
}

function parseStrokeWidth(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const numeric = Number(value.trim());
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function resolvePrimarySubpath(d: string): string {
  const chunks = d.match(/[Mm][^Mm]*/g);

  if (!chunks || chunks.length <= 1) {
    return d;
  }

  return chunks.sort((a, b) => b.length - a.length)[0]?.trim() ?? d;
}

function parseSvgDimension(rawValue: string | null): number | null {
  if (!rawValue) {
    return null;
  }

  const match = rawValue.match(/-?\d+(\.\d+)?/);

  if (!match) {
    return null;
  }

  const numeric = Number(match[0]);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function resolveViewBox(svgElement: SVGElement | null): string | null {
  const viewBox = svgElement?.getAttribute("viewBox")?.trim();

  if (viewBox) {
    return viewBox;
  }

  const width = parseSvgDimension(svgElement?.getAttribute("width") ?? null);
  const height = parseSvgDimension(svgElement?.getAttribute("height") ?? null);

  if (width && height) {
    return `0 0 ${width} ${height}`;
  }

  return null;
}

function parseViewBox(viewBox: string): [number, number, number, number] | null {
  const values = viewBox
    .trim()
    .split(/[\s,]+/)
    .map((value) => Number(value));

  if (values.length !== 4 || values.some((value) => !Number.isFinite(value))) {
    return null;
  }

  const [minX, minY, width, height] = values;
  if (width <= 0 || height <= 0) {
    return null;
  }

  return [minX, minY, width, height];
}

function resolveMainTrackPath(parsed: Document, svgText: string): string | null {
  const strokeOnlyClasses = parseStrokeOnlyClasses(svgText);
  const fillNoneClasses = parseFillNoneClasses(svgText);
  const allPaths = Array.from(parsed.querySelectorAll("path[d]"));

  if (allPaths.length === 0) {
    return null;
  }

  const ranked = allPaths
    .map((pathElement) => {
      const d = pathElement.getAttribute("d")?.trim() ?? "";
      const stroke = pathElement.getAttribute("stroke")?.trim()?.toLowerCase() ?? "";
      const fill = pathElement.getAttribute("fill")?.trim()?.toLowerCase() ?? "";
      const strokeWidth = parseStrokeWidth(pathElement.getAttribute("stroke-width"));
      const classNames = (pathElement.getAttribute("class") ?? "")
        .split(/\s+/)
        .map((className) => className.trim())
        .filter(Boolean);

      const isStrokePath = classNames.some((className) => strokeOnlyClasses.has(className));
      const hasFillNoneClass = classNames.some((className) => fillNoneClasses.has(className));
      const hasStrokeAttribute = Boolean(stroke && stroke !== "none");
      const hasNoFillAttribute = fill === "none";
      const hasNoFill = hasFillNoneClass || hasNoFillAttribute;
      const pathScore =
        d.length +
        (isStrokePath || hasStrokeAttribute ? 12000 : 0) +
        (hasNoFill ? 6000 : 0) +
        (strokeWidth ? strokeWidth * 32 : 0);

      return {
        d: resolvePrimarySubpath(d),
        score: pathScore,
        strokeWidth
      };
    })
    .filter((entry) => entry.d.length > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.d ?? null;
}

function resolveNativeStrokeWidth(parsed: Document): number | null {
  const paths = Array.from(parsed.querySelectorAll("path[d]"));

  if (paths.length === 0) {
    return null;
  }

  const widths = paths
    .map((pathElement) => parseStrokeWidth(pathElement.getAttribute("stroke-width")))
    .filter((width): width is number => width !== null);

  if (widths.length === 0) {
    return null;
  }

  return widths.sort((a, b) => b - a)[0] ?? null;
}

export default function TrackMap({ circuitId, trackSvgPath, className, sectors, drsZoneCount, recap, replay }: TrackMapProps) {
  const [svgData, setSvgData] = useState<TrackSvgData | null>(null);
  const [fittedViewBox, setFittedViewBox] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeSectorId, setActiveSectorId] = useState<TrackSector["id"] | null>(null);
  const [activeDrsId, setActiveDrsId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 12, y: 12 });
  const [pathLength, setPathLength] = useState(0);
  const [replayTimeMs, setReplayTimeMs] = useState(0);
  const [isReplayPlaying, setIsReplayPlaying] = useState(false);
  const [replaySpeedIndex, setReplaySpeedIndex] = useState(1);
  const [isTrackReplayOpen, setIsTrackReplayOpen] = useState(false);

  const pathRef = useRef<SVGPathElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const layout = useMemo(() => TRACK_LAYOUTS[circuitId] ?? DEFAULT_LAYOUT, [circuitId]);

  const sectorSegments = useMemo<SectorDisplay[]>(() => {
    const sourceSectors = sectors && sectors.length > 0 ? sectors : DEFAULT_SECTORS;
    const sectorsById = new Map<TrackSector["id"], TrackSector>();

    sourceSectors.forEach((sector, index) => {
      const slotId =
        canonicalizeSectorId(sector.id) ??
        canonicalizeSectorId(sector.name) ??
        SECTOR_IDS[index] ??
        null;

      if (!slotId || sectorsById.has(slotId)) {
        return;
      }

      sectorsById.set(slotId, { ...sector, id: slotId });
    });

    return layout.sectorStops.slice(0, 3).map((start, index) => {
      const slotId = SECTOR_IDS[index] ?? "S3";
      const fallback = DEFAULT_SECTORS[index] ?? DEFAULT_SECTORS[2];
      const source = sectorsById.get(slotId) ?? sourceSectors[index] ?? fallback;
      const end = layout.sectorStops[index + 1];

      return {
        id: slotId,
        name: source.name || fallback.name,
        telemetry: source.telemetry || fallback.telemetry,
        start,
        end
      };
    });
  }, [layout.sectorStops, sectors]);

  const sectorIntel = useMemo<SectorIntel[]>(() => {
    const turnCount = TRACK_TURN_COUNTS[circuitId] ?? 18;

    return sectorSegments.map((segment, index) => {
      const startTurn = clamp(Math.floor(segment.start * turnCount) + 1, 1, turnCount);
      const computedEnd = clamp(Math.round(segment.end * turnCount), startTurn, turnCount);
      const endTurn = index === sectorSegments.length - 1 ? turnCount : computedEnd;
      const turnRange = startTurn === endTurn ? `T${startTurn}` : `T${startTurn}-T${endTurn}`;
      const lengthPct = clamp(Math.round((segment.end - segment.start) * 100), 1, 98);
      const insight = getTrackSectorInsight(circuitId, segment.id);

      return {
        id: segment.id,
        name: segment.name,
        telemetry: segment.telemetry,
        turnRange,
        lengthPct,
        phaseFocus: insight.phaseFocus,
        pressureProfile: insight.pressureProfile
      };
    });
  }, [circuitId, sectorSegments]);

  const replayMoments = useMemo<ReplayMoment[]>(() => {
    const baseMoments =
      recap?.keyMoments && recap.keyMoments.length > 0
        ? recap.keyMoments.map((moment, index) => ({
            id: `${moment.title}-${index}`,
            title: moment.title,
            detail: moment.detail
          }))
        : [
            {
              id: "s1-preview",
              title: "Sector 1 Launch",
              detail: "Opening phase racecraft and positioning pressure."
            },
            {
              id: "s2-preview",
              title: "Sector 2 Flow",
              detail: "Mid-lap pace balance and overtake setup windows."
            },
            {
              id: "s3-preview",
              title: "Sector 3 Finish",
              detail: "Braking and traction execution into the final sprint."
            }
          ];
    const duration = replay?.totalRaceMs && replay.totalRaceMs > 0 ? replay.totalRaceMs : 180000;

    const distributedMoments = baseMoments.map((moment, index) => ({
      ...moment,
      checkpointMs: Math.round(((index + 1) / (baseMoments.length + 1)) * duration)
    }));
    const finishMoment: ReplayMoment = {
      id: "chequered-flag",
      title: "Chequered Flag",
      detail: "Official classified finish order.",
      checkpointMs: duration
    };

    return [...distributedMoments, finishMoment];
  }, [recap, replay?.totalRaceMs]);

  const replaySpeed = REPLAY_SPEEDS[replaySpeedIndex] ?? 1;
  const replayDurationMs = replay?.totalRaceMs && replay.totalRaceMs > 0 ? replay.totalRaceMs : 180000;
  const replayModeLabel = replay?.traces?.length ? "Official lap trace replay" : "Preview track replay";
  const hasReplayTelemetry = Boolean(replay && replay.traces.length > 0 && replay.totalRaceMs > 0);

  const drsFractions = useMemo(() => {
    const requestedCount = parseDrsCount(drsZoneCount, layout.drsFractions.length);

    if (requestedCount <= layout.drsFractions.length) {
      return layout.drsFractions.slice(0, requestedCount);
    }

    const generated = Array.from({ length: requestedCount }, (_, index) => (index + 1) / (requestedCount + 1));
    return generated;
  }, [drsZoneCount, layout.drsFractions]);

  useEffect(() => {
    let isCancelled = false;

    async function loadSvg() {
      if (!trackSvgPath) {
        setSvgData(null);
        setHasError(true);
        setIsLoading(false);
        if (typeof window !== "undefined") {
          console.warn(`[TrackMap] Missing track SVG mapping for circuit '${circuitId}'.`);
        }
        return;
      }

      setIsLoading(true);
      setHasError(false);

      try {
        const response = await fetch(trackSvgPath, { cache: "force-cache" });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const svgText = await response.text();
        const parsed = new DOMParser().parseFromString(svgText, "image/svg+xml");
        const svg = parsed.querySelector("svg");

        const viewBox = resolveViewBox(svg);
        const pathData = resolveMainTrackPath(parsed, svgText);
        const nativeStrokeWidth = resolveNativeStrokeWidth(parsed);

        if (!viewBox || !pathData) {
          throw new Error("Invalid SVG shape");
        }

        if (!isCancelled) {
          setSvgData({ viewBox, pathData, nativeStrokeWidth });
          setHasError(false);
        }
      } catch {
        if (!isCancelled) {
          setSvgData(null);
          setHasError(true);
          if (typeof window !== "undefined") {
            console.warn(`[TrackMap] Track SVG file is missing or invalid for '${circuitId}' at '${trackSvgPath}'.`);
          }
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadSvg();

    return () => {
      isCancelled = true;
    };
  }, [circuitId, trackSvgPath]);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const element = pathRef.current;

      if (!element) {
        setPathLength(0);
        return;
      }

      const totalLength = element.getTotalLength();
      setPathLength(Number.isFinite(totalLength) ? totalLength : 0);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [svgData?.pathData]);

  useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const element = pathRef.current;
      const sourceViewBox = svgData?.viewBox;

      if (!element || !sourceViewBox) {
        setFittedViewBox(null);
        return;
      }

      const parsedViewBox = parseViewBox(sourceViewBox);
      if (!parsedViewBox) {
        setFittedViewBox(sourceViewBox);
        return;
      }

      const [sourceMinX, sourceMinY, sourceWidth, sourceHeight] = parsedViewBox;
      const sourceMaxX = sourceMinX + sourceWidth;
      const sourceMaxY = sourceMinY + sourceHeight;

      try {
        const bounds = element.getBBox();
        if (!Number.isFinite(bounds.width) || !Number.isFinite(bounds.height) || bounds.width <= 0 || bounds.height <= 0) {
          setFittedViewBox(sourceViewBox);
          return;
        }

        const paddingRatio = circuitId === "suzuka" ? 0.08 : 0.16;
        const padX = Math.max(bounds.width * paddingRatio, 8);
        const padY = Math.max(bounds.height * paddingRatio, 8);

        const nextMinX = Math.max(sourceMinX, bounds.x - padX);
        const nextMinY = Math.max(sourceMinY, bounds.y - padY);
        const nextMaxX = Math.min(sourceMaxX, bounds.x + bounds.width + padX);
        const nextMaxY = Math.min(sourceMaxY, bounds.y + bounds.height + padY);

        const nextWidth = nextMaxX - nextMinX;
        const nextHeight = nextMaxY - nextMinY;

        if (nextWidth <= 0 || nextHeight <= 0) {
          setFittedViewBox(sourceViewBox);
          return;
        }

        setFittedViewBox(`${nextMinX} ${nextMinY} ${nextWidth} ${nextHeight}`);
      } catch {
        setFittedViewBox(sourceViewBox);
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [circuitId, svgData?.pathData, svgData?.viewBox]);

  const drsSegments = useMemo(() => {
    if (pathLength <= 0) {
      return [] as Array<{ id: string; start: number; end: number }>;
    }

    return drsFractions.map((fraction, index) => {
      const halfWindow = 0.02;
      return {
        id: `DRS-${index + 1}`,
        start: clamp(fraction - halfWindow, 0, 1),
        end: clamp(fraction + halfWindow, 0, 1)
      };
    });
  }, [drsFractions, pathLength]);

  const sectorPaths = useMemo(() => {
    const element = pathRef.current;

    if (!element || pathLength <= 0) {
      return [] as SectorPath[];
    }

    return sectorSegments
      .map((segment) => {
        const pathData = buildSegmentPolyline(element, pathLength, segment.start, segment.end);

        if (!pathData) {
          return null;
        }

        return { id: segment.id, pathData };
      })
      .filter((segment): segment is SectorPath => segment !== null);
  }, [pathLength, sectorSegments]);

  const drsPaths = useMemo(() => {
    const element = pathRef.current;

    if (!element || pathLength <= 0) {
      return [] as SegmentPath[];
    }

    return drsSegments
      .map((segment) => {
        const pathData = buildSegmentPolyline(element, pathLength, segment.start, segment.end);

        if (!pathData) {
          return null;
        }

        return { id: segment.id, pathData };
      })
      .filter((segment): segment is SegmentPath => segment !== null);
  }, [drsSegments, pathLength]);

  const strokeScale = useMemo(() => {
    const native = svgData?.nativeStrokeWidth ?? 6;
    const normalizedBase = clamp(6.2 + (native - 6) * 0.08, 5.9, 6.7);
    const outlineScale = 0.9;

    return {
      base: normalizedBase * outlineScale,
      red: (normalizedBase + 0.55) * outlineScale,
      sector: (normalizedBase + 0.95) * outlineScale,
      sectorActive: (normalizedBase + 2) * outlineScale,
      drs: (normalizedBase + 0.8) * outlineScale,
      drsActive: (normalizedBase + 2.35) * outlineScale,
      hitbox: 21
    };
  }, [svgData?.nativeStrokeWidth]);

  const drsPoints = useMemo(() => {
    const element = pathRef.current;

    if (!element || pathLength <= 0) {
      return [] as Array<{ id: string; x: number; y: number }>;
    }

    return drsFractions.map((fraction, index) => {
      const point = element.getPointAtLength(pathLength * fraction);
      return { id: `DRS-${index + 1}`, x: point.x, y: point.y };
    });
  }, [drsFractions, pathLength]);

  const stepReplayTime = useCallback(
    (direction: -1 | 1) => {
      const jumpSize = Math.max(Math.round(replayDurationMs / Math.max(replayMoments.length + 1, 2)), 1500);
      setReplayTimeMs((previous) => clamp(previous + direction * jumpSize, 0, replayDurationMs));
    },
    [replayDurationMs, replayMoments.length]
  );

  useEffect(() => {
    setReplayTimeMs(0);
    setIsReplayPlaying(false);
    setReplaySpeedIndex(1);
  }, [circuitId, recap?.headline, recap?.winnerStory, replayDurationMs]);

  useEffect(() => {
    if (!isReplayPlaying || replayDurationMs <= 0) {
      return;
    }

    let frameId = 0;
    let previousTimestamp: number | null = null;

    const tick = (timestamp: number) => {
      if (previousTimestamp === null) {
        previousTimestamp = timestamp;
      }

      const delta = timestamp - previousTimestamp;
      previousTimestamp = timestamp;
      let shouldStop = false;

      setReplayTimeMs((current) => {
        const next = current + delta * replaySpeed;
        if (next >= replayDurationMs) {
          shouldStop = true;
          return replayDurationMs;
        }

        return next;
      });

      if (shouldStop) {
        setIsReplayPlaying(false);
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [isReplayPlaying, replayDurationMs, replaySpeed]);

  const jumpToReplayMoment = useCallback((moment: ReplayMoment) => {
    setReplayTimeMs(moment.checkpointMs);
    if (moment.id === "chequered-flag") {
      setIsReplayPlaying(false);
    }
  }, []);

  const replayActiveMomentIndex = useMemo(() => {
    if (replayMoments.length === 0) {
      return 0;
    }

    let bestIndex = 0;
    let bestDelta = Number.POSITIVE_INFINITY;

    for (let index = 0; index < replayMoments.length; index += 1) {
      const checkpoint = replayMoments[index]?.checkpointMs ?? 0;
      const delta = Math.abs(checkpoint - replayTimeMs);

      if (delta < bestDelta) {
        bestDelta = delta;
        bestIndex = index;
      }
    }

    return bestIndex;
  }, [replayMoments, replayTimeMs]);

  const replayActiveMoment = replayMoments[replayActiveMomentIndex] ?? replayMoments[0] ?? null;

  const replayMarkers = useMemo(() => {
    const element = pathRef.current;

    if (!element || pathLength <= 0) {
      return [] as Array<{
        id: string;
        label: string;
        constructor: string;
        color: string;
        x: number;
        y: number;
        livePosition: number;
        finishPosition: number;
      }>;
    }

    if (hasReplayTelemetry && replay) {
      const replayProgress = replayDurationMs > 0 ? clamp(replayTimeMs / replayDurationMs, 0, 1) : 0;
      const enforceOfficialOrder = replayProgress >= 0.985;

      const rawMarkers = replay.traces
        .map((trace) => {
          const distance = resolveDistanceAtReplayTime(trace.cumulativeMs, replayTimeMs);
          const point = element.getPointAtLength(pathLength * clamp(distance.trackFraction, 0, 0.999));

          return {
            id: trace.driverId,
            label: trace.code || trace.name,
            constructor: trace.constructor,
            color: getReplayDriverColor(trace.driverId, trace.finishPosition),
            x: point.x,
            y: point.y,
            distanceLaps: distance.distanceLaps,
            finishPosition: trace.finishPosition
          };
        })
        .sort((a, b) => {
          if (enforceOfficialOrder) {
            const officialDelta = a.finishPosition - b.finishPosition;
            if (officialDelta !== 0) {
              return officialDelta;
            }
          }

          const liveDelta = b.distanceLaps - a.distanceLaps;
          if (Math.abs(liveDelta) > 0.0001) {
            return liveDelta;
          }

          const finishDelta = a.finishPosition - b.finishPosition;
          if (finishDelta !== 0) {
            return finishDelta;
          }

          return a.label.localeCompare(b.label);
        });

      return rawMarkers.map((marker, index) => {
        return {
          id: marker.id,
          label: marker.label,
          constructor: marker.constructor,
          color: marker.color,
          x: marker.x,
          y: marker.y,
          livePosition: index + 1,
          finishPosition: marker.finishPosition
        };
      });
    }

    return [];
  }, [hasReplayTelemetry, pathLength, replay, replayDurationMs, replayTimeMs]);

  const replayCurrentLap = useMemo(() => {
    if (hasReplayTelemetry && replay && replay.totalLaps > 0) {
      return clamp(Math.floor((replayTimeMs / Math.max(replayDurationMs, 1)) * replay.totalLaps) + 1, 1, replay.totalLaps);
    }

    return Math.floor((replayTimeMs / Math.max(replayDurationMs, 1)) * 60) + 1;
  }, [hasReplayTelemetry, replay, replayDurationMs, replayTimeMs]);

  const selectedSectorIntel = useMemo(() => {
    if (activeSectorId) {
      return sectorIntel.find((segment) => segment.id === activeSectorId) ?? null;
    }

    return null;
  }, [activeSectorId, sectorIntel]);

  const tooltipCopy = useMemo<TooltipCopy | null>(() => {
    if (activeDrsId) {
      return {
        title: `${activeDrsId.replace("-", " ")} Window`,
        body: "Detection and activation corridor optimized for straight-line release.",
        detail: "Hover the marker to inspect the window on-track."
      };
    }

    if (selectedSectorIntel) {
      return {
        title: `${selectedSectorIntel.name} • ${selectedSectorIntel.turnRange}`,
        body: selectedSectorIntel.phaseFocus,
        detail: `${selectedSectorIntel.lengthPct}% lap share • ${selectedSectorIntel.pressureProfile}`
      };
    }

    return null;
  }, [activeDrsId, selectedSectorIntel]);

  const updateTooltipPosition = (event: MouseEvent<SVGElement>) => {
    const frame = frameRef.current;

    if (!frame) {
      return;
    }

    const bounds = frame.getBoundingClientRect();
    const nextX = clamp(event.clientX - bounds.left + 14, 10, Math.max(bounds.width - 230, 10));
    const nextY = clamp(event.clientY - bounds.top - 58, 10, Math.max(bounds.height - 90, 10));

    setTooltipPosition({ x: nextX, y: nextY });
  };

  const activateSector = (sectorId: TrackSector["id"], mode: SelectionMode = "manual") => {
    if (mode === "manual") {
      setTooltipPosition({ x: 12, y: 12 });
    }

    setActiveDrsId(null);
    setActiveSectorId(sectorId);
    setSelectionMode(mode);
  };

  const activateDrs = (drsId: string, mode: SelectionMode = "manual") => {
    if (mode === "manual") {
      setTooltipPosition({ x: 12, y: 12 });
    }

    setActiveSectorId(null);
    setActiveDrsId(drsId);
    setSelectionMode(mode);
  };

  const clearSelection = () => {
    setActiveSectorId(null);
    setActiveDrsId(null);
    setSelectionMode(null);
  };

  const resetOverlay = () => {
    clearSelection();
    setIsReplayPlaying(false);
    setReplayTimeMs(0);
    setReplaySpeedIndex(1);
    setTooltipPosition({ x: 12, y: 12 });
    setIsTrackReplayOpen(false);
  };

  const clearHoverSelection = () => {
    if (selectionMode === "hover") {
      clearSelection();
    }
  };

  if (isLoading) {
    return (
      <div className={cn("border border-[#2A2A2A] bg-[#090909] p-3", className)}>
        <div className={cn(TRACK_FRAME_HEIGHT_CLASS, "animate-pulse border border-[#1B1B1B] bg-[#0E0E0E]")} />
      </div>
    );
  }

  if (hasError || !svgData) {
    return (
      <div className={cn("border border-[#2A2A2A] bg-[#090909] p-3", className)}>
        <div
          className={cn(
            TRACK_FRAME_HEIGHT_CLASS,
            "relative overflow-hidden border border-[#1E1E1E] bg-[#080808] px-6"
          )}
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:28px_28px]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(225,6,0,0.08),transparent_55%)]" />
          <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 rounded-full border border-[#2A2A2A] bg-[#0D0D0D] p-4">
              <svg viewBox="0 0 120 84" className="h-10 w-14" aria-hidden="true">
                <path
                  d="M18 58C18 46 24 34 34 24C43 15 56 12 67 15C74 17 84 22 91 31C97 39 100 48 98 57C96 67 88 74 77 76C69 78 61 74 55 70C48 66 42 66 35 69C28 72 22 69 20 63C19 61 18 60 18 58Z"
                  fill="none"
                  stroke="rgba(255,255,255,0.18)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-mono text-6xl font-bold uppercase tracking-[0.24em] text-gray-700 opacity-20 md:text-8xl">
              TRACK MAP
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-600">
              Circuit visualization
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border border-[#2A2A2A] bg-[#090909] p-3", className)}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7B7B7B]">Track Overlay</p>
        <button
          type="button"
          onClick={resetOverlay}
          className="border border-[#2A2A2A] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B9B9B] hover:border-[#4A4A4A] hover:text-[#D0D0D0]"
        >
          Reset
        </button>
      </div>

      <div ref={frameRef} className="relative overflow-hidden border border-[#1E1E1E] bg-[#080808]" onMouseLeave={clearHoverSelection}>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <svg
          viewBox={fittedViewBox ?? svgData.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className={cn("relative w-full", TRACK_FRAME_HEIGHT_CLASS)}
          role="img"
          aria-label={`${circuitId.replace(/_/g, " ")} track map`}
        >
          <motion.path
            ref={pathRef}
            d={svgData.pathData}
            fill="none"
            stroke="#1C1C1C"
            strokeWidth={strokeScale.base}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          <motion.path
            d={svgData.pathData}
            fill="none"
            stroke="#E10600"
            strokeWidth={strokeScale.red}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0.92 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={{ filter: "drop-shadow(0 0 8px rgba(225,6,0,0.45))" }}
          />

          {pathLength > 0 &&
            sectorPaths.map((segment) => {
              const isActive = activeSectorId === segment.id;

              return (
                <g key={segment.id}>
                  {isActive ? (
                    <path
                      d={segment.pathData}
                      fill="none"
                      stroke="#FF5D55"
                      strokeWidth={strokeScale.sectorActive}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                      style={{ filter: "drop-shadow(0 0 10px rgba(225,6,0,0.55))" }}
                      pointerEvents="none"
                    />
                  ) : null}

                  <path
                    d={segment.pathData}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={strokeScale.hitbox}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    onMouseEnter={() => activateSector(segment.id, "hover")}
                    onMouseMove={updateTooltipPosition}
                    onMouseLeave={clearHoverSelection}
                  />
                </g>
              );
            })}

          {pathLength > 0 &&
            drsPaths.map((segment) => {
              const isActive = activeDrsId === segment.id;

              return (
                <g key={segment.id}>
                  <path
                    d={segment.pathData}
                    fill="none"
                    stroke={isActive ? "#FFD4D2" : "#842E2A"}
                    strokeWidth={isActive ? strokeScale.drsActive : strokeScale.drs}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    style={{
                      opacity: isActive ? 1 : 0.58,
                      filter: isActive ? "drop-shadow(0 0 9px rgba(225,6,0,0.45))" : "none"
                    }}
                    pointerEvents="none"
                  />
                  <path
                    d={segment.pathData}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={strokeScale.hitbox}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    onMouseEnter={() => activateDrs(segment.id, "hover")}
                    onMouseMove={updateTooltipPosition}
                    onMouseLeave={clearHoverSelection}
                  />
                </g>
              );
            })}

          {drsPoints.map((point) => {
            const isActive = activeDrsId === point.id;

            return (
              <g key={point.id}>
                <motion.circle
                  cx={point.x}
                  cy={point.y}
                  r={isActive ? 8 : 6}
                  fill="none"
                  stroke="#E10600"
                  strokeWidth={1.2}
                  animate={{ scale: [1, 1.18, 1], opacity: [0.9, 0.34, 0.9] }}
                  transition={{ duration: 1.1, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                  pointerEvents="none"
                />
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={4.6}
                  fill="rgba(225,6,0,0.92)"
                  stroke="#FFD1CF"
                  strokeWidth={0.8}
                  onMouseEnter={() => activateDrs(point.id, "hover")}
                  onMouseMove={updateTooltipPosition}
                  onMouseLeave={clearHoverSelection}
                />
              </g>
            );
          })}

          {replayMarkers.map((marker) => (
            <g key={marker.id} transform={`translate(${marker.x} ${marker.y})`} pointerEvents="none">
              <circle
                r={marker.livePosition <= 3 ? 5.6 : 3.8}
                fill={marker.color}
                stroke="#F8FAFC"
                strokeWidth={marker.livePosition <= 3 ? 1.1 : 0.8}
              />
              {marker.livePosition <= 3 ? <circle r={11} fill="none" stroke={marker.color} strokeWidth={1} opacity={0.4} /> : null}
            </g>
          ))}
        </svg>

        {tooltipCopy ? (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="pointer-events-none absolute z-10 max-w-[270px] border border-[#3A3A3A] bg-[#080808] px-3 py-2"
            style={{
              left: tooltipPosition.x,
              top: tooltipPosition.y,
              boxShadow: "0 0 14px rgba(225,6,0,0.24)"
            }}
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#E10600]">{tooltipCopy.title}</p>
            <p className="mt-1 text-[11px] font-medium leading-snug text-[#C9C9C9]">
              {tooltipCopy.body || getFallbackTelemetry(circuitId)}
            </p>
            {tooltipCopy.detail ? (
              <p className="mt-2 text-[10px] font-semibold leading-snug text-[#9D9D9D]">{tooltipCopy.detail}</p>
            ) : null}
          </motion.div>
        ) : null}

      </div>

      {replayActiveMoment ? (
        <div className="mt-3 border border-[#2C2C2C] bg-[#0B0B0B]">
          <button
            type="button"
            onClick={() => setIsTrackReplayOpen((previous) => !previous)}
            className="flex w-full items-center justify-between px-3 py-2 text-left"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#E6A3A0]">
              {isTrackReplayOpen ? "Hide Track Replay" : "Show Track Replay"}
            </span>
            <span className={cn("material-icons text-base text-[#E10600] transition-transform", isTrackReplayOpen ? "rotate-180" : "")}>
              expand_more
            </span>
          </button>

          {isTrackReplayOpen ? (
            <div className="border-t border-[#232323] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[10px] text-[#888]">
                  {replayModeLabel} • Lap {replayCurrentLap}
                  {hasReplayTelemetry && replay ? ` / ${replay.totalLaps}` : ""}
                </p>
                <p className="text-[10px] font-semibold text-[#B1B1B1]">
                  {isReplayPlaying ? "Playing" : "Paused"} • {replaySpeed}x
                </p>
              </div>

              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#F3F3F3]">{replayActiveMoment.title}</p>
              <p className="mt-1 text-[11px] leading-snug text-[#BDBDBD]">{replayActiveMoment.detail}</p>

              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => stepReplayTime(-1)}
                  className="inline-flex items-center justify-center border border-[#2D2D2D] bg-[#111] px-2 py-1 text-[10px] font-semibold text-[#D8D8D8] hover:border-[#6A6A6A]"
                  aria-label="Previous replay checkpoint"
                >
                  <span className="material-icons text-sm">fast_rewind</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsReplayPlaying((previous) => !previous)}
                  className="inline-flex items-center gap-1 border border-[#7D2A28] bg-[#190909] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#FDE8E8] hover:border-[#E10600]"
                  aria-label={isReplayPlaying ? "Pause replay" : "Play replay"}
                >
                  <span className="material-icons text-sm">{isReplayPlaying ? "pause" : "play_arrow"}</span>
                  {isReplayPlaying ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={() => stepReplayTime(1)}
                  className="inline-flex items-center justify-center border border-[#2D2D2D] bg-[#111] px-2 py-1 text-[10px] font-semibold text-[#D8D8D8] hover:border-[#6A6A6A]"
                  aria-label="Next replay checkpoint"
                >
                  <span className="material-icons text-sm">fast_forward</span>
                </button>

                <div className="ml-auto flex items-center gap-1">
                  {REPLAY_SPEEDS.map((speed, index) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => setReplaySpeedIndex(index)}
                      className={cn(
                        "border px-1.5 py-0.5 text-[10px] font-semibold",
                        replaySpeedIndex === index
                          ? "border-[#E10600] bg-[#180707] text-[#FDEAEA]"
                          : "border-[#2D2D2D] bg-[#111] text-[#969696] hover:border-[#7D2A28]"
                      )}
                      aria-label={`Set replay speed to ${speed}x`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              <input
                type="range"
                min={0}
                max={Math.max(replayDurationMs, 1)}
                value={replayTimeMs}
                onChange={(event) => setReplayTimeMs(Number(event.target.value))}
                className="mt-3 h-1 w-full cursor-pointer appearance-none rounded bg-[#282828]"
                aria-label="Replay timeline scrubber"
              />

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {replayMoments.map((moment, index) => (
                  <button
                    key={moment.id}
                    type="button"
                    onClick={() => jumpToReplayMoment(moment)}
                    className={cn(
                      "border px-2 py-0.5 text-[10px] font-semibold",
                      index === replayActiveMomentIndex
                        ? "border-[#E10600] bg-[#180707] text-[#FDEAEA]"
                        : "border-[#2D2D2D] bg-[#101010] text-[#959595] hover:border-[#7D2A28] hover:text-[#D4D4D4]"
                    )}
                    aria-label={`Jump to ${moment.title}`}
                  >
                    {moment.title}
                  </button>
                ))}
              </div>

              <div className="mt-2 max-h-24 overflow-y-auto pr-1 custom-scrollbar">
                <div className="grid gap-1 text-[10px] text-[#ABABAB] sm:grid-cols-2 lg:grid-cols-3">
                  {replayMarkers.map((marker) => (
                    <p key={`${marker.id}-legend`} className="inline-flex items-center gap-1">
                      <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: marker.color }} />
                      P{marker.livePosition} {marker.label}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 max-h-[250px] space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8D8D8D]">Sectors</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8D8D8D]">DRS Zones</p>
        </div>

        <div className="grid gap-1.5 md:grid-cols-[1.2fr_0.9fr]">
          <div className="space-y-1.5">
            {sectorIntel.map((segment) => {
              const isActive = activeSectorId === segment.id;

              return (
                <button
                  key={segment.id}
                  type="button"
                  aria-pressed={isActive}
                  onFocus={() => activateSector(segment.id)}
                  onClick={() => activateSector(segment.id)}
                  className={cn(
                    "w-full border px-2.5 py-2 text-left transition-colors",
                    isActive
                      ? "border-[#E10600] bg-[#180707] text-[#FBE8E8]"
                      : "border-[#2A2A2A] bg-[#0D0D0D] text-[#A4A4A4] hover:border-[#7D2A28] hover:text-[#D2D2D2]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black tracking-[0.08em]">{segment.name}</p>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#C3C3C3]">
                      {segment.turnRange}
                    </p>
                  </div>
                  <p className="mt-0.5 text-[9px] font-semibold leading-snug text-[#919191]">
                    {segment.lengthPct}% lap share
                  </p>
                  <p className="mt-0.5 text-[9px] font-medium leading-snug text-[#B1B1B1]">{segment.phaseFocus}</p>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {drsFractions.map((_, index) => {
              const drsId = `DRS-${index + 1}`;
              const isActive = activeDrsId === drsId;

              return (
                <button
                  key={drsId}
                  type="button"
                  aria-pressed={isActive}
                  onFocus={() => activateDrs(drsId)}
                  onClick={() => activateDrs(drsId)}
                  className={cn(
                    "min-w-0 border px-2 py-2 text-left transition-colors",
                    isActive
                      ? "border-[#E10600] bg-[#180707] text-[#FBE8E8]"
                      : "border-[#2A2A2A] bg-[#0D0D0D] text-[#A4A4A4] hover:border-[#7D2A28] hover:text-[#D2D2D2]"
                  )}
                >
                  <p className="text-[10px] font-black tracking-[0.08em] text-[#E10600]">{drsId.replace("-", " ")}</p>
                  <p className="mt-0.5 text-[9px] font-semibold leading-tight text-[#8B8B8B]">Detection + Activation</p>
                </button>
              );
            })}
          </div>
        </div>

        {selectedSectorIntel ? (
          <div className="border border-[#2A2A2A] bg-[#0C0C0C] p-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8D8D8D]">Focused Sector Briefing</p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#EFEFEF]">
              {selectedSectorIntel.name} · {selectedSectorIntel.turnRange}
            </p>
            <p className="mt-1 text-[11px] font-medium leading-snug text-[#C4C4C4]">{selectedSectorIntel.telemetry}</p>
            <p className="mt-2 text-[10px] font-semibold leading-snug text-[#AFAFAF]">{selectedSectorIntel.pressureProfile}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
