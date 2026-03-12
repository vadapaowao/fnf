"use client";

import { useMemo, useState } from "react";

import DriverCard from "@/components/f1/drivers/DriverCard";
import SeasonToggle from "@/components/f1/SeasonToggle";
import TeamPointsChart from "@/components/f1/TeamPointsChart";
import type { TeamProfileData, TeamSeasonSnapshot } from "@/lib/team-profile";

type TeamProfileClientProps = {
  profile: TeamProfileData;
};

function formatNumber(value: number | string) {
  return Number(value).toLocaleString("en-US");
}

function buildTeamSeasonSummary(teamName: string, snapshot: TeamSeasonSnapshot, nationality: string) {
  const winsLine = `${snapshot.wins} win${snapshot.wins === 1 ? "" : "s"} and ${snapshot.podiums} podiums`;
  const pointsLine = `${snapshot.points} points across ${snapshot.completedRounds} rounds`;

  return `${teamName} is in ${nationality} colours for ${snapshot.season}, with ${pointsLine}, ${winsLine}, and an average of ${snapshot.averagePoints} points per weekend.`;
}

function StatTile({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-white">{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-gray-500">{hint}</p> : null}
    </div>
  );
}

export default function TeamProfileClient({ profile }: TeamProfileClientProps) {
  const { standing, teamColor, currentDrivers, currentSeason, archive2025, career } = profile;
  const { constructor: team } = standing;
  const [selectedSeasonId, setSelectedSeasonId] = useState(currentSeason.season);

  const selectedSeason = useMemo(() => {
    if (archive2025 && selectedSeasonId === archive2025.season) {
      return archive2025;
    }

    return currentSeason;
  }, [archive2025, currentSeason, selectedSeasonId]);

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background-dark">
      <div className="container mx-auto px-6 py-12">
        <section className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-70 blur-3xl"
            style={{ background: `radial-gradient(circle at top right, ${teamColor}40, transparent 65%)` }}
          />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-300">
                {selectedSeason.season} Team File
              </span>
              <span
                className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ backgroundColor: `${teamColor}22`, color: teamColor }}
              >
                {team.constructorId.toUpperCase()}
              </span>
            </div>

            <h1 className="mt-4 font-display text-5xl font-bold leading-[0.9] tracking-tight text-white md:text-6xl">
              {team.name}
              <span className="mt-2 block text-base font-semibold uppercase tracking-[0.18em] text-gray-500">
                {team.nationality}
              </span>
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-gray-300">
              {buildTeamSeasonSummary(team.name, selectedSeason, team.nationality)}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <StatTile label="Points" value={formatNumber(selectedSeason.points)} hint={`${selectedSeason.completedRounds} rounds logged`} />
              <StatTile label="Wins" value={formatNumber(selectedSeason.wins)} hint={`${selectedSeason.podiums} podiums`} />
              <StatTile label="Average Points" value={selectedSeason.averagePoints} hint="per round" />
              <StatTile label="Best Finish" value={selectedSeason.bestFinish} />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <article className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
            <div
              className="rounded-[2rem] border border-white/10 bg-black/20 p-6"
              style={{ boxShadow: `inset 0 0 0 1px ${teamColor}55` }}
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Garage Identity</p>
                  <p className="mt-1 font-display text-3xl font-black text-white">{team.constructorId.toUpperCase()}</p>
                </div>
                <div className="flex gap-2">
                  <span className="h-3 w-8 rounded-full bg-white/10" />
                  <span className="h-3 w-12 rounded-full" style={{ backgroundColor: teamColor }} />
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <StatTile label="First Entry" value={career.firstEntry} />
                <StatTile label="Career Starts" value={formatNumber(career.starts)} />
                <StatTile label="Race Wins" value={formatNumber(career.raceWins)} />
                <StatTile label="Pole Positions" value={formatNumber(career.polePositions)} />
              </div>
            </div>
          </article>

          <article className="min-w-0 rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Current Lineup</h2>
                <p className="mt-1 text-sm text-gray-500">Pinned near the top so the roster stays easy to scan.</p>
              </div>
              <span className="rounded border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-gray-300">
                {currentDrivers.length} drivers
              </span>
            </div>

            {currentDrivers.length > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {currentDrivers.map((driverStanding) => (
                  <DriverCard
                    key={driverStanding.driver.driverId}
                    driver={driverStanding.driver}
                    teamId={team.constructorId}
                    teamName={team.name}
                    standing={driverStanding}
                  />
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center">
                <p className="text-sm text-gray-400">No driver data available for this team.</p>
              </div>
            )}
          </article>
        </section>

        <section className="mt-6 space-y-6">
          {archive2025 ? (
            <SeasonToggle
              eyebrow="Season Focus"
              title="Switch Team Season"
              subtitle="Use a single season mode for a cleaner read. Archive data is available without stacking it on top of the live view."
              options={[
                {
                  id: currentSeason.season,
                  label: `${currentSeason.season} Live`,
                  hint: `${currentSeason.points} pts`
                },
                {
                  id: archive2025.season,
                  label: `${archive2025.season} Archive`,
                  hint: `${archive2025.points} pts`
                }
              ]}
              selectedId={selectedSeasonId}
              onChange={setSelectedSeasonId}
            />
          ) : null}

          <article className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-white">Season Desk</h2>
                <p className="mt-1 text-sm text-gray-500">Focused stats for the selected season mode.</p>
              </div>
              <span className="rounded border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-gray-300">
                {selectedSeason.season}
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatTile label="Points" value={formatNumber(selectedSeason.points)} />
              <StatTile label="Wins" value={formatNumber(selectedSeason.wins)} />
              <StatTile label="Podiums" value={formatNumber(selectedSeason.podiums)} />
              <StatTile label="Best Finish" value={selectedSeason.bestFinish} />
              <StatTile label="Average Points" value={selectedSeason.averagePoints} />
              <StatTile label="Logged Rounds" value={formatNumber(selectedSeason.completedRounds)} />
            </div>
          </article>

          <TeamPointsChart snapshot={selectedSeason} accentColor={teamColor} title={`${selectedSeason.season} Points Flow`} />
        </section>
      </div>
    </main>
  );
}
