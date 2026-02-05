# Plan: Move Counter Cards to Bottom of Hero (Above the Fold)

## Goal

Place the metric counter cards (7 yrs Building Products, 4 0→1 Launches, 27M+ Revenue, 3X Conversion) at the **bottom of the hero section** so they are visible above the fold without scrolling.

## Current State

- **Hero** (`components/home/Hero.tsx`): Renders the about copy + CTA and hero image inside `section.section-spacing-large` → `floating-section` → `floating-section__content`.
- **Counters** (`components/home/Counters.tsx`): Renders a separate `section` with a constrained-width wrapper and a 4-column grid of `CounterCard` components. This section appears **after** Featured Work on the home page (`app/page.tsx`), so it’s below the fold.

## Implementation Plan

### 1. Add counter cards inside the Hero component

- **File:** `components/home/Hero.tsx`
- **Actions:**
  - Import `CounterCard` from `@/components/ui/CounterCard`.
  - At the bottom of `floating-section__content`, after the existing flex row (bio + image), add a block that renders the same four metrics in a responsive grid:
    - 7 yrs – BUILDING PRODUCTS
    - 4 – 0->1 PRODUCT LAUNCHES
    - 27 M+ – REVENUE IMPACTED
    - 3 X – TRIAL-TO-PAID CONVERSION
  - Use the same `CounterCard` props as in `Counters.tsx` (`variant="dark-accent"`, same `start`/`stop`/`label`/`valueSuffix`).
  - Reuse the same grid layout: `grid gap-6 sm:grid-cols-4` so it stays consistent on small and large screens.
  - Add spacing between the hero content (bio + image) and the counter grid (e.g. `mt-10` or `mt-12`) so the metrics sit clearly at the “bottom” of the hero block and align with the rest of the hero visually.

### 2. Align width and padding with site layout

- The current Counters section uses:
  - `w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] lg:w-[calc(100%-4rem)] xl:w-[calc(100%-6rem)] 2xl:w-[calc(100%-8rem)] max-w-[90rem] mx-auto`
  - Inner padding: `py-8 px-6 sm:py-12 sm:px-8 lg:py-16 lg:px-10`
- **Options:**
  - **A (recommended):** Wrap only the new counter grid in a div that uses the same max-width and horizontal padding as the rest of the main content (e.g. the same utility classes as above, or a shared container class if one exists). This keeps the counters aligned with other sections and avoids full-bleed width inside the hero.
  - **B:** Use the hero’s existing content width (no extra wrapper) and rely on the hero’s padding so the grid matches the bio/image column. Simpler but may differ from Counters section width.

Choose one and apply consistently so the counters don’t look misaligned with the page.

### 3. Remove the standalone Counters section from the home page

- **File:** `app/page.tsx`
- **Actions:**
  - Remove the `<Counters />` import and the `<Counters />` usage from the main content order (so the order becomes: Hero, Strengths, FeaturedWork, Approach, Testimonials).
  - This avoids duplicate metrics and keeps a single source of truth in the hero.

### 4. Handle the Counters component (optional)

- **Option A:** Leave `components/home/Counters.tsx` in the codebase but unused (in case you want to reuse it elsewhere or revert).
- **Option B:** Delete `Counters.tsx` and rely entirely on the hero-embedded counters. Prefer this if you’re sure the counters will only ever live in the hero.

### 5. Verify above-the-fold behavior

- **Check:**
  - On desktop and mobile, the hero section (about + image + counter grid) fits in the first viewport so users see the metrics without scrolling (or with minimal scroll).
  - CounterCard animations still run (they use `IntersectionObserver` with `threshold: 0.35`); with the cards in the hero they should trigger as soon as the hero is in view.
  - If the hero becomes too tall on small screens, consider slightly reducing padding or font size only for the hero section on small viewports, or allow one small scroll to the counters—your call based on design.

### 6. Accessibility and semantics

- The counters are now part of the hero section. No need for an extra `<section>` or heading for them unless you want a visually hidden label for screen readers (e.g. “Key metrics”). Optional: add `aria-label="Key metrics"` to the counter grid container if it improves context.

---

## Summary Checklist

- [ ] Hero: import `CounterCard` and render the four cards in a grid at the bottom of `floating-section__content`.
- [ ] Hero: add top margin and width/padding so the grid aligns with the rest of the layout.
- [ ] Page: remove `<Counters />` from `app/page.tsx`.
- [ ] Optional: remove or keep `Counters.tsx`.
- [ ] Test viewport and animation behavior; tweak hero height if needed.
