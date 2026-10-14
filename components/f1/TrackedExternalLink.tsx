"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

import { trackGridEvent, type GridEventName } from "@/lib/analytics";

type TrackedExternalLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  eventName: GridEventName;
  eventProperties?: Record<string, string | number | boolean | null | undefined>;
};

export default function TrackedExternalLink({
  children,
  eventName,
  eventProperties,
  onClick,
  ...props
}: TrackedExternalLinkProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        trackGridEvent(eventName, eventProperties);
        onClick?.(event);
      }}
    >
      {children}
    </a>
  );
}
