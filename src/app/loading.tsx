import { Loader2, Utensils } from "lucide-react";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas p-6 text-content">
      <section className="w-full max-w-md rounded-[24px] bg-surface-elevated/90 p-6 text-center shadow-panel">
        <div className="mx-auto flex size-14 items-center justify-center rounded-app bg-brand text-content-inverse">
          <Utensils aria-hidden="true" size={26} />
        </div>
        <h1 className="mt-4 text-section-title">Preparing your food tour</h1>
        <p className="mt-2 text-sm leading-6 text-content-muted">
          Loading the latest demo data, routes and recommendations.
        </p>
        <Loader2 aria-hidden="true" className="mx-auto mt-5 animate-spin text-brand" size={26} />
      </section>
    </main>
  );
}
