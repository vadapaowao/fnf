import { type TrackSector } from "@/lib/f1";

interface TelemetryPanelProps {
    circuitId: string;
    sectors: TrackSector[];
}

export default function TelemetryPanel({ sectors }: TelemetryPanelProps) {
    return (
        <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                Sector Analysis
            </h4>
            <div className="space-y-3">
                {sectors.map((sector) => (
                    <div
                        key={sector.id}
                        className="p-4 rounded-lg bg-gradient-to-r from-surface-dark to-background-dark border border-white/5"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={`w-2 h-2 rounded-full ${sector.id === "S1"
                                    ? "bg-primary"
                                    : sector.id === "S2"
                                        ? "bg-accent-green"
                                        : "bg-accent-gold"
                                    }`}
                            ></span>
                            <span className="text-xs font-bold text-white">{sector.name}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed">{sector.telemetry}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
