import CountdownTimer from "@/components/CountdownTimer";
import TrackMap from "@/components/TrackMap";
import FollowToggleButton from "@/components/f1/FollowToggleButton";
import RaceBattleMode from "@/components/f1/RaceBattleMode";
import RaceStoryMode from "@/components/f1/RaceStoryMode";
import type { Race, RaceRecap, RaceReplayData, TrackSector } from "@/lib/f1";
import { getProductRaceState, getRaceStateDisplay, getRaceStateNarrative, getTrackDnaProfile } from "@/lib/f1-product";

interface TrackHeroProps {
  race: Race;
  trackSvgPath?: string | null;
  sectors?: TrackSector[];
  drsZoneCount?: string;
  recap?: RaceRecap | null;
  replay?: RaceReplayData | null;
}

export default function TrackHero({ race, trackSvgPath, sectors, drsZoneCount, recap, replay }: TrackHeroProps) {
  const raceState = getProductRaceState(race);
  const trackDna = getTrackDnaProfile(race.circuitId);
  const stateDisplay = getRaceStateDisplay(raceState);
  const stateNarrative = getRaceStateNarrative(raceState, trackDna.fanHook, recap?.headline);
  const countdownTargetIso = `${race.date}T${race.time}`;
  const headerStatusCopy = raceState === "live" ? "Race Weekend is Live" : raceState === "finished" ? "Race Done" : "Race Weekend Loading";

  return (
    <section className="custom-scrollbar min-h-0 flex-1 overflow-y-auto bg-[#0A0A0A] px-4 py-5 md:px-6 md:py-6">
      <header className="mb-5 border border-[#232323] bg-[#0D0D0D] px-4 py-4 md:px-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#E10600]">Race {race.round}</p>
        <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-[#F4F4F4] md:text-4xl">{race.raceName}</h1>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3 md:items-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A9A9A] md:text-sm">
            {race.circuitName} | {race.locality}, {race.country}
          </p>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 md:w-auto">
            {raceState === "upcoming" ? (
              <CountdownTimer targetIso={countdownTargetIso} variant="compact" />
            ) : (
              <span className="rounded-full border border-[#E10600]/35 bg-[#150808] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#F56D67]">
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
            <span className="rounded-full border border-[#E10600]/40 bg-[#190909] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#F56D67]">
              {stateDisplay.label}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-500">
              {trackDna.archetype}
            </span>
          </div>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white">{stateDisplay.headline}</p>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#A7A7A7]">{stateNarrative}</p>
        </div>
      </header>

      <TrackMap
        circuitId={race.circuitId}
        trackSvgPath={trackSvgPath ?? null}
        sectors={sectors}
        drsZoneCount={drsZoneCount}
        recap={recap}
        replay={replay}
      />

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <RaceStoryMode recap={recap} dna={trackDna} state={raceState} />
        <RaceBattleMode replay={replay} />
      </div>
    </section>
  );
}
