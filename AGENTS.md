# AGENTS.md — BELLA

Rules for any AI agent reading, writing, or consuming code that touches BELLA. These are not suggestions. Follow them, or the output is wrong.

BELLA is the design system for **ctrl_alt_design** (Elleta McDaniel's design engineering practice). It powers `elleta.design`, CHIP, and everything downstream. Its job is to keep that work editorial, deliberate, and recognizably not-AI-generic.

## Token-first, always

Never hard-code a hex value, an arbitrary pixel number, or a one-off font size. If the design calls for a color, spacing, radius, or type style, it resolves through a BELLA token. If the token you need doesn't exist yet, stop and ask — do not invent one inline and move on.

Reference tokens by path (`color.neutral.100`, `spacing.4`, `typography.body`). Consuming apps read `tokens/bella.json` as the source of truth.

## Typography minimums

These are floors, not defaults. Going below is a bug.

- Body text: **16px minimum**
- Card titles: **20px minimum, weight 700**
- Section headings: **32px minimum, weight 800**
- Nothing, anywhere, below **13px**

Fine-print, captions, and metadata live at 13–14px and should be rare. If you're reaching for 12px, rethink the layout.

## No pure white

Backgrounds are warm neutrals. `#ffffff` is banned. The default canvas is `color.brand.parchment` (`#F7F4EF`) — warm off-white, closer to uncoated paper than to screen white. Cards and raised surfaces step up to `color.neutral.100` (`#F0EDE8`), a subtly darker warm gray that separates object from page without cold shadow. White reads as a Figma default that nobody styled. BELLA is warmer than that on purpose.

## Surface behavior

- Cards: `border-radius: 12px`. On hover, `transform: translateY(-2px)`. The lift is the tell — cards are objects, not panels.
- Buttons: `border-radius: 8px`.
- Hover transitions are quick (≤200ms) and eased. No bouncing, no spring physics.

## Aesthetic stance

Editorial. Confident. Closer to a magazine or a well-set book than a SaaS dashboard. Avoid:

- Gradient-on-gradient hero blobs
- Generic rounded-everything, pastel-everything, emoji-in-every-heading "friendly AI" UI
- Stock iconography where typography would do
- Centered everything — asymmetry is fine, often better

When in doubt, the answer is more type, less chrome.

## Resolved tokens — do not reinvent

BELLA's palette and typography are decided. The source of truth is `tokens/primitive.json`.

**Brand palette** (a named-color model, not primary/secondary/accent):

- `color.brand.ink` — `#0F1117`, warm near-black with a blue-cool undertone
- `color.brand.parchment` — `#F7F4EF`, warm off-white, the default canvas
- `color.brand.amber` — `#C4956A`, the single accent, used sparingly
- `color.brand.slate` — `#1A1D27`, raised surface on ink

Plus a supporting palette: `steel`, `dusk`, `sage`, `linen`. Amber is the only accent — never pair it with a second accent color.

**Typography:**

- `typography.font-family.body` and `.display` — **Georgia**. Serif body is deliberate; see `docs/typography.md`.
- `typography.font-family.mono` — **JetBrains Mono**, for tags, eyebrows, CTA text, inline code.

Any value you see as `"TBD"` in the token JSON is a genuine unknown — stop and ask. Do not fill it in.

## Tiered inheritance

Repos that install BELLA as a `devDependency` inherit this AGENTS.md automatically. They may add their own `AGENTS.md` at their root to layer additional rules — but downstream rules only *extend* or *tighten* BELLA's. They do not relax them. A consuming repo cannot, for example, re-enable pure white or drop body text to 14px.

If a consuming repo's rules conflict with BELLA's, BELLA wins. Flag the conflict; don't silently resolve it.
