import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

function pageHref(params: Record<string, string | string[] | undefined>, page: number) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (key === "page") continue;
    const param = firstParam(value);
    if (param) searchParams.set(key, param);
  }

  if (page > 1) searchParams.set("page", String(page));

  const queryString = searchParams.toString();
  return queryString ? `/restaurants?${queryString}` : "/restaurants";
}

function pageNumbers(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
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

        <RestaurantPagination pagination={pagination} params={params} />

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

        <RestaurantPagination pagination={pagination} params={params} />
      </section>
    </main>
  );
}

function RestaurantPagination({
  pagination,
  params
}: {
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  params: Record<string, string | string[] | undefined>;
}) {
  if (pagination.totalPages <= 1) return null;

  const pages = pageNumbers(pagination.page, pagination.totalPages);
  const canGoPrevious = pagination.page > 1;
  const canGoNext = pagination.page < pagination.totalPages;

  return (
    <nav
      aria-label="Restaurant pages"
      className="flex flex-col gap-3 rounded-[24px] bg-white/88 px-4 py-3 shadow-panel md:flex-row md:items-center md:justify-between"
    >
      <p className="text-sm font-semibold text-stone-600">
        Page {pagination.page} of {pagination.totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {canGoPrevious ? (
          <Link
            className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-clay-700 shadow-sm transition hover:text-ink"
            href={pageHref(params, pagination.page - 1)}
          >
            <ChevronLeft size={16} />
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-2 text-sm font-bold text-stone-400">
            <ChevronLeft size={16} />
            Previous
          </span>
        )}

        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const showGap = previousPage !== undefined && page - previousPage > 1;

          return (
            <span className="flex items-center gap-2" key={page}>
              {showGap ? <span className="px-1 text-sm font-bold text-stone-400">...</span> : null}
              <Link
                aria-current={page === pagination.page ? "page" : undefined}
                className={`grid size-10 place-items-center rounded-2xl text-sm font-bold transition ${
                  page === pagination.page
                    ? "bg-ink text-white"
                    : "bg-white text-clay-700 shadow-sm hover:text-ink"
                }`}
                href={pageHref(params, page)}
              >
                {page}
              </Link>
            </span>
          );
        })}

        {canGoNext ? (
          <Link
            className="inline-flex items-center gap-2 rounded-2xl bg-ink px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-stone-800"
            href={pageHref(params, pagination.page + 1)}
          >
            Next
            <ChevronRight size={16} />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-2 text-sm font-bold text-stone-400">
            Next
            <ChevronRight size={16} />
          </span>
        )}
      </div>
    </nav>
  );
}
