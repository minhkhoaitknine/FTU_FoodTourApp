import { describe, expect, it } from "vitest";
import {
  withCityUiMetadata,
  withFoodTourUiMetadata,
  withRestaurantUiMetadata
} from "@/lib/api/ui-metadata";

describe("ui metadata mappers", () => {
  it("adds stable city slug and background image", () => {
    const city = withCityUiMetadata({
      id: "hue",
      name: "Hue",
      region: "Central"
    });

    expect(city.slug).toBe("hue");
    expect(city.backgroundImage.src).toBe("/images/demo/city/Hue%201.jpg");
  });

  it("adds restaurant display image without removing existing fields", () => {
    const restaurant = withRestaurantUiMetadata({
      id: "hoi-an-noodle",
      name: "Hoi An Morning Noodle House",
      images: [{ url: "/missing.jpg", alt: "Hoi An noodle bowl" }],
      tags: [{ name: "noodle" }]
    });

    expect(restaurant.id).toBe("hoi-an-noodle");
    expect(restaurant.displayName).toBe("Hoi An Morning Noodle House");
    expect(restaurant.image.src).toBe("/images/demo/restaurant/Hoi%20An%20Morning%20Noodle%20House.jpg");
  });

  it("adds tour summary and nested UI metadata", () => {
    const tour = withFoodTourUiMetadata({
      id: "tour-1",
      city: { name: "Da Lat" },
      totalCost: 120000,
      totalDistanceKm: 4.5,
      totalTravelMinutes: 45,
      stops: [
        {
          restaurant: {
            name: "Da Lat Heritage Coffee Corner",
            tags: [{ name: "coffee" }]
          }
        }
      ]
    });

    expect(tour.summary).toEqual({
      totalCost: 120000,
      totalDistanceKm: 4.5,
      totalTravelMinutes: 45,
      stopCount: 1
    });
    expect(tour.city).toMatchObject({ slug: "da-lat" });
    expect(tour.stops?.[0].restaurant).toMatchObject({
      image: { kind: "restaurant" }
    });
  });

  it("normalizes stale tour travel totals from saved leg distances", () => {
    const tour = withFoodTourUiMetadata({
      id: "tour-with-stale-time",
      totalDistanceKm: 3.15,
      totalTravelMinutes: 1,
      transportMode: "WALKING",
      stops: [
        {
          distanceFromPreviousKm: 3.15,
          estimatedTravelMinutes: 0
        }
      ]
    });

    expect(tour.totalTravelMinutes).toBe(27);
    expect(tour.summary.totalTravelMinutes).toBe(tour.totalTravelMinutes);
  });
});
