# AGENTS.md — BELLA

Rules for any AI agent reading, writing, or consuming code that touches BELLA. These are not suggestions. Follow them, or the output is wrong.

BELLA is the design system for **ctrl_alt_design** (Elleta McDaniel's design engineering practice). It powers `elleta.design`, CHIP, and everything downstream. Its job is to keep that work editorial, deliberate, and recognizably not-AI-generic.

## Token-first, always

Never hard-code a hex value, an arbitrary pixel number, or a one-off font size. If the design calls for a color, spacing, radius, or type style, it resolves through a BELLA token. If the token you need doesn't exist yet, stop and ask — do not invent one inline and move on.

Reference tokens by path (`color.brand.iris`, `spacing.4`, `typography.font-size.base`). Consuming apps read `tokens/bella.json` as the source of truth.

## The accessibility bar (recorded 2026-07-21, Elleta)

**AAA-minded AA.** Concretely:

- **AAA for ink and body text.** Both ink ladders are verified AAA on every surface they sit on (light: 16.06 / 12.81 / 8.33 on ground; dark: 14.35 / 12.61 / 9.45 on navy). Body text never drops below AAA.
- **AA where the accent speaks.** Iris tops out at 5.96:1 on light surfaces — AAA accent text is not attainable and is not the bar. Accent text, buttons, and links are AA-verified per token.
- **The accent always theme-flips.** Iris in light, periwinkle in dark. Each fails its opposite ground so hard (2.64:1 / 2.24:1) that it is banned there **even as decoration** — the failure includes the 3:1 non-text minimum.
- **Worst-ground-wins.** A text token passes AA normal text on the *worst* surface it is allowed to sit on, or its usage metadata forbids that surface. Verified ratios are recorded per token in `$extensions.bella.a11y`, dated.

## Typography minimums

These are floors, not defaults. Going below is a bug.

- Body text: **16px minimum**
- Card titles: **20px minimum, weight 700**
- Section headings: **32px minimum**
- Nothing, anywhere, below **13px**
- **Unique never below 24px** — the keycap brand lockup is the single recorded exception

Fine-print, captions, and metadata live at 13–14px and should be rare. If you're reaching for 12px, rethink the layout.

## No pure white

Backgrounds are warm neutrals. `#ffffff` is banned as a solid fill. The default canvas is `color.brand.ground` (`#F5F4EF`) — warm off-white. Cards and raised surfaces are `color.neutral.paper` (`#FAFAF8`), separated from the page by lift and shadow, not darkness. White alpha is permitted only as a translucent glass overlay — the warmth comes from ground showing through.

Dark mode is navy (`color.brand.navy`, `#1B1B40`), not black. Dark elevation climbs lighter: page → `navy.card` (`#232350`) → `navy.raised` (`#2B2B5C`).

## Surface behavior

- Cards: radius from the token tier — `radius.xl` (16px) for `card.default`, `radius.2xl` (20px) elevated, `radius.3xl` (24px) glass. On hover, `motion.transform.hover-lift` (`translateY(-2px)`). The lift is the tell — cards are objects, not panels.
- Buttons: `radius.md` (8px); the primary keycap plate is `radius.lg` (12px).
- One light source, upper-left: highlights top-left, shadows down-right (orbs, keycaps, cards). The elevation tokens (`shadow.orb*`, `shadow.key-*`, `shadow.switch-*`) are a token lock — do not flatten; the depth IS the system.
- Hover transitions are quick (≤250ms) and eased. No bouncing, no spring physics.

## Aesthetic stance

Editorial. Confident. Closer to a magazine or a well-set book than a SaaS dashboard. Avoid:

- Gradient-on-gradient hero blobs
- Generic rounded-everything, pastel-everything, emoji-in-every-heading "friendly AI" UI
- Stock iconography where typography would do
- Centered everything — asymmetry is fine, often better

When in doubt, the answer is more type, less chrome.

## Resolved tokens — do not reinvent

BELLA's palette and typography are decided (the 2026-07 identity). The source of truth is `tokens/primitive.json`.

**Brand palette** (a named-color model, not primary/secondary/accent):

- `color.brand.ink` — `#1A1720`, near-black with a warm plum undertone; light-mode text
- `color.brand.ground` — `#F5F4EF`, warm off-white, the default canvas
- `color.brand.navy` — `#1B1B40`, deep blue-violet, the dark-mode page
- `color.brand.iris` — `#5B4BD1`, **the single accent**, light mode. At body scale iris means INTERACTIVE and only that.
- `color.brand.periwinkle` — `#A79CE2`, the same accent seen in dark mode; decorative lavender tints (alpha washes) in light

Iris and periwinkle are one accent in two modes — never two accents, never paired with a second accent color. Amber is retired.

Supporting `steel` and `sage` are carried from the April identity for status states, **non-text roles only**, pending a BELLA-native status ladder (open issue). Do not use them as text; do not design new status UI around them without asking.

**Typography — exactly two faces (the type lock):**

- `typography.font-family.display` — **Unique** (Bold/700 is the only cut). Display headings, the home hero headline, and the keycap brand lockup. Never below 24px (keycap logo excepted), never negative tracking, never for body/UI/card titles/eyebrows/nav/buttons/chips.
- `typography.font-family.body` — **Geist**. Everything else. Eyebrows are Geist caps with `letter-spacing.wider` — the tracking is the look.
- `typography.font-family.mono` — **retired**, repointed to Geist for legacy consumers. Do not reintroduce a mono family.

**Icons — one set, declared (2026-07-22):** Iconoir (MIT, the portfolio's set) is BELLA's only icon source. Every glyph lives in the Icon registry (`src/components/Icon/registry.ts`) and renders through the Icon component: icon-ramp sizes, always currentColor, decorative by default. No mixing sets, no one-off inline SVGs anywhere; a meaningful icon requires a label and never stands without text unless its accessible name is proven in a Behavior story. audit:quality fails any inline `<svg>` outside the Icon component.

Any value you see as `"TBD"` in the token JSON is a genuine unknown — stop and ask. Do not fill it in.

## Tiered inheritance

Repos that install BELLA as a `devDependency` inherit this AGENTS.md automatically. They may add their own `AGENTS.md` at their root to layer additional rules — but downstream rules only *extend* or *tighten* BELLA's. They do not relax them. A consuming repo cannot, for example, re-enable pure white, drop body text to 14px, or put iris on navy.

If a consuming repo's rules conflict with BELLA's, BELLA wins. Flag the conflict; don't silently resolve it.
