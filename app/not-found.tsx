import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 rounded-xl border border-border bg-card p-10 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">404</p>
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="text-sm text-muted-foreground">The resource you requested does not exist.</p>
      <Link href="/" className={buttonVariants()}>
        Back to Home
      </Link>
    </div>
  );
}
