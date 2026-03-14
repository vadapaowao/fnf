import Image from "next/image";
import Link from "next/link";

import type { Scorer } from "@/lib/football-api";

type TopScorersProps = {
  scorers: Scorer[];
};

export default function TopScorers({ scorers }: TopScorersProps) {
  if (scorers.length === 0) {
    return (
      <div className="rounded-2xl border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C] p-6 text-sm text-[#8A9E8C]">
        Data unavailable.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(0,230,118,0.12)] bg-[#0A1A0C]">
      <div className="divide-y divide-[rgba(0,230,118,0.08)]">
        {scorers.map((scorer) => (
          <div key={`${scorer.rank}-${scorer.playerName}`} className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 px-5 py-4">
            <p className="font-mono text-xl font-bold text-[#69F0AE]">{scorer.rank}</p>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{scorer.playerName}</p>
              <Link href={`/football/club/${scorer.team.id}`} className="mt-1 inline-flex items-center gap-2 text-[11px] text-[#8A9E8C] hover:text-white">
                {scorer.team.crest ? (
                  <Image src={scorer.team.crest} alt={scorer.team.name} width={16} height={16} className="h-4 w-4 object-contain" />
                ) : null}
                {scorer.team.shortName}
              </Link>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A9E8C]">Goals</p>
              <p className="mt-1 font-mono text-lg font-bold text-white">{scorer.goals}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8A9E8C]">Assists</p>
              <p className="mt-1 font-mono text-lg font-bold text-white">{scorer.assists ?? "—"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
