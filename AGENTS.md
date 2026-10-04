# AGENTS.md — BELLA

Rules for any AI agent reading, writing, or consuming code that touches BELLA. These are not suggestions. Follow them, or the output is wrong.

BELLA is the design system for **ctrl_alt_design** (Elleta McDaniel's design engineering practice). It powers `elleta.design`, CHIP, and everything downstream. Its job is to keep that work editorial, deliberate, and recognizably not-AI-generic.

## Token-first, always

Never hard-code a hex value, an arbitrary pixel number, or a one-off font size. If the design calls for a color, spacing, radius, or type style, it resolves through a BELLA token. If the token you need doesn't exist yet, stop and ask — do not invent one inline and move on.

Reference tokens by path (`color.brand.ochre`, `spacing.4`, `typography.font-size.base`). Consuming apps read `tokens/bella.json` as the source of truth.

## The accessibility bar (recorded 2026-07-21, Elleta; re-verified 2026-09-22)

**AAA-minded AA.** Concretely:

- **AAA for ink and body text, muted included (colour B, re-verified 2026-10-04).** Light: ink 15.05 on the ground (worst), 16.13 on card; muted `cool.600` `#474c5e` 7.95 on the ground, 7.34 on inset (worst). Dark: ink 16.26 on the ground, 12.35 on raised; muted `cool.300` `#b1b7c7` 9.41 on the ground, 7.15 on raised (worst). Body text never drops below AAA on any surface.
- **Ochre is a fill, never text on light (brand refresh, 2026-09-22).** `color.brand.ochre` `#e8a83e` carries ink `cool.900` `#1d2030` text (7.76:1) in both themes. On light it is never text or a hairline (2.08:1 on white, 1.94:1 on the ground); lines and the ring on light are `color.brand.ochre-deep` `#b97a14` (3.34:1 on the ground, 3.59:1 on card). On dark, ochre clears 6.90:1 even on raised.
- **The focus ring means focus only.** 3px, 3px offset: ochre-deep in light (3.20:1 on panel), ochre in dark (8.70:1 on surface). Never at rest, never as decoration.
- **Links are ink with an underline**; hover thickens the underline to 2px (`border.width.medium`). Ink holds AAA everywhere, so link and button labels are AAA.
- **The pairs are checked, not just recorded.** `scripts/contrast-pairs.mjs` (in the gate) computes every declared foreground/background pair in both themes, plus the forbidden pairs that must stay failing.
- **Controls clear 3:1, hairlines are decoration.** `border-strong` (`cool.400` `#858b9f` light, `cool.500` `#686d7d` dark) is the input and control border, 3.13:1 worst. The hairline (`border` `cool.100` / `cool.800`, `border-subtle` and `border-faint` `cool.50` / `cool.850`) is decorative only and never marks a control.
- **Worst-ground-wins.** A text token passes on the *worst* surface it is allowed to sit on, or its usage metadata forbids that surface. Verified ratios are recorded per token in `$extensions.bella.a11y`, dated.

## Typography minimums

These are floors, not defaults. Going below is a bug.

- Reading text: **18px minimum**; body is `font-size.body` (20px, line-height 1.7), in `text-body`, never grey (type lock, Elleta, 2026-10-04)
- Titles (card, step): **22px, Figtree SemiBold 600**
- Section headings (H2): **34 to 40px**; H1 44 to 60px
- Nothing, anywhere, below **16px**: labels and meta sit at the 16px floor, in Figtree, sentence case, no tracking
- **Unique never below 24px** — the keycap brand lockup is the single recorded exception

Fine-print, captions, and metadata live at 13–14px and should be rare. If you're reaching for 12px, rethink the layout.

## Cool ground, white cards (colour B, Elleta, 2026-10-04; supersedes the 2026-09-22 white page)

The light page ground is `color.semantic.background` = `cool.25` `#f6f7f9`. Cards and raised surfaces are white (`surface-card` = `cool.0`); inset washes (tags, code) are `cool.50` `#eceef3`; the hover fill is the ground. The three-level tokens map onto it: `ground` = the page ground (`cool.25`), `raised` = the white card (`cool.0`). The selected wash (`accent-subtle`) is inset, `cool.50`, never the ground: selected must differ from hover, and it always carries a non-colour marker too (check or edge). Every grey is a step of the one cool ink-tinted ramp `color.cool.*` (OKLCH hue 272), so borders read softer and ochre pops harder. A disabled field has no fill of its own: muted text and the border mark it. Cards are flat at rest: white fill, a 1px hairline edge. The ink-tinted two-layer shadows (`shadow.card`, `shadow.ui`, theme-aware) exist for docs and floating UI; whether Card wears one at rest is an open decision. White alpha stays permitted as a translucent glass overlay.

Dark mode is the same hue and climbs lighter: ground `cool.975` `#0f1117`, surface and card `cool.950` `#171a22`, inset `cool.900` `#1d2030`, raised `cool.850` `#262a35`. `ground` is the dark ground (`cool.975`), `raised` is `cool.850`; the selected wash is inset (`cool.900`), since `cool.950` equals the card and would vanish there. Control borders (`border-strong` `cool.500`) never sit on raised (2.78:1).

**Colour lives in fills, never in strokes or body text** — except focus and status (amended 2026-09-22, Elleta). Focus is `color.semantic.focus-ring` (ochre-deep light, ochre dark). Status is `danger-*` and `success-*`: text at AA or better (4.5:1), borders and icons at 3:1, on every surface; a status colour never stands alone (an error is the danger edge + the WarningCircle icon + the message + `aria-invalid`). Every other stroke is 1px ink (`border-ink`) or hairline. The chip fills (`chip.c1` soft tiger-blue `#cfe0ef`, `c2` peach `#f6c9a8`, `c3` mint `#cfe8dc`) are the same in both themes and always carry `chip.text` `#17191a` (11.63:1 worst). A chip fill is never the only signal of state (1.16–1.52:1 against the light page). No purple anywhere.

## Surface behavior

- Cards: flat. `surface-card` fill, 1px `border-faint`, `radius.card` (16px), no shadow at rest, no accent-tinted border, no gradient or scrim over media. Only interactive cards (one link or one button) respond: on hover and focus-visible, `motion.transform.hover-lift` (`translateY(-2px)`) plus `shadow.hover`, over `motion.duration.lift` (200ms). No lift under reduced motion. A static card never changes on hover. The lift is the tell: it marks what you can click.
- Buttons: every tier shares `radius.lg` (12px, `component.button.shape.default`); `shape="pill"` uses `radius.full`. Buttons never lift on hover: lift is reserved for cards. Primary is an ink keycap, secondary a control outline that goes ink on hover, tertiary an ink link whose underline thickens; no accent colour on any tier at rest. Hover and focus-visible roll the label; active presses the primary keycap (`motion.transform.key-press`). No trace ring on buttons; the only ring is focus. The primary contact CTA reads "Let's talk". See `docs/motion-system.md`.
- One light source, upper-left: highlights top-left, shadows down-right (orbs, keycaps). The elevation tokens (`shadow.orb*`, `shadow.key-*`, `shadow.switch-*`) are a token lock for the existing components: do not flatten; the depth IS the system. **The new patterns (diagrams, steps, eyebrows, callouts) carry no shadow**: 1px ink strokes and hairlines only.
- Hover transitions are quick (≤250ms) and eased. No bouncing, no spring physics.
- **Diagram motion** (style unify, 2026-09-22): `motion.duration.draw` + `motion.easing.draw` for lines, `motion.duration.pop` + `motion.easing.pop` for elements appearing, `motion.stagger.min`–`max` between steps. Plays once when in view, then holds still; reduced motion shows the finished frame. The pop overshoot is for play-once reveals only, never hover or state changes.

## Actions in a view (layout foundation, 2026-10-03, Elleta)

One style per job, so a page never mixes button looks for the same kind of action:

- **Main action:** at most ONE keycap (Button `primary`, caps) per view, and only for the action the view exists for. Zero is fine. A keycap shown as a specimen (Atlas, Storybook) is content, not an action.
- **Secondary actions:** Button `secondary`.
- **Small inline actions** (on a tile, under an answer, in a list row, "Test", "Copy"): ActionChip, sentence case.
- **Navigation** (going somewhere else): Link, or NavList in a sidebar. Not a Button and not an ActionChip.
- **Filters, toggles, sort, picking a view:** FilterChip, SegmentedControl, Select. Never a Button.
- No locally styled `<button>` in a consuming app: if none of these fits, ask before inventing one.

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

- `color.cool.*` — the one grey ramp (colour B, 2026-10-04): `0` `#ffffff`, `25` `#f6f7f9`, `50` `#eceef3`, `100` `#e4e6ec`, `200` `#c3c7d2`, `300` `#b1b7c7`, `400` `#858b9f`, `500` `#686d7d`, `600` `#474c5e`, `700` `#3a3f50`, `800` `#2e3240`, `850` `#262a35`, `900` `#1d2030`, `950` `#171a22`, `975` `#0f1117`
- `color.light.*` — aliases into the ramp: ink `900`, muted `600`, line `100`, control `400`, panel `25`, inset `50`, bg `0`, ink-hover `700`
- `color.dark.*` — aliases into the ramp: ink `50`, muted `300`, line `800`, control `500`, surface `950`, inset `900`, raised `850`, bg `975`, ink-hover `200`
- `color.chip.*` — c1 soft tiger-blue `#cfe0ef` (from the pattern; replaced lavender, 2026-09-22), c2 peach `#f6c9a8`, c3 mint `#cfe8dc`, text `#17191a`; same in both themes, fills only
- `color.light.danger` `#b3261e` / `danger-subtle` `#fcebe9`, `color.light.success` `#1a7439` / `success-subtle` `#e6f3ea`; dark: danger `#ff8f84` / `#3a1714`, success `#72d08b` / `#12301d` (status tokens, 2026-09-22). Read through `color.semantic.danger-text`, `danger-border`, `danger-subtle` and the `success-*` set. Checked in the gate by `scripts/contrast-pairs.mjs`
- `color.brand.ochre` — `#e8a83e`, **the single accent**: a fill with ink text in both themes, and the dark focus ring
- `color.brand.ochre-deep` — `#b97a14`: ochre's line and ring on light surfaces
- `color.pattern.*` — the brand pattern (ochre ground, tiger blue, cream, rosette, pink, leopard green, zebra lime, ink, coral): BrandWordmark, PatternField and the favicon only. Never recoloured, never a UI or state colour.

Ochre is the only accent. Iris and periwinkle are retired (brand refresh, 2026-09-22). The chip fills are not accents: they are fills that carry no interaction meaning. Amber is retired. The 2026-07 brand values (`brand.ink`, `brand.ground`, `navy.*`, `night.*`) remain in the primitives for legacy consumers; semantic tokens no longer point at them (Card's fixed-context peek panel still re-scopes to the warm paper values).

The status ladder has **danger and success** (2026-09-22); warning and info are still open (issue #1). Supporting `steel` and `sage` are carried from the April identity for StatusPill's tints, **non-text roles only**. Do not use them as text; do not design new status UI around them, or invent warning/info values, without asking.

**Typography — Figtree, plus Geist Mono for code and the wordmark (the type lock for readability, Elleta, 2026-10-04; supersedes the 2026-09-22 Geist lock):**

- **Headings** — `typography.font-family.display` is **Figtree** at `font-weight.semibold` (600; Elleta, 2026-10-04, "pages win"), sentence case, `line-height.heading` (1.15). H1 (hero and page) 44 to 60px, tracks `letter-spacing.display` (-0.02em); H2 (section) 34 to 40px, tracks `letter-spacing.h2` (-0.015em). Through the Heading component and its contract.
- **Five sizes**: H1 44 to 60, H2 34 to 40, lead `font-size.lg` 21 to 22, body `font-size.body` 20, small `font-size.sm` 18. Titles use the lead size (`font-size.xl` 22px, Figtree 600, no tracking). Labels and meta 16px (`font-size.tag`).
- **Body and captions** — Figtree 400, `line-height.normal` (1.7), no tracking, colour `color.semantic.text-body` (light `cool.825` #2b2f3d, dark = text-primary). Captions differ by size (18px), not colour. `text-secondary` is for non-reading UI only: icons, placeholders, borders-as-text. Headings and titles wrap with `text-wrap: balance`, body, lead and captions with `text-wrap: pretty` (`typography.text-wrap.*`, emitted as zero-specificity base rules in bella.css). Text column 45 to 75 characters (about 640px at 20px).
- **Labels, buttons and meta** — Figtree, sentence case, no uppercase, no letter spacing, 16px minimum. Button labels are Figtree SemiBold (`font-weight.semibold`, 600) 16px at every size, height 44px or more. Eyebrow, Tag, StatusPill, SectionIndex and diagram labels moved off Mono.
- **Code** — `typography.font-family.mono`, **Geist Mono** 400 at `font-size.mono` (16px), only for real code and token names, never for labels.
- **Wordmark** — the logo is the **BrandWordmark** component (brand refresh, 2026-09-22): custom E, L, T, A, B stroke glyphs at the locked settings (weight 12, width 58, height 130, tracking 16, soft corners; the E, A and B bars on one low line), filled with the seeded brand pattern or in ink. ELLETA for the site, BELLA for the system. Never below 32px tall, never recoloured, never body type or a heading. `typography.font-family.wordmark` (Unique) remains for legacy consumers only.

**Icons — one set, declared (2026-07-22):** Iconoir (MIT, the portfolio's set) is BELLA's only icon source. Every glyph lives in the Icon registry (`src/components/Icon/registry.ts`) and renders through the Icon component: icon-ramp sizes, always currentColor, decorative by default. No mixing sets, no one-off inline SVGs anywhere; a meaningful icon requires a label and never stands without text unless its accessible name is proven in a Behavior story. audit:quality fails any inline `<svg>` outside the Icon component. **The one named exception (2026-09-22): diagram patterns** — FlowDiagram, ProcessSteps and case-study diagrams under `src/patterns/Diagrams/` — draw their own SVG, marked `data-bella-diagram`; 1px ink strokes and chip fills only, `role="img"` with an aria-label that tells the story. **The second named exception (brand refresh): brand art** — BrandWordmark and PatternField, marked `data-bella-brand`: a labelled image (`role="img"` + the word) or aria-hidden decoration, nothing in between.

Any value you see as `"TBD"` in the token JSON is a genuine unknown — stop and ask. Do not fill it in.

## Tiered inheritance

Repos that install BELLA as a `devDependency` inherit this AGENTS.md automatically. They may add their own `AGENTS.md` at their root to layer additional rules — but downstream rules only *extend* or *tighten* BELLA's. They do not relax them. A consuming repo cannot, for example, use pure white off the page ground, drop body text to 14px, put colour in a stroke outside focus and status, set ochre as text on light, or set Mono below 13px.

If a consuming repo's rules conflict with BELLA's, BELLA wins. Flag the conflict; don't silently resolve it.

## Data marks (2026-10-03, Elleta)

Data marks (sparklines, charts) may use inline SVG, marked `data-bella-diagram`, and must carry an accessible text equivalent: `role="img"` with an `aria-label` that says what the mark shows (Stat's sparkline: "Stories: 18 to 22 over 22 syncs"). Same drawing rules as diagrams: ink strokes, chip fills, no state colour.

## Relay (agents working on BELLA for CHIP)

- Instructions arrive in `~/DEV/chip/docs/reference/inbox/next.md` (CHIP repo, gitignored). When Elleta says "go", read it and do it.
- Reports go to `~/DEV/chip/docs/reference/inbox/report.md`: under 15 lines, then a "Needs Elleta" list (empty if none). Screenshots go to `~/DEV/chip/docs/reference/screens/` and are named in the report.
- When a step finishes, move `next.md` to `inbox/done/<date>-<short-name>.md`.
- **Decide alone** and log it in `~/DEV/chip/docs/reference/decisions-while-away.md` (what, why, how to undo): anything these rules already answer, anything that passes the gate and contrast checks, adding tests, snapshots or docs.
- **Stop and ask only for:** a brand change beyond an approved theme; removing or renaming a public BELLA API; anything touching git remotes or pushes; a gate that still fails after two fixes.
- Local CI: `.git/hooks/pre-commit` (local, not committed) runs `npm run gate` and the NDA scan on staged lines, and blocks the commit on failure.
- **A commit waits for green, every time.** Run the check and the commit as one `&&` chain (`npm run checkpoint && git commit …` in CHIP; the gate runs in BELLA's hook) or under `set -e`; never chain them with `;`, which commits even when the check fails (2026-10-03: a CHIP commit went in on a red checkpoint).
