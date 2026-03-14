import LandingNav from "@/components/LandingNav";
import LandingHero from "@/components/LandingHero";
import GridPreviewSection from "@/components/GridPreviewSection";
import { getConstructorStandings, getDriverStandings, getRaceCalendar, isUpcomingRace } from "@/lib/f1";

export default async function HomePage() {
  const [raceCalendar, driverStandings, constructorStandings] = await Promise.all([
    getRaceCalendar(),
    getDriverStandings(),
    getConstructorStandings(),
  ]);
  const nextRace = raceCalendar.find(isUpcomingRace) ?? raceCalendar[0] ?? null;
  const leadDriver = driverStandings[0] ?? null;
  const leadConstructor = constructorStandings[0] ?? null;
  const landingFeatures = [
    {
      eyebrow: "01",
      title: "Race Intel",
      copy: "Weekend pulse, sector context, and circuit-specific readouts built for race week instead of generic sports browsing.",
      accent: "Weekend Pulse",
    },
    {
      eyebrow: "02",
      title: "Driver Dossiers",
      copy: "Full 2026 grid with season pacing, archive context, and teammate comparison in one place.",
      accent: "Full Grid Access",
    },
    {
      eyebrow: "03",
      title: "Constructor Form",
      copy: "Team points flow, lineup context, and championship pressure surfaces that are easy to scan fast.",
      accent: "11 Constructors",
    },
  ];

  return (
    <div className="bg-background-light dark:bg-background-dark">
      <LandingNav />
      <LandingHero nextRace={nextRace} leadDriver={leadDriver} leadConstructor={leadConstructor} />
      <section
        id="explore-section"
        className="scroll-mt-28 border-y border-white/5 bg-[radial-gradient(circle_at_top,rgba(225,6,0,0.14),transparent_35%),linear-gradient(180deg,#090909_0%,#050505_100%)] py-20"
      >
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">Why It Feels Better</p>
              <h2 className="mt-3 font-display text-4xl font-black italic tracking-tight text-white md:text-5xl">
                Built like a race-control desk, not a news feed.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-400">
                The landing page should tell users exactly why this product exists: faster race understanding, sharper driver context, and cleaner team intelligence.
              </p>
            </div>
            <div className="rounded-[2rem] border border-primary/15 bg-[linear-gradient(145deg,rgba(21,21,21,0.95),rgba(8,8,8,0.98))] p-6 shadow-[0_24px_80px_rgba(225,6,0,0.1)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Product Thesis</p>
                  <p className="mt-2 max-w-xl text-lg font-semibold text-white">
                    See why a Grand Prix unfolded, not just who finished where.
                  </p>
                </div>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                  F1 Only
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {landingFeatures.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-[1.75rem] border border-white/10 bg-[linear-gradient(160deg,rgba(20,20,20,0.98),rgba(8,8,8,0.98))] p-6 shadow-[0_20px_60px_rgba(225,6,0,0.08)] transition-transform duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-sm font-bold tracking-[0.18em] text-primary">{feature.eyebrow}</p>
                  <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
                    {feature.accent}
                  </span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-bold italic text-white">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-400">{feature.copy}</p>
                <div className="mt-8 h-px w-full bg-gradient-to-r from-primary/60 via-white/10 to-transparent" />
              </article>
            ))}
          </div>
        </div>
      </section>
      <section>
        <GridPreviewSection />
      </section>
    </div>
  );
}
