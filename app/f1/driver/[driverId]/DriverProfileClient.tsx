"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import SeasonToggle from "@/components/f1/SeasonToggle";
import DriverIdentityAvatar from "@/components/f1/drivers/DriverIdentityAvatar";
import SeasonPaceChart from "@/components/f1/drivers/SeasonPaceChart";
import type { DriverProfileData, DriverSeasonResult, DriverSeasonSnapshot } from "@/lib/driver-profile";

type DriverProfileClientProps = {
  profile: DriverProfileData;
};

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

function formatPosition(position: number | null) {
  return position ? `P${position}` : "—";
}

function formatDate(value: string): string {
  const parsed = new Date(`${value}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getResultTone(result: DriverSeasonResult) {
  if (result.finish !== null && result.finish <= 3) {
    return "border-[#E10600]/35 bg-[#1A0909]";
  }

  if (result.finish !== null && result.finish <= 10) {
    return "border-white/10 bg-black/20";
  }

  return "border-white/5 bg-black/10";
}

function buildSeasonSummary(
  snapshot: DriverSeasonSnapshot,
  driverName: string,
  age: number,
  nationality: string,
  isLiveSeason: boolean
) {
  const placement = snapshot.position
    ? isLiveSeason
      ? `sits P${snapshot.position}`
      : `finished P${snapshot.position}`
    : "is being tracked";
  const podiumLine =
    snapshot.podiums > 0
      ? `${snapshot.podiums} podiums and ${snapshot.wins} win${snapshot.wins === 1 ? "" : "s"}`
      : `${snapshot.wins} win${snapshot.wins === 1 ? "" : "s"} so far`;

  return `${driverName} raced for ${snapshot.teamName} in ${snapshot.season} and ${placement} on ${snapshot.points} points, with ${podiumLine}. ${driverName} is a ${age}-year-old ${nationality} driver.`;
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

export default function DriverProfileClient({ profile }: DriverProfileClientProps) {
  const { standing, age, nationalityCode, stats, season, archive2025, timeline, debutYear, firstWinYear, neighbors } = profile;
  const { driver } = standing;
  const [selectedSeasonId, setSelectedSeasonId] = useState(season.season);

  const selectedSeason = useMemo(() => {
    if (archive2025 && selectedSeasonId === archive2025.season) {
      return archive2025;
    }

    return season;
  }, [archive2025, season, selectedSeasonId]);

  const selectedAccentColor = selectedSeason.teamColor || profile.teamColor;
  const selectedTeamName = selectedSeason.teamName || profile.teamName;
  const selectedTeamId = selectedSeason.teamId || profile.teamId;
  const selectedResults = [...selectedSeason.recentResults].reverse();
  const driverName = `${driver.givenName} ${driver.familyName}`;

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background-dark">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/f1/drivers"
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-300 transition-colors hover:border-grid-primary/40 hover:text-white"
          >
            <span className="material-icons text-sm">arrow_back</span>
            Back to Drivers
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded border border-grid-primary/30 bg-grid-primary/10 px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-[0.16em] text-grid-primary">
              {selectedSeason.season} Driver File
            </span>
            {selectedTeamId ? (
              <Link
                href={`/f1/team/${selectedTeamId}`}
                className="rounded border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-300 transition-colors hover:border-white/30 hover:text-white"
              >
                View Team
              </Link>
            ) : null}
          </div>
        </div>

        <section className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
          <div
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-70 blur-3xl"
            style={{ background: `radial-gradient(circle at top right, ${selectedAccentColor}40, transparent 65%)` }}
          />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                style={{ backgroundColor: `${selectedAccentColor}22`, color: selectedAccentColor }}
              >
                {formatPosition(selectedSeason.position)}
              </span>
              <span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-300">
                #{driver.permanentNumber || driver.code || "—"}
              </span>
              <span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-300">
                {nationalityCode}
              </span>
              <span className="rounded border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-300">
                {selectedSeason.teamName}
              </span>
            </div>

            <h1 className="mt-4 font-display text-5xl font-bold leading-[0.9] tracking-tight text-white md:text-6xl">
              {driver.givenName}
              <span className="block" style={{ color: selectedAccentColor }}>
                {driver.familyName}
              </span>
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-gray-400">
              <span>{selectedTeamName}</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{driver.nationality}</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>{age > 0 ? `${age} years old` : "Age unavailable"}</span>
            </div>

            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-gray-300">
              {buildSeasonSummary(selectedSeason, driverName, age, driver.nationality, selectedSeason.season === season.season)}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <StatTile label="Points" value={formatNumber(selectedSeason.points)} hint={`${selectedSeason.completedRounds} rounds logged`} />
              <StatTile label="Wins" value={formatNumber(selectedSeason.wins)} hint={`${selectedSeason.podiums} podiums`} />
              <StatTile label="Average Finish" value={selectedSeason.averageFinish} />
              <StatTile label="Best Finish" value={selectedSeason.bestFinish} />
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
          <div className="min-w-0 space-y-6">
            {archive2025 ? (
              <SeasonToggle
                eyebrow="Season Focus"
                title="Switch Driver Season"
                subtitle="Use one season mode at a time. This keeps the profile readable instead of stacking current and archive data together."
                options={[
                  {
                    id: season.season,
                    label: `${season.season} Live`,
                    hint: season.teamName
                  },
                  {
                    id: archive2025.season,
                    label: `${archive2025.season} Archive`,
                    hint: archive2025.teamName
                  }
                ]}
                selectedId={selectedSeasonId}
                onChange={setSelectedSeasonId}
              />
            ) : null}

            <SeasonPaceChart data={selectedSeason.paceSeries} accentColor={selectedAccentColor} season={selectedSeason.season} />

            <article className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">{selectedSeason.season} Results</h2>
                  <p className="mt-1 text-sm text-gray-500">Full classified race log for the selected season view.</p>
                </div>
                <span className="rounded border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-gray-300">
                  {selectedSeason.completedRounds} rounds
                </span>
              </div>

              {selectedResults.length > 0 ? (
                <div className="mt-5 max-h-[880px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedResults.map((result) => (
                    <div
                      key={`${selectedSeason.season}-${result.round}-${result.raceName}`}
                      className={`rounded-lg border p-4 ${getResultTone(result)}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
                            Round {result.round} • {formatDate(result.date)}
                          </p>
                          <h3 className="mt-1 text-base font-bold text-white">{result.raceName}</h3>
                          <p className="mt-1 text-sm text-gray-500">{result.circuitName}</p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-right">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Grid</p>
                            <p className="mt-1 text-lg font-black text-white">{result.grid ? `P${result.grid}` : "—"}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Finish</p>
                            <p className="mt-1 text-lg font-black" style={{ color: result.finish !== null && result.finish <= 3 ? selectedAccentColor : "#FFFFFF" }}>
                              {result.finishLabel}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500">Points</p>
                            <p className="mt-1 text-lg font-black text-white">{formatNumber(result.points)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center">
                  <p className="text-sm text-gray-400">No race results available yet for this season view.</p>
                </div>
              )}
            </article>

            <article className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
              <h2 className="font-display text-2xl font-bold text-white">Career Timeline</h2>
              <div className="mt-5 space-y-4">
                {timeline.map((event, index) => (
                  <div key={`${event.year}-${event.title}-${index}`} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className="h-3.5 w-3.5 rounded-full border"
                        style={{
                          borderColor: event.highlight || event.active ? selectedAccentColor : "rgba(255,255,255,0.16)",
                          backgroundColor: event.highlight || event.active ? selectedAccentColor : "rgba(255,255,255,0.08)"
                        }}
                      />
                      {index !== timeline.length - 1 ? <div className="mt-2 h-full w-px bg-white/10" /> : null}
                    </div>
                    <div className="pb-4">
                      <p className="text-[10px] font-mono font-bold uppercase tracking-[0.16em]" style={{ color: event.highlight || event.active ? selectedAccentColor : "#6B7280" }}>
                        {event.year}
                      </p>
                      <p className="mt-1 text-lg font-bold text-white">{event.title}</p>
                      <p className="mt-1 text-sm text-gray-500">{event.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <aside className="min-w-0 space-y-6 xl:sticky xl:top-24 xl:self-start">
            <article className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
              <div className="flex justify-center">
                <DriverIdentityAvatar
                  givenName={driver.givenName}
                  familyName={driver.familyName}
                  accentColor={selectedAccentColor}
                  variant="hero"
                />
              </div>

              <div className="mt-6">
                <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">Dossier Rail</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-white">Quick-scan identity panel</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Key driver markers stay pinned while the season chart and race list scroll.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <StatTile label="Driver Code" value={driver.code || "—"} />
                  <StatTile label="Permanent Number" value={driver.permanentNumber || "—"} />
                  <StatTile label="Debut" value={debutYear} />
                  <StatTile label="First Win" value={firstWinYear || "—"} />
                  <StatTile label="Career Starts" value={formatNumber(stats.starts)} />
                  <StatTile label="Season Team" value={selectedSeason.teamName} />
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">Season Snapshot</h2>
                  <p className="mt-1 text-sm text-gray-500">{selectedSeason.season} focus mode</p>
                </div>
                <span
                  className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ backgroundColor: `${selectedAccentColor}22`, color: selectedAccentColor }}
                >
                  {selectedSeason.teamName}
                </span>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <StatTile label="Position" value={formatPosition(selectedSeason.position)} />
                <StatTile label="Points" value={formatNumber(selectedSeason.points)} />
                <StatTile label="Wins" value={formatNumber(selectedSeason.wins)} />
                <StatTile label="Podiums" value={formatNumber(selectedSeason.podiums)} />
                <StatTile label="Average Finish" value={selectedSeason.averageFinish} />
                <StatTile label="Best Finish" value={selectedSeason.bestFinish} />
              </div>
            </article>

            <article className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
              <h2 className="font-display text-2xl font-bold text-white">Driver Dossier</h2>
              <div className="mt-5 space-y-4 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <span className="text-gray-500">Nationality</span>
                  <span className="font-semibold text-white">{driver.nationality} ({nationalityCode})</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <span className="text-gray-500">Date of Birth</span>
                  <span className="font-semibold text-white">{formatDate(driver.dateOfBirth)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <span className="text-gray-500">Age</span>
                  <span className="font-semibold text-white">{age > 0 ? `${age}` : "—"}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                  <span className="text-gray-500">Season Team</span>
                  <span className="font-semibold text-white">{selectedSeason.teamName}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-gray-500">Logged Rounds</span>
                  <span className="font-semibold text-white">{selectedSeason.completedRounds}</span>
                </div>
              </div>
            </article>

            <article className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
              <h2 className="font-display text-2xl font-bold text-white">Career Totals</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <StatTile label="Starts" value={formatNumber(stats.starts)} />
                <StatTile label="Wins" value={formatNumber(stats.wins)} />
                <StatTile label="Poles" value={formatNumber(stats.poles)} />
                <StatTile label="Podiums" value={formatNumber(stats.podiums)} />
                <StatTile label="Championships" value={formatNumber(stats.championships)} />
                <StatTile label="Current Team" value={profile.teamName} />
              </div>
            </article>
          </aside>
        </section>

        {(neighbors.previous || neighbors.next) ? (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            {neighbors.previous ? (
              <Link
                href={`/f1/driver/${neighbors.previous.driverId}`}
                className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-5 transition-colors hover:border-white/20"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Previous Driver</p>
                <p className="mt-2 font-display text-2xl font-bold text-white">
                  {neighbors.previous.name}
                </p>
                <p className="mt-1 text-sm text-gray-500">{neighbors.previous.context}</p>
              </Link>
            ) : <div />}

            {neighbors.next ? (
              <Link
                href={`/f1/driver/${neighbors.next.driverId}`}
                className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-5 text-right transition-colors hover:border-white/20"
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Next Driver</p>
                <p className="mt-2 font-display text-2xl font-bold text-white">
                  {neighbors.next.name}
                </p>
                <p className="mt-1 text-sm text-gray-500">{neighbors.next.context}</p>
              </Link>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}
