"use client";

import { RestaurantType } from "@prisma/client";
import L from "leaflet";
import { LocateFixed, MapPin, Star } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { AppImage } from "@/components/common/app-image";
import { Button, Input, Select } from "@/components/ui";
import { resolveRestaurantImage } from "@/lib/assets/image-resolver";
import { formatRating, formatVnd } from "@/lib/format";
import type { Coordinate } from "@/services/routing/haversine";
import type { RestaurantCard } from "@/services/restaurants/restaurant-service";

type SmartFoodMapProps = {
  restaurants: RestaurantCard[];
  cities: Array<{
    id: string;
    name: string;
    region: string;
  }>;
};

type UserLocation = Coordinate | null;
const MY_LOCATION_ZOOM = 16;
const RESTAURANT_FOCUS_ZOOM = 14;

const markerIcon = L.divIcon({
  className: "",
  html: '<div class="foodtour-marker">FT</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 30],
  popupAnchor: [0, -26]
});

const selectedMarkerIcon = L.divIcon({
  className: "",
  html: '<div class="foodtour-marker foodtour-marker-selected">FT</div>',
  iconSize: [40, 40],
  iconAnchor: [20, 34],
  popupAnchor: [0, -30]
});

const userIcon = L.divIcon({
  className: "",
  html: '<div class="foodtour-user-marker"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

function MapFocus({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.setView(center, zoom, { animate: !prefersReducedMotion });
  }, [center, map, zoom]);

  return null;
}

function restaurantCoordinate(restaurant: RestaurantCard): [number, number] {
  return [restaurant.latitude, restaurant.longitude];
}

export function SmartFoodMap({ restaurants, cities }: SmartFoodMapProps) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [selectedId, setSelectedId] = useState(restaurants[0]?.id ?? "");
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
  const [focusedCenter, setFocusedCenter] = useState<[number, number] | null>(null);
  const [focusedZoom, setFocusedZoom] = useState(RESTAURANT_FOCUS_ZOOM);
  const [locationError, setLocationError] = useState("");

  const filteredRestaurants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return restaurants.filter((restaurant) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        restaurant.name.toLowerCase().includes(normalizedQuery) ||
        restaurant.address.toLowerCase().includes(normalizedQuery) ||
        restaurant.tags.some((tag) => tag.name.toLowerCase().includes(normalizedQuery));

      const matchesCity = city.length === 0 || restaurant.city.name === city;
      const matchesType = type.length === 0 || restaurant.type === type;
      return matchesQuery && matchesCity && matchesType;
    });
  }, [city, query, restaurants, type]);

  const selectedRestaurant =
    filteredRestaurants.find((restaurant) => restaurant.id === selectedId) ??
    filteredRestaurants[0] ??
    restaurants[0];

  const fallbackCenter: [number, number] = selectedRestaurant
    ? restaurantCoordinate(selectedRestaurant)
    : [16.0544, 108.2022];
  const center = focusedCenter ?? fallbackCenter;

  function locateUser() {
    setLocationError("");
    if (userLocation) {
      setFocusedCenter([userLocation.latitude, userLocation.longitude]);
      setFocusedZoom(MY_LOCATION_ZOOM);
    }

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation: [number, number] = [
          position.coords.latitude,
          position.coords.longitude
        ];
        setUserLocation({
          latitude: nextLocation[0],
          longitude: nextLocation[1]
        });
        setFocusedCenter(nextLocation);
        setFocusedZoom(MY_LOCATION_ZOOM);
      },
      () => setLocationError("Could not access your location. Please allow location permission."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <aside className="space-y-4">
        <section className="rounded-[28px] bg-surface-elevated/[0.65] p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase text-brand-strong">
                Smart Food Map
              </p>
              <h1 className="mt-1 text-section-title text-content">Find food places</h1>
            </div>
            <Button
              aria-label="Use current location"
              onClick={locateUser}
              size="icon"
              title="Use current location"
              type="button"
            >
              <LocateFixed aria-hidden="true" size={20} />
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            <Input
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search restaurant, area or tag..."
              value={query}
            />
            <div className="grid gap-3 xs:grid-cols-2">
              <Select onChange={(event) => setCity(event.target.value)} value={city}>
                <option value="">All cities</option>
                {cities.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </Select>
              <Select onChange={(event) => setType(event.target.value)} value={type}>
                <option value="">All types</option>
                {Object.values(RestaurantType).map((item) => (
                  <option key={item} value={item}>
                    {item.replaceAll("_", " ")}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {locationError ? (
            <p className="mt-3 rounded-app bg-danger-soft p-3 text-sm text-danger">{locationError}</p>
          ) : null}
        </section>

        <section className="rounded-[28px] bg-surface-elevated/[0.65] p-4 shadow-panel">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-content">{filteredRestaurants.length} places</h2>
            <span className="text-xs font-semibold text-content-subtle">Synced with markers</span>
          </div>
          <div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto pr-1 xl:max-h-[620px]">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((restaurant) => {
                const image = resolveRestaurantImage({
                  name: restaurant.name,
                  imageAlt: restaurant.images[0]?.alt,
                  imageUrl: restaurant.images[0]?.url,
                  tags: restaurant.tags.map((tag) => tag.name)
                });

                return (
                  <button
                    className={`grid w-full grid-cols-[72px_1fr] gap-3 rounded-app border p-3 text-left transition ${
                      selectedRestaurant?.id === restaurant.id
                        ? "border-brand bg-brand-soft/70"
                        : "border-line bg-surface-elevated hover:border-brand"
                    }`}
                    key={restaurant.id}
                    onClick={() => {
                      setSelectedId(restaurant.id);
                      setFocusedCenter(restaurantCoordinate(restaurant));
                      setFocusedZoom(RESTAURANT_FOCUS_ZOOM);
                    }}
                    type="button"
                  >
                    <AppImage
                      alt={image.alt}
                      className="aspect-square rounded-app-sm"
                      sizes="72px"
                      src={image.src}
                    />
                    <span className="min-w-0">
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block font-bold text-content">{restaurant.name}</span>
                          <span className="mt-1 flex items-center gap-1 text-xs text-content-muted">
                            <MapPin aria-hidden="true" size={13} />
                            {restaurant.city.name}
                          </span>
                        </span>
                        <span className="flex items-center gap-1 text-sm font-bold text-brand-strong">
                          <Star aria-hidden="true" fill="currentColor" size={14} />
                          {formatRating(restaurant.ratingAverage)}
                        </span>
                      </span>
                      <span className="mt-2 block text-xs font-semibold text-content-muted">
                        {formatVnd(restaurant.minPrice)} - {formatVnd(restaurant.maxPrice)}
                      </span>
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="rounded-app bg-surface-muted p-4 text-sm text-content-muted">
                No places match the current filters.
              </div>
            )}
          </div>
        </section>
      </aside>

      <section className="space-y-4">
        <div className="h-[520px] overflow-hidden rounded-[28px] border border-line bg-surface-elevated shadow-panel md:h-[680px]">
          <MapContainer center={center} className="h-full w-full" scrollWheelZoom zoom={focusedZoom}>
            <MapFocus center={center} zoom={focusedZoom} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredRestaurants.map((restaurant) => (
              <Marker
                eventHandlers={{
                  click: () => {
                    setSelectedId(restaurant.id);
                    setFocusedCenter(restaurantCoordinate(restaurant));
                    setFocusedZoom(RESTAURANT_FOCUS_ZOOM);
                  }
                }}
                icon={selectedRestaurant?.id === restaurant.id ? selectedMarkerIcon : markerIcon}
                key={restaurant.id}
                position={restaurantCoordinate(restaurant)}
              >
                <Popup>
                  <div className="min-w-56">
                    <p className="font-bold">{restaurant.name}</p>
                    <p className="mt-1 text-sm">{restaurant.city.name}</p>
                    <p className="mt-1 text-sm">
                      {formatVnd(restaurant.minPrice)} - {formatVnd(restaurant.maxPrice)}
                    </p>
                    <Link className="mt-2 inline-block font-bold text-brand-strong" href={`/restaurants/${restaurant.slug}`}>
                      View detail
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
            {userLocation ? (
              <Marker icon={userIcon} position={[userLocation.latitude, userLocation.longitude]}>
                <Popup>Your current location</Popup>
              </Marker>
            ) : null}
          </MapContainer>
        </div>

        <div className="grid gap-3 rounded-[28px] bg-surface-elevated/[0.65] p-4 text-sm shadow-panel md:grid-cols-2">
          <div>
            <p className="text-content-muted">Visible places</p>
            <p className="mt-1 text-lg font-bold">{filteredRestaurants.length}</p>
          </div>
          <div>
            <p className="text-content-muted">Selected place</p>
            <p className="mt-1 truncate text-lg font-bold">{selectedRestaurant?.name ?? "None"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
