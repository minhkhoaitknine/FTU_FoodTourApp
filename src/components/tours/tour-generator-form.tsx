"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  Route,
  Save,
  Sparkles,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { FormEvent, ReactNode, useMemo, useState } from "react";

import { Button, Input, Select, Textarea } from "@/components/ui";
import { Badge } from "@/components/ui/badge";
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

const mealTypeOptions = [
  { label: "Breakfast", value: "BREAKFAST" },
  { label: "Lunch", value: "LUNCH" },
  { label: "Snack", value: "SNACK" },
  { label: "Dinner", value: "DINNER" }
] as const;

const preferencePresets = [
  "local-food",
  "street-food",
  "noodle",
  "coffee",
  "seafood",
  "dessert",
  "heritage",
  "market"
] as const;

export function TourGeneratorForm({ cities }: TourGeneratorFormProps) {
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id ?? "");
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([
    "local-food",
    "noodle",
    "coffee"
  ]);
  const [result, setResult] = useState<SavedTour | null>(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedCity = useMemo(
    () => cities.find((city) => city.id === selectedCityId) ?? cities[0],
    [cities, selectedCityId]
  );
  const defaultStartAt = useMemo(() => defaultDateTimeLocal(), []);

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCity || isSubmitting) return;

    const form = new FormData(event.currentTarget);
    setError("");
    setResult(null);
    setIsSubmitting(true);

    const mealTypes = form
      .getAll("mealTypes")
      .map(String)
      .filter(Boolean);

    const payload = {
      title: stringValue(form, "title", `${selectedCity.name} food tour`),
      cityId: selectedCity.id,
      cityName: selectedCity.name,
      startAddress: stringValue(form, "startAddress", `${selectedCity.name} demo start`),
      startLatitude: selectedCity.latitude,
      startLongitude: selectedCity.longitude,
      startAt: stringValue(form, "startAt", defaultStartAt),
      durationHours: numberValue(form, "durationHours", 10),
      numberOfDays: 1,
      budget: numberValue(form, "budget", 600000),
      numberOfPeople: numberValue(form, "numberOfPeople", 2),
      transportMode: stringValue(form, "transportMode", "MOTORBIKE"),
      preferences: selectedPreferences,
      vegetarian: form.get("vegetarian") === "on",
      allergies: splitCsv(stringValue(form, "allergies", "")),
      desiredStops: numberValue(form, "desiredStops", 4),
      maxDistanceKm: numberValue(form, "maxDistanceKm", 20),
      mealTypes: mealTypes.length > 0 ? mealTypes : mealTypeOptions.map((item) => item.value)
    };

    try {
      const response = await fetch("/api/food-tours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const body = (await response.json()) as FoodTourResponse;

      if (!response.ok || !body.ok || !body.tour) {
        setError(body.error ?? "Could not generate a tour with the current constraints.");
        return;
      }

      setResult(body.tour);
    } catch {
      setError("The tour generator is unavailable. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function togglePreference(value: string) {
    setSelectedPreferences((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[430px_1fr]">
      <form
        aria-busy={isSubmitting}
        className="space-y-4 rounded-[28px] bg-surface-elevated/92 p-5 shadow-panel"
        onSubmit={submitForm}
      >
        <div>
          <p className="text-sm font-semibold uppercase text-brand-strong">Generator</p>
          <h2 className="mt-2 text-section-title text-content">Create a food tour</h2>
        </div>

        <fieldset className="space-y-3">
          <legend className="text-sm font-bold text-content">Route basics</legend>

          <label className="block">
            <span className="text-sm font-semibold text-content-muted">Title</span>
            <Input
              className="mt-2"
              defaultValue={selectedCity ? `${selectedCity.name} food tour` : "Vietnam food tour"}
              name="title"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-content-muted">City</span>
            <Select
              className="mt-2"
              name="cityId"
              onChange={(event) => setSelectedCityId(event.target.value)}
              value={selectedCityId}
            >
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} · {city.region}
                </option>
              ))}
            </Select>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-content-muted">Start address</span>
            <Input
              className="mt-2"
              defaultValue={selectedCity ? `${selectedCity.name} demo start` : "Demo start"}
              key={selectedCity?.id}
              name="startAddress"
              required
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-content-muted">Start time</span>
              <Input
                className="mt-2"
                defaultValue={defaultStartAt}
                name="startAt"
                required
                type="datetime-local"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-content-muted">Transport</span>
              <Select className="mt-2" defaultValue="MOTORBIKE" name="transportMode">
                <option value="WALKING">Walking</option>
                <option value="BICYCLE">Bicycle</option>
                <option value="MOTORBIKE">Motorbike</option>
                <option value="CAR">Car</option>
              </Select>
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-bold text-content">Budget and group</legend>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-semibold text-content-muted">Budget</span>
              <Input
                className="mt-2"
                defaultValue={600000}
                min={20000}
                name="budget"
                required
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-sm font-semibold text-content-muted">People</span>
              <Input
                className="mt-2"
                defaultValue={2}
                max={20}
                min={1}
                name="numberOfPeople"
                required
                type="number"
              />
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-bold text-content">Taste</legend>

          <div className="flex flex-wrap gap-2">
            {preferencePresets.map((preference) => {
              const isSelected = selectedPreferences.includes(preference);
              return (
                <button
                  aria-pressed={isSelected}
                  className={`rounded-full border px-3 py-2 text-xs font-bold transition ${
                    isSelected
                      ? "border-brand bg-brand-soft text-brand-strong"
                      : "border-line bg-surface-elevated text-content-muted hover:border-brand"
                  }`}
                  key={preference}
                  onClick={() => togglePreference(preference)}
                  type="button"
                >
                  {preference}
                </button>
              );
            })}
          </div>

          <label className="flex min-h-11 items-center gap-3 rounded-app border border-line bg-surface-elevated px-3 text-sm font-semibold text-content">
            <input className="size-4 accent-brand" name="vegetarian" type="checkbox" />
            Vegetarian friendly
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-content-muted">Allergies</span>
            <Textarea
              className="mt-2"
              name="allergies"
              placeholder="seafood, peanut"
              rows={2}
            />
          </label>
        </fieldset>

        <details className="rounded-app border border-line bg-surface/70 p-4">
          <summary className="cursor-pointer text-sm font-bold text-content">
            Advanced settings
          </summary>

          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <label className="block">
                <span className="text-sm font-semibold text-content-muted">Stops</span>
                <Input
                  className="mt-2"
                  defaultValue={4}
                  max={8}
                  min={1}
                  name="desiredStops"
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-content-muted">Hours</span>
                <Input
                  className="mt-2"
                  defaultValue={10}
                  max={16}
                  min={2}
                  name="durationHours"
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-content-muted">Max km</span>
                <Input
                  className="mt-2"
                  defaultValue={20}
                  max={80}
                  min={1}
                  name="maxDistanceKm"
                  type="number"
                />
              </label>
            </div>

            <div>
              <p className="text-sm font-semibold text-content-muted">Meal periods</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {mealTypeOptions.map((mealType) => (
                  <label
                    className="flex min-h-10 items-center gap-2 rounded-app border border-line bg-surface-elevated px-3 text-sm font-semibold"
                    key={mealType.value}
                  >
                    <input
                      className="size-4 accent-brand"
                      defaultChecked
                      name="mealTypes"
                      type="checkbox"
                      value={mealType.value}
                    />
                    {mealType.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </details>

        {error ? (
          <div className="flex gap-3 rounded-app border border-danger/20 bg-danger-soft p-3 text-sm text-danger">
            <AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={17} />
            <p>{error}</p>
          </div>
        ) : null}

        <Button fullWidth isLoading={isSubmitting} loadingLabel="Generating..." type="submit">
          <Sparkles aria-hidden="true" size={18} />
          Generate and save
        </Button>
      </form>

      <TourResultPanel isLoading={isSubmitting} result={result} />
    </div>
  );
}

function TourResultPanel({
  isLoading,
  result
}: {
  isLoading: boolean;
  result: SavedTour | null;
}) {
  return (
    <section className="rounded-[28px] bg-surface-elevated/92 p-5 shadow-panel">
      {isLoading ? <GeneratingState /> : result ? <GeneratedResult result={result} /> : <EmptyResult />}
    </section>
  );
}

function GeneratedResult({ result }: { result: SavedTour }) {
  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <Badge variant="success">
            <CheckCircle2 aria-hidden="true" size={13} />
            Saved
          </Badge>
          <h2 className="mt-3 text-page-title text-content">{result.title}</h2>
        </div>
        <Link
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-app bg-success px-4 py-3 text-sm font-bold text-content-inverse"
          href={`/tours/${result.id}`}
        >
          <Save aria-hidden="true" size={16} />
          View tour
        </Link>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <MetricCard
          icon={<Wallet aria-hidden="true" size={18} />}
          label="Total cost"
          value={formatVnd(result.totalCost)}
        />
        <MetricCard
          icon={<Clock aria-hidden="true" size={18} />}
          label="Travel time"
          value={`${result.totalTravelMinutes} min`}
        />
        <MetricCard
          icon={<Route aria-hidden="true" size={18} />}
          label="Distance"
          value={`~ ${result.totalDistanceKm} km`}
        />
      </div>

      <div className="mt-5 space-y-3">
        {result.stops.map((stop) => (
          <article className="rounded-app border border-line bg-surface-elevated p-4" key={stop.id}>
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-bold text-brand-strong">
                  #{stop.stopOrder} {label(stop.mealType)} · {formatStopTime(stop.plannedArrivalAt)}
                </p>
                <Link
                  className="mt-1 block text-card-title text-content transition hover:text-brand-strong"
                  href={`/restaurants/${stop.restaurant.slug}`}
                >
                  {stop.restaurant.name}
                </Link>
                <p className="mt-2 text-sm leading-6 text-content-muted">{stop.reason}</p>
              </div>
              <p className="shrink-0 font-bold text-success">{formatVnd(stop.estimatedCost)}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="grid min-h-[560px] place-items-center rounded-app bg-surface-muted p-8 text-center">
      <div>
        <Loader2 className="mx-auto animate-spin text-brand" size={42} />
        <h2 className="mt-4 text-section-title text-content">Generating route</h2>
        <div className="mx-auto mt-5 grid max-w-md gap-3 text-left">
          {["Filtering restaurants", "Scoring preferences", "Estimating route"].map((item) => (
            <div className="h-12 rounded-app bg-surface-elevated px-4 py-3 text-sm font-semibold text-content-muted" key={item}>
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyResult() {
  return (
    <div className="grid min-h-[560px] place-items-center rounded-app bg-surface-muted p-8 text-center">
      <div>
        <Sparkles className="mx-auto text-brand" size={42} />
        <h2 className="mt-4 text-section-title text-content">Generated tour appears here</h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-content-muted">
          The saved route will show timeline stops, cost and distance after generation.
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-app bg-surface-muted p-4">
      <div className="flex items-center gap-2 text-brand-strong">
        {icon}
        <p className="text-sm font-semibold">{label}</p>
      </div>
      <p className="mt-2 text-xl font-bold text-content">{value}</p>
    </article>
  );
}

function stringValue(form: FormData, key: string, fallback: string) {
  const value = String(form.get(key) ?? "").trim();
  return value || fallback;
}

function numberValue(form: FormData, key: string, fallback: number) {
  const value = Number(form.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function defaultDateTimeLocal() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setHours(7, 30, 0, 0);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes()
  ).padStart(2, "0")}`;
}

function formatStopTime(value: string) {
  return new Date(value).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
