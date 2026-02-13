"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-xl border border-border bg-card p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Error</p>
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">We could not load this page. Retry now.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
