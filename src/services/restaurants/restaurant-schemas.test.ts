import { describe, expect, it } from "vitest";
import { restaurantListQuerySchema } from "@/services/restaurants/restaurant-schemas";

describe("restaurantListQuerySchema", () => {
  it("treats empty filter query values as omitted filters", () => {
    const query = restaurantListQuerySchema.parse({
      q: "pho",
      city: "Da Lat",
      type: "",
      priceRange: "",
      minRating: "",
      page: "",
      limit: ""
    });

    expect(query).toMatchObject({
      q: "pho",
      city: "Da Lat",
      type: undefined,
      priceRange: undefined,
      minRating: undefined,
      page: 1,
      limit: 12
    });
  });
});
