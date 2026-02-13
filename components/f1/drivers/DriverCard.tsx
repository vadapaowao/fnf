import Link from "next/link";
import { Driver } from "@/lib/f1";
import { getDriverImageUrl } from "@/lib/f1";

// Nationality to flag emoji mapping
const nationalityFlags: Record<string, string> = {
    Dutch: "🇳🇱",
    British: "🇬🇧",
    Monegasque: "🇲🇨",
    Australian: "🇦🇺",
    Spanish: "🇪🇸",
    Mexican: "🇲🇽",
    German: "🇩🇪",
    Finnish: "🇫🇮",
    French: "🇫🇷",
    Canadian: "🇨🇦",
    Danish: "🇩🇰",
    Thai: "🇹🇭",
    Chinese: "🇨🇳",
    Japanese: "🇯🇵",
    American: "🇺🇸",
    Italian: "🇮🇹",
    Polish: "🇵🇱",
    Argentine: "🇦🇷",
    New: "🇳🇿", // New Zealander
    Brazilian: "🇧🇷",
};

function getNationalityCode(nationality: string): string {
    const codes: Record<string, string> = {
        Dutch: "NED",
        British: "GBR",
        Monegasque: "MON",
        Australian: "AUS",
        Spanish: "ESP",
        Mexican: "MEX",
        German: "GER",
        Finnish: "FIN",
        French: "FRA",
        Canadian: "CAN",
        Danish: "DEN",
        Thai: "THA",
        Chinese: "CHN",
        Japanese: "JPN",
        American: "USA",
        Italian: "ITA",
        Polish: "POL",
        Argentine: "ARG",
        Brazilian: "BRA",
    };
    return codes[nationality] || nationality.toUpperCase().slice(0, 3);
}

interface DriverCardProps {
    driver: Driver;
}

export default function DriverCard({ driver }: DriverCardProps) {
    const driverImage = getDriverImageUrl(driver);
    const flagEmoji = nationalityFlags[driver.nationality] || "🏁";
    const nationalityCode = getNationalityCode(driver.nationality);

    return (
        <Link
            href={`/f1/driver/${driver.driverId}`}
            className="group relative w-full h-[380px] rounded-2xl overflow-hidden bg-surface-dark/40 border border-white/5 hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/20"
        >
            {/* Ghosted Driver Number in Background */}
            <div className="absolute -right-4 -top-8 text-[160px] font-display font-bold text-white/5 group-hover:text-primary/10 transition-all duration-500 z-0 leading-none select-none group-hover:scale-110 group-hover:-translate-x-2 group-hover:-translate-y-2">
                {driver.permanentNumber}
            </div>

            {/* Driver Image */}
            <div className="absolute inset-x-0 bottom-0 h-5/6 z-10 flex items-end justify-center overflow-hidden">
                <img
                    src={driverImage}
                    alt={`${driver.givenName} ${driver.familyName}`}
                    className="w-auto h-full object-contain object-bottom drop-shadow-2xl grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105 group-hover:-translate-y-2"
                />
            </div>

            {/* Gradient Overlay + Info */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 bg-gradient-to-b from-transparent via-transparent to-black/95">
                {/* Driver Name */}
                <div className="flex justify-between items-end mb-2">
                    <div className="flex flex-col">
                        <span className="text-base font-light text-gray-300 font-display uppercase tracking-widest">
                            {driver.givenName}
                        </span>
                        <span className="text-4xl font-bold font-display text-white italic tracking-tighter leading-none [text-shadow:_4px_4px_0px_rgba(255,255,255,0.1)]">
                            {driver.familyName.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-full h-px bg-white/10 mb-4"></div>

                {/* Bottom Stats - Now shows Number and Nationality */}
                <div className="flex justify-between items-center">
                    {/* Driver Number */}
                    <div className="flex flex-col">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                            Number
                        </p>
                        <p className="text-2xl font-bold text-primary font-display">
                            #{driver.permanentNumber}
                        </p>
                    </div>

                    {/* Nationality */}
                    <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1">{flagEmoji}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-mono">
                            {nationalityCode}
                        </span>
                    </div>

                    {/* Driver Code */}
                    <div className="flex flex-col items-end">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
                            Code
                        </p>
                        <p className="text-2xl font-bold text-white font-mono">{driver.code}</p>
                    </div>
                </div>
            </div>
        </Link>
    );
}
