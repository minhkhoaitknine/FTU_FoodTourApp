"use client";

import {
  Ban,
  CheckCircle2,
  Trash2,
  Flag,
  Image as ImageIcon,
  Lock,
  Plus,
  RefreshCw,
  Shield,
  Store,
  Tags,
  Utensils,
  Unlock,
  Users
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { AppImage } from "@/components/common/app-image";
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
    role: string;
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
  culturalStory: string;
  eatingTips: string;
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
  images: Array<{ id: string; url: string; alt: string; sortOrder: number }>;
  tags: Array<{ id: string; name: string }>;
  menuCategories: Array<{
    id: string;
    name: string;
    sortOrder: number;
    items: Array<{
      id: string;
      name: string;
      description: string;
      price: number;
      isVegetarian: boolean;
      isSpicy: boolean;
      allergens: unknown;
    }>;
  }>;
  _count: { reviews: number; favorites: number; tourStops: number };
};

type MenuPayloadItem = {
  name: string;
  description?: string;
  price: number;
  isVegetarian: boolean;
  isSpicy: boolean;
  allergens: string[];
};

type RestaurantFormPayload = {
  cityId?: string;
  name?: string;
  description?: string;
  culturalStory?: string;
  eatingTips?: string;
  address?: string;
  imageUrl?: string;
  imageAlt?: string;
  tags?: string[];
  menuItems?: MenuPayloadItem[];
  latitude?: number;
  longitude?: number;
  type?: string;
  priceRange?: string;
  averageMealMinutes?: number;
  minPrice?: number;
  maxPrice?: number;
  isVegetarianFriendly?: boolean;
  isSpicy?: boolean;
  isActive?: boolean;
};

type UploadedImageState = {
  dataUrl: string;
  fileName: string;
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
const moderatorTabs = ["Reviews"] as const;
const MAX_IMAGE_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_IMAGE_DATA_URL_LENGTH = 1500000;
const IMAGE_MAX_DIMENSION = 1200;

function label(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function optionalFormText(form: FormData, key: string) {
  const value = String(form.get(key) ?? "").trim();
  return value.length > 0 ? value : undefined;
}

function parseCsv(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseBooleanToken(value: string | undefined, fallback = false) {
  if (!value) return fallback;
  return ["true", "yes", "1", "vegetarian", "spicy", "y"].includes(value.trim().toLowerCase());
}

function parseMenuItems(value: FormDataEntryValue | null): MenuPayloadItem[] | undefined {
  const lines = String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) return undefined;

  return lines.map((line) => {
    const [name = "", description = "", price = "0", vegetarian = "", spicy = "", allergens = ""] = line
      .split("|")
      .map((part) => part.trim());

    return {
      name,
      description: description || undefined,
      price: Number(price || 0),
      isVegetarian: parseBooleanToken(vegetarian),
      isSpicy: parseBooleanToken(spicy),
      allergens: allergens
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    };
  });
}

function menuItemsToText(restaurant: AdminRestaurant) {
  return restaurant.menuCategories
    .flatMap((category) => category.items)
    .map((item) => {
      const allergens = Array.isArray(item.allergens)
        ? item.allergens.filter((allergen): allergen is string => typeof allergen === "string").join(", ")
        : "";
      return [
        item.name,
        item.description,
        String(item.price),
        item.isVegetarian ? "true" : "false",
        item.isSpicy ? "true" : "false",
        allergens
      ].join(" | ");
    })
    .join("\n");
}

function defaultMenuText() {
  return [
    "Signature dish | Admin-created demo menu item. | 90000 | false | false |",
    "Local drink | House beverage for food tour guests. | 35000 | true | false |"
  ].join("\n");
}

function tagsToText(restaurant: AdminRestaurant) {
  return restaurant.tags.map((tag) => tag.name).join(", ");
}

async function compressImageFile(file: File): Promise<UploadedImageState> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose a JPG, PNG or WebP image file.");
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error("Image file is too large. Please choose an image under 8 MB.");
  }

  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new window.Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Cannot read this image file."));
      element.src = objectUrl;
    });

    const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) throw new Error("Cannot process this image in the browser.");

    context.drawImage(image, 0, 0, width, height);

    let dataUrl = canvas.toDataURL("image/jpeg", 0.82);
    if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
      dataUrl = canvas.toDataURL("image/jpeg", 0.68);
    }
    if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) {
      throw new Error("Image is still too large after compression. Please choose a smaller image.");
    }

    return {
      dataUrl,
      fileName: file.name
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
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

async function deleteJson<T>(url: string) {
  const response = await fetch(url, {
    method: "DELETE"
  });

  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? "Request failed.");
  return payload as T;
}

export function AdminDashboard({ initialData }: { initialData: AdminPayload }) {
  const isModeratorOnly = initialData.user.role === "MODERATOR";
  const availableTabs = isModeratorOnly ? moderatorTabs : tabs;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>(
    isModeratorOnly ? "Reviews" : "Overview"
  );
  const [restaurants, setRestaurants] = useState(initialData.restaurants.items);
  const [users, setUsers] = useState(initialData.users.items);
  const [reviews, setReviews] = useState(initialData.reviews.items);
  const [editingRestaurantId, setEditingRestaurantId] = useState<string | null>(null);
  const [createImageUpload, setCreateImageUpload] = useState<UploadedImageState | null>(null);
  const [editImageUploads, setEditImageUploads] = useState<Record<string, UploadedImageState>>({});
  const [message, setMessage] = useState("Ready.");
  const [messageTone, setMessageTone] = useState<"info" | "success" | "error">("info");
  const [isPending, startTransition] = useTransition();
  const restaurantEditorRef = useRef<HTMLFormElement | null>(null);

  const selectedRestaurant = useMemo(
    () => restaurants.find((restaurant) => restaurant.id === editingRestaurantId) ?? null,
    [editingRestaurantId, restaurants]
  );
  const selectedEditImage = selectedRestaurant ? editImageUploads[selectedRestaurant.id] : undefined;
  const selectedImageUrl = selectedEditImage?.dataUrl ?? selectedRestaurant?.images[0]?.url ?? "";

  useEffect(() => {
    if (!editingRestaurantId || activeTab !== "Restaurants") return;

    const timer = window.setTimeout(() => {
      restaurantEditorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);

    return () => window.clearTimeout(timer);
  }, [activeTab, editingRestaurantId]);

  function showMessage(text: string, tone: "info" | "success" | "error" = "info") {
    setMessage(text);
    setMessageTone(tone);
  }

  function runAction(action: () => Promise<void>) {
    startTransition(async () => {
      try {
        await action();
      } catch (error) {
        showMessage(error instanceof Error ? error.message : "Unexpected admin error.", "error");
      }
    });
  }

  function updateRestaurant(id: string, body: RestaurantFormPayload) {
    runAction(async () => {
      const payload = await patchJson<{ restaurant: AdminRestaurant }>(`/api/admin/restaurants/${id}`, body);
      setRestaurants((current) =>
        current.map((restaurant) => (restaurant.id === id ? payload.restaurant : restaurant))
      );
      showMessage("Restaurant updated.", "success");
    });
  }

  function deleteRestaurant(restaurant: AdminRestaurant) {
    const confirmed = window.confirm(
      `Permanently delete "${restaurant.name}"? This also removes its images, menu, tags, reviews, favorites, and saved tours that used this restaurant. This cannot be undone.`
    );
    if (!confirmed) return;

    runAction(async () => {
      await deleteJson<{ restaurant: { id: string; name: string } }>(`/api/admin/restaurants/${restaurant.id}`);
      setRestaurants((current) => current.filter((item) => item.id !== restaurant.id));
      setEditingRestaurantId((current) => (current === restaurant.id ? null : current));
      setEditImageUploads((current) => {
        const next = { ...current };
        delete next[restaurant.id];
        return next;
      });
      showMessage(`Restaurant "${restaurant.name}" deleted.`, "success");
    });
  }

  function openRestaurantEditor(id: string) {
    setEditingRestaurantId(id);
    showMessage("Restaurant editor opened. Scroll to the editor form below the list.", "info");
  }

  async function handleCreateImageFile(file: File | undefined) {
    if (!file) {
      setCreateImageUpload(null);
      return;
    }

    try {
      showMessage("Processing restaurant image...", "info");
      const image = await compressImageFile(file);
      setCreateImageUpload(image);
      showMessage("Image is ready. Submit the form to save it.", "success");
    } catch (error) {
      setCreateImageUpload(null);
      showMessage(error instanceof Error ? error.message : "Cannot process image.", "error");
    }
  }

  async function handleEditImageFile(restaurantId: string, file: File | undefined) {
    if (!file) {
      setEditImageUploads((current) => {
        const next = { ...current };
        delete next[restaurantId];
        return next;
      });
      return;
    }

    try {
      showMessage("Processing restaurant image...", "info");
      const image = await compressImageFile(file);
      setEditImageUploads((current) => ({ ...current, [restaurantId]: image }));
      showMessage("Image is ready. Save the restaurant to apply it.", "success");
    } catch (error) {
      showMessage(error instanceof Error ? error.message : "Cannot process image.", "error");
    }
  }

  function updateUser(id: string, body: Partial<AdminUser>) {
    runAction(async () => {
      const payload = await patchJson<{ user: AdminUser }>(`/api/admin/users/${id}`, body);
      setUsers((current) => current.map((user) => (user.id === id ? payload.user : user)));
      showMessage("User updated.", "success");
    });
  }

  function moderateReview(id: string, status: string) {
    runAction(async () => {
      const payload = await patchJson<{ review: AdminReview }>(`/api/admin/reviews/${id}`, {
        status,
        reason: `Admin set review status to ${status}.`
      });
      setReviews((current) => current.map((review) => (review.id === id ? payload.review : review)));
      showMessage("Review moderation saved.", "success");
    });
  }

  function createRestaurant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const city = initialData.cities.find((item) => item.id === String(form.get("cityId"))) ?? initialData.cities[0];

    const body: RestaurantFormPayload = {
      cityId: String(form.get("cityId")),
      name: String(form.get("name")),
      description: String(form.get("description")),
      culturalStory: String(form.get("culturalStory")),
      eatingTips: String(form.get("eatingTips")),
      address: String(form.get("address")),
      imageUrl: optionalFormText(form, "imageUrl"),
      imageAlt: optionalFormText(form, "imageAlt"),
      tags: parseCsv(form.get("tags")),
      menuItems: parseMenuItems(form.get("menuItems")),
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
      showMessage("Restaurant created.", "success");
      setCreateImageUpload(null);
      event.currentTarget.reset();
    });
  }

  return (
    <main className="min-h-screen p-4 text-ink md:p-6">
      <section className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-[24px] bg-white/90 p-5 shadow-panel">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">Admin Panel</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">
                {isModeratorOnly ? "Moderation workspace" : "Admin operations"}
              </h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Signed in as {initialData.user.fullName} ({initialData.user.email}).
                {isModeratorOnly
                  ? " Review, publish, hide or flag user restaurant reviews."
                  : " Manage the MVP demo data from one protected workspace."}
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap justify-start gap-2 lg:justify-end">
                <Link
                  className="rounded-2xl border border-clay-100 bg-white px-4 py-3 text-sm font-bold text-clay-700 shadow-sm transition hover:text-ink"
                  href="/dashboard"
                >
                  Back to Dashboard
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableTabs.map((tab) => (
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
          </div>
        </header>

        <div
          className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm ${
            messageTone === "error"
              ? "bg-red-50 text-red-700"
              : messageTone === "success"
                ? "bg-leaf-500/10 text-leaf-700"
                : "bg-white/80 text-stone-600"
          }`}
        >
          <RefreshCw className={isPending ? "animate-spin" : ""} size={16} />
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
              <p className="mt-1 text-sm leading-6 text-stone-600">
                Create a restaurant with image metadata, tags and editable menu items. Use existing public image paths
                or external image URLs.
              </p>
              <div className="mt-4 grid gap-4">
                <div className="grid gap-3">
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Restaurant name
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="name" placeholder="Pacific Rest" required />
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Address
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="address" placeholder="181A/6 Au Duong Lan Street, District 8" required />
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Description
                    <textarea className="min-h-24 rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="description" placeholder="Short restaurant description" required />
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Cultural story
                    <textarea className="min-h-20 rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="culturalStory" placeholder="Cultural story" required defaultValue="A fictitious demo stop inspired by local street food culture." />
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Eating tips
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="eatingTips" placeholder="Eating tips" required defaultValue="Ask for today's specialty and confirm portion size before ordering." />
                  </label>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    City
                    <select className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="cityId" required>
                      {initialData.cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Type
                    <select className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="type" required>
                      {initialData.enums.restaurantTypes.map((type) => (
                        <option key={type} value={type}>
                          {label(type)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Price range
                    <select className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="priceRange" required>
                      {initialData.enums.priceRanges.map((range) => (
                        <option key={range} value={range}>
                          {label(range)}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Meal minutes
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="averageMealMinutes" type="number" defaultValue={45} />
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Min price
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="minPrice" type="number" defaultValue={30000} />
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Max price
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="maxPrice" type="number" defaultValue={120000} />
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Latitude
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="latitude" placeholder="Use city center if empty" type="number" step="0.000001" />
                  </label>
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Longitude
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="longitude" placeholder="Use city center if empty" type="number" step="0.000001" />
                  </label>
                </div>
                <div className="grid gap-3 rounded-2xl border border-clay-100 bg-clay-50/45 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-clay-700">
                    <ImageIcon size={17} />
                    Restaurant image
                  </div>
                  <input name="imageUrl" readOnly type="hidden" value={createImageUpload?.dataUrl ?? ""} />
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Upload image from device
                    <input
                      accept="image/jpeg,image/png,image/webp"
                      className="rounded-2xl border border-clay-100 bg-white px-4 py-3 font-normal"
                      onChange={(event) => void handleCreateImageFile(event.currentTarget.files?.[0])}
                      type="file"
                    />
                  </label>
                  {createImageUpload ? (
                    <div className="grid gap-2 rounded-2xl bg-white p-3">
                      <AppImage
                        alt="Selected restaurant preview"
                        className="aspect-[4/3] rounded-xl"
                        sizes="280px"
                        src={createImageUpload.dataUrl}
                      />
                      <p className="truncate text-xs font-semibold text-stone-500">{createImageUpload.fileName}</p>
                    </div>
                  ) : null}
                  <label className="grid gap-1 text-sm font-bold text-stone-700">
                    Image alt text
                    <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="imageAlt" placeholder="Pacific Rest storefront and signature dish" />
                  </label>
                </div>
                <div className="grid gap-3 rounded-2xl border border-clay-100 bg-clay-50/45 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-clay-700">
                    <Tags size={17} />
                    Tags
                  </div>
                  <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="tags" placeholder="local-food, dinner, seafood, family-friendly" />
                </div>
                <div className="grid gap-3 rounded-2xl border border-clay-100 bg-clay-50/45 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-clay-700">
                    <Utensils size={17} />
                    Menu items
                  </div>
                  <p className="text-xs leading-5 text-stone-500">
                    One item per line: name | description | price | vegetarian true/false | spicy true/false | allergens
                  </p>
                  <textarea
                    className="min-h-28 rounded-2xl border border-clay-100 px-4 py-3 text-sm"
                    name="menuItems"
                    defaultValue={defaultMenuText()}
                  />
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
                  {restaurants.map((restaurant) => {
                    const isEditing = restaurant.id === editingRestaurantId;
                    return (
                    <article
                      className={`rounded-2xl border p-4 transition ${
                        isEditing ? "border-clay-500 bg-clay-50/70 shadow-sm" : "border-clay-100"
                      }`}
                      key={restaurant.id}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <p className="font-bold">{restaurant.name}</p>
                          <p className="mt-1 text-sm text-stone-600">
                            {restaurant.city.name} • {label(restaurant.type)} • {formatVnd(restaurant.minPrice)}-
                            {formatVnd(restaurant.maxPrice)} • {formatRating(restaurant.ratingAverage)}
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            {restaurant.images.length} image(s) /{" "}
                            {restaurant.menuCategories.reduce((total, category) => total + category.items.length, 0)} menu item(s) /{" "}
                            {restaurant.tags.length} tag(s)
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <button
                            aria-pressed={isEditing}
                            className={`rounded-xl px-3 py-2 text-xs font-bold ${
                              isEditing ? "bg-ink text-white" : "bg-clay-50 text-clay-700"
                            }`}
                            onClick={() => openRestaurantEditor(restaurant.id)}
                            type="button"
                          >
                            {isEditing ? "Editing" : "Edit"}
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
                          <button
                            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700"
                            onClick={() => deleteRestaurant(restaurant)}
                            type="button"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </article>
                    );
                  })}
                </div>
              </div>

              {selectedRestaurant ? (
                <form
                  key={selectedRestaurant.id}
                  ref={restaurantEditorRef}
                  className="rounded-[24px] bg-white/88 p-5 shadow-panel"
                  onSubmit={(event) => {
                    event.preventDefault();
                    const form = new FormData(event.currentTarget);
                    updateRestaurant(selectedRestaurant.id, {
                      name: String(form.get("name")),
                      description: String(form.get("description")),
                      culturalStory: String(form.get("culturalStory")),
                      eatingTips: String(form.get("eatingTips")),
                      address: String(form.get("address")),
                      imageUrl: optionalFormText(form, "imageUrl"),
                      imageAlt: optionalFormText(form, "imageAlt"),
                      tags: parseCsv(form.get("tags")),
                      menuItems: parseMenuItems(form.get("menuItems")),
                      latitude: Number(form.get("latitude")),
                      longitude: Number(form.get("longitude")),
                      type: String(form.get("type")) as AdminRestaurant["type"],
                      minPrice: Number(form.get("minPrice")),
                      maxPrice: Number(form.get("maxPrice")),
                      priceRange: String(form.get("priceRange")) as AdminRestaurant["priceRange"],
                      averageMealMinutes: Number(form.get("averageMealMinutes")),
                      isVegetarianFriendly: form.get("isVegetarianFriendly") === "on",
                      isSpicy: form.get("isSpicy") === "on"
                    });
                  }}
                >
                  <h2 className="text-xl font-bold">Edit restaurant content</h2>
                  <p className="mt-1 text-sm text-stone-600">{selectedRestaurant.name}</p>
                  <div className="mt-4 grid gap-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="grid gap-1 text-sm font-bold text-stone-700 md:col-span-2">
                        Restaurant name
                        <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="name" defaultValue={selectedRestaurant.name} />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700 md:col-span-2">
                        Address
                        <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="address" defaultValue={selectedRestaurant.address} />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700 md:col-span-2">
                        Description
                        <textarea className="min-h-24 rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="description" defaultValue={selectedRestaurant.description} />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700 md:col-span-2">
                        Cultural story
                        <textarea className="min-h-20 rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="culturalStory" defaultValue={selectedRestaurant.culturalStory} />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700 md:col-span-2">
                        Eating tips
                        <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="eatingTips" defaultValue={selectedRestaurant.eatingTips} />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700">
                        Type
                        <select className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="type" defaultValue={selectedRestaurant.type}>
                          {initialData.enums.restaurantTypes.map((type) => (
                            <option key={type} value={type}>
                              {label(type)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700">
                        Price range
                        <select className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="priceRange" defaultValue={selectedRestaurant.priceRange}>
                          {initialData.enums.priceRanges.map((range) => (
                            <option key={range} value={range}>
                              {label(range)}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700">
                        Min price
                        <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="minPrice" type="number" defaultValue={selectedRestaurant.minPrice} />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700">
                        Max price
                        <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="maxPrice" type="number" defaultValue={selectedRestaurant.maxPrice} />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700">
                        Latitude
                        <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="latitude" type="number" step="0.000001" defaultValue={selectedRestaurant.latitude} />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700">
                        Longitude
                        <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="longitude" type="number" step="0.000001" defaultValue={selectedRestaurant.longitude} />
                      </label>
                      <label className="grid gap-1 text-sm font-bold text-stone-700">
                        Meal minutes
                        <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="averageMealMinutes" type="number" defaultValue={selectedRestaurant.averageMealMinutes} />
                      </label>
                    </div>
                    <div className="grid gap-3 rounded-2xl border border-clay-100 bg-clay-50/45 p-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-clay-700">
                        <ImageIcon size={17} />
                        Restaurant image
                      </div>
                      <input name="imageUrl" readOnly type="hidden" value={selectedImageUrl} />
                      <label className="grid gap-1 text-sm font-bold text-stone-700">
                        Replace image from device
                        <input
                          accept="image/jpeg,image/png,image/webp"
                          className="rounded-2xl border border-clay-100 bg-white px-4 py-3 font-normal"
                          onChange={(event) => void handleEditImageFile(selectedRestaurant.id, event.currentTarget.files?.[0])}
                          type="file"
                        />
                      </label>
                      {selectedImageUrl ? (
                        <div className="grid gap-2 rounded-2xl bg-white p-3">
                          <AppImage
                            alt={selectedRestaurant.images[0]?.alt ?? `${selectedRestaurant.name} image`}
                            className="aspect-[4/3] rounded-xl"
                            sizes="320px"
                            src={selectedImageUrl}
                          />
                          <p className="truncate text-xs font-semibold text-stone-500">
                            {selectedEditImage?.fileName ?? "Current restaurant image"}
                          </p>
                        </div>
                      ) : null}
                      <label className="grid gap-1 text-sm font-bold text-stone-700">
                        Image alt text
                        <input className="rounded-2xl border border-clay-100 px-4 py-3 font-normal" name="imageAlt" defaultValue={selectedRestaurant.images[0]?.alt ?? `${selectedRestaurant.name} image`} />
                      </label>
                    </div>
                    <div className="grid gap-3 rounded-2xl border border-clay-100 bg-clay-50/45 p-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-clay-700">
                        <Tags size={17} />
                        Tags
                      </div>
                      <input className="rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="tags" defaultValue={tagsToText(selectedRestaurant)} />
                    </div>
                    <div className="grid gap-3 rounded-2xl border border-clay-100 bg-clay-50/45 p-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-clay-700">
                        <Utensils size={17} />
                        Menu items
                      </div>
                      <p className="text-xs leading-5 text-stone-500">
                        One item per line: name | description | price | vegetarian true/false | spicy true/false | allergens
                      </p>
                      <textarea className="min-h-36 rounded-2xl border border-clay-100 px-4 py-3 text-sm" name="menuItems" defaultValue={menuItemsToText(selectedRestaurant)} />
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                      <label className="flex items-center gap-2">
                        <input name="isVegetarianFriendly" type="checkbox" defaultChecked={selectedRestaurant.isVegetarianFriendly} /> Vegetarian friendly
                      </label>
                      <label className="flex items-center gap-2">
                        <input name="isSpicy" type="checkbox" defaultChecked={selectedRestaurant.isSpicy} /> Spicy
                      </label>
                    </div>
                  </div>
                  <button className="mt-4 rounded-2xl bg-ink px-4 py-3 text-sm font-bold text-white" disabled={isPending} type="submit">
                    Save restaurant
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
