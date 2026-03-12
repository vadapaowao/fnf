import Link from "next/link";
import { Driver } from "@/lib/f1";

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

type HelmetPalette = {
    shell: string;
    accent: string;
    visor: string;
    ring: string;
    backgroundFrom: string;
    backgroundTo: string;
};

const TEAM_PALETTES: Record<string, HelmetPalette> = {
    mclaren: {
        shell: "#F58020",
        accent: "#111111",
        visor: "#111827",
        ring: "#F59E0B",
        backgroundFrom: "#2A1304",
        backgroundTo: "#0C0C0C",
    },
    ferrari: {
        shell: "#DC2626",
        accent: "#FBBF24",
        visor: "#1F2937",
        ring: "#EF4444",
        backgroundFrom: "#2A0505",
        backgroundTo: "#0C0C0C",
    },
    mercedes: {
        shell: "#0F766E",
        accent: "#5EEAD4",
        visor: "#111827",
        ring: "#2DD4BF",
        backgroundFrom: "#03211D",
        backgroundTo: "#0C0C0C",
    },
    red_bull: {
        shell: "#1D4ED8",
        accent: "#EF4444",
        visor: "#111827",
        ring: "#2563EB",
        backgroundFrom: "#050A2A",
        backgroundTo: "#0C0C0C",
    },
    williams: {
        shell: "#2563EB",
        accent: "#38BDF8",
        visor: "#111827",
        ring: "#60A5FA",
        backgroundFrom: "#05142A",
        backgroundTo: "#0C0C0C",
    },
    aston_martin: {
        shell: "#065F46",
        accent: "#34D399",
        visor: "#111827",
        ring: "#10B981",
        backgroundFrom: "#042014",
        backgroundTo: "#0C0C0C",
    },
    alpine: {
        shell: "#1D4ED8",
        accent: "#F472B6",
        visor: "#111827",
        ring: "#3B82F6",
        backgroundFrom: "#07122B",
        backgroundTo: "#0C0C0C",
    },
    rb: {
        shell: "#4338CA",
        accent: "#A78BFA",
        visor: "#111827",
        ring: "#6366F1",
        backgroundFrom: "#100A2C",
        backgroundTo: "#0C0C0C",
    },
    sauber: {
        shell: "#22C55E",
        accent: "#0F172A",
        visor: "#111827",
        ring: "#4ADE80",
        backgroundFrom: "#05200E",
        backgroundTo: "#0C0C0C",
    },
    haas: {
        shell: "#F3F4F6",
        accent: "#EF4444",
        visor: "#111827",
        ring: "#D1D5DB",
        backgroundFrom: "#212121",
        backgroundTo: "#0C0C0C",
    },
};

const fallbackPalettes: HelmetPalette[] = [
    {
        shell: "#6366F1",
        accent: "#A5B4FC",
        visor: "#111827",
        ring: "#818CF8",
        backgroundFrom: "#140A2B",
        backgroundTo: "#0C0C0C",
    },
    {
        shell: "#EC4899",
        accent: "#F9A8D4",
        visor: "#111827",
        ring: "#F472B6",
        backgroundFrom: "#2A0A1B",
        backgroundTo: "#0C0C0C",
    },
    {
        shell: "#14B8A6",
        accent: "#5EEAD4",
        visor: "#111827",
        ring: "#2DD4BF",
        backgroundFrom: "#04211F",
        backgroundTo: "#0C0C0C",
    },
];

function getSeedHash(seed: string): number {
    let hash = 0;
    for (let index = 0; index < seed.length; index += 1) {
        hash = (hash << 5) - hash + seed.charCodeAt(index);
        hash |= 0;
    }

    return Math.abs(hash);
}

function getHelmetPalette(driverId: string, teamId?: string): HelmetPalette {
    if (teamId && TEAM_PALETTES[teamId]) {
        return TEAM_PALETTES[teamId];
    }

    const hash = getSeedHash(driverId);
    return fallbackPalettes[hash % fallbackPalettes.length];
}

interface DriverCardProps {
    driver: Driver;
    teamId?: string;
    teamName?: string;
}

export default function DriverCard({ driver, teamId, teamName }: DriverCardProps) {
    const flagEmoji = nationalityFlags[driver.nationality] || "🏁";
    const nationalityCode = getNationalityCode(driver.nationality);
    const palette = getHelmetPalette(driver.driverId, teamId);
    const helmetNumber = driver.permanentNumber === "—" ? driver.code : driver.permanentNumber;

    return (
        <Link
            href={`/f1/driver/${driver.driverId}`}
            className="group relative w-full rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#141414] to-[#090909] p-5 transition-all duration-300 hover:border-grid-primary/50 hover:shadow-[0_0_24px_rgba(225,6,0,0.2)]"
        >
            <div className="pointer-events-none absolute -right-4 -top-8 text-[120px] font-black leading-none text-white/5 transition-all duration-500 group-hover:text-grid-primary/10">
                {helmetNumber}
            </div>

            <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">Driver</p>
                    <h3 className="font-display text-2xl font-bold tracking-tight text-white">
                        {driver.givenName} {driver.familyName}
                    </h3>
                </div>
                <div className="text-right">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-gray-500">Team</p>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-300">
                        {teamName ?? "F1 Team"}
                    </p>
                </div>
            </div>

            <div
                className="relative z-10 mb-5 flex items-center justify-center rounded-2xl border border-white/10 px-4 py-5"
                style={{ background: `linear-gradient(135deg, ${palette.backgroundFrom}, ${palette.backgroundTo})` }}
            >
                <div
                    className="relative h-40 w-40 rounded-full border-2"
                    style={{ borderColor: palette.ring, boxShadow: `0 0 24px ${palette.ring}55` }}
                >
                    <svg viewBox="0 0 160 160" className="h-full w-full">
                        <circle cx="80" cy="80" r="78" fill="rgba(255,255,255,0.04)" />
                        <path
                            d="M27 94C27 58 55 31 90 31C120 31 141 53 141 81V95C141 112 127 126 110 126H53C39 126 27 114 27 100V94Z"
                            fill={palette.shell}
                        />
                        <path
                            d="M44 87C47 70 61 58 79 58H131C136 58 140 62 140 67C140 82 128 94 113 94H44V87Z"
                            fill={palette.visor}
                        />
                        <path d="M26 99H73C82 99 90 106 90 115V126H52C38 126 26 114 26 99Z" fill={palette.accent} />
                        <path d="M93 34L122 34L122 125L93 125Z" fill={palette.accent} opacity="0.9" />
                        <path d="M70 108H105" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="64" cy="52" r="8" fill="rgba(255,255,255,0.25)" />
                        <text
                            x="103"
                            y="82"
                            textAnchor="middle"
                            fontSize="18"
                            fontWeight="800"
                            fill="white"
                            fontFamily="monospace"
                        >
                            {driver.code}
                        </text>
                        <text
                            x="57"
                            y="121"
                            textAnchor="middle"
                            fontSize="16"
                            fontWeight="800"
                            fill="#111827"
                            fontFamily="monospace"
                        >
                            {helmetNumber}
                        </text>
                    </svg>
                    <div className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_45%)]" />
                </div>
            </div>

            <div className="relative z-10 border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-gray-500">Nationality</span>
                        <span className="text-sm font-semibold text-white">
                            {flagEmoji} {nationalityCode}
                        </span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] uppercase tracking-[0.14em] text-gray-500">Number</span>
                        <span className="font-mono text-lg font-bold text-grid-primary">{helmetNumber}</span>
                    </div>
                </div>
                <div className="mt-3 h-1 w-full rounded-full bg-white/10">
                    <div
                        className="h-full rounded-full"
                        style={{
                            width: `${35 + (getSeedHash(driver.driverId) % 55)}%`,
                            background: `linear-gradient(90deg, ${palette.accent}, ${palette.ring})`,
                        }}
                    />
                </div>
                <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-gray-500">Helmet Signature Index</p>
            </div>
        </Link>
    );
}
