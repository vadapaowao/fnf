import { F1_SEASON, type Driver, type DriverStanding, getDriverStandings } from "@/lib/f1";

const REVALIDATE_SECONDS = 3600;
const ERGAST_BASE_URL = "https://api.jolpi.ca/ergast/f1";

export type DriverTimelineEvent = {
  year: string;
  title: string;
  subtitle: string;
  highlight?: boolean;
  active?: boolean;
};

export type DriverProfileData = {
  standing: DriverStanding;
  age: number;
  nationalityCode: string;
  teamColor: string;
  imageUrl: string;
  imageSource: "wikipedia" | "fallback";
  stats: {
    wins: number;
    poles: number;
    podiums: number;
    championships: number;
  };
  timeline: DriverTimelineEvent[];
  bio: string;
};

type ErgastTotalResponse = {
  MRData?: {
    total?: string;
    RaceTable?: {
      Races?: Array<{
        season?: string;
      }>;
    };
    StandingsTable?: {
      StandingsLists?: Array<{
        season?: string;
      }>;
    };
  };
};

type WikiSummaryResponse = {
  type?: string;
  thumbnail?: {
    source?: string;
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
  Brazilian: "BRA"
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

const WIKI_TITLE_OVERRIDES: Record<string, string> = {
  perez: "Sergio_Pérez",
  sainz: "Carlos_Sainz_Jr.",
  russell: "George_Russell_(racing_driver)",
  tsunoda: "Yuki_Tsunoda",
  zhou: "Zhou_Guanyu",
  hulkenberg: "Nico_Hülkenberg",
  de_vries: "Nyck_de_Vries",
  kevin_magnussen: "Kevin_Magnussen"
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

function getWikiTitle(driver: Driver): string {
  const override = WIKI_TITLE_OVERRIDES[driver.driverId];

  if (override) {
    return override;
  }

  return `${driver.givenName}_${driver.familyName}`.replace(/\s+/g, "_");
}

async function fetchTotalFromEndpoint(endpoint: string): Promise<number> {
  const data = await fetchJson<ErgastTotalResponse>(`${ERGAST_BASE_URL}${endpoint}`);
  return toInt(data?.MRData?.total);
}

async function fetchDebutYear(driverId: string): Promise<string> {
  const data = await fetchJson<ErgastTotalResponse>(`${ERGAST_BASE_URL}/drivers/${driverId}/results.json?limit=1`);
  return data?.MRData?.RaceTable?.Races?.[0]?.season ?? "Data unavailable";
}

async function fetchFirstWinYear(driverId: string): Promise<string> {
  const data = await fetchJson<ErgastTotalResponse>(`${ERGAST_BASE_URL}/drivers/${driverId}/results/1.json?limit=1`);
  return data?.MRData?.RaceTable?.Races?.[0]?.season ?? "";
}

async function resolveDriverPortrait(driver: Driver): Promise<{ imageUrl: string; imageSource: "wikipedia" | "fallback" }> {
  const wikiTitle = getWikiTitle(driver);
  const summary = await fetchJson<WikiSummaryResponse>(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`
  );

  const thumbnail = summary?.thumbnail?.source;
  const isValidPage = summary?.type !== "disambiguation";

  if (thumbnail && isValidPage) {
    return { imageUrl: thumbnail, imageSource: "wikipedia" };
  }

  return {
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg",
    imageSource: "fallback"
  };
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
    title: "Current",
    subtitle: teamName,
    active: true
  });

  return events;
}

export async function getDriverProfile(driverId: string, season: string = F1_SEASON): Promise<DriverProfileData | null> {
  const standings = await getDriverStandings(season);
  const standing = standings.find((entry) => entry.driver.driverId === driverId);

  if (!standing) {
    return null;
  }

  const driver = standing.driver;
  const team = standing.constructors[0];

  const [
    wins,
    secondPlaces,
    thirdPlaces,
    poles,
    debutYear,
    firstWinYear,
    portrait
  ] = await Promise.all([
    fetchTotalFromEndpoint(`/drivers/${driverId}/results/1.json?limit=1000`),
    fetchTotalFromEndpoint(`/drivers/${driverId}/results/2.json?limit=1000`),
    fetchTotalFromEndpoint(`/drivers/${driverId}/results/3.json?limit=1000`),
    fetchTotalFromEndpoint(`/drivers/${driverId}/qualifying/1.json?limit=1000`),
    fetchDebutYear(driverId),
    fetchFirstWinYear(driverId),
    resolveDriverPortrait(driver)
  ]);

  const podiums = wins + secondPlaces + thirdPlaces;
  const championshipYears = CHAMPIONSHIP_YEARS_BY_DRIVER[driverId] ?? [];
  const championships = championshipYears.length;
  const age = getAgeFromDate(driver.dateOfBirth);
  const teamName = team?.name ?? "Team unavailable";
  const seasonLabel = season;

  return {
    standing,
    age,
    nationalityCode: getNationalityCode(driver.nationality),
    teamColor: getTeamColor(team?.constructorId ?? ""),
    imageUrl: portrait.imageUrl,
    imageSource: portrait.imageSource,
    stats: {
      wins,
      poles,
      podiums,
      championships
    },
    timeline: buildTimeline(debutYear, firstWinYear, championshipYears, seasonLabel, teamName),
    bio: `${driver.givenName} ${driver.familyName} is a ${age}-year-old ${driver.nationality} Formula 1 driver racing for ${teamName}. Career totals: ${wins} wins, ${poles} poles, ${podiums} podiums and ${championships} world championships.`
  };
}
