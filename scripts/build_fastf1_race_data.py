#!/usr/bin/env python3

import argparse
import json
from pathlib import Path
from statistics import mean
from typing import Any, Dict, List, Optional

import fastf1
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
CACHE_DIR = ROOT / ".cache" / "fastf1"
OUTPUT_DIR = ROOT / "public" / "data" / "fastf1"
COMPLETION_BUFFER_HOURS = 6


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
    fastf1.Cache.enable_cache(str(CACHE_DIR))
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


def write_bundle(bundle: Dict[str, Any], season: int, round_number: int) -> Path:
    output_dir = OUTPUT_DIR / str(season)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"round-{round_number}.json"
    output_path.write_text(json.dumps(bundle, indent=2), encoding="utf-8")
    return output_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate FastF1 replay bundle for a race.")
    parser.add_argument("--season", type=int, required=True, help="F1 season year, e.g. 2026")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--round", type=int, help="Race round number, e.g. 1")
    group.add_argument("--completed", action="store_true", help="Generate bundles for all completed rounds in the season")
    args = parser.parse_args()

    fastf1.Cache.enable_cache(str(CACHE_DIR))

    if args.completed:
        rounds = get_completed_rounds(args.season)
        if not rounds:
            print(f"No completed rounds found for {args.season}.")
            return

        print(f"Generating FastF1 bundles for completed rounds: {', '.join(str(round_number) for round_number in rounds)}")
        wrote_any = False
        for round_number in rounds:
            try:
                bundle = build_bundle(args.season, round_number)
                output_path = write_bundle(bundle, args.season, round_number)
                print(f"Wrote {output_path}")
                wrote_any = True
            except Exception as error:
                print(f"Skipping round {round_number}: {error}")
        if not wrote_any:
            print(f"No FastF1 bundles refreshed for {args.season}. Existing files were left unchanged.")
        return

    if args.round is None:
        raise RuntimeError("A round number is required unless --completed is used.")

    bundle = build_bundle(args.season, args.round)
    output_path = write_bundle(bundle, args.season, args.round)
    print(f"Wrote {output_path}")


if __name__ == "__main__":
    main()
