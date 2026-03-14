import Link from "next/link";

import { FOOTBALL_COMPETITIONS, type SupportedCompetitionSlug } from "@/lib/football-api";
import { cn } from "@/lib/utils";

type CompetitionPickerProps = {
  selected: SupportedCompetitionSlug | "all";
  mode?: "hub" | "section";
  className?: string;
};

export default function CompetitionPicker({ selected, mode = "hub", className }: CompetitionPickerProps) {
  const items = [
    { slug: "all", label: "All", href: "/football" },
    ...FOOTBALL_COMPETITIONS.map((competition) => ({
      slug: competition.slug,
      label: competition.shortLabel,
      href: mode === "hub" ? `/football?competition=${competition.slug}` : `/football/${competition.slug}`,
    })),
  ] as const;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((item) => {
        const active = selected === item.slug;

        return (
          <Link
            key={item.slug}
            href={item.href}
            className={cn(
              "rounded-full border px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors",
              active
                ? "border-[#00E676]/40 bg-[#00E676]/15 text-white"
                : "border-[rgba(0,230,118,0.12)] bg-[#07110A] text-[#8A9E8C] hover:border-[#00E676]/30 hover:text-white"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
