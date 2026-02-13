import type { RaceDetail } from "@/lib/f1";

type F1TelemetryPanelProps = {
  detail: RaceDetail;
};

export default function F1TelemetryPanel({ detail }: F1TelemetryPanelProps) {
  const entries = [
    {
      label: "Last Winner",
      value: `${detail.stats.lastWinner.driver} • ${detail.stats.lastWinner.constructor} (${detail.stats.lastWinner.year})`
    },
    {
      label: "Fastest Lap",
      value: `${detail.stats.fastestLap.time} • ${detail.stats.fastestLap.driver} (${detail.stats.fastestLap.year})`
    },
    {
      label: "Circuit Length",
      value: detail.circuit.lengthKm === "Data unavailable" ? "Data unavailable" : `${detail.circuit.lengthKm} km`
    },
    {
      label: "Turns",
      value: detail.circuit.turns
    },
    {
      label: "DRS Zones",
      value: detail.circuit.drsZones
    },
    {
      label: "First GP",
      value: detail.circuit.firstGrandPrix
    }
  ];

  return (
    <aside className="flex h-full flex-col border-t border-[#1E1E1E] bg-[#090909] lg:border-l lg:border-t-0">
      <div className="border-b border-[#1E1E1E] px-5 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#E10600]">Telemetry</p>
        <p className="mt-2 text-lg font-black uppercase tracking-tight text-[#F1F1F1]">Track Data Panel</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {entries.map((entry) => (
          <div key={entry.label} className="border-b border-r border-[#1E1E1E] px-4 py-4">
            <span className="mb-2 block h-[2px] w-7 bg-[#E10600]" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8A8A8A]">{entry.label}</p>
            <p className="mt-1 text-sm font-black uppercase tracking-[0.05em] text-[#F3F3F3]">{entry.value}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}
