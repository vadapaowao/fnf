export function formatTeamBadge(id: string): string {
  const normalized = id.trim().toLowerCase();

  if (normalized === "rb") {
    return "RB F1";
  }

  if (normalized === "haas") {
    return "HAAS";
  }

  if (normalized === "alphatauri") {
    return "ALPHATAURI";
  }

  return normalized.replace(/_/g, " ").toUpperCase();
}
