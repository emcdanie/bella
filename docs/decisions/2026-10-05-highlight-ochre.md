# Highlight in ochre · 2026-10-05

**Decision (Elleta):** "I wanted those texts to be the ochre, since technically they change when you hover them, which was the original idea." The highlight (a linked phrase, or the part of a picture it points at, lit on hover, focus or pin) is brand ochre, not the grey `--tint-soft` (a 14% mix of surface-inset) the site uses today.

## Tokens
| token | light (and warm) | dark |
|---|---|---|
| `color.semantic.highlight-wash` | `color.alpha.ochre-24` (#e8a83e at 23.9%) | `color.alpha.ochre-18` (18%) |
| `color.semantic.highlight-edge` | `color.cool.900` (ink) | `color.brand.ochre` |
| `color.semantic.highlight-text` | `color.cool.900` (text-primary) | `color.cool.50` (text-primary) |

The washes are hex with alpha (the base every browser and Figma reads) and relative colour in the OKLCH layer (`oklch(from var(--color-brand-ochre) l c h / 23.9%)`), emitted by the build like every other alpha tint.

## The lit state is not colour alone
Wash + a 2px edge: an underline (`border.width.medium`) for text, an outline for a picture target. The text stays ink. Hover, focus and pinned share one lit look; focus adds the focus ring, pinned carries `aria-pressed`.

## Bars (checked in the gate, `scripts/contrast-pairs.mjs`, wash composited over each surface)
| theme | surface | text on wash (≥ 7) | edge on wash (≥ 3) | edge beside surface (≥ 3) |
|---|---|---|---|---|
| light | ground | 12.12 | 12.12 | 13.93 |
| light | card | 13.34 | 13.34 | 15.71 |
| light | inset | 12.08 | 12.08 | 13.90 |
| dark | ground | 11.76 | 6.56 | 9.08 |
| dark | card | 10.59 | 5.91 | 8.37 |
| dark | inset | 9.78 | 5.46 | 7.76 |
| warm | inset (worst) | 11.31 | 11.31 | 12.75 |

## Departure from the brief, and why
The brief asked for `ochre-deep` (#b97a14) as the light edge. On the wash it measures 2.69:1 over the ground and inset, 2.97 over card, and 2.51 over warm inset: under the 3:1 non-text bar. The light edge is ink instead, which keeps the ochre where it shows (the wash). A darker ochre line step, **#a76e12**, would clear 3:1 on every light and warm wash (worst 3.03), but it is a new brand colour, so it waits for Elleta.

**Undo:** point `highlight-edge` (light) back at `color.brand.ochre-deep`; the gate will fail the three edge-on-wash pairs, which is the point.
