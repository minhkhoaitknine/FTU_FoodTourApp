import { PriceRange, RestaurantType } from "@prisma/client";
import { Search } from "lucide-react";
import Link from "next/link";

import { Button, Input, Select } from "@/components/ui";

type RestaurantFiltersProps = {
  cities: Array<{
    id: string;
    name: string;
    region: string;
  }>;
  defaults: {
    q?: string;
    city?: string;
    type?: string;
    priceRange?: string;
    vegetarian?: string;
    spicy?: string;
    minRating?: string;
  };
};

export function RestaurantFilters({ cities, defaults }: RestaurantFiltersProps) {
  return (
    <form className="rounded-[28px] bg-surface-elevated/92 p-4 shadow-panel">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
      <label className="md:col-span-2 xl:col-span-2">
        <span className="text-xs font-bold uppercase text-content-subtle">Search</span>
        <div className="mt-2 flex items-center gap-2 rounded-app border border-line bg-surface-elevated px-3">
          <Search size={17} className="text-content-subtle" />
          <Input
            className="min-w-0 flex-1 border-0 bg-transparent px-0 py-3 text-sm shadow-none focus:border-transparent focus:ring-0"
            defaultValue={defaults.q}
            name="q"
            placeholder="Pho, seafood, coffee..."
          />
        </div>
      </label>

      <label>
        <span className="text-xs font-bold uppercase text-content-subtle">City</span>
        <Select
          className="mt-2"
          defaultValue={defaults.city}
          name="city"
        >
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </Select>
      </label>

      <label>
        <span className="text-xs font-bold uppercase text-content-subtle">Type</span>
        <Select
          className="mt-2"
          defaultValue={defaults.type}
          name="type"
        >
          <option value="">All types</option>
          {Object.values(RestaurantType).map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </Select>
      </label>

      <label>
        <span className="text-xs font-bold uppercase text-content-subtle">Price</span>
        <Select
          className="mt-2"
          defaultValue={defaults.priceRange}
          name="priceRange"
        >
          <option value="">All prices</option>
          {Object.values(PriceRange).map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </Select>
      </label>

      <label>
        <span className="text-xs font-bold uppercase text-content-subtle">Rating</span>
        <Select
          className="mt-2"
          defaultValue={defaults.minRating}
          name="minRating"
        >
          <option value="">Any</option>
          <option value="4">4.0+</option>
          <option value="4.5">4.5+</option>
        </Select>
      </label>

      <div className="flex items-end">
        <Button fullWidth type="submit">
          Apply
        </Button>
      </div>
      </div>

      <div className="mt-3 flex justify-end">
        <Link className="text-sm font-bold text-brand-strong" href="/restaurants">
          Clear filters
        </Link>
      </div>
    </form>
  );
}
