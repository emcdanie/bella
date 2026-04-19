# Typography

Typography is where BELLA earns the name. Most of the system's personality lives here — in the families, the ramp, and the floors below which nothing is allowed to go.

## Font families

- `typography.font-family.display` — **Georgia**, falling back to `'Times New Roman', serif`. Editorial serif used for display and body alike. Warm, confident, distinctive against the generic sans-serif AI aesthetic.
- `typography.font-family.body` — **Georgia**. Kept as a separate token in case body later splits from display, but currently identical to `display`.
- `typography.font-family.mono` — **JetBrains Mono**, falling back to `ui-monospace, 'SF Mono', Menlo, monospace`. Used for tags, chips, eyebrows, button CTA text, inline code, and technical metadata. Geometric and precise.

There is no sans-serif in BELLA, deliberately. See below.

## Serif as body, deliberately

Body in Georgia is the loudest statement BELLA makes. Most contemporary UI runs a sans — Inter, SF Pro, something geometric — because "sans is more readable on screens." That rule is thirty years old and modern screens render serifs beautifully.

Georgia-as-body is the anti-SaaS move. It signals that the work here is writing-first: case studies, essays, considered prose. Every AI product in 2026 ships with a rounded sans; BELLA ships with a serif and asks the reader to sit down for a minute.

If a surface genuinely needs the density of a sans — a table with forty rows, chart labels, a settings panel — reach for `typography.font-family.mono` (JetBrains Mono). No sans is coming. That's the point.

## The ramp

Nine named sizes, each with a purpose. `tag` is the hard floor — nothing goes below 13px anywhere. Sizes above `3xl` are display territory and must be used deliberately, not as default slot-fillers.

| Token | Size | Typical use |
|---|---|---|
| `typography.font-size.tag` | **13px** | Tags, chips, eyebrows, button CTAs, inline code. Mono, uppercase, tracked wide. |
| `typography.font-size.sm` | 14px | Captions and footnotes only. Never body copy. |
| `typography.font-size.base` | **16px** | Body paragraph floor. The minimum for reading text in BELLA. |
| `typography.font-size.lg` | 18px | Lead paragraphs, long-form case-study body. |
| `typography.font-size.xl` | **20px** | Card title floor. Pair with `font-weight.bold` (700). |
| `typography.font-size.2xl` | 24px | Heading-3, component titles in docs. |
| `typography.font-size.3xl` | **32px** | Section heading floor. Pair with `font-weight.black` (800). |
| `typography.font-size.4xl` | 40px | Heading-1, page titles. |
| `typography.font-size.5xl` | 56px | Display. Hero headlines, landing-page impact lines. |

The bolded rows are floors, not defaults: body is never below 16px, card titles never below 20px/700, section headings never below 32px/800. The rest of the ramp exists to fit the right size to the right job, not to give you wiggle room to undershoot.

## Hard floor: 13px

Nothing renders below 13px. Not captions, not metadata, not disclosure text, not legal footers. 13–14px is the caption zone and should be used sparingly — if you find yourself reaching for 12px to "make it fit," the layout is wrong, not the type size.

## Why the minimums matter

The defaults in most frameworks (14px body, 16px headings, 600-weight everything) produce a soft, middle-of-the-road voice. Readable, forgettable. BELLA's minimums push in the opposite direction:

- **16px body** respects the reader. It's the threshold below which long-form becomes work.
- **20px / 700 card titles** make objects feel like objects. A 16px/600 card title looks like body text that got promoted.
- **32px / 800 section headings** carry real weight on the page. 24px/600 is a subtitle, not a heading.

The weight contrast between 400 body and 700/800 heads is intentional. It's what gives BELLA its editorial feel. A flat ramp (400 → 500 → 600) reads as cautious. The 400 → 700 → 800 ramp reads as confident.

## Weights

Georgia ships a regular (400) and a bold (700). BELLA declares a black (800) for section-heading and display slots; on systems without a native Georgia black, browsers render it as Georgia Bold — acceptable for now. If we later adopt a heavier display face to hit a true 800, that's a token swap, not a layout change.

Used weights:

- **400** (`regular`) — body paragraphs
- **500** (`medium`) — tag and eyebrow mono text, UI emphasis
- **700** (`bold`) — card titles, heading-2, button CTAs
- **800** (`black`) — heading-1, display, section-heading floor

## Italic

Georgia has a true italic. Use it for emphasis in prose, for book and publication titles, and for scientific names — the things italics have always been for. Avoid `font-style: italic` on JetBrains Mono: the synthesized slant reads wrong in a mono.

Small caps aren't set. If the next type update adds them, they'll arrive as a `font-variant` utility, not a separate face.

## Line length

Aim for 60–75 characters per line for body text. BELLA sets this as a layout concern, not a type token, but the typography rules assume prose is read at comfortable measure — not stretched across a 1400px container.
