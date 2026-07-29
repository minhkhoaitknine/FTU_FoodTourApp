# Food Tour Generator

Food Tour Generator is a full-stack web application for planning local Vietnamese food tours based on budget, time, transport mode, dietary preferences, allergies and distance.

This repository is at release-candidate stage for a public student/demo deployment.

## Current Stack

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Vitest
- Leaflet/OpenStreetMap

## Local Setup

1. Install dependencies:

   ```powershell
   npm.cmd install
   ```

2. Create local environment config:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Update `DATABASE_URL` in `.env` if your local PostgreSQL credentials differ.

4. Optional: start local PostgreSQL with Docker:

   ```powershell
   docker compose up -d
   ```

5. Generate Prisma client:

   ```powershell
   npm.cmd run prisma:generate
   ```

6. Apply the schema to the configured database:

   ```powershell
   npm.cmd run db:push
   ```

7. Seed reproducible demo data:

   ```powershell
   npm.cmd run db:seed
   ```

8. Start the development server:

   ```powershell
   npm.cmd run dev
   ```

9. Open:

   ```text
   http://localhost:3000
   ```

10. Health check:

   ```text
   http://localhost:3000/api/health
   ```

11. Run preflight checks:

   ```powershell
   npm.cmd run preflight
   ```

## Database Commands

Generate Prisma client:

```powershell
npm.cmd run prisma:generate
```

Push schema without creating a migration file:

```powershell
npm.cmd run db:push
```

Create a development migration:

```powershell
npm.cmd run prisma:migrate
```

Reset database and run the configured seed script:

```powershell
npm.cmd run db:reset
```

Run only the seed script:

```powershell
npm.cmd run db:seed
```

Apply production migrations:

```powershell
npm.cmd run db:deploy
```

## Product Areas

- Public landing page at `/`.
- Authenticated dashboard at `/dashboard`.
- Tour generator, saved tour history and tour details.
- Restaurant explorer, restaurant detail, reviews and favorites.
- Smart food map with OpenStreetMap and browser geolocation.
- Shared background music player that reads real files from the project `music` folder.
- Admin Panel at `/admin` for admin-only demo data operations.

## Demo Data Policy

The seed data created in Phase 3 must be marked as fictitious demo data. Restaurant names should sound natural but must not be presented as real businesses.

Priority cities for demo data:

- Ha Noi
- Ho Chi Minh City
- Da Nang
- Hoi An
- Hue
- Nha Trang
- Da Lat
- Can Tho
- Phu Quoc
- Sa Pa

## Demo Accounts

Development demo accounts are created by the Phase 3 seed script:

- `admin@foodtour.demo`
- `moderator@foodtour.demo`
- `user@foodtour.demo`

Development-only password for all demo accounts:

```text
FoodTour@123
```

Seed output target:

- 10 tourist cities.
- 60 fictitious demo restaurants.
- About 240 demo menu items.
- 100 demo users.
- 300 demo reviews.
- 40 demo food tours.
- Background music files from the project `music` folder.

Do not use the demo password or demo data policy in production.

## Authentication

Implemented routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Protected pages:

- `/dashboard` requires a signed-in user.
- `/admin` requires the `ADMIN` role.
- App navigation uses `/dashboard` as the signed-in entry point. The public `/` page is not shown as a primary app nav item.
- The `Admin Panel` nav item is only shown to admin users.

Auth uses an httpOnly cookie named `foodtour_session`. The frontend does not store the token in `localStorage`.

Quick demo:

1. Start PostgreSQL and seed the database.
2. Start the development server.
3. Open `http://localhost:3000/login`.
4. Use `admin@foodtour.demo` / `FoodTour@123` to access `/admin`.
5. Use `user@foodtour.demo` / `FoodTour@123` to confirm `/admin` redirects back to `/dashboard`.

## Restaurant Core

Implemented pages:

- `/restaurants`
- `/restaurants/:slug`

Implemented read APIs:

- `GET /api/cities`
- `GET /api/restaurants`
- `GET /api/restaurants/:idOrSlug`
- `GET /api/restaurants/:idOrSlug/menu`
- `GET /api/restaurants/:idOrSlug/reviews`

Restaurant list query parameters:

- `q`
- `city`
- `type`
- `priceRange`
- `vegetarian=true`
- `spicy=true`
- `minRating`
- `page`
- `limit`

Example:

```text
http://localhost:3000/restaurants?city=Hue&priceRange=BUDGET
```

## Smart Map

Implemented page:

- `/map`

Implemented map/routing API:

- `POST /api/maps/route`

Map behavior:

- Leaflet interactive map.
- OpenStreetMap tile layer with visible attribution.
- Restaurant markers from seeded database records.
- Marker popup with price/rating/detail link.
- Synchronized restaurant list and selected marker.
- Search/filter by text, city and restaurant type.
- Browser geolocation button for current user location.
- The My Location control recenters the map to the device location with a close zoom.
- Route preview line for the first filtered stops.
- Haversine fallback distance estimate. No external routing/geocoding API is required for the MVP demo.

Example route fallback request:

```powershell
$body = @{
  transportMode = "MOTORBIKE"
  points = @(
    @{ latitude = 16.4637; longitude = 107.5909 },
    @{ latitude = 16.47; longitude = 107.60 }
  )
} | ConvertTo-Json -Depth 4

Invoke-WebRequest -Uri "http://localhost:3000/api/maps/route" -Method Post -Body $body -ContentType "application/json"
```

## Recommendation Engine

Implemented endpoint:

- `POST /api/recommendations/generate`

The MVP engine is a rule-based and weighted recommendation engine. It is not presented as Machine Learning.

The engine performs:

- Allergy filtering.
- Vegetarian filtering.
- Max-distance filtering.
- Opening-hours validation per planned stop time.
- Budget validation for group size.
- Preference/tag scoring.
- Rating, distance, budget and meal-type scoring.
- Diversity penalty to avoid overly similar stops.
- Nearest-neighbor route ordering with Haversine distance.

Example:

```powershell
$body = @{
  cityName = "Hue"
  startAddress = "Hue demo start"
  startLatitude = 16.4637
  startLongitude = 107.5909
  startAt = "2026-07-27T07:30:00+07:00"
  durationHours = 10
  numberOfDays = 1
  budget = 600000
  numberOfPeople = 2
  transportMode = "MOTORBIKE"
  preferences = @("local-food", "noodle", "coffee")
  vegetarian = $false
  allergies = @()
  desiredStops = 4
  maxDistanceKm = 20
  mealTypes = @("BREAKFAST", "LUNCH", "SNACK", "DINNER")
} | ConvertTo-Json -Depth 5

Invoke-WebRequest -Uri "http://localhost:3000/api/recommendations/generate" -Method Post -Body $body -ContentType "application/json"
```

Run recommendation unit tests:

```powershell
npm.cmd run test
```

## Food Tour User Flow

Implemented pages:

- `/tour-generator`
- `/tours`
- `/tours/:id`

Implemented APIs:

- `POST /api/food-tours/generate`
- `GET /api/food-tours`
- `POST /api/food-tours`
- `GET /api/food-tours/:id`
- `POST /api/food-tours/:id/clone`
- `DELETE /api/food-tours/:id`

Behavior:

- The generator page requires login.
- The server generates and saves tours; the client does not decide totals.
- Saved tour history is scoped to the current user.
- Dashboard mini map focuses on the latest saved tour when one exists, and only falls back to device location when there are no saved route points.
- Tour detail shows timeline, stop reasons, estimated cost, travel time and distance.
- Clone creates a new saved copy.
- Delete uses soft delete by setting `deletedAt` and archiving the tour.

## Reviews, Favorites and Background Music

Implemented pages:

- `/favorites`

Implemented APIs:

- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:restaurantId`
- `POST /api/restaurants/:id/reviews`
- `PATCH /api/reviews/:id`
- `DELETE /api/reviews/:id`
- `GET /api/background-music`
- `GET /api/background-music/:track`

Behavior:

- Signed-in users can favorite/unfavorite restaurants.
- Favorites are scoped to the current user.
- Signed-in users can create or update one review per restaurant.
- Signed-in users can delete their own review.
- Restaurant average rating and rating count are recalculated server-side.
- The shared background music player is mounted once in the root layout.
- Music state is persisted in the browser: enabled/disabled and volume.
- Tracks are discovered from real audio files in the project `music` folder and streamed through API routes.

## Admin Module

Implemented page:

- `/admin`

Implemented APIs:

- `GET /api/admin/dashboard`
- `GET /api/admin/restaurants`
- `POST /api/admin/restaurants`
- `PATCH /api/admin/restaurants/:id`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/reviews`
- `PATCH /api/admin/reviews/:id`

Behavior:

- Admin page and APIs require the `ADMIN` role.
- Admin Panel has a direct `Back to Dashboard` action.
- Admin dashboard shows key counts and recent review/tour activity.
- Admin can create demo restaurants and edit core fields.
- Admin can hide or restore restaurants through `isActive`.
- Admin can lock/unlock users and change user roles, except locking the current admin account.
- Admin can publish, hide or flag reviews.
- Review moderation writes `ModerationAction` audit records.

## Release Readiness

Implemented reliability and demo assets:

- App-level loading UI.
- App-level runtime error retry UI.
- App-level 404 page.
- Health check validates database connectivity at `/api/health`.
- Production environment template: `.env.production.example`.
- Deployment checklist: `docs/deployment-checklist.md`.
- Presentation demo script: `docs/demo-script.md`.
- Final QA checklist: `docs/final-qa-checklist.md`.
- Vercel build config: `vercel.json`.
- Node version hint: `.nvmrc`.
