import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
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
  const shellCityNames = query.city ? [query.city] : cities.map((city) => city.name);

  return (
    <AppShell currentCityNames={shellCityNames}>
      <PageContainer>
        <header className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-strong">
                Restaurant explorer
              </p>
              <h1 className="mt-2 text-page-title text-content">Explore food places</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-content-muted">
                Search seeded restaurants across major Vietnamese travel cities and open details from cards or map.
              </p>
            </div>
            <Link className="rounded-app bg-surface-inverse px-4 py-3 text-sm font-bold text-content-inverse" href="/dashboard">
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

        <div className="rounded-[24px] bg-surface-elevated/[0.65] px-4 py-3 text-sm font-semibold text-content-muted shadow-panel">
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
          <div className="rounded-[28px] bg-surface-elevated/[0.65] p-8 text-center shadow-panel">
            <h2 className="text-section-title text-content">No restaurants found</h2>
            <p className="mt-2 text-sm text-content-muted">Try clearing filters or choosing another city.</p>
          </div>
        )}

        <RestaurantPagination pagination={pagination} params={params} />
      </PageContainer>
    </AppShell>
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
      className="flex flex-col gap-3 rounded-[24px] bg-surface-elevated/[0.65] px-4 py-3 shadow-panel md:flex-row md:items-center md:justify-between"
    >
      <p className="text-sm font-semibold text-content-muted">
        Page {pagination.page} of {pagination.totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        {canGoPrevious ? (
          <Link
            className="inline-flex items-center gap-2 rounded-app bg-surface px-4 py-2 text-sm font-bold text-brand-strong shadow-sm transition hover:text-content"
            href={pageHref(params, pagination.page - 1)}
          >
            <ChevronLeft size={16} />
            Previous
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-app bg-surface-muted px-4 py-2 text-sm font-bold text-content-subtle">
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
                    ? "bg-surface-inverse text-content-inverse"
                    : "bg-surface text-brand-strong shadow-sm hover:text-content"
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
            className="inline-flex items-center gap-2 rounded-app bg-surface-inverse px-4 py-2 text-sm font-bold text-content-inverse shadow-sm transition hover:bg-brand-strong"
            href={pageHref(params, pagination.page + 1)}
          >
            Next
            <ChevronRight size={16} />
          </Link>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-app bg-surface-muted px-4 py-2 text-sm font-bold text-content-subtle">
            Next
            <ChevronRight size={16} />
          </span>
        )}
      </div>
    </nav>
  );
}
