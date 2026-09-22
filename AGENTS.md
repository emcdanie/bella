# AGENTS.md — BELLA

Rules for any AI agent reading, writing, or consuming code that touches BELLA. These are not suggestions. Follow them, or the output is wrong.

BELLA is the design system for **ctrl_alt_design** (Elleta McDaniel's design engineering practice). It powers `elleta.design`, CHIP, and everything downstream. Its job is to keep that work editorial, deliberate, and recognizably not-AI-generic.

## Token-first, always

Never hard-code a hex value, an arbitrary pixel number, or a one-off font size. If the design calls for a color, spacing, radius, or type style, it resolves through a BELLA token. If the token you need doesn't exist yet, stop and ask — do not invent one inline and move on.

Reference tokens by path (`color.brand.iris`, `spacing.4`, `typography.font-size.base`). Consuming apps read `tokens/bella.json` as the source of truth.

## The accessibility bar (recorded 2026-07-21, Elleta; re-verified 2026-09-22)

**AAA-minded AA.** Concretely:

- **AAA for ink and body text, muted included.** Light: ink 18.73 on bg, 16.73 on panel; muted `#515151` 7.94 on bg, 7.09 on panel (worst). Dark: ink 16.60 on bg, 15.46 on surface; muted `#a1a1a1` 7.52 on bg, 7.00 on surface (worst allowed). Body text never drops below AAA. Dark muted is forbidden on the legacy `night.inset` / `night.raised` surfaces (6.07 / 5.54).
- **AA where the accent speaks.** Iris is 6.23:1 on the white bg and 5.56:1 on panel: AA, not AAA, and AAA is not the bar for accent. Accent text, links and the focus ring are AA-verified per token.
- **The accent always theme-flips.** Iris in light, periwinkle in dark. Each fails its opposite ground (iris 3.12:1 on the dark bg, 2.91:1 on the dark surface; periwinkle 2.47:1 on the white bg), so each is banned there **even as decoration**.
- **Controls clear 3:1, hairlines are decoration.** `border-strong` (`#8c8c8c` light, `#636363` dark) is the input and control border, 3.00:1 worst. The hairline (`border`, `border-subtle`, `border-faint`: `#e3e3e3` / `#2a2a2a`) is decorative only and never marks a control.
- **Worst-ground-wins.** A text token passes on the *worst* surface it is allowed to sit on, or its usage metadata forbids that surface. Verified ratios are recorded per token in `$extensions.bella.a11y`, dated.

## Typography minimums

These are floors, not defaults. Going below is a bug.

- Body text: **16px minimum**; new body copy is `font-size.body` (17px)
- Titles (card, step): **20px, Geist 500**
- Section headings: **32px minimum**
- Nothing, anywhere, below **13px**. Geist Mono labels sit at the floor: 13px, never 12
- **Unique never below 24px** — the keycap brand lockup is the single recorded exception

Fine-print, captions, and metadata live at 13–14px and should be rare. If you're reaching for 12px, rethink the layout.

## White page, neutral surfaces (style unify, 2026-09-22)

The light page is `color.light.bg`, pure white `#ffffff`, and that is the **only** place pure white is allowed (audit:quality allows it on the page ground: the stage or `[data-bella-ground]`). Surfaces step down from it: `surface` `#f5f5f4`, cards and panels `panel` `#f2f2f2`. Cards are flat: panel fill, a 1px hairline edge, no shadow at rest. White alpha stays permitted as a translucent glass overlay.

Dark mode is neutral: page `color.dark.bg` `#0d0d0d`, surface and panel `color.dark.surface` `#161616`. The legacy warm `night.*` values remain only as `surface-inset` / `surface-elevated` in dark until neutral steps are decided.

**Colour lives in fills, never in strokes or body text** — except the focus ring, which is `color.semantic.focus-ring` (iris light, periwinkle dark). Strokes are 1px ink (`border-ink`) or hairline. The chip fills (`chip.c1` lavender `#c9bff5`, `c2` peach `#f6c9a8`, `c3` mint `#cfe8dc`) are the same in both themes and always carry `chip.text` `#17191a` (10.29:1 worst). A chip fill is never the only signal of state (1.19–1.71:1 against the light page).

## Surface behavior

- Cards: flat. `surface-card` fill, 1px `border-faint`, `radius.card` (16px), no shadow at rest, no accent-tinted border, no gradient or scrim over media. Only interactive cards (one link or one button) respond: on hover and focus-visible, `motion.transform.hover-lift` (`translateY(-2px)`) plus `shadow.hover`, over `motion.duration.lift` (200ms). No lift under reduced motion. A static card never changes on hover. The lift is the tell: it marks what you can click.
- Buttons: every tier shares `radius.lg` (12px, `component.button.shape.default`); `shape="pill"` uses `radius.full`. Buttons never lift on hover: lift is reserved for cards. Hover and focus-visible roll the label; active presses the primary keycap (`motion.transform.key-press`). No trace ring on buttons. See `docs/motion-system.md`.
- One light source, upper-left: highlights top-left, shadows down-right (orbs, keycaps). The elevation tokens (`shadow.orb*`, `shadow.key-*`, `shadow.switch-*`) are a token lock for the existing components: do not flatten; the depth IS the system. **The new patterns (diagrams, steps, eyebrows, callouts) carry no shadow**: 1px ink strokes and hairlines only.
- Hover transitions are quick (≤250ms) and eased. No bouncing, no spring physics.
- **Diagram motion** (style unify, 2026-09-22): `motion.duration.draw` + `motion.easing.draw` for lines, `motion.duration.pop` + `motion.easing.pop` for elements appearing, `motion.stagger.min`–`max` between steps. Plays once when in view, then holds still; reduced motion shows the finished frame. The pop overshoot is for play-once reveals only, never hover or state changes.

## Aesthetic stance

Editorial. Confident. Closer to a magazine or a well-set book than a SaaS dashboard. Avoid:

- Gradient-on-gradient hero blobs
- Generic rounded-everything, pastel-everything, emoji-in-every-heading "friendly AI" UI
- Stock iconography where typography would do
- Centered everything — asymmetry is fine, often better

When in doubt, the answer is more type, less chrome.

## Resolved tokens — do not reinvent

BELLA's palette and typography are decided (the 2026-07 identity, restyled by the style unify, 2026-09-22; lock: `specs/style-unify-lock.md`). The source of truth is `tokens/primitive.json`.

**Palette:**

- `color.light.*` — ink `#121212`, muted `#515151`, line `#e3e3e3`, control `#8c8c8c`, surface `#f5f5f4`, panel `#f2f2f2`, bg `#ffffff`
- `color.dark.*` — ink `#ededed`, muted `#a1a1a1`, line `#2a2a2a`, control `#636363`, surface `#161616`, bg `#0d0d0d`
- `color.chip.*` — c1 lavender `#c9bff5`, c2 peach `#f6c9a8`, c3 mint `#cfe8dc`, text `#17191a`; same in both themes, fills only
- `color.brand.iris` — `#5B4BD1`, **the single accent**, light mode, **interactive only**: links, the focus ring, accent text that is a link. Never on eyebrows, headings or decoration.
- `color.brand.periwinkle` — `#A79CE2`, the same accent in dark mode

Iris and periwinkle are one accent in two modes — never two accents. The chip fills are not accents: they are fills that carry no interaction meaning. Amber is retired. The 2026-07 brand values (`brand.ink`, `brand.ground`, `navy.*`, `night.*`) remain in the primitives for legacy consumers and the Storybook manager; semantic tokens no longer point at them except where noted above.

Supporting `steel` and `sage` are carried from the April identity for status states, **non-text roles only**, pending a BELLA-native status ladder (open issue). Do not use them as text; do not design new status UI around them without asking.

**Typography — Geist, three cuts, plus the wordmark (the type lock, style unify 2026-09-22):**

- **Headings** — `typography.font-family.display` is **Geist** at `font-weight.light` (300), sentence case, `line-height.heading` (1.08). Hero and page tiers track `letter-spacing.display` (-0.035em); the section tier (h2) tracks `letter-spacing.h2` (-0.03em). Through the Heading component and its contract.
- **Titles** — Geist `font-weight.medium` (500) at 20px, `letter-spacing.title` (-0.015em).
- **Body** — Geist 400, `font-size.body` (17px) for new body copy, `letter-spacing.body` (-0.01em). `font-size.base` stays 16px for existing consumers.
- **Eyebrows, labels, meta and diagram text** — `typography.font-family.mono`, **Geist Mono** 400 at `font-size.mono` (13px), `font-feature.mono` (ss09), `letter-spacing.mono` (0): no tracking, no caps. This is the only use of Mono (reverses the 2026-09-21 retirement).
- **Wordmark** — `typography.font-family.wordmark` is **Unique** Bold 700: the ELLETA / BELLA wordmark and the keycap lockup only. Never a heading, never below 24px (keycap logo excepted), never negative tracking.

**Icons — one set, declared (2026-07-22):** Iconoir (MIT, the portfolio's set) is BELLA's only icon source. Every glyph lives in the Icon registry (`src/components/Icon/registry.ts`) and renders through the Icon component: icon-ramp sizes, always currentColor, decorative by default. No mixing sets, no one-off inline SVGs anywhere; a meaningful icon requires a label and never stands without text unless its accessible name is proven in a Behavior story. audit:quality fails any inline `<svg>` outside the Icon component.

Any value you see as `"TBD"` in the token JSON is a genuine unknown — stop and ask. Do not fill it in.

## Tiered inheritance

Repos that install BELLA as a `devDependency` inherit this AGENTS.md automatically. They may add their own `AGENTS.md` at their root to layer additional rules — but downstream rules only *extend* or *tighten* BELLA's. They do not relax them. A consuming repo cannot, for example, use pure white off the page ground, drop body text to 14px, put colour in a stroke, or set Mono below 13px.

If a consuming repo's rules conflict with BELLA's, BELLA wins. Flag the conflict; don't silently resolve it.
