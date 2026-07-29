"use client";

import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button, Input, Select, Textarea } from "@/components/ui";
import { formatVnd } from "@/lib/format";

type MealType = "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER" | "COFFEE" | "NIGHT";

type TourStopDraft = {
  clientId: string;
  restaurantId: string;
  mealType: MealType;
  plannedArrivalAt: string;
  estimatedMealMinutes: number;
  estimatedCost: number;
  reason: string;
};

type RestaurantOption = {
  id: string;
  name: string;
  minPrice: number;
  maxPrice: number;
  averageMealMinutes: number;
};

type TourPlanEditorProps = {
  tourId: string;
  title: string;
  numberOfPeople: number;
  initialStops: Array<{
    id: string;
    restaurantId: string;
    mealType: MealType;
    plannedArrivalAt: string;
    estimatedMealMinutes: number;
    estimatedCost: number;
    reason: string;
  }>;
  restaurantOptions: RestaurantOption[];
};

const mealTypes: MealType[] = ["BREAKFAST", "LUNCH", "SNACK", "DINNER", "COFFEE", "NIGHT"];

export function TourPlanEditor({
  tourId,
  title,
  numberOfPeople,
  initialStops,
  restaurantOptions
}: TourPlanEditorProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);
  const [stops, setStops] = useState<TourStopDraft[]>(
    initialStops.map((stop) => ({
      ...stop,
      clientId: stop.id,
      plannedArrivalAt: toDateTimeLocal(stop.plannedArrivalAt)
    }))
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const restaurantById = useMemo(
    () => new Map(restaurantOptions.map((restaurant) => [restaurant.id, restaurant])),
    [restaurantOptions]
  );
  const selectedRestaurantIds = new Set(stops.map((stop) => stop.restaurantId));
  const addableRestaurants = restaurantOptions.filter(
    (restaurant) => !selectedRestaurantIds.has(restaurant.id)
  );

  function updateStop(index: number, patch: Partial<TourStopDraft>) {
    setStops((current) =>
      current.map((stop, stopIndex) => (stopIndex === index ? { ...stop, ...patch } : stop))
    );
  }

  function changeRestaurant(index: number, restaurantId: string) {
    const restaurant = restaurantById.get(restaurantId);
    updateStop(index, {
      restaurantId,
      estimatedMealMinutes: restaurant?.averageMealMinutes ?? stops[index].estimatedMealMinutes,
      estimatedCost: restaurant
        ? Math.round(((restaurant.minPrice + restaurant.maxPrice) / 2) * numberOfPeople)
        : stops[index].estimatedCost
    });
  }

  function moveStop(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= stops.length) return;
    setStops((current) => {
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      return next;
    });
  }

  function removeStop(index: number) {
    if (stops.length <= 1) {
      setError("A tour needs at least one stop.");
      return;
    }
    setError("");
    setStops((current) => current.filter((_, stopIndex) => stopIndex !== index));
  }

  function addStop() {
    const restaurant = addableRestaurants[0];
    if (!restaurant) {
      setError("No more restaurants are available in this tour city.");
      return;
    }

    const previousTime = stops.at(-1)?.plannedArrivalAt;
    setStops((current) => [
      ...current,
      {
        clientId: `new-${Date.now()}`,
        restaurantId: restaurant.id,
        mealType: "SNACK",
        plannedArrivalAt: nextDateTimeLocal(previousTime),
        estimatedMealMinutes: restaurant.averageMealMinutes,
        estimatedCost: Math.round(((restaurant.minPrice + restaurant.maxPrice) / 2) * numberOfPeople),
        reason: "Manually added by the traveler."
      }
    ]);
    setError("");
  }

  async function savePlan() {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/food-tours/${tourId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draftTitle,
          stops: stops.map((stop) => ({
            restaurantId: stop.restaurantId,
            mealType: stop.mealType,
            plannedArrivalAt: new Date(stop.plannedArrivalAt).toISOString(),
            estimatedMealMinutes: Number(stop.estimatedMealMinutes),
            estimatedCost: Number(stop.estimatedCost),
            reason: stop.reason
          }))
        })
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!response.ok || !body?.ok) {
        setError(body?.error ?? "Could not save the edited tour.");
        return;
      }

      setIsOpen(false);
      router.refresh();
    } catch {
      setError("Network error while saving the edited tour.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="rounded-[28px] bg-surface-elevated/[0.65] p-5 shadow-panel md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-strong">Manual planning</p>
          <h2 className="mt-1 text-section-title text-content">Edit this tour</h2>
          <p className="mt-1 text-sm leading-6 text-content-muted">
            Adjust stops, order and times after the recommendation has been generated.
          </p>
        </div>
        <Button onClick={() => setIsOpen((value) => !value)} variant={isOpen ? "outline" : "primary"}>
          {isOpen ? "Close editor" : "Edit plan"}
        </Button>
      </div>

      {isOpen ? (
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-bold text-content">Tour title</span>
            <Input className="mt-2" onChange={(event) => setDraftTitle(event.target.value)} value={draftTitle} />
          </label>

          <div className="space-y-3">
            {stops.map((stop, index) => {
              const restaurant = restaurantById.get(stop.restaurantId);

              return (
                <article className="rounded-app border border-line bg-surface-elevated p-4" key={stop.clientId}>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-3 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-12 place-items-center rounded-app bg-brand-soft text-brand-strong">
                          <span className="text-lg font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase text-content-subtle">Stop</p>
                          <p className="font-bold text-content">{restaurant?.name ?? "Restaurant"}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          aria-label="Move stop up"
                          className="inline-flex min-h-10 items-center gap-2 rounded-app border border-line bg-surface-muted px-3 text-sm font-semibold text-content-muted disabled:opacity-40"
                          disabled={index === 0}
                          onClick={() => moveStop(index, -1)}
                          type="button"
                        >
                          <ArrowUp aria-hidden="true" size={15} />
                          Up
                        </button>
                        <button
                          aria-label="Move stop down"
                          className="inline-flex min-h-10 items-center gap-2 rounded-app border border-line bg-surface-muted px-3 text-sm font-semibold text-content-muted disabled:opacity-40"
                          disabled={index === stops.length - 1}
                          onClick={() => moveStop(index, 1)}
                          type="button"
                        >
                          <ArrowDown aria-hidden="true" size={15} />
                          Down
                        </button>
                        <Button onClick={() => removeStop(index)} variant="danger">
                          <Trash2 aria-hidden="true" size={16} />
                          Remove
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
                      <div className="grid gap-4">
                      <label>
                        <span className="text-sm font-bold text-content">Restaurant</span>
                        <Select
                          className="mt-2"
                          onChange={(event) => changeRestaurant(index, event.target.value)}
                          value={stop.restaurantId}
                        >
                          {restaurant ? (
                            <option value={restaurant.id}>
                              {restaurant.name} ({formatVnd(restaurant.minPrice)} - {formatVnd(restaurant.maxPrice)})
                            </option>
                          ) : null}
                          {addableRestaurants.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name} ({formatVnd(option.minPrice)} - {formatVnd(option.maxPrice)})
                            </option>
                          ))}
                        </Select>
                      </label>
                      <label>
                        <span className="text-sm font-bold text-content">Reason / note</span>
                        <Textarea
                          className="mt-2 min-h-28"
                          onChange={(event) => updateStop(index, { reason: event.target.value })}
                          value={stop.reason}
                        />
                      </label>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                      <label>
                        <span className="text-sm font-bold text-content">Meal</span>
                        <Select
                          className="mt-2"
                          onChange={(event) => updateStop(index, { mealType: event.target.value as MealType })}
                          value={stop.mealType}
                        >
                          {mealTypes.map((mealType) => (
                            <option key={mealType} value={mealType}>
                              {label(mealType)}
                            </option>
                          ))}
                        </Select>
                      </label>
                      <label>
                        <span className="text-sm font-bold text-content">Arrival</span>
                        <Input
                          className="mt-2"
                          onChange={(event) => updateStop(index, { plannedArrivalAt: event.target.value })}
                          type="datetime-local"
                          value={stop.plannedArrivalAt}
                        />
                      </label>
                      <label>
                        <span className="text-sm font-bold text-content">Meal minutes</span>
                        <Input
                          className="mt-2"
                          min={5}
                          onChange={(event) =>
                            updateStop(index, { estimatedMealMinutes: Number(event.target.value) })
                          }
                          type="number"
                          value={stop.estimatedMealMinutes}
                        />
                      </label>
                      <label>
                        <span className="text-sm font-bold text-content">Cost</span>
                        <Input
                          className="mt-2"
                          min={0}
                          onChange={(event) => updateStop(index, { estimatedCost: Number(event.target.value) })}
                          type="number"
                          value={stop.estimatedCost}
                        />
                      </label>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {error ? <p className="rounded-app bg-danger-soft p-3 text-sm text-danger">{error}</p> : null}

          <div className="flex flex-wrap gap-2">
            <Button disabled={addableRestaurants.length === 0} onClick={addStop} variant="outline">
              <Plus aria-hidden="true" size={16} />
              Add stop
            </Button>
            <Button isLoading={isSaving} loadingLabel="Saving plan" onClick={savePlan}>
              <Save aria-hidden="true" size={16} />
              Save edited plan
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function nextDateTimeLocal(value?: string) {
  const base = value ? new Date(value) : new Date();
  base.setHours(base.getHours() + 2);
  return toDateTimeLocal(base.toISOString());
}

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
