"use client";

import { useEffect, useMemo, useState } from "react";

type LocalDateTimeTextProps = {
  iso: string;
  fallback?: string;
  options?: Intl.DateTimeFormatOptions;
};

export default function LocalDateTimeText({
  iso,
  fallback = "Time unavailable",
  options
}: LocalDateTimeTextProps) {
  const [mounted, setMounted] = useState(false);
  const [clientTimeZone, setClientTimeZone] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      setClientTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      setClientTimeZone("UTC");
    }
  }, []);

  const formatted = useMemo(() => {
    const parsed = new Date(iso);

    if (Number.isNaN(parsed.getTime()) || !clientTimeZone) {
      return fallback;
    }

    try {
      return parsed.toLocaleString(undefined, {
        ...options,
        timeZone: options?.timeZone ?? clientTimeZone
      });
    } catch {
      return fallback;
    }
  }, [clientTimeZone, fallback, iso, options]);

  return <span suppressHydrationWarning>{mounted ? formatted : fallback}</span>;
}
