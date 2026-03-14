import { cn } from "@/lib/utils";
import type { FormResult } from "@/lib/football-api";

const FORM_TONES: Record<FormResult, string> = {
  W: "bg-green-600 text-white",
  D: "bg-yellow-600 text-white",
  L: "bg-red-700 text-white",
};

type FormGuideProps = {
  results: FormResult[];
  className?: string;
};

export default function FormGuide({ results, className }: FormGuideProps) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {results.length > 0
        ? results.slice(0, 5).map((result, index) => (
            <span
              key={`${result}-${index}`}
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold",
                FORM_TONES[result]
              )}
            >
              {result}
            </span>
          ))
        : Array.from({ length: 5 }, (_, index) => (
            <span
              key={`empty-${index}`}
              className="flex h-5 w-5 items-center justify-center rounded border border-white/10 bg-white/5 text-[10px] font-bold text-[#8A9E8C]"
            >
              -
            </span>
          ))}
    </div>
  );
}
