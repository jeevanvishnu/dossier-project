# UI Plan — ECTC Professional Services Website

> **Design Read:** B2B professional service website for trust-seeking clients, with a clean/structured editorial language, leaning toward a grounded layout system. References: ui.md design tokens.
> **Site Purpose:** Communicate clearly how the service works. Build trust. Drive qualified inquiries.
> **Dials:** `DESIGN_VARIANCE: 5` | `MOTION_INTENSITY: 3` | `VISUAL_DENSITY: 4`

---

## Part 1 — Page Architecture

### Pages (Planned)

| Route | Purpose |
|---|---|
| `/` | Home — service overview, trust signals, process, CTA |
| `/about` | About — team, credentials, mission |
| `/pricing` | Pricing — transparent service tiers |
| `/contact` | Contact — inquiry form + contact details |
| `/signin` | Sign In — client portal access |

### Section Layout Plan (Home Page)

The home page uses at least 5 different layout families across its sections — no two consecutive sections share the same composition pattern.

| # | Section | Layout Family | Purpose |
|---|---|---|---|
| 1 | Navigation | Sticky horizontal nav | Site entry point |
| 2 | Hero | Split (left-aligned content / right asset) | Value proposition + primary CTA |
| 3 | Credibility bar | Logo strip / statistics row | Trust signal |
| 4 | Services overview | 3-column card grid | What we do |
| 5 | How it works | Vertical numbered steps | Process clarity |
| 6 | Why us | Left-text / right-feature alternating (max 2) | Differentiation |
| 7 | Testimonials | Horizontal scroll / stacked quote cards | Social proof |
| 8 | CTA block | Full-width centered call-to-action | Conversion |
| 9 | Footer | Multi-column footer | Navigation, legal, contact |

> EYEBROW COUNT: Max 3 overlines across 9 sections (ceiling of 9/3). Used on sections 2, 5, and 9 only.

---

## Part 2 — Responsive Design Principles

All principles below describe the **intentional mobile-first layout** — not a shrunken desktop. Each element is designed for the smallest screen first and progressively enhanced.

---

### 2.1 Navigation

**Mobile (< 640px)**
- Full-screen drawer/overlay triggered by a hamburger icon (24x24px, `--color-primary`).
- Logo on the left, hamburger on the right. Nav links are hidden.
- Drawer opens from the right with `300ms` ease transition.
- Links inside drawer: `text-lg`, `py-4` per item, full-width touchable target (min 44px height).
- Primary CTA button inside the drawer at the bottom, full-width, pill shape.
- Drawer closes on link tap or backdrop tap.
- No nested dropdowns on mobile — flatten to single-level.

**Tablet (640–1023px)**
- Logo + abbreviated nav items (max 4 visible) + CTA button inline.
- Remaining items collapse into a `...` overflow menu or hamburger if items exceed space.
- Nav height: 56–64px, sticky, `background: rgba(248,250,252,0.96) blur(8px)` on scroll.

**Desktop (1024px+)**
- Full horizontal nav: Logo left / Nav links center-left / CTA button right.
- Nav height: 64px max (never 80px+).
- Nav renders on ONE line. No wrapping.
- Active page link uses `--color-accent` with `2px` underline.
- Hover: color transitions to `--color-accent` in `150ms`.
- Sticky with subtle `--shadow-xs` on scroll.

---

### 2.2 Typography

**Mobile**
- Display H1: `clamp(1.875rem, 7vw, 2.5rem)` — NOT the desktop clamp. Reduce further at 375px if headline wraps > 3 lines.
- Body: `1rem` / `leading-relaxed`.
- Max line-length: enforced by container width (full width with `px-4`). No explicit `max-w` needed since column is narrow.
- No tight tracking on mobile. `letter-spacing: -0.01em` max.

**Tablet**
- H2 steps up to the clamp midpoint.
- Body stays `1rem` — do not inflate body text on tablet.
- Lead paragraphs: `1.0625rem`.

**Desktop**
- Full display scale as defined in `ui.md` section 2.
- `max-w-[65ch]` on all body/lead paragraphs. Enforced.
- Headlines can use tighter tracking (`-0.02em`).

**Cross-breakpoint rules**
- Headings always use Lexend. Body always Source Sans 3. No font-family swap between breakpoints.
- Use `clamp()` for fluid type scaling — no hard breakpoint font-size jumps.
- Line height stays consistent. Do not increase leading on mobile.

---

### 2.3 Spacing

**Mobile**
- Section padding: `py-12` (48px vertical).
- Container side padding: `px-4` (16px). No smaller.
- Component gap: `gap-4` to `gap-6`.
- Card padding: `p-5`.

**Tablet**
- Section padding: `py-16` (64px vertical).
- Container: `px-6`.
- Component gap: `gap-6`.

**Desktop**
- Section padding: `py-20` (80px vertical).
- Hero: `py-24` or `pt-32 pb-20`.
- Container: `px-8`, max-width `1400px`.
- Card padding: `p-6`.

**Rules**
- Spacing SCALES UP from mobile to desktop. Never the same value at all breakpoints.
- No `mt-` stacking between sections — sections self-contain their padding.
- Preserve consistent `gap` multiples within the same section across breakpoints.

---

### 2.4 Grids

**Mobile (< 640px)**
- Default: single column (`grid-cols-1`).
- All card grids collapse to 1 column.
- Two-column grid allowed ONLY for small items: icon + label pairs, stat pairs (2 stats side by side).
- No 3-column grids on mobile.
- Stacked sections replace side-by-side splits.

**Tablet (640–1023px)**
- 2-column grids for cards: `grid-cols-2`.
- Split sections (50/50): allowed.
- Feature rows: 2-column with image spanning full column.
- Process steps: single column with number + content inline.

**Desktop (1024px+)**
- Card grids: `grid-cols-3` or `grid-cols-4` depending on content.
- Full 12-column grid available for complex layouts.
- Asymmetric splits: `col-span-5` / `col-span-7` or `col-span-6` / `col-span-6`.

**Grid Rules**
- Always use `CSS Grid` (`grid grid-cols-N gap-N`). Never flexbox percentage math.
- No empty grid cells. N items = N cells. Reshape if items don't fill evenly.
- Declare mobile collapse in the SAME component as the desktop grid.

---

### 2.5 Images

**Mobile**
- Images stack below their text content (content-first order).
- `width: 100%`, `aspect-ratio: 16/9` or `4/3` maintained with `object-cover`.
- Use `next/image` with `fill` and a relative parent container to avoid layout shift.
- No decorative images on mobile that are purely compositional — hide with `hidden sm:block`.

**Tablet**
- Images appear alongside content in 2-column splits.
- Hero asset: full right column, `aspect-ratio: 1/1` or `4/5`.

**Desktop**
- Images use `next/image` with explicit `width` / `height` when in fixed containers, `fill` in fluid containers.
- Hero image: right half of the split, taller than wide.
- Section images: never stretched. Always `object-fit: cover`.

**Rules**
- Every image has `alt` text. Empty `alt=""` only for purely decorative images with no content value.
- No hand-rolled SVG illustrations as image replacements.
- Skeleton loader (`aspect-ratio` preserved) while image loads — prevents CLS.
- No overlaid text-on-image unless contrast is >= 4.5:1 with a scrim.

---

### 2.6 Buttons

**Mobile**
- Primary CTAs: `width: 100%` (full-width) in hero and form sections.
- Paired buttons (primary + outline): stack vertically, each full-width, `gap-3`.
- Min height: 44px (accessibility tap target).
- Font size: `1rem` minimum on mobile.

**Tablet**
- Buttons return to `width: auto` (inline/fit-content).
- Paired buttons sit side-by-side.

**Desktop**
- Unchanged from tablet. Padding `py-2.5 px-6` default.

**Rules**
- Label never wraps at any breakpoint.
- Buttons always have `cursor-pointer`.
- `:active` state: `scale(0.98)` with spring ease-back.
- All CTAs with same intent use the same label across the whole site. No `Get in touch` on hero and `Contact us` in footer — pick one.
- Ghost buttons over light backgrounds always have a visible `1px border`.

---

### 2.7 Cards

**Mobile**
- Single column. Full container width.
- Padding: `p-5`.
- Image above content (if card has an image).
- CTA link or button at card bottom, full-width on mobile.

**Tablet**
- 2-column grid. Cards side by side.
- Padding: `p-5`.

**Desktop**
- 3-column grid. Padding: `p-6`.
- Hover: `shadow-md` lifts + `translateY(-2px)` (subtle, 3px max — not dramatic).

**Rules**
- Cards use `--radius-lg` consistently. No mixing.
- No card shadows stacked 3 deep (`box-shadow` once per card).
- Card heading max 2 lines. Body text max 3–4 lines.
- Cards with interactive elements always have `cursor-pointer` and hover state.
- No empty cards. N cards = N pieces of content.

---

### 2.8 Sections

**Mobile**
- Every section is single-column by default.
- Section heading + body + content stack vertically.
- CTA at bottom of section, centered.
- No decorative side-elements that crowd the column.
- Background tint changes (`--color-surface-raised`) used to visually separate sections without extra margin.

**Tablet**
- 2-column layouts begin. Image + text splits activate.
- Section headings can be left-aligned (not always centered).

**Desktop**
- Full layout variety. Split screens, grids, step rows all active.
- Section headings: left-aligned by default. Center-aligned only for CTA/testimonial sections.

**Rules**
- Page theme is light throughout. No dark-mode section inversions mid-page (exception: deep navy footer).
- At least 4 different layout families used across the 8+ sections.
- No 3+ consecutive sections sharing the same layout pattern.
- Section-layout-repetition ban: a 3-col card grid cannot appear twice.

---

### 2.9 Forms

**Mobile**
- Single column. Each field full-width.
- Label above input (always).
- `gap-5` between field groups.
- Submit button: full-width, primary variant.
- Error messages: inline below the relevant field, never as a summary block at top.
- Input min-height: 44px.
- Keyboard type hints: `inputmode="tel"` on phone fields, `type="email"` on email, etc.

**Tablet**
- Two-column layout for short adjacent fields (e.g. First Name / Last Name).
- Submit button: right-aligned or full-width, consistent with overall form alignment.

**Desktop**
- Two-column grid for short fields. Single column for long fields (message, notes).
- Max-width of form container: `max-w-2xl` (center-aligned) or `max-w-3xl` (full section).

**Rules**
- No placeholder-as-label. Ever. WCAG failure.
- Focus ring visible on all inputs (`--shadow-focus`).
- All inputs pass 4.5:1 contrast (label vs background, placeholder vs background).
- Error text: `--color-error`, `Caption` size, below the field.
- Helper text: `--color-muted`, `Caption` size, below the field (above error).
- Loading state on submit: button disables + shows inline spinner, label changes to `Sending...`.
- Success state: inline confirmation, do not redirect.

---

## Part 3 — Component-Level Responsive Decisions

### Hero Section

**Mobile (< 640px)**
- Layout: Stacked. Content block (headline + subtext + CTA) fills full width.
- Hero image: below the text block, `aspect-ratio: 4/3`, full-width.
- Headline: `clamp(1.875rem, 8vw, 2.5rem)`, max 3 lines.
- Subtext: max 20 words, 2–3 lines.
- CTA: single primary button, full-width.
- No secondary CTA on mobile. Too crowded.
- No decorative background element.
- Min-height: `min-h-[100dvh]` (not `h-screen`).

**Desktop (1024px+)**
- Layout: 50/50 split. Left: content. Right: image or visual.
- Content left-aligned (not centered).
- Headline: `clamp(2.25rem, 5vw, 3.75rem)`, max 2 lines.
- Subtext: max 20 words, 3 lines max.
- CTA: primary + outline side-by-side.
- Hero image fills the right column, taller than wide, `object-cover`.

### Process / How It Works Section

**Mobile**
- Single column. Numbered steps stacked vertically.
- Step number as large display text (`--color-accent-light` bg circle).
- Step heading + 2-line description per step.
- Steps connected with a thin vertical line between them.

**Desktop**
- 3-column or 4-column grid of steps with a horizontal connecting line.
- OR vertical left-aligned steps with number column + content column (cleaner for 5+ steps).

### Testimonials Section

**Mobile**
- Single visible quote card (scroll-snap horizontal carousel, or stacked cards).
- 3 lines of quote max. Name + role below.
- Navigation dots below carousel.

**Desktop**
- 2 or 3 cards visible simultaneously in a grid.
- No carousel needed — show all at once if <= 3 testimonials.
- Cards equal height within the row.

### Footer

**Mobile**
- Stacked: Logo + tagline / Links (collapsed by default or single column) / Legal.
- Background: `--color-primary-dark`. Text: white, muted white.
- Links: `py-2` per link, easy tap target.

**Desktop**
- 4-column grid: Logo+about / Services / Company / Contact.
- Legal row below with `border-t`.

---

## Part 4 — Accessibility Baseline

- All interactive elements have visible focus states (`--shadow-focus`).
- Color is never the only indicator of state (use icons or labels alongside).
- All images have descriptive `alt` text.
- Form inputs have associated `<label>` elements (not aria-label as a substitute).
- Skip-to-content link at page top for keyboard users.
- WCAG AA minimum (4.5:1 text contrast, 3:1 large text). Target AAA where possible.
- `prefers-reduced-motion` wraps all scroll reveals and hover animations.
- Semantic HTML: `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` used correctly.

---

## Part 5 — Design Anti-Pattern Audit (Pre-flight)

Before any component ships, verify:

- [ ] No section has an eyebrow label if the preceding two sections already had one
- [ ] No two CTAs on the page share the same intent with different labels
- [ ] No card grid has an empty cell
- [ ] No 3+ consecutive sections use image+text split layout
- [ ] No `h-screen` — only `min-h-[100dvh]`
- [ ] No pure-black shadows — all tinted with navy hue
- [ ] No gradient blobs or mesh backgrounds
- [ ] Hero headline <= 2 lines at desktop, CTA visible without scroll
- [ ] All button labels are 1-3 words and fit on one line at all breakpoints
- [ ] All form inputs have labels above, not placeholders as labels
- [ ] Nav renders on a single line at 1024px
- [ ] Hover states use `transition-colors duration-150` or `transition-shadow duration-300`
- [ ] Focus rings visible on all interactive elements
- [ ] Images use `next/image` with proper `alt` attributes
- [ ] Mobile layout intentionally designed, not a scaled-down desktop
- [ ] `prefers-reduced-motion` respected in all animated components

---

*This plan references ui.md for all token values. When in doubt, defer to ui.md as the source of truth.*
