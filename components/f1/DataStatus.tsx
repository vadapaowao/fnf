import LocalDateTimeText from "@/components/f1/LocalDateTimeText";
import { cn } from "@/lib/utils";

type DataStatusProps = {
  checkedAt: string;
  source: string;
  status: string;
  className?: string;
};

export default function DataStatus({ checkedAt, source, status, className }: DataStatusProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500",
        className
      )}
      aria-label={`Data: ${status}. Sources: ${source}.`}
    >
      <span className="inline-flex items-center gap-1.5 font-semibold text-gray-400">
        {status}
      </span>
      <span>Sources: {source}</span>
      <span>
        Page generated{" "}
        <LocalDateTimeText
          iso={checkedAt}
          fallback="recently"
          options={{
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short"
          }}
        />
      </span>
    </div>
  );
}
