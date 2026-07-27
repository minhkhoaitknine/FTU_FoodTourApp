"use client";

import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";

import type { DashboardRoutePoint } from "@/components/dashboard/dashboard-route-preview";

type DashboardRouteLeafletMapProps = {
  points: DashboardRoutePoint[];
};

type LatLng = [number, number];

const routeIcon = L.divIcon({
  className: "",
  html: '<div class="foodtour-marker">FT</div>',
  iconSize: [34, 34],
  iconAnchor: [17, 30],
  popupAnchor: [0, -26]
});

const userIcon = L.divIcon({
  className: "",
  html: '<div class="foodtour-user-marker"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

function MapCenter({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    map.setView(center, zoom, { animate: !prefersReducedMotion });
  }, [center, map, zoom]);

  return null;
}

export function DashboardRouteLeafletMap({ points }: DashboardRouteLeafletMapProps) {
  const shouldUseDeviceLocation = points.length === 0;
  const fallbackCenter = useMemo(() => resolveFallbackCenter(points), [points]);
  const [userCenter, setUserCenter] = useState<LatLng | null>(null);
  const center = userCenter ?? fallbackCenter;
  const zoom = userCenter ? 15 : points.length > 0 ? 14 : 5;
  const routeLine = points.map((point) => [point.latitude, point.longitude] as LatLng);

  useEffect(() => {
    if (!shouldUseDeviceLocation) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCenter([position.coords.latitude, position.coords.longitude]);
      },
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 5000 }
    );
  }, [shouldUseDeviceLocation]);

  return (
    <MapContainer
      center={center}
      className="h-full min-h-[320px] w-full"
      scrollWheelZoom={false}
      zoom={zoom}
      zoomControl={false}
    >
      <MapCenter center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {routeLine.length >= 2 ? (
        <Polyline pathOptions={{ color: "#1f6c3b", weight: 4, opacity: 0.72 }} positions={routeLine} />
      ) : null}
      {points.map((point) => (
        <Marker icon={routeIcon} key={point.id} position={[point.latitude, point.longitude]}>
          <Popup>{point.label}</Popup>
        </Marker>
      ))}
      {userCenter ? (
        <Marker icon={userIcon} position={userCenter}>
          <Popup>Your current location</Popup>
        </Marker>
      ) : null}
    </MapContainer>
  );
}

function resolveFallbackCenter(points: DashboardRoutePoint[]): LatLng {
  if (points.length === 0) return [16.0544, 108.2022];

  const latitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length;
  const longitude = points.reduce((sum, point) => sum + point.longitude, 0) / points.length;
  return [latitude, longitude];
}
