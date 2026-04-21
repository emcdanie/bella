# BELLA Rules — v0.1

Governance rules for any consumer of BELLA (apps that import `tokens/bella.css` or install BELLA as a dependency). These are mandatory. A consuming repo cannot relax them — see `AGENTS.md` "Tiered inheritance."

Where a rule references a token, that token is defined in `tokens/bella.css`. Consumers that don't currently expose a referenced token (e.g. `--header-height`) must define it locally; consumers must never fork the rule to use a different name.

## 1. Text on dark surfaces uses `--ink-on-dark-*` tokens

Any text that sits on a dark surface (ink, slate, brand-dark CTA blocks, dark embedded sections inside light pages, dark footers) must use the fixed-context tokens:

- `--ink-on-dark-strong` — headings, primary copy, pulled emphasis. AAA against ink.
- `--ink-on-dark-body` — secondary body copy and labels. AAA body against ink.
- `--ink-on-dark-muted` — placeholders, metadata, low-emphasis labels. **Always ≥ 4.5:1 large / 7:1 body.**

Rationale: `--color-semantic-text-*` flips with `[data-theme="dark"]`, which is wrong for dark surfaces embedded in light pages (the dark footer on a light home page must stay parchment-on-ink in both themes). Fixed-context tokens decouple "surface tone" from "page mode."

## 2. Sibling cards in a grid share equal heights

Grids with cards as children must use:

```css
.grid          { display: grid; align-items: stretch; }
.card          { height: 100%; display: flex; flex-direction: column; }
.card .body    { flex: 1; }
```

No `min-height: NNNpx` on cards with variable content. Equal height comes from the grid + flex pattern, never from a fixed pixel floor.

Rationale: a fixed minimum punishes short cards (excess whitespace) and lies about long cards (clips at the floor). Stretch + flex grows every sibling to match the tallest, which is the only honest answer.

## 3. Card copy never truncates with ellipsis by default

`text-overflow: ellipsis`, `-webkit-line-clamp`, and equivalent truncation rules are forbidden on card body copy unless the card is explicitly opted in via the modifier class `Card--truncate`. Default behaviour is grow-to-content.

Rationale: truncation hides information the writer chose to include. If the design needs short copy, shorten the copy; don't clip it. `Card--truncate` exists for genuine listing UIs (file pickers, autocomplete) where the title is a label, not prose.

## 4. Sticky-header pages set `--header-height` and use `scroll-padding-top`

Any consumer that has a fixed/sticky header must:

1. Define `--header-height` at `:root` (BELLA ships a default of `64px`; consumer overrides per their actual measured header).
2. Apply `scroll-padding-top: calc(var(--header-height) + var(--spacing-4))` to the document scroll container (`html`) **and** the page content wrapper.
3. Apply `scroll-margin-top: calc(var(--header-height) + var(--spacing-4))` to anchor targets (`section[id]`, `[id]` headings).

Rationale: anchor jumps under a fixed nav land *behind* the nav by default. Both `scroll-padding-top` (on the scroll container) and `scroll-margin-top` (on the target) are needed because browsers honor whichever one applies; tokenising `--header-height` is the only way the offset stays correct when the header is restyled.

## 5. Grids use `auto-fill, minmax(var(--card-min), 1fr)` — not `repeat(3, 1fr)`

```css
.cards { grid-template-columns: repeat(auto-fill, minmax(var(--card-min), 1fr)); }
```

`var(--card-min)` defaults to `280px` and is overridable per-grid. Hard `repeat(N, 1fr)` is permitted only when the data is exactly N items and N never grows. Trailing rows must fill left-aligned — no orphan card, no centered widow.

Rationale: a fixed 3-column grid leaves a single dangling card whenever the dataset isn't a multiple of 3. Auto-fill collapses gracefully across viewport widths and adapts when the dataset grows.

## 6. Focus states use `--ring-focus-*` tokens; never `outline: none` without a replacement

```css
.focusable:focus-visible {
  outline: var(--ring-focus-width) solid var(--ring-focus-color);
  outline-offset: var(--ring-focus-offset);
}
```

`outline: none` is permitted only when an equivalent `box-shadow` ring or `border` swap is provided. A `:focus` rule that removes the outline and adds nothing visible is a WCAG 2.4.7 failure.

Rationale: the only acceptable reason to remove the default outline is that BELLA's ring is more legible — never that the design "looks cleaner." Keyboard users need a visible focus indicator at all times.

## 7. Body text ≥ 16px; line-height ≥ 1.5 body, ≥ 1.2 display

Body text below `--typography-font-size-base` (16px) is forbidden. Caption-style 13–14px text is allowed only for genuine metadata (`tag`, `eyebrow`, table footnote). Line height is `--typography-line-height-normal` (1.6) or higher for body, `--typography-line-height-tight` (1.1) or `--typography-line-height-snug` (1.3) for display headings.

Rationale: 14–15px body looks tighter on a Figma export than it reads on a real device; the floor is conservative on purpose. Generous leading is the editorial default.

## 8. No pure `#FFFFFF` or `#000000` — use `--color-semantic-surface-*` and `--color-semantic-text-*`

Pure white reads as unstyled. Pure black is colder than BELLA's warm-ink; it disrupts the warm-neutral cascade. The default canvas is `--color-semantic-background` (`#F7F4EF`); raised surfaces are `--color-semantic-surface` (`#F0EDE8`); text is `--color-semantic-text-primary` (`#111111`) or `--color-brand-ink` (`#0F1117`). Hex `#fff` and `#000` should never appear in consumer CSS.

Rationale: stated in `AGENTS.md` and `docs/principles.md` — repeated here because it's the most-frequently-violated rule in practice.

---

## Compliance posture

- These rules apply to **all consumer code that targets BELLA**, including hand-written components, generated CSS, and arbitrary Tailwind values.
- Existing legacy code that violates a rule should be migrated, not grandfathered. Track exceptions in the consumer's `migration/AUDIT.md` (or equivalent).
- If a rule conflicts with a design comp, escalate the design — not the rule. BELLA's whole point is that the system, not the screen, is the source of truth.

## Versioning

This is the **v0.1** rule set. Future versions may add rules; they may not relax existing ones. When BELLA bumps to v0.2, this file becomes `docs/RULES-v0.1.md` and `docs/RULES.md` updates to the new spec.
