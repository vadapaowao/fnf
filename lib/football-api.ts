const FOOTBALL_DATA_BASE_URL = "https://api.football-data.org/v4";
const LIVE_REVALIDATE_SECONDS = 60;
const STATIC_REVALIDATE_SECONDS = 3600;
export type SupportedCompetitionCode = "PL" | "CL" | "BL1" | "SA" | "FL1" | "PD";
export type SupportedCompetitionSlug = "pl" | "cl" | "bl1" | "sa" | "fl1" | "pd";
export type MatchStatus =
  | "SCHEDULED"
  | "TIMED"
  | "LIVE"
  | "IN_PLAY"
  | "PAUSED"
  | "FINISHED"
  | "POSTPONED"
  | "SUSPENDED"
  | "CANCELLED"
  | string;

export type FormResult = "W" | "D" | "L";

export type CompetitionMeta = {
  code: SupportedCompetitionCode;
  slug: SupportedCompetitionSlug;
  shortLabel: string;
  name: string;
};

export type Area = {
  name: string;
  code?: string | null;
  flag?: string | null;
};

export type CompetitionSummary = {
  id: number;
  code: string;
  name: string;
  emblem: string | null;
};

export type TeamSummary = {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
  area?: Area;
};

export type Scoreline = {
  home: number | null;
  away: number | null;
};

export type MatchScore = {
  winner: string | null;
  duration: string | null;
  fullTime: Scoreline;
  halfTime: Scoreline;
  penalties: Scoreline;
};

export type Match = {
  id: number;
  utcDate: string;
  status: MatchStatus;
  minute: number | null;
  matchday: number | null;
  stage: string | null;
  group: string | null;
  venue: string | null;
  lastUpdated: string | null;
  competition: CompetitionSummary;
  homeTeam: TeamSummary;
  awayTeam: TeamSummary;
  score: MatchScore;
};

export type StandingRow = {
  position: number;
  team: TeamSummary;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: FormResult[];
};

export type Scorer = {
  rank: number;
  playerName: string;
  team: TeamSummary;
  goals: number;
  assists: number | null;
  playedMatches: number;
};

export type SquadPlayer = {
  id: number;
  name: string;
  position: string | null;
  shirtNumber: number | null;
  nationality: string | null;
};

export type Club = TeamSummary & {
  founded: number | null;
  venue: string | null;
  address: string | null;
  website: string | null;
  clubColors: string | null;
  runningCompetitions: CompetitionSummary[];
  squad: SquadPlayer[];
  area: Area;
};

export type MatchEventType = "goal" | "red-card" | "substitution";

export type MatchEvent = {
  id: string;
  minute: number;
  injuryTime: number | null;
  playerName: string;
  relatedPlayerName?: string | null;
  teamId: number | null;
  teamName: string | null;
  type: MatchEventType;
  icon: string;
  detail: string;
  scoreLabel?: string | null;
};

export type MatchDetail = Match & {
  events: MatchEvent[];
};

type ApiArea = {
  name?: string;
  code?: string | null;
  flag?: string | null;
};

type ApiCompetition = {
  id?: number;
  code?: string;
  name?: string;
  emblem?: string | null;
};

type ApiPerson = {
  id?: number;
  name?: string;
  nationality?: string | null;
  shirtNumber?: number | null;
  position?: string | null;
};

type ApiTeam = {
  id?: number;
  name?: string;
  shortName?: string;
  tla?: string;
  crest?: string | null;
  founded?: number | null;
  venue?: string | null;
  address?: string | null;
  website?: string | null;
  clubColors?: string | null;
  area?: ApiArea;
  runningCompetitions?: ApiCompetition[];
  squad?: ApiPerson[];
};

type ApiScoreTime = {
  home?: number | null;
  away?: number | null;
};

type ApiScore = {
  winner?: string | null;
  duration?: string | null;
  fullTime?: ApiScoreTime;
  halfTime?: ApiScoreTime;
  penalties?: ApiScoreTime;
};

type ApiGoal = {
  minute?: number | null;
  injuryTime?: number | null;
  type?: string | null;
  team?: ApiTeam;
  scorer?: ApiPerson;
  assist?: ApiPerson | null;
  score?: ApiScoreTime;
  ownGoal?: boolean;
  penalty?: boolean;
};

type ApiBooking = {
  minute?: number | null;
  injuryTime?: number | null;
  team?: ApiTeam;
  player?: ApiPerson;
  card?: string | null;
};

type ApiSubstitution = {
  minute?: number | null;
  team?: ApiTeam;
  playerOut?: ApiPerson;
  playerIn?: ApiPerson;
};

type ApiMatch = {
  id?: number;
  utcDate?: string;
  status?: MatchStatus;
  minute?: number | string | null;
  matchday?: number | null;
  stage?: string | null;
  group?: string | null;
  venue?: string | null;
  lastUpdated?: string | null;
  competition?: ApiCompetition;
  homeTeam?: ApiTeam;
  awayTeam?: ApiTeam;
  score?: ApiScore;
  goals?: ApiGoal[];
  bookings?: ApiBooking[];
  substitutions?: ApiSubstitution[];
};

type ApiMatchesResponse = {
  matches?: ApiMatch[];
};

type ApiStandingsRow = {
  position?: number;
  team?: ApiTeam;
  playedGames?: number;
  won?: number;
  draw?: number;
  lost?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  points?: number;
  form?: string | null;
};

type ApiStandingsResponse = {
  standings?: Array<{
    type?: string;
    table?: ApiStandingsRow[];
  }>;
};

type ApiScorerRow = {
  player?: ApiPerson;
  team?: ApiTeam;
  goals?: number;
  assists?: number | null;
  playedMatches?: number;
};

type ApiScorersResponse = {
  scorers?: ApiScorerRow[];
};

export const FOOTBALL_COMPETITIONS: CompetitionMeta[] = [
  { code: "PL", slug: "pl", shortLabel: "PL", name: "Premier League" },
  { code: "CL", slug: "cl", shortLabel: "UCL", name: "UEFA Champions League" },
  { code: "BL1", slug: "bl1", shortLabel: "BL1", name: "Bundesliga" },
  { code: "SA", slug: "sa", shortLabel: "SA", name: "Serie A" },
  { code: "FL1", slug: "fl1", shortLabel: "FL1", name: "Ligue 1" },
  { code: "PD", slug: "pd", shortLabel: "PD", name: "La Liga" },
];

function buildHeaders() {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;

  if (!apiKey) {
    return null;
  }

  return {
    "X-Auth-Token": apiKey,
  };
}

async function fetchFootballData<T>(path: string, revalidateSeconds: number): Promise<T | null> {
  const headers = buildHeaders();

  if (!headers) {
    return null;
  }

  try {
    const response = await fetch(`${FOOTBALL_DATA_BASE_URL}${path}`, {
      headers,
      next: { revalidate: revalidateSeconds },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function normalizeArea(area?: ApiArea): Area {
  return {
    name: area?.name ?? "Unknown area",
    code: area?.code ?? null,
    flag: area?.flag ?? null,
  };
}

function normalizeCompetition(competition?: ApiCompetition): CompetitionSummary {
  return {
    id: competition?.id ?? 0,
    code: competition?.code ?? "",
    name: competition?.name ?? "Unknown competition",
    emblem: competition?.emblem ?? null,
  };
}

function normalizeTeam(team?: ApiTeam): TeamSummary {
  return {
    id: team?.id ?? 0,
    name: team?.name ?? "Unknown club",
    shortName: team?.shortName ?? team?.name ?? "Unknown club",
    tla: team?.tla ?? (team?.name ? team.name.slice(0, 3).toUpperCase() : "CLB"),
    crest: team?.crest ?? null,
    area: team?.area ? normalizeArea(team.area) : undefined,
  };
}

function normalizeScoreline(score?: ApiScoreTime): Scoreline {
  return {
    home: typeof score?.home === "number" ? score.home : null,
    away: typeof score?.away === "number" ? score.away : null,
  };
}

function normalizeMinute(value: number | string | null | undefined): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const numeric = Number.parseInt(value.replace(/[^\d]/g, ""), 10);
    return Number.isFinite(numeric) ? numeric : null;
  }

  return null;
}

function normalizeMatchScore(score?: ApiScore): MatchScore {
  return {
    winner: score?.winner ?? null,
    duration: score?.duration ?? null,
    fullTime: normalizeScoreline(score?.fullTime),
    halfTime: normalizeScoreline(score?.halfTime),
    penalties: normalizeScoreline(score?.penalties),
  };
}

function normalizeMatch(match?: ApiMatch): Match {
  return {
    id: match?.id ?? 0,
    utcDate: match?.utcDate ?? new Date(0).toISOString(),
    status: match?.status ?? "SCHEDULED",
    minute: normalizeMinute(match?.minute),
    matchday: typeof match?.matchday === "number" ? match.matchday : null,
    stage: match?.stage ?? null,
    group: match?.group ?? null,
    venue: match?.venue ?? null,
    lastUpdated: match?.lastUpdated ?? null,
    competition: normalizeCompetition(match?.competition),
    homeTeam: normalizeTeam(match?.homeTeam),
    awayTeam: normalizeTeam(match?.awayTeam),
    score: normalizeMatchScore(match?.score),
  };
}

function parseForm(form?: string | null): FormResult[] {
  if (!form) {
    return [];
  }

  return form
    .split(/[\s,]+/)
    .map((entry) => entry.trim().toUpperCase())
    .filter((entry): entry is FormResult => entry === "W" || entry === "D" || entry === "L")
    .slice(0, 5);
}

function normalizeStandingRow(row: ApiStandingsRow): StandingRow {
  return {
    position: row.position ?? 0,
    team: normalizeTeam(row.team),
    playedGames: row.playedGames ?? 0,
    won: row.won ?? 0,
    draw: row.draw ?? 0,
    lost: row.lost ?? 0,
    goalsFor: row.goalsFor ?? 0,
    goalsAgainst: row.goalsAgainst ?? 0,
    goalDifference: row.goalDifference ?? 0,
    points: row.points ?? 0,
    form: parseForm(row.form),
  };
}

function normalizeScorer(row: ApiScorerRow, index: number): Scorer {
  return {
    rank: index + 1,
    playerName: row.player?.name ?? "Unknown player",
    team: normalizeTeam(row.team),
    goals: row.goals ?? 0,
    assists: typeof row.assists === "number" ? row.assists : null,
    playedMatches: row.playedMatches ?? 0,
  };
}

function normalizeSquadPlayer(player: ApiPerson): SquadPlayer {
  return {
    id: player.id ?? 0,
    name: player.name ?? "Unknown player",
    position: player.position ?? null,
    shirtNumber: typeof player.shirtNumber === "number" ? player.shirtNumber : null,
    nationality: player.nationality ?? null,
  };
}

function normalizeClub(team?: ApiTeam | null): Club | null {
  if (!team?.id) {
    return null;
  }

  return {
    ...normalizeTeam(team),
    founded: typeof team.founded === "number" ? team.founded : null,
    venue: team.venue ?? null,
    address: team.address ?? null,
    website: team.website ?? null,
    clubColors: team.clubColors ?? null,
    runningCompetitions: (team.runningCompetitions ?? []).map(normalizeCompetition),
    squad: (team.squad ?? []).map(normalizeSquadPlayer),
    area: normalizeArea(team.area),
  };
}

function normalizeGoalEvent(goal: ApiGoal, index: number): MatchEvent | null {
  const minute = typeof goal.minute === "number" ? goal.minute : null;

  if (minute === null) {
    return null;
  }

  const scoreLabel =
    typeof goal.score?.home === "number" && typeof goal.score?.away === "number"
      ? `${goal.score.home}-${goal.score.away}`
      : null;
  const pieces = [goal.ownGoal ? "Own goal" : goal.penalty ? "Penalty" : "Goal"];

  if (goal.assist?.name) {
    pieces.push(`Assist: ${goal.assist.name}`);
  }

  return {
    id: `goal-${index}-${minute}`,
    minute,
    injuryTime: typeof goal.injuryTime === "number" ? goal.injuryTime : null,
    playerName: goal.scorer?.name ?? "Unknown scorer",
    relatedPlayerName: goal.assist?.name ?? null,
    teamId: goal.team?.id ?? null,
    teamName: goal.team?.shortName ?? goal.team?.name ?? null,
    type: "goal",
    icon: "⚽",
    detail: pieces.join(" · "),
    scoreLabel,
  };
}

function normalizeBookingEvent(booking: ApiBooking, index: number): MatchEvent | null {
  const minute = typeof booking.minute === "number" ? booking.minute : null;
  const card = booking.card?.toUpperCase() ?? "";

  if (minute === null || !card.includes("RED")) {
    return null;
  }

  return {
    id: `red-${index}-${minute}`,
    minute,
    injuryTime: typeof booking.injuryTime === "number" ? booking.injuryTime : null,
    playerName: booking.player?.name ?? "Unknown player",
    teamId: booking.team?.id ?? null,
    teamName: booking.team?.shortName ?? booking.team?.name ?? null,
    type: "red-card",
    icon: "🟥",
    detail: "Sent off",
  };
}

function normalizeSubstitutionEvent(substitution: ApiSubstitution, index: number): MatchEvent | null {
  const minute = typeof substitution.minute === "number" ? substitution.minute : null;

  if (minute === null) {
    return null;
  }

  return {
    id: `sub-${index}-${minute}`,
    minute,
    injuryTime: null,
    playerName: substitution.playerIn?.name ?? "Unknown player",
    relatedPlayerName: substitution.playerOut?.name ?? null,
    teamId: substitution.team?.id ?? null,
    teamName: substitution.team?.shortName ?? substitution.team?.name ?? null,
    type: "substitution",
    icon: "🔄",
    detail: substitution.playerOut?.name ? `For ${substitution.playerOut.name}` : "Substitution",
  };
}

function sortMatches(matches: Match[]): Match[] {
  return [...matches].sort((left, right) => new Date(left.utcDate).getTime() - new Date(right.utcDate).getTime());
}

function sortEvents(events: MatchEvent[]): MatchEvent[] {
  return [...events].sort((left, right) => {
    if (left.minute !== right.minute) {
      return left.minute - right.minute;
    }

    return left.id.localeCompare(right.id);
  });
}

function dedupeMatches(matches: Match[]): Match[] {
  const byId = new Map<number, Match>();

  matches.forEach((match) => {
    if (match.id) {
      byId.set(match.id, match);
    }
  });

  return sortMatches(Array.from(byId.values()));
}

export function getCompetitionBySlug(slug: string | null | undefined): CompetitionMeta | null {
  if (!slug) {
    return null;
  }

  return FOOTBALL_COMPETITIONS.find((competition) => competition.slug === slug.toLowerCase()) ?? null;
}

export function getCompetitionByCode(code: string | null | undefined): CompetitionMeta | null {
  if (!code) {
    return null;
  }

  return FOOTBALL_COMPETITIONS.find((competition) => competition.code === code.toUpperCase()) ?? null;
}

export function getCompetitionHref(code: string): string {
  const competition = getCompetitionByCode(code);
  return competition ? `/football/${competition.slug}` : "/football";
}

export function isMatchLive(status: MatchStatus): boolean {
  return status === "LIVE" || status === "IN_PLAY" || status === "PAUSED";
}

export function isMatchFinished(status: MatchStatus): boolean {
  return status === "FINISHED";
}

export function formatKickoffLabel(utcDate: string): string {
  const date = new Date(utcDate);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).replace(",", "");
}

export function formatMatchDateLong(utcDate: string): string {
  const date = new Date(utcDate);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getMatchStateLabel(match: Match): string {
  if (isMatchLive(match.status)) {
    return match.minute ? `${match.minute}'` : "LIVE";
  }

  if (isMatchFinished(match.status)) {
    return "Full Time";
  }

  if (match.status === "POSTPONED") {
    return "Postponed";
  }

  if (match.status === "CANCELLED") {
    return "Cancelled";
  }

  return "Upcoming";
}

export async function getLiveMatches(competitionCode: string): Promise<Match[]> {
  const data = await fetchFootballData<ApiMatchesResponse>(
    `/competitions/${competitionCode}/matches?status=LIVE`,
    LIVE_REVALIDATE_SECONDS
  );

  return sortMatches((data?.matches ?? []).map(normalizeMatch));
}

export async function getUpcomingMatches(competitionCode: string, limit = 8): Promise<Match[]> {
  const data = await fetchFootballData<ApiMatchesResponse>(
    `/competitions/${competitionCode}/matches?status=SCHEDULED`,
    LIVE_REVALIDATE_SECONDS
  );

  return sortMatches((data?.matches ?? []).map(normalizeMatch)).slice(0, limit);
}

export async function getStandings(competitionCode: string): Promise<StandingRow[]> {
  const data = await fetchFootballData<ApiStandingsResponse>(
    `/competitions/${competitionCode}/standings`,
    STATIC_REVALIDATE_SECONDS
  );

  const standingBlock =
    data?.standings?.find((entry) => (entry.type ?? "").toUpperCase() === "TOTAL" && Array.isArray(entry.table)) ??
    data?.standings?.find((entry) => Array.isArray(entry.table));

  return (standingBlock?.table ?? []).map(normalizeStandingRow);
}

export async function getTopScorers(competitionCode: string, limit = 10): Promise<Scorer[]> {
  const data = await fetchFootballData<ApiScorersResponse>(
    `/competitions/${competitionCode}/scorers?limit=${limit}`,
    STATIC_REVALIDATE_SECONDS
  );

  return (data?.scorers ?? []).slice(0, limit).map(normalizeScorer);
}

export async function getMatchDetail(matchId: number): Promise<MatchDetail | null> {
  const data = await fetchFootballData<ApiMatch>(`/matches/${matchId}`, LIVE_REVALIDATE_SECONDS);

  if (!data) {
    return null;
  }

  const baseMatch = normalizeMatch(data);
  const events = sortEvents(
    [
      ...(data.goals ?? []).map(normalizeGoalEvent).filter((event): event is MatchEvent => event !== null),
      ...(data.bookings ?? []).map(normalizeBookingEvent).filter((event): event is MatchEvent => event !== null),
      ...(data.substitutions ?? []).map(normalizeSubstitutionEvent).filter((event): event is MatchEvent => event !== null),
    ]
  );

  return {
    ...baseMatch,
    events,
  };
}

export async function getClubProfile(teamId: number): Promise<Club | null> {
  const data = await fetchFootballData<ApiTeam>(`/teams/${teamId}`, STATIC_REVALIDATE_SECONDS);
  return normalizeClub(data);
}

export async function getClubUpcomingMatches(teamId: number, limit = 5): Promise<Match[]> {
  const data = await fetchFootballData<ApiMatchesResponse>(
    `/teams/${teamId}/matches?status=SCHEDULED&limit=${limit}`,
    LIVE_REVALIDATE_SECONDS
  );

  return sortMatches((data?.matches ?? []).map(normalizeMatch)).slice(0, limit);
}

export async function getClubRecentMatches(teamId: number, limit = 5): Promise<Match[]> {
  const data = await fetchFootballData<ApiMatchesResponse>(
    `/teams/${teamId}/matches?status=FINISHED&limit=${limit}`,
    LIVE_REVALIDATE_SECONDS
  );

  const matches = sortMatches((data?.matches ?? []).map(normalizeMatch));
  return matches.slice(Math.max(matches.length - limit, 0));
}

export async function getAllLiveMatches(): Promise<Match[]> {
  const liveGroups = await Promise.all(FOOTBALL_COMPETITIONS.map((competition) => getLiveMatches(competition.code)));
  return dedupeMatches(liveGroups.flat());
}

export async function getAllUpcomingMatches(limit = 8): Promise<Match[]> {
  const groups = await Promise.all(
    FOOTBALL_COMPETITIONS.map((competition) => getUpcomingMatches(competition.code, Math.max(limit, 8)))
  );

  return dedupeMatches(groups.flat()).slice(0, limit);
}

export function groupSquadByPosition(players: SquadPlayer[]) {
  const buckets = new Map<string, SquadPlayer[]>();

  players.forEach((player) => {
    const rawPosition = (player.position ?? "Unknown").toLowerCase();
    let group = "Other";

    if (rawPosition.includes("goal")) {
      group = "Goalkeepers";
    } else if (rawPosition.includes("defen") || rawPosition.includes("back")) {
      group = "Defenders";
    } else if (rawPosition.includes("mid")) {
      group = "Midfielders";
    } else if (rawPosition.includes("attack") || rawPosition.includes("forward") || rawPosition.includes("wing")) {
      group = "Forwards";
    }

    const list = buckets.get(group) ?? [];
    list.push(player);
    buckets.set(group, list);
  });

  return ["Goalkeepers", "Defenders", "Midfielders", "Forwards", "Other"]
    .map((group) => ({
      group,
      players: (buckets.get(group) ?? []).sort((left, right) => left.name.localeCompare(right.name)),
    }))
    .filter((bucket) => bucket.players.length > 0);
}

export function getFormFromMatches(matches: Match[], clubId: number): FormResult[] {
  return matches.map((match) => {
    const clubIsHome = match.homeTeam.id === clubId;
    const homeGoals = match.score.fullTime.home ?? 0;
    const awayGoals = match.score.fullTime.away ?? 0;

    if (homeGoals === awayGoals) {
      return "D";
    }

    const won = clubIsHome ? homeGoals > awayGoals : awayGoals > homeGoals;
    return won ? "W" : "L";
  });
}

export function getClubFormTotals(matches: Match[], clubId: number) {
  return matches.reduce(
    (totals, match) => {
      const clubIsHome = match.homeTeam.id === clubId;
      const goalsFor = clubIsHome ? match.score.fullTime.home ?? 0 : match.score.fullTime.away ?? 0;
      const goalsAgainst = clubIsHome ? match.score.fullTime.away ?? 0 : match.score.fullTime.home ?? 0;

      totals.gf += goalsFor;
      totals.ga += goalsAgainst;

      if (goalsFor > goalsAgainst) {
        totals.w += 1;
      } else if (goalsFor === goalsAgainst) {
        totals.d += 1;
      } else {
        totals.l += 1;
      }

      return totals;
    },
    { w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0 }
  );
}

export function attachGoalDifference<T extends { gf: number; ga: number; gd: number }>(totals: T): T {
  return {
    ...totals,
    gd: totals.gf - totals.ga,
  };
}
