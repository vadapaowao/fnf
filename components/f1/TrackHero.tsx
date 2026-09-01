import CountdownTimer from "@/components/CountdownTimer";
import TrackMap from "@/components/TrackMap";
import FollowToggleButton from "@/components/f1/FollowToggleButton";
import RaceBattleMode from "@/components/f1/RaceBattleMode";
import RaceStoryMode from "@/components/f1/RaceStoryMode";
import type { Race, RaceRecap, RaceReplayData, TrackSector } from "@/lib/f1";
import { getRaceStateDisplay, getRaceStateNarrative, getTrackDnaProfile, type RaceRuntimeState } from "@/lib/f1-product";

interface TrackHeroProps {
  race: Race;
  trackSvgPath?: string | null;
  sectors?: TrackSector[];
  drsZoneCount?: string;
  recap?: RaceRecap | null;
  replay?: RaceReplayData | null;
  runtime: RaceRuntimeState;
  mobileTab?: "track" | "weekend" | "story" | "compare";
  onSelectTrack?: () => void;
}

export default function TrackHero({
  race,
  trackSvgPath,
  sectors,
  drsZoneCount,
  recap,
  replay,
  runtime,
  mobileTab = "track",
  onSelectTrack
}: TrackHeroProps) {
  const raceState = runtime.raceState;
  const trackDna = getTrackDnaProfile(race.circuitId);
  const stateDisplay = getRaceStateDisplay(raceState);
  const stateNarrative = getRaceStateNarrative(raceState, trackDna.fanHook, recap?.headline);
  const countdownTargetIso = `${race.date}T${race.time}`;
  const headerStatusCopy = raceState === "live" ? "Race Weekend Live" : "Race Complete";

  return (
    <section className="custom-scrollbar w-full min-w-0 flex-none overflow-visible bg-[#0A0A0A] px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6 xl:min-h-0 xl:flex-1 xl:overflow-y-auto">
      <header className="mb-5 border border-[#232323] bg-[#0D0D0D] px-4 py-4 md:px-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#E10600]">Race {race.round}</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#F4F4F4] md:text-4xl">{race.raceName}</h1>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3 md:items-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A9A9A] md:text-sm">
            {race.circuitName} | {race.locality}, {race.country}
          </p>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
            {raceState === "upcoming" ? (
              <CountdownTimer targetIso={countdownTargetIso} variant="compact" />
            ) : (
              <span className="inline-flex min-h-11 items-center rounded-full border border-[#E10600]/35 bg-[#150808] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#F56D67]">
                {headerStatusCopy}
              </span>
            )}
            <FollowToggleButton
              type="race"
              id={`${race.season}-${race.round}`}
              label={race.raceName}
              subtitle={`${race.circuitName} | ${race.locality}, ${race.country}`}
              href={`/f1/race/${race.round}`}
              season={race.season}
              compact
              followCopy="Follow Race"
              followingCopy="Race Followed"
              className="rounded-full border-[#E10600]/22 bg-[#090909] text-[#F4F4F4] hover:border-[#E10600]/45"
            />
          </div>
        </div>

        <div className="mt-4 border border-[#242424] bg-[#090909] px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#E10600]/40 bg-[#190909] px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#F56D67]">
              {stateDisplay.label}
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">
              {trackDna.archetype}
            </span>
          </div>
          <div className="mt-3 flex flex-col items-stretch gap-3 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-white">{stateDisplay.headline}</p>
              <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#A7A7A7]">{stateNarrative}</p>
            </div>
            {raceState === "finished" && runtime.highlightsAvailable ? (
              <a
                href="#race-highlights-player"
                onClick={(event) => {
                  if (onSelectTrack) {
                    event.preventDefault();
                    onSelectTrack();
                  }
                }}
                className="inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-1 rounded-full border border-[#E10600]/40 bg-[#200909] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[#FFE5E4] shadow-[0_0_22px_rgba(225,6,0,0.16)] transition-colors hover:border-[#FF5A52] hover:bg-[#2A0C0C] md:w-auto"
              >
                <span className="material-icons text-[14px]">play_arrow</span>
                Race Highlights
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <div className={mobileTab === "track" ? "block" : "hidden xl:block"}>
        <TrackMap
          circuitId={race.circuitId}
          trackSvgPath={trackSvgPath ?? null}
          sectors={sectors}
          drsZoneCount={drsZoneCount}
          recap={recap}
          replay={replay}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <div className={mobileTab === "story" ? "block" : "hidden xl:block"}>
          <RaceStoryMode recap={recap} dna={trackDna} state={raceState} />
        </div>
        <div className={mobileTab === "compare" ? "block" : "hidden xl:block"}>
          <RaceBattleMode replay={replay} />
        </div>
      </div>
    </section>
  );
}
