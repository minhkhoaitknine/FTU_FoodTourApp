import {
  resolveCityImage,
  resolveRestaurantImage,
  type ResolvedImageAsset
} from "@/lib/assets/image-resolver";
import { toSlug } from "@/lib/slug";

type CityLike = {
  name: string;
};

type RestaurantLike = {
  name: string;
  images?: ReadonlyArray<{
    url: string;
    alt: string;
  }>;
  tags?: ReadonlyArray<{
    name: string;
  }>;
};

type FoodTourLike = {
  city?: CityLike | null;
  totalCost?: number;
  totalDistanceKm?: number;
  totalTravelMinutes?: number;
  stops?: ReadonlyArray<{
    restaurant?: RestaurantLike | null;
  }>;
};

export type CityUiMetadata = {
  slug: string;
  displayName: string;
  backgroundImage: ResolvedImageAsset;
};

export type RestaurantUiMetadata = {
  displayName: string;
  image: ResolvedImageAsset;
};

export type FoodTourUiMetadata = {
  summary: {
    totalCost: number;
    totalDistanceKm: number;
    totalTravelMinutes: number;
    stopCount: number;
  };
};

export function withCityUiMetadata<T extends CityLike>(city: T): T & CityUiMetadata {
  return {
    ...city,
    slug: toSlug(city.name),
    displayName: city.name,
    backgroundImage: resolveCityImage(city.name)
  };
}

export function withRestaurantUiMetadata<T extends RestaurantLike>(
  restaurant: T
): T & RestaurantUiMetadata {
  const image = restaurant.images?.[0];

  return {
    ...restaurant,
    displayName: restaurant.name,
    image: resolveRestaurantImage({
      name: restaurant.name,
      imageAlt: image?.alt,
      imageUrl: image?.url,
      tags: restaurant.tags?.map((tag) => tag.name) ?? []
    })
  };
}

export function withFoodTourUiMetadata<T extends FoodTourLike>(
  tour: T
): T & FoodTourUiMetadata {
  return {
    ...tour,
    city: tour.city ? withCityUiMetadata(tour.city) : tour.city,
    stops: tour.stops?.map((stop) => ({
      ...stop,
      restaurant: stop.restaurant ? withRestaurantUiMetadata(stop.restaurant) : stop.restaurant
    })),
    summary: {
      totalCost: tour.totalCost ?? 0,
      totalDistanceKm: tour.totalDistanceKm ?? 0,
      totalTravelMinutes: tour.totalTravelMinutes ?? 0,
      stopCount: tour.stops?.length ?? 0
    }
  };
}
