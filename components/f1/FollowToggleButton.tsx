"use client";

import { cn } from "@/lib/utils";
import { type FollowEntityType, useFollowedEntities } from "@/components/f1/follow-store";

type FollowToggleButtonProps = {
  type: FollowEntityType;
  id: string;
  label: string;
  subtitle: string;
  href: string;
  accentColor?: string;
  season?: string;
  className?: string;
  compact?: boolean;
  followCopy?: string;
  followingCopy?: string;
};

export default function FollowToggleButton({
  type,
  id,
  label,
  subtitle,
  href,
  accentColor = "#E10600",
  season,
  className,
  compact = false,
  followCopy = "Follow",
  followingCopy = "Following"
}: FollowToggleButtonProps) {
  const { hasLoaded, isFollowed, toggle } = useFollowedEntities();
  const followed = hasLoaded ? isFollowed(type, id) : false;

  return (
    <button
      type="button"
      onClick={() =>
        toggle({
          type,
          id,
          label,
          subtitle,
          href,
          accentColor,
          season
        })
      }
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
        followed
          ? "border-transparent bg-white text-black hover:bg-white/90"
          : "border-white/10 bg-black/20 text-gray-300 hover:border-white/30 hover:text-white",
        compact ? "px-2.5 py-1.5 text-[10px]" : "",
        className
      )}
      style={followed ? { boxShadow: `0 0 0 1px ${accentColor}55 inset` } : undefined}
      aria-pressed={followed}
    >
      <span
        className="material-icons text-sm"
        style={!followed ? { color: accentColor } : undefined}
      >
        {followed ? "done" : "add"}
      </span>
      {followed ? followingCopy : followCopy}
    </button>
  );
}
