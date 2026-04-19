# Accessibility — BELLA AAA checklist

BELLA's accessibility baseline is WCAG 2.1 Level AAA. Not AA. Not "AA with best-effort AAA." AAA. If a surface shipping with BELLA fails one of the rules below, the surface is broken and ships only as a known exception with a documented plan to fix.

Consumer projects that install BELLA inherit this checklist. Downstream microagents may tighten these rules. They do not get to relax them.

## Text contrast

- **Normal text on parchment (`#F7F4EF`) must be `ink` (`#0F1117`) or `neutral.600` (`#525252`).** Ink is 17.2:1 — the body-text default. `neutral.600` is 7.12:1 — the AAA-safe gray used by `semantic.text-secondary` for captions, footnotes, and supporting copy. Those are the only two AAA text colors on parchment.
- **Large text (≥18px regular, or ≥14px bold) must hit 4.5:1.** Most of the system already does; verify when a heading shrinks to 14px bold or dips to 18px regular.
- **Non-text UI — icons, borders, focus rings — must hit 3:1.** This is where the supporting palette and `neutral.500` earn their keep. `dusk`, `sage`, `steel`, and `neutral.500` all clear 3:1 for decorative and icon roles; as text on parchment they fail.
- **On ink (dark mode, slate surfaces), only `parchment` (17.2:1) and `amber` (7.06:1) pass AAA for normal text.** Those are the two text colors on ink.

## Mid-tones are never text on parchment

Verified contrast on parchment, rounded:

| Color | Ratio | Text on parchment? | Allowed roles |
|---|---|---|---|
| `amber` | 2.44:1 | No — fails all text thresholds | background, decorative, dark-mode-text-on-ink |
| `steel` | 2.88:1 | No — fails all text thresholds | chip-wash, decorative |
| `dusk` | 4.28:1 | No — passes only 3:1 non-text | decorative, icon, chip-wash, border |
| `sage` | 4.35:1 | No — passes only 3:1 non-text | decorative, icon, chip-wash, border |
| `neutral.500` | 4.86:1 | No — AA only, fails AAA | icon fills, non-text UI |

**Rule: supporting palette (amber / steel / dusk / sage) and `neutral.500` or lighter are never text foregrounds on parchment.** Full stop.

Allowed text on parchment: `ink` (primary body, links, tag/eyebrow foregrounds, button text) or `neutral.600` (secondary text, captions, footnotes). That's it.

Supporting palette is usable as:

- Alpha-tinted backgrounds and washes
- Icons, borders, focus-ring accents (≥3:1 non-text)
- Text on ink in dark mode — but only `amber` clears AAA there

Check `primitive.json`'s `$extensions.bella.roles` on each supporting color for its allowed uses. That field is load-bearing — consult it before picking a color.

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
