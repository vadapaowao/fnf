"use client";

import Image from "next/image";
import Link from "next/link";

import FormGuide from "@/components/football/FormGuide";
import { useFavoriteClub } from "@/hooks/useFavoriteClub";
import type { StandingRow } from "@/lib/football-api";
import { cn } from "@/lib/utils";

type StandingsTableProps = {
  standings: StandingRow[];
};

function getRowTone(position: number, totalRows: number) {
  if (position <= 4) {
    return "border-l-[#69F0AE] bg-[rgba(105,240,174,0.06)]";
  }

  if (position === 5) {
    return "border-l-[#FFB74D] bg-[rgba(255,183,77,0.06)]";
  }

  if (position >= totalRows - 2) {
    return "border-l-[#FF5252] bg-[rgba(255,82,82,0.06)]";
  }

  return "border-l-transparent";
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  const { favoriteClubId } = useFavoriteClub();

  if (standings.length === 0) {
    return (
      <div className="rounded-2xl border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C] p-6 text-sm text-[#8A9E8C]">
        Data unavailable.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr className="border-b border-[rgba(0,230,118,0.12)] bg-[#07110A] text-[10px] font-bold uppercase tracking-[0.18em] text-[#69F0AE]">
              <th className="px-4 py-4">Pos</th>
              <th className="px-4 py-4">Club</th>
              <th className="px-3 py-4 text-center">P</th>
              <th className="px-3 py-4 text-center">W</th>
              <th className="px-3 py-4 text-center">D</th>
              <th className="px-3 py-4 text-center">L</th>
              <th className="px-3 py-4 text-center">GD</th>
              <th className="px-3 py-4 text-center">Pts</th>
              <th className="px-4 py-4">Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row) => {
              const favorite = favoriteClubId !== null && row.team.id === favoriteClubId;

              return (
                <tr
                  key={row.team.id}
                  className={cn(
                    "border-l-[3px] border-b border-[rgba(0,230,118,0.08)] text-sm text-white",
                    getRowTone(row.position, standings.length),
                    favorite ? "bg-[rgba(0,230,118,0.1)]" : ""
                  )}
                >
                  <td className="px-4 py-4 font-mono text-sm font-bold text-white">{row.position}</td>
                  <td className="px-4 py-4">
                    <Link href={`/football/club/${row.team.id}`} className="flex items-center gap-3 hover:text-[#69F0AE]">
                      {row.team.crest ? (
                        <Image src={row.team.crest} alt={row.team.name} width={28} height={28} className="h-7 w-7 object-contain" />
                      ) : (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(0,230,118,0.12)] bg-[#07110A] text-[10px] font-bold text-[#69F0AE]">
                          {row.team.tla}
                        </span>
                      )}
                      <div>
                        <p className="font-semibold text-white">{row.team.shortName}</p>
                        {favorite ? <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#69F0AE]">My club</p> : null}
                      </div>
                    </Link>
                  </td>
                  <td className="px-3 py-4 text-center font-mono">{row.playedGames}</td>
                  <td className="px-3 py-4 text-center font-mono">{row.won}</td>
                  <td className="px-3 py-4 text-center font-mono">{row.draw}</td>
                  <td className="px-3 py-4 text-center font-mono">{row.lost}</td>
                  <td className="px-3 py-4 text-center font-mono">{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</td>
                  <td className="px-3 py-4 text-center font-mono font-bold text-[#69F0AE]">{row.points}</td>
                  <td className="px-4 py-4">
                    <FormGuide results={row.form} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
