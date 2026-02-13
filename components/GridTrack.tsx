import { type Race } from "@/lib/f1";

interface GridTrackProps {
    race: Race;
}

export default function GridTrack({ race }: GridTrackProps) {
    return (
        <section className="flex-1 relative flex flex-col z-0 bg-background-dark">
            <div className="absolute top-8 left-8 z-10">
                <div className="flex items-center gap-2 text-xs font-mono text-grid-primary mb-1">
                    <span className="material-icons text-sm">public</span>{" "}
                    {race.country.toUpperCase()}
                </div>
                <h2 className="text-5xl font-bold uppercase tracking-tighter text-white drop-shadow-xl font-display">
                    {race.circuitName}
                </h2>
                <div className="flex gap-4 mt-2">
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/10 text-xs text-gray-300 font-mono uppercase">
                        FIA Grade 1
                    </span>
                </div>
            </div>
            <div className="flex-1 flex items-center justify-center relative bg-gradient-radial from-surface-dark/40 to-transparent">
                <div className="absolute w-[500px] h-[500px] bg-grid-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="relative w-full max-w-3xl aspect-video transform scale-90 md:scale-100 hover:scale-105 transition-transform duration-700 ease-out">
                    {/* Generic track SVG - simplified */}
                    <svg
                        className="w-full h-full"
                        fill="none"
                        viewBox="0 0 800 500"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <defs>
                            <filter id="glow">
                                <feGaussianBlur result="coloredBlur" stdDeviation="2.5"></feGaussianBlur>
                                <feMerge>
                                    <feMergeNode in="coloredBlur"></feMergeNode>
                                    <feMergeNode in="SourceGraphic"></feMergeNode>
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Black outline stroke */}
                        <path
                            d="M250,380 L350,380 C370,380 380,390 390,410 L400,430 C410,450 430,450 440,430 L500,320 L550,330 C570,335 590,320 590,300 L580,200 L650,180 C680,170 680,140 650,130 L450,100 C430,95 410,110 405,130 L380,200 L300,180 C280,175 260,190 255,210 L240,280 C235,300 210,310 190,300 L150,280 C130,270 110,290 115,310 L130,350 C140,370 160,380 180,380 Z"
                            stroke="#1a1a1a"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="22"
                        ></path>

                        {/* Base Track in Red */}
                        <path
                            d="M250,380 L350,380 C370,380 380,390 390,410 L400,430 C410,450 430,450 440,430 L500,320 L550,330 C570,335 590,320 590,300 L580,200 L650,180 C680,170 680,140 650,130 L450,100 C430,95 410,110 405,130 L380,200 L300,180 C280,175 260,190 255,210 L240,280 C235,300 210,310 190,300 L150,280 C130,270 110,290 115,310 L130,350 C140,370 160,380 180,380 Z"
                            stroke="#f91f1f"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="6"
                            className="opacity-50"
                        ></path>

                        {/* Start/Finish Line */}
                        <line stroke="white" strokeWidth="4" x1="380" x2="380" y1="190" y2="210"></line>

                        {/* Sector Labels */}
                        <g className="font-mono text-xs font-bold fill-white pointer-events-none select-none">
                            <text className="fill-sector-1" x="180" y="250">
                                SECTOR 1
                            </text>
                            <text className="fill-sector-2" x="400" y="480">
                                SECTOR 2
                            </text>
                            <text className="fill-sector-3" x="550" y="150">
                                SECTOR 3
                            </text>
                        </g>
                    </svg>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-surface-dark/80 backdrop-blur border border-white/10 rounded-full px-6 py-2 flex gap-6 items-center shadow-2xl">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-primary shadow-[0_0_5px_#ff2800]"></span>
                            <span className="text-[10px] font-mono text-gray-300">SEC 1</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-accent-green shadow-[0_0_5px_#00ff00]"></span>
                            <span className="text-[10px] font-mono text-gray-300">SEC 2</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-accent-gold shadow-[0_0_5px_#ffd700]"></span>
                            <span className="text-[10px] font-mono text-gray-300">SEC 3</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-8 left-8 right-[400px] z-10 flex gap-4 hidden lg:flex">
                <button className="bg-grid-primary hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-[0_0_20px_rgba(249,31,31,0.4)] flex items-center gap-2 transition-all hover:scale-105 font-display uppercase tracking-wider text-sm">
                    <span className="material-icons text-sm">confirmation_number</span> GET TICKETS
                </button>
                <button className="bg-surface-dark hover:bg-gray-800 text-white border border-white/20 font-bold py-3 px-6 rounded-lg flex items-center gap-2 transition-all font-display uppercase tracking-wider text-sm">
                    <span className="material-icons text-sm">play_circle</span> WATCH PREVIEW
                </button>
            </div>
        </section>
    );
}
