import LandingNav from "@/components/LandingNav";
import LandingHero from "@/components/LandingHero";
import GridPreviewSection from "@/components/GridPreviewSection";
import PitchSection from "@/components/PitchSection";
import LandingFooter from "@/components/LandingFooter";

export default async function HomePage() {
  return (
    <div className="bg-background-light dark:bg-background-dark">
      <LandingNav />
      <LandingHero />
      <section id="explore-section" className="scroll-mt-28">
        <GridPreviewSection />
      </section>
      <PitchSection />
      <LandingFooter />
    </div>
  );
}
