import type { DriverProfileData } from "@/lib/driver-profile";

type DriverProfileClientProps = {
  profile: DriverProfileData;
};

function formatNumber(value: number): string {
  return value.toLocaleString("en-US");
}

export default function DriverProfileClient({ profile }: DriverProfileClientProps) {
  const { standing, age, nationalityCode, teamColor, stats, timeline, bio, imageUrl } = profile;
  const { driver, constructors } = standing;
  const teamName = constructors[0]?.name ?? "Team Unavailable";
  const filmGrainBackground =
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.15'/%3E%3C/svg%3E\")";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0A0A0A] pt-20 text-white">
      <div className="fixed inset-0 z-0 bg-[#0A0A0A]">
        <div className="absolute right-0 top-0 h-full w-3/4 bg-[radial-gradient(circle_at_top_right,rgba(80,0,0,0.35),#0A0A0A_60%)]" />
        <div className="absolute bottom-0 left-0 h-1/2 w-full bg-gradient-to-t from-black via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(#333_1px,transparent_1px),linear-gradient(90deg,#333_1px,transparent_1px)] [background-size:40px_40px]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1600px] flex-col px-6 pb-6 lg:px-12">
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
          <section className="z-20 flex flex-col justify-center space-y-8 pb-16 lg:col-span-5 lg:pb-0">
            <div>
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="h-6 w-1.5" style={{ backgroundColor: teamColor }} />
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400">{teamName}</span>
              </div>

              <h1 className="mb-4 text-6xl font-bold leading-[0.85] tracking-tighter lg:text-8xl">
                <span className="block text-white">{driver.givenName.toUpperCase()}</span>
                <span className="block bg-gradient-to-r from-gray-500 via-white to-gray-400 bg-clip-text text-transparent">
                  {driver.familyName.toUpperCase()}
                </span>
              </h1>

              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm font-mono text-gray-400">
                <span className="rounded border border-gray-700 px-2 py-1 text-white">{nationalityCode}</span>
                <span>#{driver.permanentNumber || "—"}</span>
                <span>AGE: {age > 0 ? age : "—"}</span>
                <span className="uppercase tracking-wide text-gray-500">Source: {profile.imageSource}</span>
              </div>

              <p className="max-w-md border-l border-gray-700 pl-4 text-base leading-relaxed text-gray-300">{bio}</p>
            </div>

            <div className="grid grid-cols-3 gap-4 border-t border-gray-800 pt-6">
              <div>
                <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Wins</span>
                <span className="text-3xl font-bold text-white">{formatNumber(stats.wins)}</span>
              </div>
              <div>
                <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Poles</span>
                <span className="text-3xl font-bold text-white">{formatNumber(stats.poles)}</span>
              </div>
              <div>
                <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Podiums</span>
                <span className="text-3xl font-bold text-white">{formatNumber(stats.podiums)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <button className="rounded bg-[#E10600] px-8 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-[0_4px_14px_rgba(225,6,0,0.4)] transition-all hover:bg-red-700">
                Follow
              </button>
              <button className="rounded border border-gray-600 bg-transparent px-8 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all hover:border-white hover:bg-white/5">
                View Stats
              </button>
            </div>
          </section>

          <section className="pointer-events-none relative z-0 flex h-full items-end justify-end lg:col-span-7 lg:absolute lg:inset-y-0 lg:right-0 lg:w-[65vw]">
            <div className="relative h-full w-full overflow-hidden bg-[#E10600]">
              <img
                src={imageUrl}
                alt={`Portrait of ${driver.givenName} ${driver.familyName}`}
                className="absolute right-0 top-0 h-full w-full object-cover object-center grayscale [mix-blend-mode:hard-light] lg:object-right"
              />
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#0A0A0A_0%,transparent_40%,transparent_60%,#0A0A0A_100%),linear-gradient(to_top,#0A0A0A_0%,transparent_30%)]" />
              <div className="pointer-events-none absolute inset-0 opacity-30" style={{ backgroundImage: filmGrainBackground }} />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 h-1/2 w-full bg-gradient-to-t from-[#0A0A0A] to-transparent" />
            </div>
          </section>
        </div>

        <section className="relative z-30 mb-6 mt-auto rounded-lg border border-gray-800 bg-black/40 backdrop-blur-md">
          <div className="px-6 py-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-[#E10600]" />
                Career Timeline
              </h3>
            </div>

            <div className="no-scrollbar flex gap-8 overflow-x-auto pb-2">
              {timeline.map((event, index) => (
                <article key={`${event.year}-${event.title}-${index}`} className="flex w-48 flex-none flex-col">
                  <span className="mb-1 text-xs font-mono text-[#E10600]">{event.year}</span>
                  <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-gray-800">
                    <div
                      className={`h-full ${event.highlight ? "bg-gradient-to-r from-[#E10600] to-red-500" : "bg-white/50"} ${
                        event.active ? "w-3/4" : "w-full"
                      }`}
                    />
                  </div>
                  <span className={`text-sm font-bold ${event.highlight ? "text-[#E10600]" : "text-white"}`}>{event.title}</span>
                  <span className="text-xs text-gray-400">{event.subtitle}</span>
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
