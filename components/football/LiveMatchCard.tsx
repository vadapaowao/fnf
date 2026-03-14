"use client";

import Image from "next/image";
import Link from "next/link";

import { useFavoriteClub } from "@/hooks/useFavoriteClub";
import { formatKickoffLabel, getMatchStateLabel, isMatchLive, type Match } from "@/lib/football-api";
import { cn } from "@/lib/utils";

type LiveMatchCardProps = {
  match: Match;
  className?: string;
};

function renderScore(value: number | null) {
  return value === null ? "-" : String(value);
}

export default function LiveMatchCard({ match, className }: LiveMatchCardProps) {
  const { favoriteClubId } = useFavoriteClub();
  const live = isMatchLive(match.status);
  const favoriteMatch = favoriteClubId !== null && (match.homeTeam.id === favoriteClubId || match.awayTeam.id === favoriteClubId);
  const progress = live && match.minute ? Math.min((match.minute / 90) * 100, 100) : 0;

  return (
    <Link
      href={`/football/match/${match.id}`}
      className={cn(
        "group block min-w-[290px] overflow-hidden rounded-2xl border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C] shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-transform duration-200 hover:-translate-y-1",
        className
      )}
    >
      <div className="border-l-[3px] border-[#00E676] p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="rounded-full border border-[rgba(0,230,118,0.2)] bg-[#07110A] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#69F0AE]">
            {match.competition.code || match.competition.name}
          </span>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em]">
            {favoriteMatch ? <span className="text-[#69F0AE]">⭐</span> : null}
            {live ? (
              <span className="inline-flex items-center gap-1 text-[#FF1744]">
                <span className="live-pulse inline-flex h-2.5 w-2.5 rounded-full bg-[#FF1744]" />
                LIVE
              </span>
            ) : (
              <span className="text-[#8A9E8C]">{formatKickoffLabel(match.utcDate)}</span>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-3">
              {match.homeTeam.crest ? (
                <Image src={match.homeTeam.crest} alt={match.homeTeam.name} width={36} height={36} className="h-9 w-9 object-contain" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(0,230,118,0.12)] bg-[#07110A] text-[10px] font-bold text-[#69F0AE]">
                  {match.homeTeam.tla}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{match.homeTeam.shortName}</p>
                <p className="mt-1 text-[11px] text-[#8A9E8C]">Home</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="font-mono text-3xl font-bold tracking-tight text-white">
              {renderScore(match.score.fullTime.home)}<span className="mx-2 text-[#69F0AE]">:</span>{renderScore(match.score.fullTime.away)}
            </p>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#8A9E8C]">
              {getMatchStateLabel(match)}
            </p>
          </div>

          <div className="min-w-0 text-right">
            <div className="flex items-center justify-end gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">{match.awayTeam.shortName}</p>
                <p className="mt-1 text-[11px] text-[#8A9E8C]">Away</p>
              </div>
              {match.awayTeam.crest ? (
                <Image src={match.awayTeam.crest} alt={match.awayTeam.name} width={36} height={36} className="h-9 w-9 object-contain" />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(0,230,118,0.12)] bg-[#07110A] text-[10px] font-bold text-[#69F0AE]">
                  {match.awayTeam.tla}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 text-[11px] text-[#8A9E8C]">
          <span>{live ? `${match.minute ?? 0}' on the clock` : match.venue ?? "Venue TBD"}</span>
          <span>{match.matchday ? `Matchday ${match.matchday}` : match.stage ?? "Fixture"}</span>
        </div>

        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[rgba(0,230,118,0.08)]">
          <div
            className={cn("h-full rounded-full transition-all", live ? "bg-[#FF1744]" : "bg-[#00E676]/35")}
            style={{ width: `${live ? progress : 0}%` }}
          />
        </div>
      </div>
    </Link>
  );
}
