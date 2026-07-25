import Link from "next/link";
import { TourGeneratorForm } from "@/components/tours/tour-generator-form";
import { requireUser } from "@/lib/auth/users";
import { listCities } from "@/services/restaurants/restaurant-service";

export default async function TourGeneratorPage() {
  await requireUser();
  const cities = await listCities();

  return (
    <main className="min-h-screen p-4 text-ink md:p-6">
      <section className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-3 rounded-[28px] bg-white/85 p-5 shadow-panel md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">Phase 8</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Food Tour Generator</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Generate a route, save it to your history, then clone or delete it later.
            </p>
          </div>
          <Link className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" href="/tours">
            Tour history
          </Link>
        </header>

        <TourGeneratorForm cities={cities} />
      </section>
    </main>
  );
}

