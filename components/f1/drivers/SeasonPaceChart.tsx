export default function SeasonPaceChart() {
    // Mock race position data (12 races)
    const racePositions = [8, 6, 9, 7, 5, 3, 4, 2, 4, 3, 5, 2];

    return (
        <div className="glass-panel p-8 rounded-2xl border border-white/5">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white uppercase font-display">
                        Season Pace
                    </h3>
                    <p className="text-xs text-gray-500 font-mono mt-1">
                        AVG. POSITION PER RACE
                    </p>
                </div>
                <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-xs text-gray-400">Quali</span>
                    <span className="w-3 h-3 rounded-full bg-white ml-2"></span>
                    <span className="text-xs text-gray-400">Race</span>
                </div>
            </div>

            <div className="h-48 flex items-end justify-between gap-2 lg:gap-4 relative">
                {/* Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-white/5 w-full h-0"></div>
                    <div className="border-t border-white/5 w-full h-0"></div>
                    <div className="border-t border-white/5 w-full h-0"></div>
                    <div className="border-t border-white/5 w-full h-0"></div>
                </div>

                {/* Bars */}
                {racePositions.map((pos, idx) => (
                    <div
                        key={idx}
                        className="flex-1 flex flex-col justify-end items-center group relative h-full"
                    >
                        {/* Quali Bar (red) */}
                        <div
                            className="w-1.5 lg:w-2 bg-gradient-to-t from-primary/20 to-primary rounded-t-full relative z-10 transition-all group-hover:bg-primary"
                            style={{ height: `${(15 - pos) * 6}%` }}
                        ></div>

                        {/* Race Bar (white) */}
                        <div
                            className="w-1.5 lg:w-2 bg-gradient-to-t from-white/10 to-white/40 rounded-t-full absolute bottom-0 left-1/2 ml-1 lg:ml-1.5 transition-all group-hover:bg-white"
                            style={{ height: `${(15 - pos + 2) * 5}%` }}
                        ></div>

                        {/* Race Number Label */}
                        <div className="mt-2 text-[10px] text-gray-600 font-mono uppercase opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6">
                            R{idx + 1}
                        </div>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-surface-dark border border-white/10 p-2 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none shadow-xl">
                            <span className="text-primary font-bold">P{pos}</span> Race
                        </div>
                    </div>
                ))}
            </div>

            <style jsx>{`
        .glass-panel {
          background: rgba(10, 10, 10, 0.7);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 40, 0, 0.1);
        }
      `}</style>
        </div>
    );
}
