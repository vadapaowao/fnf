"use client";

import { useState } from "react";

import StandingsAccordion, { type StandingsAccordionRow } from "@/components/f1/StandingsAccordion";

type StandingsSwitcherProps = {
  driverRows: StandingsAccordionRow[];
  constructorRows: StandingsAccordionRow[];
};

const views = [
  { id: "drivers", label: "Drivers" },
  { id: "constructors", label: "Constructors" }
] as const;

export default function StandingsSwitcher({ driverRows, constructorRows }: StandingsSwitcherProps) {
  const [activeView, setActiveView] = useState<(typeof views)[number]["id"]>("drivers");

  const activeProps = activeView === "drivers"
    ? {
        eyebrow: "Drivers",
        title: "Driver standings",
        subtitle: "The current championship order.",
        rows: driverRows
      }
    : {
        eyebrow: "Constructors",
        title: "Constructor standings",
        subtitle: "How the team fight looks right now.",
        rows: constructorRows
      };

  return (
    <>
      <section className="mt-5 md:hidden">
        <div className="mb-3 grid grid-cols-2 rounded-xl border border-white/10 bg-black/30 p-1" role="tablist" aria-label="Standings table">
          {views.map((view) => {
            const active = activeView === view.id;
            return (
              <button
                key={view.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveView(view.id)}
                className={`min-h-11 rounded-lg px-3 text-sm font-bold transition-colors ${
                  active ? "bg-grid-primary text-white" : "text-gray-500"
                }`}
              >
                {view.label}
              </button>
            );
          })}
        </div>
        <StandingsAccordion {...activeProps} />
      </section>

      <div className="mt-6 hidden gap-6 md:grid xl:grid-cols-2">
        <StandingsAccordion
          eyebrow="Drivers"
          title="Driver standings"
          subtitle="The current championship order."
          rows={driverRows}
        />
        <StandingsAccordion
          eyebrow="Constructors"
          title="Constructor standings"
          subtitle="How the team fight looks right now."
          rows={constructorRows}
        />
      </div>
    </>
  );
}
