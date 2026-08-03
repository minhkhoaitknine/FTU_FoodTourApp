# Tastetrail Asset Resolver

Phase 2 makes the provided demo images available to the browser and centralizes
image fallback rules. It does not change the database schema or API contracts.

## Public Asset Layout

The source images remain in the user-provided `image/` directory. Deployable
copies live under `public/`:

```text
public/images/demo/
  city/        18 files
  food/        25 files
  restaurant/ 60 files
```

Next.js serves files in `public/` from the site root, so an asset such as:

```text
public/images/demo/restaurant/Hoi An Morning Noodle House.jpg
```

is available in the app as:

```text
/images/demo/restaurant/Hoi%20An%20Morning%20Noodle%20House.jpg
```

## Resolver Rules

The resolver is implemented in `src/lib/assets/image-resolver.ts`.

Restaurant image priority:

1. Exact restaurant name match against `public/images/demo/restaurant`.
2. Non-legacy `imageUrl` from the backend.
3. Food fallback based on restaurant name or tags.
4. Default Vietnamese food image.

City image priority:

1. Exact city name.
2. City variants with suffix `1`, `2`, or `3`.
3. Default Hoi An city background.

Food image priority:

1. Exact menu/food name.
2. Keyword fallback from tags such as `coffee`, `dessert`, `seafood`,
   `vegetarian`, `banh mi`, or `noodle`.
3. Default pho image.

The old seed path `/images/demo/restaurants/<slug>.jpg` is treated as legacy
because those files do not exist in the provided asset set. Existing database
records can stay unchanged while the UI resolves a usable image.

## AppImage

`src/components/common/app-image.tsx` wraps `next/image` with:

- Lazy loading by default.
- Stable aspect ratio through the parent wrapper.
- `object-cover` rendering.
- Alt text requirement.
- One-step fallback if the source image fails.
- Responsive `sizes` support.

## Current Integrations

- `src/components/restaurants/restaurant-card.tsx`
- `src/app/restaurants/[slug]/page.tsx`

Later phases can reuse the same resolver for dashboard timelines, tour stops,
city backgrounds, favorites, map popups and admin previews.

## Remaining Work

- Convert large JPG/PNG/JFIF files to responsive WebP or AVIF variants.
- Add city background integration in Phase 5.
- Add food/menu item image usage when the tour timeline is refactored.
- Replace or verify any assets that contain third-party branding before public
  presentation if licensing is uncertain.
