import { NextResponse } from "next/server";

import { getClubProfile, getClubRecentMatches, getClubUpcomingMatches } from "@/lib/football-api";

export const revalidate = 60;

export async function GET(_: Request, context: { params: { id: string } }) {
  const teamId = Number.parseInt(context.params.id, 10);

  if (!Number.isFinite(teamId)) {
    return NextResponse.json({ error: "Invalid club id" }, { status: 400 });
  }

  const [club, upcomingMatches, recentMatches] = await Promise.all([
    getClubProfile(teamId),
    getClubUpcomingMatches(teamId, 5),
    getClubRecentMatches(teamId, 5),
  ]);

  if (!club) {
    return NextResponse.json({ error: "Data unavailable" }, { status: 404 });
  }

  return NextResponse.json({
    club,
    upcomingMatches,
    recentMatches,
  });
}
