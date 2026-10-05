# Changelog

All notable changes to BELLA. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning is semver against the token contract (see CONTRIBUTING.md). Releases are tagged `vX.Y.Z-bella`.

## [Unreleased]

### OKLCH primitives (2026-10-05)
- **Every colour primitive carries `$extensions.bella.oklch`** beside its hex `$value`; ramps keep one hue (`cool` 272, `stone` 85), named sets keep each colour's own hue. Max drift CIEDE2000 0.81; the build fails at 1 or more. Decision record: `docs/decisions/2026-10-05-oklch-primitives.md`.
- **bella.css gains an OKLCH layer**: hex stays the base; `@supports (color: oklch(0 0 0))` redeclares the primitives in OKLCH and points every colour-bearing semantic and component token at its reference by name, per theme. A second `@supports` block derives the alpha tints (`oklch(from var(--base) l c h / N%)`) and the button glosses with relative colour.
- No visible change: all 468 visual baselines match without an update. Figma variables keep the hex (no OKLCH in Figma). `light-dark()` deferred (three themes, see the record).

### Light ground (2026-10-05)
- **Stone ground and stone cards** (light only; BREAKING visually): `background` and `ground` = new `color.stone.95` oklch(95% 0.005 85) #f0eeeb (was cool.25 #f6f7f9); `surface-card` and `raised` = `color.stone.99` oklch(99% 0.002 85) #fcfcfa (was white). Why: Elleta chose a warmer, softer ground for accessibility (5 Oct); 95% lightness is the floor that keeps muted text AAA (7.36:1).
- **Card edge** reads `border-subtle` (was `border-faint`); light `border-subtle` cool.50 to cool.100, 1.22:1 on the stone card (cool.50 was 1.13:1).
- **Selected wash** `accent-subtle` light = new `stone.92` #e6e4e1 (cool.50 was 1.00:1 on the new ground; now 1.10:1 vs page, 1.24:1 vs card).
- **`icon-muted`** light cool.400 to cool.500: 4.45:1 on the ground (cool.400 was 2.93:1, and 2.92:1 on inset before this change).
- Dark and warm unchanged (warm overrides every changed variable).

### Hero, quote and the keycap edge (2026-10-05)
- **`font-size.display-hero` 48 to 82px** (BREAKING visually, the hero tier only): fluid 390 to 1440, matching the site hero words (82 at 1440, 48 floor). Was 44 to 60. Why: the type role map (Elleta, 4 Oct) gives the hero its own tier above Display/Page. `display-page` (44 to 60) and `display-section` (34 to 40) were already fluid; their descriptions now name the Figma styles.
- **Quote style**: `font-size.quote` (24 to 32px, Figtree Regular), `line-height.quote` (1.08, as on the site) and `font-size.quote-mark` (144px, one mark size everywhere). Why: the site set quotes in raw 32 with three different mark sizes.
- **Labels on the type tokens**: Tag reads `font-size.tag` (was the `mono` alias, same 16px); Button and Avatar already did. Stale "Geist" notes in Button, Tag and the contract corrected to Figtree.
- **Keycap edge straight** (`shadow.key-resting`, `-hover`, `-pressed`): the edge is `0 2px 0` (pressed `0 1px 0`) in the ink one step darker than the face, no x offset; the soft drop stays. Light edge `cool.950`, dark edge `cool.100` through new `shadow.key-*-dark` primitives and semantic dark `shadow.key-*`. Why: the 1px 3px 0 hard edge read as a misaligned, clipped corner (Elleta flagged it twice). The primary focus ring's pseudo-element now clears the 2px edge only (`inset: -1px -1px -3px -1px`).

### Heading weight (2026-10-04)
- **Headings and titles Figtree SemiBold 600** (`typography.font-weight.semibold`): `component.heading.font-weight` (hero, page, section), `component.resource-card.default.title-font-weight` and the ProcessSteps step title. Why: pages win; Elleta picked 600 over the 500 kept "for now" in the type lock. Token descriptions, AGENTS.md and the Heading and Typography stories updated; `font-weight.light` no longer carries any heading.

### Type lock for readability (2026-10-04)
- **Figtree** (vendored variable woff2, SIL OFL) for headings, body, labels and buttons; Geist Mono for real code and token names only, 16px. Why: Elleta could not read the pages comfortably (small grey body, tiny caps mono labels, too many sizes); readability is a hard requirement.
- **Five sizes** (BREAKING): H1 44-60, H2 34-40 (`font-size.4xl` 40 = fixed H2), lead 21-22, body 20 fixed (line height 1.7), small 18; labels 16; titles 22. `font-size.2xl`, `3xl`, `5xl` removed; `6xl` 88 is cover only. Headings Figtree 500 (kept "for now", Elleta; moved to 600 the same day, see Heading weight).
- **`color.semantic.text-body`** (light `cool.825` #2b2f3d, dark = text-primary) for every sentence anyone reads, captions included; captions differ by size, not colour. `text-secondary` is non-reading UI only. Rejected: a separate caption ink (#33384a, too close to need a token) and #5b6072 captions (5.83:1, below the 7:1 muted bar).
- **No caps, no tracking** on any label; Button labels Figtree SemiBold 16, sentence case, every size. Eyebrow, Tag, StatusPill, SectionIndex and diagram labels moved off Mono.
- **Gate floors raised**: 16px hard floor, 18px for long-form text (audit:quality, docs audit); docs code at 16px.
- **Reading flow**: `typography.text-wrap.heading` (balance) and `.body` (pretty), emitted as zero-specificity `:where()` base rules in bella.css (fixed the CaseMeta lead widow).
- Avatar `sm` 32 to 40px so the 16px initials have room; Card peek re-scopes `text-body` to the paper ink.

### Colour direction B (2026-10-04)
- **`color.cool.*`** (BREAKING): one cool ink-tinted grey ramp (OKLCH hue 272, 16 steps incl. 825) that both themes read from; `color.light.*` / `color.dark.*` are aliases into it. Why: greys with a hint of ink make borders softer, text calmer and ochre pop harder (concept lock, Elleta, 4 Oct). Ochre stays the only accent; indigo is for case visuals only and not in BELLA.
- **Surfaces**: light ground `cool.25`, white cards, inset `cool.50`; dark ground `cool.975`, surface `cool.950`, raised `cool.850`. New `hover-fill`, `icon-muted`. Three lock values were tuned to hold the gate: secondary `#474c5e` (lock #5b6072 was 5.83:1), control border `#858b9f` (lock #c3c7d2 was 1.58:1), dark secondary `#b1b7c7`.
- **Ink-tinted two-layer shadows** `card-ink`, `ui-ink` (+ dark) and theme-aware `shadow.card` / `shadow.ui`.
- **Card at rest wears `shadow.card`** (Elleta, 4 Oct; was flat): every Card, ResourceCard included. Interactive cards keep the 2px lift and `shadow.hover` on hover and focus; static cards never change on hover; Peek stays flat (re-scopes `--shadow-card` to none). The rest-state contract asserts the shadow through a new `expectVar` invariant, resolved in the card's own context so both themes and Peek are checked.
- **audit:quality pure-white rule inverted**: white is the card surface; a page ground painted pure white fails.
- **Surface levels on colour B** (rebase onto main, 4 Oct): `ground` = the page ground (light `cool.25`, dark `cool.975`), `raised` = the card (light white `cool.0`, dark `cool.850`); light `color.light.inset` = `cool.50`.
- **Selected wash never equals the hover fill**: `accent-subtle` light `cool.50` (was `cool.25`, the hover fill), dark `cool.850` (`cool.950` is the card, `cool.900` only 1.08:1 on it). Light 1.08:1 vs hover, 1.16:1 vs card; dark 1.32:1 vs hover, 1.21:1 vs card. Always with a non-colour marker (check or edge).
- **Control borders one step each** (BREAKING visually, fields only): `border-strong` light `cool.400` to `cool.500`, dark `cool.500` to `cool.400`, to clear main's 3:1 pairs (light 4.44 on inset, dark 4.23 on raised, the worst cases).
- **The inset rule replaces the "inset vs panel" visibility pair**: the inset fill is decorative; a field on inset must carry `border-strong`; Stage, Tag, StatusPill neutral, Kbd, Avatar and the hover / active / disabled state fills are exempt with a reason each; an unclassified inset consumer fails the gate (`scripts/contrast-pairs.mjs`).
- **Warm theme not on colour B yet**: `semantic/warm.json` is unchanged and still overrides light with its parchment values. Decision deferred (Elleta).
- **Main's components on the type lock**: Section heading, Stat value and ScoreStrip score move off the retired `font-size.3xl` to `display-section`; Section and PageHeader headings to semibold; NavList's toggle no longer renders its hidden label at the UA 13.33px; Kbd and compact FilterChip now sit at the 16px floor.

### Surface levels (2026-10-03)
- **`color.semantic.ground` and `color.semantic.raised`** (added, no component reads them yet): three surface levels for the portfolio's Gate 2 layout, ordered ground < inset < raised in every theme. Light `#e3e3e3` / `#ffffff`, dark `#0d0d0d` / `#262626`, warm `#e3dbcf` / `#fbfaf7`, all from existing primitives. Ink is AAA on both in all themes; muted on ground is AA only in light and warm (forbidden pair, put meta on raised). Re-sync consumers with `audit:sync`.

### Brand refresh (2026-09-22)
- **Ochre replaces iris and periwinkle** (BREAKING): `color.brand.ochre` `#e8a83e` (a fill, always with ink text, 9.01:1) and `color.brand.ochre-deep` `#b97a14` (its line and focus ring on light). Removed: `color.brand.iris`, `color.brand.periwinkle`, the `color.iris.*` ramp and the iris / periwinkle alphas. Every semantic reference repointed; links and `text-accent` are ink.
- **Focus ring**: 3px with a 3px offset, ochre-deep light (3.20:1 on panel) / ochre dark (8.70:1), focus-visible only.
- **Button**: ink keycap primary (label roll and press unchanged), control-outline secondary that goes ink on hover, ink text tier whose underline thickens to 2px. The primary contact CTA reads "Let's talk".
- **New components**: BrandWordmark (ELLETA / BELLA, pattern or ink, nav or full-bleed, seeded), PatternField (the pattern as a quiet grey hero field, replacing the dot grid), Link (the link contract, implemented).
- **Favicon**: the pattern E on cream with an ochre-deep edge, fixed seed; SVG, 16/32 PNG, ICO, 180 and 512.
- **Gate**: `scripts/contrast-pairs.mjs` recomputes every declared pair in both themes, plus two forbidden pairs that must stay failing. Brand art is the second named inline-SVG exception.
- **Retired**: Foundations/Illustration and `src/assets/illustrations`; the line-dog lockups leave the docs (SVGs kept, marked deprecated).
- **Status tokens** (danger, success): `color.light.danger` `#b3261e` / `danger-subtle` `#fcebe9`, `color.light.success` `#1a7439` / `success-subtle` `#e6f3ea`, dark `#ff8f84` / `#3a1714` and `#72d08b` / `#12301d`, read through `color.semantic.danger-text`, `danger-border`, `danger-subtle` and the `success-*` set. Text 5.10:1 worst, borders clear 3:1 everywhere; in the contrast gate. The strokes rule is amended: colour never in strokes except focus and status. Warning and info stay open.
- **Input error**: 2px danger border, the WarningCircle icon (added to the registry) and a danger message, still with `aria-invalid` and `aria-describedby`; no longer ink only.
- **Chip c1**: lavender `#c9bff5` becomes soft tiger-blue `#cfe0ef` from the pattern (chip text 13.07:1). Chips, ResourceCard, FlowDiagram, ProcessSteps and the Motion demo follow the token. No purple left in the system.
- **Favicon**: the E stroke is 2x the wordmark weight (was 1.5x) and laid out for that weight. Seed 189 (was 7), picked by `scripts/score-favicon-seeds.mjs`: at seed 7 the middle bar sat on cream and pale rosette and vanished; at 189 every bar is on ochre, blue or pink. Every raster regenerated from the final SVG.

### Changed
- **Card cover slot** (2026-09-21, Work patterns): the 16:10 media well never crops. Images sit at `object-fit: contain` on the card's own surface (`surface-card`, was `surface-inset`), so an off-ratio cover letterboxes onto the card, not onto a second tone. Sharpness is a tested contract: `expectSharpImages` (src/testing/behavioral.ts) asserts every raster cover is at least 2x its rendered width, negative-tested with an undersized probe
- **Heading**: new `after` (text after the accent, primary ink) and `label` (accessible-name override for an interactive accent) props; contract updated
- **Button motion, one job per state** (2026-09-18). Hover and focus-visible roll the label (the label slides up, an aria-hidden copy, icons included, slides in; `motion.duration.normal` on the new `motion.easing.out`). Active keeps the primary keycap press, now on `motion.transform.key-press`. The primary no longer lifts on hover, loses its stronger hover gloss, and no longer carries the trace ring (Card only). Every tier also shifts colour on hover and focus-visible (primary plate flattens one step deeper via `primary.fill-hi-hover` / `fill-lo-hover` on the new semantic `accent-raised-hover`: iris deep in light, the new primitive `color.iris.peri-deep` (#9588DB) in dark, navy label 5.34:1 AA; tertiary label to `accent-hover`, since `link-hover` equals the rest colour). Reduced motion keeps the colour shift and drops the roll and press. audit:quality asserts the roll is inert at rest (the copy sits at translateY(100%), the label at 0%), that the tertiary keeps ONE static underline on the roll window (a `::after` in currentColor on `tertiary.underline-offset` / `underline-thickness`, the new primitive `border.width.thin`) while only the text rolls, checked at rest and on every frame mid-roll (the pass lifts Storybook's test-mode transition pause, then restores it), and fails any id inside an icon SVG; the rolling copy is `user-select: none`. Rule recorded in `docs/motion-system.md`: buttons never lift on hover, lift is for cards
- **Button shape**: every tier shares `component.button.shape.default` (`radius.lg`; secondary and tertiary move from 8px to 12px); new `shape="pill"` prop on `component.button.shape.pill` (`radius.full`)
- **Button tokens wired**: the CSS now reads `component.button.*` throughout (primary fill/edge, secondary foreground/border/background/background-active/padding, tertiary foreground/foreground-hover/background) instead of the semantic tokens directly. Removed: `component.button.primary.trace`, `primary.gloss-hover`, the per-tier `border-radius`
- **Disabled tertiary** stays text (muted, no box)
- **Trace literals tokenised**: `motion.duration.trace` (3400ms) and `component.card.trace.width` (new primitive `border.width.thick`, 3px) / `.duration`
- `docs/motion-system.md` rewritten: it described the portfolio's retired motion layer; it now documents BELLA's tokens and rules

### Added
- Work patterns (2026-09-21, lock: `specs/work-page-lock.md`): SectionHeader and ScaledFrame ported from the portfolio with no site imports (the glossary lookup is now the `term` prop; a live ScaledFrame specimen reads the tokens in place, the `?theme=` param is gone). New patterns under `src/patterns/`: WorkIntro, SectionIndex, FeaturedCase, CaseGrid (never an orphan: an odd last case closes the grid wide), BeforeAfterFrame (percent markers that never clip, fit or scroll with a cue), CaseMeta (sticky-left case facts), and the composed Pages/Work story. The first container queries in BELLA: each pattern owns a named container and rearranges on its own width
- Iconoir ArrowRight added to the icon registry
- Viewport presets 1024 and 1440 (the Work patterns' review widths)
- Avatar (2026-07-30): a person or entity as a circle, three ramp steps, optional accent ring separated from the disc by a gap of ground. Promoted from the portfolio's photo-bubble recipe, which had three consumers and no component. The disc carries a token border because in dark the inset surface resolves to the same navy as the page ground, so a fill alone left the initials floating with no disc; caught at GATE 2, not by the snapshot
- ResourceCard (2026-07-30): the folder card, for galleries whose items are files. A navy file-window cover, a warm sheet, and a tab folded up from the sheet itself: same background, no shadow, joined by a concave notch painted as a radial gradient from the SAME semantic surface token as the sheet, so the fold flips with the theme instead of biting a light hole in the navy card. Composes Card's shell rather than adding a second markup path to Card. Studied from Carmen Rincon's live implementation; the recorded divergences are all BELLA floors, title 20px not 16, description 16px not 13, metadata 13px not 10 and 12, so the card is taller than the reference on purpose. Status dot is neutral pending the status ladder
- Iconoir ArrowUpRight added to the icon registry, extracted from iconoir-react rather than redrawn
- Foundations / Responsiveness doc page: the four breakpoints named by range, why components carry no width media query, the one media query they do carry (prefers-reduced-motion), and the two things BELLA has deliberately not adopted, fluid type and container queries, each with the reason. Records an open conflict: breakpoint.wide is 1440px while the reference consumer caps at 1240px
- Governance is now a three-page section: Overview (unchanged material), The Gate (every audit, what it asserts, why it exists, where it runs, and the one dated allowlist), and Contribution & Tiers (tier direction of travel, the copy-sync model, how a fix goes upstream, the extraction definition of done). The gate and extraction detail moved out of Overview rather than being duplicated
- Component queue shipped (extraction batch, 2026-07-22): Button (the keycap system, three tiers, new semantic accent-raised trio, trace recipe promoted to a shared utility Card now composes), Tag, StatusPill (carried tints, pending the status ladder), FilterChip (aria-pressed is the state), SegmentedControl (platform-first: buttons + aria-current per the recorded discovery pass), Select (native under BELLA skin), Heading (the display primitive; never-inside-a-card is contract-enforced via a new forbidden-ancestor invariant), and the Input set (labelled fields, honest errors; error tint blocked on the status ladder). Every component: contract in the card shape with restState, computed a11y ratios recorded per token, stories with a Behavior suite, both-theme baselines eyeballed, recorded divergences
- audit:quality, the gate's correctness layer (baselines verify sameness; this verifies rules). Per story and docs page: no em or en dashes in rendered text, the type floors (13px hard, 16px long-form, 24px Unique), no pure-white solid fills, no colour literals outside token specimens, and contract-driven rest-state invariants (hover/focus layers provably inert at rest; the card contract records its restState first, including the geometry invariant that catches the grid duplicated-surface class of bug). Negative-tested by probe ritual. A future LLM-judge layer is named on the Governance page, advisory only
- Storybook is now the BELLA doc site (the Polaris/Carbon pattern). Branded manager: theme values and favicon generated by `build.py` (`.storybook/theme-values.json`, `.storybook/public/favicon.svg`), diff-checked by the gate, never hand-copied. Docs pages: Welcome, Getting Started (sync:bella consumer model, legacy alias table, MCP agent access), Accessibility (the AAA-minded AA bar, contrast table rendered live from `$extensions.bella.a11y`), Tokens overview, Changelog (sourced from this file). Docs container follows the theme toggle in both modes
- Viewport presets: 390 / 768 / 1240
- GitHub Pages deploy workflow (`pages.yml`): storybook-static to Pages on main, deploy only after the gate is green
- Card autodocs polish: component description renders verbatim from the committed TSDoc via docgen, curated controls; the template later components inherit

- Brand fonts vendored into the Storybook preview: Unique Bold/Regular and official Geist woff2 400/500/700, loaded locally, never from a CDN; all visual baselines regenerated with the real faces
- Identity and Governance doc pages; docs styling kit (Unique 700 page H1s, token-styled links/code/blockquotes/tables in both themes) and shared MDX blocks (PageIntro, DoDont, TokenChip); component autodocs anatomy recorded on the Governance page, with tokens-consumed extracted live from the component stylesheet

- Surface rules tokens (2026-09-19): `color.night.*` warm dark ladder (ground `#110F0D`, card `#1B1916`, inset `#252320`, raised `#2C2A27`, divider `#33312E`) with `alpha.night-60/48/32`; `color.neutral.card` `#ECEBE7`; semantic `surface-card` and `border-faint`; `alpha.ink-8`, `alpha.ink-10`, `alpha.dark-ink-12`; `radius.card` (1rem) and `radius.pill` (999px); `motion.duration.lift` (200ms); `shadow.hover-dark`, bound as the dark override of `shadow.hover`

### Changed
- **Card is flat** (surface rules, 2026-09-19): `surface-card` panel, 1px `border-faint`, `radius.card`, no shadow at rest, no accent-tinted border, no trace ring, no dark halo, no scrim over media. Only interactive cards (href or onClick) lift on hover and focus: 2px plus `shadow.hover`, none under reduced motion. The card restState contract now asserts no transform and no box-shadow at rest. Peek stays fixed-light, flattened the same way
- **Dark ground is warm near-black, not navy**: dark `background` `#1B1B40` → `#110F0D`, `surface` `#232350` → `#1B1916`, `surface-elevated` `#2B2B5C` → `#2C2A27`, `surface-inset` `#1B1B40` → `#252320`, `surface-glass*` navy alphas → `night-60/48/32`, `border-subtle` `#32325F` → `#33312E`. Navy stays for the site footer and the light-mode primary. Dark contrast ratios re-verified (all improve; `text-muted` worst case now 4.92:1 on raised). Every dark baseline regenerated
- `shadow.hover` value corrected to the surface rules: `0 8px 24px rgba(28,26,46,0.10)` → `0 8px 24px` ink at 8%
- `npm run gate` drift check now also covers the generated Storybook theme values and favicon
- The internal palette codename removed from all public copy, including token metadata (the status-carry marker is now `carried-pending-status-palette`); the identity is documented on the Identity page
- `docs/index.html` (the standalone token preview) retired in favour of the Foundations pages; `docs/bella.css` and `docs/tokens.md` remain generated

### Deprecated
- Card `accent` and `mediaScrim` props: no visual effect since the flat surface rules; removal in the next major. The AccentOverride and WithMediaNoScrim stories and their baselines are removed
- `shadow.card-rest`, `shadow.card-rest-dark`, `alpha.ink-22`: no longer used by BELLA; kept while the portfolio's vendored Card copy still reads them

## [0.3.0] - 2026-07-21

The 2026-07 identity. The April palette (parchment/amber/slate, Georgia/JetBrains Mono) is fully replaced; the portfolio's hand-edited vendored fork is synced back into the token sources and retired as a fork.

### Changed
- **Palette**: brand model is now ground `#F5F4EF` / ink `#1A1720` (light), navy `#1B1B40` (dark), with a single theme-flipping accent: iris `#5B4BD1` (light) ↔ periwinkle `#A79CE2` (dark). Amber, parchment, slate, dusk, and linen are retired. Neutral tier restructured into named light neutrals (`cream/paper/surface/border/graphite` + ink ladder) and a `navy` scale (card/raised/divider + dark ink ladder)
- **Typography**: Unique (display, 700 only, ≥24px) + Geist (everything else) replace Georgia + JetBrains Mono. The mono token is retired and repointed to Geist for legacy consumers; the type lock is exactly two faces
- **Shadows**: warm cognac shadow family (`#2C1810`) replaced by cool violet-ink `shadow-cool-*` (`#1C1A2E`); `--ink-on-dark-*` governance tokens rebased to the navy ink ladder
- **Accessibility bar recorded (Elleta, 2026-07-21)**: AAA-minded AA: AAA for ink/body text, AA where the accent speaks, the accent always theme-flips and is banned on its failing ground even as decoration, worst-ground-wins for text tokens. Verified, dated contrast ratios recorded in `$extensions.bella.a11y` per token
- `text-muted` adjusted one step in both modes to pass AA normal text on its worst ground: light `#757085` → `#6B6678`, dark `#8F8AA8` → `#9994B1`
- Dark-mode input focus ring resolves through the semantic accent (iris light / periwinkle dark); the fork's light-mode periwinkle literal (2.36:1, failed the 3:1 non-text minimum) was a bug and is not carried
- `surface-glass-amber` renamed `surface-glass-accent` (periwinkle-tinted active-state glass)
- Docs rewritten to the 2026-07 identity: `AGENTS.md`, `README.md`, `docs/typography.md`, `docs/principles.md`, `.microagents/{accessibility,surfaces}.md`; `docs/RULES.md` bumped to the v0.2 rule set (new rule 9 records the bar; v0.1 archived at `docs/RULES-v0.1.md`)

### Added
- Elevation token lock from the portfolio (2026-07-17): `shadow.orb*`, `shadow.key-{resting,hover,pressed}`, `shadow.switch-*`, `shadow.nav-bar`, `motion.transform.key-press`
- Icon tokens (`icon.sm/md/lg/stroke`, Iconoir defaults)
- Semantic `accent-hover`, `text-on-accent`, `accent-ink` (emitted as `--color-accent-ink`), `surface-inset`
- `build.py` emits component-tier dark overrides: component tokens that resolve differently under the dark semantic set flip with `[data-theme="dark"]` instead of baking in the light value
- Legacy var() aliases for pre-0.3 consumer names (`--color-alpha-parchment-6`, `--color-alpha-shadow-warm-*`, `--color-supporting-linen`) so the portfolio swap is drop-in; remove after the component swaps migrate
- MIT license, Contributor Covenant code of conduct
- Carried status colors (`steel`, `sage`) marked `carried-pending-status-palette`, non-text roles only; BELLA-native status ladder tracked in an open issue

### Fixed
- Dark semantic lookup now falls back to light semantic for tokens dark doesn't override (previously `{shadow.raised}` emitted unresolved in the dark block)

_Earlier in this cycle (pre-0.3.0, folded from the professionalisation pass):_

### Added
- CI: token build + generated-artifact drift gate on every PR and push to main
- Generated docs: `docs/tokens.md` token reference and `docs/bella.css`, both emitted by `build.py`
- CONTRIBUTING.md, issue/PR templates, `.gitignore`, repo audit (`REPO-AUDIT.md`)

### Fixed
- `build.py` read the pre-restructure `semantic.{light,dark}.json` paths, breaking the build after the move to `tokens/semantic/`

## [0.2.0] - 2026-04-24

Unreleased/untagged at the time; folded here from history.

### Changed
- Restructured Tokens Studio themes into three tier groups (Primitives / Semantic / Components) producing three Figma variable collections with cross-tier references; mode switching cascades through the Semantic layer
- Moved semantic sources to `tokens/semantic/{light,dark}.json` to match the new theme paths

### Added
- `docs/RULES.md`: v0.1 governance rules for consumers (fixed-context `--ink-on-dark-*` tokens, focus ring, touch targets)

## [0.1.1] - 2026-04-19

### Added
- GH Pages site under `docs/` (token preview at emcdanie.github.io/bella)

### Fixed
- Dark-mode AAA contrast gaps

## [0.1.0] - 2026-04-19

### Added
- Initial three-tier token system: primitive, semantic (light + dark), component contracts
- `build.py` emitting `bella.css`, `bella.json`, `preview.html`
- Glass/shadow tokens ported from elleta.design; AAA contrast closure
- `AGENTS.md` rules for AI consumers; principles, typography, and motion docs

[Unreleased]: https://github.com/emcdanie/bella/compare/v0.3.0-bella...HEAD
[0.3.0]: https://github.com/emcdanie/bella/compare/v0.1.1-bella...v0.3.0-bella
[0.1.1]: https://github.com/emcdanie/bella/compare/v0.1.0-bella...v0.1.1-bella
[0.1.0]: https://github.com/emcdanie/bella/releases/tag/v0.1.0-bella
