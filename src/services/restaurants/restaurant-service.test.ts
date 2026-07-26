import { PriceRange, RestaurantType } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { restaurantListQuerySchema } from "@/services/restaurants/restaurant-schemas";
import {
  filterRestaurantCatalog,
  type RestaurantCard
} from "@/services/restaurants/restaurant-service";

const catalog = [
  {
    id: "pho",
    name: "Pho Old Quarter",
    slug: "pho-old-quarter",
    description: "Traditional beef noodle soup",
    address: "Ha Noi",
    latitude: 21.03,
    longitude: 105.85,
    type: RestaurantType.LOCAL_EATERY,
    priceRange: PriceRange.BUDGET,
    minPrice: 40_000,
    maxPrice: 70_000,
    ratingAverage: 4.8,
    ratingCount: 20,
    isVegetarianFriendly: false,
    isSpicy: false,
    averageMealMinutes: 40,
    city: { id: "ha-noi", name: "Ha Noi", region: "North" },
    images: [],
    tags: [{ name: "breakfast" }, { name: "noodles" }]
  },
  {
    id: "garden",
    name: "Garden Kitchen",
    slug: "garden-kitchen",
    description: "Seasonal plant-based dishes",
    address: "Da Lat",
    latitude: 11.94,
    longitude: 108.44,
    type: RestaurantType.RESTAURANT,
    priceRange: PriceRange.MODERATE,
    minPrice: 80_000,
    maxPrice: 160_000,
    ratingAverage: 4.5,
    ratingCount: 12,
    isVegetarianFriendly: true,
    isSpicy: true,
    averageMealMinutes: 55,
    city: { id: "da-lat", name: "Da Lat", region: "Central" },
    images: [],
    tags: [{ name: "vegetarian" }, { name: "dinner" }]
  }
] satisfies RestaurantCard[];

describe("filterRestaurantCatalog", () => {
  it("matches text in tags without case sensitivity", () => {
    const query = restaurantListQuerySchema.parse({ q: "NOODLES" });

    expect(filterRestaurantCatalog(catalog, query).map((restaurant) => restaurant.id)).toEqual([
      "pho"
    ]);
  });

  it("combines city, enum, boolean, and rating filters", () => {
    const query = restaurantListQuerySchema.parse({
      city: "da lat",
      type: RestaurantType.RESTAURANT,
      priceRange: PriceRange.MODERATE,
      vegetarian: "true",
      spicy: "true",
      minRating: "4.5"
    });

    expect(filterRestaurantCatalog(catalog, query).map((restaurant) => restaurant.id)).toEqual([
      "garden"
    ]);
  });
});
