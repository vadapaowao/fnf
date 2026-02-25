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

type SegmentPath = {
  id: string;
  pathData: string;
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
      return [] as SegmentPath[];
    }

    return sectorSegments
      .map((segment) => {
        const pathData = buildSegmentPolyline(element, pathLength, segment.start, segment.end);

        if (!pathData) {
          return null;
        }

        return { id: segment.id, pathData };
      })
      .filter((segment): segment is SegmentPath => segment !== null);
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
    const native = svgData?.nativeStrokeWidth;

    if (!native) {
      return {
        base: 6.2,
        red: 6.8,
        sector: 7.2,
        sectorActive: 8.4,
        drs: 7.4,
        drsActive: 9,
        hitbox: 22
      };
    }

    const base = clamp(native * 0.88, 5, 9.2);

    return {
      base,
      red: base + 0.6,
      sector: base + 1,
      sectorActive: base + 2.2,
      drs: base + 1.2,
      drsActive: base + 2.8,
      hitbox: clamp(base + 15, 18, 26)
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
                    onMouseEnter={() => activateSector(segment.id, true)}
                    onMouseMove={updateTooltipPosition}
                  />
                </g>
              );
            })}

          {pathLength > 0 &&
            drsPaths.map((segment) => {
              const isActive = activeDrsId === segment.id;

              return isActive ? (
                <path
                  key={segment.id}
                  d={segment.pathData}
                  fill="none"
                  stroke="#FFD4D2"
                  strokeWidth={strokeScale.drsActive}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ filter: "drop-shadow(0 0 9px rgba(225,6,0,0.45))" }}
                  pointerEvents="none"
                />
              ) : null;
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
