import Link from "next/link";
import { SmartFoodMapDynamic } from "@/components/map/smart-food-map-dynamic";
import { listCities, listMapRestaurants } from "@/services/restaurants/restaurant-service";

export default async function MapPage() {
  const [items, cities] = await Promise.all([listMapRestaurants(80), listCities()]);

  return (
    <main className="min-h-screen p-4 text-ink md:p-6">
      <section className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-3 rounded-[28px] bg-white/85 p-5 shadow-panel md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">Phase 6</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Smart Food Map</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
              Interactive OSM map with demo restaurant markers, popup details, list synchronization and route
              fallback.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-2xl bg-white px-4 py-3 text-sm font-bold text-clay-700 shadow-sm" href="/restaurants">
              Restaurant list
            </Link>
            <Link className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-sm" href="/dashboard">
              Dashboard
            </Link>
          </div>
        </header>

        <SmartFoodMapDynamic cities={cities} restaurants={items} />
      </section>
    </main>
  );
}
