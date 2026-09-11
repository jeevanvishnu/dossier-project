# UI Design System — ECTC Professional Services

> **Design Read:** B2B professional service website for trust-seeking clients. Clean, structured, editorial language. Trust-first. No decoration for decoration's sake.
> **Dials:** `DESIGN_VARIANCE: 5` | `MOTION_INTENSITY: 3` | `VISUAL_DENSITY: 4`

---

## 1. Colour System

### Philosophy
Deep ink background base communicates technical focus and modern elegance. Light slate typography anchors readability and authority. A single sky blue accent (`#38BDF8`) drives all interactive and highlighted moments. Dark contrast-rich theme with clean hairline dividers.

### Palette Tokens

| Token | Value | Usage |
|---|---|---|
| `--color-bg` | `#0D1117` | Page background (deep ink dark) |
| `--color-surface` | `#161B22` | Cards, panels, modals |
| `--color-surface-raised` | `#1C2330` | Subtle tinted surface (alt sections, input bg) |
| `--color-border` | `#2D3748` | Hairline dividers, card borders |
| `--color-border-strong` | `#4A5568` | Active state borders, focused inputs |
| `--color-primary` | `#E2E8F0` | Light slate — primary text, nav, headings |
| `--color-primary-dark` | `#0D1117` | Deepest dark bg |
| `--color-primary-mid` | `#2D3748` | Surface mid — hover states |
| `--color-secondary` | `#A0AEC0` | Slate-400 — body text, secondary text |
| `--color-muted` | `#718096` | Slate-500 — captions, helper text, meta |
| `--color-accent` | `#38BDF8` | Sky blue — CTAs, links, focus rings, highlights |
| `--color-accent-hover` | `#0EA5E9` | Accent darkened/saturated on hover |
| `--color-accent-light` | `#0C2340` | Accent tint bg — badge bg, icon containers |
| `--color-accent-border` | `#1E3A5F` | Accent border for tinted surfaces |
| `--color-text-on-accent` | `#0D1117` | Ink dark — text on sky blue buttons |
| `--color-success` | `#10B981` | Emerald — success states |
| `--color-error` | `#EF4444` | Red — error states |
| `--color-warning` | `#F59E0B` | Amber — warnings |

### Colour Rules
- **60-30-10 Rule Application:**
  - **60% Primary Base:** `--color-bg` (`#0D1117`) and `--color-surface` (`#161B22`). The vast majority of the site is dark, focused, and crisp.
  - **30% Secondary (Structural & Typography):** `--color-primary` (`#E2E8F0`) and `--color-secondary` (`#A0AEC0`). Used for all text, structural borders, and standard icons. Provides technical clarity.
  - **10% Accent (Action & Focus):** `--color-accent` (`#38BDF8`). Reserved exclusively for CTAs, links, active states, and focus rings.
- **One accent.** `--color-accent` (`#38BDF8`) is used across every interactive element on the page.
- **Page theme is DARK.** All sections share the dark theme with surface elevation changes.
- **No gradient blobs, mesh, or floating orbs.** Solid fills only.
- **Text on surfaces:** Primary text `#E2E8F0` or secondary text `#A0AEC0` (meets WCAG AA/AAA contrast on dark surfaces).

---

## 2. Typography

### Font Stack

| Role | Family | Weights | Source |
|---|---|---|---|
| **Display / Headings** | `Lexend` | 300, 500, 600, 700 | Google Fonts via `next/font` |
| **Body / UI** | `Source Sans 3` | 300, 400, 500, 600 | Google Fonts via `next/font` |
| **Mono (code, tags)** | `JetBrains Mono` | 400, 500 | Google Fonts via `next/font` (load on-demand) |

> Never link Google Fonts via `<link>` in production. Use `next/font/google` for automatic self-hosting.

### Typography Scale

| Level | Element | Size | Line Height | Weight | Letter Spacing | Color |
|---|---|---|---|---|---|---|
| **Display** | Hero H1 | `clamp(2.25rem, 5vw, 3.75rem)` | 1.1 | 700 | `-0.02em` | `--color-primary` |
| **H1** | Page titles | `clamp(1.875rem, 4vw, 3rem)` | 1.15 | 700 | `-0.015em` | `--color-primary` |
| **H2** | Section headings | `clamp(1.5rem, 3vw, 2.25rem)` | 1.2 | 600 | `-0.01em` | `--color-primary` |
| **H3** | Sub-section headings | `clamp(1.125rem, 2vw, 1.5rem)` | 1.3 | 600 | `-0.005em` | `--color-primary` |
| **H4** | Card headings | `1.125rem` | 1.4 | 600 | `0` | `--color-primary` |
| **Body L** | Lead paragraph | `1.125rem` | 1.7 | 400 | `0` | `--color-secondary` |
| **Body** | Default paragraph | `1rem` | 1.7 | 400 | `0` | `--color-secondary` |
| **Body S** | Secondary body | `0.9375rem` | 1.65 | 400 | `0` | `--color-secondary` |
| **Caption** | Labels, meta, dates | `0.8125rem` | 1.5 | 400 | `0.01em` | `--color-muted` |
| **Overline** | Section labels (use sparingly) | `0.6875rem` | 1.4 | 600 | `0.1em` | `--color-muted` |
| **Mono** | Tags, code | `0.875rem` | 1.5 | 400 | `0` | `--color-secondary` |

### Typography Rules
- **Max 65ch line length** on body text.
- **Overline restraint:** Maximum 1 overline per 3 sections.
- **Display headline max 2 lines** at desktop.
- **No mixed type families in a headline.** Emphasis uses bold or italic of the same family.
- **Descender clearance:** Italic headlines with y g j p q must have `line-height: 1.1` min + `padding-bottom: 0.125rem`.

---

## 3. Spacing System

### Base Unit
`1 spacing unit = 4px (0.25rem)`. All spacing is a multiple of 4.

### Spacing Scale

| Token | Value | Usage |
|---|---|---|
| `--space-1` | `4px` | Tight internal padding (badge, tag) |
| `--space-2` | `8px` | Icon gap, label gap |
| `--space-3` | `12px` | Input internal padding |
| `--space-4` | `16px` | Base component gap |
| `--space-5` | `20px` | Card internal padding (mobile) |
| `--space-6` | `24px` | Card internal padding (desktop), form gap |
| `--space-8` | `32px` | Component vertical spacing |
| `--space-10` | `40px` | Section sub-element gap |
| `--space-12` | `48px` | Section inner padding (mobile) |
| `--space-16` | `64px` | Section padding (tablet) |
| `--space-20` | `80px` | Section padding (desktop) |
| `--space-24` | `96px` | Major section padding (desktop L) |
| `--space-32` | `128px` | Hero padding top |

### Vertical Rhythm Rules
- **Section padding:** `py-12` mobile / `py-16` tablet / `py-20` desktop.
- **Hero top padding cap:** Max `pt-24` (96px) at desktop.
- **Card internal padding:** `p-5` mobile / `p-6` desktop.
- **Form field gap:** `gap-6` between field blocks. `gap-2` between label and input.

### Grid System

| Breakpoint | Columns | Gutter | Container Max-Width | Side Padding |
|---|---|---|---|---|
| Mobile `< 640px` | 4 | `16px` | 100% | `px-4` |
| Tablet `640-1023px` | 8 | `24px` | 100% | `px-6` |
| Desktop `1024-1279px` | 12 | `24px` | `1280px` | `px-8` |
| Wide `1280px+` | 12 | `32px` | `1400px` | `px-8` |

> Use `max-w-[1400px] mx-auto` as the universal page container.

---

## 4. Shape System

One corner radius scale for the entire site.

| Token | Value | Applied To |
|---|---|---|
| `--radius-sm` | `4px` | Badges, tags, chips |
| `--radius-md` | `8px` | Inputs, selects, textareas |
| `--radius-lg` | `12px` | Cards, panels, dropdowns |
| `--radius-xl` | `16px` | Feature blocks, large cards |
| `--radius-pill` | `999px` | Buttons only |

> **Buttons are pill-shaped.** Cards and inputs use `--radius-lg` and `--radius-md` respectively. This split is documented and consistent.

---

## 5. Shadow System

Tinted to page background, never pure black. Used sparingly.

| Token | Value | Usage |
|---|---|---|
| `--shadow-xs` | `0 1px 2px rgba(15,45,94,0.04)` | Inputs at rest |
| `--shadow-sm` | `0 2px 8px rgba(15,45,94,0.06)` | Cards at rest |
| `--shadow-md` | `0 4px 16px rgba(15,45,94,0.09)` | Cards on hover |
| `--shadow-lg` | `0 8px 32px rgba(15,45,94,0.12)` | Modals, drawers |
| `--shadow-focus` | `0 0 0 3px rgba(3,105,161,0.25)` | Focus ring (accent-tinted) |

---

## 6. Motion Tokens

Minimal. Every animation must have a purpose.

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | `150ms` | Button state changes |
| `--duration-base` | `200ms` | Color, border transitions |
| `--duration-slow` | `300ms` | Card hover lift, dropdown open |
| `--duration-enter` | `400ms` | Section scroll-reveal enter |
| `--ease-standard` | `cubic-bezier(0.4, 0, 0.2, 1)` | Most transitions |
| `--ease-decelerate` | `cubic-bezier(0, 0, 0.2, 1)` | Elements entering viewport |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Button tap feedback |

### Motion Rules
- `prefers-reduced-motion` honored unconditionally. All scroll reveals wrap `useReducedMotion()`.
- Scroll reveals use `motion/react` `whileInView` with `once: true`.
- No infinite loops on decorative elements.
- Button tap: `scale(0.98)` on `:active`, springs back instantly.
- No `window.addEventListener('scroll')`. Use Motion `useScroll()` or CSS scroll-driven animations.

---

## 7. Component Specs

### Buttons

| Variant | Background | Text | Hover |
|---|---|---|---|
| Primary | `--color-accent` | `#FFFFFF` | `--color-accent-hover` |
| Primary Navy | `--color-primary` | `#FFFFFF` | `--color-primary-mid` |
| Outline | `transparent` | `--color-accent` | `--color-accent-light` bg |
| Ghost | `transparent` | `--color-secondary` | `--color-surface-raised` bg |

- Padding: `py-2.5 px-6` default / `py-3 px-8` large
- Shape: pill (`border-radius: 999px`)
- Font: Source Sans 3, 500 weight, `0.9375rem`
- Label: MAX 3 words. NEVER wraps to 2 lines at desktop.
- All buttons have `cursor-pointer` and `transition-colors duration-150`.

### Cards

- Background: `--color-surface` (white)
- Border: `1px solid --color-border`
- Radius: `--radius-lg` (12px)
- Shadow: `--shadow-sm` rest / `--shadow-md` hover
- Padding: `p-5` mobile / `p-6` desktop
- Hover: shadow lifts, `transition-shadow duration-300`

### Inputs / Forms

- Border: `1px solid --color-border`
- Focus: `1px solid --color-accent` + `--shadow-focus`
- Radius: `--radius-md` (8px)
- Background: white
- Padding: `py-3 px-4`
- Label: above input, `--color-secondary`, 500 weight, `Caption` size
- Placeholder: `--color-muted` — used only for example hint, never as label
- Error: `--color-error` text below input, `Caption` size
- All inputs have visible focus ring (`--shadow-focus`) for keyboard navigation.

---

## 8. Prohibited Patterns

| Pattern | Reason |
|---|---|
| Excessive gradients (mesh, multi-stop, orbs) | Visual noise, undermines trust |
| Glassmorphism / frosted panels | Wrong register for B2B professional service |
| Floating gradient orbs | Decorative filler |
| Huge decorative animations | Distracts from service communication |
| Excessive or stacked box shadows | Looks unfinished |
| Icon on every heading / random icon placement | Icon spam, not hierarchy |
| Unnecessary 3D transforms or perspective tricks | Out of scope |
| Overly futuristic / neon styling | Wrong register |
| AI-purple gradient buttons | Generic, distrust signal |
| Eyebrow label on every section | #1 AI tell |
| Serif body text | Not warranted |
| Placeholder-as-label in forms | WCAG failure |
| `h-screen` for hero | iOS Safari viewport jump |
| Two CTAs with same intent on one page | Confusing, banned |

---

*This file is the single source of truth for colour, type, and spacing. All implementation decisions reference these tokens.*
