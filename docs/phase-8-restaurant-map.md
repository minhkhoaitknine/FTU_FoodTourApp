# Phase 8 - Restaurant And Map

Phase 8 improves the restaurant browsing and map experience while preserving
existing backend behavior and API contracts.

## Classification

Change level: medium, non-breaking.

Rationale:

- Refactors restaurant and map UI components.
- Keeps existing service calls and query schema.
- Does not change Prisma schema, migrations, route names or endpoint contracts.

## Implemented

Restaurant list:

- Refactored restaurant cards with real images, semantic badges and clearer
  detail CTA.
- Updated filter panel to use shared UI primitives.
- Added clear filters action.
- Updated listing header and pagination styling to match the app shell.
- Preserved existing search, city, type, price, rating, vegetarian and spicy
  filters.

Restaurant detail:

- Uses semantic badges and surfaces.
- Adds food image fallback usage in menu item cards.
- Keeps review, favorite, menu and opening-hours behavior.

Map:

- Rebuilt `SmartFoodMap` with the same public props.
- Fixed map focus side effect by moving `setView` into `useEffect`.
- Replaced broken marker text with stable marker content.
- Added restaurant images to the synchronized list.
- Improved filter controls, selected state, empty state and route summary.
- Kept Leaflet, OSM tile attribution and Haversine route fallback.

## Backend/API/Database Impact

Backend impact: none.

API impact: none.

Database impact: none.

Migration required: no.

## Edge Cases Covered

- No matching map/list restaurants shows an inline empty state.
- Browser geolocation unavailable or denied shows an inline error.
- Broken or missing restaurant images fall back through the asset resolver.
- Map detail is not the only access path; each list item and popup still links
  to restaurant detail pages.

## Remaining Work

- Phase 9 should bring favorites/history/soundscape into the same visual system.
- Later responsive QA should inspect Leaflet height and mobile bottom navigation
  together on small screens.
