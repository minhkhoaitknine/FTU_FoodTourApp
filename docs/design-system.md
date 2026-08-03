# Tastetrail Design System

This document is the source of truth for the visual primitives introduced in
Phase 1. It keeps the current Tailwind stack and adds no runtime dependency.

## Principles

- Warm Vietnamese food-travel character without a one-color interface.
- Content-first layouts with restrained decoration.
- Bright, readable surfaces over city photography.
- Stable dimensions and no layout shift during loading or interaction.
- One primary action per working area.
- Motion supports state changes and never blocks interaction.

## Color

Semantic tokens live in `src/app/globals.css` and are exposed through Tailwind:

| Purpose | Tailwind token | Use |
| --- | --- | --- |
| Page canvas | `bg-canvas` | Base page background |
| Main surface | `bg-surface` | Sections and quiet panels |
| Raised surface | `bg-surface-elevated` | Cards, menus and dialogs |
| Primary text | `text-content` | Headings and body |
| Secondary text | `text-content-muted` | Supporting metadata |
| Brand | `bg-brand`, `text-brand` | Primary action and selected state |
| Success | `bg-success`, `text-success` | Open, available and completed |
| Information | `bg-info`, `text-info` | Map and neutral information |
| Warning | `bg-warning`, `text-warning` | Constraints and partial data |
| Danger | `bg-danger`, `text-danger` | Errors and destructive actions |
| Border | `border-line` | Default separation |

`clay`, `leaf` and `ink` remain available temporarily for old screens. New and
refactored components must use semantic tokens.

## Typography

- Font stack: Segoe UI, Noto Sans, Arial, Helvetica, sans-serif.
- Display: `text-display`, 40px.
- Page title: `text-page-title`, 32px.
- Section title: `text-section-title`, 24px.
- Card title: `text-card-title`, 18px.
- Body: 16px; supporting text: 14px; labels: 12px or 14px.
- Letter spacing stays at zero. Uppercase labels should not add tracking.
- Hero-scale text is reserved for genuine hero content.

## Spacing And Shape

The spacing base is 4px. Prefer Tailwind values `1, 2, 3, 4, 5, 6, 8, 10, 12`.
Page gutters are 16px on mobile, 24px on tablet and 32px on desktop.

- Standard radius: `rounded-app` (8px).
- Compact radius: `rounded-app-sm` (6px).
- Pills are limited to badges, avatars and status controls.
- `shadow-panel` is the default raised surface shadow.
- `shadow-lift` is reserved for hover or selected items.
- Do not nest decorative cards.

## Components

### Button

Use `Button` from `@/components/ui`.

- `primary`: one main action in a working area.
- `secondary`: positive or progress action.
- `outline`: secondary command.
- `ghost`: toolbar or low-emphasis command.
- `danger`: destructive action after clear confirmation.
- `icon` size requires an accessible name through `aria-label`.
- `isLoading` disables the control and exposes `aria-busy`.

### Form Controls

Use `Input`, `Select` and `Textarea`. States are `default`, `error` and
`success`. Labels and error/help text remain the responsibility of the field
composition. Connect errors with `aria-describedby`.

### Card

Use a card only for an individual repeated item or a genuinely framed tool.
Variants are `elevated`, `surface`, `muted` and `inverse`. Page sections remain
unframed full-width bands where possible.

### Badge

Badges communicate status or compact metadata. Variants are `neutral`, `brand`,
`success`, `info`, `warning` and `danger`. Do not use badges as decoration.

## Breakpoints

| Name | Width | Intended use |
| --- | ---: | --- |
| `xs` | 480px | Larger phones |
| `sm` | 640px | Small tablet adjustments |
| `md` | 768px | Tablet layouts |
| `lg` | 1024px | Desktop shell |
| `xl` | 1280px | Timeline and map side by side |
| `2xl` | 1536px | Wide desktop max-width behavior |

Mobile layouts are designed independently. Do not preserve desktop density by
shrinking controls or type.

## Motion And Layering

- Fast feedback: `duration-fast` (150ms).
- Standard transitions: `duration-normal` (250ms).
- Drawer/modal transitions: `duration-slow` (350ms).
- City background crossfade: `duration-background` (1200ms).
- Respect `prefers-reduced-motion`; global CSS removes non-essential motion.
- Layers: `z-base`, `z-sticky`, `z-dropdown`, `z-overlay`, `z-modal`, `z-toast`.

Avoid continuous card animation, strong parallax and animation that moves text
while it is being read.

## Accessibility

- Interactive controls target at least 44px in their default size.
- Every icon-only button requires `aria-label`.
- Use semantic focus rings and never remove focus without a replacement.
- Color cannot be the only status indicator.
- Audio never autoplays.
- Timeline/list content must remain available when the map fails.

## Migration Rule

Existing screens continue to use legacy utilities until their roadmap phase.
When a screen is refactored, replace `clay`, `leaf`, arbitrary radii and copied
button/input classes with the semantic tokens and primitives documented here.
