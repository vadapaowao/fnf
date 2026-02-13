"use client";

import { useState, useEffect } from "react";
import { getAllDrivers, type Driver } from "@/lib/f1";
import DriverCard from "@/components/f1/drivers/DriverCard";

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const driversList = await getAllDrivers("2026");
        setDrivers(driversList);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-background-dark text-white pt-24 pb-12 relative overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 bg-grid opacity-20 pointer-events-none"></div>
      <div className="fixed top-20 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tighter italic text-white mb-2 leading-[0.85]">
              DRIVERS
            </h1>
            <p className="text-gray-400 font-body max-w-md text-base mt-3 pl-2 border-l-2 border-primary">
              The 2026 F1 Grid. 22 heroes ready to race.
            </p>
          </div>

          {/* Season Badge */}
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 border border-primary/30 rounded-full px-5 py-2">
              <p className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                Season 2026
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-gray-400 text-lg">Loading drivers...</div>
          </div>
        )}

        {/* Drivers Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {drivers.map((driver) => (
              <DriverCard key={driver.driverId} driver={driver} />
            ))}
          </div>
        )}

        {/* Footer CTA */}
        <div className="glass-panel p-8 rounded-2xl border border-white/10 bg-gradient-to-br from-primary/5 via-transparent to-transparent text-center">
          <h3 className="text-2xl font-bold text-white mb-3 font-display">
            Follow the Action
          </h3>
          <p className="text-gray-400 mb-6">
            Click any driver to view their full profile and stats
          </p>
        </div>
      </div>
    </main>
  );
}
