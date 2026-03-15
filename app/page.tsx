import LandingFooter from "@/components/LandingFooter";
import LandingHero from "@/components/LandingHero";
import LandingNav from "@/components/LandingNav";
import GridPreviewSection from "@/components/GridPreviewSection";
import { getRaceCalendar, isScheduledRace, isUpcomingRace } from "@/lib/f1";

export default async function HomePage() {
  const raceCalendar = (await getRaceCalendar()).filter(isScheduledRace);
  const nextRace = raceCalendar.find(isUpcomingRace) ?? raceCalendar[0] ?? null;

  return (
    <main className="relative overflow-hidden bg-black">
      <LandingNav />
      <LandingHero nextRace={nextRace} />
      <section id="explore-section" className="relative scroll-mt-28">
        <GridPreviewSection />
      </section>
      <LandingFooter />
    </main>
  );
}
