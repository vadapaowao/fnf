"use client";

import { motion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import type { TrackSector } from "@/lib/f1";
import { cn } from "@/lib/utils";

type TrackMapProps = {
  circuitId: string;
  trackSvgPath: string | null;
  className?: string;
  sectors?: TrackSector[];
  drsZoneCount?: number | string;
};

type TrackSvgData = {
  viewBox: string;
  pathData: string;
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

const TRACK_LAYOUTS: Record<string, TrackLayout> = {
  bahrain: { sectorStops: [0, 0.34, 0.67, 1], drsFractions: [0.14, 0.46, 0.81] },
  jeddah: { sectorStops: [0, 0.33, 0.66, 1], drsFractions: [0.12, 0.43, 0.76] },
  albert_park: { sectorStops: [0, 0.31, 0.64, 1], drsFractions: [0.16, 0.49, 0.78] },
  suzuka: { sectorStops: [0, 0.36, 0.7, 1], drsFractions: [0.18] }
};

const DEFAULT_LAYOUT: TrackLayout = {
  sectorStops: [0, 0.33, 0.66, 1],
  drsFractions: [0.2, 0.55]
};

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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
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

function resolveMainTrackPath(parsed: Document, svgText: string): string | null {
  const strokeOnlyClasses = parseStrokeOnlyClasses(svgText);
  const allPaths = Array.from(parsed.querySelectorAll("path[d]"));

  if (allPaths.length === 0) {
    return null;
  }

  const ranked = allPaths
    .map((pathElement) => {
      const d = pathElement.getAttribute("d")?.trim() ?? "";
      const classNames = (pathElement.getAttribute("class") ?? "")
        .split(/\s+/)
        .map((className) => className.trim())
        .filter(Boolean);

      const isStrokePath = classNames.some((className) => strokeOnlyClasses.has(className));

      return {
        d,
        score: (isStrokePath ? 100000 : 0) + d.length
      };
    })
    .filter((entry) => entry.d.length > 0)
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.d ?? null;
}

export default function TrackMap({ circuitId, trackSvgPath, className, sectors, drsZoneCount }: TrackMapProps) {
  const [svgData, setSvgData] = useState<TrackSvgData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeSectorId, setActiveSectorId] = useState<TrackSector["id"] | null>(null);
  const [activeDrsId, setActiveDrsId] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ x: 12, y: 12 });
  const [pathLength, setPathLength] = useState(0);

  const pathRef = useRef<SVGPathElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);

  const layout = useMemo(() => TRACK_LAYOUTS[circuitId] ?? DEFAULT_LAYOUT, [circuitId]);

  const sectorSegments = useMemo<SectorDisplay[]>(() => {
    const sourceSectors = sectors && sectors.length === 3 ? sectors : DEFAULT_SECTORS;

    return layout.sectorStops.slice(0, 3).map((start, index) => {
      const source = sourceSectors[index] ?? DEFAULT_SECTORS[index];
      const end = layout.sectorStops[index + 1];

      return {
        id: source.id,
        name: source.name,
        telemetry: source.telemetry,
        start,
        end
      };
    });
  }, [layout.sectorStops, sectors]);

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

        if (!viewBox || !pathData) {
          throw new Error("Invalid SVG shape");
        }

        if (!isCancelled) {
          setSvgData({ viewBox, pathData });
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

  const selectedSector = useMemo(() => {
    if (activeSectorId) {
      return sectorSegments.find((segment) => segment.id === activeSectorId) ?? null;
    }

    return null;
  }, [activeSectorId, sectorSegments]);

  const tooltipCopy = useMemo(() => {
    if (activeDrsId) {
      return {
        title: `${activeDrsId.replace("-", " ")} Window`,
        body: "Detection plus deployment segment optimized for top-speed release."
      };
    }

    if (selectedSector) {
      return {
        title: selectedSector.name,
        body: selectedSector.telemetry
      };
    }

    return null;
  }, [activeDrsId, selectedSector]);

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

  const activateSector = (sectorId: TrackSector["id"], fromTrack = false) => {
    if (!fromTrack) {
      setTooltipPosition({ x: 12, y: 12 });
    }

    setActiveDrsId(null);
    setActiveSectorId(sectorId);
  };

  const activateDrs = (drsId: string, fromTrack = false) => {
    if (!fromTrack) {
      setTooltipPosition({ x: 12, y: 12 });
    }

    setActiveSectorId(null);
    setActiveDrsId(drsId);
  };

  const clearSelection = () => {
    setActiveSectorId(null);
    setActiveDrsId(null);
  };

  if (isLoading) {
    return (
      <div className={cn("border border-[#2A2A2A] bg-[#090909] p-3", className)}>
        <div className="h-[clamp(300px,42vw,520px)] animate-pulse border border-[#1B1B1B] bg-[#0E0E0E]" />
      </div>
    );
  }

  if (hasError || !svgData) {
    return (
      <div className={cn("border border-[#2A2A2A] bg-[#090909] p-3", className)}>
        <div className="flex h-[clamp(300px,42vw,520px)] items-center justify-center border border-[#1E1E1E] bg-[#080808] px-6">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8E8E8E]">
            Track map unavailable for this circuit.
          </p>
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
          onClick={clearSelection}
          className="border border-[#2A2A2A] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#9B9B9B] hover:border-[#4A4A4A] hover:text-[#D0D0D0]"
        >
          Reset
        </button>
      </div>

      <div ref={frameRef} className="relative overflow-hidden border border-[#1E1E1E] bg-[#080808]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:28px_28px]" />

        <svg
          viewBox={svgData.viewBox}
          preserveAspectRatio="xMidYMid meet"
          className="relative h-[clamp(300px,42vw,520px)] w-full"
          role="img"
          aria-label={`${circuitId.replace(/_/g, " ")} track map`}
        >
          <motion.path
            ref={pathRef}
            d={svgData.pathData}
            fill="none"
            stroke="#1C1C1C"
            strokeWidth={6.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          <motion.path
            d={svgData.pathData}
            fill="none"
            stroke="#E10600"
            strokeWidth={6.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ filter: "drop-shadow(0 0 8px rgba(225,6,0,0.45))" }}
          />

          {pathLength > 0 &&
            sectorSegments.map((segment) => {
              const segmentLength = Math.max((segment.end - segment.start) * pathLength, 1);
              const dashArray = `${segmentLength} ${Math.max(pathLength - segmentLength, 1)}`;
              const dashOffset = -segment.start * pathLength;
              const isActive = activeSectorId === segment.id;

              return (
                <g key={segment.id}>
                  <path
                    d={svgData.pathData}
                    fill="none"
                    stroke={isActive ? "#FF5D55" : "rgba(225,6,0,0.38)"}
                    strokeWidth={isActive ? 8.4 : 7.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    style={isActive ? { filter: "drop-shadow(0 0 10px rgba(225,6,0,0.55))" } : undefined}
                    pointerEvents="none"
                  />

                  <path
                    d={svgData.pathData}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={22}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    onMouseEnter={() => activateSector(segment.id, true)}
                    onMouseMove={updateTooltipPosition}
                  />
                </g>
              );
            })}

          {pathLength > 0 &&
            drsSegments.map((segment) => {
              const segmentLength = Math.max((segment.end - segment.start) * pathLength, 1);
              const dashArray = `${segmentLength} ${Math.max(pathLength - segmentLength, 1)}`;
              const dashOffset = -segment.start * pathLength;
              const isActive = activeDrsId === segment.id;

              return (
                <path
                  key={segment.id}
                  d={svgData.pathData}
                  fill="none"
                  stroke={isActive ? "#FFD4D2" : "rgba(225,6,0,0.22)"}
                  strokeWidth={isActive ? 9 : 7.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  style={isActive ? { filter: "drop-shadow(0 0 9px rgba(225,6,0,0.45))" } : undefined}
                  pointerEvents="none"
                />
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
                  onMouseEnter={() => activateDrs(point.id, true)}
                  onMouseMove={updateTooltipPosition}
                />
              </g>
            );
          })}
        </svg>

        {tooltipCopy ? (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="pointer-events-none absolute z-10 max-w-[240px] border border-[#3A3A3A] bg-[#080808] px-3 py-2"
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
          </motion.div>
        ) : null}
      </div>

      <div className="mt-3 space-y-2">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8D8D8D]">Sectors</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#8D8D8D]">DRS Zones</p>
        </div>

        <div className="grid gap-2 md:grid-cols-[1.25fr_1fr]">
          <div className="grid grid-cols-3 gap-2">
            {sectorSegments.map((segment) => {
              const isActive = activeSectorId === segment.id;

              return (
                <button
                  key={segment.id}
                  type="button"
                  aria-pressed={isActive}
                  onFocus={() => activateSector(segment.id)}
                  onClick={() => activateSector(segment.id)}
                  className={cn(
                    "border px-3 py-3 text-left transition-colors",
                    isActive
                      ? "border-[#E10600] bg-[#180707] text-[#FBE8E8]"
                      : "border-[#2A2A2A] bg-[#0D0D0D] text-[#A4A4A4] hover:border-[#7D2A28] hover:text-[#D2D2D2]"
                  )}
                >
                  <p className="text-[11px] font-black tracking-[0.08em]">{segment.name}</p>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
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
                    "min-w-0 border px-3 py-3 text-left transition-colors",
                    isActive
                      ? "border-[#E10600] bg-[#180707] text-[#FBE8E8]"
                      : "border-[#2A2A2A] bg-[#0D0D0D] text-[#A4A4A4] hover:border-[#7D2A28] hover:text-[#D2D2D2]"
                  )}
                >
                  <p className="text-[11px] font-black tracking-[0.08em] text-[#E10600]">{drsId.replace("-", " ")}</p>
                  <p className="mt-1 text-[10px] font-semibold leading-tight text-[#8B8B8B]">Activation</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
