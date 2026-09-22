# Principles

BELLA exists because most design systems ship as a tool for shipping. That's fine — but ctrl_alt_design is a practice, not a widget factory. The work needs to look like someone made it on purpose.

## Editorial, not dashboardy

The reference points are books, magazines, and well-typeset long reads. Not component galleries, not Dribbble shots, not the latest AI app with 200 pastel gradients. Type does most of the work. Chrome does very little.

That translates to concrete choices:

- Generous vertical rhythm. Sections breathe.
- Strong weight contrast — 400 body against 700 heads, not a muddy 500/600 middle.
- Rules and margins as composition, not as decoration.
- Restrained accent colour. One ochre, used as a fill, does more than a six-colour palette. Interaction is ink and an underline; the ochre ring means focus.

## Anti-generic-AI

Every AI-generated UI in 2025 looks the same: rounded-xl everywhere, a purple-to-pink gradient somewhere, a Sparkles icon in at least one button, and a hero section that says "Meet [Noun]." BELLA is a deliberate refusal of that vocabulary.

What that means in practice:

- No gradient blobs as decoration.
- No Sparkles, no Stars, no "✨ AI" badges.
- No "friendly" over-rounding of every element. Corners are intentional, resolved through the radius tokens, 0 where 0 reads better.
- No centered-everything, pastel-everything hero layouts.
- No fake hand-drawn doodles pretending to be warmth.

Warmth in BELLA comes from type, surface color, and pacing — not from decoration. The 3D language — orbs, keycaps, one upper-left light source — is earned depth with recorded shadow tokens, not decoration; do not flatten it and do not sprinkle it.

## A white page, neutral steps, one ochre accent

The page is white (`color.light.bg`) and everything raised steps down to one neutral panel (`color.light.panel`, `#f2f2f2`); dark mode is a neutral near-black (`color.dark.bg`, `#0d0d0d`) whose elevation climbs lighter. White appears as the page ground and nowhere else (style unify and brand refresh, 2026-09-22; this reverses the 2026-07 warm-neutral rule).

The one accent is ochre (`color.brand.ochre`), and it is a fill with ink text, never text on light. Colour otherwise lives in the brand pattern, not in the interface.

<!-- TODO(elleta): the identity voice paragraph — what ochre and the pattern
     say that iris-on-navy didn't. The palette facts are recorded in
     primitive.json; the why-it-feels-right is yours. -->

## Accessible on purpose, at a recorded bar

The bar is **AAA-minded AA** (recorded 2026-07-21, `docs/RULES.md` rule 9): AAA for ink and body text, AA where the accent speaks, the accent always theme-flips and never touches its failing ground, worst-ground-wins for every text token. Every ratio is computed and written into the token metadata, dated — not asserted, verified.

## Token-first because humans and agents share the file

BELLA is built assuming AI collaborators. Tokens are the handshake: a single JSON file that both a human picking hex codes and an agent generating a component can read and respect. Hard-coded values break that contract.

This is also why `AGENTS.md` is a first-class document, not an afterthought. The rules an agent needs to follow are the same rules a human designer needs to follow. Writing them down once, in one place, for both audiences, is the point.

## Confidence as a constraint

The hardest rule, and the one that makes the others matter: BELLA should look like it was made by someone with an opinion. A safe, defensible, beige-on-beige, system-font design system is not what this is. If a choice can go either way, pick the more editorial one and commit.
