# Phase 6 - Main Dashboard

Phase 6 replaces the simple protected-route link grid with a data-driven
Tastetrail dashboard. It keeps existing backend routes, Prisma schema and API
contracts unchanged.

## Classification

Change level: medium, non-breaking.

Rationale:

- Refactors one page layout.
- Adds one focused dashboard component.
- Uses existing services and database data.
- Does not change auth, recommendation logic, schema or API contracts.

## Implemented

Dashboard now shows:

- Primary actions: create tour, explore places, logout.
- Latest saved tour when available.
- Starter route preview from top demo restaurants when no saved tour exists.
- Timeline with stop time, image, rating, tags and cost.
- Summary metrics: estimated cost, travel/dining time, distance and stop count.
- Lightweight map/route preview using actual coordinates.
- Account panel with quick links to tour history and favorites.

## New Component

```text
src/components/dashboard/dashboard-route-preview.tsx
```

This component projects route coordinates into a lightweight visual map preview.
It intentionally does not replace `/map`, which remains the full interactive
Leaflet experience.

## Data Sources

The page uses:

- `requireUser`
- `listUserFoodTours`
- `getUserFoodTour`
- `listMapRestaurants`

Data behavior:

- If the user has saved tours, the latest tour drives the dashboard.
- If not, the dashboard uses high-rated demo restaurants as a preview.
- Restaurant images come from the Phase 2 resolver.
- City background comes from Phase 5 through `AppShell`.

## Backend/API/Database Impact

Backend impact: none.

API impact: none.

Database impact: none.

Migration required: no.

## UX Changes

Removed:

- Generic link-only dashboard.
- Repeated route/debug wording.

Added:

- Clear hierarchy: header, timeline, summary, route preview.
- One primary action for tour creation.
- Secondary action for restaurant exploration.
- Useful empty/fallback state.

## Remaining Work

- Phase 7 should refactor the generator form so the "Create tour" action lands
  in a cleaner workflow.
- Dashboard visual QA should be repeated after map/tour pages are refactored.
- The route preview is intentionally lightweight; detailed marker interaction
  remains in `/map`.
