"use client";

import Image from "next/image";
import Link from "next/link";

export default function LandingHero() {
    return (
        <header id="hero" className="relative min-h-screen flex flex-col justify-center items-center overflow-hidden pt-20">
            <div className="absolute inset-0 z-0 grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-full w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/90 to-transparent z-10"></div>
                    <Image
                        alt="Formula 1 racing car"
                        className="h-full w-full object-cover opacity-50 grayscale contrast-125"
                        src="/images/f1-hero.jpg"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
                <div className="relative h-full w-full overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-l from-background-dark via-background-dark/90 to-transparent z-10"></div>
                    <Image
                        alt="Football player"
                        className="h-full w-full object-cover opacity-50 grayscale contrast-125"
                        src="/images/football-hero.jpg"
                        fill
                        priority
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
            </div>
            <div className="relative z-20 container mx-auto px-4 text-center">
                <div className="mb-4 flex justify-center">
                    <span className="inline-block px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest font-display">
                        Welcome to <span className="text-primary">THE</span> Arena
                    </span>
                </div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold leading-[0.85] tracking-tighter font-display mt-8">
                    <span className="block text-white drop-shadow-[0_0_25px_rgba(255,40,0,0.6)] italic">
                        THE GRID
                    </span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-600 via-gray-400 to-gray-600 font-light italic text-7xl md:text-8xl my-2">
                        &
                    </span>
                    <span className="block text-white drop-shadow-[0_0_25px_rgba(0,255,0,0.4)] italic">
                        THE PITCH
                    </span>
                </h1>
                <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-xl mx-auto font-light leading-relaxed font-body">
                    Where precision meets passion. The ultimate hub for the fans.
                </p>
                <div className="mt-12 flex flex-col md:flex-row gap-4 justify-center items-center">
                    <Link
                        href="/f1"
                        className="group relative px-8 py-4 rounded-xl bg-primary text-white font-bold uppercase tracking-widest overflow-hidden hover:scale-105 transition-transform duration-300 shadow-[0_0_20px_rgba(255,40,0,0.4)] font-display"
                    >
                        <span className="relative z-10">Join the Arena HUB</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Link>
                    <button
                        type="button"
                        onClick={() => document.getElementById("explore-section")?.scrollIntoView({ behavior: "smooth" })}
                        className="glass-button px-8 py-4 rounded-xl text-white font-medium uppercase tracking-widest flex items-center gap-2 group font-display"
                    >
                        <span>Explore</span>
                        <span className="material-icons text-sm group-hover:translate-x-1 transition-transform">
                            arrow_forward
                        </span>
                    </button>
                </div>
            </div>
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 z-20">
                <span className="text-[10px] uppercase tracking-widest font-display text-primary">
                    Scroll
                </span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-primary to-transparent"></div>
            </div>
        </header>
    );
}
