import type { FastestLapStat, Race, RaceRecap, RaceReplayData, RaceSessionCode, WinnerStat } from "@/lib/f1";

const OPENF1_BASE_URL = "https://api.openf1.org/v1";
const OPENF1_REVALIDATE_SECONDS = 60;
const OPENF1_ACCESS_TOKEN = process.env.OPENF1_ACCESS_TOKEN;

const UNAVAILABLE = "Data unavailable";

type OpenF1Session = {
  session_key: number;
  meeting_key: number;
  session_name: string;
  date_start: string;
  date_end: string;
  circuit_short_name?: string;
  country_name?: string;
  location?: string;
  year: number;
};

type OpenF1SessionResult = {
  position: number;
  driver_number: number | string;
  number_of_laps: number;
  points: number;
  duration?: number | null;
  gap_to_leader?: number | null;
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
};

type OpenF1Driver = {
  driver_number: number | string;
  name_acronym?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  team_name?: string;
  team_colour?: string;
};

type OpenF1Lap = {
  driver_number: number | string;
  lap_number: number;
  date_start?: string | null;
  lap_duration?: number | null;
  duration_sector_1?: number | null;
  duration_sector_2?: number | null;
  duration_sector_3?: number | null;
  is_pit_out_lap?: boolean;
};

type OpenF1Position = {
  date: string;
  driver_number: number | string;
  position: number;
};

type OpenF1Pit = {
  date: string;
  driver_number: number | string;
  lap_number?: number | null;
  pit_duration?: number | null;
  lane_duration?: number | null;
};

type OpenF1SessionResultSummary = {
  resultLabel: string;
  resultValue: string;
};

type OpenF1CompletedRaceStats = {
  winner: WinnerStat;
  fastestLap: FastestLapStat;
};

function normalizeDriverNumber(value: number | string | null | undefined) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function normalizePosition(value: number | string | null | undefined) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
}

function getOrderedClassifiedResults(results: OpenF1SessionResult[]) {
  return results
    .map((entry) => {
      const position = normalizePosition(entry.position);
      const driverNumber = normalizeDriverNumber(entry.driver_number);

      if (position === null || driverNumber === null) {
        return null;
      }

      return {
        ...entry,
        position,
        driver_number: driverNumber
      };
    })
    .filter((entry): entry is OpenF1SessionResult & { position: number; driver_number: number } => entry !== null)
    .sort((left, right) => left.position - right.position);
}

function normalizeToken(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function mapSessionCodeToOpenF1Name(code: RaceSessionCode) {
  if (code === "FP1") return "Practice 1";
  if (code === "FP2") return "Practice 2";
  if (code === "FP3") return "Practice 3";
  if (code === "SQ") return "Sprint Qualifying";
  if (code === "SPRINT") return "Sprint";
  if (code === "QUALI") return "Qualifying";
  return "Race";
}

function getSessionResultLabel(code: RaceSessionCode) {
  if (code === "RACE") return "Winner";
  if (code === "SPRINT") return "Sprint Winner";
  if (code === "QUALI" || code === "SQ") return "P1";
  return "Fastest";
}

function getOpenF1Headers() {
  if (!OPENF1_ACCESS_TOKEN) {
    return undefined;
  }

  return {
    Authorization: `Bearer ${OPENF1_ACCESS_TOKEN}`
  };
}

async function fetchOpenF1Json<T>(path: string, params: Record<string, string | number | undefined>): Promise<T | null> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const response = await fetch(`${OPENF1_BASE_URL}/${path}?${searchParams.toString()}`, {
    next: { revalidate: OPENF1_REVALIDATE_SECONDS },
    headers: getOpenF1Headers()
  }).catch(() => null);

  if (!response || !response.ok) {
    return null;
  }

  return (await response.json()) as T;
}

function scoreSessionMatch(race: Race, session: OpenF1Session) {
  const targetLocality = normalizeToken(race.locality);
  const targetCircuit = normalizeToken(race.circuitName);
  const sessionLocation = normalizeToken(session.location);
  const sessionCircuit = normalizeToken(session.circuit_short_name);
  const targetTime = new Date(`${race.date}T${race.time}`).getTime();
  const sessionTime = new Date(session.date_start).getTime();
  const dateDistance = Number.isFinite(targetTime) && Number.isFinite(sessionTime) ? Math.abs(targetTime - sessionTime) : Number.POSITIVE_INFINITY;

  let score = 0;

  if (sessionLocation && sessionLocation === targetLocality) {
    score += 100;
  } else if (sessionLocation && (sessionLocation.includes(targetLocality) || targetLocality.includes(sessionLocation))) {
    score += 70;
  }

  if (sessionCircuit && targetCircuit && (sessionCircuit.includes(targetCircuit) || targetCircuit.includes(sessionCircuit))) {
    score += 50;
  }

  if (session.country_name && normalizeToken(session.country_name) === normalizeToken(race.country)) {
    score += 20;
  }

  return { score, dateDistance };
}

async function getOpenF1SessionForRace(race: Race, code: RaceSessionCode): Promise<OpenF1Session | null> {
  const sessionName = mapSessionCodeToOpenF1Name(code);
  const sessions = await fetchOpenF1Json<OpenF1Session[]>("sessions", {
    year: race.season,
    country_name: race.country,
    session_name: sessionName
  });

  if (!sessions || sessions.length === 0) {
    return null;
  }

  return [...sessions]
    .map((session) => ({ session, ...scoreSessionMatch(race, session) }))
    .sort((left, right) => {
      if (left.score !== right.score) {
        return right.score - left.score;
      }

      return left.dateDistance - right.dateDistance;
    })[0]?.session ?? null;
}

async function getOpenF1DriversByNumber(sessionKey: number, meetingKey?: number) {
  const sessionDrivers = await fetchOpenF1Json<OpenF1Driver[]>("drivers", { session_key: sessionKey });
  const drivers =
    sessionDrivers && sessionDrivers.length > 0
      ? sessionDrivers
      : meetingKey
        ? await fetchOpenF1Json<OpenF1Driver[]>("drivers", { meeting_key: meetingKey })
        : null;
  const byNumber = new Map<number, OpenF1Driver>();

  (drivers ?? []).forEach((driver) => {
    const driverNumber = normalizeDriverNumber(driver.driver_number);
    if (driverNumber !== null) {
      byNumber.set(driverNumber, driver);
    }
  });

  return byNumber;
}

function formatDriverName(driver: OpenF1Driver | undefined, driverNumber: number) {
  if (!driver) {
    return `Car ${driverNumber}`;
  }

  const firstName = driver.first_name?.trim();
  const lastName = driver.last_name?.trim();

  if (firstName || lastName) {
    return [firstName, lastName].filter(Boolean).join(" ");
  }

  if (driver.full_name) {
    const parts = driver.full_name.split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[parts.length - 1]}`;
    }

    return driver.full_name;
  }

  return driver.name_acronym ?? `Car ${driverNumber}`;
}

function formatLapDuration(seconds: number | null | undefined) {
  if (!Number.isFinite(seconds ?? NaN) || !seconds || seconds <= 0) {
    return UNAVAILABLE;
  }

  const totalSeconds = seconds as number;
  const minutes = Math.floor(totalSeconds / 60);
  const secs = (totalSeconds % 60).toFixed(3).padStart(6, "0");
  return `${minutes}:${secs}`;
}

function getKnownLapDurations(laps: OpenF1Lap[]) {
  return laps
    .map((lap) => lap.lap_duration)
    .filter((lapDuration): lapDuration is number => Number.isFinite(lapDuration ?? NaN) && (lapDuration ?? 0) > 0);
}

function estimateLapDuration(laps: OpenF1Lap[], lapNumber: number, fallbackMs: number) {
  const current = laps.find((lap) => lap.lap_number === lapNumber);
  if (current?.lap_duration && current.lap_duration > 0) {
    return Math.round(current.lap_duration * 1000);
  }

  const currentIndex = laps.findIndex((lap) => lap.lap_number === lapNumber);
  const next = currentIndex >= 0 ? laps[currentIndex + 1] : null;

  if (current?.date_start && next?.date_start) {
    const diff = new Date(next.date_start).getTime() - new Date(current.date_start).getTime();
    if (Number.isFinite(diff) && diff > 30000) {
      return diff;
    }
  }

  const known = getKnownLapDurations(laps);
  if (known.length > 0) {
    const average = known.reduce((sum, value) => sum + value, 0) / known.length;
    return Math.round(average * 1000);
  }

  return fallbackMs;
}

function buildOpeningPositions(positions: OpenF1Position[]) {
  const opening = new Map<number, number>();
  const sorted = [...positions].sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

  sorted.forEach((position) => {
    const driverNumber = normalizeDriverNumber(position.driver_number);

    if (driverNumber !== null && !opening.has(driverNumber)) {
      opening.set(driverNumber, position.position);
    }
  });

  return opening;
}

function getReplayCheckpointMs(cumulativeMs: number[], lapNumber: number | null | undefined, totalRaceMs: number) {
  if (!lapNumber || lapNumber <= 0 || cumulativeMs.length === 0) {
    return Math.min(10000, totalRaceMs);
  }

  const index = Math.max(0, Math.min(cumulativeMs.length - 1, lapNumber - 1));
  return cumulativeMs[index] ?? totalRaceMs;
}

export async function getOpenF1SessionResultSummary(
  race: Race,
  code: RaceSessionCode
): Promise<OpenF1SessionResultSummary | null> {
  const session = await getOpenF1SessionForRace(race, code);

  if (!session) {
    return null;
  }

  const [results, driversByNumber] = await Promise.all([
    fetchOpenF1Json<OpenF1SessionResult[]>("session_result", { session_key: session.session_key }),
    getOpenF1DriversByNumber(session.session_key, session.meeting_key)
  ]);

  if (code === "FP1" || code === "FP2" || code === "FP3" || code === "QUALI" || code === "SQ") {
    const laps = await fetchOpenF1Json<OpenF1Lap[]>("laps", { session_key: session.session_key });
    const fastestLap = (laps ?? [])
      .map((lap) => {
        const driverNumber = normalizeDriverNumber(lap.driver_number);
        if (driverNumber === null || !lap.lap_duration || lap.lap_duration <= 0 || lap.is_pit_out_lap) {
          return null;
        }

        return {
          driverNumber,
          lapDuration: lap.lap_duration
        };
      })
      .filter((lap): lap is NonNullable<typeof lap> => lap !== null)
      .sort((left, right) => left.lapDuration - right.lapDuration)[0];

    if (fastestLap) {
      return {
        resultLabel: getSessionResultLabel(code),
        resultValue: formatDriverName(driversByNumber.get(fastestLap.driverNumber), fastestLap.driverNumber)
      };
    }
  }

  if (!results || results.length === 0) {
    return null;
  }

  const leader = getOrderedClassifiedResults(results)[0];
  if (!leader) {
    return null;
  }

  return {
    resultLabel: getSessionResultLabel(code),
    resultValue: formatDriverName(driversByNumber.get(leader.driver_number), leader.driver_number)
  };
}

export async function getOpenF1CompletedRaceStats(race: Race): Promise<OpenF1CompletedRaceStats | null> {
  const session = await getOpenF1SessionForRace(race, "RACE");

  if (!session) {
    return null;
  }

  const [results, driversByNumber, laps] = await Promise.all([
    fetchOpenF1Json<OpenF1SessionResult[]>("session_result", { session_key: session.session_key }),
    getOpenF1DriversByNumber(session.session_key, session.meeting_key),
    fetchOpenF1Json<OpenF1Lap[]>("laps", { session_key: session.session_key })
  ]);

  if (!results || results.length === 0) {
    return null;
  }

  const orderedResults = getOrderedClassifiedResults(results);
  const winner = orderedResults[0];

  if (!winner) {
    return null;
  }

  const fastestLapEntry = (laps ?? [])
    .filter((lap) => !lap.is_pit_out_lap && lap.lap_duration && lap.lap_duration > 0)
    .sort((left, right) => (left.lap_duration ?? Number.POSITIVE_INFINITY) - (right.lap_duration ?? Number.POSITIVE_INFINITY))[0];
  const fastestLapDriverNumber = fastestLapEntry ? normalizeDriverNumber(fastestLapEntry.driver_number) : null;

  return {
    winner: {
      driver: formatDriverName(driversByNumber.get(winner.driver_number), winner.driver_number),
      constructor: driversByNumber.get(winner.driver_number)?.team_name ?? UNAVAILABLE,
      year: String(race.season)
    },
    fastestLap: {
      driver: fastestLapEntry && fastestLapDriverNumber !== null
        ? formatDriverName(driversByNumber.get(fastestLapDriverNumber), fastestLapDriverNumber)
        : UNAVAILABLE,
      time: fastestLapEntry ? formatLapDuration(fastestLapEntry.lap_duration) : UNAVAILABLE,
      year: String(race.season)
    }
  };
}

export async function getOpenF1RaceRecap(race: Race): Promise<RaceRecap | null> {
  const session = await getOpenF1SessionForRace(race, "RACE");

  if (!session) {
    return null;
  }

  const [results, driversByNumber, laps, pits, positions] = await Promise.all([
    fetchOpenF1Json<OpenF1SessionResult[]>("session_result", { session_key: session.session_key }),
    getOpenF1DriversByNumber(session.session_key, session.meeting_key),
    fetchOpenF1Json<OpenF1Lap[]>("laps", { session_key: session.session_key }),
    fetchOpenF1Json<OpenF1Pit[]>("pit", { session_key: session.session_key }),
    fetchOpenF1Json<OpenF1Position[]>("position", { session_key: session.session_key })
  ]);

  if (!results || results.length === 0) {
    return null;
  }

  const orderedResults = getOrderedClassifiedResults(results);
  const winner = orderedResults[0];
  const second = orderedResults[1];
  const podium = orderedResults.slice(0, 3).map((entry, index) => ({
    position: (index + 1) as 1 | 2 | 3,
    driver: formatDriverName(driversByNumber.get(entry.driver_number), entry.driver_number),
    constructor: driversByNumber.get(entry.driver_number)?.team_name ?? UNAVAILABLE
  }));

  const fastestLapEntry = (laps ?? [])
    .filter((lap) => !lap.is_pit_out_lap && lap.lap_duration && lap.lap_duration > 0)
    .sort((left, right) => (left.lap_duration ?? Number.POSITIVE_INFINITY) - (right.lap_duration ?? Number.POSITIVE_INFINITY))[0] ?? null;
  const fastestLapDriverNumber = fastestLapEntry ? normalizeDriverNumber(fastestLapEntry.driver_number) : null;

  const pitLapCounts = new Map<number, number>();
  (pits ?? []).forEach((pit) => {
    if (!pit.lap_number || pit.lap_number <= 0) {
      return;
    }

    pitLapCounts.set(pit.lap_number, (pitLapCounts.get(pit.lap_number) ?? 0) + 1);
  });

  const busiestPitLap = Array.from(pitLapCounts.entries()).sort((left, right) => right[1] - left[1])[0] ?? null;
  const decisivePitWindow = busiestPitLap
    ? `Lap ${busiestPitLap[0]} was the big pit swing with ${busiestPitLap[1]} cars diving in.`
    : "No big pit spike landed this time. Pace and track position did the heavy lifting.";

  const openingPositions = buildOpeningPositions(positions ?? []);
  const biggestGainer = orderedResults
    .map((entry) => {
      const startPosition = openingPositions.get(entry.driver_number);
      if (!startPosition) {
        return null;
      }

      const positionsGained = startPosition - entry.position;
      if (positionsGained <= 0) {
        return null;
      }

      return {
        driver: formatDriverName(driversByNumber.get(entry.driver_number), entry.driver_number),
        positionsGained,
        started: startPosition,
        finished: entry.position
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    .sort((left, right) => right.positionsGained - left.positionsGained)[0] ?? null;

  const winnerName = formatDriverName(driversByNumber.get(winner.driver_number), winner.driver_number);
  const winnerTeam = driversByNumber.get(winner.driver_number)?.team_name ?? UNAVAILABLE;
  const gapText = second?.gap_to_leader ? `${second.gap_to_leader.toFixed(3)}s` : null;

  return {
    headline: `${winnerName} got it done at ${race.circuitName}.`,
    winnerStory: gapText
      ? `${winnerName} took the win for ${winnerTeam} by ${gapText}.`
      : `${winnerName} took the win for ${winnerTeam}.`,
    podium,
    decisivePitWindow,
    biggestGainer,
    fastestLap: fastestLapEntry
      ? {
          driver:
            fastestLapDriverNumber !== null
              ? formatDriverName(driversByNumber.get(fastestLapDriverNumber), fastestLapDriverNumber)
              : UNAVAILABLE,
          lapTime: formatLapDuration(fastestLapEntry.lap_duration),
          lap: String(fastestLapEntry.lap_number)
        }
      : null,
    keyMoments: [
      {
        title: "Start",
        detail: `${winnerName} survived the opening phase and put the race on their terms early.`
      },
      {
        title: "Pit window",
        detail: decisivePitWindow
      },
      {
        title: "Biggest mover",
        detail: biggestGainer
          ? `${biggestGainer.driver} gained ${biggestGainer.positionsGained} place${biggestGainer.positionsGained === 1 ? "" : "s"} from P${biggestGainer.started} to P${biggestGainer.finished}.`
          : "Nobody made a huge climb through the field this time."
      },
      {
        title: "Finish",
        detail: gapText
          ? `${winnerName} crossed the line ${gapText} clear of the next car.`
          : `${winnerName} kept it tidy to the flag.`
      }
    ],
    sectorNarrative: [
      {
        sector: "S1",
        summary: `${winnerName} kept the opening phase clean and protected the run into the first key sequence.`
      },
      {
        sector: "S2",
        summary: `${winnerName} and ${winnerTeam} handled the middle phase well enough to keep the race under control.`
      },
      {
        sector: "S3",
        summary: `${
          fastestLapEntry && fastestLapDriverNumber !== null
            ? formatDriverName(driversByNumber.get(fastestLapDriverNumber), fastestLapDriverNumber)
            : winnerName
        } owned the final phase when it came to outright lap speed.`
      }
    ]
  };
}

export async function getOpenF1RaceReplay(race: Race): Promise<RaceReplayData | null> {
  const session = await getOpenF1SessionForRace(race, "RACE");

  if (!session) {
    return null;
  }

  const [results, driversByNumber, laps, pits] = await Promise.all([
    fetchOpenF1Json<OpenF1SessionResult[]>("session_result", { session_key: session.session_key }),
    getOpenF1DriversByNumber(session.session_key, session.meeting_key),
    fetchOpenF1Json<OpenF1Lap[]>("laps", { session_key: session.session_key }),
    fetchOpenF1Json<OpenF1Pit[]>("pit", { session_key: session.session_key })
  ]);

  if (!results || results.length === 0) {
    return null;
  }

  const orderedResults = getOrderedClassifiedResults(results);
  const lapsByDriver = new Map<number, OpenF1Lap[]>();

  (laps ?? []).forEach((lap) => {
    const driverNumber = normalizeDriverNumber(lap.driver_number);
    if (driverNumber === null) {
      return;
    }

    const bucket = lapsByDriver.get(driverNumber) ?? [];
    bucket.push(lap);
    lapsByDriver.set(driverNumber, bucket);
  });

  const winner = orderedResults[0] ?? null;
  const winnerLaps = winner ? lapsByDriver.get(winner.driver_number) ?? [] : [];
  const winnerKnownDurations = getKnownLapDurations(winnerLaps);
  const winnerFallbackMs = winnerKnownDurations.length > 0
    ? Math.round((winnerKnownDurations.reduce((sum, value) => sum + value, 0) / winnerKnownDurations.length) * 1000)
    : 90000;

  const traces = orderedResults.map((entry) => {
    const driver = driversByNumber.get(entry.driver_number);
    const driverLaps = [...(lapsByDriver.get(entry.driver_number) ?? [])].sort((left, right) => left.lap_number - right.lap_number);
    const cumulativeMs: number[] = [];
    const totalLaps = Math.max(entry.number_of_laps, driverLaps[driverLaps.length - 1]?.lap_number ?? 0);
    const fallbackMs = winnerFallbackMs + (entry.position - 1) * 300;

    for (let lapNumber = 1; lapNumber <= totalLaps; lapNumber += 1) {
      const lapMs = estimateLapDuration(driverLaps, lapNumber, fallbackMs);
      const previous = cumulativeMs[cumulativeMs.length - 1] ?? 0;
      cumulativeMs.push(previous + lapMs);
    }

    return {
      driverId: String(entry.driver_number),
      code: driver?.name_acronym ?? String(entry.driver_number),
      name: formatDriverName(driver, entry.driver_number),
      constructor: driver?.team_name ?? UNAVAILABLE,
      finishPosition: entry.position,
      cumulativeMs
    };
  }).filter((trace) => trace.cumulativeMs.length > 0);

  // If OpenF1 has no lap data yet (e.g. recently completed 2026 races not fully indexed),
  // build estimated traces from result positions so the track replay always animates
  // rather than showing a blank "not complete enough yet" placeholder.
  const hasLapData = traces.some((trace) => trace.cumulativeMs.length > 0 && winnerFallbackMs < 200000);
  const estimatedTraces = hasLapData
    ? traces
    : orderedResults.map((entry) => {
        const driver = driversByNumber.get(entry.driver_number);
        // Use typical F1 race: ~58 laps at 90s average. Adjust pace by position.
        const totalEstimatedLaps = Math.max(entry.number_of_laps, 50);
        const baseLapMs = 90000;
        const paceBias = 1 + (entry.position - 1) * 0.003;  // ~0.3% slower per position
        const lapMs = Math.round(baseLapMs * paceBias);
        const cumulativeMs: number[] = [];
        for (let i = 0; i < totalEstimatedLaps; i++) {
          cumulativeMs.push((cumulativeMs[cumulativeMs.length - 1] ?? 0) + lapMs);
        }
        return {
          driverId: String(entry.driver_number),
          code: driver?.name_acronym ?? String(entry.driver_number),
          name: formatDriverName(driver, entry.driver_number),
          constructor: driver?.team_name ?? UNAVAILABLE,
          finishPosition: entry.position,
          cumulativeMs
        };
      });

  const totalLaps = orderedResults.reduce((best, entry) => Math.max(best, entry.number_of_laps), 0);
  const totalRaceMs = estimatedTraces[0]?.cumulativeMs[totalLaps - 1] ?? estimatedTraces[0]?.cumulativeMs[estimatedTraces[0].cumulativeMs.length - 1] ?? 0;

  if (!estimatedTraces.length || totalRaceMs <= 0) {
    return null;
  }

  const fastestLapEntry = (laps ?? [])
    .filter((lap) => !lap.is_pit_out_lap && lap.lap_duration && lap.lap_duration > 0)
    .sort((left, right) => (left.lap_duration ?? Number.POSITIVE_INFINITY) - (right.lap_duration ?? Number.POSITIVE_INFINITY))[0] ?? null;
  const fastestLapDriverNumber = fastestLapEntry ? normalizeDriverNumber(fastestLapEntry.driver_number) : null;

  const pitLapCounts = new Map<number, number>();
  (pits ?? []).forEach((pit) => {
    if (!pit.lap_number || pit.lap_number <= 0) {
      return;
    }

    pitLapCounts.set(pit.lap_number, (pitLapCounts.get(pit.lap_number) ?? 0) + 1);
  });

  const busiestPitLap = Array.from(pitLapCounts.entries()).sort((left, right) => right[1] - left[1])[0] ?? null;
  const winnerTrace = winner ? estimatedTraces.find((trace) => trace.driverId === String(winner.driver_number)) ?? estimatedTraces[0] : estimatedTraces[0];
  const highlights = [
    {
      id: "lights-out",
      title: "Start",
      detail: "Lights out and the opening order scramble.",
      checkpointMs: Math.min(10000, totalRaceMs)
    },
    busiestPitLap
      ? {
          id: "pit-window",
          title: "Pit window",
          detail: `Lap ${busiestPitLap[0]} pulled ${busiestPitLap[1]} car${busiestPitLap[1] === 1 ? "" : "s"} into the lane.`,
          checkpointMs: getReplayCheckpointMs(winnerTrace?.cumulativeMs ?? [], busiestPitLap[0], totalRaceMs)
        }
      : null,
    fastestLapEntry && fastestLapDriverNumber !== null
      ? {
          id: "fastest-lap",
          title: "Fastest lap",
          detail: `${formatDriverName(driversByNumber.get(fastestLapDriverNumber), fastestLapDriverNumber)} found the fastest lap on Lap ${fastestLapEntry.lap_number}.`,
          checkpointMs: getReplayCheckpointMs(winnerTrace?.cumulativeMs ?? [], fastestLapEntry.lap_number, totalRaceMs)
        }
      : null
  ].filter((highlight): highlight is NonNullable<typeof highlight> => highlight !== null);

  return {
    totalLaps,
    totalRaceMs,
    traces: estimatedTraces,
    winnerDriverId: winner ? String(winner.driver_number) : null,
    highlights
  };
}
