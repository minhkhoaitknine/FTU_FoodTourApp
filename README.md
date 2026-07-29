# FoodTour App

FoodTour is a full-stack web application for planning Vietnamese food tours across major travel cities. It combines a restaurant explorer, map-based discovery, rule-based itinerary generation, saved tours, reviews, favorites, profile management, admin operations and a shared background music player.

The current version is prepared for public Vercel deployment with PostgreSQL/Neon and seeded demo data.

## Highlights

- Authenticated dashboard with the user's profile avatar and latest saved route.
- Restaurant explorer with search, filters, pagination, ratings, images and detail pages.
- Smart food map powered by Leaflet/OpenStreetMap and browser geolocation.
- Rule-based food tour generator using budget, distance, schedule, transport, dietary preference and tags.
- Editable saved tour plans with add/remove/reorder/update stop controls.
- Favorites and one-review-per-restaurant user flow.
- Profile page with display name, email, password update and upload/crop avatar from the device.
- Shared background music player mounted once across the app, with persisted mute/volume/track state.
- Admin Panel for restaurants, users and reviews.
- Moderator workspace focused on review moderation.
- Production-oriented health check, preflight script, Vercel config and QA scripts.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Vitest
- Leaflet and OpenStreetMap

## Project Structure

```text
.
|-- music/                         # Real audio files used by the background music player
|-- prisma/
|   |-- schema.prisma              # PostgreSQL data model
|   |-- migrations/                # Production database migrations
|   `-- seed.ts                    # Reproducible demo data
|-- public/images/brand/           # App logo and shared background image
|-- scripts/preflight.ts           # Deployment readiness checks
|-- src/
|   |-- app/                       # Next.js routes and API routes
|   |-- components/                # UI, layout, admin, map, music, profile and tour components
|   |-- lib/                       # Auth, db, formatting, assets and music helpers
|   `-- services/                  # Domain services and validation schemas
|-- docker-compose.yml             # Local PostgreSQL
|-- vercel.json                    # Vercel build config
`-- package.json
```

## Main Routes

| Route | Purpose |
| --- | --- |
| `/` | Public entry page. Signed-in users are guided into the dashboard flow. |
| `/login`, `/register` | Authentication pages. |
| `/dashboard` | Main signed-in dashboard and latest saved route preview. |
| `/restaurants` | Restaurant explorer with filters and pagination. |
| `/restaurants/[slug]` | Restaurant details, menu, reviews and favorite actions. |
| `/map` | Interactive food map with restaurant markers and device location. |
| `/tour-generator` | Generate and edit a food tour plan. |
| `/tours`, `/tours/[id]` | Saved tour history and details. |
| `/favorites` | Current user's favorite restaurants. |
| `/profile` | User profile, avatar upload/crop, email and password settings. |
| `/admin` | Admin Panel or Moderator workspace depending on role. |

## API Surface

### Authentication and Profile

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PATCH /api/profile`

### Restaurants, Reviews and Favorites

- `GET /api/cities`
- `GET /api/restaurants`
- `GET /api/restaurants/[idOrSlug]`
- `GET /api/restaurants/[idOrSlug]/menu`
- `GET /api/restaurants/[idOrSlug]/reviews`
- `POST /api/restaurants/[idOrSlug]/reviews`
- `PATCH /api/reviews/[id]`
- `DELETE /api/reviews/[id]`
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/[restaurantId]`

### Tours and Recommendations

- `POST /api/recommendations/generate`
- `POST /api/food-tours/generate`
- `GET /api/food-tours`
- `POST /api/food-tours`
- `GET /api/food-tours/[id]`
- `POST /api/food-tours/[id]/clone`
- `DELETE /api/food-tours/[id]`

### Admin and Moderation

- `GET /api/admin/dashboard`
- `GET /api/admin/restaurants`
- `POST /api/admin/restaurants`
- `PATCH /api/admin/restaurants/[id]`
- `DELETE /api/admin/restaurants/[id]`
- `GET /api/admin/users`
- `PATCH /api/admin/users/[id]`
- `GET /api/admin/reviews`
- `PATCH /api/admin/reviews/[id]`

### System and Media

- `GET /api/health`
- `GET /api/background-music`
- `GET /api/background-music/[track]`

## Recommendation Engine

FoodTour currently uses a deterministic rule-based recommendation engine, not an external LLM API.

The engine evaluates:

- city and restaurant availability
- requested meal stops
- opening hours
- budget and number of people
- vegetarian and spicy preferences
- allergies
- preferred tags/cuisines
- distance from the start point
- rating and diversity between stops

Routes use Haversine distance estimates for the MVP. The map uses OpenStreetMap tiles and does not require a paid map provider.

## Roles and Permissions

| Role | Capabilities |
| --- | --- |
| `USER` | Create tours, save tours, review restaurants, manage favorites and profile. |
| `MODERATOR` | Access moderation workspace and moderate reviews. |
| `ADMIN` | Full admin access for restaurant, user and review operations. |

Admin restaurant tools support creating and editing:

- restaurant core information
- uploaded restaurant image
- city, type, price range and location
- tags
- menu items
- vegetarian/spicy flags
- active/hidden state

Admin delete permanently removes a restaurant and dependent records such as images, menu, tags, reviews, favorites and saved tours that reference that restaurant. Use it carefully.

## Background Music

The old Soundscape UI flow has been removed from the app experience. The current app uses one shared background music player mounted in the root layout.

Behavior:

- Reads real files from the project `music/` folder.
- Plays tracks in order.
- Loops back to the first track after the final track.
- Persists enabled/muted state, volume, collapsed state and selected track in browser storage.
- Avoids multiple overlapping players when navigating between pages.
- Handles browser autoplay restrictions by waiting for user interaction when needed.

To add music, place a supported audio file in `music/` and redeploy. Do not add fake placeholder audio files.

## Demo Data

The seed script creates fictitious demo data for Vietnamese travel cities. Restaurant names are demo records and should not be presented as real businesses.

Priority cities:

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

Demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@foodtour.demo` | `FoodTour@123` |
| Moderator | `moderator@foodtour.demo` | `FoodTour@123` |
| User | `user@foodtour.demo` | `FoodTour@123` |

Seed targets:

- 10 cities
- 60+ demo restaurants
- 240+ menu items
- 100+ demo users
- 300+ reviews
- 40+ saved food tours

## Local Development

Install dependencies:

```powershell
npm.cmd install
```

Create a local env file:

```powershell
Copy-Item .env.example .env
```

For local Docker PostgreSQL, keep this value in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/foodtour?schema=public"
```

Start PostgreSQL:

```powershell
docker compose up -d
```

Generate Prisma Client:

```powershell
npm.cmd run prisma:generate
```

Apply schema and seed demo data:

```powershell
npm.cmd run db:push
npm.cmd run db:seed
```

Start the dev server:

```powershell
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

Use `npm.cmd` on Windows to avoid PowerShell execution policy issues with `npm.ps1`.

## Environment Variables

Required:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string. Use Neon/Supabase/Railway/etc. in production. |
| `AUTH_SECRET` | Long random secret used to sign auth sessions. |
| `NEXT_PUBLIC_APP_URL` | Public base URL of the app. |

Optional:

| Variable | Description |
| --- | --- |
| `OPENROUTESERVICE_API_KEY` | Reserved for optional external routing. Not required for the current MVP. |
| `ENABLE_EXTERNAL_ROUTING` | Optional routing flag. Keep `false` unless external routing is intentionally enabled. |

When entering values in the Vercel dashboard, do not wrap values in quotation marks.

## Useful Commands

| Command | Purpose |
| --- | --- |
| `npm.cmd run dev` | Start local development server. |
| `npm.cmd run build` | Build production Next.js app. |
| `npm.cmd run start` | Start production server after build. |
| `npm.cmd run typecheck` | Run TypeScript checks. |
| `npm.cmd run lint` | Run ESLint. |
| `npm.cmd run test` | Run Vitest unit tests. |
| `npm.cmd run preflight` | Check env, database, seed data and music files. |
| `npm.cmd run prisma:generate` | Generate Prisma Client. |
| `npm.cmd run db:push` | Push schema to local/dev database. |
| `npm.cmd run prisma:migrate` | Create a development migration. |
| `npm.cmd run db:deploy` | Apply migrations in production. |
| `npm.cmd run db:seed` | Seed demo data. |
| `npm.cmd run db:reset` | Reset database and run seed. |

## Deployment

The project is configured for Vercel:

- `vercel.json` uses `npm install` and `npm run build`.
- `postinstall` runs `prisma generate`.
- Recommended Vercel region is `sin1`.
- Use a managed PostgreSQL database such as Neon for public deployment.

Before deploying:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
npm.cmd run preflight
```

Redeploy through GitHub/Vercel:

```powershell
git status
git add .
git commit -m "feat: polish FoodTour release"
git push origin main
```

Vercel will automatically create a new production deployment from `main`.

After deployment:

1. Confirm the new Vercel deployment status is `Ready`.
2. Open the production URL.
3. Visit `/api/health`.
4. Log in with a demo account.
5. Check dashboard, restaurants, map, tour generator, profile avatar upload/crop, music controls and admin/moderation pages.

## Quality Gate

Latest local validation used for this release candidate:

- TypeScript: pass
- ESLint: pass
- Vitest: pass
- Production build: pass
- Preflight against Neon: pass
- Production dependency audit: 0 high-severity runtime vulnerabilities

## Notes

- User-uploaded restaurant and avatar images are currently stored as compressed data URLs for the MVP. A production-scale version should move uploaded media to object storage.
- The app does not require a Gemini/OpenAI/LLM key. The tour generator is rule-based.
- The legacy `Soundscape` database model may still exist from the initial schema, but the current user-facing audio system is the shared background music player.
