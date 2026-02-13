import { notFound } from "next/navigation";
import { getDriverById, getDriverStandings, getDriverCareerStats } from "@/lib/f1";
import DriverProfileClient from "./DriverProfileClient";

interface Params {
    driverId: string;
}

// Generate static params for all drivers
export async function generateStaticParams(): Promise<Params[]> {
    const drivers = await getDriverStandings("2023");
    return drivers.map((standing) => ({
        driverId: standing.driver.driverId,
    }));
}

export default async function DriverPage({ params }: { params: Params }) {
    const standing = await getDriverById(params.driverId, "2026");

    if (!standing) {
        notFound();
    }

    // Get career stats
    const careerStats = await getDriverCareerStats(params.driverId);

    return <DriverProfileClient standing={standing} careerStats={careerStats} />;
}
