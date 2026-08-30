import { notFound } from "next/navigation";

import TeamProfileClient from "@/app/f1/team/[constructorId]/TeamProfileClient";
import { F1_SEASON } from "@/lib/f1";
import { getTeamProfile } from "@/lib/team-profile";

type Params = {
  constructorId: string;
};

export const revalidate = 3600;
export const dynamic = "force-static";
export const dynamicParams = true;

// Team pages are generated on first visit, then served from the ISR cache.
export function generateStaticParams(): Params[] {
  return [];
}

export default async function TeamPage({ params }: { params: Params }) {
  const profile = await getTeamProfile(params.constructorId, F1_SEASON);

  if (!profile) {
    notFound();
  }

  return <TeamProfileClient profile={profile} />;
}
