import DriverCard from "@/components/f1/drivers/DriverCard";
import { F1_SEASON, getDriverStandings } from "@/lib/f1";

export default async function DriversPage() {
  const standings = await getDriverStandings(F1_SEASON);
  const drivers = standings.map((standing) => standing.driver);

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background-dark pb-12 pt-24 text-white">
      <div className="pointer-events-none fixed inset-0 z-0 bg-grid opacity-20" />
      <div className="pointer-events-none fixed left-0 top-20 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="pointer-events-none fixed bottom-0 right-0 h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[150px]" />

      <div className="container relative z-10 mx-auto px-6">
        <header className="mb-12 flex flex-col items-end justify-between gap-8 border-b border-white/5 pb-8 md:flex-row">
          <div>
            <h1 className="mb-2 text-5xl font-bold italic leading-[0.85] tracking-tighter text-white md:text-7xl">DRIVERS</h1>
            <p className="mt-3 max-w-md border-l-2 border-primary pl-2 text-base text-gray-400">
              Full grid profiles with validated career stats and portraits.
            </p>
          </div>
          <div className="rounded-full border border-primary/30 bg-primary/10 px-5 py-2">
            <p className="text-xs font-mono font-bold uppercase tracking-wider text-primary">Season {F1_SEASON}</p>
          </div>
        </header>

        {drivers.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-lg text-gray-400">Driver list unavailable.</p>
          </div>
        ) : (
          <div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {drivers.map((driver) => (
              <DriverCard key={driver.driverId} driver={driver} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

