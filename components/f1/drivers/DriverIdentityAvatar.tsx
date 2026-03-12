import { cn } from "@/lib/utils";

type DriverIdentityAvatarProps = {
  givenName: string;
  familyName: string;
  accentColor?: string;
  variant?: "card" | "hero";
  className?: string;
};

function getInitials(givenName: string, familyName: string) {
  return `${givenName.charAt(0)}${familyName.charAt(0)}`.toUpperCase();
}

export default function DriverIdentityAvatar({
  givenName,
  familyName,
  accentColor = "#E10600",
  variant = "card",
  className
}: DriverIdentityAvatarProps) {
  const initials = getInitials(givenName, familyName);
  const shellSize = variant === "hero" ? "h-[220px] w-[220px]" : "h-[148px] w-[148px]";
  const initialsSize = variant === "hero" ? "text-7xl" : "text-5xl";
  const nameSize = variant === "hero" ? "text-xs tracking-[0.22em]" : "text-[10px] tracking-[0.18em]";

  return (
    <div className={cn("relative", shellSize, className)}>
      <div
        className="absolute inset-0 rounded-[2rem] blur-3xl"
        style={{ background: `radial-gradient(circle, ${accentColor}30, transparent 72%)` }}
      />

      <div className="relative h-full w-full overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(160deg,#131313_0%,#090909_100%)]">
        <div
          className="absolute inset-x-0 top-0 h-2"
          style={{ background: `linear-gradient(90deg, ${accentColor}, rgba(255,255,255,0.9))` }}
        />
        <div
          className="absolute inset-0 opacity-70"
          style={{ background: `radial-gradient(circle at 22% 18%, ${accentColor}30, transparent 28%)` }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className={cn("font-display font-black uppercase leading-none tracking-tight text-white", initialsSize)}>
            {initials}
          </p>
          <p className={cn("mt-3 text-center font-semibold uppercase text-gray-500", nameSize)}>
            {givenName} {familyName}
          </p>
        </div>

        <div className="absolute bottom-4 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/10" />
      </div>
    </div>
  );
}
