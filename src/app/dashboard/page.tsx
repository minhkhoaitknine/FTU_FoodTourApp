import {
  Clock,
  MapPinned,
  Route,
  Sparkles,
  Star,
  Utensils,
  Wallet
} from "lucide-react";
import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import {
  DashboardRoutePreview,
  type DashboardRoutePoint
} from "@/components/dashboard/dashboard-route-preview";
import { AppImage } from "@/components/common/app-image";
import { UserAvatar } from "@/components/common/user-avatar";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui";
import { requireUser } from "@/lib/auth/users";
import { resolveRestaurantImage } from "@/lib/assets/image-resolver";
import { formatRating, formatVnd } from "@/lib/format";
import { getUserFoodTour, listUserFoodTours } from "@/services/food-tours/food-tour-service";
import { listMapRestaurants } from "@/services/restaurants/restaurant-service";

const dashboardFallbackCities = ["Hoi An", "Da Nang", "Ha Noi", "Ho Chi Minh City"];

export default async function DashboardPage() {
  const user = await requireUser();
  const [tours, fallbackRestaurants] = await Promise.all([
    listUserFoodTours(user.id),
    listMapRestaurants(6)
  ]);
  const latestTour = tours[0] ? await getUserFoodTour(user.id, tours[0].id) : null;
  const timelineStops = latestTour
    ? latestTour.stops.map((stop) => ({
        id: stop.id,
        mealLabel: label(stop.mealType),
        timeLabel: formatTime(stop.plannedArrivalAt),
        title: stop.restaurant.name,
        description: stop.reason,
        href: `/restaurants/${stop.restaurant.slug}`,
        cost: stop.estimatedCost,
        mealMinutes: stop.estimatedMealMinutes,
        distanceKm: stop.distanceFromPreviousKm,
        rating: stop.restaurant.ratingAverage,
        image: resolveRestaurantImage({
          name: stop.restaurant.name,
          imageAlt: stop.restaurant.images[0]?.alt,
          imageUrl: stop.restaurant.images[0]?.url,
          tags: stop.restaurant.tags.map((tag) => tag.name)
        }),
        tags: stop.restaurant.tags.map((tag) => tag.name),
        latitude: stop.restaurant.latitude,
        longitude: stop.restaurant.longitude
      }))
    : fallbackRestaurants.slice(0, 4).map((restaurant, index) => ({
        id: restaurant.id,
        mealLabel: ["Breakfast", "Lunch", "Snack", "Dinner"][index] ?? "Stop",
        timeLabel: ["07:30", "11:30", "15:30", "19:00"][index] ?? "--:--",
        title: restaurant.name,
        description: restaurant.description,
        href: `/restaurants/${restaurant.slug}`,
        cost: Math.round((restaurant.minPrice + restaurant.maxPrice) / 2),
        mealMinutes: restaurant.averageMealMinutes,
        distanceKm: index === 0 ? 0 : Number((1.2 + index * 0.8).toFixed(1)),
        rating: restaurant.ratingAverage,
        image: restaurant.image,
        tags: restaurant.tags.map((tag) => tag.name),
        latitude: restaurant.latitude,
        longitude: restaurant.longitude
      }));

  const summary = latestTour
    ? {
        totalCost: latestTour.totalCost,
        totalDistanceKm: latestTour.totalDistanceKm,
        totalTravelMinutes: latestTour.totalTravelMinutes,
        stopCount: latestTour.stops.length
      }
    : {
        totalCost: timelineStops.reduce((sum, stop) => sum + stop.cost, 0),
        totalDistanceKm: Number(
          timelineStops.reduce((sum, stop) => sum + stop.distanceKm, 0).toFixed(1)
        ),
        totalTravelMinutes: timelineStops.reduce((sum, stop) => sum + stop.mealMinutes, 0),
        stopCount: timelineStops.length
      };

  const routePoints: DashboardRoutePoint[] = timelineStops.map((stop) => ({
    id: stop.id,
    label: stop.title,
    href: stop.href,
    latitude: stop.latitude,
    longitude: stop.longitude
  }));
  const shellCityNames = latestTour
    ? [latestTour.city.name]
    : fallbackRestaurants.map((restaurant) => restaurant.city.name);

  return (
    <AppShell currentCityNames={shellCityNames.length > 0 ? shellCityNames : dashboardFallbackCities}>
      <PageContainer>
        <header className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel backdrop-blur">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                aria-label="Open profile"
                className="rounded-full focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-success/20"
                href="/profile"
                title="Open profile"
              >
                <UserAvatar name={user.fullName} size="lg" src={user.avatarUrl} />
              </Link>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase text-brand-strong">Tastetrail dashboard</p>
                <h1 className="mt-2 truncate text-page-title text-content">
                  {user.fullName}
                </h1>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                className="rounded-app bg-surface-inverse px-4 py-3 text-sm font-bold text-content-inverse shadow-sm transition hover:bg-brand-strong"
                href="/tour-generator"
              >
                Create tour
              </Link>
              <Link
                className="rounded-app border border-line bg-surface-elevated px-4 py-3 text-sm font-bold text-brand-strong shadow-sm transition hover:border-brand"
                href="/restaurants"
              >
                Explore places
              </Link>
              <LogoutButton />
            </div>
          </div>
        </header>

        <section className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <section className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-content-muted">
                    {latestTour ? "Saved itinerary" : "Starter itinerary"}
                  </p>
                  <h2 className="truncate text-section-title text-content">Latest saved route</h2>
                </div>
                <Badge variant={latestTour ? "success" : "warning"}>
                  <Sparkles aria-hidden="true" size={13} />
                  {latestTour ? "Saved" : "Preview"}
                </Badge>
              </div>

              <div className="space-y-4">
                {timelineStops.length > 0 ? (
                  timelineStops.map((stop, index) => (
                    <article
                      className="grid gap-4 rounded-app border border-line bg-surface-elevated p-4 md:grid-cols-[84px_128px_1fr_auto]"
                      key={stop.id}
                    >
                      <div>
                        <p className="text-sm font-semibold text-brand-strong">{stop.mealLabel}</p>
                        <p className="mt-1 text-lg font-bold text-content">{stop.timeLabel}</p>
                      </div>
                      <AppImage
                        alt={`${stop.title} food photo`}
                        className="aspect-[4/3] rounded-app"
                        sizes="(max-width: 768px) 100vw, 128px"
                        src={stop.image.src}
                      />
                      <div className="min-w-0">
                        <Link
                          className="text-card-title text-content transition hover:text-brand-strong"
                          href={stop.href}
                        >
                          {stop.title}
                        </Link>
                        <p className="mt-1 line-clamp-2 text-sm leading-6 text-content-muted">
                          {stop.description}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {stop.tags.slice(0, 3).map((tag) => (
                            <span className="text-xs font-semibold text-content-subtle" key={tag}>
                              <Utensils aria-hidden="true" className="mr-1 inline" size={12} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 md:flex-col md:items-end md:justify-between">
                        <span className="flex items-center gap-1 text-sm font-bold text-brand-strong">
                          <Star aria-hidden="true" fill="currentColor" size={15} />
                          {formatRating(stop.rating)}
                        </span>
                        <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-bold text-success">
                          {formatVnd(stop.cost)}
                        </span>
                        <span className="text-xs font-semibold text-content-subtle">
                          Stop {index + 1}
                        </span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-app bg-surface-muted p-6 text-center">
                    <h3 className="text-card-title text-content">No route data yet</h3>
                    <p className="mt-2 text-sm text-content-muted">
                      Generate a tour to see your timeline here.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-4">
              <SummaryCard
                icon={<Wallet aria-hidden="true" size={19} />}
                label="Estimated cost"
                value={formatVnd(summary.totalCost)}
              />
              <SummaryCard
                icon={<Clock aria-hidden="true" size={19} />}
                label="Travel + dining"
                value={`${summary.totalTravelMinutes} min`}
              />
              <SummaryCard
                icon={<Route aria-hidden="true" size={19} />}
                label="Distance"
                value={`~ ${summary.totalDistanceKm} km`}
              />
              <SummaryCard
                icon={<MapPinned aria-hidden="true" size={19} />}
                label="Stops"
                value={String(summary.stopCount)}
              />
            </section>
          </div>

          <aside className="space-y-5">
            <DashboardRoutePreview points={routePoints} />
          </aside>
        </section>
      </PageContainer>
    </AppShell>
  );
}

function SummaryCard({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-[28px] bg-surface-elevated/[0.65] p-4 shadow-panel">
      <div className="flex items-center gap-2 text-brand-strong">
        {icon}
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-content">{value}</p>
    </article>
  );
}

function formatTime(value: Date) {
  return value.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
