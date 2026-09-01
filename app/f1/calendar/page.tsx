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
            <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 md:py-12">
                <div className="mb-6 sm:mb-8">
                    <h1 className="mb-2 font-display text-3xl font-bold text-white sm:text-4xl">
                        2026 CALENDAR
                    </h1>
                    <p className="text-gray-400">
                        {scheduledCount} scheduled races{canceledCount > 0 ? `, ${canceledCount} canceled` : ""}
                    </p>
                </div>
                <MyPitWallCard className="mb-6 max-w-xl sm:mb-8" />
                <CalendarRaceGrid races={races} />
            </div>
        </main>
    );
}
