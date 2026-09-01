import Link from "next/link";

import type { Driver, DriverStanding } from "@/lib/f1";
import DriverIdentityAvatar from "@/components/f1/drivers/DriverIdentityAvatar";

const NATIONALITY_FLAGS: Record<string, string> = {
    Dutch: "NL",
    British: "GB",
    Monegasque: "MC",
    Australian: "AU",
    Spanish: "ES",
    Mexican: "MX",
    German: "DE",
    Finnish: "FI",
    French: "FR",
    Canadian: "CA",
    Danish: "DK",
    Thai: "TH",
    Chinese: "CN",
    Japanese: "JP",
    American: "US",
    Italian: "IT",
    Polish: "PL",
    Argentine: "AR",
    New: "NZ",
    Brazilian: "BR"
};

const TEAM_TONES: Record<string, string> = {
    red_bull: "#1E41FF",
    ferrari: "#DC0000",
    mercedes: "#00D2BE",
    mclaren: "#FF8000",
    aston_martin: "#006F62",
    alpine: "#0090FF",
    williams: "#005AFF",
    rb: "#2B4562",
    sauber: "#52E252",
    haas: "#B6BABD",
};

function getNationalityCode(nationality: string) {
    return NATIONALITY_FLAGS[nationality] ?? nationality.toUpperCase().slice(0, 3);
}

function toPoints(value?: string) {
    const parsed = Number(value ?? "0");
    return Number.isFinite(parsed) ? parsed : 0;
}

interface DriverCardProps {
    driver: Driver;
    teamId?: string;
    teamName?: string;
    standing?: DriverStanding;
}

export default function DriverCard({ driver, teamId, teamName, standing }: DriverCardProps) {
    const resolvedTeamId = teamId ?? standing?.constructors[0]?.constructorId;
    const resolvedTeamName = teamName ?? standing?.constructors[0]?.name ?? "F1 Team";
    const accentColor = TEAM_TONES[resolvedTeamId ?? ""] ?? "#E10600";
    const number = driver.permanentNumber || driver.code || "—";
    const points = toPoints(standing?.points);

    return (
        <Link
            href={`/f1/driver/${driver.driverId}`}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark transition-all duration-200 hover:border-grid-primary/40 hover:shadow-[0_18px_50px_rgba(225,6,0,0.18)]"
        >
            <div
                className="pointer-events-none absolute inset-x-0 top-0 h-24 opacity-80 blur-2xl"
                style={{ background: `linear-gradient(90deg, ${accentColor}55, transparent 65%)` }}
            />

            <div className="relative p-4 sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-2 sm:mb-5 sm:gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-300">
                            #{number}
                        </span>
                        <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-gray-300">
                            {getNationalityCode(driver.nationality)}
                        </span>
                    </div>
                    <span className="rounded px-2 py-1 text-xs font-bold uppercase tracking-[0.14em]" style={{ backgroundColor: `${accentColor}22`, color: accentColor }}>
                        {standing ? "2026 season" : "Profile"}
                    </span>
                </div>

                <div className="flex min-w-0 items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">{resolvedTeamName}</p>
                        <h3 className="mt-2 break-words font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                            {driver.givenName} {driver.familyName}
                        </h3>
                        <p className="mt-2 text-sm text-gray-400">
                            {driver.nationality}
                        </p>
                    </div>

                    <DriverIdentityAvatar
                        givenName={driver.givenName}
                        familyName={driver.familyName}
                        accentColor={accentColor}
                        variant="card"
                        className="shrink-0"
                    />
                </div>

                <div className="mt-5 rounded-lg border border-white/5 bg-black/20 p-3 sm:mt-6 sm:p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">At a Glance</p>
                    <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                                Code
                            </p>
                            <p className="mt-1 text-lg font-bold text-white sm:text-xl">{driver.code || "—"}</p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                                {standing ? "2026 Pts" : "Number"}
                            </p>
                            <p className="mt-1 text-lg font-bold text-white sm:text-xl">{standing ? `${points}` : number}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
                                {standing ? "Wins" : "Number"}
                            </p>
                            <p className="mt-1 text-lg font-bold sm:text-xl" style={{ color: accentColor }}>
                                {standing ? standing.wins : number}
                            </p>
                        </div>
                    </div>

                    <div
                        className="mt-4 h-1.5 rounded-full"
                        style={{ background: `linear-gradient(90deg, ${accentColor}, transparent)` }}
                    />
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
                    <span>{resolvedTeamName}</span>
                    <span className="text-grid-primary transition-colors group-hover:text-white">Open Profile</span>
                </div>
            </div>
        </Link>
    );
}
