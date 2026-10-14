"use client";

import { track } from "@vercel/analytics";

export type GridEventName =
  | "driver_profile_opened"
  | "external_profile_clicked"
  | "highlights_opened"
  | "item_saved"
  | "landing_entry_clicked"
  | "race_selected"
  | "race_tab_opened"
  | "replay_completed"
  | "replay_started"
  | "standings_view_changed"
  | "team_profile_opened"
  | "leclerc_audio_played";

type GridEventValue = string | number | boolean | null | undefined;

export function trackGridEvent(
  name: GridEventName,
  properties: Record<string, GridEventValue> = {}
) {
  const normalizedProperties = Object.fromEntries(
    Object.entries(properties).filter(
      (entry): entry is [string, string | number | boolean] => entry[1] !== null && entry[1] !== undefined
    )
  );

  try {
    track(name, normalizedProperties);
  } catch {
    // Analytics must never interrupt a product action.
  }
}
