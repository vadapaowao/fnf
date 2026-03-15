import { F1_SEASON, type ConstructorStanding, type DriverStanding, getDriverStandings } from "@/lib/f1";

const REVALIDATE_SECONDS = 3600;
const TEAM_PROFILE_CACHE_TTL_MS = 10 * 60 * 1000;
const ERGAST_BASE_URL = "https://api.jolpi.ca/ergast/f1";
const teamProfileCache = new Map<string, { createdAt: number; promise: Promise<TeamProfileData | null> }>();

const TEAM_ACCENT_COLORS: Record<string, string> = {
  red_bull: "#1E41FF",
  ferrari: "#DC0000",
  mercedes: "#00D2BE",
  mclaren: "#FF8000",
  aston_martin: "#006F62",
  alpine: "#0090FF",
  williams: "#005AFF",
  rb: "#2B4562",
  sauber: "#52E252",
  haas: "#B6BABD"
};

const KNOWN_CONSTRUCTORS: Record<
  string,
  {
    constructorId: string;
    name: string;
    nationality: string;
  }
> = {
  red_bull: { constructorId: "red_bull", name: "Red Bull Racing", nationality: "Austrian" },
  ferrari: { constructorId: "ferrari", name: "Ferrari", nationality: "Italian" },
  mercedes: { constructorId: "mercedes", name: "Mercedes", nationality: "German" },
  mclaren: { constructorId: "mclaren", name: "McLaren", nationality: "British" },
  aston_martin: { constructorId: "aston_martin", name: "Aston Martin", nationality: "British" },
  alpine: { constructorId: "alpine", name: "Alpine F1 Team", nationality: "French" },
  williams: { constructorId: "williams", name: "Williams", nationality: "British" },
  rb: { constructorId: "rb", name: "RB F1 Team", nationality: "Italian" },
  sauber: { constructorId: "sauber", name: "Sauber", nationality: "Swiss" },
  haas: { constructorId: "haas", name: "Haas F1 Team", nationality: "American" }
};

type ErgastConstructorStandingsResponse = {
  MRData?: {
    StandingsTable?: {
      season?: string;
      StandingsLists?: Array<{
        season?: string;
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

type ErgastConstructorRaceResultsResponse = {
  MRData?: {
    total?: string;
    RaceTable?: {
      Races?: Array<{
        season?: string;
        round?: string;
        raceName?: string;
        date?: string;
        Circuit?: {
          circuitName?: string;
        };
        Results?: Array<{
          position?: string;
          grid?: string;
          points?: string;
          status?: string;
          Driver?: {
            givenName?: string;
            familyName?: string;
            code?: string;
          };
        }>;
      }>;
    };
  };
};

type ErgastConstructorQualifyingResponse = {
  MRData?: {
    total?: string;
  };
};

type TeamRaceResult = {
  round: string;
  label: string;
  raceName: string;
  date: string;
  circuitName: string;
  points: number;
  bestFinish: string;
  podiums: number;
  wins: number;
};

export type TeamSeasonSnapshot = {
  season: string;
  position: number | null;
  points: number;
  wins: number;
  podiums: number;
  bestFinish: string;
  averagePoints: string;
  completedRounds: number;
  pointsToLeader: number;
  raceSeries: TeamRaceResult[];
};

export type TeamProfileData = {
  standing: ConstructorStanding;
  teamColor: string;
  currentDrivers: DriverStanding[];
  archiveDrivers: DriverStanding[] | null;
  currentSeason: TeamSeasonSnapshot;
  archive2025: TeamSeasonSnapshot | null;
  career: {
    starts: number;
    raceWins: number;
    podiums: number;
    polePositions: number;
    firstEntry: string;
  };
  narrative: string;
};

function toInt(value: string | undefined) {
  const parsed = Number(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function toFixedNumber(value: string | undefined) {
  const parsed = Number(value ?? "0");
  return Number.isFinite(parsed) ? parsed : 0;
}

function getTeamColor(constructorId: string) {
  return TEAM_ACCENT_COLORS[constructorId] ?? "#E10600";
}

function getKnownConstructor(constructorId: string) {
  return KNOWN_CONSTRUCTORS[constructorId] ?? null;
}

function getStrictSeasonCandidates(season: string) {
  return [season];
}

function getSeasonCandidates(season: string) {
  const numericSeason = Number(season);

  if (!Number.isFinite(numericSeason)) {
    return [season];
  }

  return [String(numericSeason), String(numericSeason - 1), String(numericSeason - 2)];
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        "User-Agent": "SportsCore/1.0 (team-profile)"
      }
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function normalizeConstructorStandings(data: ErgastConstructorStandingsResponse): ConstructorStanding[] {
  const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];

  return standings.map((standing) => ({
    position: standing.position,
    points: standing.points,
    wins: standing.wins,
    constructor: {
      constructorId: standing.Constructor.constructorId,
      name: standing.Constructor.name,
      nationality: standing.Constructor.nationality
    }
  }));
}

async function fetchConstructorStandingsContext(
  season: string,
  options?: { strict?: boolean }
): Promise<{ season: string; standings: ConstructorStanding[] } | null> {
  const candidates = options?.strict ? getStrictSeasonCandidates(season) : getSeasonCandidates(season);

  for (const candidateSeason of candidates) {
    const data = await fetchJson<ErgastConstructorStandingsResponse>(`${ERGAST_BASE_URL}/${candidateSeason}/constructorstandings.json`);
    const standings = data ? normalizeConstructorStandings(data) : [];

    if (standings.length > 0) {
      const resolvedSeason =
        data?.MRData?.StandingsTable?.StandingsLists?.[0]?.season ??
        data?.MRData?.StandingsTable?.season ??
        candidateSeason;

      return {
        season: resolvedSeason,
        standings
      };
    }
  }

  return null;
}

function getRaceShortLabel(raceName: string) {
  const compact = raceName.replace(/ Grand Prix/i, "").replace(/[^A-Za-z0-9]/g, "");
  return compact.slice(0, 3).toUpperCase() || "RND";
}

async function fetchConstructorRaceResults(constructorId: string, season: string): Promise<TeamRaceResult[]> {
  const data = await fetchJson<ErgastConstructorRaceResultsResponse>(
    `${ERGAST_BASE_URL}/${season}/constructors/${constructorId}/results.json?limit=100`
  );

  const races = data?.MRData?.RaceTable?.Races ?? [];

  return races.map((race) => {
    const results = race.Results ?? [];
    const finishes = results.map((result) => toInt(result.position)).filter((position) => position > 0);
    const bestFinish = finishes.length > 0 ? `P${Math.min(...finishes)}` : "—";
    const podiums = finishes.filter((position) => position <= 3).length;
    const wins = finishes.filter((position) => position === 1).length;
    const points = results.reduce((sum, result) => sum + toFixedNumber(result.points), 0);

    return {
      round: race.round ?? "",
      label: getRaceShortLabel(race.raceName ?? `Round ${race.round ?? ""}`),
      raceName: race.raceName ?? `Round ${race.round ?? ""}`,
      date: race.date ?? "",
      circuitName: race.Circuit?.circuitName ?? "Circuit unavailable",
      points,
      bestFinish,
      podiums,
      wins
    };
  });
}

function formatBestFinish(results: TeamRaceResult[]) {
  const finishes = results
    .map((result) => {
      const numeric = Number(result.bestFinish.replace("P", ""));
      return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
    })
    .filter((value): value is number => value !== null);

  if (finishes.length === 0) {
    return "—";
  }

  return `P${Math.min(...finishes)}`;
}

function formatAveragePoints(results: TeamRaceResult[]) {
  if (results.length === 0) {
    return "0.0";
  }

  const total = results.reduce((sum, result) => sum + result.points, 0);
  return (total / results.length).toFixed(1);
}

async function buildTeamSeasonSnapshot(
  constructorId: string,
  season: string,
  standingContext?: { season: string; standings: ConstructorStanding[] } | null,
  fallbackStanding?: ConstructorStanding | null
): Promise<TeamSeasonSnapshot | null> {
  const effectiveSeason = standingContext?.season ?? season;
  const standings = standingContext?.standings ?? [];
  const standing = standings.find((entry) => entry.constructor.constructorId === constructorId) ?? fallbackStanding ?? null;
  const raceSeries = await fetchConstructorRaceResults(constructorId, effectiveSeason);

  if (!standing && raceSeries.length === 0) {
    return null;
  }

  const leaderPoints = toFixedNumber(standings[0]?.points);
  const pointsFromResults = raceSeries.reduce((sum, race) => sum + race.points, 0);
  const currentPoints = standing ? toFixedNumber(standing.points) : pointsFromResults;
  const podiums = raceSeries.reduce((sum, race) => sum + race.podiums, 0);
  const winsFromResults = raceSeries.reduce((sum, race) => sum + race.wins, 0);
  const resolvedPosition = standing ? toInt(standing.position) : 0;

  return {
    season: effectiveSeason,
    position: resolvedPosition > 0 ? resolvedPosition : null,
    points: currentPoints,
    wins: standing ? toInt(standing.wins) || winsFromResults : winsFromResults,
    podiums,
    bestFinish: formatBestFinish(raceSeries),
    averagePoints: formatAveragePoints(raceSeries),
    completedRounds: raceSeries.length,
    pointsToLeader: leaderPoints > 0 ? Math.max(leaderPoints - currentPoints, 0) : 0,
    raceSeries
  };
}

async function fetchCareerMeta(constructorId: string) {
  const [startsData, winsData, secondPlaces, thirdPlaces, polesData] = await Promise.all([
    fetchJson<ErgastConstructorRaceResultsResponse>(`${ERGAST_BASE_URL}/constructors/${constructorId}/results.json?limit=1`),
    fetchJson<ErgastConstructorRaceResultsResponse>(`${ERGAST_BASE_URL}/constructors/${constructorId}/results/1.json?limit=1`),
    fetchJson<ErgastConstructorRaceResultsResponse>(`${ERGAST_BASE_URL}/constructors/${constructorId}/results/2.json?limit=1`),
    fetchJson<ErgastConstructorRaceResultsResponse>(`${ERGAST_BASE_URL}/constructors/${constructorId}/results/3.json?limit=1`),
    fetchJson<ErgastConstructorQualifyingResponse>(`${ERGAST_BASE_URL}/constructors/${constructorId}/qualifying/1.json?limit=1`)
  ]);

  return {
    starts: toInt(startsData?.MRData?.total),
    raceWins: toInt(winsData?.MRData?.total),
    podiums: toInt(winsData?.MRData?.total) + toInt(secondPlaces?.MRData?.total) + toInt(thirdPlaces?.MRData?.total),
    polePositions: toInt(polesData?.MRData?.total),
    firstEntry: startsData?.MRData?.RaceTable?.Races?.[0]?.season ?? "Data unavailable"
  };
}

function buildNarrative(standing: ConstructorStanding, season: TeamSeasonSnapshot, career: TeamProfileData["career"]) {
  const teamName = standing.constructor.name;
  const headline = `${teamName} has scored ${season.points} points in the ${season.season} campaign.`;

  return `${headline} The team has ${season.wins} win${season.wins === 1 ? "" : "s"}, ${season.podiums} podium finishes and an average of ${season.averagePoints} points per round this season. Historically, it has ${career.raceWins} race wins and ${career.polePositions} pole positions since debuting in ${career.firstEntry}.`;
}

async function buildTeamProfile(constructorId: string, season: string = F1_SEASON): Promise<TeamProfileData | null> {
  const standingsContext = await fetchConstructorStandingsContext(season);
  const knownConstructor = getKnownConstructor(constructorId);
  const resolvedStanding =
    standingsContext?.standings.find((entry) => entry.constructor.constructorId === constructorId) ??
    (knownConstructor
      ? {
          position: "0",
          points: "0",
          wins: "0",
          constructor: knownConstructor
        }
      : null);

  if (!resolvedStanding) {
    return null;
  }

  const archive2025ContextPromise = fetchConstructorStandingsContext("2025", { strict: true });
  const effectiveCurrentSeason = standingsContext?.season ?? season;
  const currentDriversPromise = getDriverStandings(effectiveCurrentSeason, { silent: true }).then((standings) =>
    standings.filter((entry) => entry.constructors.some((constructor) => constructor.constructorId === constructorId))
  );
  const archiveDriversPromise = archive2025ContextPromise.then((archiveContext) => {
    if (!archiveContext) {
      return [];
    }

    return getDriverStandings(archiveContext.season, { silent: true }).then((standings) =>
      standings.filter((entry) => entry.constructors.some((constructor) => constructor.constructorId === constructorId))
    );
  });

  const [currentSeason, archive2025, career, currentDrivers, archiveDrivers] = await Promise.all([
    buildTeamSeasonSnapshot(constructorId, effectiveCurrentSeason, standingsContext, resolvedStanding),
    archive2025ContextPromise.then((archiveContext) => buildTeamSeasonSnapshot(constructorId, "2025", archiveContext, resolvedStanding)),
    fetchCareerMeta(constructorId),
    currentDriversPromise,
    archiveDriversPromise
  ]);

  if (!currentSeason) {
    return null;
  }

  return {
    standing: resolvedStanding,
    teamColor: getTeamColor(constructorId),
    currentDrivers,
    archiveDrivers: archiveDrivers.length > 0 ? archiveDrivers : null,
    currentSeason,
    archive2025,
    career,
    narrative: buildNarrative(resolvedStanding, currentSeason, career)
  };
}

export async function getTeamProfile(constructorId: string, season: string = F1_SEASON): Promise<TeamProfileData | null> {
  const cacheKey = `${season}:${constructorId}`;
  const cached = teamProfileCache.get(cacheKey);

  if (cached && Date.now() - cached.createdAt < TEAM_PROFILE_CACHE_TTL_MS) {
    return cached.promise;
  }

  const promise = buildTeamProfile(constructorId, season);
  teamProfileCache.set(cacheKey, {
    createdAt: Date.now(),
    promise
  });
  return promise;
}
