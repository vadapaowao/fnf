import { getRaceCalendar } from "@/lib/f1";
import CalendarRaceGrid from "@/components/f1/CalendarRaceGrid";

export default async function CalendarPage() {
    const races = await getRaceCalendar();

    return (
        <main className="flex-1 overflow-y-auto bg-background-dark">
            <div className="container mx-auto px-6 py-12">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 font-display">
                        2026 CALENDAR
                    </h1>
                    <p className="text-gray-400">
                        {races.length} races across the season
                    </p>
                </div>
                <CalendarRaceGrid races={races} />
            </div>
        </main>
    );
}
