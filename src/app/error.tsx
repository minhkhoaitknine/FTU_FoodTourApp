"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-ink">
      <section className="w-full max-w-xl rounded-[24px] bg-white/90 p-6 shadow-panel">
        <div className="flex items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
            <AlertTriangle size={23} />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">Runtime error</p>
            <h1 className="mt-2 text-3xl font-bold">This screen could not load</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {error.message || "The application hit an unexpected state while rendering this page."}
            </p>
            <button
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white"
              onClick={reset}
              type="button"
            >
              <RefreshCw size={17} />
              Retry
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
