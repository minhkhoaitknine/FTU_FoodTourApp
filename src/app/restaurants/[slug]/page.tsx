import { Clock, MapPin, Star, Utensils } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppImage } from "@/components/common/app-image";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
import { ReviewForm } from "@/components/reviews/review-form";
import { Badge } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth/users";
import { resolveFoodImage } from "@/lib/assets/image-resolver";
import { formatRating, formatVnd } from "@/lib/format";
import { isFavorite } from "@/services/favorites/favorite-service";
import { findOwnReview } from "@/services/reviews/review-service";
import { getRestaurantBySlugOrId } from "@/services/restaurants/restaurant-service";

type RestaurantDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function RestaurantDetailPage({ params }: RestaurantDetailPageProps) {
  const { slug } = await params;
  const restaurant = await getRestaurantBySlugOrId(slug);
  if (!restaurant) notFound();
  const user = await getCurrentUser();
  const heroImage = restaurant.image;
  const [favorite, ownReview] = user
    ? await Promise.all([isFavorite(user.id, restaurant.id), findOwnReview(user.id, restaurant.id)])
    : [false, null];

  return (
    <AppShell currentCityName={restaurant.city.name}>
      <PageContainer size="6xl">
        <header className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel">
          <Link className="text-sm font-bold text-brand-strong" href="/restaurants">
            Back to restaurants
          </Link>
          <div className="mt-4">
            <FavoriteButton disabled={!user} initialIsFavorite={favorite} restaurantId={restaurant.id} />
          </div>
          <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_320px]">
            <div>
              <p className="flex items-center gap-2 text-sm text-stone-500">
                <MapPin size={16} />
                {restaurant.address}
              </p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{restaurant.name}</h1>
              <p className="mt-3 max-w-3xl leading-7 text-stone-600">{restaurant.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {restaurant.tags.map((tag) => (
                  <Badge key={tag.id} variant="brand">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] bg-surface-muted p-4">
              <AppImage
                alt={heroImage.alt}
                className="aspect-[4/3] rounded-2xl"
                priority
                sizes="(max-width: 1024px) 100vw, 320px"
                src={heroImage.src}
              />
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-app bg-surface-elevated p-3">
                  <p className="text-content-muted">Rating</p>
                  <p className="mt-1 flex items-center gap-1 text-xl font-bold">
                    <Star size={17} fill="currentColor" />
                    {formatRating(restaurant.ratingAverage)}
                  </p>
                </div>
                <div className="rounded-app bg-surface-elevated p-3">
                  <p className="text-content-muted">Meal time</p>
                  <p className="mt-1 flex items-center gap-1 text-xl font-bold">
                    <Clock size={17} />
                    {restaurant.averageMealMinutes}m
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <section className="space-y-5">
            <div className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel">
              <h2 className="text-2xl font-bold">Menu</h2>
              <div className="mt-4 space-y-5">
                {restaurant.menuCategories.map((category) => (
                  <div key={category.id}>
                    <h3 className="font-bold text-brand-strong">{category.name}</h3>
                    <div className="mt-3 grid gap-3">
                      {category.items.map((item) => {
                        const foodImage = resolveFoodImage({
                          name: item.name,
                          tags: restaurant.tags.map((tag) => tag.name)
                        });

                        return (
                        <article className="grid gap-3 rounded-app border border-line bg-surface-elevated p-3 md:grid-cols-[92px_1fr_auto]" key={item.id}>
                          <AppImage
                            alt={foodImage.alt}
                            className="aspect-square rounded-app-sm"
                            sizes="92px"
                            src={foodImage.src}
                          />
                          <div className="flex items-start justify-between gap-3 md:contents">
                            <div>
                              <h4 className="font-bold">{item.name}</h4>
                              <p className="mt-1 text-sm text-content-muted">{item.description}</p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {item.isVegetarian ? <Badge variant="success">Vegetarian</Badge> : null}
                                {item.isSpicy ? <Badge variant="danger">Spicy</Badge> : null}
                              </div>
                            </div>
                            <p className="shrink-0 font-bold text-success">{formatVnd(item.price)}</p>
                          </div>
                        </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel">
              <h2 className="text-2xl font-bold">Reviews</h2>
              <div className="mt-4 space-y-3">
                {restaurant.reviews.length > 0 ? (
                  restaurant.reviews.map((review) => (
                    <article className="rounded-app border border-line bg-surface-elevated p-4" key={review.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold">{review.user.fullName}</p>
                        <span className="flex items-center gap-1 text-sm font-bold text-brand-strong">
                          <Star size={14} fill="currentColor" />
                          {review.rating}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-content-muted">{review.comment}</p>
                    </article>
                  ))
                ) : (
                  <p className="rounded-app bg-surface-muted p-4 text-sm text-content-muted">No published reviews yet.</p>
                )}
              </div>
            </div>
            <ReviewForm existingReview={ownReview} isAuthenticated={Boolean(user)} restaurantId={restaurant.id} />
          </section>

          <aside className="space-y-5">
            <div className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel">
              <h2 className="text-2xl font-bold">Details</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-content-muted">City</dt>
                  <dd className="font-bold">{restaurant.city.name}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-content-muted">Type</dt>
                  <dd className="font-bold">{restaurant.type.replaceAll("_", " ")}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-content-muted">Price</dt>
                  <dd className="font-bold">
                    {formatVnd(restaurant.minPrice)} - {formatVnd(restaurant.maxPrice)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-content-muted">Coordinates</dt>
                  <dd className="font-bold">
                    {restaurant.latitude.toFixed(4)}, {restaurant.longitude.toFixed(4)}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel">
              <h2 className="text-2xl font-bold">Opening hours</h2>
              <div className="mt-4 space-y-2 text-sm">
                {restaurant.openingHours.map((hour) => (
                  <div className="flex items-center justify-between gap-3 rounded-app bg-surface-muted px-3 py-2" key={hour.id}>
                    <span className="font-semibold">{dayNames[hour.dayOfWeek]}</span>
                    <span className="text-content-muted">
                      {hour.isClosed ? "Closed" : `${hour.openTime} - ${hour.closeTime}`}
                      {!hour.isClosed && hour.breakStart ? `, break ${hour.breakStart}-${hour.breakEnd}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] bg-ink p-5 text-white shadow-panel">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Utensils />
                Cultural note
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-200">{restaurant.culturalStory}</p>
              <p className="mt-3 text-sm leading-6 text-clay-100">{restaurant.eatingTips}</p>
            </div>
          </aside>
        </div>
      </PageContainer>
    </AppShell>
  );
}
