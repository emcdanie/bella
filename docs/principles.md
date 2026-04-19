# Principles

BELLA exists because most design systems ship as a tool for shipping. That's fine — but ctrl_alt_design is a practice, not a widget factory. The work needs to look like someone made it on purpose.

## Editorial, not dashboardy

The reference points are books, magazines, and well-typeset long reads. Not component galleries, not Dribbble shots, not the latest AI app with 200 pastel gradients. Type does most of the work. Chrome does very little.

That translates to concrete choices:

- Generous vertical rhythm. Sections breathe.
- Strong weight contrast — 400 body against 700/800 heads, not a muddy 500/600 middle.
- Rules and margins as composition, not as decoration.
- Restrained accent color. One editorial red or one considered blue does more than a six-color palette.

## Anti-generic-AI

Every AI-generated UI in 2025 looks the same: rounded-xl everywhere, a purple-to-pink gradient somewhere, a Sparkles icon in at least one button, and a hero section that says "Meet [Noun]." BELLA is a deliberate refusal of that vocabulary.

What that means in practice:

- No gradient blobs as decoration.
- No Sparkles, no Stars, no "✨ AI" badges.
- No "friendly" over-rounding of every element. Corners are intentional: 12px on cards, 8px on buttons, 0 where 0 reads better.
- No centered-everything, pastel-everything hero layouts.
- No fake hand-drawn doodles pretending to be warmth.

Warmth in BELLA comes from type, surface color, and pacing — not from decoration.

## Warm neutrals over pure white

`#ffffff` reads as *unstyled*. It's the color of an empty Figma frame, a default browser page, a ChatGPT response. BELLA's canvas is `#f9f9f7` — warm enough to feel like paper, neutral enough to stay out of the way.

The rule is absolute: no pure white anywhere. Not in modals, not in cards on dark backgrounds, not in print exports. If a surface needs to feel "lighter," reach for a warmer neutral or more white space — not a colder color.

## Token-first because humans and agents share the file

BELLA is built assuming AI collaborators. Tokens are the handshake: a single JSON file that both a human picking hex codes and an agent generating a component can read and respect. Hard-coded values break that contract.

This is also why `AGENTS.md` is a first-class document, not an afterthought. The rules an agent needs to follow are the same rules a human designer needs to follow. Writing them down once, in one place, for both audiences, is the point.

## Confidence as a constraint

The hardest rule, and the one that makes the others matter: BELLA should look like it was made by someone with an opinion. A safe, defensible, beige-on-beige, system-font design system is not what this is. If a choice can go either way, pick the more editorial one and commit.
