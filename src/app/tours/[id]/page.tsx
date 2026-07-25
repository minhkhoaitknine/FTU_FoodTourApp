import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MapPinned } from "lucide-react";
import { TourActions } from "@/components/tours/tour-actions";
import { formatVnd } from "@/lib/format";
import { requireUser } from "@/lib/auth/users";
import { getUserFoodTour } from "@/services/food-tours/food-tour-service";

type TourDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TourDetailPage({ params }: TourDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;
  const tour = await getUserFoodTour(user.id, id);
  if (!tour) notFound();

  return (
    <main className="min-h-screen p-4 text-ink md:p-6">
      <section className="mx-auto max-w-6xl space-y-5">
        <header className="rounded-[28px] bg-white/90 p-5 shadow-panel">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Link className="text-sm font-bold text-clay-700" href="/tours">
                Back to history
              </Link>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">{tour.city.name}</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{tour.title}</h1>
              <p className="mt-2 text-sm text-stone-600">
                Starts at {tour.startAddress}. Route distance is estimated for MVP demo.
              </p>
            </div>
            <TourActions tourId={tour.id} />
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl bg-clay-50 p-4">
              <p className="text-sm text-stone-500">Total cost</p>
              <p className="mt-1 text-2xl font-bold">{formatVnd(tour.totalCost)}</p>
            </div>
            <div className="rounded-2xl bg-clay-50 p-4">
              <p className="text-sm text-stone-500">Travel time</p>
              <p className="mt-1 text-2xl font-bold">{tour.totalTravelMinutes} min</p>
            </div>
            <div className="rounded-2xl bg-clay-50 p-4">
              <p className="text-sm text-stone-500">Distance</p>
              <p className="mt-1 text-2xl font-bold">~ {tour.totalDistanceKm} km</p>
            </div>
          </div>
        </header>

        <section className="rounded-[28px] bg-white/90 p-5 shadow-panel">
          <h2 className="text-2xl font-bold">Timeline</h2>
          <div className="mt-5 space-y-4">
            {tour.stops.map((stop) => (
              <article className="grid gap-4 rounded-2xl border border-clay-100 bg-white p-4 md:grid-cols-[96px_1fr_auto]" key={stop.id}>
                <div>
                  <p className="text-sm font-bold text-clay-700">{stop.mealType}</p>
                  <p className="mt-1 text-sm text-stone-500">
                    {stop.plannedArrivalAt.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                <div>
                  <Link className="text-xl font-bold hover:text-clay-700" href={`/restaurants/${stop.restaurant.slug}`}>
                    {stop.restaurant.name}
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{stop.reason}</p>
                  <p className="mt-2 flex flex-wrap gap-3 text-xs text-stone-500">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} />
                      Eat {stop.estimatedMealMinutes} min
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MapPinned size={13} />
                      {stop.distanceFromPreviousKm} km from previous
                    </span>
                  </p>
                </div>
                <p className="font-bold text-leaf-700">{formatVnd(stop.estimatedCost)}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
