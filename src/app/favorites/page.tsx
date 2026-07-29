import Link from "next/link";
import { Heart, MapPin, Search, Star, Timer } from "lucide-react";
import { AppImage } from "@/components/common/app-image";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { AppShell, PageContainer } from "@/components/layout/app-shell";
import { Badge, buttonVariants } from "@/components/ui";
import { resolveRestaurantImage } from "@/lib/assets/image-resolver";
import { formatRating, formatVnd } from "@/lib/format";
import { requireUser } from "@/lib/auth/users";
import { cn } from "@/lib/utils";
import { listFavorites } from "@/services/favorites/favorite-service";

export default async function FavoritesPage() {
  const user = await requireUser();
  const favorites = await listFavorites(user.id);
  const cityNames = favorites.map((favorite) => favorite.restaurant.city.name);

  return (
    <AppShell currentCityNames={cityNames}>
      <PageContainer size="6xl">
        <header className="flex flex-col gap-4 rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-strong">Favorites</p>
            <h1 className="mt-2 text-page-title text-content">Saved food places</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-content-muted">
              Your shortlist for quick planning across Vietnamese travel cities.
            </p>
          </div>
          <Link className={buttonVariants({ size: "lg" })} href="/restaurants">
            <Search aria-hidden="true" size={18} />
            Browse restaurants
          </Link>
        </header>

        {favorites.length > 0 ? (
          <>
            <section className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[24px] bg-surface-elevated/[0.65] p-4 shadow-panel">
                <p className="text-sm text-content-muted">Saved places</p>
                <p className="mt-1 text-2xl font-bold text-content">{favorites.length}</p>
              </div>
              <div className="rounded-[24px] bg-surface-elevated/[0.65] p-4 shadow-panel">
                <p className="text-sm text-content-muted">Cities covered</p>
                <p className="mt-1 text-2xl font-bold text-content">{new Set(cityNames).size}</p>
              </div>
              <div className="rounded-[24px] bg-surface-elevated/[0.65] p-4 shadow-panel">
                <p className="text-sm text-content-muted">Average rating</p>
                <p className="mt-1 text-2xl font-bold text-content">
                  {formatRating(
                    favorites.reduce((total, favorite) => total + Number(favorite.restaurant.ratingAverage), 0) /
                      favorites.length
                  )}
                </p>
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2">
              {favorites.map((favorite) => {
                const restaurant = favorite.restaurant;
                const image = resolveRestaurantImage({
                  name: restaurant.name,
                  imageAlt: restaurant.images[0]?.alt,
                  imageUrl: restaurant.images[0]?.url,
                  tags: restaurant.tags.map((tag) => tag.name)
                });

                return (
                  <article
                    className="overflow-hidden rounded-[28px] bg-surface-elevated/[0.65] shadow-panel"
                    key={favorite.restaurantId}
                  >
                    <Link href={`/restaurants/${restaurant.slug}`}>
                      <AppImage
                        alt={image.alt}
                        className="h-48 rounded-b-none"
                        imageClassName="transition duration-300 hover:scale-105"
                        src={image.src}
                      />
                    </Link>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="flex items-center gap-1 text-sm text-content-muted">
                            <MapPin aria-hidden="true" size={15} />
                            {restaurant.city.name}
                          </p>
                          <Link
                            className="mt-1 block text-card-title text-content hover:text-brand-strong"
                            href={`/restaurants/${restaurant.slug}`}
                          >
                            {restaurant.name}
                          </Link>
                        </div>
                        <Heart className="shrink-0 text-danger" fill="currentColor" />
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-content-muted">
                        {restaurant.description}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Badge variant="brand">
                          <Star aria-hidden="true" fill="currentColor" size={14} />
                          {formatRating(restaurant.ratingAverage)}
                        </Badge>
                        <Badge variant="success">
                          {formatVnd(restaurant.minPrice)} - {formatVnd(restaurant.maxPrice)}
                        </Badge>
                        <Badge>
                          <Timer aria-hidden="true" size={13} />
                          {restaurant.averageMealMinutes} min
                        </Badge>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Link
                          className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                          href={`/restaurants/${restaurant.slug}`}
                        >
                          View details
                        </Link>
                        <FavoriteButton initialIsFavorite restaurantId={favorite.restaurantId} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid gap-5 rounded-[28px] bg-surface-elevated/[0.65] p-8 text-center shadow-panel md:grid-cols-[1fr_auto] md:text-left">
            <div>
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger md:mx-0">
                <Heart aria-hidden="true" fill="currentColor" size={24} />
              </div>
              <h2 className="mt-4 text-section-title text-content">No favorites yet</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-content-muted">
                Save restaurants from the detail page, then use this list as a compact planning board.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <Link className={buttonVariants({ size: "lg" })} href="/restaurants">
                Explore restaurants
              </Link>
            </div>
          </div>
        )}
      </PageContainer>
    </AppShell>
  );
}
