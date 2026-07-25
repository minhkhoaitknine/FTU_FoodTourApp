import Link from "next/link";
import { Heart, MapPin, Star } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { formatRating, formatVnd } from "@/lib/format";
import { requireUser } from "@/lib/auth/users";
import { listFavorites } from "@/services/favorites/favorite-service";

export default async function FavoritesPage() {
  const user = await requireUser();
  const favorites = await listFavorites(user.id);

  return (
    <main className="min-h-screen p-4 text-ink md:p-6">
      <section className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-3 rounded-[28px] bg-white/85 p-5 shadow-panel md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">Favorites</p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">Saved food places</h1>
          </div>
          <Link className="rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" href="/restaurants">
            Browse restaurants
          </Link>
        </header>

        {favorites.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {favorites.map((favorite) => (
              <article className="rounded-[28px] bg-white/90 p-5 shadow-panel" key={favorite.restaurantId}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1 text-sm text-stone-500">
                      <MapPin size={15} />
                      {favorite.restaurant.city.name}
                    </p>
                    <Link
                      className="mt-1 block text-2xl font-bold hover:text-clay-700"
                      href={`/restaurants/${favorite.restaurant.slug}`}
                    >
                      {favorite.restaurant.name}
                    </Link>
                  </div>
                  <Heart className="text-red-600" fill="currentColor" />
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">{favorite.restaurant.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 rounded-full bg-clay-50 px-3 py-1 font-bold text-clay-700">
                    <Star size={14} fill="currentColor" />
                    {formatRating(favorite.restaurant.ratingAverage)}
                  </span>
                  <span className="rounded-full bg-leaf-500/10 px-3 py-1 font-bold text-leaf-700">
                    {formatVnd(favorite.restaurant.minPrice)} - {formatVnd(favorite.restaurant.maxPrice)}
                  </span>
                </div>
                <div className="mt-4">
                  <FavoriteButton initialIsFavorite restaurantId={favorite.restaurantId} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[28px] bg-white/90 p-8 text-center shadow-panel">
            <h2 className="text-2xl font-bold">No favorites yet</h2>
            <p className="mt-2 text-sm text-stone-600">Add restaurants from the detail page.</p>
          </div>
        )}
      </section>
    </main>
  );
}

