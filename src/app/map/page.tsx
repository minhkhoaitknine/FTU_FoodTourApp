import Link from "next/link";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
import { SmartFoodMapDynamic } from "@/components/map/smart-food-map-dynamic";
import { listCities, listMapRestaurants } from "@/services/restaurants/restaurant-service";

export const dynamic = "force-dynamic";

export default async function MapPage() {
  const [items, cities] = await Promise.all([listMapRestaurants(80), listCities()]);

  return (
    <AppShell currentCityNames={cities.map((city) => city.name)}>
      <PageContainer>
        <header className="flex flex-col gap-3 rounded-[28px] bg-surface-elevated/90 p-5 shadow-panel md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-strong">Smart Food Map</p>
            <h1 className="mt-2 text-page-title text-content">Restaurants on the map</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-content-muted">
              Filter restaurants, select markers, preview an estimated route and open detailed food places.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-app border border-line bg-surface-elevated px-4 py-3 text-sm font-bold text-brand-strong shadow-sm" href="/restaurants">
              Restaurant list
            </Link>
            <Link className="rounded-app bg-surface-inverse px-4 py-3 text-sm font-bold text-content-inverse shadow-sm" href="/dashboard">
              Dashboard
            </Link>
          </div>
        </header>

        <SmartFoodMapDynamic cities={cities} restaurants={items} />
      </PageContainer>
    </AppShell>
  );
}
