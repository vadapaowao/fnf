import { F1_SEASON, type Constructor, type Driver, type DriverStanding } from "@/lib/f1";

const REVALIDATE_SECONDS = 3600;
const ERGAST_BASE_URL = "https://api.jolpi.ca/ergast/f1";

export type DriverTimelineEvent = {
  year: string;
  title: string;
  subtitle: string;
  highlight?: boolean;
  active?: boolean;
};

export type DriverSeasonResult = {
  round: string;
  label: string;
  raceName: string;
  circuitName: string;
  date: string;
  finish: number | null;
  finishLabel: string;
  grid: number | null;
  points: number;
  status: string;
};

export type DriverSeasonSnapshot = {
  season: string;
  teamId: string;
  teamName: string;
  teamColor: string;
  position: number | null;
  points: number;
  wins: number;
  podiums: number;
  bestFinish: string;
  averageFinish: string;
  completedRounds: number;
  pointsToLeader: number;
  recentResults: DriverSeasonResult[];
  paceSeries: DriverSeasonResult[];
};

export type DriverProfileNeighbor = {
  driverId: string;
  name: string;
  context: string;
} | null;

export type DriverHeadToHeadSummary = {
  driver: number;
  teammate: number;
  ties: number;
};

export type DriverHeadToHeadPoints = {
  driver: number;
  teammate: number;
  delta: number;
};

export type DriverHeadToHeadEntry = {
  round: string;
  raceName: string;
  circuitName: string;
  gridDriver: number | null;
  gridTeammate: number | null;
  finishDriver: number | null;
  finishTeammate: number | null;
  pointsDriver: number;
  pointsTeammate: number;
  winner: "driver" | "teammate" | "tie";
};

export type DriverHeadToHead = {
  season: string;
  teamId: string;
  teamName: string;
  teammate: {
    driverId: string;
    name: string;
    code: string;
    permanentNumber: string;
    nationality: string;
  };
  gridHeadToHead: DriverHeadToHeadSummary;
  finishHeadToHead: DriverHeadToHeadSummary;
  pointsSplit: DriverHeadToHeadPoints;
  averageFinish: {
    driver: string;
    teammate: string;
    delta: number;
  };
  bestFinish: {
    driver: string;
    teammate: string;
  };
  raceDuels: DriverHeadToHeadEntry[];
};

export type DriverProfileData = {
  standing: DriverStanding;
  age: number;
  nationalityCode: string;
  teamColor: string;
  teamId: string;
  teamName: string;
  stats: {
    starts: number;
    wins: number;
    poles: number;
    podiums: number;
    championships: number;
  };
  season: DriverSeasonSnapshot;
  archive2025: DriverSeasonSnapshot | null;
  headToHead: {
    current: DriverHeadToHead | null;
    archive2025: DriverHeadToHead | null;
  };
  timeline: DriverTimelineEvent[];
  bio: string;
  debutYear: string;
  firstWinYear: string;
  neighbors: {
    previous: DriverProfileNeighbor;
    next: DriverProfileNeighbor;
  };
};

type ErgastTotalResponse = {
  MRData?: {
    total?: string;
    RaceTable?: {
      Races?: Array<{
        season?: string;
      }>;
    };
  };
};

type ErgastDriverStandingsResponse = {
  MRData?: {
    StandingsTable?: {
      season?: string;
      StandingsLists?: Array<{
        season?: string;
        DriverStandings?: Array<{
          position: string;
          points: string;
          wins: string;
          Driver: Driver;
          Constructors: Constructor[];
        }>;
      }>;
    };
  };
};

type ErgastDriverSeasonResultsResponse = {
  MRData?: {
    RaceTable?: {
      Races?: Array<{
        round?: string;
        raceName?: string;
        date?: string;
        Circuit?: {
          circuitName?: string;
        };
        Results?: Array<{
          position?: string;
          positionText?: string;
          grid?: string;
          points?: string;
          status?: string;
        }>;
      }>;
    };
  };
};

const NATIONALITY_CODES: Record<string, string> = {
  Dutch: "NED",
  Mexican: "MEX",
  British: "GBR",
  Spanish: "ESP",
  Monegasque: "MON",
  Australian: "AUS",
  French: "FRA",
  Thai: "THA",
  Finnish: "FIN",
  German: "GER",
  Japanese: "JPN",
  Chinese: "CHN",
  Danish: "DEN",
  Canadian: "CAN",
  New: "NZL",
  Brazilian: "BRA",
  Italian: "ITA",
  American: "USA",
  Polish: "POL",
  Argentine: "ARG"
};

const TEAM_ACCENT_COLORS: Record<string, string> = {
  red_bull: "#1E41FF",
  ferrari: "#DC0000",
  mercedes: "#00D2BE",
  mclaren: "#FF8000",
  aston_martin: "#006F62",
  alpine: "#0090FF",
  williams: "#005AFF",
  rb: "#2B4562",
  alphatauri: "#2B4562",
  sauber: "#52E252",
  alfa: "#900000",
  haas: "#B6BABD",
  renault: "#FFF500",
  toro_rosso: "#469BFF",
  racing_point: "#F596C8",
  force_india: "#F596C8",
  lotus_f1: "#B6BABD",
  manor: "#E6002B",
  marussia: "#E6002B"
};

const CHAMPIONSHIP_YEARS_BY_DRIVER: Record<string, string[]> = {
  hamilton: ["2008", "2014", "2015", "2017", "2018", "2019", "2020"],
  alonso: ["2005", "2006"],
  max_verstappen: ["2021", "2022", "2023"]
};

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: {
        "User-Agent": "SportsCore/1.0 (driver-profile)"
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

function toInt(value: string | undefined): number {
  const numeric = Number(value ?? "0");
  return Number.isFinite(numeric) ? numeric : 0;
}

function toFixedNumber(value: string | undefined): number {
  const numeric = Number(value ?? "0");
  return Number.isFinite(numeric) ? numeric : 0;
}

function getStandingsSeasonCandidates(season: string) {
  const numericSeason = Number(season);

  if (!Number.isFinite(numericSeason)) {
    return [season];
  }

  return [String(numericSeason), String(numericSeason - 1), String(numericSeason - 2)];
}

function getStrictSeasonCandidates(season: string) {
  return [season];
}

function normalizeDriverStandings(data: ErgastDriverStandingsResponse): DriverStanding[] {
  const standings = data?.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

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
      nationality: standing.Driver.nationality
    },
    constructors: standing.Constructors
  }));
}

async function fetchDriverStandingsContext(
  season: string,
  options?: { strict?: boolean }
): Promise<{ season: string; standings: DriverStanding[] } | null> {
  const candidates = options?.strict ? getStrictSeasonCandidates(season) : getStandingsSeasonCandidates(season);

  for (const candidateSeason of candidates) {
    const data = await fetchJson<ErgastDriverStandingsResponse>(`${ERGAST_BASE_URL}/${candidateSeason}/driverStandings.json`);
    const standings = data ? normalizeDriverStandings(data) : [];

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

function getNationalityCode(nationality: string): string {
  return NATIONALITY_CODES[nationality] ?? nationality.toUpperCase().slice(0, 3);
}

function getTeamColor(constructorId: string): string {
  return TEAM_ACCENT_COLORS[constructorId] ?? "#E10600";
}

function getAgeFromDate(dateOfBirth: string): number {
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  const now = new Date();

  if (Number.isNaN(birth.getTime())) {
    return 0;
  }

  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - birth.getUTCMonth();
  const hasBirthdayPassed = monthDelta > 0 || (monthDelta === 0 && now.getUTCDate() >= birth.getUTCDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return age;
}

async function fetchTotalFromEndpoint(endpoint: string): Promise<number> {
  const data = await fetchJson<ErgastTotalResponse>(`${ERGAST_BASE_URL}${endpoint}`);
  return toInt(data?.MRData?.total);
}

async function fetchCareerResultsMeta(driverId: string): Promise<{ starts: number; debutYear: string }> {
  const data = await fetchJson<ErgastTotalResponse>(`${ERGAST_BASE_URL}/drivers/${driverId}/results.json?limit=1`);

  return {
    starts: toInt(data?.MRData?.total),
    debutYear: data?.MRData?.RaceTable?.Races?.[0]?.season ?? "Data unavailable"
  };
}

async function fetchWinsMeta(driverId: string): Promise<{ wins: number; firstWinYear: string }> {
  const data = await fetchJson<ErgastTotalResponse>(`${ERGAST_BASE_URL}/drivers/${driverId}/results/1.json?limit=1`);

  return {
    wins: toInt(data?.MRData?.total),
    firstWinYear: data?.MRData?.RaceTable?.Races?.[0]?.season ?? ""
  };
}

function getRaceShortLabel(raceName: string) {
  const compact = raceName.replace(/ Grand Prix/i, "").replace(/[^A-Za-z0-9]/g, "");
  return compact.slice(0, 3).toUpperCase() || "RND";
}

async function fetchSeasonResults(driverId: string, season: string): Promise<DriverSeasonResult[]> {
  const data = await fetchJson<ErgastDriverSeasonResultsResponse>(
    `${ERGAST_BASE_URL}/${season}/drivers/${driverId}/results.json?limit=100`
  );

  const races = data?.MRData?.RaceTable?.Races ?? [];

  return races.map((race) => {
    const result = race.Results?.[0];
    const finish = toInt(result?.position);
    const grid = toInt(result?.grid);

    return {
      round: race.round ?? "",
      label: getRaceShortLabel(race.raceName ?? `Round ${race.round ?? ""}`),
      raceName: race.raceName ?? `Round ${race.round ?? ""}`,
      circuitName: race.Circuit?.circuitName ?? "Circuit unavailable",
      date: race.date ?? "",
      finish: finish > 0 ? finish : null,
      finishLabel: finish > 0 ? `P${finish}` : result?.positionText ?? result?.status ?? "NC",
      grid: grid > 0 ? grid : null,
      points: toFixedNumber(result?.points),
      status: result?.status ?? "No result"
    };
  });
}

function buildTimeline(
  debutYear: string,
  firstWinYear: string,
  championshipYears: string[],
  seasonLabel: string,
  teamName: string
): DriverTimelineEvent[] {
  const events: DriverTimelineEvent[] = [
    {
      year: debutYear,
      title: "F1 Debut",
      subtitle: "Entered Formula 1"
    }
  ];

  if (firstWinYear) {
    events.push({
      year: firstWinYear,
      title: "First Win",
      subtitle: "Career breakthrough"
    });
  }

  if (championshipYears.length > 0) {
    events.push({
      year: championshipYears.join(", "),
      title: `${championshipYears.length}x World Champion`,
      subtitle: "Championship-winning seasons",
      highlight: true
    });
  }

  events.push({
    year: seasonLabel,
    title: "Current Campaign",
    subtitle: teamName,
    active: true
  });

  return events;
}

function getAverageFinishValue(results: DriverSeasonResult[]) {
  const numericFinishes = results
    .map((result) => result.finish)
    .filter((finish): finish is number => finish !== null && Number.isFinite(finish));

  if (numericFinishes.length === 0) {
    return null;
  }

  return numericFinishes.reduce((sum, finish) => sum + finish, 0) / numericFinishes.length;
}

function getBestFinishValue(results: DriverSeasonResult[]) {
  const numericFinishes = results
    .map((result) => result.finish)
    .filter((finish): finish is number => finish !== null && Number.isFinite(finish));

  if (numericFinishes.length === 0) {
    return null;
  }

  return Math.min(...numericFinishes);
}

function formatAverageFinish(results: DriverSeasonResult[]) {
  const average = getAverageFinishValue(results);
  if (average === null) {
    return "—";
  }

  return average.toFixed(1);
}

function formatBestFinish(results: DriverSeasonResult[]) {
  const bestFinish = getBestFinishValue(results);
  if (bestFinish === null) {
    return "—";
  }

  return `P${bestFinish}`;
}

function buildHeadToHeadSummary(): DriverHeadToHeadSummary {
  return { driver: 0, teammate: 0, ties: 0 };
}

function buildBio(
  standing: DriverStanding,
  teamName: string,
  effectiveSeason: string,
  careerWins: number,
  careerPoles: number,
  careerPodiums: number,
  championships: number,
  seasonPodiums: number,
  pointsToLeader: number
) {
  const name = `${standing.driver.givenName} ${standing.driver.familyName}`;
  const seasonLine =
    pointsToLeader === 0
      ? `${name} leads the ${effectiveSeason} Formula 1 championship for ${teamName}.`
      : `${name} drives for ${teamName} and sits P${standing.position} in the ${effectiveSeason} championship on ${standing.points} points.`;
  const podiumLine = `The ${effectiveSeason} campaign includes ${seasonPodiums} podium ${seasonPodiums === 1 ? "finish" : "finishes"} and ${standing.wins} win${standing.wins === "1" ? "" : "s"}.`;
  const legacyLine =
    championships > 0
      ? `Career record: ${careerWins} wins, ${careerPoles} poles, ${careerPodiums} ${careerPodiums === 1 ? "podium" : "podiums"}, ${championships} world championship${championships === 1 ? "" : "s"}.`
      : `Career record: ${careerWins} wins, ${careerPoles} poles, ${careerPodiums} ${careerPodiums === 1 ? "podium" : "podiums"}.`;

  return `${seasonLine} ${podiumLine} ${legacyLine}`;
}

async function buildSeasonSnapshot(
  driverId: string,
  season: string,
  standingContext?: { season: string; standings: DriverStanding[] } | null
): Promise<DriverSeasonSnapshot | null> {
  const effectiveSeason = standingContext?.season ?? season;
  const standings = standingContext?.standings ?? [];
  const standing = standings.find((entry) => entry.driver.driverId === driverId) ?? null;
  const seasonResults = await fetchSeasonResults(driverId, effectiveSeason);

  if (!standing && seasonResults.length === 0) {
    return null;
  }

  const leaderPoints = toFixedNumber(standings[0]?.points);
  const currentPoints = toFixedNumber(standing?.points);
  const podiums = seasonResults.filter((result) => result.finish !== null && result.finish <= 3).length;

  return {
    season: effectiveSeason,
    teamId: standing?.constructors[0]?.constructorId ?? "",
    teamName: standing?.constructors[0]?.name ?? "Team unavailable",
    teamColor: getTeamColor(standing?.constructors[0]?.constructorId ?? ""),
    position: standing ? toInt(standing.position) : null,
    points: currentPoints,
    wins: standing ? toInt(standing.wins) : seasonResults.filter((result) => result.finish === 1).length,
    podiums,
    bestFinish: formatBestFinish(seasonResults),
    averageFinish: formatAverageFinish(seasonResults),
    completedRounds: seasonResults.length,
    pointsToLeader: Math.max(leaderPoints - currentPoints, 0),
    recentResults: seasonResults,
    paceSeries: seasonResults
  };
}

async function buildHeadToHead(
  driverStanding: DriverStanding,
  driverResults: DriverSeasonResult[],
  season: string,
  standings: DriverStanding[]
): Promise<DriverHeadToHead | null> {
  const teamId = driverStanding.constructors[0]?.constructorId ?? "";
  const teamName = driverStanding.constructors[0]?.name ?? "Team unavailable";

  if (!teamId) {
    return null;
  }

  const teammateStanding =
    standings.find(
      (entry) =>
        entry.driver.driverId !== driverStanding.driver.driverId &&
        entry.constructors.some((constructor) => constructor.constructorId === teamId)
    ) ?? null;

  if (!teammateStanding) {
    return null;
  }

  const teammateResults = await fetchSeasonResults(teammateStanding.driver.driverId, season);
  if (driverResults.length === 0 && teammateResults.length === 0) {
    return null;
  }

  const teammateResultsByRound = new Map(teammateResults.map((result) => [result.round, result]));
  const raceDuels: DriverHeadToHeadEntry[] = [];
  const gridHeadToHead = buildHeadToHeadSummary();
  const finishHeadToHead = buildHeadToHeadSummary();

  driverResults.forEach((driverResult) => {
    const teammateResult = teammateResultsByRound.get(driverResult.round);
    if (!teammateResult) {
      return;
    }

    const gridDriver = driverResult.grid ?? null;
    const gridTeammate = teammateResult.grid ?? null;
    const finishDriver = driverResult.finish ?? null;
    const finishTeammate = teammateResult.finish ?? null;

    if (gridDriver !== null && gridTeammate !== null) {
      if (gridDriver < gridTeammate) {
        gridHeadToHead.driver += 1;
      } else if (gridTeammate < gridDriver) {
        gridHeadToHead.teammate += 1;
      } else {
        gridHeadToHead.ties += 1;
      }
    }

    if (finishDriver !== null && finishTeammate !== null) {
      if (finishDriver < finishTeammate) {
        finishHeadToHead.driver += 1;
      } else if (finishTeammate < finishDriver) {
        finishHeadToHead.teammate += 1;
      } else {
        finishHeadToHead.ties += 1;
      }
    }

    const pointsDriver = driverResult.points;
    const pointsTeammate = teammateResult.points;
    let winner: DriverHeadToHeadEntry["winner"] = "tie";

    if (finishDriver !== null && finishTeammate !== null) {
      if (finishDriver < finishTeammate) {
        winner = "driver";
      } else if (finishTeammate < finishDriver) {
        winner = "teammate";
      }
    } else if (pointsDriver !== pointsTeammate) {
      winner = pointsDriver > pointsTeammate ? "driver" : "teammate";
    }

    raceDuels.push({
      round: driverResult.round,
      raceName: driverResult.raceName,
      circuitName: driverResult.circuitName,
      gridDriver,
      gridTeammate,
      finishDriver,
      finishTeammate,
      pointsDriver,
      pointsTeammate,
      winner
    });
  });

  const driverPoints = driverResults.reduce((sum, result) => sum + result.points, 0);
  const teammatePoints = teammateResults.reduce((sum, result) => sum + result.points, 0);
  const driverAverage = getAverageFinishValue(driverResults);
  const teammateAverage = getAverageFinishValue(teammateResults);
  const averageDelta = driverAverage !== null && teammateAverage !== null ? teammateAverage - driverAverage : 0;

  const sortedDuels = raceDuels.sort((left, right) => toInt(left.round) - toInt(right.round));

  return {
    season,
    teamId,
    teamName,
    teammate: {
      driverId: teammateStanding.driver.driverId,
      name: `${teammateStanding.driver.givenName} ${teammateStanding.driver.familyName}`,
      code: teammateStanding.driver.code || "—",
      permanentNumber: teammateStanding.driver.permanentNumber || "—",
      nationality: teammateStanding.driver.nationality
    },
    gridHeadToHead,
    finishHeadToHead,
    pointsSplit: {
      driver: driverPoints,
      teammate: teammatePoints,
      delta: driverPoints - teammatePoints
    },
    averageFinish: {
      driver: driverAverage !== null ? driverAverage.toFixed(1) : "—",
      teammate: teammateAverage !== null ? teammateAverage.toFixed(1) : "—",
      delta: averageDelta
    },
    bestFinish: {
      driver: formatBestFinish(driverResults),
      teammate: formatBestFinish(teammateResults)
    },
    raceDuels: sortedDuels
  };
}

function buildNeighbors(standings: DriverStanding[], currentIndex: number) {
  if (currentIndex < 0) {
    return {
      previous: null,
      next: null
    };
  }

  const previous = standings[currentIndex - 1];
  const next = standings[currentIndex + 1];

  return {
    previous: previous
      ? {
          driverId: previous.driver.driverId,
          name: `${previous.driver.givenName} ${previous.driver.familyName}`,
          context: previous.constructors[0]?.name ?? "Team unavailable"
        }
      : null,
    next: next
      ? {
          driverId: next.driver.driverId,
          name: `${next.driver.givenName} ${next.driver.familyName}`,
          context: next.constructors[0]?.name ?? "Team unavailable"
        }
      : null
  };
}

function sortDriverDirectory(standings: DriverStanding[]) {
  return [...standings].sort((left, right) => {
    const familyNameCompare = left.driver.familyName.localeCompare(right.driver.familyName);

    if (familyNameCompare !== 0) {
      return familyNameCompare;
    }

    const givenNameCompare = left.driver.givenName.localeCompare(right.driver.givenName);

    if (givenNameCompare !== 0) {
      return givenNameCompare;
    }

    return left.driver.driverId.localeCompare(right.driver.driverId);
  });
}

export async function getDriverProfile(driverId: string, season: string = F1_SEASON): Promise<DriverProfileData | null> {
  const standingContext = await fetchDriverStandingsContext(season);

  if (!standingContext) {
    return null;
  }

  const { season: effectiveSeason, standings } = standingContext;
  const standingIndex = standings.findIndex((entry) => entry.driver.driverId === driverId);
  const directoryOrder = sortDriverDirectory(standings);
  const directoryIndex = directoryOrder.findIndex((entry) => entry.driver.driverId === driverId);

  if (standingIndex === -1) {
    return null;
  }

  const standing = standings[standingIndex];
  const driver = standing.driver;
  const team = standing.constructors[0];
  const archiveStandingContextPromise = fetchDriverStandingsContext("2025", { strict: true });

  const [
    careerMeta,
    winsMeta,
    secondPlaces,
    thirdPlaces,
    poles,
    currentSeasonSnapshot,
    archive2025
  ] = await Promise.all([
    fetchCareerResultsMeta(driverId),
    fetchWinsMeta(driverId),
    fetchTotalFromEndpoint(`/drivers/${driverId}/results/2.json?limit=1000`),
    fetchTotalFromEndpoint(`/drivers/${driverId}/results/3.json?limit=1000`),
    fetchTotalFromEndpoint(`/drivers/${driverId}/qualifying/1.json?limit=1000`),
    buildSeasonSnapshot(driverId, effectiveSeason, standingContext),
    archiveStandingContextPromise.then((archiveStandingContext) => buildSeasonSnapshot(driverId, "2025", archiveStandingContext))
  ]);

  if (!currentSeasonSnapshot) {
    return null;
  }

  const podiums = winsMeta.wins + secondPlaces + thirdPlaces;
  const championshipYears = CHAMPIONSHIP_YEARS_BY_DRIVER[driverId] ?? [];
  const championships = championshipYears.length;
  const age = getAgeFromDate(driver.dateOfBirth);
  const teamName = team?.name ?? "Team unavailable";
  const teamId = team?.constructorId ?? "";
  const seasonPodiums = currentSeasonSnapshot.podiums;
  const headToHeadCurrent = await buildHeadToHead(standing, currentSeasonSnapshot.recentResults, effectiveSeason, standings);
  let headToHeadArchive: DriverHeadToHead | null = null;

  const archiveStandingContext = await archiveStandingContextPromise;
  if (archiveStandingContext && archive2025) {
    const archiveStandingEntry = archiveStandingContext.standings.find((entry) => entry.driver.driverId === driverId);
    if (archiveStandingEntry) {
      headToHeadArchive = await buildHeadToHead(
        archiveStandingEntry,
        archive2025.recentResults,
        archiveStandingContext.season,
        archiveStandingContext.standings
      );
    }
  }

  return {
    standing,
    age,
    nationalityCode: getNationalityCode(driver.nationality),
    teamColor: getTeamColor(teamId),
    teamId,
    teamName,
    stats: {
      starts: careerMeta.starts,
      wins: winsMeta.wins,
      poles,
      podiums,
      championships
    },
    season: currentSeasonSnapshot,
    archive2025,
    headToHead: {
      current: headToHeadCurrent,
      archive2025: headToHeadArchive
    },
    timeline: buildTimeline(careerMeta.debutYear, winsMeta.firstWinYear, championshipYears, effectiveSeason, teamName),
    bio: buildBio(
      standing,
      teamName,
      effectiveSeason,
      winsMeta.wins,
      poles,
      podiums,
      championships,
      seasonPodiums,
      currentSeasonSnapshot.pointsToLeader
    ),
    debutYear: careerMeta.debutYear,
    firstWinYear: winsMeta.firstWinYear,
    neighbors: buildNeighbors(directoryOrder, directoryIndex)
  };
}
