# Typography

Typography is where BELLA earns the name. Most of the system's personality lives here — in the two faces, the ramp, and the floors below which nothing is allowed to go.

## Font families — exactly two (the type lock)

- `typography.font-family.display` — **Unique**, falling back to `'Arial Narrow', sans-serif`. The condensed identity face. Bold (700) is the only cut. It renders in exactly three places: display headings (hero / page / section / case tiers), the home hero headline, and the keycap brand lockup. Nowhere else.
- `typography.font-family.body` — **Geist**, falling back to `system-ui, sans-serif`. Everything Unique doesn't carry: body, card titles, labels, eyebrows, buttons, navigation, metadata.
- `typography.font-family.mono` — **retired** (2026-07-17). The token remains and repoints to Geist so legacy consumers keep rendering. The eyebrow look is caps + tracking, not a third family. Do not reintroduce a mono face.

The Georgia/JetBrains-Mono pairing was the April identity; it is fully replaced.

<!-- TODO(elleta): the "why Unique" voice paragraph — the story the serif essay used to
     carry. What Unique signals, why condensed display against a quiet grotesk, in your
     words. The factual constraints are recorded below; the conviction is yours to write. -->

## Unique's hard constraints

These come from the face itself and are encoded in token metadata:

- **700 only.** Unique ships one cut. `font-weight.black` (800) is Geist-only.
- **Never below 24px** (`font-size.2xl`) — except the keycap brand lockup, the single recorded exception. Consumer gates enforce this.
- **Never negative tracking.** Condensed glyphs collide below 0; Unique display settings always track ≥ 0 (`letter-spacing.normal`). `letter-spacing.tight` is Geist-only.
- Always all-caps in the established display treatments, with the accent-word pattern where the design already does that.

## Eyebrows

Geist, uppercase, `font-size.sm` (14px — one ramp step up from tag; 13px read too quiet under the display heads), weight 700, tracked with `letter-spacing.wider` (0.15em). The tracking IS the old mono look. Eyebrows are wayfinding, not action — they never wear the interactive accent color.

## The ramp

Nine named sizes, each with a purpose. `tag` is the hard floor — nothing goes below 13px anywhere. Sizes above `3xl` are display territory and must be used deliberately, not as default slot-fillers.

| Token | Size | Typical use |
|---|---|---|
| `typography.font-size.tag` | **13px** | Tags, chips, button CTAs. Geist, uppercase, tracked wide. |
| `typography.font-size.sm` | 14px | Eyebrows, captions, footnotes. Never body copy. |
| `typography.font-size.base` | **16px** | Body paragraph floor. The minimum for reading text in BELLA. |
| `typography.font-size.lg` | 18px | Lead paragraphs, long-form case-study body. |
| `typography.font-size.xl` | **20px** | Card title floor. Geist, `font-weight.bold` (700). |
| `typography.font-size.2xl` | 24px | Heading-3 — and the Unique display floor. |
| `typography.font-size.3xl` | **32px** | Section heading floor. |
| `typography.font-size.4xl` | 40px | Heading-1, page titles. |
| `typography.font-size.5xl` | 56px | Display. Hero headlines, landing-page impact lines. |

The bolded rows are floors, not defaults: body is never below 16px, card titles never below 20px/700, section headings never below 32px. The rest of the ramp exists to fit the right size to the right job, not to give you wiggle room to undershoot.

Consumers with fluid type define one clamp() pair per ramp step, endpoints on the ramp, in one place — no ad-hoc clamps in components.

## Hard floor: 13px

Nothing renders below 13px. Not captions, not metadata, not disclosure text, not legal footers. 13–14px is the caption zone and should be used sparingly — if you find yourself reaching for 12px to "make it fit," the layout is wrong, not the type size.

## Why the minimums matter

The defaults in most frameworks (14px body, 16px headings, 600-weight everything) produce a soft, middle-of-the-road voice. Readable, forgettable. BELLA's minimums push in the opposite direction:

- **16px body** respects the reader. It's the threshold below which long-form becomes work.
- **20px / 700 card titles** make objects feel like objects. A 16px/600 card title looks like body text that got promoted.
- **32px section headings** carry real weight on the page — and at display scale, Unique needs more size than a grotesk in the same slot; give it room.

The weight contrast between 400 body and 700 heads is intentional. A flat ramp (400 → 500 → 600) reads as cautious. BELLA's reads as confident.

## Weights

- **400** (`regular`) — body paragraphs
- **500** (`medium`) — tag text, UI emphasis
- **700** (`bold`) — all Unique display settings, card titles, eyebrows, button CTAs
- **800** (`black`) — Geist-only emphasis weight. Never on Unique (no such cut); never body or card titles.

## Line length

Aim for 60–75 characters per line for body text (case-study prose runs ~70ch). BELLA sets this as a layout concern, not a type token, but the typography rules assume prose is read at comfortable measure — not stretched across a 1400px container.
