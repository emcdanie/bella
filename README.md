# BELLA

[![CI](https://github.com/emcdanie/bella/actions/workflows/ci.yml/badge.svg)](https://github.com/emcdanie/bella/actions/workflows/ci.yml)

BELLA is the design system for **ctrl_alt_design** — Elleta McDaniel's design engineering practice.

<!-- TODO(elleta): screenshot or GIF of the token preview here. `open docs/index.html`,
     capture light + dark, drop into docs/assets/. -->

Named for the Italian and Spanish word for *beautiful*. That's the bar: not "clean," not "modern," not "minimal." Beautiful. Editorial in its typography, warm in its surfaces, confident in its restraint.

*Architecture inspired by Brad Frost's [bfw-process](https://github.com/Brad-Frost-Web/bfw-process).*

BELLA is token-first, accessibility-first, and AI-ready. Every color, space, and type ramp is a named token in `tokens/bella.json`, which means humans and agents build against the same source of truth. Every contrast ratio is computed and recorded in the token metadata, dated, against a recorded bar (AAA-minded AA — `docs/RULES.md` rule 9). Rules for AI collaborators live in [`AGENTS.md`](./AGENTS.md) and are enforced by any repo that installs BELLA as a `devDependency`.

It powers:

- `elleta.design` — the practice's site
- **CHIP** — Elleta's companion tool
- The rest of the ctrl_alt_design portfolio as it comes online

## The identity, in five tokens

- `color.brand.ground` `#F5F4EF` — warm off-white canvas; pure white is banned
- `color.brand.ink` `#1A1720` — near-black with a warm plum undertone
- `color.brand.navy` `#1B1B40` — dark mode is navy, not black
- `color.brand.iris` `#5B4BD1` — the single accent; at body scale it means *interactive*
- `color.brand.periwinkle` `#A79CE2` — the same accent, seen in the dark; the two always theme-flip

Two typefaces, locked: **Unique** (700, display only, never below 24px) and **Geist** (everything else). No mono face — the eyebrow look is caps + tracking.

## Install

Not yet on npm. Consume it straight from GitHub:

```sh
npm install --save-dev github:emcdanie/bella
```

Or copy the single generated stylesheet — `tokens/bella.css` is self-contained.

## Quickstart

```html
<link rel="stylesheet" href="node_modules/bella/tokens/bella.css">
```

```css
.card {
  background: var(--color-semantic-surface);
  border-radius: var(--component-card-default-border-radius);
  color: var(--color-semantic-text-primary);
}
```

Light mode is the default; add `data-theme="dark"` on `<html>` or `<body>` to flip. Accent-bearing component tokens flip with it — the generated CSS carries dark overrides for the component tier, not just semantic. Tools that read tokens (style-dictionary, codegen, agents) consume the flat rollup at `tokens/bella.json`.

## Token architecture

Three tiers, references flowing downward only:

```
Tier 1  primitive.json          Raw values — palette, spacing, type ramp,
                                radius, shadow (incl. the orb/keycap
                                elevation lock), blur, motion, icon
           │
Tier 2  semantic/light.json     Meaning — background, text, accent, border.
        semantic/dark.json      One set per mode; dark overrides light.
           │
Tier 3  component.json          Contracts — button, card, tag, eyebrow, input,
                                link, nav-link, section, modal
           │
        build.py ──────────────▶ bella.css   bella.json   preview.html
                                 (generated — never edit by hand)
```

Full token listing: [`docs/tokens.md`](./docs/tokens.md) (generated).

## Docs

- **Live preview** — <https://emcdanie.github.io/bella/>
- [`docs/principles.md`](./docs/principles.md) — why BELLA looks the way it looks
- [`docs/typography.md`](./docs/typography.md) — the type system in detail
- [`docs/motion-system.md`](./docs/motion-system.md) — hover, elevation, duration
- [`docs/RULES.md`](./docs/RULES.md) — mandatory governance rules for consumers (v0.2; v0.1 archived)
- [`docs/tokens.md`](./docs/tokens.md) — generated token reference
- [`AGENTS.md`](./AGENTS.md) — rules for AI agents touching BELLA

## What's here

```
bella/
├── AGENTS.md                  Rules for AI agents consuming BELLA
├── README.md                  You are here
├── package.json
├── tokens/
│   ├── $metadata.json         Tokens Studio set order
│   ├── $themes.json           Tier/theme groups (Figma variable collections)
│   ├── primitive.json         Tier 1 — raw token values
│   ├── semantic/
│   │   ├── light.json         Tier 2 — meaning, light mode
│   │   └── dark.json          Tier 2 — meaning, dark mode
│   ├── component.json         Tier 3 — component token contracts
│   ├── build.py               Build script
│   ├── bella.css              Generated — CSS custom properties
│   ├── bella.json             Generated — flat rollup
│   └── preview.html           Generated — visual preview
└── docs/                      GH Pages site + prose docs
    ├── index.html             Token preview page
    ├── bella.css              Generated — copy of tokens/bella.css
    ├── tokens.md              Generated — token reference
    ├── principles.md          Why BELLA looks the way it looks
    ├── typography.md          The type system in detail
    ├── motion-system.md       Hover, elevation, and duration
    ├── RULES.md               Governance rules for consumers (v0.2)
    └── RULES-v0.1.md          Archived v0.1 rule set
```

## Build

```sh
python3 tokens/build.py
```

Regenerates every file marked *Generated* above. CI fails any PR where the generated artifacts don't match the sources — always commit the build output with the source change.

## Status

v0.3 — the lush identity. Tokens complete across all three tiers with verified, dated contrast metadata on every color that speaks. Palette: ground/ink light, navy dark, one iris↔periwinkle accent. Typography: Unique + Geist, two faces, locked. Elevation: the orb/keycap/switch shadow lock. The April identity (parchment/amber, Georgia/JetBrains Mono) is fully replaced — see `CHANGELOG.md`.

Not yet: a React component package, Storybook (in progress — Phase 2 of the extraction plan), Figma library sync, or npm publication. The component layer lives in `tokens/component.json` as a contract for AI tools generating code — the React implementations come next, worst offenders first.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Token changes go through the source JSON and the build — never edit generated files by hand. Community standards: [Contributor Covenant](./CODE_OF_CONDUCT.md).

## License

[MIT](./LICENSE) © Elleta McDaniel.
