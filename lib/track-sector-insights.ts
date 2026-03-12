import type { TrackSector } from "@/lib/f1";

export type TrackSectorInsight = {
  phaseFocus: string;
  pressureProfile: string;
};

const TRACK_SECTOR_DETAIL_OVERRIDES: Partial<
  Record<string, Partial<Record<TrackSector["id"], TrackSectorInsight>>>
> = {
  albert_park: {
    S1: {
      phaseFocus: "Kerb-riding entry confidence through the opening directional changes.",
      pressureProfile: "High pressure for launch positioning and first DRS approach."
    },
    S2: {
      phaseFocus: "Mid-corner rotation quality in medium-speed sequence.",
      pressureProfile: "Tire surface temperature management under sustained lateral load."
    },
    S3: {
      phaseFocus: "Late-braking stability into stop-go style exits.",
      pressureProfile: "Overtake threat peaks if traction release is delayed."
    }
  },
  suzuka: {
    S1: {
      phaseFocus: "Rhythm and steering commitment through linked esses.",
      pressureProfile: "Front-end precision critical; small errors cascade immediately."
    },
    S2: {
      phaseFocus: "Load transfer control through high-speed direction change.",
      pressureProfile: "Aero balance sensitivity dominates pace spread."
    },
    S3: {
      phaseFocus: "Exit traction and straight setup compromise.",
      pressureProfile: "One poor launch out of final complex costs entire straight."
    }
  }
};

function getDefaultPhaseFocus(sectorId: TrackSector["id"]) {
  if (sectorId === "S1") {
    return "Opening complex where steering response and entry confidence shape the first split.";
  }

  if (sectorId === "S2") {
    return "Mid-lap rhythm section balancing speed carry against aero and tire load.";
  }

  return "Closing sequence where braking precision and traction release define exit time.";
}

function getDefaultPressureProfile(sectorId: TrackSector["id"]) {
  if (sectorId === "S1") {
    return "Position risk is highest with packed-field braking and first DRS setup.";
  }

  if (sectorId === "S2") {
    return "Sustained lateral load drives tire temperature and small understeer penalties.";
  }

  return "Late-race pass risk peaks when traction drop amplifies straight-line vulnerability.";
}

export function getTrackSectorInsight(circuitId: string, sectorId: TrackSector["id"]): TrackSectorInsight {
  const override = TRACK_SECTOR_DETAIL_OVERRIDES[circuitId]?.[sectorId];

  return {
    phaseFocus: override?.phaseFocus ?? getDefaultPhaseFocus(sectorId),
    pressureProfile: override?.pressureProfile ?? getDefaultPressureProfile(sectorId)
  };
}
