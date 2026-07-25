import { Loader2, Utensils } from "lucide-react";

export default function Loading() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-ink">
      <section className="w-full max-w-md rounded-[24px] bg-white/88 p-6 text-center shadow-panel">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-clay-500 text-white">
          <Utensils size={26} />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Preparing your food tour</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Loading the latest demo data, routes and recommendations.
        </p>
        <Loader2 className="mx-auto mt-5 animate-spin text-clay-700" size={26} />
      </section>
    </main>
  );
}
