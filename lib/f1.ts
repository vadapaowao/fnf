import { getOpenF1RaceRecap, getOpenF1RaceReplay, getOpenF1SessionResultSummary } from "@/lib/openf1";
import { getFastF1RaceBundle } from "@/lib/fastf1-data";
import { getFeaturedRace } from "@/lib/f1-product";
import { HISTORICAL_CIRCUIT_STATS } from "@/lib/circuit-history";

export const F1_SEASON = "2026";
const REVALIDATE_SECONDS = 3600;
const ERGAST_BASE_URL = "https://api.jolpi.ca/ergast/f1";
const UNAVAILABLE = "Data unavailable";
const RACE_CALENDAR_CACHE_TTL_MS = 60 * 60 * 1000;
const HISTORICAL_STATS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FINISHED_RACE_REPLAY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const FINISHED_SESSION_RESULTS_CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Generate F1 official driver image URL
 * Format: https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/{Initial}/{DRIVERID}_FullName/driverid.png.transform/2col/image.png
 */
export function getDriverImageUrl(driver: { driverId: string; givenName: string; familyName: string }): string {
  const initial = driver.familyName.charAt(0).toUpperCase();
  const fullNameFormatted = `${driver.givenName}_${driver.familyName}`;
  const driverIdUpper = driver.driverId.toUpperCase();

  // Construct the official F1 media URL
  return `https://media.formula1.com/d_driver_fallback_image.png/content/dam/fom-website/drivers/${initial}/${driverIdUpper}_${fullNameFormatted}/${driver.driverId}.png.transform/2col/image.png`;
}

export type Race = {
  season: string;
  round: string;
  raceName: string;
  circuitId: string;
  apiCircuitId?: string;
  circuitName: string;
  country: string;
  locality: string;
  date: string;
  time: string;
  sessionStarts?: Partial<Record<RaceSessionCode, string>>;
  status?: "scheduled" | "canceled";
};

export type TrackSector = {
  id: "S1" | "S2" | "S3";
  name: string;
  telemetry: string;
};

export type RaceSessionCode = "FP1" | "FP2" | "FP3" | "SQ" | "SPRINT" | "QUALI" | "RACE";

export type RaceSession = {
  code: RaceSessionCode;
  label: string;
  startsAt: string;
  resultLabel?: string;
  resultValue?: string;
  officialUrl?: string;
};

export type WinnerStat = {
  driver: string;
  constructor: string;
  year: string;
};

export type FastestLapStat = {
  driver: string;
  time: string;
  year: string;
};

export type RaceRecapMoment = {
  title: string;
  detail: string;
  checkpointMs?: number;
};

export type RaceRecapSectorInsight = {
  sector: "S1" | "S2" | "S3";
  summary: string;
};

export type RaceRecapPodiumEntry = {
  position: 1 | 2 | 3;
  driver: string;
  constructor: string;
};

export type RaceRecap = {
  headline: string;
  winnerStory: string;
  keyMoments: RaceRecapMoment[];
  sectorNarrative: RaceRecapSectorInsight[];
  podium: RaceRecapPodiumEntry[];
  decisivePitWindow: string;
  biggestGainer: {
    driver: string;
    positionsGained: number;
    started: number;
    finished: number;
  } | null;
  fastestLap: {
    driver: string;
    lapTime: string;
    lap: string;
  } | null;
};

export type RaceReplayDriverTrace = {
  driverId: string;
  code: string;
  name: string;
  constructor: string;
  finishPosition: number;
  cumulativeMs: number[];
};

export type RaceReplayHighlight = {
  id: string;
  title: string;
  detail: string;
  checkpointMs: number;
};

export type RaceReplayData = {
  totalLaps: number;
  totalRaceMs: number;
  traces: RaceReplayDriverTrace[];
  winnerDriverId: string | null;
  highlights?: RaceReplayHighlight[];
};

export type RaceDetail = {
  race: Race;
  circuit: {
    circuitId: string;
    name: string;
    location: string;
    country: string;
    lengthKm: string;
    turns: string;
    drsZones: string;
    firstGrandPrix: string;
    trackSvgPath: string | null;
    sectors: TrackSector[];
  };
  stats: {
    lastWinner: WinnerStat;
    fastestLap: FastestLapStat;
  };
};

export type RacePageBundle = {
  races: Race[];
  race: Race;
  detail: RaceDetail;
  recap: RaceRecap | null;
  replay: RaceReplayData | null;
  sessions: RaceSession[];
};

export type Driver = {
  driverId: string;
  permanentNumber: string;
  code: string;
  givenName: string;
  familyName: string;
  dateOfBirth: string;
  nationality: string;
};

export type Constructor = {
  constructorId: string;
  name: string;
  nationality: string;
};

// API response types
type ErgastDriversResponse = {
  MRData: {
    DriverTable: {
      Drivers: {
        driverId: string;
        permanentNumber?: string;
        code: string;
        givenName: string;
        familyName: string;
        dateOfBirth: string;
        nationality: string;
      }[];
    };
  };
};

export type DriverStanding = {
  position: string;
  points: string;
  wins: string;
  driver: Driver;
  constructors: Constructor[];
};

export type ConstructorStanding = {
  position: string;
  points: string;
  wins: string;
  constructor: Constructor;
};

export type DriverCareerEvent = {
  year: string;
  team: string;
  event: string;
  active?: boolean;
  highlight?: boolean;
};

export type DriverCareerStats = {
  totalWins: number;
  totalPodiums: number;
  totalPoles: number;
  championships: number;
  currentTeam: string;
  currentTeamId: string;
};

export type TeamStatistics = {
  constructorChampionships: number;
  driversChampionships: number;
  raceWins: number;
  polePositions: number;
  firstEntry: string;
};

type ErgastRace = {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time?: string;
  FirstPractice?: { date?: string; time?: string };
  SecondPractice?: { date?: string; time?: string };
  ThirdPractice?: { date?: string; time?: string };
  Qualifying?: { date?: string; time?: string };
  Sprint?: { date?: string; time?: string };
  SprintQualifying?: { date?: string; time?: string };
  SprintShootout?: { date?: string; time?: string };
  Circuit: {
    circuitId: string;
    circuitName: string;
    Location: {
      locality: string;
      country: string;
    };
  };
};

type ErgastScheduleResponse = {
  MRData?: {
    RaceTable?: {
      season?: string;
      Races?: ErgastRace[];
    };
  };
};

type ErgastResult = {
  Driver?: {
    givenName?: string;
    familyName?: string;
  };
  Constructor?: {
    name?: string;
  };
  FastestLap?: {
    Time?: {
      time?: string;
    };
  };
};

type ErgastResultRace = {
  season: string;
  round: string;
  Results?: ErgastResult[];
};

type ErgastResultResponse = {
  MRData?: {
    RaceTable?: {
      Races?: ErgastResultRace[];
    };
  };
};

type ErgastRaceResultEntry = {
  position?: string;
  grid?: string;
  laps?: string;
  status?: string;
  Driver?: {
    driverId?: string;
    code?: string;
    givenName?: string;
    familyName?: string;
  };
  Constructor?: {
    constructorId?: string;
    name?: string;
  };
  Time?: {
    time?: string;
  };
  FastestLap?: {
    rank?: string;
    lap?: string;
    Time?: {
      time?: string;
    };
  };
};

type ErgastRaceResultsResponse = {
  MRData?: {
    RaceTable?: {
      Races?: Array<{
        Results?: ErgastRaceResultEntry[];
      }>;
    };
  };
};

type ErgastPitStopResponse = {
  MRData?: {
    RaceTable?: {
      Races?: Array<{
        PitStops?: Array<{
          driverId?: string;
          lap?: string;
          stop?: string;
          duration?: string;
        }>;
      }>;
    };
  };
};

type ErgastLapTimingEntry = {
  driverId?: string;
  position?: string;
  time?: string;
};

type ErgastLapsResponse = {
  MRData?: {
    limit?: string;
    offset?: string;
    total?: string;
    RaceTable?: {
      Races?: Array<{
        Laps?: Array<{
          number?: string;
          Timings?: ErgastLapTimingEntry[];
        }>;
      }>;
    };
  };
};

type CircuitStatic = {
  lengthKm: string;
  turns: string;
  drsZones: number;
  firstGrandPrix: string;
  trackSvgFile: string;
};

type OfficialResultsRoute = {
  raceId: string;
  slug: string;
};

function normalizeOfficialSlugToken(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function buildOfficialRouteMatchTokens(race: Pick<Race, "raceName" | "circuitName" | "locality" | "country">) {
  const rawTokens = [
    race.raceName,
    race.circuitName,
    race.locality,
    race.country,
    race.raceName.replace(/\bgrand prix\b/gi, ""),
    race.country === "United Kingdom" ? "Great Britain" : null,
    race.country === "United States" ? "USA" : null
  ]
    .filter((token): token is string => Boolean(token))
    .map((token) => normalizeOfficialSlugToken(token))
    .filter(Boolean);

  return new Set(rawTokens);
}

const OFFICIAL_RESULTS_BASE = "https://www.formula1.com";
const SPRINT_WEEKEND_CIRCUITS_2026 = new Set(["shanghai", "miami", "villeneuve", "silverstone", "zandvoort", "marina_bay"]);
const SESSION_RESULTS_REVALIDATE_SECONDS = 60;
const OFFICIAL_ROUTES_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const officialResultsRoutesCache = new Map<string, { createdAt: number; promise: Promise<OfficialResultsRoute[]> }>();
const raceCalendarCache = new Map<string, { createdAt: number; promise: Promise<Race[]> }>();
const historicalWinnerCache = new Map<string, { createdAt: number; value: WinnerStat }>();
const historicalFastestLapCache = new Map<string, { createdAt: number; value: FastestLapStat }>();
const finishedRaceRecapCache = new Map<string, { createdAt: number; promise: Promise<RaceRecap | null> }>();
const finishedRaceReplayCache = new Map<string, { createdAt: number; promise: Promise<RaceReplayData | null> }>();
const finishedSessionResultCache = new Map<
  string,
  {
    createdAt: number;
    promise: Promise<Pick<RaceSession, "resultLabel" | "resultValue" | "officialUrl"> | null>;
  }
>();
const liveSessionResultCache = new Map<
  string,
  {
    createdAt: number;
    promise: Promise<Pick<RaceSession, "resultLabel" | "resultValue" | "officialUrl"> | null>;
  }
>();

// Temporary fallback: only used for missing rounds when the 2026 endpoint is partial/unavailable.
const TEMP_FALLBACK_2026_SCHEDULED_CALENDAR: Race[] = [
  {
    season: "2026",
    round: "1",
    raceName: "Australian Grand Prix",
    circuitId: "albert_park",
    circuitName: "Albert Park Grand Prix Circuit",
    country: "Australia",
    locality: "Melbourne",
    date: "2026-03-08",
    time: "04:00:00Z"
  },
  {
    season: "2026",
    round: "2",
    raceName: "Chinese Grand Prix",
    circuitId: "shanghai",
    circuitName: "Shanghai International Circuit",
    country: "China",
    locality: "Shanghai",
    date: "2026-03-15",
    time: "07:00:00Z"
  },
  {
    season: "2026",
    round: "3",
    raceName: "Japanese Grand Prix",
    circuitId: "suzuka",
    circuitName: "Suzuka Circuit",
    country: "Japan",
    locality: "Suzuka",
    date: "2026-03-29",
    time: "05:00:00Z"
  },
  {
    season: "2026",
    round: "4",
    raceName: "Miami Grand Prix",
    circuitId: "miami",
    circuitName: "Miami International Autodrome",
    country: "United States",
    locality: "Miami",
    date: "2026-05-03",
    time: "20:00:00Z"
  },
  {
    season: "2026",
    round: "5",
    raceName: "Canadian Grand Prix",
    circuitId: "villeneuve",
    circuitName: "Circuit Gilles-Villeneuve",
    country: "Canada",
    locality: "Montreal",
    date: "2026-05-24",
    time: "20:00:00Z"
  },
  {
    season: "2026",
    round: "6",
    raceName: "Monaco Grand Prix",
    circuitId: "monaco",
    circuitName: "Circuit de Monaco",
    country: "Monaco",
    locality: "Monte Carlo",
    date: "2026-06-07",
    time: "13:00:00Z"
  },
  {
    season: "2026",
    round: "7",
    raceName: "Barcelona Grand Prix",
    circuitId: "catalunya",
    circuitName: "Circuit de Barcelona-Catalunya",
    country: "Spain",
    locality: "Barcelona",
    date: "2026-06-14",
    time: "13:00:00Z"
  },
  {
    season: "2026",
    round: "8",
    raceName: "Austrian Grand Prix",
    circuitId: "red_bull_ring",
    circuitName: "Red Bull Ring",
    country: "Austria",
    locality: "Spielberg",
    date: "2026-06-28",
    time: "13:00:00Z"
  },
  {
    season: "2026",
    round: "9",
    raceName: "British Grand Prix",
    circuitId: "silverstone",
    circuitName: "Silverstone Circuit",
    country: "United Kingdom",
    locality: "Silverstone",
    date: "2026-07-05",
    time: "14:00:00Z"
  },
  {
    season: "2026",
    round: "10",
    raceName: "Belgian Grand Prix",
    circuitId: "spa",
    circuitName: "Circuit de Spa-Francorchamps",
    country: "Belgium",
    locality: "Spa",
    date: "2026-07-19",
    time: "13:00:00Z"
  },
  {
    season: "2026",
    round: "11",
    raceName: "Hungarian Grand Prix",
    circuitId: "hungaroring",
    circuitName: "Hungaroring",
    country: "Hungary",
    locality: "Budapest",
    date: "2026-07-26",
    time: "13:00:00Z"
  },
  {
    season: "2026",
    round: "12",
    raceName: "Dutch Grand Prix",
    circuitId: "zandvoort",
    circuitName: "Circuit Zandvoort",
    country: "Netherlands",
    locality: "Zandvoort",
    date: "2026-08-23",
    time: "13:00:00Z"
  },
  {
    season: "2026",
    round: "13",
    raceName: "Italian Grand Prix",
    circuitId: "monza",
    circuitName: "Autodromo Nazionale Monza",
    country: "Italy",
    locality: "Monza",
    date: "2026-09-06",
    time: "13:00:00Z"
  },
  {
    season: "2026",
    round: "14",
    raceName: "Spanish Grand Prix",
    circuitId: "madring",
    circuitName: "Madring",
    country: "Spain",
    locality: "Madrid",
    date: "2026-09-13",
    time: "13:00:00Z"
  },
  {
    season: "2026",
    round: "15",
    raceName: "Azerbaijan Grand Prix",
    circuitId: "baku",
    circuitName: "Baku City Circuit",
    country: "Azerbaijan",
    locality: "Baku",
    date: "2026-09-26",
    time: "11:00:00Z"
  },
  {
    season: "2026",
    round: "16",
    raceName: "Singapore Grand Prix",
    circuitId: "marina_bay",
    circuitName: "Marina Bay Street Circuit",
    country: "Singapore",
    locality: "Singapore",
    date: "2026-10-11",
    time: "12:00:00Z"
  },
  {
    season: "2026",
    round: "17",
    raceName: "United States Grand Prix",
    circuitId: "americas",
    circuitName: "Circuit of the Americas",
    country: "United States",
    locality: "Austin",
    date: "2026-10-25",
    time: "20:00:00Z"
  },
  {
    season: "2026",
    round: "18",
    raceName: "Mexico City Grand Prix",
    circuitId: "rodriguez",
    circuitName: "Autodromo Hermanos Rodriguez",
    country: "Mexico",
    locality: "Mexico City",
    date: "2026-11-01",
    time: "20:00:00Z"
  },
  {
    season: "2026",
    round: "19",
    raceName: "Brazilian Grand Prix",
    circuitId: "interlagos",
    circuitName: "Autodromo Jose Carlos Pace",
    country: "Brazil",
    locality: "Sao Paulo",
    date: "2026-11-08",
    time: "17:00:00Z"
  },
  {
    season: "2026",
    round: "20",
    raceName: "Las Vegas Grand Prix",
    circuitId: "las_vegas",
    circuitName: "Las Vegas Strip Circuit",
    country: "United States",
    locality: "Las Vegas",
    date: "2026-11-22",
    time: "04:00:00Z"
  },
  {
    season: "2026",
    round: "21",
    raceName: "Qatar Grand Prix",
    circuitId: "losail",
    circuitName: "Lusail International Circuit",
    country: "Qatar",
    locality: "Lusail",
    date: "2026-11-29",
    time: "16:00:00Z"
  },
  {
    season: "2026",
    round: "22",
    raceName: "Abu Dhabi Grand Prix",
    circuitId: "yas_marina",
    circuitName: "Yas Marina Circuit",
    country: "United Arab Emirates",
    locality: "Abu Dhabi",
    date: "2026-12-06",
    time: "13:00:00Z"
  }
];

const TEMP_CANCELED_2026_CALENDAR: Race[] = [
  {
    season: "2026",
    round: "",
    raceName: "Bahrain Grand Prix",
    circuitId: "bahrain",
    circuitName: "Bahrain International Circuit",
    country: "Bahrain",
    locality: "Sakhir",
    date: "2026-04-12",
    time: "15:00:00Z",
    status: "canceled"
  },
  {
    season: "2026",
    round: "",
    raceName: "Saudi Arabian Grand Prix",
    circuitId: "jeddah",
    circuitName: "Jeddah Corniche Circuit",
    country: "Saudi Arabia",
    locality: "Jeddah",
    date: "2026-04-19",
    time: "17:00:00Z",
    status: "canceled"
  }
];

const CIRCUIT_STATIC: Record<string, CircuitStatic> = {
  albert_park: { lengthKm: "5.278", turns: "14", drsZones: 4, firstGrandPrix: "1996", trackSvgFile: "albert_park.svg" },
  jeddah: { lengthKm: "6.174", turns: "27", drsZones: 3, firstGrandPrix: "2021", trackSvgFile: "jeddah.svg" },
  bahrain: { lengthKm: "5.412", turns: "15", drsZones: 3, firstGrandPrix: "2004", trackSvgFile: "bahrain.svg" },
  suzuka: { lengthKm: "5.807", turns: "18", drsZones: 1, firstGrandPrix: "1987", trackSvgFile: "suzuka.svg" },
  shanghai: { lengthKm: "5.451", turns: "16", drsZones: 2, firstGrandPrix: "2004", trackSvgFile: "shanghai.svg" },
  miami: { lengthKm: "5.412", turns: "19", drsZones: 3, firstGrandPrix: "2022", trackSvgFile: "miami.svg" },
  imola: { lengthKm: "4.909", turns: "19", drsZones: 1, firstGrandPrix: "1980", trackSvgFile: "imola.svg" },
  monaco: { lengthKm: "3.337", turns: "19", drsZones: 1, firstGrandPrix: "1950", trackSvgFile: "monaco.svg" },
  catalunya: { lengthKm: "4.657", turns: "14", drsZones: 2, firstGrandPrix: "1991", trackSvgFile: "catalunya.svg" },
  villeneuve: { lengthKm: "4.361", turns: "14", drsZones: 3, firstGrandPrix: "1978", trackSvgFile: "villeneuve.svg" },
  red_bull_ring: { lengthKm: "4.318", turns: "10", drsZones: 3, firstGrandPrix: "1970", trackSvgFile: "red_bull_ring.svg" },
  silverstone: { lengthKm: "5.891", turns: "18", drsZones: 2, firstGrandPrix: "1950", trackSvgFile: "silverstone.svg" },
  spa: { lengthKm: "7.004", turns: "19", drsZones: 2, firstGrandPrix: "1950", trackSvgFile: "spa.svg" },
  hungaroring: { lengthKm: "4.381", turns: "14", drsZones: 2, firstGrandPrix: "1986", trackSvgFile: "hungaroring.svg" },
  zandvoort: { lengthKm: "4.259", turns: "14", drsZones: 2, firstGrandPrix: "1952", trackSvgFile: "zandvoort.svg" },
  monza: { lengthKm: "5.793", turns: "11", drsZones: 2, firstGrandPrix: "1950", trackSvgFile: "monza.svg" },
  baku: { lengthKm: "6.003", turns: "20", drsZones: 2, firstGrandPrix: "2016", trackSvgFile: "baku.svg" },
  marina_bay: { lengthKm: "4.940", turns: "19", drsZones: 3, firstGrandPrix: "2008", trackSvgFile: "marina_bay.svg" },
  americas: { lengthKm: "5.513", turns: "20", drsZones: 2, firstGrandPrix: "2012", trackSvgFile: "americas.svg" },
  rodriguez: { lengthKm: "4.304", turns: "17", drsZones: 3, firstGrandPrix: "1963", trackSvgFile: "rodriguez.svg" },
  interlagos: { lengthKm: "4.309", turns: "15", drsZones: 2, firstGrandPrix: "1973", trackSvgFile: "interlagos.svg" },
  las_vegas: { lengthKm: "6.201", turns: "17", drsZones: 2, firstGrandPrix: "2023", trackSvgFile: "las_vegas.svg" },
  losail: { lengthKm: "5.419", turns: "16", drsZones: 1, firstGrandPrix: "2021", trackSvgFile: "losail.svg" },
  yas_marina: { lengthKm: "5.281", turns: "16", drsZones: 2, firstGrandPrix: "2009", trackSvgFile: "yas_marina.svg" }
};

const CIRCUIT_TIMEZONES: Record<string, string> = {
  albert_park: "Australia/Melbourne",
  jeddah: "Asia/Riyadh",
  bahrain: "Asia/Bahrain",
  suzuka: "Asia/Tokyo",
  shanghai: "Asia/Shanghai",
  miami: "America/New_York",
  imola: "Europe/Rome",
  monaco: "Europe/Monaco",
  catalunya: "Europe/Madrid",
  villeneuve: "America/Toronto",
  red_bull_ring: "Europe/Vienna",
  silverstone: "Europe/London",
  spa: "Europe/Brussels",
  hungaroring: "Europe/Budapest",
  zandvoort: "Europe/Amsterdam",
  monza: "Europe/Rome",
  baku: "Asia/Baku",
  marina_bay: "Asia/Singapore",
  americas: "America/Chicago",
  rodriguez: "America/Mexico_City",
  interlagos: "America/Sao_Paulo",
  las_vegas: "America/Los_Angeles",
  losail: "Asia/Qatar",
  yas_marina: "Asia/Dubai"
};

const DEFAULT_SECTORS: TrackSector[] = [
  {
    id: "S1",
    name: "Sector 1",
    telemetry: "Launch-limited opening section with high setup sensitivity."
  },
  {
    id: "S2",
    name: "Sector 2",
    telemetry: "High-speed middle sector where drag and stability decide lap delta."
  },
  {
    id: "S3",
    name: "Sector 3",
    telemetry: "Low-speed exits and braking zones with traction-critical deployment."
  }
];

const SECTOR_IDS: TrackSector["id"][] = ["S1", "S2", "S3"];

const CIRCUIT_SECTOR_COPY: Record<string, TrackSector[]> = {
  jeddah: [
    {
      id: "S1",
      name: "Sector 1",
      telemetry: "Flat-out sweeps; minimum steering delay on entry is critical."
    },
    {
      id: "S2",
      name: "Sector 2",
      telemetry: "Long acceleration arcs; DRS deployment timing decides top speed."
    },
    {
      id: "S3",
      name: "Sector 3",
      telemetry: "Heavy braking into late rotation; rear stability defines exit pace."
    }
  ]
};

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

function normalizeTrackSectors(sectors: TrackSector[] | undefined): TrackSector[] {
  const source = sectors && sectors.length > 0 ? sectors : DEFAULT_SECTORS;
  const byId = new Map<TrackSector["id"], TrackSector>();

  source.forEach((sector, index) => {
    const slotId =
      canonicalizeSectorId(sector.id) ??
      canonicalizeSectorId(sector.name) ??
      SECTOR_IDS[index] ??
      null;

    if (!slotId || byId.has(slotId)) {
      return;
    }

    byId.set(slotId, { ...sector, id: slotId });
  });

  return SECTOR_IDS.map((sectorId, index) => {
    const fallback = DEFAULT_SECTORS[index] ?? DEFAULT_SECTORS[2];
    const sourceSector = byId.get(sectorId) ?? source[index] ?? fallback;

    return {
      id: sectorId,
      name: sourceSector.name || fallback.name,
      telemetry: sourceSector.telemetry || fallback.telemetry
    };
  });
}

let hasLoggedCalendarValidation = false;

function toCircuitKey(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function resolveCanonicalCircuitId(race: Pick<Race, "circuitId" | "circuitName" | "raceName" | "country">): string {
  const rawId = toCircuitKey(race.circuitId);
  const circuitName = toCircuitKey(race.circuitName);
  const raceName = toCircuitKey(race.raceName);
  const country = toCircuitKey(race.country);
  const haystack = `${rawId}_${circuitName}_${raceName}_${country}`;

  const directAliases: Record<string, string> = {
    albert_park: "albert_park",
    melbourne_grand_prix_circuit: "albert_park",
    jeddah: "jeddah",
    jeddah_corniche_circuit: "jeddah",
    bahrain: "bahrain",
    bahrain_international_circuit: "bahrain",
    suzuka: "suzuka",
    suzuka_circuit: "suzuka",
    shanghai: "shanghai",
    shanghai_international_circuit: "shanghai",
    miami: "miami",
    miami_international_autodrome: "miami",
    imola: "imola",
    autodromo_enzo_e_dino_ferrari: "imola",
    monaco: "monaco",
    circuit_de_monaco: "monaco",
    gilles_villeneuve: "villeneuve",
    circuit_gilles_villeneuve: "villeneuve",
    catalunya: "catalunya",
    barcelona_catalunya: "catalunya",
    red_bull_ring: "red_bull_ring",
    spielberg: "red_bull_ring",
    silverstone: "silverstone",
    hungaroring: "hungaroring",
    spa: "spa",
    spa_francorchamps: "spa",
    zandvoort: "zandvoort",
    monza: "monza",
    baku: "baku",
    marina_bay: "marina_bay",
    americas: "americas",
    circuit_of_the_americas: "americas",
    rodriguez: "rodriguez",
    hermanos_rodriguez: "rodriguez",
    interlagos: "interlagos",
    jose_carlos_pace: "interlagos",
    vegas: "las_vegas",
    las_vegas: "las_vegas",
    las_vegas_strip: "las_vegas",
    las_vegas_strip_circuit: "las_vegas",
    losail: "losail",
    lusail: "losail",
    yas_marina: "yas_marina"
  };

  const directHit = directAliases[rawId] ?? directAliases[circuitName];

  if (directHit) {
    return directHit;
  }

  if (haystack.includes("monaco")) {
    return "monaco";
  }

  if (haystack.includes("monza")) {
    return "monza";
  }

  if (haystack.includes("villeneuve")) {
    return "villeneuve";
  }

  if (haystack.includes("catalunya") || haystack.includes("barcelona")) {
    return "catalunya";
  }

  if (haystack.includes("americas") || haystack.includes("austin")) {
    return "americas";
  }

  if (haystack.includes("hermanos") || haystack.includes("rodriguez") || haystack.includes("mexico")) {
    return "rodriguez";
  }

  if (haystack.includes("interlagos") || haystack.includes("jose_carlos_pace") || haystack.includes("sao_paulo")) {
    return "interlagos";
  }

  if (haystack.includes("las_vegas") || haystack.includes("vegas")) {
    return "las_vegas";
  }

  if (haystack.includes("losail") || haystack.includes("lusail") || haystack.includes("qatar")) {
    return "losail";
  }

  if (haystack.includes("yas") || haystack.includes("abu_dhabi")) {
    return "yas_marina";
  }

  return rawId;
}

function hasValidRaceRound(round: string | null | undefined): round is string {
  return typeof round === "string" && /^\d+$/.test(round.trim());
}

export function isScheduledRace(race: Pick<Race, "round" | "status">): boolean {
  if (race.status === "canceled") {
    return false;
  }

  return hasValidRaceRound(race.round);
}

function normalizeRace(race: ErgastRace): Race {
  const sessionStarts = buildRaceSessionStartMap(race);
  const round = typeof race.round === "string" ? race.round.trim() : "";
  const status: Race["status"] = hasValidRaceRound(round) ? "scheduled" : "canceled";
  const raceBase = {
    season: race.season,
    round,
    raceName: race.raceName,
    circuitId: race.Circuit.circuitId,
    circuitName: race.Circuit.circuitName,
    country: race.Circuit.Location.country,
    locality: race.Circuit.Location.locality,
    date: race.date,
    time: race.time ?? "00:00:00Z",
    sessionStarts,
    status
  };

  return {
    ...raceBase,
    apiCircuitId: race.Circuit.circuitId,
    circuitId: resolveCanonicalCircuitId(raceBase)
  };
}

function getCachedPromise<T>(
  cache: Map<string, { createdAt: number; promise: Promise<T> }>,
  key: string,
  ttlMs: number,
  loader: () => Promise<T>
) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.createdAt < ttlMs) {
    return cached.promise;
  }

  const promise = loader();
  cache.set(key, {
    createdAt: Date.now(),
    promise
  });
  return promise;
}

function toSessionIso(value?: { date?: string; time?: string }) {
  if (!value?.date || !value?.time) {
    return null;
  }

  const iso = `${value.date}T${value.time}`;
  const parsed = new Date(iso);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function buildRaceSessionStartMap(race: ErgastRace): Partial<Record<RaceSessionCode, string>> {
  const sessionStarts: Partial<Record<RaceSessionCode, string>> = {};

  const fp1 = toSessionIso(race.FirstPractice);
  const fp2 = toSessionIso(race.SecondPractice);
  const fp3 = toSessionIso(race.ThirdPractice);
  const quali = toSessionIso(race.Qualifying);
  const sprint = toSessionIso(race.Sprint);
  const sprintQualifying = toSessionIso(race.SprintQualifying) ?? toSessionIso(race.SprintShootout);

  if (fp1) {
    sessionStarts.FP1 = fp1;
  }
  if (fp2) {
    sessionStarts.FP2 = fp2;
  }
  if (fp3) {
    sessionStarts.FP3 = fp3;
  }
  if (quali) {
    sessionStarts.QUALI = quali;
  }
  if (sprint) {
    sessionStarts.SPRINT = sprint;
  }
  if (sprintQualifying) {
    sessionStarts.SQ = sprintQualifying;
  }

  return sessionStarts;
}

function sortByRound(races: Race[]): Race[] {
  return [...races].sort((a, b) => {
    const roundA = hasValidRaceRound(a.round) ? Number(a.round) : Number.POSITIVE_INFINITY;
    const roundB = hasValidRaceRound(b.round) ? Number(b.round) : Number.POSITIVE_INFINITY;

    if (roundA !== roundB) {
      return roundA - roundB;
    }

    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  });
}

function mergeWithFallbackRaces(apiRaces: Race[]): Race[] {
  const scheduledRaces = apiRaces.filter(isScheduledRace);
  const canceledRaces = apiRaces.filter((race) => !isScheduledRace(race));

  const scheduledByIdentity = new Map<string, Race>();
  const scheduledRounds = new Set<string>();

  const getIdentityKey = (race: Race) => {
    const circuitKey = race.circuitId.trim().toLowerCase();
    if (circuitKey) {
      return `circuit:${circuitKey}`;
    }

    return `race:${race.raceName.trim().toLowerCase()}|${race.date}`;
  };

  for (const race of scheduledRaces) {
    scheduledByIdentity.set(getIdentityKey(race), race);
    scheduledRounds.add(race.round);
  }

  for (const fallbackRace of TEMP_FALLBACK_2026_SCHEDULED_CALENDAR) {
    const identityKey = getIdentityKey(fallbackRace);
    if (scheduledByIdentity.has(identityKey) || scheduledRounds.has(fallbackRace.round)) {
      continue;
    }

    scheduledByIdentity.set(identityKey, fallbackRace);
    scheduledRounds.add(fallbackRace.round);
  }

  const canceledByIdentity = new Map<string, Race>();
  const canceledSources = [...canceledRaces, ...TEMP_CANCELED_2026_CALENDAR];

  for (const race of canceledSources) {
    const identityKey = getIdentityKey(race);
    if (!canceledByIdentity.has(identityKey)) {
      canceledByIdentity.set(identityKey, { ...race, status: "canceled", round: "" });
    }
  }

  return [...sortByRound(Array.from(scheduledByIdentity.values())), ...Array.from(canceledByIdentity.values()).sort((a, b) => {
    return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
  })];
}

async function fetchJson<T>(url: string, revalidateSeconds: number = REVALIDATE_SECONDS): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: revalidateSeconds }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchText(url: string, revalidateSeconds: number = REVALIDATE_SECONDS): Promise<string | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: revalidateSeconds },
      headers: {
        "User-Agent": "SportsCore/1.0"
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.text();
  } catch {
    return null;
  }
}

async function fetchAllRaceLaps(season: string, round: string) {
  const lapsByNumber = new Map<string, Map<string, ErgastLapTimingEntry>>();
  let offset = 0;
  let limit = 100;
  let hasMore = true;
  let guard = 0;

  while (hasMore && guard < 200) {
    guard += 1;
    const page = await fetchJson<ErgastLapsResponse>(
      `${ERGAST_BASE_URL}/${season}/${round}/laps.json?limit=${limit}&offset=${offset}`
    );

    if (!page) {
      break;
    }

    const pageLaps = page.MRData?.RaceTable?.Races?.[0]?.Laps ?? [];
    for (const lap of pageLaps) {
      const lapNumber = lap.number?.trim();
      if (!lapNumber) {
        continue;
      }

      const lapTimings = lapsByNumber.get(lapNumber) ?? new Map<string, ErgastLapTimingEntry>();
      for (const timing of lap.Timings ?? []) {
        const driverId = timing.driverId?.trim();
        if (!driverId) {
          continue;
        }

        const existing = lapTimings.get(driverId);
        if (!existing) {
          lapTimings.set(driverId, { ...timing, driverId });
          continue;
        }

        if ((!existing.time || existing.time === "None") && timing.time && timing.time !== "None") {
          lapTimings.set(driverId, { ...existing, ...timing, driverId });
        }
      }

      lapsByNumber.set(lapNumber, lapTimings);
    }

    const pageLimit = parseNumeric(page.MRData?.limit) ?? limit;
    const pageOffset = parseNumeric(page.MRData?.offset) ?? offset;
    const pageTotal = parseNumeric(page.MRData?.total) ?? 0;
    const nextOffset = pageOffset + pageLimit;

    if (pageTotal <= nextOffset || nextOffset <= offset) {
      hasMore = false;
    } else {
      offset = nextOffset;
      limit = pageLimit;
    }
  }

  return Array.from(lapsByNumber.entries())
    .sort((a, b) => {
      const lapA = parseNumeric(a[0]) ?? Number.POSITIVE_INFINITY;
      const lapB = parseNumeric(b[0]) ?? Number.POSITIVE_INFINITY;
      return lapA - lapB;
    })
    .map(([number, timingsMap]) => ({
      number,
      Timings: Array.from(timingsMap.values()).sort((a, b) => {
        const posA = parseNumeric(a.position) ?? Number.POSITIVE_INFINITY;
        const posB = parseNumeric(b.position) ?? Number.POSITIVE_INFINITY;
        if (posA !== posB) {
          return posA - posB;
        }
        return (a.driverId ?? "").localeCompare(b.driverId ?? "");
      })
    }));
}

function formatDriverName(result?: ErgastResult): string {
  const first = result?.Driver?.givenName?.trim();
  const last = result?.Driver?.familyName?.trim();

  if (!first && !last) {
    return UNAVAILABLE;
  }

  return [first, last].filter(Boolean).join(" ");
}

function pickLatestRace(races: ErgastResultRace[]): ErgastResultRace | null {
  if (races.length === 0) {
    return null;
  }

  const sorted = [...races].sort((a, b) => {
    const seasonDiff = Number(b.season) - Number(a.season);
    if (seasonDiff !== 0) {
      return seasonDiff;
    }

    return Number(b.round) - Number(a.round);
  });

  return sorted[0] ?? null;
}

function lapTimeToMilliseconds(lapTime: string): number {
  const normalized = lapTime.trim();
  if (!normalized) {
    return Number.POSITIVE_INFINITY;
  }

  if (!normalized.includes(":")) {
    const secondsOnly = Number(normalized);
    return Number.isFinite(secondsOnly) && secondsOnly > 0
      ? Math.round(secondsOnly * 1000)
      : Number.POSITIVE_INFINITY;
  }

  const [minutesPart, secondsPart] = normalized.split(":");

  if (!minutesPart || !secondsPart) {
    return Number.POSITIVE_INFINITY;
  }

  const minutes = Number(minutesPart);
  const seconds = Number(secondsPart);

  if (!Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.round(minutes * 60 * 1000 + seconds * 1000);
}

function resolveTrackSvgPath(circuitId: string): string | null {
  const file = CIRCUIT_STATIC[circuitId]?.trackSvgFile;
  return file ? `/tracks/${file}` : null;
}

export function getTrackSvgPathByCircuitId(circuitId: string): string | null {
  return resolveTrackSvgPath(circuitId);
}

function resolveCircuitStatic(circuitId: string) {
  const staticData = CIRCUIT_STATIC[circuitId];

  return {
    lengthKm: staticData?.lengthKm ?? UNAVAILABLE,
    turns: staticData?.turns ?? UNAVAILABLE,
    drsZones: staticData ? String(staticData.drsZones) : UNAVAILABLE,
    firstGrandPrix: staticData?.firstGrandPrix ?? UNAVAILABLE,
    trackSvgPath: resolveTrackSvgPath(circuitId),
    sectors: normalizeTrackSectors(CIRCUIT_SECTOR_COPY[circuitId] ?? DEFAULT_SECTORS)
  };
}

async function fetchMostRecentWinner(circuitId: string): Promise<WinnerStat> {
  const data = await fetchJson<ErgastResultResponse>(
    `${ERGAST_BASE_URL}/circuits/${circuitId}/results/1.json?limit=200`
  );

  const races = data?.MRData?.RaceTable?.Races ?? [];
  const latestRace = pickLatestRace(races);
  const topResult = latestRace?.Results?.[0];

  return {
    driver: formatDriverName(topResult),
    constructor: topResult?.Constructor?.name ?? UNAVAILABLE,
    year: latestRace?.season ?? UNAVAILABLE
  };
}

function isWinnerUnavailable(stat: WinnerStat) {
  return stat.driver === UNAVAILABLE || stat.year === UNAVAILABLE;
}

async function fetchFastestLap(circuitId: string): Promise<FastestLapStat> {
  const data = await fetchJson<ErgastResultResponse>(
    `${ERGAST_BASE_URL}/circuits/${circuitId}/fastest/1/results.json?limit=200`
  );

  const races = data?.MRData?.RaceTable?.Races ?? [];

  const candidates = races
    .map((race) => {
      const result = race.Results?.[0];
      const lapTime = result?.FastestLap?.Time?.time;

      return {
        race,
        driver: formatDriverName(result),
        lapTime: lapTime ?? UNAVAILABLE,
        lapMs: lapTime ? lapTimeToMilliseconds(lapTime) : Number.POSITIVE_INFINITY
      };
    })
    .filter((candidate) => candidate.lapTime !== UNAVAILABLE);

  const best = candidates.sort((a, b) => a.lapMs - b.lapMs)[0];

  if (!best) {
    return {
      driver: UNAVAILABLE,
      time: UNAVAILABLE,
      year: UNAVAILABLE
    };
  }

  return {
    driver: best.driver,
    time: best.lapTime,
    year: best.race.season
  };
}

function isFastestLapUnavailable(stat: FastestLapStat) {
  return stat.driver === UNAVAILABLE || stat.time === UNAVAILABLE || stat.year === UNAVAILABLE;
}

async function getHistoricalWinner(circuitId: string) {
  const cached = historicalWinnerCache.get(circuitId);
  if (cached && Date.now() - cached.createdAt < HISTORICAL_STATS_CACHE_TTL_MS) {
    return cached.value;
  }

  const live = await fetchMostRecentWinner(circuitId);
  if (!isWinnerUnavailable(live)) {
    historicalWinnerCache.set(circuitId, { createdAt: Date.now(), value: live });
    return live;
  }

  if (cached && !isWinnerUnavailable(cached.value)) {
    return cached.value;
  }

  const fallback = HISTORICAL_CIRCUIT_STATS[circuitId]?.winner;
  if (fallback && !isWinnerUnavailable(fallback)) {
    historicalWinnerCache.set(circuitId, { createdAt: Date.now(), value: fallback });
    return fallback;
  }

  return live;
}

async function getHistoricalFastestLap(circuitId: string) {
  const cached = historicalFastestLapCache.get(circuitId);
  if (cached && Date.now() - cached.createdAt < HISTORICAL_STATS_CACHE_TTL_MS) {
    return cached.value;
  }

  const live = await fetchFastestLap(circuitId);
  if (!isFastestLapUnavailable(live)) {
    historicalFastestLapCache.set(circuitId, { createdAt: Date.now(), value: live });
    return live;
  }

  if (cached && !isFastestLapUnavailable(cached.value)) {
    return cached.value;
  }

  const fallback = HISTORICAL_CIRCUIT_STATS[circuitId]?.fastestLap;
  if (fallback && !isFastestLapUnavailable(fallback)) {
    historicalFastestLapCache.set(circuitId, { createdAt: Date.now(), value: fallback });
    return fallback;
  }

  return live;
}

export async function getRaceCalendar(): Promise<Race[]> {
  return getCachedPromise(raceCalendarCache, F1_SEASON, RACE_CALENDAR_CACHE_TTL_MS, async () => {
    const data = await fetchJson<ErgastScheduleResponse>(`${ERGAST_BASE_URL}/${F1_SEASON}.json`);

    const apiRaces = data?.MRData?.RaceTable?.Races?.map(normalizeRace) ?? [];
    const mergedRaces = mergeWithFallbackRaces(apiRaces);

    if (!hasLoggedCalendarValidation) {
      const fetchedSeason = apiRaces[0]?.season ?? "none";
      const roundOne = mergedRaces.find((race) => race.round === "1");

      console.log(`[f1] requested season: ${F1_SEASON}; fetched season: ${fetchedSeason}`);
      console.log(`[f1] 2026 race count: ${mergedRaces.length}`);

      if (roundOne) {
        console.log(`[f1] round 1 check: ${roundOne.raceName} (${roundOne.date})`);
      }

      hasLoggedCalendarValidation = true;
    }

    return mergedRaces;
  });
}

export async function getRaceByRound(round: string): Promise<Race | null> {
  const races = await getRaceCalendar();
  return races.find((race) => isScheduledRace(race) && race.round === round) ?? null;
}

async function buildRaceDetail(race: Race): Promise<RaceDetail> {
  const [historicalWinner, historicalFastestLap] = await Promise.all([
    getHistoricalWinner(race.apiCircuitId ?? race.circuitId),
    getHistoricalFastestLap(race.apiCircuitId ?? race.circuitId)
  ]);
  const circuitStatic = resolveCircuitStatic(race.circuitId);

  return {
    race,
    circuit: {
      circuitId: race.circuitId,
      name: race.circuitName,
      location: race.locality,
      country: race.country,
      lengthKm: circuitStatic.lengthKm,
      turns: circuitStatic.turns,
      drsZones: circuitStatic.drsZones,
      firstGrandPrix: circuitStatic.firstGrandPrix,
      trackSvgPath: circuitStatic.trackSvgPath,
      sectors: circuitStatic.sectors
    },
    stats: {
      lastWinner: historicalWinner,
      fastestLap: historicalFastestLap
    }
  };
}

export async function getRaceDetailByRound(round: string): Promise<RaceDetail | null> {
  const race = await getRaceByRound(round);

  if (!race) {
    return null;
  }

  return buildRaceDetail(race);
}

async function buildRacePageBundle(races: Race[], race: Race): Promise<RacePageBundle> {
  const recapPromise = isRaceFinished(race) ? getCachedFinishedRaceRecap(race) : buildRaceRecap(race);
  const replayPromise = isRaceFinished(race) ? getCachedFinishedRaceReplay(race) : buildRaceReplay(race);
  const [detail, recap, replay, sessions] = await Promise.all([
    buildRaceDetail(race),
    recapPromise,
    replayPromise,
    getRaceWeekendSessionsWithResults(race)
  ]);

  return {
    races,
    race,
    detail,
    recap,
    replay,
    sessions
  };
}

export async function getFeaturedRaceBundle(): Promise<RacePageBundle | null> {
  const races = (await getRaceCalendar()).filter(isScheduledRace);
  const race = getFeaturedRace(races) ?? races[0] ?? null;

  if (!race) {
    return null;
  }

  return buildRacePageBundle(races, race);
}

export async function getRacePageBundle(round: string): Promise<RacePageBundle | null> {
  const races = (await getRaceCalendar()).filter(isScheduledRace);
  const race = races.find((entry) => entry.round === round) ?? null;

  if (!race) {
    return null;
  }

  return buildRacePageBundle(races, race);
}

export function getRaceDateTimeIso(race: Pick<Race, "date" | "time">): string {
  return `${race.date}T${race.time}`;
}

export function getCircuitTimeZone(circuitId: string): string {
  return CIRCUIT_TIMEZONES[circuitId] ?? "UTC";
}

export function formatRaceDateTime(date: string, time: string): string {
  const eventDate = new Date(getRaceDateTimeIso({ date, time }));

  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short"
  }).format(eventDate);
}

export function formatRaceWeekendRange(date: string): string {
  const raceDate = new Date(`${date}T00:00:00Z`);
  const weekendStart = new Date(raceDate);
  weekendStart.setUTCDate(raceDate.getUTCDate() - 2);

  const sameMonth = weekendStart.getUTCMonth() === raceDate.getUTCMonth();
  const sameYear = weekendStart.getUTCFullYear() === raceDate.getUTCFullYear();

  const startDay = weekendStart.getUTCDate();
  const endDay = raceDate.getUTCDate();

  const startMonth = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(weekendStart);
  const endMonth = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" }).format(raceDate);
  const endYear = raceDate.getUTCFullYear();

  if (sameMonth && sameYear) {
    return `${startDay}-${endDay} ${endMonth} ${endYear}`;
  }

  return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${endYear}`;
}

export function isUpcomingRace(race: Pick<Race, "date" | "time" | "status">): boolean {
  if (race.status === "canceled") {
    return false;
  }

  return new Date(getRaceDateTimeIso(race)).getTime() >= Date.now();
}

function isRaceFinished(race: Pick<Race, "date" | "time" | "status">) {
  if (race.status === "canceled") {
    return false;
  }

  const raceStartMs = new Date(getRaceDateTimeIso(race)).getTime();

  if (!Number.isFinite(raceStartMs)) {
    return false;
  }

  return Date.now() >= raceStartMs + getRaceSessionDurationMs("RACE");
}

function isSprintWeekend(race: Pick<Race, "season" | "circuitId" | "sessionStarts">) {
  if (race.sessionStarts?.SPRINT || race.sessionStarts?.SQ) {
    return true;
  }

  return race.season === "2026" && SPRINT_WEEKEND_CIRCUITS_2026.has(race.circuitId);
}

export function getRaceSessionDurationMs(sessionCode: RaceSessionCode) {
  if (sessionCode === "RACE") {
    return 3 * 60 * 60 * 1000;
  }

  if (sessionCode === "QUALI" || sessionCode === "SQ") {
    return 2 * 60 * 60 * 1000;
  }

  if (sessionCode === "SPRINT") {
    return 75 * 60 * 1000;
  }

  return 90 * 60 * 1000;
}

export function getRaceSessionResultHydrationDelayMs(sessionCode: RaceSessionCode) {
  if (sessionCode === "RACE") {
    return 105 * 60 * 1000;
  }

  if (sessionCode === "SPRINT") {
    return 45 * 60 * 1000;
  }

  if (sessionCode === "QUALI" || sessionCode === "SQ") {
    return 75 * 60 * 1000;
  }

  return 90 * 60 * 1000;
}

function getOfficialSessionSlug(code: RaceSessionCode) {
  if (code === "FP1") return "practice/1";
  if (code === "FP2") return "practice/2";
  if (code === "FP3") return "practice/3";
  if (code === "SQ") return "sprint-qualifying";
  if (code === "SPRINT") return "sprint-results";
  if (code === "QUALI") return "qualifying";
  return "race-result";
}

function getCompletedSessionResultLabel(code: RaceSessionCode) {
  if (code === "RACE") return "Winner";
  if (code === "SPRINT") return "Sprint Winner";
  if (code === "QUALI" || code === "SQ") return "P1";
  return "Fastest";
}

function stripHtmlToText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSessionWinnerName(html: string) {
  const text = stripHtmlToText(html).replace(/[\u00A0\u202F\u2007]/g, " ");

  if (text.includes("No results are currently available")) {
    return null;
  }

  const numberedMatch = text.match(/\b1\s+\d+\s+([A-Z][A-Za-z'’.\-]+(?:\s+[A-Z][A-Za-z'’.\-]+)+)\s+[A-Z]{3}\b/);
  if (numberedMatch?.[1]) {
    return numberedMatch[1].trim();
  }

  const directMatch = text.match(/\b1\s+([A-Z][A-Za-z'’.\-]+(?:\s+[A-Z][A-Za-z'’.\-]+)+)\s+[A-Z]{3}\b/);
  return directMatch?.[1]?.trim() ?? null;
}

async function fetchOfficialResultsRoutes(season: string): Promise<OfficialResultsRoute[]> {
  const cached = officialResultsRoutesCache.get(season);
  if (cached && Date.now() - cached.createdAt < OFFICIAL_ROUTES_CACHE_TTL_MS) {
    return cached.promise;
  }

  const request = (async () => {
  const html = await fetchText(`${OFFICIAL_RESULTS_BASE}/en/results/${season}/races`, SESSION_RESULTS_REVALIDATE_SECONDS);

  if (!html) {
    return [];
  }

  const matches = Array.from(html.matchAll(new RegExp(`/en/results/${season}/races/(\\d+)/([a-z0-9-]+)/race-result`, "g")));
  const seen = new Set<string>();
  const routes: OfficialResultsRoute[] = [];

  for (const match of matches) {
    const raceId = match[1]?.trim();
    const slug = match[2]?.trim();

    if (!raceId || !slug) {
      continue;
    }

    const key = `${raceId}:${slug}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    routes.push({ raceId, slug });
  }

    return routes;
  })();

  officialResultsRoutesCache.set(season, {
    createdAt: Date.now(),
    promise: request
  });
  return request;
}

async function getOfficialResultsRouteForRace(
  race: Pick<Race, "season" | "round" | "raceName" | "circuitName" | "locality" | "country">
): Promise<OfficialResultsRoute | null> {
  const routes = await fetchOfficialResultsRoutes(race.season);
  const matchTokens = buildOfficialRouteMatchTokens(race);
  const matchedRoute = routes.find((route) => {
    const normalizedSlug = normalizeOfficialSlugToken(route.slug);

    if (matchTokens.has(normalizedSlug)) {
      return true;
    }

    return Array.from(matchTokens).some((token) => normalizedSlug.includes(token) || token.includes(normalizedSlug));
  });

  if (matchedRoute) {
    return matchedRoute;
  }

  const index = Math.max(Number(race.round) - 1, 0);

  return routes[index] ?? null;
}

async function fetchRaceWinnerFromApi(race: Pick<Race, "season" | "round">): Promise<string | null> {
  const data = await fetchJson<ErgastRaceResultsResponse>(
    `${ERGAST_BASE_URL}/${race.season}/${race.round}/results/1.json`,
    SESSION_RESULTS_REVALIDATE_SECONDS
  );
  const winner = data?.MRData?.RaceTable?.Races?.[0]?.Results?.[0];
  const driverName = formatResultDriverName(winner);

  return driverName === UNAVAILABLE ? null : driverName;
}

async function fetchCircuitWinnerFallback(race: Pick<Race, "circuitId" | "apiCircuitId">): Promise<string | null> {
  const latestWinner = await getHistoricalWinner(race.apiCircuitId ?? race.circuitId);

  return latestWinner.driver === UNAVAILABLE ? null : latestWinner.driver;
}

async function buildSessionResultValue(
  race: Race,
  sessionCode: RaceSessionCode
): Promise<Pick<RaceSession, "resultLabel" | "resultValue" | "officialUrl"> | null> {
  const openF1Fallback = race.season === F1_SEASON ? await getOpenF1SessionResultSummary(race, sessionCode) : null;
  const shouldPreferOpenF1 = race.season === F1_SEASON;
  const route = await getOfficialResultsRouteForRace(race);

  if (shouldPreferOpenF1 && openF1Fallback) {
    return {
      ...openF1Fallback,
      officialUrl: route
        ? `${OFFICIAL_RESULTS_BASE}/en/results/${race.season}/races/${route.raceId}/${route.slug}/${getOfficialSessionSlug(sessionCode)}`
        : undefined
    };
  }

  if (!route) {
    if (openF1Fallback) {
      return openF1Fallback;
    }

    if (sessionCode === "RACE") {
      const raceWinner = await fetchRaceWinnerFromApi(race);
      if (raceWinner) {
        return {
          resultLabel: getCompletedSessionResultLabel(sessionCode),
          resultValue: raceWinner
        };
      }

      const circuitWinner = await fetchCircuitWinnerFallback(race);
      if (circuitWinner) {
        return {
          resultLabel: getCompletedSessionResultLabel(sessionCode),
          resultValue: circuitWinner
        };
      }
    }

    return null;
  }

  const sessionSlug = getOfficialSessionSlug(sessionCode);
  const officialUrl = `${OFFICIAL_RESULTS_BASE}/en/results/${race.season}/races/${route.raceId}/${route.slug}/${sessionSlug}`;
  const html = await fetchText(officialUrl, SESSION_RESULTS_REVALIDATE_SECONDS);

  if (html) {
    const winnerName = extractSessionWinnerName(html);

    if (winnerName) {
      return {
        resultLabel: getCompletedSessionResultLabel(sessionCode),
        resultValue: winnerName,
        officialUrl
      };
    }
  }

  if (openF1Fallback) {
    return {
      ...openF1Fallback,
      officialUrl
    };
  }

  if (sessionCode === "RACE") {
    const raceWinner = await fetchRaceWinnerFromApi(race);
    if (raceWinner) {
      return {
        resultLabel: getCompletedSessionResultLabel(sessionCode),
        resultValue: raceWinner,
        officialUrl
      };
    }

    const circuitWinner = await fetchCircuitWinnerFallback(race);
    if (circuitWinner) {
      return {
        resultLabel: getCompletedSessionResultLabel(sessionCode),
        resultValue: circuitWinner,
        officialUrl
      };
    }
  }

  return {
    resultLabel: getCompletedSessionResultLabel(sessionCode),
    resultValue: UNAVAILABLE,
    officialUrl
  };
}

async function getSessionResultValue(
  race: Race,
  sessionCode: RaceSessionCode,
  cacheMode: "live" | "finished"
) {
  const cache = cacheMode === "finished" ? finishedSessionResultCache : liveSessionResultCache;
  const ttlMs = cacheMode === "finished" ? FINISHED_SESSION_RESULTS_CACHE_TTL_MS : SESSION_RESULTS_REVALIDATE_SECONDS * 1000;
  const cacheKey = `${cacheMode}:${race.season}:${race.round}:${sessionCode}:${race.circuitId}`;

  return getCachedPromise(cache, cacheKey, ttlMs, () => buildSessionResultValue(race, sessionCode));
}

export function getRaceWeekendSessions(race: Pick<Race, "date" | "time" | "season" | "circuitId" | "sessionStarts">): RaceSession[] {
  const raceStart = new Date(getRaceDateTimeIso(race));

  const withOffset = (hoursOffset: number) => {
    return new Date(raceStart.getTime() + hoursOffset * 60 * 60 * 1000).toISOString();
  };

  const getSessionStart = (code: RaceSessionCode, fallbackOffsetHours: number) => {
    return race.sessionStarts?.[code] ?? withOffset(fallbackOffsetHours);
  };

  if (isSprintWeekend(race)) {
    return [
      { code: "FP1", label: "Practice 1", startsAt: getSessionStart("FP1", -51.5) },
      { code: "SQ", label: "Sprint Qualifying", startsAt: getSessionStart("SQ", -47.5) },
      { code: "SPRINT", label: "Sprint", startsAt: getSessionStart("SPRINT", -28) },
      { code: "QUALI", label: "Qualifying", startsAt: getSessionStart("QUALI", -24) },
      { code: "RACE", label: "Race", startsAt: getSessionStart("RACE", 0) }
    ];
  }

  return [
    { code: "FP1", label: "Practice 1", startsAt: getSessionStart("FP1", -52) },
    { code: "FP2", label: "Practice 2", startsAt: getSessionStart("FP2", -48) },
    { code: "FP3", label: "Practice 3", startsAt: getSessionStart("FP3", -28) },
    { code: "QUALI", label: "Qualifying", startsAt: getSessionStart("QUALI", -24) },
    { code: "RACE", label: "Race", startsAt: getSessionStart("RACE", 0) }
  ];
}

export async function getRaceWeekendSessionsWithResults(
  race: Race
): Promise<RaceSession[]> {
  const sessions = getRaceWeekendSessions(race);
  const nowMs = Date.now();
  const cacheMode = isRaceFinished(race) ? "finished" : "live";

  const hydrated = await Promise.all(
    sessions.map(async (session) => {
      const sessionStartMs = new Date(session.startsAt).getTime();
      const resultHydrationThresholdMs = sessionStartMs + getRaceSessionResultHydrationDelayMs(session.code);

      if (!Number.isFinite(resultHydrationThresholdMs) || nowMs < resultHydrationThresholdMs) {
        return session;
      }

      const result = await getSessionResultValue(race, session.code, cacheMode);

      return {
        ...session,
        ...result
      };
    })
  );

  return hydrated;
}

function parseNumeric(value?: string): number | null {
  if (!value) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatResultDriverName(entry?: ErgastRaceResultEntry): string {
  const first = entry?.Driver?.givenName?.trim();
  const last = entry?.Driver?.familyName?.trim();

  if (!first && !last) {
    return UNAVAILABLE;
  }

  return [first, last].filter(Boolean).join(" ");
}

function buildSectorRecapNarrative(
  race: Race,
  winnerName: string,
  fastestLapDriver: string
): RaceRecapSectorInsight[] {
  const staticData = CIRCUIT_STATIC[race.circuitId];
  const turnCount = staticData?.turns ?? "multiple";
  const drsZoneCount = staticData?.drsZones ?? 2;

  return [
    {
      sector: "S1",
      summary: `${winnerName} managed launch and opening rotation cleanly through a ${turnCount}-turn profile, protecting track position early.`
    },
    {
      sector: "S2",
      summary: `Mid-lap pace centered on drag-versus-stability balance with ${drsZoneCount} DRS zone${drsZoneCount === 1 ? "" : "s"} shaping overtaking pressure.`
    },
    {
      sector: "S3",
      summary: `${fastestLapDriver} benchmarked the closing phase where braking precision and traction release decided final lap-time deltas.`
    }
  ];
}

async function buildRaceRecap(race: Race): Promise<RaceRecap | null> {
  if (isUpcomingRace(race)) {
    return null;
  }

  const fastF1Bundle = await getFastF1RaceBundle(race.season, race.round);
  if (fastF1Bundle?.recap) {
    return fastF1Bundle.recap;
  }

  if (race.season === F1_SEASON) {
    const openF1Recap = await getOpenF1RaceRecap(race);
    if (openF1Recap) {
      return openF1Recap;
    }
  }

  const resultsData = await fetchJson<ErgastRaceResultsResponse>(
    `${ERGAST_BASE_URL}/${race.season}/${race.round}/results.json`
  );
  const resultEntries = resultsData?.MRData?.RaceTable?.Races?.[0]?.Results ?? [];

  if (resultEntries.length === 0) {
    return getOpenF1RaceRecap(race);
  }

  const classified = resultEntries
    .map((entry) => ({
      entry,
      finishPosition: parseNumeric(entry.position),
      gridPosition: parseNumeric(entry.grid),
    }))
    .filter((item) => item.finishPosition !== null)
    .sort((a, b) => (a.finishPosition ?? Number.POSITIVE_INFINITY) - (b.finishPosition ?? Number.POSITIVE_INFINITY));

  if (classified.length === 0) {
    return getOpenF1RaceRecap(race);
  }

  const winner = classified.find((item) => item.finishPosition === 1) ?? classified[0];
  const winnerName = formatResultDriverName(winner.entry);
  const winnerTeam = winner.entry.Constructor?.name ?? "Unknown Team";
  const winnerTime = winner.entry.Time?.time ? ` in ${winner.entry.Time.time}` : "";
  const second = classified.find((item) => item.finishPosition === 2);

  const pole = classified.find((item) => item.gridPosition === 1);
  const poleName = pole ? formatResultDriverName(pole.entry) : UNAVAILABLE;

  const biggestGainer = classified
    .map((item) => {
      if (item.gridPosition === null || item.finishPosition === null) {
        return null;
      }

      const positionsGained = item.gridPosition - item.finishPosition;
      if (positionsGained <= 0) {
        return null;
      }

      return {
        driver: formatResultDriverName(item.entry),
        positionsGained,
        started: item.gridPosition,
        finished: item.finishPosition,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => b.positionsGained - a.positionsGained)[0] ?? null;

  const fastestLapCandidates = classified
    .map((item) => {
      const lapTime = item.entry.FastestLap?.Time?.time;

      if (!lapTime) {
        return null;
      }

      return {
        driver: formatResultDriverName(item.entry),
        lapTime,
        lap: item.entry.FastestLap?.lap ?? "—",
        rank: parseNumeric(item.entry.FastestLap?.rank) ?? Number.POSITIVE_INFINITY,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const rankedFastestLap = fastestLapCandidates.find((item) => item.rank === 1);
  const fastestLap =
    rankedFastestLap ??
    fastestLapCandidates.sort((a, b) => lapTimeToMilliseconds(a.lapTime) - lapTimeToMilliseconds(b.lapTime))[0] ??
    null;

  const pitStopsData = await fetchJson<ErgastPitStopResponse>(
    `${ERGAST_BASE_URL}/${race.season}/${race.round}/pitstops.json?limit=500`
  );
  const pitStops = pitStopsData?.MRData?.RaceTable?.Races?.[0]?.PitStops ?? [];
  const pitLapCounts = new Map<number, number>();

  for (const stop of pitStops) {
    const lap = parseNumeric(stop.lap);
    if (lap === null) {
      continue;
    }

    pitLapCounts.set(lap, (pitLapCounts.get(lap) ?? 0) + 1);
  }

  const busiestPitLap = Array.from(pitLapCounts.entries()).sort((a, b) => b[1] - a[1])[0];
  const decisivePitWindow = busiestPitLap
    ? `Lap ${busiestPitLap[0]} became the strategy hinge with ${busiestPitLap[1]} recorded pit stop${busiestPitLap[1] === 1 ? "" : "s"}.`
    : "No pit-stop spike in feed; strategic separation came from stint pace consistency.";

  const finishGapText = second?.entry?.Time?.time
    ? `${winnerName} sealed victory with a margin of ${second.entry.Time.time} over ${formatResultDriverName(second.entry)}.`
    : `${winnerName} controlled the closing laps to secure the win.`;

  const fastestLapDriver = fastestLap?.driver ?? winnerName;
  const podium = classified
    .slice(0, 3)
    .map((item, index) => ({
      position: (index + 1) as 1 | 2 | 3,
      driver: formatResultDriverName(item.entry),
      constructor: item.entry.Constructor?.name ?? "Unknown Team"
    }));

  return {
    headline: `${winnerName} executed a complete race at ${race.circuitName}.`,
    winnerStory: `${winnerName} (${winnerTeam}) converted race rhythm${winnerTime} and held execution under pressure.`,
    podium,
    decisivePitWindow,
    biggestGainer,
    fastestLap,
    keyMoments: [
      {
        title: "Start Phase",
        detail:
          poleName === winnerName
            ? `${winnerName} launched from pole and protected the lead through the opening sequence.`
            : `${poleName} started from pole, while ${winnerName} built race control after the first phase.`
      },
      {
        title: "Strategy Swing",
        detail: decisivePitWindow
      },
      {
        title: "Biggest Charge",
        detail: biggestGainer
          ? `${biggestGainer.driver} gained ${biggestGainer.positionsGained} place${biggestGainer.positionsGained === 1 ? "" : "s"} (P${biggestGainer.started} to P${biggestGainer.finished}).`
          : "Field positions were largely stable, with limited net place gains across the top finishers."
      },
      {
        title: "Closing Stint",
        detail: finishGapText
      }
    ],
    sectorNarrative: buildSectorRecapNarrative(race, winnerName, fastestLapDriver),
  };
}

async function getCachedFinishedRaceRecap(race: Race) {
  const cacheKey = `${race.season}:${race.round}`;
  return getCachedPromise(finishedRaceRecapCache, cacheKey, FINISHED_RACE_REPLAY_CACHE_TTL_MS, () =>
    buildRaceRecap(race)
  );
}

export async function getRaceRecapByRound(round: string): Promise<RaceRecap | null> {
  const race = await getRaceByRound(round);

  if (!race) {
    return null;
  }

  if (isRaceFinished(race)) {
    return getCachedFinishedRaceRecap(race);
  }

  return buildRaceRecap(race);
}

async function buildRaceReplay(race: Race): Promise<RaceReplayData | null> {
  if (isUpcomingRace(race)) {
    return null;
  }

  const fastF1Bundle = await getFastF1RaceBundle(race.season, race.round);
  if (fastF1Bundle?.replay) {
    return fastF1Bundle.replay;
  }

  if (race.season === F1_SEASON) {
    const openF1Replay = await getOpenF1RaceReplay(race);
    if (openF1Replay) {
      return openF1Replay;
    }
  }

  const [resultsData, laps] = await Promise.all([
    fetchJson<ErgastRaceResultsResponse>(`${ERGAST_BASE_URL}/${race.season}/${race.round}/results.json`),
    fetchAllRaceLaps(race.season, race.round)
  ]);

  const resultEntries = resultsData?.MRData?.RaceTable?.Races?.[0]?.Results ?? [];

  if (resultEntries.length === 0) {
    return getOpenF1RaceReplay(race);
  }

  const orderedDrivers = resultEntries
    .map((entry) => {
      const driverId = entry.Driver?.driverId?.trim();
      if (!driverId) {
        return null;
      }

      return {
        driverId,
        position: parseNumeric(entry.position) ?? Number.POSITIVE_INFINITY,
        reportedLaps: parseNumeric(entry.laps) ?? null,
        code: entry.Driver?.code?.trim() || driverId.slice(0, 3).toUpperCase(),
        name: formatResultDriverName(entry),
        constructor: entry.Constructor?.name ?? "Unknown Team"
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((a, b) => a.position - b.position);

  const tracesByDriver = new Map<string, RaceReplayDriverTrace>();

  for (const driver of orderedDrivers) {
    tracesByDriver.set(driver.driverId, {
      driverId: driver.driverId,
      code: driver.code,
      name: driver.name,
      constructor: driver.constructor,
      finishPosition: driver.position,
      cumulativeMs: []
    });
  }

  const ensureTrace = (driverId: string) => {
    const existing = tracesByDriver.get(driverId);
    if (existing) {
      return existing;
    }

    const fallback = orderedDrivers.find((driver) => driver.driverId === driverId);
    const nextTrace: RaceReplayDriverTrace = {
      driverId,
      code: fallback?.code ?? driverId.slice(0, 3).toUpperCase(),
      name: fallback?.name ?? driverId,
      constructor: fallback?.constructor ?? "Unknown Team",
      finishPosition: fallback?.position ?? Number.POSITIVE_INFINITY,
      cumulativeMs: []
    };
    tracesByDriver.set(driverId, nextTrace);
    return nextTrace;
  };

  if (laps.length === 0) {
    return getOpenF1RaceReplay(race);
  }

  for (const lap of laps) {
    const timings = lap.Timings ?? [];

    for (const timing of timings) {
      const driverId = timing.driverId?.trim();
      if (!driverId) {
        continue;
      }

      const trace = ensureTrace(driverId);
      const parsedLapMs = timing.time ? lapTimeToMilliseconds(timing.time) : Number.POSITIVE_INFINITY;
      const previousCumulative = trace.cumulativeMs[trace.cumulativeMs.length - 1] ?? 0;
      const previousLapMs =
        trace.cumulativeMs.length >= 2
          ? (trace.cumulativeMs[trace.cumulativeMs.length - 1] ?? 0) -
            (trace.cumulativeMs[trace.cumulativeMs.length - 2] ?? 0)
          : 90000;
      const lapMs = Number.isFinite(parsedLapMs) ? parsedLapMs : Math.max(previousLapMs, 70000);

      trace.cumulativeMs.push(previousCumulative + lapMs);
    }
  }

  const reportedTotalLaps = orderedDrivers.reduce((best, driver) => Math.max(best, driver.reportedLaps ?? 0), 0);
  const targetTotalLaps = Math.max(laps.length, reportedTotalLaps);

  if (targetTotalLaps <= 0) {
    return null;
  }

  const averageLapMsFromTrace = (cumulative: number[]): number | null => {
    if (cumulative.length === 0) {
      return null;
    }

    const lapMs = cumulative
      .map((value, index) => {
        const previous = index === 0 ? 0 : cumulative[index - 1] ?? 0;
        return value - previous;
      })
      .filter((value) => Number.isFinite(value) && value > 30000 && value < 300000);

    if (lapMs.length === 0) {
      return null;
    }

    return lapMs.reduce((sum, value) => sum + value, 0) / lapMs.length;
  };

  const winnerDriverId = orderedDrivers[0]?.driverId ?? null;
  const winnerSeedTrace = winnerDriverId ? tracesByDriver.get(winnerDriverId) : null;
  const winnerAverageLapMs = winnerSeedTrace ? averageLapMsFromTrace(winnerSeedTrace.cumulativeMs) : null;

  const aggregateLapValues = Array.from(tracesByDriver.values())
    .map((trace) => averageLapMsFromTrace(trace.cumulativeMs))
    .filter((value): value is number => value !== null);

  const aggregateAverageLapMs =
    aggregateLapValues.length > 0
      ? aggregateLapValues.reduce((sum, value) => sum + value, 0) / aggregateLapValues.length
      : null;

  const baselineLapMs = winnerAverageLapMs ?? aggregateAverageLapMs ?? 90000;

  for (const driver of orderedDrivers) {
    const trace = ensureTrace(driver.driverId);
    const requestedDriverLaps = driver.reportedLaps ?? trace.cumulativeMs.length;
    const targetDriverLaps = Math.max(
      trace.cumulativeMs.length,
      Math.min(requestedDriverLaps, targetTotalLaps)
    );
    const driverAverageLapMs = averageLapMsFromTrace(trace.cumulativeMs);
    const paceBias = 1 + ((driver.position ?? 1) - 1) * 0.004;
    const estimatedLapMs = Math.max(
      65000,
      Math.round((driverAverageLapMs ?? baselineLapMs) * paceBias)
    );

    while (trace.cumulativeMs.length < targetDriverLaps) {
      const previousCumulative = trace.cumulativeMs[trace.cumulativeMs.length - 1] ?? 0;
      trace.cumulativeMs.push(previousCumulative + estimatedLapMs);
    }

    if (trace.cumulativeMs.length > targetDriverLaps) {
      trace.cumulativeMs = trace.cumulativeMs.slice(0, targetDriverLaps);
    }
  }

  const orderingMap = new Map(orderedDrivers.map((driver, index) => [driver.driverId, index]));

  const traces = Array.from(tracesByDriver.values())
    .filter((trace) => trace.cumulativeMs.length > 0)
    .sort((a, b) => (orderingMap.get(a.driverId) ?? Number.POSITIVE_INFINITY) - (orderingMap.get(b.driverId) ?? Number.POSITIVE_INFINITY));

  if (traces.length === 0) {
    return getOpenF1RaceReplay(race);
  }

  const winnerTrace = winnerDriverId ? tracesByDriver.get(winnerDriverId) : null;
  const winnerRaceMs = winnerTrace?.cumulativeMs[targetTotalLaps - 1] ?? 0;
  const totalRaceMs =
    winnerRaceMs > 0
      ? winnerRaceMs
      : traces.reduce((best, trace) => Math.max(best, trace.cumulativeMs[trace.cumulativeMs.length - 1] ?? 0), 0);

  if (totalRaceMs <= 0) {
    return getOpenF1RaceReplay(race);
  }

  return {
    totalLaps: targetTotalLaps,
    totalRaceMs,
    traces,
    winnerDriverId
  };
}

async function getCachedFinishedRaceReplay(race: Race) {
  const cacheKey = `${race.season}:${race.round}`;
  return getCachedPromise(finishedRaceReplayCache, cacheKey, FINISHED_RACE_REPLAY_CACHE_TTL_MS, () =>
    buildRaceReplay(race)
  );
}

export async function getRaceReplayByRound(round: string): Promise<RaceReplayData | null> {
  const race = await getRaceByRound(round);

  if (!race) {
    return null;
  }

  if (isRaceFinished(race)) {
    return getCachedFinishedRaceReplay(race);
  }

  return buildRaceReplay(race);
}
// ============================================
// Driver & Constructor API Functions
// ============================================

type ErgastDriverStandingsResponse = {
  MRData?: {
    StandingsTable?: {
      StandingsLists?: Array<{
        DriverStandings?: Array<{
          position: string;
          points: string;
          wins: string;
          Driver: {
            driverId: string;
            permanentNumber?: string;
            code?: string;
            givenName: string;
            familyName: string;
            dateOfBirth: string;
            nationality: string;
          };
          Constructors: Array<{
            constructorId: string;
            name: string;
            nationality: string;
          }>;
        }>;
      }>;
    };
  };
};

type ErgastConstructorStandingsResponse = {
  MRData?: {
    StandingsTable?: {
      StandingsLists?: Array<{
        ConstructorStandings?: Array<{
          position: string;
          points: string;
          wins: string;
          Constructor: {
            constructorId: string;
            name: string;
            nationality: string;
          };
        }>;
      }>;
    };
  };
};

function getStandingsSeasonCandidates(season: string): string[] {
  const candidates = [season];
  const numericSeason = Number(season);

  if (Number.isFinite(numericSeason)) {
    for (let fallbackYear = numericSeason - 1; fallbackYear >= 2023; fallbackYear -= 1) {
      candidates.push(String(fallbackYear));
    }
  }

  return Array.from(new Set(candidates));
}

function normalizeDriverStandings(
  data: ErgastDriverStandingsResponse
): DriverStanding[] {
  const standings =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

  return standings.map((standing) => ({
    position: standing.position,
    points: standing.points,
    wins: standing.wins,
    driver: {
      driverId: standing.Driver.driverId,
      permanentNumber: standing.Driver.permanentNumber || "—",
      code: standing.Driver.code || "—",
      givenName: standing.Driver.givenName,
      familyName: standing.Driver.familyName,
      dateOfBirth: standing.Driver.dateOfBirth,
      nationality: standing.Driver.nationality,
    },
    constructors: standing.Constructors,
  }));
}

function normalizeConstructorStandings(
  data: ErgastConstructorStandingsResponse
): ConstructorStanding[] {
  const standings =
    data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];

  return standings.map((standing) => ({
    position: standing.position,
    points: standing.points,
    wins: standing.wins,
    constructor: standing.Constructor,
  }));
}

async function fetchDriverStandingsForSeason(season: string): Promise<DriverStanding[] | null> {
  const url = `${ERGAST_BASE_URL}/${season}/driverStandings.json`;
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    return null;
  }

  const data: ErgastDriverStandingsResponse = await res.json();
  const standings = normalizeDriverStandings(data);
  return standings.length > 0 ? standings : null;
}

async function fetchConstructorStandingsForSeason(
  season: string
): Promise<ConstructorStanding[] | null> {
  const url = `${ERGAST_BASE_URL}/${season}/constructorStandings.json`;
  const res = await fetch(url, {
    next: { revalidate: REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    return null;
  }

  const data: ErgastConstructorStandingsResponse = await res.json();
  const standings = normalizeConstructorStandings(data);
  return standings.length > 0 ? standings : null;
}

/**
 * Get driver standings for a given season
 * Falls back to previous seasons only if requested season has no standings yet
 */
export async function getDriverStandings(
  season: string = F1_SEASON,
  options?: { silent?: boolean }
): Promise<DriverStanding[]> {
  const candidates = getStandingsSeasonCandidates(season);

  for (const candidateSeason of candidates) {
    try {
      const standings = await fetchDriverStandingsForSeason(candidateSeason);
      if (standings) {
        return standings;
      }
    } catch {
      // Try the next fallback season.
    }
  }

  if (!options?.silent) {
    console.error(`Error fetching driver standings for ${season} and fallback seasons.`);
  }
  return [];
}

/**
 * Get all drivers for a given season (without standings data)
 * Use this for 2026 season to get actual driver list
 */
export async function getAllDrivers(
  season: string = F1_SEASON
): Promise<Driver[]> {
  try {
    const url = `${ERGAST_BASE_URL}/${season}/drivers.json`;
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
    });

    if (!res.ok) throw new Error(`Failed to fetch drivers: ${res.status}`);

    const data: ErgastDriversResponse = await res.json();
    const drivers = data?.MRData?.DriverTable?.Drivers || [];

    return drivers.map((driver) => ({
      driverId: driver.driverId,
      permanentNumber: driver.permanentNumber || "—",
      code: driver.code || "—",
      givenName: driver.givenName,
      familyName: driver.familyName,
      dateOfBirth: driver.dateOfBirth,
      nationality: driver.nationality,
    }));
  } catch (error) {
    console.error("Error fetching drivers:", error);
    return [];
  }
}

/**
 * Get a single driver's standing details
 */
export async function getDriverById(
  driverId: string,
  season: string = F1_SEASON
): Promise<DriverStanding | null> {
  const standings = await getDriverStandings(season);
  return standings.find((s) => s.driver.driverId === driverId) || null;
}

/**
 * Get driver career statistics (aggregated historical data)
 * This is a simplified version - in production you'd aggregate multiple seasons
 */
export async function getDriverCareerStats(
  driverId: string
): Promise<DriverCareerStats | null> {
  try {
    // Get the driver's most recent standing for current team info
    const standing = await getDriverById(driverId, "2023");

    if (!standing) return null;

    // For now, use the standing data as a baseline
    // In production, you'd aggregate historical seasons
    return {
      totalWins: parseInt(standing.wins) || 0,
      totalPodiums: 0, // Would need to aggregate from race results
      totalPoles: 0, // Would need to aggregate from qualifying results
      championships: 0, // Would need to check championship wins across seasons
      currentTeam: standing.constructors[0]?.name || "Unknown",
      currentTeamId: standing.constructors[0]?.constructorId || "unknown",
    };
  } catch (error) {
    console.error("Error fetching driver career stats:", error);
    return null;
  }
}

/**
 * Get driver career timeline
 * This is a simplified placeholder - in production you'd fetch actual team history
 */
export async function getDriverCareerHistory(
  driverId: string
): Promise<DriverCareerEvent[]> {
  // Placeholder: would need to aggregate historical data
  // For now, return recent history based on current standing
  const standing = await getDriverById(driverId, "2023");

  if (!standing) return [];

  return [
    {
      year: "2023",
      team: standing.constructors[0]?.name || "Unknown",
      event: "Current Season",
      active: true,
    },
  ];
}

/**
 * Get constructor standings for a given season
 * Falls back to previous seasons only if requested season has no standings yet
 */
export async function getConstructorStandings(
  season: string = F1_SEASON,
  options?: { silent?: boolean }
): Promise<ConstructorStanding[]> {
  const candidates = getStandingsSeasonCandidates(season);

  for (const candidateSeason of candidates) {
    try {
      const standings = await fetchConstructorStandingsForSeason(candidateSeason);
      if (standings) {
        return standings;
      }
    } catch {
      // Try the next fallback season.
    }
  }

  if (!options?.silent) {
    console.error(`Error fetching constructor standings for ${season} and fallback seasons.`);
  }
  return [];
}

/**
 * Get a single constructor's standing details
 */
export async function getConstructorById(
  constructorId: string,
  season: string = F1_SEASON
): Promise<ConstructorStanding | null> {
  const standings = await getConstructorStandings(season);
  return standings.find((s) => s.constructor.constructorId === constructorId) || null;
}

/**
 * Get team statistics (historical aggregate)
 * Simplified placeholder - would need to aggregate across seasons
 */
export async function getTeamStatistics(
  constructorId: string
): Promise<TeamStatistics | null> {
  const standing = await getConstructorById(constructorId, "2023");

  if (!standing) return null;

  return {
    constructorChampionships: 0, // Would aggregate championship wins
    driversChampionships: 0, // Would count driver championships won with this team
    raceWins: parseInt(standing.wins) || 0,
    polePositions: 0, // Would aggregate qualifying data
    firstEntry: "TBD", // Would need historical data
  };
}

/**
 * Get team drivers for current season
 */
export async function getTeamDrivers(
  constructorId: string,
  season: string = F1_SEASON
): Promise<Driver[]> {
  const driverStandings = await getDriverStandings(season);

  return driverStandings
    .filter((standing) =>
      standing.constructors.some((c) => c.constructorId === constructorId)
    )
    .map((standing) => standing.driver);
}
