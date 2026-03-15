import MyPitWallCard from "@/components/f1/MyPitWallCard";
import { getRaceCalendar, isScheduledRace } from "@/lib/f1";
import CalendarRaceGrid from "@/components/f1/CalendarRaceGrid";

export const revalidate = 21600;

export default async function CalendarPage() {
    const races = await getRaceCalendar();
    const scheduledCount = races.filter(isScheduledRace).length;
    const canceledCount = races.length - scheduledCount;

    return (
        <main className="flex-1 overflow-y-auto bg-background-dark">
            <div className="container mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 font-display">
                        2026 CALENDAR
                    </h1>
                    <p className="text-gray-400">
                        {scheduledCount} scheduled races{canceledCount > 0 ? `, ${canceledCount} canceled` : ""}
                    </p>
                </div>
                <MyPitWallCard className="mb-8 max-w-xl" />
                <CalendarRaceGrid races={races} />
            </div>
        </main>
    );
}
