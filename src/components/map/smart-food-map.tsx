"use client";

import { RestaurantType } from "@prisma/client";
import L from "leaflet";
import { LocateFixed, MapPin, Navigation, Star } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { formatRating, formatVnd } from "@/lib/format";
import { haversineDistanceKm, type Coordinate } from "@/services/routing/haversine";
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

const markerIcon = L.divIcon({
  className: "",
  html: '<div class="foodtour-marker">🍜</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 30],
  popupAnchor: [0, -26]
});

const selectedMarkerIcon = L.divIcon({
  className: "",
  html: '<div class="foodtour-marker foodtour-marker-selected">🍜</div>',
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

function MapFocus({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, map.getZoom(), { animate: true });
  return null;
}

function restaurantCoordinate(restaurant: RestaurantCard): [number, number] {
  return [restaurant.latitude, restaurant.longitude];
}

function routeDistance(restaurants: RestaurantCard[]) {
  let total = 0;
  for (let index = 1; index < restaurants.length; index += 1) {
    total += haversineDistanceKm(restaurants[index - 1], restaurants[index]);
  }
  return Number(total.toFixed(2));
}

export function SmartFoodMap({ restaurants, cities }: SmartFoodMapProps) {
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("");
  const [selectedId, setSelectedId] = useState(restaurants[0]?.id ?? "");
  const [userLocation, setUserLocation] = useState<UserLocation>(null);
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
    filteredRestaurants.find((restaurant) => restaurant.id === selectedId) ?? filteredRestaurants[0] ?? restaurants[0];

  const center: [number, number] = selectedRestaurant
    ? restaurantCoordinate(selectedRestaurant)
    : [16.0544, 108.2022];

  const routeRestaurants = filteredRestaurants.slice(0, 5);
  const routeLine = routeRestaurants.map(restaurantCoordinate);
  const totalDistanceKm = routeDistance(routeRestaurants);

  function locateUser() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => setLocationError("Could not access your location. Please allow location permission."),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <aside className="space-y-4">
        <section className="rounded-[28px] bg-white/90 p-4 shadow-panel">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-clay-700">
                Smart Food Map
              </p>
              <h1 className="mt-1 text-2xl font-bold">Find food places</h1>
            </div>
            <button
              className="rounded-2xl bg-ink p-3 text-white transition hover:bg-stone-800"
              onClick={locateUser}
              title="Use current location"
              type="button"
            >
              <LocateFixed size={20} />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-2xl border border-clay-100 bg-white px-4 py-3 text-sm outline-none ring-clay-500 transition focus:ring-2"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search restaurant, area or tag..."
              value={query}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="rounded-2xl border border-clay-100 bg-white px-3 py-3 text-sm outline-none"
                onChange={(event) => setCity(event.target.value)}
                value={city}
              >
                <option value="">All cities</option>
                {cities.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
              <select
                className="rounded-2xl border border-clay-100 bg-white px-3 py-3 text-sm outline-none"
                onChange={(event) => setType(event.target.value)}
                value={type}
              >
                <option value="">All types</option>
                {Object.values(RestaurantType).map((item) => (
                  <option key={item} value={item}>
                    {item.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {locationError ? (
            <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm text-red-700">{locationError}</p>
          ) : null}
        </section>

        <section className="rounded-[28px] bg-white/90 p-4 shadow-panel">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">{filteredRestaurants.length} places</h2>
            <span className="text-xs font-semibold text-stone-500">List syncs with markers</span>
          </div>
          <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-1">
            {filteredRestaurants.length > 0 ? (
              filteredRestaurants.map((restaurant) => (
                <button
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    selectedRestaurant?.id === restaurant.id
                      ? "border-clay-500 bg-clay-50"
                      : "border-clay-100 bg-white hover:border-clay-300"
                  }`}
                  key={restaurant.id}
                  onClick={() => setSelectedId(restaurant.id)}
                  type="button"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">{restaurant.name}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
                        <MapPin size={13} />
                        {restaurant.city.name}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold text-clay-700">
                      <Star size={14} fill="currentColor" />
                      {formatRating(restaurant.ratingAverage)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-stone-600">
                    {formatVnd(restaurant.minPrice)} - {formatVnd(restaurant.maxPrice)}
                  </p>
                </button>
              ))
            ) : (
              <div className="rounded-2xl bg-clay-50 p-4 text-sm text-stone-600">
                No places match the current filters.
              </div>
            )}
          </div>
        </section>
      </aside>

      <section className="space-y-4">
        <div className="h-[680px] overflow-hidden rounded-[28px] border border-clay-100 bg-white shadow-panel">
          <MapContainer center={center} className="h-full w-full" scrollWheelZoom zoom={13}>
            <MapFocus center={center} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {routeLine.length >= 2 ? (
              <Polyline
                pathOptions={{ color: "#1f6c3b", weight: 5, opacity: 0.72 }}
                positions={routeLine}
              />
            ) : null}
            {filteredRestaurants.map((restaurant) => (
              <Marker
                eventHandlers={{
                  click: () => setSelectedId(restaurant.id)
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
                    <Link className="mt-2 inline-block font-bold text-clay-700" href={`/restaurants/${restaurant.slug}`}>
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

        <div className="grid gap-3 rounded-[28px] bg-white/90 p-4 text-sm shadow-panel md:grid-cols-3">
          <div>
            <p className="text-stone-500">Route mode</p>
            <p className="mt-1 flex items-center gap-2 text-lg font-bold">
              <Navigation size={18} />
              Haversine fallback
            </p>
          </div>
          <div>
            <p className="text-stone-500">Preview stops</p>
            <p className="mt-1 text-lg font-bold">{routeRestaurants.length}</p>
          </div>
          <div>
            <p className="text-stone-500">Estimated distance</p>
            <p className="mt-1 text-lg font-bold">~ {totalDistanceKm} km</p>
          </div>
        </div>

        <p className="rounded-2xl bg-clay-50 px-4 py-3 text-sm text-stone-600">
          Route lines are estimated with Haversine distance for demo reliability. OSM tile attribution is shown on
          the map.
        </p>
      </section>
    </div>
  );
}

