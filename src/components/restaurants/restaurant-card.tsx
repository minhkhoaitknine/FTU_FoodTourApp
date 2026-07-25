import { Clock, MapPin, Star, Utensils } from "lucide-react";
import Link from "next/link";
import { formatRating, formatVnd } from "@/lib/format";
import type { RestaurantCard as RestaurantCardType } from "@/services/restaurants/restaurant-service";

type RestaurantCardProps = {
  restaurant: RestaurantCardType;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const image = restaurant.images[0];

  return (
    <article className="grid gap-4 rounded-[24px] border border-clay-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-panel md:grid-cols-[150px_1fr]">
      <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-clay-50 text-center text-sm font-semibold text-clay-700">
        {image ? image.alt : "Demo food image"}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link className="text-lg font-bold hover:text-clay-700" href={`/restaurants/${restaurant.slug}`}>
              {restaurant.name}
            </Link>
            <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
              <MapPin size={15} />
              {restaurant.city.name}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-clay-50 px-3 py-1 text-sm font-bold text-clay-700">
            <Star size={15} fill="currentColor" />
            {formatRating(restaurant.ratingAverage)}
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-stone-600">{restaurant.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
            {restaurant.type.replaceAll("_", " ")}
          </span>
          <span className="rounded-full bg-leaf-500/10 px-3 py-1 text-xs font-semibold text-leaf-700">
            {formatVnd(restaurant.minPrice)} - {formatVnd(restaurant.maxPrice)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
            <Clock size={13} />
            {restaurant.averageMealMinutes} min
          </span>
          {restaurant.isVegetarianFriendly ? (
            <span className="rounded-full bg-leaf-500/10 px-3 py-1 text-xs font-semibold text-leaf-700">
              Vegetarian
            </span>
          ) : null}
          {restaurant.isSpicy ? (
            <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
              Spicy
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {restaurant.tags.slice(0, 5).map((tag) => (
            <span className="inline-flex items-center gap-1 text-xs text-stone-500" key={tag.name}>
              <Utensils size={12} />
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

