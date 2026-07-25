import { PriceRange, RestaurantType } from "@prisma/client";
import { Search } from "lucide-react";

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
    <form className="grid gap-3 rounded-[24px] bg-white/90 p-4 shadow-panel md:grid-cols-2 xl:grid-cols-7">
      <label className="md:col-span-2 xl:col-span-2">
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Search</span>
        <div className="mt-2 flex items-center gap-2 rounded-2xl border border-clay-100 bg-white px-3">
          <Search size={17} className="text-stone-400" />
          <input
            className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
            defaultValue={defaults.q}
            name="q"
            placeholder="Pho, seafood, coffee..."
          />
        </div>
      </label>

      <label>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">City</span>
        <select
          className="mt-2 w-full rounded-2xl border border-clay-100 bg-white px-3 py-3 text-sm outline-none"
          defaultValue={defaults.city}
          name="city"
        >
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city.id} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Type</span>
        <select
          className="mt-2 w-full rounded-2xl border border-clay-100 bg-white px-3 py-3 text-sm outline-none"
          defaultValue={defaults.type}
          name="type"
        >
          <option value="">All types</option>
          {Object.values(RestaurantType).map((type) => (
            <option key={type} value={type}>
              {type.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Price</span>
        <select
          className="mt-2 w-full rounded-2xl border border-clay-100 bg-white px-3 py-3 text-sm outline-none"
          defaultValue={defaults.priceRange}
          name="priceRange"
        >
          <option value="">All prices</option>
          {Object.values(PriceRange).map((range) => (
            <option key={range} value={range}>
              {range}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Rating</span>
        <select
          className="mt-2 w-full rounded-2xl border border-clay-100 bg-white px-3 py-3 text-sm outline-none"
          defaultValue={defaults.minRating}
          name="minRating"
        >
          <option value="">Any</option>
          <option value="4">4.0+</option>
          <option value="4.5">4.5+</option>
        </select>
      </label>

      <div className="flex items-end">
        <button className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" type="submit">
          Apply
        </button>
      </div>

      <div className="flex flex-wrap gap-4 md:col-span-2 xl:col-span-7">
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <input defaultChecked={defaults.vegetarian === "true"} name="vegetarian" type="checkbox" value="true" />
          Vegetarian friendly
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <input defaultChecked={defaults.spicy === "true"} name="spicy" type="checkbox" value="true" />
          Spicy food
        </label>
      </div>
    </form>
  );
}

