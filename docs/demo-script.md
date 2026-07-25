# Demo Script

Use this flow for a 5 to 8 minute project presentation.

## 1. Opening

FoodTour Generator helps travelers plan local Vietnamese food routes across major tourist cities. The demo uses fictitious data for Ha Noi, Ho Chi Minh City, Da Nang, Hoi An, Hue, Nha Trang, Da Lat, Can Tho, Phu Quoc and Sa Pa.

## 2. Public Browsing

1. Open `/`.
2. Open `/restaurants`.
3. Filter by city and price range.
4. Open a restaurant detail page.
5. Show menu, cultural story, reviews and favorite button.

## 3. Smart Map

1. Open `/map`.
2. Filter by city.
3. Click markers and compare the synchronized list.
4. Show route preview line.
5. Explain that routing uses a Haversine fallback for MVP reliability.

## 4. Food Tour Generation

1. Sign in with `user@foodtour.demo` / `FoodTour@123`.
2. Open `/tour-generator`.
3. Choose Hue or Da Nang, budget, time, people and preferences.
4. Generate a tour.
5. Save the tour and open `/tours`.
6. Open the tour detail page and show stop reasons, estimated cost, time and distance.

## 5. Favorites, Reviews and Soundscape

1. Favorite a restaurant from the detail page.
2. Open `/favorites`.
3. Submit or update a review.
4. Open `/soundscape` and show city-based sample metadata.

## 6. Admin Module

1. Sign in with `admin@foodtour.demo` / `FoodTour@123`.
2. Open `/admin`.
3. Show dashboard statistics.
4. Hide and restore a restaurant.
5. Lock/unlock a non-admin user.
6. Publish/hide/flag a review and mention moderation audit records.

## 7. Technical Summary

- Next.js App Router for frontend and backend route handlers.
- Prisma and PostgreSQL for relational data.
- HTTP-only JWT cookie auth with role guards.
- Rule-based recommendation engine with unit tests.
- Leaflet and OpenStreetMap for map UI.
- Deployment-ready environment examples and health check.

## 8. Known Limits

- No LLM integration in MVP.
- No real payment, OCR, social login or production audio assets.
- Route distance is estimated unless an external routing provider is added later.
