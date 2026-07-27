import { describe, expect, it } from "vitest";
import {
  resolveCityImage,
  resolveFoodImage,
  resolveRestaurantImage
} from "@/lib/assets/image-resolver";

describe("image resolver", () => {
  it("resolves restaurant assets by restaurant name", () => {
    const image = resolveRestaurantImage({
      name: "Da Nang Riverside Seafood Stall",
      imageUrl: "/images/demo/restaurants/da-nang-riverside-seafood-stall.jpg"
    });

    expect(image.source).toBe("exact");
    expect(image.src).toBe("/images/demo/restaurant/Da%20Nang%20Riverside%20Seafood%20Stall.jfif");
  });

  it("ignores legacy seed restaurant urls when an exact asset is unavailable", () => {
    const image = resolveRestaurantImage({
      name: "Unknown Coffee Corner",
      imageUrl: "/images/demo/restaurants/unknown-coffee-corner.jpg",
      tags: ["coffee"]
    });

    expect(image.source).toBe("fallback");
    expect(image.src).toBe("/images/demo/food/Egg%20Coffee.jfif");
  });

  it("resolves city image variants", () => {
    const image = resolveCityImage("Hue");

    expect(image.source).toBe("exact");
    expect(image.src).toBe("/images/demo/city/Hue%201.jpg");
  });

  it("falls back to food categories from tags", () => {
    const image = resolveFoodImage({ tags: ["vegetarian", "family-friendly"] });

    expect(image.source).toBe("fallback");
    expect(image.src).toBe("/images/demo/food/Tofu%20Clay%20Pot.jfif");
  });
});
