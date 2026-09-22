# Work page patterns: CONCEPT LOCK

Locked 2026-09-21 by Elleta. Authoritative for the Work patterns in BELLA.
Branch `feat/work-patterns`. Commit only, no push. The site repo is not touched.

## Thesis

BELLA builds the whole Work page from its own parts. Anything it cannot
build is a named gap, not hand-written markup.

## Format

BELLA Storybook, BELLA tokens only. Card is the one surface for FeaturedCase,
CaseGrid and the cover slot. Southleft's Work layouts are the reference.
BELLA is the one source; the site consumes it via sync.

## Spine (ordered)

1. Card cover slot: 16:10, contain on the card surface, never cropped;
   image natural width at least 2x rendered. Story "Cover": live specimen,
   image, placeholder.
2. Port SectionHeader (the site's `layout/` copy: split / stacked). The
   GLOSSARY import becomes an optional `term` prop; no site imports.
3. Port ScaledFrame. Theme comes from BELLA tokens (live children inherit
   `[data-theme]`); no `?theme=` param.
4. WorkIntro: section label, statement h1 using the width, a 2-line
   practice paragraph, optional side proof panel.
5. SectionIndex: the "01 / FEATURED" rule line.
6. FeaturedCase: one wide card, cover left (about 60%), kicker / title /
   impact / tags / Read it right. Stacks at 390.
7. CaseGrid: 2x2 at 1024+, 1 column at 390, never an orphan.
8. BeforeAfterFrame: tabs (Before / After / optional third), numbered
   markers at % coordinates, notes beside, whole screen visible (fit, or
   scroll with a cue), caption. Markers never clipped.
9. CaseMeta: sticky-left meta column beside the case body. Case template
   reference: Challenge / Objectives / Actions / Milestones
   (laurenbasser.site structure), with Results kept.
10. Pages/Work: WorkIntro > SectionIndex > FeaturedCase (B2B travel) >
    CaseGrid (Code First, Drift, CHIP) > pattern studies, real content
    from the site's `content/`.
11. Verify: a11y addon at 0 violations, contrast, 390 / 1024 / 1440 in
    both themes. Then Story UI: "build the Work page from BELLA"; report
    where it invented markup (that list is the gap).

12. Type-token pass (added 2026-09-21), measured against laurenbasser.site
    (also Geist): letter-spacing body -0.01em, headings -0.03 to -0.04em;
    weights 400 body, 500 headings, retire 600/700; scale
    14 / 16 / 18 / 28 / 52 / 80; Geist Mono only for code and token names.
    Before/after Typography story at 1440 and 390, both themes. No site
    sync until approved.
    **RESOLVED 2026-09-22 (Elleta):** every Unique heading lock stays (no
    negative tracking, 700, the 32px section and 20px card-title floors).
    Only Geist body text changes: `letter-spacing.body` -0.01em. Geist Mono
    stays retired. Story: Foundations/Typography "Body tracking, before /
    after". SectionIndex defaults to `as="p"` so the 32px rule holds.

## Cut

- CaseCard as its own component: FeaturedCase and CaseGrid compose Card
  directly and take content as props, not the site's `WorkItem`.
- SpecimenStage: stays in the site for now.
- The `ui/` SectionHeader copy.

## Out of scope

- Any change to the site repo; wiring the patterns into /work (after
  Elleta approves the stories).
- Pushing the branch.
