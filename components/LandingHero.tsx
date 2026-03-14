import Link from "next/link";

import LocalDateTimeText from "@/components/f1/LocalDateTimeText";
import type { Race } from "@/lib/f1";

type LandingHeroProps = {
  nextRace: Race | null;
};

const primaryCards = [
  {
    title: "Deep Dive",
    eyebrow: "Go proper nerd mode",
    copy: "Track map, weekend flow, and the bits that explain why the order changed.",
    href: "/f1"
  },
  {
    title: "Quick Results",
    eyebrow: "Need the answer fast?",
    copy: "Latest result, driver table, constructor order. No detours.",
    href: "/f1/standings"
  }
] as const;

export default function LandingHero({ nextRace }: LandingHeroProps) {
  return (
    <header id="hero" className="relative overflow-hidden bg-black px-4 pb-14 pt-28 md:pb-18 md:pt-32">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(180,20,0,0.36)_0%,rgba(17,4,4,0.94)_42%,#000_74%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:52px_52px] opacity-15" />
        <div className="hero-scan absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,transparent_0%,rgba(225,6,0,0.16)_45%,transparent_100%)]" />
        <div className="absolute -left-20 top-16 h-72 w-72 rounded-full bg-[#E10600]/18 blur-[120px]" />
        <div className="absolute bottom-4 right-0 h-96 w-96 rounded-full bg-[#5A0D08]/22 blur-[140px]" />
        <div className="hero-track-drift absolute inset-x-[-8%] top-[10%] hidden h-[56%] lg:block">
          <svg className="h-full w-full" fill="none" viewBox="0 0 1600 720" xmlns="http://www.w3.org/2000/svg">
            <path
              className="hero-track-outline"
              d="M90 466C142 388 214 340 305 324C375 312 414 249 468 213C539 165 648 162 726 203C789 236 839 301 913 323C1010 352 1099 300 1190 333C1267 361 1328 434 1396 460C1464 486 1514 473 1564 426"
              stroke="rgba(255,255,255,0.3)"
              strokeLinecap="round"
              strokeWidth="4"
            />
            <path
              d="M90 466C142 388 214 340 305 324C375 312 414 249 468 213C539 165 648 162 726 203C789 236 839 301 913 323C1010 352 1099 300 1190 333C1267 361 1328 434 1396 460C1464 486 1514 473 1564 426"
              stroke="rgba(225,6,0,0.82)"
              strokeLinecap="round"
              strokeWidth="8"
            />
          </svg>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-end">
          <div className="max-w-3xl">
            <h1
              className="hero-card-reveal font-display text-6xl font-black italic leading-[0.88] tracking-[-0.06em] text-white drop-shadow-[0_0_28px_rgba(225,6,0,0.58)] md:text-8xl lg:text-[8rem]"
              style={{ animationDelay: "120ms" }}
            >
              THE GRID
            </h1>
            <p
              className="hero-card-reveal mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl"
              style={{ animationDelay: "220ms" }}
            >
              Drivers, circuits, standings, and the whole weekend story without the filler.
            </p>
            <div
              className="hero-card-reveal mt-8 inline-flex max-w-full flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-3"
              style={{ animationDelay: "300ms" }}
            >
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                Next lights out
              </span>
              <p className="text-sm text-gray-300">
                {nextRace ? (
                  <>
                    {nextRace.raceName} •{" "}
                    <LocalDateTimeText
                      iso={`${nextRace.date}T${nextRace.time}`}
                      fallback={nextRace.date}
                      options={{
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                        timeZoneName: "short"
                      }}
                    />
                  </>
                ) : (
                  "Season data loading"
                )}
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(225,6,0,0.14),transparent_42%)] blur-2xl" />
            <div className="relative grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                {primaryCards.map((card, index) => (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="hero-card-reveal group relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[linear-gradient(160deg,rgba(18,18,18,0.92),rgba(6,6,6,0.98))] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
                    style={{ animationDelay: `${380 + index * 120}ms` }}
                  >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(225,6,0,0.14),transparent_42%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex h-full flex-col justify-between gap-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{card.eyebrow}</p>
                        <h2 className="mt-3 font-display text-3xl font-black italic text-white">{card.title}</h2>
                        <p className="mt-3 text-sm leading-relaxed text-gray-400">{card.copy}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        <span>Open</span>
                        <span className="material-icons text-base text-white transition-transform duration-300 group-hover:translate-x-1">
                          arrow_forward
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <Link
                href="/f1/leclerc"
                className="hero-card-reveal group relative overflow-hidden rounded-[1.6rem] border border-[#FF9F6A]/28 bg-[radial-gradient(circle_at_top_right,rgba(255,159,106,0.14),transparent_42%),linear-gradient(135deg,#17100E_0%,#090909_100%)] px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#FF9F6A]/45"
                style={{ animationDelay: "620ms" }}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-black italic text-white">
                      I just came here for Charles Leclerc 🌶️
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300">Understandable ;)</p>
                  </div>
                  <span className="material-icons self-start text-[#FFD0B5] transition-transform duration-300 group-hover:translate-x-1 md:self-center">
                    bolt
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
