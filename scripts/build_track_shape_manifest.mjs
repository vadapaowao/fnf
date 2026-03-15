import { promises as fs } from "fs";
import path from "path";

const projectRoot = process.cwd();
const tracksDir = path.join(projectRoot, "public", "tracks");
const outputPath = path.join(projectRoot, "lib", "track-shapes.ts");

const CANONICAL_TRACKS = [
  "albert_park",
  "americas",
  "bahrain",
  "baku",
  "catalunya",
  "hungaroring",
  "imola",
  "interlagos",
  "jeddah",
  "las_vegas",
  "losail",
  "marina_bay",
  "miami",
  "monaco",
  "monza",
  "red_bull_ring",
  "rodriguez",
  "shanghai",
  "silverstone",
  "spa",
  "suzuka",
  "villeneuve",
  "yas_marina",
  "zandvoort"
];

function parseStrokeOnlyClasses(svgText) {
  const classes = new Set();
  const styleBlocks = Array.from(svgText.matchAll(/\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g));

  for (const [, className, rules] of styleBlocks) {
    const normalizedRules = rules.toLowerCase().replace(/\s+/g, "");
    if (normalizedRules.includes("stroke:") && normalizedRules.includes("fill:none")) {
      classes.add(className);
    }
  }

  return classes;
}

function parseFillNoneClasses(svgText) {
  const classes = new Set();
  const styleBlocks = Array.from(svgText.matchAll(/\.([a-zA-Z0-9_-]+)\s*\{([^}]*)\}/g));

  for (const [, className, rules] of styleBlocks) {
    const normalizedRules = rules.toLowerCase().replace(/\s+/g, "");
    if (normalizedRules.includes("fill:none")) {
      classes.add(className);
    }
  }

  return classes;
}

function parseStrokeWidth(value) {
  if (!value) {
    return null;
  }

  const numeric = Number(String(value).trim());
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function resolvePrimarySubpath(d) {
  const chunks = d.match(/[Mm][^Mm]*/g);

  if (!chunks || chunks.length <= 1) {
    return d.trim();
  }

  return chunks.sort((left, right) => right.length - left.length)[0]?.trim() ?? d.trim();
}

function parseSvgDimension(rawValue) {
  if (!rawValue) {
    return null;
  }

  const match = String(rawValue).match(/-?\d+(\.\d+)?/);
  if (!match) {
    return null;
  }

  const numeric = Number(match[0]);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function readAttribute(attributes, name) {
  const direct = attributes.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*"([^"]*)"`, "i"));
  if (direct?.[1]) {
    return direct[1];
  }

  const singleQuoted = attributes.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*'([^']*)'`, "i"));
  return singleQuoted?.[1] ?? null;
}

function extractPathEntries(svgText) {
  const strokeOnlyClasses = parseStrokeOnlyClasses(svgText);
  const fillNoneClasses = parseFillNoneClasses(svgText);
  const paths = Array.from(svgText.matchAll(/<path\b([^>]*)>/gi));

  return paths
    .map((match) => {
      const attributes = match[1] ?? "";
      const d = readAttribute(attributes, "d")?.trim() ?? "";
      const stroke = readAttribute(attributes, "stroke")?.trim()?.toLowerCase() ?? "";
      const fill = readAttribute(attributes, "fill")?.trim()?.toLowerCase() ?? "";
      const strokeWidth = parseStrokeWidth(readAttribute(attributes, "stroke-width"));
      const classNames = (readAttribute(attributes, "class") ?? "")
        .split(/\s+/)
        .map((value) => value.trim())
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
        score: pathScore
      };
    })
    .filter((entry) => entry.d.length > 0)
    .sort((left, right) => right.score - left.score);
}

function resolveViewBox(svgText) {
  const svgTagMatch = svgText.match(/<svg\b([^>]*)>/i);
  const svgAttributes = svgTagMatch?.[1] ?? "";
  const viewBox = readAttribute(svgAttributes, "viewBox")?.trim();

  if (viewBox) {
    return viewBox;
  }

  const width = parseSvgDimension(readAttribute(svgAttributes, "width"));
  const height = parseSvgDimension(readAttribute(svgAttributes, "height"));

  if (width && height) {
    return `0 0 ${width} ${height}`;
  }

  return null;
}

function resolveNativeStrokeWidth(svgText) {
  const widths = Array.from(svgText.matchAll(/stroke-width\s*=\s*["']([^"']+)["']/gi))
    .map((match) => parseStrokeWidth(match[1]))
    .filter((value) => value !== null);

  if (widths.length === 0) {
    return null;
  }

  return widths.sort((left, right) => right - left)[0] ?? null;
}

async function buildManifest() {
  const manifest = {};

  for (const trackId of CANONICAL_TRACKS) {
    const filePath = path.join(tracksDir, `${trackId}.svg`);
    const svgText = await fs.readFile(filePath, "utf8");
    const viewBox = resolveViewBox(svgText);
    const mainPath = extractPathEntries(svgText)[0]?.d ?? null;

    if (!viewBox || !mainPath) {
      throw new Error(`Unable to parse track SVG for ${trackId}`);
    }

    manifest[trackId] = {
      viewBox,
      pathData: mainPath,
      nativeStrokeWidth: resolveNativeStrokeWidth(svgText)
    };
  }

  const fileContents = `export type TrackShape = {
  viewBox: string;
  pathData: string;
  nativeStrokeWidth: number | null;
};

export const TRACK_SHAPES: Record<string, TrackShape> = ${JSON.stringify(manifest, null, 2)};\n`;

  await fs.writeFile(outputPath, fileContents, "utf8");
}

await buildManifest();
