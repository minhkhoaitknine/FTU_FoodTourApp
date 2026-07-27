"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6 text-content">
      <section className="w-full max-w-xl rounded-[24px] bg-surface-elevated/90 p-6 shadow-panel">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-app bg-danger-soft text-danger">
            <AlertTriangle aria-hidden="true" size={23} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase text-danger">Runtime error</p>
            <h1 className="mt-2 text-page-title">This screen could not load</h1>
            <p className="mt-2 text-sm leading-6 text-content-muted">
              {error.message || "The application hit an unexpected state while rendering this page."}
            </p>
            <Button className="mt-5" onClick={reset} type="button">
              <RefreshCw aria-hidden="true" size={17} />
              Retry
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
