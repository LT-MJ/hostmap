"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * §42: user-friendly message + server-side logging, never a raw stack
 * trace/internal detail shown to the visitor. `error.digest` is the
 * correlation id Next.js attaches to the server-side log entry — safe to
 * display, since it's opaque and reveals nothing about the failure itself.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="text-muted-foreground">
        We hit an unexpected error. Please try again — if it keeps happening, contact support
        {error.digest && <> and mention reference <code className="font-mono">{error.digest}</code></>}.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
