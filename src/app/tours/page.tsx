import Link from "next/link";
import { CalendarDays, MapPinned } from "lucide-react";
import { formatVnd } from "@/lib/format";
import { requireUser } from "@/lib/auth/users";
import { listUserFoodTours } from "@/services/food-tours/food-tour-service";

export default async function TourHistoryPage() {
  const user = await requireUser();
  const tours = await listUserFoodTours(user.id);

  return (
    <main className="min-h-screen p-4 text-ink md:p-6">
      <section className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-3 rounded-[28px] bg-white/85 p-5 shadow-panel md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">Saved tours</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Tour history</h1>
          </div>
          <Link className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" href="/tour-generator">
            Create new tour
          </Link>
        </header>

        {tours.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {tours.map((tour) => (
              <Link
                className="rounded-[28px] bg-white/90 p-5 shadow-panel transition hover:-translate-y-0.5"
                href={`/tours/${tour.id}`}
                key={tour.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-clay-700">{tour.city.name}</p>
                    <h2 className="mt-1 text-2xl font-bold">{tour.title}</h2>
                  </div>
                  <CalendarDays className="text-clay-700" />
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-2xl bg-clay-50 p-3">
                    <p className="text-stone-500">Cost</p>
                    <p className="font-bold">{formatVnd(tour.totalCost)}</p>
                  </div>
                  <div className="rounded-2xl bg-clay-50 p-3">
                    <p className="text-stone-500">Distance</p>
                    <p className="font-bold">{tour.totalDistanceKm} km</p>
                  </div>
                  <div className="rounded-2xl bg-clay-50 p-3">
                    <p className="text-stone-500">Stops</p>
                    <p className="font-bold">{tour.stops.length}+</p>
                  </div>
                </div>
                <p className="mt-4 flex items-center gap-2 text-sm text-stone-600">
                  <MapPinned size={15} />
                  {tour.stops.map((stop) => stop.restaurant.name).join(" -> ")}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] bg-white/90 p-8 text-center shadow-panel">
            <h2 className="text-2xl font-bold">No saved tours yet</h2>
            <p className="mt-2 text-sm text-stone-600">Create your first generated food tour.</p>
          </div>
        )}
      </section>
    </main>
  );
}

