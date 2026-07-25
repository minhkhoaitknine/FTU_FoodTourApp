import Link from "next/link";
import { RestaurantCard } from "@/components/restaurants/restaurant-card";
import { RestaurantFilters } from "@/components/restaurants/restaurant-filters";
import { listCities, listRestaurants } from "@/services/restaurants/restaurant-service";
import { restaurantListQuerySchema } from "@/services/restaurants/restaurant-schemas";

type RestaurantsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RestaurantsPage({ searchParams }: RestaurantsPageProps) {
  const params = await searchParams;
  const rawQuery = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, firstParam(value) ?? ""])
  );
  const query = restaurantListQuerySchema.parse(rawQuery);
  const [{ items, pagination }, cities] = await Promise.all([listRestaurants(query), listCities()]);

  return (
    <main className="min-h-screen p-4 text-ink md:p-6">
      <section className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-[28px] bg-white/85 p-5 shadow-panel">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">
                Restaurant core module
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">Explore demo food places</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
                Search and filter 60 fictitious demo restaurants across major Vietnamese travel cities.
              </p>
            </div>
            <Link className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" href="/dashboard">
              Dashboard
            </Link>
          </div>
        </header>

        <RestaurantFilters
          cities={cities}
          defaults={{
            q: query.q,
            city: query.city,
            type: query.type,
            priceRange: query.priceRange,
            vegetarian: rawQuery.vegetarian,
            spicy: rawQuery.spicy,
            minRating: rawQuery.minRating
          }}
        />

        <div className="rounded-[24px] bg-white/80 px-4 py-3 text-sm font-semibold text-stone-600">
          Showing {items.length} of {pagination.total} restaurants. Page {pagination.page} of {pagination.totalPages}.
        </div>

        {items.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {items.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] bg-white/90 p-8 text-center shadow-panel">
            <h2 className="text-2xl font-bold">No restaurants found</h2>
            <p className="mt-2 text-sm text-stone-600">Try clearing filters or choosing another city.</p>
          </div>
        )}
      </section>
    </main>
  );
}

