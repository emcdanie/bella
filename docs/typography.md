# Typography

Typography is set for reading (type lock, Elleta, 4 Oct 2026; supersedes the Unique and Geist locks). One face carries everything anyone reads, five sizes cover every job, and the floors below are rules, not suggestions.

## Font families

- `typography.font-family.display` and `typography.font-family.body` — **Figtree**, falling back to `system-ui, sans-serif`. Headings, body, labels, buttons, navigation and meta.
- `typography.font-family.mono` — **Geist Mono**, for real code and token names only, at 16px. Never labels, eyebrows or meta.
- Unique is retired (2026-10-08). The wordmarks are drawn SVG (BrandWordmark), not set in a font. The `typography.font-family.wordmark` token is removed.

## The five sizes, plus labels

| Role | Token | Size | Notes |
|---|---|---|---|
| Hero | `font-size.display-hero` (Display/Hero) | 48 to 82px | Figtree 600; the hero tier only, one per page |
| H1 | `font-size.display-page` (Display/Page) | 44 to 60px | Figtree 600, -0.02em, line height 1.15 |
| H2 | `font-size.display-section` (Display/Section; `4xl` is the fixed 40px) | 34 to 40px | Figtree 600, -0.015em |
| Lead | `font-size.lg` | 21 to 22px | Card and item titles use this size: `font-size.xl`, 22px, Figtree 500 |
| Body | `font-size.body` | 20px | Figtree 400, line height 1.7, no tracking, `text-body` |
| Small | `font-size.sm` | 18px | Captions; same ink as body, smaller size |
| Labels and meta | `font-size.tag` | 16px | Sentence case, no caps, no tracking; buttons Figtree SemiBold 16 |
| Quote | `font-size.quote`, `line-height.quote` | 24 to 32px | Figtree 400, line height 1.08; the mark is `font-size.quote-mark` (144px), decorative |

Every display size is fluid from 390 to 1440 (`clamp()`), so a phone reads the 390 value and Figma's phone styles carry it. Button and Tag labels read `font-size.tag`; Avatar initials read `tag`, `base` and `xl` by size, all in Figtree.

`font-size.base` (20px, updated 2026-10-08 to match Figma Body/Base) is the UI text size for controls; `font-size.6xl` (88px) is cover only: the Figma file cover and doc-site covers, never reading text. The 24, 32 and 56px steps are retired.

## Floors

- Nothing, anywhere, below **16px** (`audit:quality`).
- Long-form reading text never below **18px**; body is 20px.
- Headings balance their lines (`text-wrap: balance`); body, lead and captions avoid widows (`text-wrap: pretty`). Both come from `typography.text-wrap.*`, emitted as zero-specificity base rules in `bella.css`.

## Colour

Body and captions use `color.semantic.text-body` (light `cool.825` #2b2f3d, dark = text-primary): near-black, never grey. `text-secondary` is for non-reading UI only (icons, placeholders, borders-as-text).

## Weights

- **400** (`regular`): body and lead
- **600** (`semibold`): headings, titles and button labels
- **700** (`bold`): strong labels, never a heading weight

## Line length

Body text runs 45 to 75 characters per line, about 640px at 20px. A layout concern, not a type token, but the rules assume prose is read at that measure, never stretched across a wide container.
