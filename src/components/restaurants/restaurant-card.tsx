import { ArrowUpRight, Clock, MapPin, Star, Utensils } from "lucide-react";
import Link from "next/link";
import { AppImage } from "@/components/common/app-image";
import { Badge } from "@/components/ui";
import { resolveRestaurantImage } from "@/lib/assets/image-resolver";
import { formatRating, formatVnd } from "@/lib/format";
import type { RestaurantUiMetadata } from "@/lib/api/ui-metadata";
import type { RestaurantCard as RestaurantCardType } from "@/services/restaurants/restaurant-service";

type RestaurantCardProps = {
  restaurant: RestaurantCardType & Partial<RestaurantUiMetadata>;
};

export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  const image = restaurant.images[0];
  const resolvedImage =
    restaurant.image ??
    resolveRestaurantImage({
      name: restaurant.name,
      imageAlt: image?.alt,
      imageUrl: image?.url,
      tags: restaurant.tags.map((tag) => tag.name)
    });

  return (
    <article className="group grid gap-4 rounded-[28px] border border-line bg-surface-elevated/[0.65] p-4 shadow-panel transition duration-fast ease-app hover:shadow-lift motion-safe:hover:-translate-y-0.5 md:grid-cols-[172px_1fr]">
      <Link className="block" href={`/restaurants/${restaurant.slug}`}>
        <AppImage
          alt={resolvedImage.alt}
          className="aspect-[4/3] rounded-app"
          sizes="(max-width: 768px) 100vw, 172px"
          src={resolvedImage.src}
        />
      </Link>

      <div className="min-w-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link
              className="inline-flex items-start gap-1 text-card-title text-content transition group-hover:text-brand-strong"
              href={`/restaurants/${restaurant.slug}`}
            >
              {restaurant.name}
              <ArrowUpRight aria-hidden="true" className="mt-1 shrink-0 opacity-0 transition group-hover:opacity-100" size={16} />
            </Link>
            <p className="mt-1 flex items-center gap-1 text-sm text-content-muted">
              <MapPin aria-hidden="true" size={15} />
              {restaurant.city.name}
            </p>
          </div>
          <Badge variant="brand">
            <Star aria-hidden="true" size={15} fill="currentColor" />
            {formatRating(restaurant.ratingAverage)}
          </Badge>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-content-muted">{restaurant.description}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>
            {restaurant.type.replaceAll("_", " ")}
          </Badge>
          <Badge variant="success">
            {formatVnd(restaurant.minPrice)} - {formatVnd(restaurant.maxPrice)}
          </Badge>
          <Badge>
            <Clock aria-hidden="true" size={13} />
            {restaurant.averageMealMinutes} min
          </Badge>
          {restaurant.isVegetarianFriendly ? (
            <Badge variant="success">
              Vegetarian
            </Badge>
          ) : null}
          {restaurant.isSpicy ? (
            <Badge variant="danger">
              Spicy
            </Badge>
          ) : null}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {restaurant.tags.slice(0, 5).map((tag) => (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-content-subtle" key={tag.name}>
              <Utensils aria-hidden="true" size={12} />
              {tag.name}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
