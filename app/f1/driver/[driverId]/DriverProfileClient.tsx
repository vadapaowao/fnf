"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import { DriverStanding, DriverCareerStats } from "@/lib/f1";
import DriverHero from "@/components/f1/drivers/DriverHero";
import DriverStats from "@/components/f1/drivers/DriverStats";
import DriverBio from "@/components/f1/drivers/DriverBio";
import SeasonPaceChart from "@/components/f1/drivers/SeasonPaceChart";
import CareerTimeline from "@/components/f1/drivers/CareerTimeline";

interface DriverProfileClientProps {
  standing: DriverStanding;
  careerStats: DriverCareerStats;
}

export default function DriverProfileClient({
  standing,
  careerStats,
}: DriverProfileClientProps) {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { driver, position, points, wins } = standing;

  // Safely extract career stats with defaults
  const totalWins = careerStats?.totalWins ?? 0;
  const totalPoles = careerStats?.totalPoles ?? 0;
  const poles = totalPoles.toString();

  if (!standing) {
    notFound();
  }

  // Generate bio text
  const driverBio = `${driver.givenName} ${driver.familyName} is competing in the current Formula 1 season. A skilled and determined driver, ${driver.familyName} brings talent and dedication to every race weekend.`;

  return (
    <div className="min-h-screen bg-background-dark text-white pt-20 relative overflow-hidden flex flex-col lg:flex-row">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_40%,rgba(255,40,0,0.15),transparent_60%)] pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_60%,rgba(20,20,20,1),transparent_80%)] pointer-events-none z-0"></div>

      {/* Left Side - Driver Hero (Fixed) */}
      <DriverHero standing={standing} />

      {/* Right Side - Stats & Content (Scrollable) */}
      <div className="lg:w-[55%] xl:w-[60%] ml-auto relative z-20 p-6 lg:p-12 lg:pt-8 min-h-screen bg-gradient-to-l from-background-dark via-background-dark/95 to-transparent">
        {/* Stats Grid */}
        <DriverStats wins={wins} poles={poles} rank={position} />

        {/* Tab Navigation */}
        <div className="flex gap-8 border-b border-white/10 mb-8 overflow-x-auto pb-1 scrollbar-hide">
          {["Overview"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab.toLowerCase())}
              className={`pb-4 text-sm font-bold uppercase tracking-widest transition-colors font-display whitespace-nowrap ${selectedTab === tab.toLowerCase()
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8 animate-fade-in">
          {/* Biography */}
          <DriverBio
            name={`${driver.givenName} ${driver.familyName}`}
            bio={driverBio}
          />

          {/* Season Pace Chart */}
          <SeasonPaceChart />

          {/* Career Timeline */}
          <CareerTimeline events={careerStats} />
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-in;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
