import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, MapPinned, Route, Utensils } from "lucide-react";
import { AppImage } from "@/components/common/app-image";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
import { TourActions } from "@/components/tours/tour-actions";
import { TourPlanEditor } from "@/components/tours/tour-plan-editor";
import { Badge, buttonVariants } from "@/components/ui";
import { resolveCityImage, resolveRestaurantImage } from "@/lib/assets/image-resolver";
import { formatVnd } from "@/lib/format";
import { requireUser } from "@/lib/auth/users";
import { getUserFoodTour } from "@/services/food-tours/food-tour-service";
import { listMapRestaurants } from "@/services/restaurants/restaurant-service";

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
  const restaurantOptions = (await listMapRestaurants(80))
    .filter((restaurant) => restaurant.city.id === tour.cityId)
    .map((restaurant) => ({
      id: restaurant.id,
      name: restaurant.name,
      minPrice: restaurant.minPrice,
      maxPrice: restaurant.maxPrice,
      averageMealMinutes: restaurant.averageMealMinutes
    }));
  const cityImage = resolveCityImage(tour.city.name);

  return (
    <AppShell currentCityName={tour.city.name}>
      <PageContainer size="6xl">
        <header className="overflow-hidden rounded-[28px] bg-surface-elevated/92 shadow-panel">
          <AppImage
            alt={cityImage.alt}
            className="h-52 rounded-b-none"
            imageClassName="brightness-[0.82]"
            priority
            src={cityImage.src}
          />
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="p-5 md:p-6">
              <Link className="inline-flex items-center gap-2 text-sm font-bold text-brand-strong" href="/tours">
                <ArrowLeft aria-hidden="true" size={16} />
                Back to history
              </Link>
              <p className="mt-4 text-sm font-semibold uppercase text-brand-strong">{tour.city.name}</p>
              <h1 className="mt-2 text-page-title text-content">{tour.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-content-muted">
                Starts at {tour.startAddress}. Route distance is estimated for MVP demo.
              </p>
            </div>
            <div className="px-5 pb-5 md:p-6">
              <TourActions tourId={tour.id} />
            </div>
          </div>

          <div className="grid gap-3 px-5 pb-5 md:grid-cols-4 md:px-6 md:pb-6">
            <div className="rounded-app bg-surface-muted p-4">
              <p className="text-sm text-content-muted">Total cost</p>
              <p className="mt-1 text-2xl font-bold text-content">{formatVnd(tour.totalCost)}</p>
            </div>
            <div className="rounded-app bg-surface-muted p-4">
              <p className="text-sm text-content-muted">Travel time</p>
              <p className="mt-1 text-2xl font-bold text-content">{tour.totalTravelMinutes} min</p>
            </div>
            <div className="rounded-app bg-surface-muted p-4">
              <p className="text-sm text-content-muted">Distance</p>
              <p className="mt-1 text-2xl font-bold text-content">~ {tour.totalDistanceKm} km</p>
            </div>
            <div className="rounded-app bg-surface-muted p-4">
              <p className="text-sm text-content-muted">Stops</p>
              <p className="mt-1 text-2xl font-bold text-content">{tour.summary.stopCount}</p>
            </div>
          </div>
        </header>

        <TourPlanEditor
          initialStops={tour.stops.map((stop) => ({
            id: stop.id,
            restaurantId: stop.restaurantId,
            mealType: stop.mealType,
            plannedArrivalAt: stop.plannedArrivalAt.toISOString(),
            estimatedMealMinutes: stop.estimatedMealMinutes,
            estimatedCost: stop.estimatedCost,
            reason: stop.reason
          }))}
          numberOfPeople={tour.numberOfPeople}
          restaurantOptions={restaurantOptions}
          title={tour.title}
          tourId={tour.id}
        />

        <section className="rounded-[28px] bg-surface-elevated/92 p-5 shadow-panel md:p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-strong">Itinerary</p>
              <h2 className="mt-1 text-section-title text-content">Timeline</h2>
            </div>
            <Badge variant="info">
              <Route aria-hidden="true" size={13} />
              Ordered by planned arrival
            </Badge>
          </div>

          <div className="mt-5 space-y-4">
            {tour.stops.map((stop) => {
              const restaurantImage = resolveRestaurantImage({
                name: stop.restaurant.name,
                imageAlt: stop.restaurant.images[0]?.alt,
                imageUrl: stop.restaurant.images[0]?.url,
                tags: stop.restaurant.tags.map((tag) => tag.name)
              });

              return (
                <article
                  className="grid gap-4 rounded-app border border-line bg-surface-elevated p-4 md:grid-cols-[92px_150px_1fr_auto]"
                  key={stop.id}
                >
                <div className="md:border-r md:border-line md:pr-4">
                  <p className="text-sm font-bold text-brand-strong">{stop.mealType}</p>
                  <p className="mt-1 text-sm text-content-muted">
                    {stop.plannedArrivalAt.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
                <AppImage
                  alt={restaurantImage.alt}
                  className="h-36 md:h-full"
                  sizes="(max-width: 768px) 100vw, 150px"
                  src={restaurantImage.src}
                />
                <div>
                  <Link
                    className="text-card-title text-content hover:text-brand-strong"
                    href={`/restaurants/${stop.restaurant.slug}`}
                  >
                    {stop.restaurant.name}
                  </Link>
                  <p className="mt-2 text-sm leading-6 text-content-muted">{stop.reason}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge>
                      <Clock aria-hidden="true" size={13} />
                      Eat {stop.estimatedMealMinutes} min
                    </Badge>
                    <Badge>
                      <MapPinned aria-hidden="true" size={13} />
                      {stop.distanceFromPreviousKm} km from previous
                    </Badge>
                    <Badge variant="brand">
                      <Utensils aria-hidden="true" size={13} />
                      {stop.restaurant.type.replaceAll("_", " ").toLowerCase()}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-row items-center justify-between gap-3 md:flex-col md:items-end">
                  <p className="font-bold text-success">{formatVnd(stop.estimatedCost)}</p>
                  <Link
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                    href={`/restaurants/${stop.restaurant.slug}`}
                  >
                    Details
                  </Link>
                </div>
              </article>
              );
            })}
          </div>
        </section>
      </PageContainer>
    </AppShell>
  );
}
