# AGENTS.md — BELLA

Rules for any AI agent reading, writing, or consuming code that touches BELLA. These are not suggestions. Follow them, or the output is wrong.

BELLA is the design system for **ctrl_alt_design** (Elleta McDaniel's design engineering practice). It powers `elleta.design`, CHIP, and everything downstream. Its job is to keep that work editorial, deliberate, and recognizably not-AI-generic.

## Token-first, always

Never hard-code a hex value, an arbitrary pixel number, or a one-off font size. If the design calls for a color, spacing, radius, or type style, it resolves through a BELLA token. If the token you need doesn't exist yet, stop and ask — do not invent one inline and move on.

Reference tokens by path (`color.brand.ochre`, `spacing.4`, `typography.font-size.base`). Consuming apps read `tokens/bella.json` as the source of truth.

## The accessibility bar (recorded 2026-07-21, Elleta; re-verified 2026-09-22)

**AAA-minded AA.** Concretely:

- **AAA for ink and body text, muted included.** Light: ink 18.73 on bg, 16.73 on panel; muted `#515151` 7.94 on bg, 7.09 on panel (worst). Dark: ink 16.60 on bg, 12.93 on raised; muted `#b1b1b1` 9.06 on bg, 7.06 on raised (worst). Body text never drops below AAA on any surface.
- **Ochre is a fill, never text on light (brand refresh, 2026-09-22).** `color.brand.ochre` `#e8a83e` carries ink `#121212` text (9.01:1) in both themes. On light it is never text or a hairline (2.08:1 on white, 1.86:1 on panel); lines and the ring on light are `color.brand.ochre-deep` `#b97a14` (3.59:1 on white, 3.20:1 on panel). On dark, ochre clears 7.28:1 even on raised.
- **The focus ring means focus only.** 3px, 3px offset: ochre-deep in light (3.20:1 on panel), ochre in dark (8.70:1 on surface). Never at rest, never as decoration.
- **Links are ink with an underline**; hover thickens the underline to 2px (`border.width.medium`). Ink holds AAA everywhere, so link and button labels are AAA.
- **The pairs are checked, not just recorded.** `scripts/contrast-pairs.mjs` (in the gate) computes every declared foreground/background pair in both themes, plus the forbidden pairs that must stay failing.
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

The light page is `color.light.bg`, pure white `#ffffff`, and that is the **only** place pure white is allowed (audit:quality allows it on the page ground: the stage or `[data-bella-ground]`). Everything raised or inset is one step down: `panel` `#f2f2f2` (surface and panel merged, 2026-09-22). A disabled field has no fill of its own: muted text and the border mark it. Cards are flat: panel fill, a 1px hairline edge, no shadow at rest. White alpha stays permitted as a translucent glass overlay.

Dark mode is neutral and climbs lighter: page `color.dark.bg` `#0d0d0d`, surface and panel `color.dark.surface` `#161616`, inset `color.dark.inset` `#1f1f1f`, raised `color.dark.raised` `#262626`. Control borders (`border-strong` `#636363`) never sit on raised (2.52:1).

**Colour lives in fills, never in strokes or body text** — except focus and status (amended 2026-09-22, Elleta). Focus is `color.semantic.focus-ring` (ochre-deep light, ochre dark). Status is `danger-*` and `success-*`: text at AA or better (4.5:1), borders and icons at 3:1, on every surface; a status colour never stands alone (an error is the danger edge + the WarningCircle icon + the message + `aria-invalid`). Every other stroke is 1px ink (`border-ink`) or hairline. The chip fills (`chip.c1` soft tiger-blue `#cfe0ef`, `c2` peach `#f6c9a8`, `c3` mint `#cfe8dc`) are the same in both themes and always carry `chip.text` `#17191a` (11.63:1 worst). A chip fill is never the only signal of state (1.16–1.52:1 against the light page). No purple anywhere.

## Surface behavior

- Cards: flat. `surface-card` fill, 1px `border-faint`, `radius.card` (16px), no shadow at rest, no accent-tinted border, no gradient or scrim over media. Only interactive cards (one link or one button) respond: on hover and focus-visible, `motion.transform.hover-lift` (`translateY(-2px)`) plus `shadow.hover`, over `motion.duration.lift` (200ms). No lift under reduced motion. A static card never changes on hover. The lift is the tell: it marks what you can click.
- Buttons: every tier shares `radius.lg` (12px, `component.button.shape.default`); `shape="pill"` uses `radius.full`. Buttons never lift on hover: lift is reserved for cards. Primary is an ink keycap, secondary a control outline that goes ink on hover, tertiary an ink link whose underline thickens; no accent colour on any tier at rest. Hover and focus-visible roll the label; active presses the primary keycap (`motion.transform.key-press`). No trace ring on buttons; the only ring is focus. The primary contact CTA reads "Let's talk". See `docs/motion-system.md`.
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

BELLA's palette and typography are decided (the 2026-07 identity, restyled by the style unify and the brand refresh, both 2026-09-22; lock: `specs/style-unify-lock.md`). The source of truth is `tokens/primitive.json`.

**Palette:**

- `color.light.*` — ink `#121212`, muted `#515151`, line `#e3e3e3`, control `#8c8c8c`, panel `#f2f2f2`, bg `#ffffff`
- `color.dark.*` — ink `#ededed`, muted `#b1b1b1`, line `#2a2a2a`, control `#636363`, surface `#161616`, inset `#1f1f1f`, raised `#262626`, bg `#0d0d0d`
- `color.chip.*` — c1 soft tiger-blue `#cfe0ef` (from the pattern; replaced lavender, 2026-09-22), c2 peach `#f6c9a8`, c3 mint `#cfe8dc`, text `#17191a`; same in both themes, fills only
- `color.light.danger` `#b3261e` / `danger-subtle` `#fcebe9`, `color.light.success` `#1a7439` / `success-subtle` `#e6f3ea`; dark: danger `#ff8f84` / `#3a1714`, success `#72d08b` / `#12301d` (status tokens, 2026-09-22). Read through `color.semantic.danger-text`, `danger-border`, `danger-subtle` and the `success-*` set. Checked in the gate by `scripts/contrast-pairs.mjs`
- `color.brand.ochre` — `#e8a83e`, **the single accent**: a fill with ink text in both themes, and the dark focus ring
- `color.brand.ochre-deep` — `#b97a14`: ochre's line and ring on light surfaces
- `color.pattern.*` — the brand pattern (ochre ground, tiger blue, cream, rosette, pink, leopard green, zebra lime, ink, coral): BrandWordmark, PatternField and the favicon only. Never recoloured, never a UI or state colour.

Ochre is the only accent. Iris and periwinkle are retired (brand refresh, 2026-09-22). The chip fills are not accents: they are fills that carry no interaction meaning. Amber is retired. The 2026-07 brand values (`brand.ink`, `brand.ground`, `navy.*`, `night.*`) remain in the primitives for legacy consumers; semantic tokens no longer point at them (Card's fixed-context peek panel still re-scopes to the warm paper values).

The status ladder has **danger and success** (2026-09-22); warning and info are still open (issue #1). Supporting `steel` and `sage` are carried from the April identity for StatusPill's tints, **non-text roles only**. Do not use them as text; do not design new status UI around them, or invent warning/info values, without asking.

**Typography — Geist, three cuts, plus the wordmark (the type lock, style unify 2026-09-22):**

- **Headings** — `typography.font-family.display` is **Geist** at `font-weight.light` (300), sentence case, `line-height.heading` (1.08). Hero and page tiers track `letter-spacing.display` (-0.035em); the section tier (h2) tracks `letter-spacing.h2` (-0.03em). Through the Heading component and its contract.
- **Titles** — Geist `font-weight.medium` (500) at 20px, `letter-spacing.title` (-0.015em).
- **Body** — Geist 400, `font-size.body` (17px) for new body copy, `letter-spacing.body` (-0.01em). `font-size.base` stays 16px for existing consumers.
- **Eyebrows, meta labels and diagram text** — `typography.font-family.mono`, **Geist Mono** 400 at `font-size.mono` (13px), `font-feature.mono` (ss09), `letter-spacing.mono` (0): no tracking, no caps. Components on Mono: Eyebrow, Tag, StatusPill, the Callout gap label. Button, Select, NavLink and the Input label stay Geist (2026-09-22). This is the only use of Mono (reverses the 2026-09-21 retirement).
- **Wordmark** — the logo is the **BrandWordmark** component (brand refresh, 2026-09-22): custom E, L, T, A, B stroke glyphs at the locked settings (weight 12, width 58, height 130, tracking 16, soft corners; the E, A and B bars on one low line), filled with the seeded brand pattern or in ink. ELLETA for the site, BELLA for the system. Never below 32px tall, never recoloured, never body type or a heading. `typography.font-family.wordmark` (Unique) remains for legacy consumers only.

**Icons — one set, declared (2026-07-22):** Iconoir (MIT, the portfolio's set) is BELLA's only icon source. Every glyph lives in the Icon registry (`src/components/Icon/registry.ts`) and renders through the Icon component: icon-ramp sizes, always currentColor, decorative by default. No mixing sets, no one-off inline SVGs anywhere; a meaningful icon requires a label and never stands without text unless its accessible name is proven in a Behavior story. audit:quality fails any inline `<svg>` outside the Icon component. **The one named exception (2026-09-22): diagram patterns** — FlowDiagram, ProcessSteps and case-study diagrams under `src/patterns/Diagrams/` — draw their own SVG, marked `data-bella-diagram`; 1px ink strokes and chip fills only, `role="img"` with an aria-label that tells the story. **The second named exception (brand refresh): brand art** — BrandWordmark and PatternField, marked `data-bella-brand`: a labelled image (`role="img"` + the word) or aria-hidden decoration, nothing in between.

Any value you see as `"TBD"` in the token JSON is a genuine unknown — stop and ask. Do not fill it in.

## Tiered inheritance

Repos that install BELLA as a `devDependency` inherit this AGENTS.md automatically. They may add their own `AGENTS.md` at their root to layer additional rules — but downstream rules only *extend* or *tighten* BELLA's. They do not relax them. A consuming repo cannot, for example, use pure white off the page ground, drop body text to 14px, put colour in a stroke outside focus and status, set ochre as text on light, or set Mono below 13px.

If a consuming repo's rules conflict with BELLA's, BELLA wins. Flag the conflict; don't silently resolve it.
