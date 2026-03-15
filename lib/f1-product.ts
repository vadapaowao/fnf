import type { Race } from "@/lib/f1";

export type ProductRaceState = "upcoming" | "live" | "finished";

export type TrackDnaLevel = "Low" | "Medium" | "High";

export type TrackDnaMetric = {
  label: string;
  value: TrackDnaLevel;
  detail: string;
};

export type TrackWatchpoint = {
  phase: string;
  title: string;
  detail: string;
};

export type TrackDnaProfile = {
  archetype: string;
  summary: string;
  fanHook: string;
  tags: string[];
  metrics: TrackDnaMetric[];
  watchpoints: TrackWatchpoint[];
};

type CircuitDnaConfig = {
  archetype: keyof typeof ARCHETYPES;
  fanHook: string;
  tags: string[];
};

const ARCHETYPES = {
  street_pressure: {
    archetype: "Street Pressure",
    summary: "Walls, restarts, and confidence under compression usually matter more than pure pace here.",
    metrics: [
      { label: "Overtaking", value: "Low", detail: "Track position usually outranks raw pace." },
      { label: "Tyre Stress", value: "Medium", detail: "Drivers manage heat while avoiding repeated lockups." },
      { label: "Quali Weight", value: "High", detail: "Saturday often sets the race ceiling." },
      { label: "Undercut Power", value: "Medium", detail: "Pit timing helps, but traffic can kill the gain." },
      { label: "Safety-Car Risk", value: "High", detail: "Disruption is part of the expected script." }
    ],
    watchpoints: [
      { phase: "Launch", title: "Start survival matters", detail: "The opening laps are about track position and staying out of trouble." },
      { phase: "Strategy", title: "Neutralisations can flip the script", detail: "Safety cars often override the original pit model." },
      { phase: "Finish", title: "Confidence on low-margin exits", detail: "One mistake near the walls can erase a strong race instantly." }
    ]
  },
  power_track: {
    archetype: "Power Track",
    summary: "Straight-line efficiency, braking confidence, and DRS timing decide more than cosmetic corner gains.",
    metrics: [
      { label: "Overtaking", value: "High", detail: "Drivers can attack if they exit key corners cleanly." },
      { label: "Tyre Stress", value: "Medium", detail: "Rear stability under power decides stint health." },
      { label: "Quali Weight", value: "Medium", detail: "Grid matters, but long straights offer recovery." },
      { label: "Undercut Power", value: "High", detail: "Fresh tyres plus low drag can create real position swings." },
      { label: "Safety-Car Risk", value: "Medium", detail: "Strategy is still exposed to interruptions." }
    ],
    watchpoints: [
      { phase: "Launch", title: "Exit speed before the straights", detail: "The car that wins the traction phase controls the next attack zone." },
      { phase: "Strategy", title: "Undercut windows are live", detail: "Track evolution and out-lap quality can shift the order quickly." },
      { phase: "Finish", title: "Defensive battery management", detail: "Late-race energy usage shapes whether the leader can hold position." }
    ]
  },
  high_speed_sweepers: {
    archetype: "High-Speed Sweepers",
    summary: "Commitment, aero stability, and rhythm through fast changes of direction define the race here.",
    metrics: [
      { label: "Overtaking", value: "Medium", detail: "Passing exists, but setup confidence is the real differentiator." },
      { label: "Tyre Stress", value: "High", detail: "Sustained load punishes small balance mistakes." },
      { label: "Quali Weight", value: "Medium", detail: "Race pace can still override a small Saturday gap." },
      { label: "Undercut Power", value: "Medium", detail: "Undercuts work when tyre warm-up is immediate." },
      { label: "Safety-Car Risk", value: "Low", detail: "The race usually unfolds through pace rather than chaos." }
    ],
    watchpoints: [
      { phase: "Launch", title: "Front confidence sets the tone", detail: "If the front axle is lazy, the whole lap trend usually suffers." },
      { phase: "Strategy", title: "Tyre fall-off exposes setup compromise", detail: "Cars with a narrow balance window fade hard in the second half of stints." },
      { phase: "Finish", title: "Dirty air becomes a tax", detail: "Chasing closely can cost tyres before the final attack arrives." }
    ]
  },
  traction_rotation: {
    archetype: "Traction & Rotation",
    summary: "Low-speed rotation, braking release, and traction on exit make or break the race delta.",
    metrics: [
      { label: "Overtaking", value: "Medium", detail: "Passing depends on exit quality more than top speed alone." },
      { label: "Tyre Stress", value: "Medium", detail: "Rear tyre management is the strategic hinge." },
      { label: "Quali Weight", value: "High", detail: "Track position still carries major value." },
      { label: "Undercut Power", value: "High", detail: "Fresh rear tyres unlock immediate lap time." },
      { label: "Safety-Car Risk", value: "Medium", detail: "Incidents tend to cluster around braking zones." }
    ],
    watchpoints: [
      { phase: "Launch", title: "Brake-release precision", detail: "Cars that rotate cleanly gain the next traction zone for free." },
      { phase: "Strategy", title: "Rear tyre freshness is weaponised", detail: "The undercut becomes serious as soon as traction falls away." },
      { phase: "Finish", title: "Late exits decide attacks", detail: "The final phase is won by the cleaner power application." }
    ]
  },
  balanced_technical: {
    archetype: "Balanced Technical",
    summary: "There is no single shortcut here. Drivers need a complete lap and teams need a balanced setup.",
    metrics: [
      { label: "Overtaking", value: "Medium", detail: "Passing exists, but it usually has to be created over multiple corners." },
      { label: "Tyre Stress", value: "Medium", detail: "Balance errors are exposed across the full lap." },
      { label: "Quali Weight", value: "Medium", detail: "Starting position matters, but race pace can recover ground." },
      { label: "Undercut Power", value: "Medium", detail: "The pit window matters when traffic is manageable." },
      { label: "Safety-Car Risk", value: "Medium", detail: "Strategy remains flexible rather than locked." }
    ],
    watchpoints: [
      { phase: "Launch", title: "No weak sector allowed", detail: "Teams with one soft section of the lap are exposed over a full stint." },
      { phase: "Strategy", title: "Pit timing follows traffic", detail: "The fastest stop on paper is useless if it drops into a train." },
      { phase: "Finish", title: "Balance wins long runs", detail: "The better-rounded car usually finishes stronger than the peaky one." }
    ]
  },
  tyre_stress_marathon: {
    archetype: "Tyre Stress Marathon",
    summary: "This race is usually decided by tyre life, stint shape, and who can still rotate the car late in the run.",
    metrics: [
      { label: "Overtaking", value: "Medium", detail: "Tyre offset creates the best opportunities." },
      { label: "Tyre Stress", value: "High", detail: "Deg is one of the main strategic variables." },
      { label: "Quali Weight", value: "Medium", detail: "Saturday matters less if Sunday degradation is severe." },
      { label: "Undercut Power", value: "High", detail: "Fresh rubber can transform the race order quickly." },
      { label: "Safety-Car Risk", value: "Low", detail: "This is often a pace-and-deg race first." }
    ],
    watchpoints: [
      { phase: "Launch", title: "Protect the tyres early", detail: "Aggression in the opening laps often costs more later." },
      { phase: "Strategy", title: "Stint shape is the race", detail: "The team that preserves the rear tyres keeps optionality." },
      { phase: "Finish", title: "Offset tyres can decide the podium", detail: "Late-race overtakes often come from compound or age advantage." }
    ]
  }
} as const;

const CIRCUIT_DNA: Record<string, CircuitDnaConfig> = {
  albert_park: { archetype: "balanced_technical", fanHook: "An honest all-rounder where rhythm and pit timing both matter.", tags: ["balanced", "setup-sensitive", "restart risk"] },
  jeddah: { archetype: "street_pressure", fanHook: "High-speed commitment with almost no room for correction.", tags: ["street", "confidence", "high-speed"] },
  bahrain: { archetype: "tyre_stress_marathon", fanHook: "Rear tyre control and undercut timing define the order.", tags: ["degradation", "traction", "strategy"] },
  suzuka: { archetype: "high_speed_sweepers", fanHook: "One of the clearest driver-circuit examinations on the calendar.", tags: ["driver track", "flow", "aero"] },
  shanghai: { archetype: "balanced_technical", fanHook: "A blended challenge with long-radius corners and a strategic back straight.", tags: ["balanced", "braking", "traction"] },
  miami: { archetype: "balanced_technical", fanHook: "A modern layout where mistakes in rhythm create overtaking chances later.", tags: ["hybrid layout", "track evolution", "setup"] },
  imola: { archetype: "balanced_technical", fanHook: "Classic narrow-circuit pressure where balance matters more than spectacle.", tags: ["track position", "narrow", "discipline"] },
  monaco: { archetype: "street_pressure", fanHook: "The purest track-position race on the calendar.", tags: ["track position", "precision", "risk"] },
  catalunya: { archetype: "tyre_stress_marathon", fanHook: "A reference circuit that exposes tyre wear and aero weakness brutally.", tags: ["aero test", "deg", "baseline"] },
  villeneuve: { archetype: "power_track", fanHook: "Exit speed and bravery into the chicanes create the whole race.", tags: ["braking", "walls", "straight-line"] },
  red_bull_ring: { archetype: "power_track", fanHook: "Short lap, repeated attack zones, and punishing traction demands.", tags: ["short lap", "undercut", "attack"] },
  silverstone: { archetype: "high_speed_sweepers", fanHook: "Cars are judged at high speed where confidence compounds across sectors.", tags: ["high-speed", "dirty air", "stability"] },
  spa: { archetype: "high_speed_sweepers", fanHook: "A long lap where commitment, drag, and weather variance all matter.", tags: ["long lap", "weather", "aero"] },
  hungaroring: { archetype: "traction_rotation", fanHook: "Low-speed precision and tyre freshness shape almost every duel.", tags: ["traction", "quali-heavy", "undercut"] },
  zandvoort: { archetype: "high_speed_sweepers", fanHook: "Banking and flow reward rhythm more than brute force.", tags: ["flow", "banking", "track position"] },
  monza: { archetype: "power_track", fanHook: "Minimal drag, maximal braking commitment, and brutal punishment for poor exits.", tags: ["low drag", "braking", "slipstream"] },
  baku: { archetype: "street_pressure", fanHook: "Street-track risk combined with one of the most extreme straight-line phases.", tags: ["street", "power", "chaos"] },
  marina_bay: { archetype: "street_pressure", fanHook: "Attrition, concentration, and temperature management drive the outcome.", tags: ["night race", "attrition", "walls"] },
  americas: { archetype: "balanced_technical", fanHook: "A multi-style lap where compromise choices are visible everywhere.", tags: ["variety", "wind-sensitive", "setup"] },
  rodriguez: { archetype: "power_track", fanHook: "Thin air and long straights reward efficiency more than usual.", tags: ["altitude", "drag", "braking"] },
  interlagos: { archetype: "balanced_technical", fanHook: "Short-lap volatility means the race state can flip quickly.", tags: ["short lap", "weather", "strategy"] },
  las_vegas: { archetype: "power_track", fanHook: "Long straights and cold-grip management create a very modern duel pattern.", tags: ["cold track", "top speed", "late braking"] },
  losail: { archetype: "high_speed_sweepers", fanHook: "Sustained high-speed loading exposes balance and tyre resilience.", tags: ["high-speed", "tyres", "stability"] },
  yas_marina: { archetype: "traction_rotation", fanHook: "Low-speed exits and braking release are worth more than headline speed.", tags: ["traction", "night race", "strategy"] }
};

function normalizeCircuitId(circuitId: string) {
  return circuitId.trim().toLowerCase();
}

function getRaceStart(race: Race) {
  return new Date(`${race.date}T${race.time}`);
}

export function getRaceWeekendWindow(race: Race) {
  const raceStart = getRaceStart(race);
  const raceStartMs = raceStart.getTime();

  if (!Number.isFinite(raceStartMs)) {
    return {
      weekendStartMs: Number.NaN,
      raceStartMs: Number.NaN,
      raceEndMs: Number.NaN,
      recapFocusEndMs: Number.NaN
    };
  }

  return {
    weekendStartMs: raceStartMs - 52 * 60 * 60 * 1000,
    raceStartMs,
    raceEndMs: raceStartMs + 3 * 60 * 60 * 1000,
    recapFocusEndMs: raceStartMs + 36 * 60 * 60 * 1000
  };
}

export function getProductRaceState(race: Race, now: Date = new Date()): ProductRaceState {
  const { weekendStartMs, raceEndMs } = getRaceWeekendWindow(race);

  if (!Number.isFinite(weekendStartMs) || !Number.isFinite(raceEndMs)) {
    return "upcoming";
  }

  const nowMs = now.getTime();

  if (nowMs < weekendStartMs) {
    return "upcoming";
  }

  if (nowMs <= raceEndMs) {
    return "live";
  }

  return "finished";
}

export function getFeaturedRace(races: Race[], now: Date = new Date()): Race | null {
  if (races.length === 0) {
    return null;
  }

  const sortedRaces = [...races].sort((left, right) => getRaceStart(left).getTime() - getRaceStart(right).getTime());
  const nowMs = now.getTime();

  const recapRace = sortedRaces.find((race) => {
    const { raceEndMs, recapFocusEndMs } = getRaceWeekendWindow(race);
    return Number.isFinite(raceEndMs) && Number.isFinite(recapFocusEndMs) && nowMs > raceEndMs && nowMs <= recapFocusEndMs;
  });

  if (recapRace) {
    return recapRace;
  }

  const liveRace = sortedRaces.find((race) => getProductRaceState(race, now) === "live");
  if (liveRace) {
    return liveRace;
  }

  const nextRace = sortedRaces.find((race) => {
    const { weekendStartMs } = getRaceWeekendWindow(race);
    return Number.isFinite(weekendStartMs) && weekendStartMs >= nowMs;
  });

  return nextRace ?? sortedRaces[sortedRaces.length - 1] ?? null;
}

export function getLastCompletedRace(races: Race[], now: Date = new Date()): Race | null {
  const sortedRaces = [...races].sort((left, right) => getRaceStart(left).getTime() - getRaceStart(right).getTime());
  const nowMs = now.getTime();

  const completed = sortedRaces.filter((race) => {
    const { raceEndMs } = getRaceWeekendWindow(race);
    return Number.isFinite(raceEndMs) && raceEndMs < nowMs;
  });

  return completed[completed.length - 1] ?? null;
}

export function getNextRace(races: Race[], now: Date = new Date()): Race | null {
  const sortedRaces = [...races].sort((left, right) => getRaceStart(left).getTime() - getRaceStart(right).getTime());
  const nowMs = now.getTime();

  return (
    sortedRaces.find((race) => {
      const { weekendStartMs } = getRaceWeekendWindow(race);
      return Number.isFinite(weekendStartMs) && weekendStartMs >= nowMs;
    }) ?? null
  );
}

export function getRaceStateDisplay(state: ProductRaceState) {
  if (state === "upcoming") {
    return {
      label: "Before lights out",
      headline: "What to watch this weekend"
    };
  }

  if (state === "live") {
    return {
      label: "Weekend live",
      headline: "What's moving right now"
    };
  }

  return {
    label: "Race done",
    headline: "How this one turned"
  };
}

export function getRaceStateNarrative(state: ProductRaceState, fanHook: string, recapHeadline?: string | null) {
  if (state === "upcoming") {
    return fanHook;
  }

  if (state === "live") {
    return "Weekend is on. Track map up, follow where the pressure starts to bite.";
  }

  return recapHeadline ?? "Race is done. Open the recap and see where it swung.";
}

export function getTrackDnaProfile(circuitId: string): TrackDnaProfile {
  const resolvedCircuitId = normalizeCircuitId(circuitId);
  const circuitConfig = CIRCUIT_DNA[resolvedCircuitId] ?? {
    archetype: "balanced_technical",
    fanHook: "A balanced circuit where no single trick wins the whole lap.",
    tags: ["balanced", "strategy", "execution"]
  };
  const preset = ARCHETYPES[circuitConfig.archetype];

  return {
    archetype: preset.archetype,
    summary: preset.summary,
    fanHook: circuitConfig.fanHook,
    tags: circuitConfig.tags,
    metrics: [...preset.metrics],
    watchpoints: [...preset.watchpoints]
  };
}

export function getTrackWatchlistHeading(state: ProductRaceState) {
  if (state === "upcoming") {
    return {
      title: "Before Lights Out",
      subtitle: "The places and patterns worth watching before the weekend starts."
    };
  }

  if (state === "live") {
    return {
      title: "Where It Gets Tricky",
      subtitle: "The corners, calls, and mistakes that matter right now."
    };
  }

  return {
    title: "Why It Swung",
    subtitle: "The same pressure points, now with the answer."
  };
}
