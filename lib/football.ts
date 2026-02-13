export type Fixture = {
  id: string;
  competition: "Champions League" | "La Liga";
  homeTeam: string;
  awayTeam: string;
  kickoffUtc: string;
  venue: string;
};

export type Standing = {
  position: number;
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
};

export const footballFixtures: Fixture[] = [
  {
    id: "ucl-1",
    competition: "Champions League",
    homeTeam: "Real Madrid",
    awayTeam: "Manchester City",
    kickoffUtc: "2026-02-18T20:00:00Z",
    venue: "Santiago Bernabeu"
  },
  {
    id: "ucl-2",
    competition: "Champions League",
    homeTeam: "Bayern Munich",
    awayTeam: "Inter Milan",
    kickoffUtc: "2026-02-19T20:00:00Z",
    venue: "Allianz Arena"
  },
  {
    id: "ll-1",
    competition: "La Liga",
    homeTeam: "Barcelona",
    awayTeam: "Sevilla",
    kickoffUtc: "2026-02-22T18:00:00Z",
    venue: "Estadi Olimpic Lluis Companys"
  },
  {
    id: "ll-2",
    competition: "La Liga",
    homeTeam: "Atletico Madrid",
    awayTeam: "Villarreal",
    kickoffUtc: "2026-02-22T20:30:00Z",
    venue: "Metropolitano"
  },
  {
    id: "ll-3",
    competition: "La Liga",
    homeTeam: "Valencia",
    awayTeam: "Real Sociedad",
    kickoffUtc: "2026-02-23T19:00:00Z",
    venue: "Mestalla"
  }
];

export const laLigaStandings: Standing[] = [
  {
    position: 1,
    team: "Real Madrid",
    played: 24,
    won: 18,
    drawn: 4,
    lost: 2,
    goalsFor: 57,
    goalsAgainst: 21,
    points: 58
  },
  {
    position: 2,
    team: "Barcelona",
    played: 24,
    won: 17,
    drawn: 5,
    lost: 2,
    goalsFor: 55,
    goalsAgainst: 24,
    points: 56
  },
  {
    position: 3,
    team: "Atletico Madrid",
    played: 24,
    won: 14,
    drawn: 6,
    lost: 4,
    goalsFor: 42,
    goalsAgainst: 24,
    points: 48
  },
  {
    position: 4,
    team: "Athletic Club",
    played: 24,
    won: 13,
    drawn: 6,
    lost: 5,
    goalsFor: 39,
    goalsAgainst: 26,
    points: 45
  },
  {
    position: 5,
    team: "Real Sociedad",
    played: 24,
    won: 12,
    drawn: 7,
    lost: 5,
    goalsFor: 36,
    goalsAgainst: 23,
    points: 43
  },
  {
    position: 6,
    team: "Villarreal",
    played: 24,
    won: 11,
    drawn: 7,
    lost: 6,
    goalsFor: 38,
    goalsAgainst: 31,
    points: 40
  }
];

export function formatFixtureDate(iso: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(iso));
}
