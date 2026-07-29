import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/common/brand-logo";
import { AppBackground } from "@/components/layout/app-background";

export default function Loading() {
  return (
    <main className="relative isolate grid min-h-screen place-items-center bg-canvas p-6 text-content">
      <AppBackground />
      <section className="relative z-10 w-full max-w-md rounded-[24px] bg-surface-elevated/[0.65] p-6 text-center shadow-panel">
        <BrandLogo className="mx-auto size-16" priority />
        <h1 className="mt-4 text-section-title">Preparing your food tour</h1>
        <p className="mt-2 text-sm leading-6 text-content-muted">
          Loading the latest demo data, routes and recommendations.
        </p>
        <Loader2 aria-hidden="true" className="mx-auto mt-5 animate-spin text-brand" size={26} />
      </section>
    </main>
  );
}
