"use client";

import { cn } from "@/lib/utils";

type SeasonToggleOption = {
  id: string;
  label: string;
  hint?: string;
};

type SeasonToggleProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  options: SeasonToggleOption[];
  selectedId: string;
  onChange: (id: string) => void;
};

export default function SeasonToggle({
  eyebrow,
  title,
  subtitle,
  options,
  selectedId,
  onChange
}: SeasonToggleProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-gradient-to-br from-surface-dark to-background-dark p-6">
      <p className="text-xs font-mono font-bold uppercase tracking-[0.18em] text-grid-primary">{eyebrow}</p>
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">{subtitle}</p>
        </div>

        <div className="flex w-full flex-wrap gap-1 rounded-xl border border-white/10 bg-black/20 p-1 sm:w-auto">
          {options.map((option) => {
            const isActive = option.id === selectedId;

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange(option.id)}
                aria-pressed={isActive}
                className={cn(
                  "min-w-0 flex-1 rounded-lg px-4 py-3 text-left transition-colors sm:min-w-[118px] sm:flex-none",
                  isActive ? "bg-grid-primary text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
                )}
              >
                <p className="break-words text-[10px] font-bold uppercase tracking-[0.16em] leading-tight">{option.label}</p>
                {option.hint ? (
                  <p className={cn("mt-1 break-words text-[11px] leading-snug", isActive ? "text-white/80" : "text-gray-500")}>{option.hint}</p>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
}
