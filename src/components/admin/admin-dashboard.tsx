"use client";

import {
  Ban,
  CheckCircle2,
  Flag,
  Lock,
  Plus,
  RefreshCw,
  Shield,
  Store,
  Unlock,
  Users
} from "lucide-react";
import { FormEvent, useMemo, useState, useTransition } from "react";
import { formatRating, formatVnd } from "@/lib/format";

type CityOption = {
  id: string;
  name: string;
  region: string;
  latitude: number;
  longitude: number;
};

type AdminPayload = {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  dashboard: {
    stats: {
      users: number;
      lockedUsers: number;
      restaurants: number;
      inactiveRestaurants: number;
      reviews: number;
      hiddenReviews: number;
      flaggedReviews: number;
      tours: number;
    };
    recentReviews: Array<{
      id: string;
      rating: number;
      status: string;
      comment: string;
      createdAt: string;
      user: { fullName: string; email: string };
      restaurant: { name: string; city: { name: string } };
    }>;
    recentTours: Array<{
      id: string;
      title: string;
      totalCost: number;
      createdAt: string;
      user: { fullName: string; email: string };
      city: { name: string };
    }>;
  };
  restaurants: {
    items: AdminRestaurant[];
    pagination: { total: number };
  };
  users: {
    items: AdminUser[];
    pagination: { total: number };
  };
  reviews: {
    items: AdminReview[];
    pagination: { total: number };
  };
  cities: CityOption[];
  enums: {
    roles: string[];
    reviewStatuses: string[];
    restaurantTypes: string[];
    priceRanges: string[];
  };
};

type AdminRestaurant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  priceRange: string;
  minPrice: number;
  maxPrice: number;
  ratingAverage: number;
  ratingCount: number;
  averageMealMinutes: number;
  isVegetarianFriendly: boolean;
  isSpicy: boolean;
  isActive: boolean;
  city: { id: string; name: string; region: string };
  _count: { reviews: number; favorites: number; tourStops: number };
};

type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isLocked: boolean;
  _count: { reviews: number; favorites: number; foodTours: number };
};

type AdminReview = {
  id: string;
  rating: number;
  comment: string;
  status: string;
  moderationReason: string | null;
  user: { id: string; fullName: string; email: string };
  restaurant: { id: string; name: string; slug: string; city: { name: string } };
};

const tabs = ["Overview", "Restaurants", "Users", "Reviews"] as const;

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

async function patchJson<T>(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "Request failed.");
  return payload as T;
}

export function AdminDashboard({ initialData }: { initialData: AdminPayload }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");
  const [restaurants, setRestaurants] = useState(initialData.restaurants.items);
  const [users, setUsers] = useState(initialData.users.items);
  const [reviews, setReviews] = useState(initialData.reviews.items);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [message, setMessage] = useState("Ready.");
  const [isPending, startTransition] = useTransition();

  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant.id === editingRestaurantId) ?? restaurants[0],
    [editingRestaurantId, restaurants]
  );

  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unexpected admin error.");
      }
    });
  }

  function updateRestaurant(id: string, body: Partial<AdminRestaurant>) {
    runAction(async () => {
      const payload = await patchJson<{ restaurant: AdminRestaurant }>(`/api/admin/restaurants/${id}`, body);
      setRestaurants((current) =>
        current.map((restaurant) => (restaurant.id === id ? payload.restaurant : restaurant))
      );
      setMessage("Restaurant updated.");
    });
  }

  function updateUser(id: string, body: Partial<AdminUser>) {
    runAction(async () => {
      const payload = await patchJson<{ user: AdminUser }>(`/api/admin/users/${id}`, body);
      setUsers((current) => current.map((user) => (user.id === id ? payload.user : user)));
      setMessage("User updated.");
    });
  }

  function moderateReview(id: string, status: string) {
    runAction(async () => {
      const payload = await patchJson<{ review: AdminReview }>(`/api/admin/reviews/${id}`, {
        status,
        reason: `Admin set review status to ${status}.`
      });
      setReviews((current) => current.map((review) => (review.id === id ? payload.review : review)));
      setMessage("Review moderation saved.");
    });
  }

  function createRestaurant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const city = initialData.cities.find((item) => item.id === String(form.get("cityId"))) ?? initialData.cities[0];

    const body = {
      cityId: String(form.get("cityId")),
      name: String(form.get("name")),
      description: String(form.get("description")),
      culturalStory: String(form.get("culturalStory")),
      eatingTips: String(form.get("eatingTips")),
      address: String(form.get("address")),
      latitude: Number(form.get("latitude") || city.latitude),
      longitude: Number(form.get("longitude") || city.longitude),
      type: String(form.get("type")),
      priceRange: String(form.get("priceRange")),
      averageMealMinutes: Number(form.get("averageMealMinutes") || 45),
      minPrice: Number(form.get("minPrice") || 30000),
      maxPrice: Number(form.get("maxPrice") || 120000),
      isVegetarianFriendly: form.get("isVegetarianFriendly") === "on",
      isSpicy: form.get("isSpicy") === "on",
      isActive: true
    };

    runAction(async () => {
      const response = await fetch("/api/admin/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Cannot create restaurant.");
      setRestaurants((current) => [payload.restaurant, ...current]);
      setEditingRestaurantId(payload.restaurant.id);
      setMessage("Restaurant created.");
      event.currentTarget.reset();
    });
  }

  return (
    <main className="min-h-screen p-4 text-ink md:p-6">
      <section className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-[24px] bg-white/90 p-5 shadow-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">Phase 10</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">Admin operations</h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Signed in as {initialData.user.fullName} ({initialData.user.email}). Manage the MVP demo data from one
                protected workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    activeTab === tab ? "bg-ink text-white" : "bg-white text-stone-600 shadow-sm hover:text-ink"
                  }`}
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  type="button"
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-3 text-sm text-stone-600">
          <RefreshCw className={isPending ? "animate-spin text-clay-700" : "text-clay-700"} size={16} />
          {message}
        </div>

        {activeTab === "Overview" ? (
          <section className="space-y-5">
            <div className="grid gap-4 md:grid-cols-4">
              <Stat label="Users" value={initialData.dashboard.stats.users} detail={`${initialData.dashboard.stats.lockedUsers} locked`} icon={<Users size={20} />} />
              <Stat label="Restaurants" value={initialData.dashboard.stats.restaurants} detail={`${initialData.dashboard.stats.inactiveRestaurants} hidden`} icon={<Store size={20} />} />
              <Stat label="Reviews" value={initialData.dashboard.stats.reviews} detail={`${initialData.dashboard.stats.flaggedReviews} flagged`} icon={<Flag size={20} />} />
              <Stat label="Food tours" value={initialData.dashboard.stats.tours} detail="Saved demo routes" icon={<Shield size={20} />} />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-[24px] bg-white/88 p-5 shadow-panel">
                <h2 className="text-xl font-bold">Recent reviews</h2>
                <div className="mt-4 space-y-3">
                  {initialData.dashboard.recentReviews.map((review) => (
                    <article className="rounded-2xl border border-clay-100 p-4" key={review.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold">{review.restaurant.name}</p>
                        <span className="rounded-full bg-clay-50 px-3 py-1 text-xs font-bold text-clay-700">
                          {review.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-stone-600">
                        {review.rating}/5 by {review.user.fullName}: {review.comment}
                      </p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-[24px] bg-white/88 p-5 shadow-panel">
                <h2 className="text-xl font-bold">Recent tours</h2>
                <div className="mt-4 space-y-3">
                  {initialData.dashboard.recentTours.map((tour) => (
                    <article className="rounded-2xl border border-clay-100 p-4" key={tour.id}>
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-bold">{tour.title}</p>
                        <span className="text-sm font-bold text-leaf-700">{formatVnd(tour.totalCost)}</span>
                      </div>
                      <p className="mt-1 text-sm text-stone-600">
                        {tour.city.name} by {tour.user.fullName}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </section>
        ) : null}

        {activeTab === "Restaurants" ? (
          <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <form className="rounded-[24px] bg-white/88 p-5 shadow-panel" onSubmit={createRestaurant}>
              <h2 className="text-xl font-bold">Create demo restaurant</h2>
              <div className="mt-4 grid gap-3">
                <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="name" placeholder="Restaurant name" required />
                <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="address" placeholder="Address" required />
                <textarea className="min-h-24 rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="description" placeholder="Description" required />
                <textarea className="min-h-20 rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="culturalStory" placeholder="Cultural story" required defaultValue="A fictitious demo stop inspired by local street food culture." />
                <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="eatingTips" placeholder="Eating tips" required defaultValue="Ask for today's specialty and confirm portion size before ordering." />
                <div className="grid gap-3 md:grid-cols-2">
                  <select className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="cityId" required>
                    {initialData.cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </select>
                  <select className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="type" required>
                    {initialData.enums.restaurantTypes.map((type) => (
                      <option key={type} value={type}>
                        {label(type)}
                      </option>
                    ))}
                  </select>
                  <select className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="priceRange" required>
                    {initialData.enums.priceRanges.map((range) => (
                      <option key={range} value={range}>
                        {label(range)}
                      </option>
                    ))}
                  </select>
                  <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="averageMealMinutes" placeholder="Meal minutes" type="number" defaultValue={45} />
                  <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="minPrice" placeholder="Min price" type="number" defaultValue={30000} />
                  <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="maxPrice" placeholder="Max price" type="number" defaultValue={120000} />
                  <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="latitude" placeholder="Latitude" type="number" step="0.000001" />
                  <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="longitude" placeholder="Longitude" type="number" step="0.000001" />
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                  <label className="flex items-center gap-2">
                    <input name="isVegetarianFriendly" type="checkbox" /> Vegetarian friendly
                  </label>
                  <label className="flex items-center gap-2">
                    <input name="isSpicy" type="checkbox" /> Spicy
                  </label>
                </div>
                <button className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" disabled={isPending} type="submit">
                  <Plus size={17} />
                  Create restaurant
                </button>
              </div>
            </form>

            <section className="space-y-4">
              <div className="rounded-[24px] bg-white/88 p-5 shadow-panel">
                <h2 className="text-xl font-bold">Restaurants ({initialData.restaurants.pagination.total})</h2>
                <div className="mt-4 space-y-3">
                  {restaurants.map((restaurant) => (
                    <article className="rounded-2xl border border-clay-100 p-4" key={restaurant.id}>
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-bold">{restaurant.name}</p>
                          <p className="mt-1 text-sm text-stone-600">
                            {restaurant.city.name} • {label(restaurant.type)} • {formatVnd(restaurant.minPrice)}-
                            {formatVnd(restaurant.maxPrice)} • {formatRating(restaurant.ratingAverage)}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-xl bg-clay-50 px-3 py-2 text-xs font-bold text-clay-700" onClick={() => setEditingRestaurantId(restaurant.id)} type="button">
                            Edit
                          </button>
                          <button
                            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
                              restaurant.isActive ? "bg-red-50 text-red-700" : "bg-leaf-500/10 text-leaf-700"
                            }`}
                            onClick={() => updateRestaurant(restaurant.id, { isActive: !restaurant.isActive })}
                            type="button"
                          >
                            {restaurant.isActive ? <Ban size={14} /> : <CheckCircle2 size={14} />}
                            {restaurant.isActive ? "Hide" : "Restore"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {selectedRestaurant ? (
                <form
                  className="rounded-[24px] bg-white/88 p-5 shadow-panel"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    updateRestaurant(selectedRestaurant.id, {
                      name: String(form.get("name")),
                      minPrice: Number(form.get("minPrice")),
                      maxPrice: Number(form.get("maxPrice")),
                      priceRange: String(form.get("priceRange")) as AdminRestaurant["priceRange"]
                    });
                  }}
                >
                  <h2 className="text-xl font-bold">Quick edit</h2>
                  <p className="mt-1 text-sm text-stone-600">{selectedRestaurant.name}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="name" defaultValue={selectedRestaurant.name} />
                    <select className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="priceRange" defaultValue={selectedRestaurant.priceRange}>
                      {initialData.enums.priceRanges.map((range) => (
                        <option key={range} value={range}>
                          {label(range)}
                        </option>
                      ))}
                    </select>
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="minPrice" type="number" defaultValue={selectedRestaurant.minPrice} />
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="maxPrice" type="number" defaultValue={selectedRestaurant.maxPrice} />
                  </div>
                  <button className="mt-4 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" disabled={isPending} type="submit">
                    Save edit
                  </button>
                </form>
              ) : null}
            </section>
          </section>
        ) : null}

        {activeTab === "Users" ? (
          <section className="rounded-[24px] bg-white/88 p-5 shadow-panel">
            <h2 className="text-xl font-bold">Users ({initialData.users.pagination.total})</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="text-xs uppercase text-stone-500">
                  <tr>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Activity</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr className="border-t border-clay-100" key={user.id}>
                      <td className="px-3 py-3">
                        <p className="font-bold">{user.fullName}</p>
                        <p className="text-stone-500">{user.email}</p>
                      </td>
                      <td className="px-3 py-3">
                        <select
                          className="rounded-xl border border-clay-100 px-3 py-2"
                          disabled={user.id === initialData.user.id}
                          onChange={(event) => updateUser(user.id, { role: event.target.value })}
                          value={user.role}
                        >
                          {initialData.enums.roles.map((role) => (
                            <option key={role} value={role}>
                              {label(role)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-3 text-stone-600">
                        {user._count.foodTours} tours • {user._count.reviews} reviews • {user._count.favorites} favorites
                      </td>
                      <td className="px-3 py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${user.isLocked ? "bg-red-50 text-red-700" : "bg-leaf-500/10 text-leaf-700"}`}>
                          {user.isLocked ? "Locked" : "Active"}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <button
                          className="inline-flex items-center gap-2 rounded-xl bg-clay-50 px-3 py-2 text-xs font-bold text-clay-700 disabled:opacity-40"
                          disabled={user.id === initialData.user.id}
                          onClick={() => updateUser(user.id, { isLocked: !user.isLocked })}
                          type="button"
                        >
                          {user.isLocked ? <Unlock size={14} /> : <Lock size={14} />}
                          {user.isLocked ? "Unlock" : "Lock"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab === "Reviews" ? (
          <section className="rounded-[24px] bg-white/88 p-5 shadow-panel">
            <h2 className="text-xl font-bold">Reviews ({initialData.reviews.pagination.total})</h2>
            <div className="mt-4 space-y-3">
              {reviews.map((review) => (
                <article className="rounded-2xl border border-clay-100 p-4" key={review.id}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">{review.restaurant.name}</p>
                        <span className="rounded-full bg-clay-50 px-3 py-1 text-xs font-bold text-clay-700">
                          {review.status}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-stone-600">
                        {review.rating}/5 by {review.user.fullName}: {review.comment}
                      </p>
                      {review.moderationReason ? (
                        <p className="mt-1 text-xs text-stone-500">Reason: {review.moderationReason}</p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="rounded-xl bg-leaf-500/10 px-3 py-2 text-xs font-bold text-leaf-700" onClick={() => moderateReview(review.id, "PUBLISHED")} type="button">
                        Publish
                      </button>
                      <button className="rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700" onClick={() => moderateReview(review.id, "HIDDEN")} type="button">
                        Hide
                      </button>
                      <button className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700" onClick={() => moderateReview(review.id, "FLAGGED")} type="button">
                        Flag
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function Stat({
  label,
  value,
  detail,
  icon
}: {
  label: string;
  value: number;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-[24px] bg-white/88 p-5 shadow-panel">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{label}</p>
        <span className="text-clay-700">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      <p className="mt-1 text-sm text-stone-500">{detail}</p>
    </article>
  );
}
