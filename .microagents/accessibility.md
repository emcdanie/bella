# Accessibility — the BELLA bar

BELLA's accessibility bar is **AAA-minded AA** (recorded 2026-07-21, Elleta; `docs/RULES.md` rule 9):

- **AAA for ink and body text** — both ink ladders are verified AAA on every surface they sit on.
- **Ochre is a fill, never text on light** (brand refresh, 2026-09-22) — ochre carries ink text (9.01:1) in both themes; on light it is never text, a hairline or a ring (2.08:1 on white). Lines and the ring on light are ochre-deep.
- **The focus ring means focus only** — 3px, 3px offset, ochre-deep light / ochre dark, never at rest.
- **Worst-ground-wins** — every text token passes on the worst surface its usage metadata allows, or that surface is forbidden in the metadata.

Every ratio below is computed (WCAG relative luminance), recorded in `$extensions.bella.a11y` on the token, dated, and re-checked on every gate run by `scripts/contrast-pairs.mjs`. If a surface shipping with BELLA fails a rule below, the surface is broken and ships only as a known exception with a documented plan to fix.

Consumer projects that install BELLA inherit this checklist. Downstream microagents may tighten these rules. They do not get to relax them.

## Text contrast — verified 2026-09-22

**Light mode (page `#ffffff`, panel `#f2f2f2`):**

| Token | Hex | Ratio | Verdict |
|---|---|---|---|
| `light.ink` (text-primary, links, button labels) | `#121212` | 18.73:1 page, 16.73:1 panel | AAA |
| `light.muted` (text-secondary, text-muted) | `#515151` | 7.94:1 page, 7.09:1 panel (worst) | AAA |
| ink on `brand.ochre` (text-on-accent) | `#121212` on `#e8a83e` | 9.01:1 | AAA |

**Dark mode (page `#0d0d0d`, surface `#161616`, inset `#1f1f1f`, raised `#262626`):**

| Token | Hex | Ratio | Verdict |
|---|---|---|---|
| `dark.ink` (text-primary) | `#ededed` | 16.60:1 page, 12.93:1 raised (worst) | AAA |
| `dark.muted` (text-secondary, text-muted) | `#b1b1b1` | 9.06:1 page, 7.06:1 raised (worst) | AAA |
| ink on `brand.ochre` | `#121212` on `#e8a83e` | 9.01:1 | AAA |

**Buttons:** the primary label (text-inverse) on the ink plate 16.0:1, on the hover plate 10.63:1 light / 11.78:1 dark (AAA). Secondary and tertiary labels are ink (AAA). The secondary outline is `border-strong`, 3.00:1 worst (non-text AA).

## Non-text: the ring and the controls

| Pair | Ratio | Meaning |
|---|---|---|
| focus ring, light (`ochre-deep` on panel) | 3.20:1 | Passes the 3:1 non-text minimum on the worst light surface |
| focus ring, dark (`ochre` on surface) | 8.70:1 | 7.28:1 on raised, the worst dark surface |
| control border (`border-strong`) | 3.00:1 light panel, 3.01:1 dark surface | The input and control outline; never on dark raised (2.52:1) |

## Forbidden pairs (the gate proves they still fail)

| Pair | Ratio | Meaning |
|---|---|---|
| ochre as text on white | 2.08:1 | Fails text and non-text: ochre is never text on light |
| ochre as a line on panel | 1.86:1 | Use ochre-deep for any ochre line on light |

## Carried status colors are never text

`steel` (2.87:1 on ground — fails even non-text; wash only) and `sage` (4.33:1 — non-text roles only) are carried from the April identity pending a BELLA-native status ladder (see the open issue). Neither is ever a text foreground. Check `$extensions.bella.roles` / `.status` on each — those fields are load-bearing.

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
