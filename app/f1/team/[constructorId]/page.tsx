import { notFound } from "next/navigation";

import TeamProfileClient from "@/app/f1/team/[constructorId]/TeamProfileClient";
import { F1_SEASON } from "@/lib/f1";
import { getTeamProfile } from "@/lib/team-profile";

type Params = {
  constructorId: string;
};

export const dynamic = "force-dynamic";

export default async function TeamPage({ params }: { params: Params }) {
  const profile = await getTeamProfile(params.constructorId, F1_SEASON);

  if (!profile) {
    notFound();
  }

  return <TeamProfileClient profile={profile} />;
}
