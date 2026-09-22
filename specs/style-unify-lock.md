# BELLA style unify: CONCEPT LOCK

Drafted 2026-09-22. **Status: APPROVED 2026-09-22 (Elleta, "Go").** Authoritative for
the style unify; supersedes the type and colour rules in AGENTS.md wherever they
conflict (AGENTS.md updated in Phase 1).

## Rulings (2026-09-22, Elleta): these override anything below

1. Mono labels are 13px. The 13px floor stays.
2. Muted keeps AAA. Light muted is `#515151`: `#595959` is 7.00 on white but 6.26 on panel. Dark muted is `#a1a1a1`: `#9a9a9a` is 6.43 on `#161616`.
3. Iris and periwinkle are interactive only (links, focus). "Colour never in strokes, except the focus ring." The hairline is decorative; `border-strong` (≥3:1) is the input and control border: `#8c8c8c` light, `#636363` dark.
4. Light page bg is `#ffffff`, surface `#f5f5f4`, panel `#f2f2f2`.
5. `font-size.body` = 17px is new; `font-size.base` stays 16px.
6. The anatomy generator is `scripts/build-dsds.mjs` (the anatomy bucket). Every part carries its real trigger, checked against the component CSS. Button's "press on focus" is false.
7. FigmaLint means Elleta's plugin. If Claude can't run it, Elleta runs it and pastes the report. No substitute lint.
8. Code Connect: add `@figma/code-connect` to package.json, no install; Elleta installs on the Mac. The Figma token lives in `.env` and is never committed.
9. Vendor Geist Light and Geist Mono woff2 from vercel/geist-font (v1.7.2), with the OFL.
10. Flow demo: **Callout**. Its contract is written in Phase 1.
11. Phase 5 waits until after 17:00 and until #97 is merged. Story UI (Phase 4 step 7) is skipped until Elleta says so.

Naming as built: the new colour primitives are `color.light.*`, `color.dark.*` and `color.chip.*` (the §2 table's `color.mono.*` / `color.mono-dark.*` were draft names).
Branch `feat/work-patterns` (at `bf937bc`, not pushed). Site work waits until
after 17:00 and until site PR #97 is merged; it runs on a new branch and is not merged.

**Blocker before Phases 1-2:** the approved reference `docs/reference/geist-direction-study.html`
does not exist on disk. It isn't in `docs/`, git history or Spotlight. Heading sizes,
the FlowDiagram and ProcessSteps anatomy, and the chip usage all come from it. See Q1.

## 1. Thesis

One style everywhere: BELLA's tokens carry a single Geist voice (Light headings,
Mono labels, ink hairlines, three fill chips) from the Figma library through
Storybook to the site, and one component proves the whole CBDS lifecycle on record.

## 2. Token diff

Paths are DTCG paths in `tokens/*.json`. "sem" means `tokens/semantic/{light,dark}.json`.

### Typography

| Token | Old | New |
|---|---|---|
| `typography.font-family.display` | `Unique, 'Arial Narrow', sans-serif` | `Geist, system-ui, sans-serif` (headings) |
| `typography.font-family.wordmark` (new) | n/a | `Unique, 'Arial Narrow', sans-serif`: wordmark only |
| `typography.font-family.mono` | `Geist, system-ui, sans-serif` (retired alias) | `'Geist Mono', ui-monospace, monospace` |
| `typography.font-feature.mono` (new) | n/a | `"ss09"` |
| `typography.font-weight.light` (new) | n/a | `300` |
| `typography.font-weight.bold` / `black` | `700` / `800` | kept for the wordmark and legacy consumers; see Q6 |
| `typography.font-size.body` (new) | n/a | `17px` (see Q3) |
| `typography.font-size.mono` (new) | n/a | `12px` or `13px` (see Q2) |
| `typography.letter-spacing.display` (new) | n/a | `-0.035em` |
| `typography.letter-spacing.h2` (new) | n/a | `-0.03em` |
| `typography.letter-spacing.body` | `-0.01em` | unchanged |
| `typography.letter-spacing.mono` (new) | n/a | `0` |
| `typography.letter-spacing.hero` | `0.04em` | wordmark only |
| `typography.letter-spacing.wide` / `wider` | `0.08em` / `0.15em` | retired from eyebrows (Mono takes no tracking); kept for existing UI caps until Q7 |
| `component.heading.*` | Unique 700, `0.04em` | Geist 300, display tiers `-0.035em`, section tier `-0.03em` |
| card title (`component.resource-card.default.title.font-weight`, pattern titles) | 700 | 500 at 20px |

### Colour (primitives new; semantic repointed)

| Primitive (new) | Value |
|---|---|
| `color.mono.ink` / `muted` / `line` / `surface` / `panel` | `#121212` / `#6b6b6b` / `#e3e3e3` / `#f5f5f4` / `#f2f2f2` |
| `color.mono-dark.ink` / `muted` / `line` / `surface` / `bg` | `#ededed` / `#9a9a9a` / `#2a2a2a` / `#161616` / `#0d0d0d` |
| `color.chip.c1` / `c2` / `c3` | `#c9bff5` lavender / `#f6c9a8` peach / `#cfe8dc` mint (same in both themes) |
| `color.chip.text` | `#17191a` (both themes) |

| Semantic | Light old → new | Dark old → new |
|---|---|---|
| `background` | `brand.ground #F5F4EF` → **? (Q4)** | `night.ground #110F0D` → `mono-dark.bg #0d0d0d` |
| `surface-card` | `neutral.card #ECEBE7` → `mono.panel #f2f2f2` | `night.card #1B1916` → `mono-dark.surface #161616` |
| `surface` / `surface-inset` | paper / neutral.surface → `mono.surface` / `mono.panel` | night.card / inset → `mono-dark.surface` / ? |
| `text-primary` | `brand.ink #1A1720` → `mono.ink #121212` | `navy.ink` → `mono-dark.ink #ededed` |
| `text-secondary` / `text-muted` | ink-muted / ink-faint → `mono.muted #6b6b6b` | → `mono-dark.muted #9a9a9a` |
| `border` / `border-faint` / `border-subtle` | → `mono.line #e3e3e3` (hairline); new `border-ink` → `mono.ink` (1px strokes) | → `mono-dark.line #2a2a2a`; `border-ink` → `mono-dark.ink` |
| `chip-1..3` / `chip-text` (new) | → `color.chip.*` | → same values |
| `accent`, `text-accent`, `link-hover`, `accent-*` (iris/periwinkle) | **? (Q5)** | **? (Q5)** |

Checked contrast (WCAG):
- **Light ink:** 17.17 on surface, 16.73 on panel. AAA.
- **Light muted:** 4.89 on surface, 4.76 on panel. **AA only.** Today's secondary text is AAA at 8.33:1, so this breaks the recorded "AAA for ink and body text" bar if muted carries body text. See Q8.
- **Dark:** ink 16.60 / 15.46, muted 6.91 / 6.43. Muted is AA, and AAA only at large sizes. See Q8.
- **Chip text:** 10.3 on lavender, 11.6 on peach, 13.6 on mint. AAA.
- **Chip fills on the light surface:** 1.57, 1.39 and 1.19. Fine as decoration, but they fail the 3:1 non-text minimum if a fill is the only thing that signals state.
- **Lines:** light 1.18, dark 1.35 / 1.26. Fine for dividers. Input borders and focus rings need 3:1, so they can't use `line`. See Q5.

### Motion (new)

| Token | Value |
|---|---|
| `motion.duration.draw` + `motion.easing.draw` | `900ms`, `cubic-bezier(0.65, 0, 0.35, 1)` |
| `motion.duration.pop` + `motion.easing.pop` | `450ms`, `cubic-bezier(0.34, 1.4, 0.64, 1)` (overshoots; see Q9) |
| `motion.stagger.min` / `max` | `120ms` / `200ms` |
| Behaviour (documented, not a token) | Plays once when in view, then holds. Under reduced motion it shows the finished frame. |

### Shadows

`shadow.*` stays as it is for existing Card, Button and ResourceCard. The new patterns
(FlowDiagram, ProcessSteps, Eyebrow, and the restyled SectionHeader and WorkIntro) use no shadow. See Q10.

## 3. Places that change

### BELLA: tokens, gate and docs

- `tokens/primitive.json`, `tokens/semantic/{light,dark}.json`, `tokens/component.json` (heading, resource-card title, eyebrow contract), then `npm run build` outputs
- `.storybook/fonts.css:29-46`: add Geist Light 300 and Geist Mono 400 woff2. **Neither file is vendored** (`.storybook/public/fonts` has Geist 400/500/700 and Unique only). See Q11.
- `.storybook/test-runner.ts:214` and `scripts/audit-quality-docs.mjs:73`: the 13px floor. 12px Mono fails both. See Q2.
- `.storybook/test-runner.ts:228`: the Unique ≥24px check. It stays and still covers the wordmark.
- `.storybook/theme.ts:10`: the manager wordmark (Unique). Stays, since it's the wordmark.
- `.storybook/docs.css:11-25`: docs H1 is Unique 700 `hero` → Geist 300 display
- `.storybook/preview.tsx`: stage font-size 16 → body token (Q3)
- `src/components/Heading/Heading.module.css:16-19`: Unique/700/hero → Geist/300/display
- `src/components/Heading/Heading.stories.tsx:77`: asserts `/Unique/` → assert Geist 300
- `src/components/ResourceCard/ResourceCard.module.css:130-138`: title 700 → 500
- `src/docs/Identity.mdx:28-46`, `Governance.mdx:60`, `Responsiveness.mdx:79`, `governance/TheGate.mdx:49`: the two-face / Unique-display rules
- `src/foundations/Typography.stories.tsx:14,74,164`: the ramp labels and the lock copy
- Foundations Colour: the Semantic table scrolls sideways at 390 (fix it); new Motion page
- `AGENTS.md`: the type lock, "No pure white / warm neutrals", the accent rule, Typography minimums (card title 700), "Hover … no bouncing", Mono retired → Mono for labels

### BELLA: eyebrow and label sites (→ Mono, no tracking)

- `src/patterns/CaseMeta/CaseMeta.module.css:53-55`
- `src/patterns/SectionIndex/SectionIndex.module.css:17-20`
- `src/patterns/FeaturedCase/FeaturedCase.module.css:45-60` (kicker 52-54; titles 60 → 500)
- `src/patterns/WorkIntro/WorkIntro.module.css:17-19`
- `src/patterns/BeforeAfterFrame/BeforeAfterFrame.module.css:123,153` (marker and note numbers)
- Doc chrome: `src/docs/DocBlocks.tsx:48`, `src/foundations/TokenSheet.tsx:76`, `Elevation.stories.tsx:25`, `src/testing/BehavioralTemplate.stories.tsx:39`, `Card.stories.tsx:49`
- Component labels that use caps tracking: `Input.module.css:26-27`, `Select.module.css:24`, `SegmentedControl.module.css:53`, `StatusPill.module.css:28`. Whether these count as "labels" is Q7.

### BELLA: new and restyled patterns (Phase 2)

- **New:** `src/patterns/FlowDiagram/`, `src/patterns/ProcessSteps/`, `src/components/Eyebrow/`. The Eyebrow contract already exists (`component.eyebrow`, state `default`) but has no component.
- **Restyle:** `src/components/SectionHeader/*`, `src/patterns/WorkIntro/*`
- **Section titles become real h2** (Heading `section` tier); SectionIndex stays a `p`

### Site (`~/DEV/ctrl-alt-design-all`, Phase 5 only)

- **Font loading**, `app/layout.tsx:5,19-20,28,82`: add Geist 300. Unique stays for the wordmarks, but its **Bold file is never loaded** (Regular 400 only).
- **Headings to Geist 300 + tight tracking:**
  - Global and Heading rules: `globals.css:95-96`, `986-987`, `1197` (`.display-heading`, all Heading tiers), `1264`
  - Heading and title classes: `795`, `2736`, `7468`, `3504`, `3513`, `4560`, `5750`, `6167`, `6396`, `6529`, `7006`, `4086`
  - `components/CaseCard.module.css:24`
- **The 13 Geist Mono rules** (via `--font-code`, `globals.css:122`): eyebrow ones stay Mono, the others go to Geist. Per-rule sort is in Q12.
  - `globals.css`: 604 `.l-section__label`, 832 `.text-code`, 2378 `.building-line`, 2590 `.term-tip__tag`, 2712 `.bracket-cursor__label`, 6051 `.beat-eyebrow`, 7423 `.case-hero__facts dt`, 7778 `.linked-phrase__n`, 8167 `.cf-table th`, 8261 `.shot__n`
  - `components/Learning.module.css`: 94, 645, 752
  - `lib/bella/component-contract.json:601`
  - Also `public/demos/*.html`, which load Geist Mono from Google Fonts (booking-search.html:8,35 seen; the rest unscanned)
- **`--font-mono` (resolves to Geist, about 38 rules):** the name is misleading. Rename it or repoint it when Mono becomes real, or these 38 rules all turn Mono. Q12.
- **The 4 stale "headings are Unique" comments:** `components/ui/Heading.tsx:7`, `app/globals.css:78, 989, 1192`. Also `globals.css:91`: "Every heading is Geist… Unique renders only on the wordmarks" is now correct and stays.
- **Colour:** the site's own `--case-*` palettes and `lib/bella/bella.css` re-sync from BELLA
- **`scripts/audit-fonts.mjs`** (mono only via `--font-code`): update it to the new rule
- **Pattern swaps:** FlowDiagram and ProcessSteps replace the reference's source sections. The target pages are unknown until the reference is found (Q1).

### Figma (file `YmAwfJ8QnZGJovPs3eykv9`)

- **Foundations canvases:** Colour, Type, Spacing & Radius and Elevation (inventory in `docs/figma-foundations-extract.md`). Type canvas T003 (the Unique TODO) is stale.
- **Variables:** every collection re-synced from the tokens (§4b)
- **Component pages:** one per contracted component (§4c)

## 4. Figma library plan (in this order)

a. **Fix the anatomy generator.** I can't identify it: nothing named that exists in BELLA,
   the site or the skills (the site's `generate-agent-surfaces.mjs` only emits anatomy in
   `/api/bella.json`). Q13.
b. **Sync the variables from the tokens,** not from locals. Generate them from
   `tokens/bella.json` through figma-console (`figma_setup_design_tokens` /
   `figma_batch_update_variables`), with light and dark modes. Values Figma can't store
   (gradients, shadows, clamp()) are listed on the page, not faked.
c. **Build components with every contract state, focus included. Nothing invented.** From `tokens/component.json`:

   | Component | Contract states |
   |---|---|
   | button | default, hover, active, focus, disabled |
   | card | resting, hover, focus |
   | resource-card | default, hover, focus-visible |
   | filter-chip | default, hover, pressed, focus |
   | segmented-control | default, hover, selected, focus |
   | select | default, focus, open |
   | input | default, focus, disabled, error |
   | link | default, hover, visited, focus |
   | nav-link | default, hover, active, focus |
   | tag, status-pill, heading, icon, avatar, eyebrow | default |
   | modal | open, closed (contract only, no component) |

   New patterns (FlowDiagram, ProcessSteps) have no contract yet. Their contracts are
   written in Phase 1 and approved before Figma gets them.
d. **FigmaLint:** run it, record the score, fix everything, re-run. Q14.
e. **Code Connect:** one mapping per component. Q15.

## 5. Flow-demo component

Two candidates, with the trade-off:

- **Callout.** It's small, static, and its variants map cleanly to Figma variants, so each lifecycle stage is easy to show honestly. Against it: it doesn't exist anywhere yet, so its contract (variants, states) has to be written and approved first, or it becomes an invented component.
- **FlowDiagram.** It demos the flow itself, so it's the most on-thesis for the Process page. Against it: its "states" are animation phases (idle, playing, finished, reduced motion), which Figma variants model poorly. Code Connect has little to map beyond the replay control.

My suggestion is **Callout**, with its contract written in Phase 1: every stage of the lifecycle
stays inspectable. Your call.

## 6. Open questions (answer before Phase 1)

1. **Reference HTML:** where is `geist-direction-study.html`? Heading sizes, the FlowDiagram and ProcessSteps anatomy, and the chip usage come from it.
2. **Mono at 12px vs the 13px hard floor.** AGENTS.md says "Nothing, anywhere, below 13px", and both gate checks fail 12px. Do you want to amend the floor to 12px for Mono only, or set Mono at 13px?
3. **Body 17px:** does `font-size.base` change 16 → 17 (every consumer moves), or is a new `font-size.body` added with base left alone?
4. **Light page background:** you gave surface `#f5f5f4` and panel `#f2f2f2`, but no light bg, while dark has bg `#0d0d0d` plus surface `#161616`. Is the light bg `#f5f5f4` (with surface = bg), or a separate value? (Not `#ffffff`: pure white stays banned.)
5. **Iris and periwinkle:** retired, or kept for interactive only (links, primary button, focus)? "Colour never in strokes" conflicts with a coloured focus ring. Is focus a 2px ink ring (21:1 in light), and are input borders ink (`line` fails 3:1)?
6. **Weights:** do 700 and 800 leave the ramp entirely, or stay for buttons? And does the 20px card-title floor stay at 500 now instead of 700?
7. **"Labels":** do component labels (Input label, Select label, SegmentedControl, StatusPill, Tag, Button caps) all go Mono, or only eyebrows, meta and diagram text?
8. **Muted text:** light muted is 4.76–4.89:1, which is AA but not AAA. Do you want to amend the bar to "AAA for ink, AA for muted", or darken muted to about `#595959` (≈6.3:1) for AAA-leaning?
9. **Pop easing overshoots** (1.4). AGENTS.md says no bounce on hover. Is pop allowed only for play-once diagram reveals, and never on hover or state changes?
10. **Shadows:** the elevation lock ("do not flatten; the depth IS the system") stays for existing Card, Button and keycaps? Or does "1px ink strokes, no shadows" eventually replace it everywhere?
11. **Font files:** OK to vendor Geist Light 300 and Geist Mono 400 woff2 into `.storybook/public/fonts` from the official Geist release (SIL OFL)? No npm install.
12. **Site Mono sort:** of the 13 Mono rules, which are eyebrows? My proposed read: eyebrow-like are `.l-section__label`, `.beat-eyebrow`, `.case-hero__facts dt`, `.term-tip__tag`, `.bracket-cursor__label`, `.shot__n`, `.linked-phrase__n`, `.cf-table th`, `.results-meta`, `.help-meta`; not eyebrows are `.text-code`, `.building-line`, `.codeNote`. And rename `--font-mono` (really Geist) to stop it colliding?
13. **The anatomy generator:** what is it and where does it live (a Figma plugin, a figma-console script, or something in another repo)?
14. **FigmaLint:** the Southleft plugin (which you run and I read), or the figma-console audit/lint tools as a stand-in? The before/after score depends on which.
15. **Code Connect** needs a Figma plan with Dev Mode, a personal access token, and `@figma/code-connect` added to BELLA (a new devDependency). OK to add? And who runs the install, given the Linux-shell rule?
16. **Story UI** (Phase 4 step 7): `.env` still has the placeholder key. Will a key be there by then?
17. **Section titles as real h2:** for the Work page, does each section get a visible Geist 300 h2 under its SectionIndex, or does the section-tier Heading replace the SectionIndex label?

## Cut

- New status colours (steel and sage stay non-text, as they are)
- Rebuilding the elevation or keycap system
- Any site change before 17:00, and any merge

## Out of scope

- Deploying the site
- Pushing either repo
- Retiring Unique entirely (it stays as the wordmark)
