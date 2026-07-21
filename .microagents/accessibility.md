# Accessibility — the BELLA bar

BELLA's accessibility bar is **AAA-minded AA** (recorded 2026-07-21, Elleta; `docs/RULES.md` rule 9):

- **AAA for ink and body text** — both ink ladders are verified AAA on every surface they sit on.
- **AA where the accent speaks** — accent text, buttons, links. AAA accent text is not attainable with iris on light surfaces (5.96:1 ceiling) and is not the bar.
- **The accent always theme-flips** — iris light, periwinkle dark — and is banned on its failing ground **even as decoration** (the failure includes the 3:1 non-text minimum).
- **Worst-ground-wins** — every text token passes AA normal text on the worst surface its usage metadata allows, or that surface is forbidden in the metadata.

Every ratio below is computed (WCAG relative luminance), recorded in `$extensions.bella.a11y` on the token, and dated. If a surface shipping with BELLA fails a rule below, the surface is broken and ships only as a known exception with a documented plan to fix.

Consumer projects that install BELLA inherit this checklist. Downstream microagents may tighten these rules. They do not get to relax them.

## Text contrast — verified 2026-07-21

**Light mode (on ground `#F5F4EF` unless noted):**

| Token | Hex | Ratio | Verdict |
|---|---|---|---|
| `brand.ink` (text-primary) | `#1A1720` | 16.06:1 | AAA |
| `neutral.ink-soft` | `#2E2937` | 12.81:1 | AAA |
| `neutral.ink-muted` (text-secondary) | `#4A4652` | 8.33:1 | AAA (7.74 on surface-inset, still AAA) |
| `neutral.ink-faint` (text-muted) | `#6B6678` | 5.02:1 | AA everywhere (4.67 on surface-inset, the worst light ground) |
| `brand.iris` (accent text) | `#5B4BD1` | 5.66:1 | AA normal, AAA large. The accent ceiling. |

**Dark mode (on navy `#1B1B40` unless noted):**

| Token | Hex | Ratio | Verdict |
|---|---|---|---|
| `navy.ink` (text-primary) | `#F4EFE6` | 14.35:1 | AAA (11.44 on raised, worst) |
| `navy.ink-soft` | `#E6E1D6` | 12.61:1 | AAA (10.05 worst) |
| `navy.ink-muted` | `#C6C2D4` | 9.45:1 | AAA (7.53 on raised, worst) |
| `navy.text-secondary` | `#C4BFD4` | 9.20:1 | AAA (7.33 worst) |
| `navy.text-muted` | `#9994B1` | 5.66:1 | AA everywhere (4.51 on raised, worst) |
| `brand.periwinkle` (accent text) | `#A79CE2` | 6.65:1 | AA normal, AAA large (5.30 on raised) |
| `iris.peri-ink` (accent-ink) | `#B4ADE8` | 7.89:1 | AAA |

**Buttons:** ground label on iris fill 5.66:1 (AA), on hover `#4C3EB8` 7.09:1 (AAA); white label on keycap stops 4.95/6.23:1 (AA); navy label on periwinkle 6.65:1 (AA), on hover `#B9B0E9` 8.18:1 (AAA).

## The accent never touches its failing ground

| Pair | Ratio | Meaning |
|---|---|---|
| iris on navy | 2.64:1 | Fails text AND 3:1 non-text — banned in dark mode entirely, decoration included |
| periwinkle on ground | 2.24:1 | Fails everything — light mode gets periwinkle only as alpha tints (washes, selection) |
| `iris.bright` on navy | 3.99:1 | Non-text and AA-large only — hero display accents, never body text |

## Carried status colors are never text

`steel` (2.87:1 on ground — fails even non-text; wash only) and `sage` (4.33:1 — non-text roles only) are carried from the April identity pending a lush-native status ladder (see the open issue). Neither is ever a text foreground. Check `$extensions.bella.roles` / `.status` on each — those fields are load-bearing.

## Touch targets — 44×44px minimum

Every interactive element — button, input, tag, nav link, icon-only control — has a hit area of at least **44×44px**. WCAG 2.5.5 Target Size (Enhanced) AAA.

The tokens encode it:

- `spacing.touch-target` = 44px (the floor)
- `spacing.touch-target-comfortable` = 48px (use for primary actions)

Every interactive component in `component.json` ships with `min-height: {spacing.touch-target}`. If you build something BELLA doesn't have a component for, honor 44px anyway. No exceptions for "just a small chip."

Visual chrome can be smaller than the tap area — use transparent padding or an invisible pseudo-element around a small chip rather than growing the visible chip to 44px.

## No fixed widths

Components do not set fixed widths in pixels. Every width constraint is a `max-width`, not a `width`. Grids, flex containers, and content measures all flex with the viewport.

This makes zoom and reflow work for free.

## Reflow at 200% zoom

Content remains readable with no horizontal scrolling when the page is zoomed to 200% on a 1280×1024 viewport (WCAG 1.4.10). Test it. If reflow breaks, a layout used pixel widths where it should have used flex, grid, or percentages. Fix the layout — don't lower the zoom support bar.

## Orientation-agnostic

Content does not require a specific device orientation (WCAG 1.3.4). Portrait and landscape both work. No "please rotate your device" nagging. If a layout only works in one orientation, it's not a BELLA-compliant layout.

## Text-spacing overrides don't break layout

Readers can apply their own typography adjustments — browser extensions, assistive tech, or user stylesheets — per WCAG 1.4.12. Our layouts must not break when a reader forces:

- `line-height` at least 1.5× the font size
- paragraph spacing at least 2× the font size
- letter-spacing at least 0.12em
- word-spacing at least 0.16em

No clipping, no overlapping text, no disappearing controls.

## Focus indicators

Every interactive element has a visible focus indicator. Defaults:

- 2px ring using `color.semantic.border-strong`, 2px offset from the element
- Never `outline: none` without a replacement focus ring
- Thick enough for mobile switch-control users — 2px is the floor, 3px when the element sits on a busy surface

Focus follows keyboard order, which follows DOM order, which follows reading order. `tabindex` values above 0 are a code smell — fix the DOM order instead.

## Breakpoints

BELLA ships four breakpoint tokens:

- `breakpoint.mobile` — 640px
- `breakpoint.tablet` — 768px
- `breakpoint.desktop` — 1024px
- `breakpoint.wide` — 1440px

Design mobile-first. Desktop layouts are enhancements on top of a working mobile experience, never the other way round.

## Inherited rules

Any project that installs BELLA as a dependency picks this checklist up automatically. Consumer microagents may layer stricter rules — a dashboard with denser data might raise the focus-ring width or require 4.5:1 on every icon — but they may not loosen these minimums.

If a consumer's rules conflict with this checklist, BELLA wins. Flag the conflict; do not silently resolve it.
