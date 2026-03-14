"use client";

import { useEffect, useMemo, useState } from "react";

type LocalDateTimeTextProps = {
  iso: string;
  options: Intl.DateTimeFormatOptions;
  fallback?: string;
  className?: string;
};

function formatDateTime(iso: string, options: Intl.DateTimeFormatOptions, timeZone?: string) {
  const value = new Date(iso);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", timeZone ? { ...options, timeZone } : options).format(value);
}

export default function LocalDateTimeText({
  iso,
  options,
  fallback = "TBD",
  className
}: LocalDateTimeTextProps) {
  const optionsKey = useMemo(() => JSON.stringify(options), [options]);
  const [text, setText] = useState(() => formatDateTime(iso, options, "UTC") ?? fallback);

  useEffect(() => {
    setText(formatDateTime(iso, options) ?? fallback);
  }, [fallback, iso, options, optionsKey]);

  return (
    <span className={className} suppressHydrationWarning>
      {text}
    </span>
  );
}
