import { notFound } from "next/navigation";

import DriverProfileClient from "@/app/f1/driver/[driverId]/DriverProfileClient";
import { getDriverProfile } from "@/lib/driver-profile";
import { F1_SEASON, getDriverStandings } from "@/lib/f1";

type DriverPageProps = {
  params: {
    driverId: string;
  };
};

export async function generateStaticParams() {
  const standings = await getDriverStandings(F1_SEASON);

  return standings.map((standing) => ({
    driverId: standing.driver.driverId
  }));
}

export async function generateMetadata({ params }: DriverPageProps) {
  const profile = await getDriverProfile(params.driverId, F1_SEASON);

  if (!profile) {
    return {
      title: "Driver Not Found"
    };
  }

  return {
    title: `${profile.standing.driver.givenName} ${profile.standing.driver.familyName} - Arena F1`,
    description: `${profile.standing.driver.givenName} ${profile.standing.driver.familyName} profile and career statistics.`
  };
}

export default async function DriverPage({ params }: DriverPageProps) {
  const profile = await getDriverProfile(params.driverId, F1_SEASON);

  if (!profile) {
    notFound();
  }

  return <DriverProfileClient profile={profile} />;
}

