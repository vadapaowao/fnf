import { DriverStanding } from "@/lib/f1";
import { getDriverImageUrl } from "@/lib/f1";

interface DriverHeroProps {
    standing: DriverStanding;
}

export default function DriverHero({ standing }: DriverHeroProps) {
    const { driver, constructors } = standing;
    const team = constructors[0];
    const driverImage = getDriverImageUrl(driver);

    // Nationality to flag URL mapping
    const flagUrls: Record<string, string> = {
        Dutch: "https://flagcdn.com/nl.svg",
        British: "https://flagcdn.com/gb.svg",
        Monegasque: "https://flagcdn.com/mc.svg",
        Australian: "https://flagcdn.com/au.svg",
        Spanish: "https://flagcdn.com/es.svg",
        Mexican: "https://flagcdn.com/mx.svg",
        German: "https://flagcdn.com/de.svg",
        Finnish: "https://flagcdn.com/fi.svg",
        French: "https://flagcdn.com/fr.svg",
        Canadian: "https://flagcdn.com/ca.svg",
        Danish: "https://flagcdn.com/dk.svg",
        Thai: "https://flagcdn.com/th.svg",
        Chinese: "https://flagcdn.com/cn.svg",
        Japanese: "https://flagcdn.com/jp.svg",
        American: "https://flagcdn.com/us.svg",
        Italian: "https://flagcdn.com/it.svg",
        Polish: "https://flagcdn.com/pl.svg",
        Argentine: "https://flagcdn.com/ar.svg",
    };

    const flagUrl = flagUrls[driver.nationality] || "https://flagcdn.com/un.svg";

    return (
        <div className="lg:w-[45%] xl:w-[40%] relative flex flex-col lg:h-[calc(100vh-80px)] lg:fixed lg:left-0 lg:top-20 z-10">
            {/* Driver Name Overlay */}
            <div className="absolute top-6 left-8 lg:left-12 z-30">
                <h1 className="text-5xl lg:text-7xl font-bold font-display uppercase tracking-tighter leading-[0.9] relative drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
                    {driver.givenName}
                    <br />
                    <span className="text-white">{driver.familyName}</span>
                </h1>

                {/* Team Badge */}
                <div className="flex items-center gap-3 mt-4 bg-background-dark/30 backdrop-blur-sm p-2 rounded-lg inline-flex border border-white/5">
                    <img
                        src={flagUrl}
                        className="w-8 h-auto rounded shadow-sm opacity-90"
                        alt={`${driver.nationality} Flag`}
                    />
                    <span className="text-sm lg:text-lg font-display text-gray-200 tracking-widest uppercase font-bold">
                        {team?.name || "Team TBA"}
                    </span>
                </div>
            </div>

            {/* Ghosted Driver Number */}
            <div className="absolute top-1/3 left-8 lg:left-12 z-0 pointer-events-none opacity-50">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-8xl lg:text-[12rem] font-bold text-outline font-display leading-none">
                        {driver.permanentNumber}
                    </span>
                </div>
            </div>

            {/* Driver Image with Gradient Masks */}
            <div className="relative w-full h-[60vh] lg:h-full flex items-end justify-center pointer-events-none mt-auto">
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent z-10 h-1/2 bottom-0 w-full"></div>
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-background-dark via-transparent to-transparent z-10 w-1/4"></div>
                <div className="absolute inset-y-0 right-0 bg-gradient-to-l from-background-dark via-transparent to-transparent z-10 w-1/4"></div>

                {/* Driver Image */}
                <img
                    src={driverImage}
                    alt={`${driver.givenName} ${driver.familyName}`}
                    className="driver-aura h-[90%] w-auto object-cover object-bottom translate-y-0 relative z-0"
                />
            </div>

            <style jsx>{`
        .text-outline {
          -webkit-text-stroke: 2px rgba(255, 255, 255, 0.1);
          color: transparent;
        }
        .driver-aura {
          filter: drop-shadow(0 0 40px rgba(255, 40, 0, 0.4));
          mask-image: linear-gradient(
            to bottom,
            black 80%,
            transparent 100%
          );
          -webkit-mask-image: linear-gradient(
            to bottom,
            black 80%,
            transparent 100%
          );
        }
      `}</style>
        </div>
    );
}
