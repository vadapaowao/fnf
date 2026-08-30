#!/usr/bin/env python3

import argparse
import json
from pathlib import Path
from statistics import mean
import time
from typing import Any, Dict, List, Optional, Tuple
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

import fastf1
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
CACHE_DIR = ROOT / ".cache" / "fastf1"
OUTPUT_DIR = ROOT / "public" / "data" / "fastf1"
COMPLETION_BUFFER_HOURS = 6
JOLPICA_BASE_URL = "https://api.jolpi.ca/ergast/f1"
HTTP_TIMEOUT_SECONDS = 30


def ensure_fastf1_cache() -> None:
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    fastf1.Cache.enable_cache(str(CACHE_DIR))


def timedelta_ms(value: Any) -> Optional[int]:
    if pd.isna(value):
        return None
    return int(pd.Timedelta(value).total_seconds() * 1000)


def format_duration(value: Any) -> str:
    ms = timedelta_ms(value)
    if ms is None or ms <= 0:
        return "—"

    total_seconds = ms / 1000
    minutes = int(total_seconds // 60)
    seconds = total_seconds % 60
    return f"{minutes}:{seconds:06.3f}"


def safe_int(value: Any) -> Optional[int]:
    if pd.isna(value):
        return None
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return None


def driver_name(row: pd.Series) -> str:
    full_name = str(row.get("FullName") or "").strip()
    if full_name:
        return full_name

    first = str(row.get("FirstName") or "").strip()
    last = str(row.get("LastName") or "").strip()
    joined = " ".join(part for part in [first, last] if part)
    if joined:
        return joined

    abbreviation = str(row.get("Abbreviation") or "").strip()
    return abbreviation or str(row.get("DriverNumber") or "Unknown Driver")


def resolve_lap_ms(driver_laps: pd.DataFrame, index: int, fallback_ms: int) -> int:
    row = driver_laps.iloc[index]

    direct = timedelta_ms(row.get("LapTime"))
    if direct and direct > 0:
        return direct

    end_time = row.get("Time")
    start_time = row.get("LapStartTime")
    if not pd.isna(end_time) and not pd.isna(start_time):
        derived = timedelta_ms(end_time - start_time)
        if derived and 30_000 <= derived <= 300_000:
            return derived

    if index + 1 < len(driver_laps):
        next_row = driver_laps.iloc[index + 1]
        next_start = next_row.get("LapStartTime")
        current_start = row.get("LapStartTime")
        if not pd.isna(next_start) and not pd.isna(current_start):
            derived = timedelta_ms(next_start - current_start)
            if derived and 30_000 <= derived <= 300_000:
                return derived

    return fallback_ms


def build_trace(row: pd.Series, laps: pd.DataFrame, global_fallback_ms: int) -> Optional[Dict[str, Any]]:
    driver_number = str(row["DriverNumber"])
    driver_laps = laps[laps["DriverNumber"].astype(str) == driver_number].sort_values("LapNumber").reset_index(drop=True)
    if driver_laps.empty:
        return None

    known_lap_ms = [
        timedelta_ms(value)
        for value in driver_laps["LapTime"].tolist()
        if timedelta_ms(value) is not None
    ]
    fallback_ms = int(mean(known_lap_ms)) if known_lap_ms else global_fallback_ms
    total_laps = max(safe_int(row.get("Laps")) or 0, safe_int(driver_laps["LapNumber"].max()) or 0)
    if total_laps <= 0:
        return None

    laps_by_number = {
        safe_int(lap_row["LapNumber"]): lap_row for _, lap_row in driver_laps.iterrows() if safe_int(lap_row["LapNumber"]) is not None
    }

    cumulative_ms: List[int] = []
    for lap_number in range(1, total_laps + 1):
        lap_row = laps_by_number.get(lap_number)
        if lap_row is None:
            lap_ms = fallback_ms
        else:
            lap_index = driver_laps.index[driver_laps["LapNumber"] == lap_number]
            lap_ms = resolve_lap_ms(driver_laps, int(lap_index[0]), fallback_ms) if len(lap_index) else fallback_ms
        cumulative_ms.append((cumulative_ms[-1] if cumulative_ms else 0) + lap_ms)

    return {
        "driverId": driver_number,
        "code": str(row.get("Abbreviation") or driver_number),
        "name": driver_name(row),
        "constructor": str(row.get("TeamName") or "Unknown Team"),
        "finishPosition": safe_int(row.get("Position")) or 99,
        "cumulativeMs": cumulative_ms,
    }


def build_bundle(season: int, round_number: int) -> Dict[str, Any]:
    session = fastf1.get_session(season, round_number, "R")
    session.load(laps=True, telemetry=False, weather=False, messages=False)

    results = session.results.copy()
    results = results[pd.to_numeric(results["Position"], errors="coerce").notna()].copy()
    results["Position"] = pd.to_numeric(results["Position"], errors="coerce")
    results = results.sort_values("Position").reset_index(drop=True)

    if results.empty:
        raise RuntimeError("No classified results available from FastF1.")

    laps = session.laps.copy()
    valid_lap_ms = [
        timedelta_ms(value)
        for value in laps["LapTime"].tolist()
        if timedelta_ms(value) is not None
    ]
    global_fallback_ms = int(mean(valid_lap_ms)) if valid_lap_ms else 90_000

    traces = []
    for _, row in results.iterrows():
        trace = build_trace(row, laps, global_fallback_ms)
        if trace:
            traces.append(trace)

    if not traces:
        raise RuntimeError("No replay traces could be built from FastF1 lap data.")

    winner = results.iloc[0]
    second = results.iloc[1] if len(results) > 1 else None
    winner_driver_id = str(winner["DriverNumber"])
    winner_trace = next((trace for trace in traces if trace["driverId"] == winner_driver_id), traces[0])
    total_laps = max((len(trace["cumulativeMs"]) for trace in traces), default=0)
    total_race_ms = winner_trace["cumulativeMs"][-1] if winner_trace["cumulativeMs"] else 0

    fastest_lap_row = laps[laps["LapTime"].notna()].sort_values("LapTime").head(1)
    fastest_lap_driver_name = driver_name(winner)
    fastest_lap_lap_number = "—"
    fastest_lap_time = "—"
    fastest_checkpoint_ms = min(10_000, total_race_ms) if total_race_ms > 0 else 10_000
    if not fastest_lap_row.empty:
        fastest = fastest_lap_row.iloc[0]
        fastest_driver_number = str(fastest["DriverNumber"])
        fastest_result = results[results["DriverNumber"].astype(str) == fastest_driver_number]
        if not fastest_result.empty:
            fastest_lap_driver_name = driver_name(fastest_result.iloc[0])
        fastest_lap_lap_number = str(safe_int(fastest.get("LapNumber")) or "—")
        fastest_lap_time = format_duration(fastest.get("LapTime"))
        lap_idx = max((safe_int(fastest.get("LapNumber")) or 1) - 1, 0)
        if lap_idx < len(winner_trace["cumulativeMs"]):
            fastest_checkpoint_ms = winner_trace["cumulativeMs"][lap_idx]

    pit_lap_counts: Dict[int, int] = {}
    pit_rows = laps[(laps["PitInTime"].notna()) | (laps["PitOutTime"].notna())]
    for lap_number_value in pit_rows["LapNumber"].tolist():
        lap_number = safe_int(lap_number_value)
        if lap_number is None:
            continue
        pit_lap_counts[lap_number] = pit_lap_counts.get(lap_number, 0) + 1
    busiest_pit = max(pit_lap_counts.items(), key=lambda item: item[1], default=None)
    pit_checkpoint_ms = fastest_checkpoint_ms
    decisive_pit_window = "No clear pit swing defined the race."
    if busiest_pit:
        pit_lap, pit_count = busiest_pit
        decisive_pit_window = f"Lap {pit_lap} was the big strategy swing with {pit_count} cars hitting the lane."
        pit_idx = min(max(pit_lap - 1, 0), len(winner_trace["cumulativeMs"]) - 1)
        pit_checkpoint_ms = winner_trace["cumulativeMs"][pit_idx]

    biggest_gainer = None
    for _, row in results.iterrows():
        grid_position = safe_int(row.get("GridPosition"))
        finish_position = safe_int(row.get("Position"))
        if grid_position is None or finish_position is None:
            continue
        positions_gained = grid_position - finish_position
        if positions_gained <= 0:
            continue
        candidate = {
            "driver": driver_name(row),
            "positionsGained": positions_gained,
            "started": grid_position,
            "finished": finish_position,
        }
        if biggest_gainer is None or candidate["positionsGained"] > biggest_gainer["positionsGained"]:
            biggest_gainer = candidate

    podium = []
    for index, (_, row) in enumerate(results.head(3).iterrows(), start=1):
        podium.append({
            "position": index,
            "driver": driver_name(row),
            "constructor": str(row.get("TeamName") or "Unknown Team"),
        })

    winner_name = driver_name(winner)
    winner_team = str(winner.get("TeamName") or "Unknown Team")
    gap_text = ""
    if second is not None and not pd.isna(second.get("Time")):
        second_gap = format_duration(second.get("Time"))
        gap_text = f" by {second_gap}"

    highlights = [
        {
            "id": "lights-out",
            "title": "Start",
            "detail": "Lights out and the opening order scramble.",
            "checkpointMs": min(10_000, total_race_ms),
        }
    ]
    if busiest_pit:
        highlights.append({
            "id": "pit-window",
            "title": "Pit window",
            "detail": decisive_pit_window,
            "checkpointMs": pit_checkpoint_ms,
        })
    if fastest_lap_time != "—":
        highlights.append({
            "id": "fastest-lap",
            "title": "Fastest lap",
            "detail": f"{fastest_lap_driver_name} set the fastest lap on Lap {fastest_lap_lap_number}.",
            "checkpointMs": fastest_checkpoint_ms,
        })

    recap = {
        "headline": f"{winner_name} got it done at {session.event['EventName']}.",
        "winnerStory": f"{winner_name} took the win for {winner_team}{gap_text}.",
        "podium": podium,
        "decisivePitWindow": decisive_pit_window,
        "biggestGainer": biggest_gainer,
        "fastestLap": {
            "driver": fastest_lap_driver_name,
            "lapTime": fastest_lap_time,
            "lap": fastest_lap_lap_number,
        } if fastest_lap_time != "—" else None,
        "keyMoments": [
            {
                "title": "Start",
                "detail": f"{winner_name} got through the launch phase clean and settled the race shape early.",
                "checkpointMs": min(10_000, total_race_ms),
            },
            {
                "title": "Pit window",
                "detail": decisive_pit_window,
                "checkpointMs": pit_checkpoint_ms,
            },
            {
                "title": "Finish",
                "detail": f"{winner_name} brought it home for {winner_team}.",
                "checkpointMs": total_race_ms,
            },
        ],
        "sectorNarrative": [
            {
                "sector": "S1",
                "summary": f"{winner_name} kept the opening sequence under control and avoided losing track position early."
            },
            {
                "sector": "S2",
                "summary": f"{winner_team} managed the middle phase well enough to stay ahead of the main threats."
            },
            {
                "sector": "S3",
                "summary": f"{fastest_lap_driver_name if fastest_lap_time != '—' else winner_name} was strongest when it came to outright lap speed in the closing phase."
            },
        ],
    }

    replay = {
        "totalLaps": total_laps,
        "totalRaceMs": total_race_ms,
        "traces": traces,
        "winnerDriverId": winner_driver_id,
        "highlights": highlights,
    }

    return {
        "source": "FastF1",
        "season": str(season),
        "round": str(round_number),
        "generatedAt": pd.Timestamp.utcnow().isoformat(),
        "recap": recap,
        "replay": replay,
    }


def fetch_json(url: str) -> Dict[str, Any]:
    last_error: Optional[Exception] = None

    for attempt in range(3):
        request = Request(url, headers={"User-Agent": "GRID-F1-replay-builder/1.0"})
        try:
            with urlopen(request, timeout=HTTP_TIMEOUT_SECONDS) as response:
                return json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError) as error:
            last_error = error
            if attempt < 2:
                time.sleep(2 ** attempt)

    raise RuntimeError(f"Unable to fetch {url}: {last_error}")


def parse_lap_time_ms(value: Any) -> Optional[int]:
    if not isinstance(value, str) or not value.strip():
        return None

    normalized = value.strip().lstrip("+")
    try:
        if ":" not in normalized:
            return int(float(normalized) * 1000)

        minutes, seconds = normalized.split(":", 1)
        return int((int(minutes) * 60 + float(seconds)) * 1000)
    except (TypeError, ValueError):
        return None


def jolpica_driver_name(result: Dict[str, Any]) -> str:
    driver = result.get("Driver") or {}
    parts = [str(driver.get("givenName") or "").strip(), str(driver.get("familyName") or "").strip()]
    name = " ".join(part for part in parts if part)
    return name or str(driver.get("code") or driver.get("driverId") or "Unknown Driver")


def fetch_jolpica_laps(season: int, round_number: int) -> List[Dict[str, Any]]:
    laps_by_number: Dict[int, Dict[str, Dict[str, Any]]] = {}
    offset = 0
    total = 1

    while offset < total:
        query = urlencode({"limit": 100, "offset": offset})
        payload = fetch_json(f"{JOLPICA_BASE_URL}/{season}/{round_number}/laps.json?{query}")
        metadata = payload.get("MRData") or {}
        races = ((metadata.get("RaceTable") or {}).get("Races") or [])
        page_laps = (races[0].get("Laps") or []) if races else []

        for lap in page_laps:
            lap_number = safe_int(lap.get("number"))
            if lap_number is None:
                continue
            timings = laps_by_number.setdefault(lap_number, {})
            for timing in lap.get("Timings") or []:
                driver_id = str(timing.get("driverId") or "").strip()
                if driver_id:
                    timings[driver_id] = timing

        page_limit = safe_int(metadata.get("limit")) or 100
        page_offset = safe_int(metadata.get("offset")) or offset
        total = safe_int(metadata.get("total")) or 0
        next_offset = page_offset + page_limit
        if next_offset <= offset:
            break
        offset = next_offset

    return [
        {"number": lap_number, "Timings": list(timings.values())}
        for lap_number, timings in sorted(laps_by_number.items())
    ]


def build_jolpica_bundle(season: int, round_number: int) -> Dict[str, Any]:
    results_payload = fetch_json(f"{JOLPICA_BASE_URL}/{season}/{round_number}/results.json")
    races = (((results_payload.get("MRData") or {}).get("RaceTable") or {}).get("Races") or [])
    if not races:
        raise RuntimeError("No classified results available from Jolpica.")

    race = races[0]
    results = sorted(
        [result for result in race.get("Results") or [] if safe_int(result.get("position")) is not None],
        key=lambda result: safe_int(result.get("position")) or 999,
    )
    if not results:
        raise RuntimeError("No classified results available from Jolpica.")

    laps = fetch_jolpica_laps(season, round_number)
    if not laps:
        raise RuntimeError("No lap timing data available from Jolpica.")

    traces_by_driver: Dict[str, Dict[str, Any]] = {}
    for result in results:
        driver = result.get("Driver") or {}
        driver_id = str(driver.get("driverId") or "").strip()
        if not driver_id:
            continue
        constructor = result.get("Constructor") or {}
        traces_by_driver[driver_id] = {
            "driverId": driver_id,
            "code": str(driver.get("code") or driver_id[:3]).upper(),
            "name": jolpica_driver_name(result),
            "constructor": str(constructor.get("name") or "Unknown Team"),
            "finishPosition": safe_int(result.get("position")) or 99,
            "cumulativeMs": [],
        }

    for lap in laps:
        for timing in lap.get("Timings") or []:
            driver_id = str(timing.get("driverId") or "").strip()
            trace = traces_by_driver.get(driver_id)
            lap_ms = parse_lap_time_ms(timing.get("time"))
            if not trace or lap_ms is None or lap_ms <= 0:
                continue
            previous = trace["cumulativeMs"][-1] if trace["cumulativeMs"] else 0
            trace["cumulativeMs"].append(previous + lap_ms)

    traces = [trace for trace in traces_by_driver.values() if trace["cumulativeMs"]]
    traces.sort(key=lambda trace: trace["finishPosition"])
    if not traces:
        raise RuntimeError("No replay traces could be built from Jolpica lap data.")

    winner = results[0]
    winner_driver = winner.get("Driver") or {}
    winner_driver_id = str(winner_driver.get("driverId") or "").strip()
    winner_trace = traces_by_driver.get(winner_driver_id)
    if not winner_trace or not winner_trace["cumulativeMs"]:
        raise RuntimeError("The winning driver's lap trace is unavailable from Jolpica.")

    total_laps = len(winner_trace["cumulativeMs"])
    total_race_ms = winner_trace["cumulativeMs"][-1]
    winner_name = jolpica_driver_name(winner)
    winner_team = str((winner.get("Constructor") or {}).get("name") or "Unknown Team")
    event_name = str(race.get("raceName") or f"Round {round_number}")

    fastest_candidates = []
    for result in results:
        fastest = result.get("FastestLap") or {}
        lap_time = ((fastest.get("Time") or {}).get("time"))
        lap_ms = parse_lap_time_ms(lap_time)
        if lap_ms is None:
            continue
        fastest_candidates.append({
            "driver": jolpica_driver_name(result),
            "driverId": str((result.get("Driver") or {}).get("driverId") or ""),
            "lap": str(fastest.get("lap") or "—"),
            "lapTime": str(lap_time),
            "lapMs": lap_ms,
            "rank": safe_int(fastest.get("rank")) or 999,
        })
    fastest_candidates.sort(key=lambda candidate: (candidate["rank"], candidate["lapMs"]))
    fastest_lap = fastest_candidates[0] if fastest_candidates else None

    fastest_checkpoint_ms = min(10_000, total_race_ms)
    if fastest_lap:
        fastest_lap_number = safe_int(fastest_lap["lap"]) or 1
        checkpoint_index = min(max(fastest_lap_number - 1, 0), len(winner_trace["cumulativeMs"]) - 1)
        fastest_checkpoint_ms = winner_trace["cumulativeMs"][checkpoint_index]

    biggest_gainer = None
    for result in results:
        grid = safe_int(result.get("grid"))
        finish = safe_int(result.get("position"))
        if grid is None or grid <= 0 or finish is None or grid <= finish:
            continue
        candidate = {
            "driver": jolpica_driver_name(result),
            "positionsGained": grid - finish,
            "started": grid,
            "finished": finish,
        }
        if biggest_gainer is None or candidate["positionsGained"] > biggest_gainer["positionsGained"]:
            biggest_gainer = candidate

    try:
        pit_payload = fetch_json(f"{JOLPICA_BASE_URL}/{season}/{round_number}/pitstops.json?limit=100")
        pit_races = (((pit_payload.get("MRData") or {}).get("RaceTable") or {}).get("Races") or [])
        pit_stops = (pit_races[0].get("PitStops") or []) if pit_races else []
    except Exception as pit_error:
        print(f"Pit-stop data unavailable for round {round_number}: {pit_error}")
        pit_stops = []
    pit_lap_counts: Dict[int, int] = {}
    for stop in pit_stops:
        pit_lap = safe_int(stop.get("lap"))
        if pit_lap is not None:
            pit_lap_counts[pit_lap] = pit_lap_counts.get(pit_lap, 0) + 1
    busiest_pit = max(pit_lap_counts.items(), key=lambda item: item[1], default=None)
    decisive_pit_window = (
        f"Lap {busiest_pit[0]} was the main strategy window with {busiest_pit[1]} recorded stops."
        if busiest_pit
        else "No single pit window dominated the recorded stops."
    )

    podium = [
        {
            "position": index,
            "driver": jolpica_driver_name(result),
            "constructor": str((result.get("Constructor") or {}).get("name") or "Unknown Team"),
        }
        for index, result in enumerate(results[:3], start=1)
    ]
    highlights = [
        {
            "id": "lights-out",
            "title": "Start",
            "detail": "Lights out and the opening order scramble.",
            "checkpointMs": min(10_000, total_race_ms),
        }
    ]
    if busiest_pit:
        pit_index = min(max(busiest_pit[0] - 1, 0), len(winner_trace["cumulativeMs"]) - 1)
        highlights.append({
            "id": "pit-window",
            "title": "Pit window",
            "detail": decisive_pit_window,
            "checkpointMs": winner_trace["cumulativeMs"][pit_index],
        })
    if fastest_lap:
        highlights.append({
            "id": "fastest-lap",
            "title": "Fastest lap",
            "detail": f"{fastest_lap['driver']} set the fastest lap on Lap {fastest_lap['lap']}.",
            "checkpointMs": fastest_checkpoint_ms,
        })

    winner_time = ((winner.get("Time") or {}).get("time"))
    winner_story = f"{winner_name} took the win for {winner_team}"
    if winner_time:
        winner_story += f" in {winner_time}"
    winner_story += "."

    fastest_driver = fastest_lap["driver"] if fastest_lap else winner_name
    recap = {
        "headline": f"{winner_name} got it done at {event_name}.",
        "winnerStory": winner_story,
        "podium": podium,
        "decisivePitWindow": decisive_pit_window,
        "biggestGainer": biggest_gainer,
        "fastestLap": {
            "driver": fastest_lap["driver"],
            "lapTime": fastest_lap["lapTime"],
            "lap": fastest_lap["lap"],
        } if fastest_lap else None,
        "keyMoments": [
            {"title": "Start", "detail": f"{winner_name} came through the opening phase in position to control the race.", "checkpointMs": min(10_000, total_race_ms)},
            {"title": "Pit window", "detail": decisive_pit_window, "checkpointMs": highlights[1]["checkpointMs"] if busiest_pit else fastest_checkpoint_ms},
            {"title": "Finish", "detail": f"{winner_name} brought it home for {winner_team}.", "checkpointMs": total_race_ms},
        ],
        "sectorNarrative": [
            {"sector": "S1", "summary": f"{winner_name} kept the opening phase under control."},
            {"sector": "S2", "summary": f"{winner_team} held the race together through the middle stint."},
            {"sector": "S3", "summary": f"{fastest_driver} set the benchmark for outright lap speed."},
        ],
    }

    return {
        "source": "Jolpica",
        "season": str(season),
        "round": str(round_number),
        "generatedAt": pd.Timestamp.utcnow().isoformat(),
        "recap": recap,
        "replay": {
            "totalLaps": total_laps,
            "totalRaceMs": total_race_ms,
            "traces": traces,
            "winnerDriverId": winner_driver_id,
            "highlights": highlights,
        },
    }


def build_bundle_with_fallback(season: int, round_number: int) -> Dict[str, Any]:
    try:
        return build_bundle(season, round_number)
    except Exception as fastf1_error:
        print(f"FastF1 timing unavailable for round {round_number}: {fastf1_error}. Falling back to Jolpica.")
        return build_jolpica_bundle(season, round_number)


def normalize_timestamp(value: Any) -> Optional[pd.Timestamp]:
    if value is None or pd.isna(value):
        return None

    timestamp = pd.Timestamp(value)
    if pd.isna(timestamp):
        return None

    if timestamp.tzinfo is not None:
        return timestamp.tz_convert("UTC").tz_localize(None)

    return timestamp


def resolve_event_cutoff(row: pd.Series) -> Optional[pd.Timestamp]:
    for key in ["Session5DateUtc", "Session5Date", "EventDate"]:
        timestamp = normalize_timestamp(row.get(key))
        if timestamp is not None:
            return timestamp
    return None


def get_completed_rounds(season: int, now: Optional[pd.Timestamp] = None) -> List[int]:
    schedule = fastf1.get_event_schedule(season, include_testing=False)
    current_time = normalize_timestamp(now or pd.Timestamp.utcnow())
    if current_time is None:
        raise RuntimeError("Could not resolve current time for completed-round generation.")

    completed_rounds: List[int] = []
    for _, row in schedule.iterrows():
        round_number = safe_int(row.get("RoundNumber"))
        event_name = str(row.get("EventName") or "").strip()
        if round_number is None or round_number <= 0:
            continue
        if not event_name:
            continue

        cutoff = resolve_event_cutoff(row)
        if cutoff is None:
            continue
        if cutoff + pd.Timedelta(hours=COMPLETION_BUFFER_HOURS) > current_time:
            continue

        completed_rounds.append(round_number)

    return sorted(set(completed_rounds))


def bundle_payload(bundle: Dict[str, Any]) -> Dict[str, Any]:
    return {key: value for key, value in bundle.items() if key != "generatedAt"}


def write_bundle(bundle: Dict[str, Any], season: int, round_number: int) -> Tuple[Path, bool]:
    output_dir = OUTPUT_DIR / str(season)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"round-{round_number}.json"

    if output_path.exists():
        try:
            existing_bundle = json.loads(output_path.read_text(encoding="utf-8"))
            if bundle_payload(existing_bundle) == bundle_payload(bundle):
                return output_path, False
        except (json.JSONDecodeError, OSError):
            pass

    output_path.write_text(json.dumps(bundle, indent=2), encoding="utf-8")
    return output_path, True


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate FastF1 replay bundle for a race.")
    parser.add_argument("--season", type=int, required=True, help="F1 season year, e.g. 2026")
    parser.add_argument("--refresh-existing", action="store_true", help="Rebuild bundles that already exist")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--round", type=int, help="Race round number, e.g. 1")
    group.add_argument("--completed", action="store_true", help="Generate bundles for all completed rounds in the season")
    args = parser.parse_args()

    ensure_fastf1_cache()

    if args.completed:
        rounds = get_completed_rounds(args.season)
        if not rounds:
            print(f"No completed rounds found for {args.season}.")
            return

        print(f"Generating FastF1 bundles for completed rounds: {', '.join(str(round_number) for round_number in rounds)}")
        changed_any = False
        missing_rounds: List[int] = []
        for round_number in rounds:
            expected_path = OUTPUT_DIR / str(args.season) / f"round-{round_number}.json"
            if expected_path.exists() and not args.refresh_existing:
                print(f"Keeping finished bundle {expected_path}")
                continue
            try:
                bundle = build_bundle_with_fallback(args.season, round_number)
                output_path, changed = write_bundle(bundle, args.season, round_number)
                if changed:
                    print(f"Wrote {output_path}")
                    changed_any = True
                else:
                    print(f"Unchanged {output_path}")
            except Exception as error:
                print(f"Skipping round {round_number}: {error}")
                if not expected_path.exists():
                    missing_rounds.append(round_number)

        if missing_rounds:
            missing_list = ", ".join(str(round_number) for round_number in missing_rounds)
            raise RuntimeError(f"Missing FastF1 bundles for completed rounds: {missing_list}")

        if not changed_any:
            print(f"No FastF1 bundle content changed for {args.season}.")
        return

    if args.round is None:
        raise RuntimeError("A round number is required unless --completed is used.")

    bundle = build_bundle_with_fallback(args.season, args.round)
    output_path, changed = write_bundle(bundle, args.season, args.round)
    print(f"{'Wrote' if changed else 'Unchanged'} {output_path}")


if __name__ == "__main__":
    main()
