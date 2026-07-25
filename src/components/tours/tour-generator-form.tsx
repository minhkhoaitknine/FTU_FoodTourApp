"use client";

import { Loader2, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { formatVnd } from "@/lib/format";

type CityOption = {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
};

type SavedStop = {
  id: string;
  stopOrder: number;
  mealType: string;
  plannedArrivalAt: string;
  estimatedCost: number;
  estimatedMealMinutes: number;
  estimatedTravelMinutes: number;
  distanceFromPreviousKm: number;
  reason: string;
  restaurant: {
    name: string;
    slug: string;
  };
};

type SavedTour = {
  id: string;
  title: string;
  totalCost: number;
  totalDistanceKm: number;
  totalTravelMinutes: number;
  stops: SavedStop[];
};

type FoodTourResponse = {
  ok: boolean;
  error?: string;
  tour?: SavedTour;
};

type TourGeneratorFormProps = {
  cities: CityOption[];
};

const mealTypes = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];

export function TourGeneratorForm({ cities }: TourGeneratorFormProps) {
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id ?? "");
  const [result, setResult] = useState<SavedTour | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === selectedCityId) ?? cities[0],
    [cities, selectedCityId]
  );

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCity) return;

    const form = new FormData(event.currentTarget);
    setError("");
    setResult(null);
    setIsSubmitting(true);

    const payload = {
      title: String(form.get("title") ?? "My Food Tour"),
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      startAddress: String(form.get("startAddress") ?? `${selectedCity.name} demo start`),
      startLatitude: selectedCity.latitude,
      startLongitude: selectedCity.longitude,
      startAt: String(form.get("startAt") ?? ""),
      durationHours: Number(form.get("durationHours") ?? 10),
      numberOfDays: 1,
      budget: Number(form.get("budget") ?? 600000),
      numberOfPeople: Number(form.get("numberOfPeople") ?? 2),
      transportMode: String(form.get("transportMode") ?? "MOTORBIKE"),
      preferences: String(form.get("preferences") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      vegetarian: form.get("vegetarian") === "true",
      allergies: String(form.get("allergies") ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      desiredStops: Number(form.get("desiredStops") ?? 4),
      maxDistanceKm: Number(form.get("maxDistanceKm") ?? 20),
      mealTypes
    };

    const response = await fetch("/api/food-tours", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const body = (await response.json()) as FoodTourResponse;
    setIsSubmitting(false);

    if (!response.ok || !body.ok || !body.tour) {
      setError(body.error ?? "Could not generate a tour with the current constraints.");
      return;
    }

    setResult(body.tour);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
      <form className="space-y-4 rounded-[28px] bg-white/90 p-5 shadow-panel" onSubmit={submitForm}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">Generator form</p>
          <h1 className="mt-2 text-3xl font-bold">Create a food tour</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            The server generates and saves the itinerary. Totals are not trusted from the client.
          </p>
        </div>

        <label className="block">
          <span className="text-sm font-bold text-stone-700">Title</span>
          <input
            className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
            defaultValue="Vietnam food tour"
            name="title"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-stone-700">City</span>
          <select
            className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
            name="cityId"
            onChange={(event) => setSelectedCityId(event.target.value)}
            value={selectedCityId}
          >
            {cities.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-stone-700">Start address</span>
          <input
            className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
            defaultValue={selectedCity ? `${selectedCity.name} demo start` : "Demo start"}
            key={selectedCity?.id}
            name="startAddress"
            required
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold text-stone-700">Start time</span>
            <input
              className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
              defaultValue="2026-07-27T07:30"
              name="startAt"
              required
              type="datetime-local"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-stone-700">Duration</span>
            <input
              className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
              defaultValue={10}
              max={16}
              min={2}
              name="durationHours"
              type="number"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold text-stone-700">Budget</span>
            <input
              className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
              defaultValue={600000}
              min={20000}
              name="budget"
              type="number"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-stone-700">People</span>
            <input
              className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
              defaultValue={2}
              max={20}
              min={1}
              name="numberOfPeople"
              type="number"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-bold text-stone-700">Stops</span>
            <input
              className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
              defaultValue={4}
              max={8}
              min={1}
              name="desiredStops"
              type="number"
            />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-stone-700">Max km</span>
            <input
              className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
              defaultValue={20}
              max={80}
              min={1}
              name="maxDistanceKm"
              type="number"
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-bold text-stone-700">Transport</span>
          <select
            className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
            defaultValue="MOTORBIKE"
            name="transportMode"
          >
            <option value="WALKING">Walking</option>
            <option value="BICYCLE">Bicycle</option>
            <option value="MOTORBIKE">Motorbike</option>
            <option value="CAR">Car</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-stone-700">Preferences</span>
          <input
            className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
            defaultValue="local-food,noodle,coffee"
            name="preferences"
            placeholder="local-food,noodle,coffee"
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-stone-700">Allergies</span>
          <input
            className="mt-2 w-full rounded-2xl border border-clay-100 px-4 py-3 text-sm outline-none"
            name="allergies"
            placeholder="seafood,peanut"
          />
        </label>

        <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
          <input name="vegetarian" type="checkbox" value="true" />
          Vegetarian only
        </label>

        {error ? <p className="rounded-2xl bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 font-bold text-white disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
          Generate and save
        </button>
      </form>

      <section className="rounded-[28px] bg-white/90 p-5 shadow-panel">
        {result ? (
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">Generated itinerary</p>
                <h2 className="mt-2 text-3xl font-bold">{result.title}</h2>
              </div>
              <Link
                className="inline-flex items-center gap-2 rounded-2xl bg-leaf-500 px-4 py-3 text-sm font-bold text-white"
                href={`/tours/${result.id}`}
              >
                <Save size={16} />
                View saved tour
              </Link>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl bg-clay-50 p-4">
                <p className="text-sm text-stone-500">Total cost</p>
                <p className="mt-1 text-2xl font-bold">{formatVnd(result.totalCost)}</p>
              </div>
              <div className="rounded-2xl bg-clay-50 p-4">
                <p className="text-sm text-stone-500">Travel time</p>
                <p className="mt-1 text-2xl font-bold">{result.totalTravelMinutes} min</p>
              </div>
              <div className="rounded-2xl bg-clay-50 p-4">
                <p className="text-sm text-stone-500">Distance</p>
                <p className="mt-1 text-2xl font-bold">~ {result.totalDistanceKm} km</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {result.stops.map((stop) => (
                <article className="rounded-2xl border border-clay-100 bg-white p-4" key={stop.id}>
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-bold text-clay-700">
                        #{stop.stopOrder} {stop.mealType}
                      </p>
                      <Link className="mt-1 block text-xl font-bold" href={`/restaurants/${stop.restaurant.slug}`}>
                        {stop.restaurant.name}
                      </Link>
                      <p className="mt-2 text-sm leading-6 text-stone-600">{stop.reason}</p>
                    </div>
                    <p className="font-bold text-leaf-700">{formatVnd(stop.estimatedCost)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid min-h-[520px] place-items-center rounded-3xl bg-clay-50 p-8 text-center">
            <div>
              <Sparkles className="mx-auto text-clay-700" size={40} />
              <h2 className="mt-4 text-2xl font-bold">Your generated tour appears here</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-stone-600">
                Submit the form to create a saved food tour from the rule-based recommendation engine.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

