"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import SeasonToggle from "@/components/f1/SeasonToggle";
import FollowToggleButton from "@/components/f1/FollowToggleButton";
import DriverIdentityAvatar from "@/components/f1/drivers/DriverIdentityAvatar";
import SeasonPaceChart from "@/components/f1/drivers/SeasonPaceChart";
import type { DriverHeadToHead, DriverProfileData, DriverSeasonResult, DriverSeasonSnapshot } from "@/lib/driver-profile";

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

function formatSeasonProgress(count: number) {
  return `After ${count} race${count === 1 ? "" : "s"}`;
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

function formatDelta(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(1)}`;
}

function formatAverageFinishValue(value: string) {
  return value === "—" ? "—" : `P${value}`;
}

function formatAverageFinishDelta(value: number) {
  if (!Number.isFinite(value)) {
    return "—";
  }

  const sign = value >= 0 ? "+" : "-";
  return `${sign}${Math.abs(value).toFixed(1)}`;
}

function buildSeasonSummary(
  snapshot: DriverSeasonSnapshot,
  driverName: string,
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
  const opener =
    snapshot.position === 1 && isLiveSeason
      ? `${driverName} leads the ${snapshot.season} Formula 1 championship for ${snapshot.teamName}.`
      : `${driverName} ${isLiveSeason ? "drives for" : "raced for"} ${snapshot.teamName} and ${placement} in the ${snapshot.season} championship on ${snapshot.points} points.`;

  return `${opener} The ${snapshot.season} campaign includes ${podiumLine}.`;
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
  const { standing, age, nationalityCode, stats, season, archive2025, timeline, debutYear, firstWinYear, neighbors, headToHead } = profile;
  const { driver } = standing;
  const [selectedSeasonId, setSelectedSeasonId] = useState(season.season);
  const [resultFilter, setResultFilter] = useState<"all" | "podiums" | "points" | "dnf">("all");

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
  const filteredResults = selectedResults.filter((result) => {
    if (resultFilter === "podiums") {
      return result.finish !== null && result.finish <= 3;
    }

    if (resultFilter === "points") {
      return result.points > 0;
    }

    if (resultFilter === "dnf") {
      return result.finish === null || !result.finishLabel.startsWith("P");
    }

    return true;
  });
  const driverName = `${driver.givenName} ${driver.familyName}`;
  const selectedHeadToHead: DriverHeadToHead | null =
    archive2025 && selectedSeasonId === archive2025.season ? headToHead.archive2025 : headToHead.current;
  const recentDuels = selectedHeadToHead ? [...selectedHeadToHead.raceDuels].slice(-6).reverse() : [];

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
              {selectedSeason.season} Season
            </span>
            {selectedTeamId ? (
              <Link
                href={`/f1/team/${selectedTeamId}`}
                className="rounded border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-300 transition-colors hover:border-white/30 hover:text-white"
              >
                View Team
              </Link>
            ) : null}
            <FollowToggleButton
              type="driver"
              id={driver.driverId}
              label={driverName}
              subtitle={`${selectedTeamName} • ${driver.nationality}`}
              href={`/f1/driver/${driver.driverId}`}
              accentColor={selectedAccentColor}
              season={selectedSeason.season}
              compact
            />
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
              {buildSeasonSummary(selectedSeason, driverName, selectedSeason.season === season.season)}
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-4">
              <StatTile label="Points" value={formatNumber(selectedSeason.points)} hint={formatSeasonProgress(selectedSeason.completedRounds)} />
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
                eyebrow="Season"
                title="Pick a season"
                subtitle="One season at a time."
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
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">Driver vs Teammate</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white">Teammate battle</h2>
                  <p className="mt-2 text-sm leading-relaxed text-gray-400">
                    Grid and finish numbers against the other car.
                  </p>
                </div>
                {selectedHeadToHead ? (
                  <Link
                    href={`/f1/driver/${selectedHeadToHead.teammate.driverId}`}
                    className="rounded border border-white/10 bg-black/20 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-300 transition-colors hover:border-white/30 hover:text-white"
                  >
                    Open {selectedHeadToHead.teammate.code || "Teammate"}
                  </Link>
                ) : null}
              </div>

              {selectedHeadToHead ? (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Teammate</p>
                      <p className="mt-2 text-lg font-bold text-white">{selectedHeadToHead.teammate.name}</p>
                      <p className="mt-1 text-[11px] text-gray-500">{selectedHeadToHead.teamName}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Points split</p>
                      <p className="mt-2 text-lg font-bold text-white">
                        {formatNumber(selectedHeadToHead.pointsSplit.driver)} vs {formatNumber(selectedHeadToHead.pointsSplit.teammate)}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Delta {formatDelta(selectedHeadToHead.pointsSplit.delta)} pts
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Grid head-to-head</p>
                      <p className="mt-2 text-lg font-bold text-white">
                        {selectedHeadToHead.gridHeadToHead.driver}-{selectedHeadToHead.gridHeadToHead.teammate}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">{selectedHeadToHead.gridHeadToHead.ties} ties</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Race finish H2H</p>
                      <p className="mt-2 text-lg font-bold text-white">
                        {selectedHeadToHead.finishHeadToHead.driver}-{selectedHeadToHead.finishHeadToHead.teammate}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">{selectedHeadToHead.finishHeadToHead.ties} ties</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Avg finish</p>
                      <p className="mt-2 text-lg font-bold text-white">
                        {formatAverageFinishValue(selectedHeadToHead.averageFinish.driver)} vs {formatAverageFinishValue(selectedHeadToHead.averageFinish.teammate)}
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Delta {formatAverageFinishDelta(selectedHeadToHead.averageFinish.delta)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">Recent race duels</p>
                        <p className="mt-1 text-[11px] text-gray-500">Latest shared rounds in this season.</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-300">
                        {selectedHeadToHead.season}
                      </span>
                    </div>

                    {recentDuels.length > 0 ? (
                      <div className="mt-4 space-y-2">
                        {recentDuels.map((duel) => (
                          <div
                            key={`${selectedHeadToHead.season}-${duel.round}-${duel.raceName}`}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-[#090909] px-4 py-3"
                          >
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Round {duel.round}</p>
                              <p className="mt-1 text-sm font-bold text-white">{duel.raceName}</p>
                              <p className="mt-1 text-[11px] text-gray-500">{duel.circuitName}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Finish</p>
                              <p className="mt-1 text-sm font-bold text-white">
                                {duel.finishDriver ? `P${duel.finishDriver}` : "—"} / {duel.finishTeammate ? `P${duel.finishTeammate}` : "—"}
                              </p>
                              <p className="mt-1 text-[11px] text-gray-500">
                                Winner: {duel.winner === "driver" ? driver.familyName : duel.winner === "teammate" ? selectedHeadToHead.teammate.name.split(" ").slice(-1)[0] : "Tie"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-black/30 px-4 py-6 text-center">
                        <p className="text-sm text-gray-400">No recent side-by-side races yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-6 text-center">
                  <p className="text-sm text-gray-400">Teammate comparison is not available for this season.</p>
                </div>
              )}
            </article>

            <article className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl font-bold text-white">{selectedSeason.season} Results</h2>
                  <p className="mt-1 text-sm text-gray-500">Full race log for the selected season.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-white/10 bg-black/20 px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-[0.16em] text-gray-300">
                    {formatSeasonProgress(selectedSeason.completedRounds)}
                  </span>
                  <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-black/20 p-1">
                    {[
                      { id: "all", label: "All" },
                      { id: "podiums", label: "Podiums" },
                      { id: "points", label: "Points" },
                      { id: "dnf", label: "DNFs" }
                    ].map((filter) => {
                      const active = resultFilter === filter.id;

                      return (
                        <button
                          key={filter.id}
                          type="button"
                          onClick={() => setResultFilter(filter.id as typeof resultFilter)}
                          className={`rounded px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] transition-colors ${active ? "bg-grid-primary text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {filteredResults.length > 0 ? (
                <div className="mt-5 max-h-[880px] space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredResults.map((result) => (
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
                  <p className="text-sm text-gray-400">No races match this filter.</p>
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
                <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">Quick Read</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-white">Key details</h2>

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
                  <h2 className="font-display text-2xl font-bold text-white">This Season</h2>
                  <p className="mt-1 text-sm text-gray-500">{selectedSeason.season}</p>
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
              <h2 className="font-display text-2xl font-bold text-white">Driver Details</h2>
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
                  <span className="text-gray-500">Rounds Run</span>
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Previous</p>
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">Next</p>
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
