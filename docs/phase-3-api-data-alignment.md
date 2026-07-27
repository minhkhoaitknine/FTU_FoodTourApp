# Phase 3 - API And Data Alignment

Phase 3 aligns backend/service responses with the UI refactor without changing
the Prisma schema, migrations or existing API contracts.

## Classification

Change level: medium, non-breaking.

Rationale:

- Existing fields are preserved.
- New fields are additive metadata for UI rendering.
- No endpoint is removed or renamed.
- No database table, column or relation is changed.
- No migration is required.

## Current Problem

The UI needs stable presentation metadata for images and city backgrounds, but
the app previously returned mostly raw Prisma records:

- Restaurant seed image URLs point to a legacy path that does not exist in the
  provided asset set.
- City records do not have `slug` or background image metadata.
- Tour responses do not include a compact `summary` object for dashboard/timeline
  screens.
- Page components and API routes can drift because they both consume service
  output directly.

## Implemented Alignment

Shared metadata mappers live in:

```text
src/lib/api/ui-metadata.ts
```

Added metadata:

| Object | Added field | Purpose |
| --- | --- | --- |
| City | `slug` | Stable UI key/link/display identifier derived from name |
| City | `displayName` | Display-safe city label |
| City | `backgroundImage` | Resolved city background asset |
| Restaurant | `displayName` | Display-safe restaurant label |
| Restaurant | `image` | Resolved restaurant/food fallback asset |
| FoodTour | `summary` | Compact cost, distance, travel time and stop count |

These fields are now added by services used by both server pages and API routes:

- `listCities`
- `listRestaurants`
- `listMapRestaurants`
- `getRestaurantBySlugOrId`
- `generateAndSaveFoodTour`
- `listUserFoodTours`
- `getUserFoodTour`
- `cloneUserFoodTour`

## Compatibility

Existing API clients can continue reading old fields:

- `restaurant.images`
- `restaurant.city.name`
- `tour.totalCost`
- `tour.totalDistanceKm`
- `tour.totalTravelMinutes`
- `tour.stops`

New UI can prefer:

- `restaurant.image`
- `restaurant.city.backgroundImage`
- `city.slug`
- `city.backgroundImage`
- `tour.summary`

## Backend/API/Database Impact

Backend service impact: yes, additive mapper layer.

API impact: yes, additive response fields.

Database impact: none.

Migration impact: none.

Breaking change: no.

## Local Database Note

The local `.env` currently points `DATABASE_URL` to Neon. During verification,
the app could not reach the Neon host from this machine. This is not a code
change requirement for Phase 3. To test DB-backed pages locally, either:

- keep Neon reachable from the current network, or
- start Docker and use the local PostgreSQL service from `docker-compose.yml`.

Do not commit environment-specific secret changes.

## Follow-Up Candidates

These are intentionally deferred because they require schema/API decisions:

- Persist `City.slug`, aliases and image attribution in the database.
- Persist menu item image metadata.
- Add true multi-city tour structure.
- Add route geometry to saved food tours.
