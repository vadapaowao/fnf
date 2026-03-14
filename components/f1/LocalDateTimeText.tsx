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

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatted = useMemo(() => {
    const parsed = new Date(iso);

    if (Number.isNaN(parsed.getTime())) {
      return fallback;
    }

    try {
      return parsed.toLocaleString(undefined, options);
    } catch {
      return fallback;
    }
  }, [fallback, iso, options]);

  return <>{mounted ? formatted : fallback}</>;
}
