# Decision: OKLCH primitives with a hex base

Date: 2026-10-05 · Status: decided (Elleta approved the direction 5 Oct; this record covers the mechanism) · Branch: feat/light-ground-oklch

## Context

The light-ground change (stone ground, 5 Oct) was specified in OKLCH: `oklch(95% 0.005 85)`. BELLA's colour primitives were hex only, so a lightness ladder or a hue could not be read from the tokens, and alpha tints were hand-computed hex8 values that silently drift when their base colour moves.

## The problem

The hex values are not wrong. The problem is that they hide the model: a ramp is a fixed hue and chroma over a lightness ladder, and hex can't say that. Any change to the ink means re-deriving every tint by hand.

## Approaches looked at

- **Matthias Ott (matthiasott.com, read 5 Oct): hex base, OKLCH override.** Every ramp is declared in hex on `:root`, then redeclared in OKLCH inside `@supports (color: oklch(...))`, one fixed hue per ramp (`--gray-10: oklch(… 274.5)`). Roles switch with `light-dark()` and `color-scheme`. Hover and alpha use relative colour behind `@supports (color: oklch(from black l c h))`. Trade-off: two declarations per colour, but nothing breaks in an old browser.
- **DTCG colour module: an object `$value`.** `{"colorSpace": "oklch", "components": [L, C, H], "hex": "#…"}`. The most correct storage, but every consumer of `$value` as a string breaks at once: the build resolver, the Figma variable sync, bella.json readers and the portfolio's DTCG reader.
- **OKLCH only, no fallback.** The smallest output, but Figma has no OKLCH and pre-2023 browsers get no colour at all.

## Decision

1. **`$value` stays hex.** It is the base: every browser, Figma and every current consumer reads it.
2. **Each colour primitive carries `$extensions.bella.oklch`**, written as `oklch(L% C H)` or `oklch(L% C H / A%)`. Ramps keep one hue: `cool` at 272, `stone` at 85 (the approved values, exact). Named sets (brand, chip, pattern, status, supporting, alpha) are lists of different colours, not ramps, so each step keeps its own hue.
3. **The build checks it.** Every hex primitive must carry an OKLCH value within CIEDE2000 < 1 of its hex, or `tokens/build.py` fails. The two can't drift apart unseen.
4. **Output order:** the hex `:root` and theme blocks as before. Then `@supports (color: oklch(0 0 0))` redeclares the primitives in OKLCH, and points every colour-bearing semantic and component token at its reference by name (`var(--color-stone-95)`), not by value. Theme blocks inside the layer redeclare every variable that differs in that theme, because `:root` and `[data-theme]` match the same element at the same specificity and the later rule would otherwise win.
5. **Relative colour** sits in a second block behind `@supports (color: oklch(from black l c h))`. Each alpha tint whose base is a primitive becomes `oklch(from var(--base) l c h / N%)`. The button glosses' `color-mix(in srgb, white N%, transparent)` become `oklch(from white l c h / N%)`.
6. **Figma mirrors the hex.** Figma variables have no OKLCH. The Foundations variables keep the hex values; the OKLCH value lives in the token source and the build output only.

```
primitive.json   "95": { "$value": "#f0eeeb", …, "$extensions": { "bella": { "oklch": "oklch(95% 0.005 85)" } } }
bella.css        :root { --color-stone-95: #f0eeeb; --color-semantic-background: #f0eeeb; }
                 @supports (color: oklch(0 0 0)) { :root { --color-stone-95: oklch(95% 0.005 85);
                                                           --color-semantic-background: var(--color-stone-95); } }
```

## Why not the others

- **Not the DTCG object yet.** It is the right destination. Moving to it is one change in the build and the readers once the Figma sync and the portfolio reader accept objects; doing it now breaks four consumers for no visible gain.
- **Not `light-dark()` yet.** BELLA has three themes (light, dark, warm) switched by `[data-theme]` on `html` or `body`. `light-dark()` answers two, keyed on `color-scheme`. Adopting it means retiring warm or nesting a second mechanism, which is Elleta's call, not a pipeline detail. Open item below.
- **Not OKLCH only.** Figma and older browsers would lose the colours.

## Gate

- Contrast (`scripts/contrast-pairs.mjs`) is computed from the hex base. That is valid because every OKLCH value is held within ΔE2000 < 1 of its hex by the build check.
- The visual suite (axe and screenshots) renders the OKLCH layer in Chromium: 468 snapshots matched the hex baselines with no update.

## Open

- `light-dark()` for role switching (needs a decision on the warm theme).
- Move `$value` to the DTCG colour object once the consumers read it.

## References

- https://matthiasott.com (main stylesheet, read 5 Oct 2026): the `--gray-*` ramps at hue 274.5, the two `@supports` blocks, `light-dark()`, relative colour on hover.
- Design Tokens Community Group, Color module (colorSpace + components + hex).
