import Link from "next/link";

import { footballFixtures } from "@/lib/football";

export default function PitchSection() {
    const nextFixture = footballFixtures[0];

    return (
        <section className="relative py-24 bg-gradient-to-b from-background-dark to-black overflow-hidden">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-green/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <div className="lg:col-span-5">
                        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-[0.9] font-display italic">
                            THE
                            <br />
                            <span className="text-outline">BEAUTIFUL</span>
                            <br />
                            GAME
                        </h2>
                        <p className="text-gray-400 mb-8 text-lg leading-relaxed font-body">
                            Track your squad with real-time stats, transfer news, and match highlights.
                            Customized for the die-hard supporter.
                        </p>
                        <Link href="/football" className="flex items-center gap-3 text-white font-bold uppercase tracking-widest hover:text-accent-green transition-colors group font-display">
                            <span className="border-b border-accent-green pb-1">View All Fixtures</span>
                            <span className="material-icons text-accent-green text-sm group-hover:translate-x-1 transition-transform">
                                arrow_forward
                            </span>
                        </Link>
                    </div>
                    <div className="lg:col-span-7 relative">
                        <div className="glass-card rounded-3xl p-8 relative z-10 transform hover:-translate-y-2 transition-transform duration-500 shadow-2xl shadow-black/80 border-t border-accent-green/20">
                            <div className="flex justify-between items-start mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 p-3">
                                        <span className="material-icons text-3xl text-sky-400">shield</span>
                                    </div>
                                    <div>
                                        <p className="text-xs text-accent-gold uppercase tracking-widest mb-1 font-display">
                                            Next Match
                                        </p>
                                        <h3 className="text-2xl font-bold text-white font-display">
                                            {nextFixture.homeTeam} vs {nextFixture.awayTeam}
                                        </h3>
                                    </div>
                                </div>
                                <span className="px-3 py-1 rounded-full bg-accent-green/10 text-accent-green text-xs font-bold uppercase tracking-wider border border-accent-green/20 font-display">
                                    Upcoming
                                </span>
                            </div>
                            <div className="bg-black/60 rounded-xl p-6 mb-6 border border-white/5">
                                <div className="flex justify-between items-center text-sm text-gray-500 uppercase tracking-widest mb-4 font-display">
                                    <span>{nextFixture.competition}</span>
                                    <span>{new Date(nextFixture.kickoffUtc).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="text-center">
                                        <span className="block text-4xl font-bold text-white mb-1 font-mono">
                                            {nextFixture.homeTeam.substring(0, 3).toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-400 font-display">Home</span>
                                    </div>
                                    <div className="h-px w-12 bg-white/20"></div>
                                    <div className="text-center">
                                        <span className="block text-4xl font-bold text-white mb-1 font-mono">
                                            {nextFixture.awayTeam.substring(0, 3).toUpperCase()}
                                        </span>
                                        <span className="text-xs text-gray-400 font-display">Away</span>
                                    </div>
                                </div>
                            </div>
                            <h4 className="text-xs text-gray-400 uppercase tracking-widest mb-4 font-display">
                                Venue
                            </h4>
                            <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border-l-2 border-accent-green">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                        <span className="material-icons text-sm">stadium</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white font-display">{nextFixture.venue}</span>
                                        <span className="text-xs text-gray-500 font-body">
                                            {nextFixture.competition}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
