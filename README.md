# BELLA

[![CI](https://github.com/emcdanie/bella/actions/workflows/ci.yml/badge.svg)](https://github.com/emcdanie/bella/actions/workflows/ci.yml)

BELLA is the design system for **ctrl_alt_design** — Elleta McDaniel's design engineering practice.

<!-- TODO(elleta): screenshot or GIF of the token preview here. `open docs/index.html`,
     capture light + dark, drop into docs/assets/. -->

Named for the Italian and Spanish word for *beautiful*. That's the bar: not "clean," not "modern," not "minimal." Beautiful. Editorial in its typography, warm in its surfaces, confident in its restraint.

*Architecture inspired by Brad Frost's [bfw-process](https://github.com/Brad-Frost-Web/bfw-process).*

BELLA is token-first and AI-ready. Every color, space, and type ramp is a named token in `tokens/bella.json`, which means humans and agents build against the same source of truth. Rules for AI collaborators live in [`AGENTS.md`](./AGENTS.md) and are enforced by any repo that installs BELLA as a `devDependency`.

It powers:

- `elleta.design` — the practice's site
- **CHIP** — Elleta's companion tool
- The rest of the ctrl_alt_design portfolio as it comes online

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
  background: var(--color-semantic-surface-raised);
  border-radius: var(--component-card-default-border-radius);
  color: var(--color-semantic-text-primary);
}
```

Light mode is the default; add `data-theme="dark"` on `<html>` or `<body>` to flip. Tools that read tokens (style-dictionary, codegen, agents) consume the flat rollup at `tokens/bella.json`.

## Token architecture

Three tiers, references flowing downward only:

```
Tier 1  primitive.json          Raw values — palette, spacing, type ramp,
                                radius, shadow, blur, motion
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
- [`docs/RULES.md`](./docs/RULES.md) — mandatory governance rules for consumers
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
    └── RULES.md               Governance rules for consumers
```

## Build

```sh
python3 tokens/build.py
```

Regenerates every file marked *Generated* above. CI fails any PR where the generated artifacts don't match the sources — always commit the build output with the source change.

## Status

v0.2 — tokens complete across all three tiers. Primitive, semantic (light + dark), and component layers all ship. Typography is decided: Georgia for body and display, JetBrains Mono for tags and eyebrows.

Not yet: a React component package, Storybook, Figma library sync, or npm publication. The component layer lives in `tokens/component.json` as a contract for AI tools generating code — the React implementations come next.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). Token changes go through the source JSON and the build — never edit generated files by hand.

## License

No license granted yet.
<!-- TODO(elleta): license decision pending (MIT recommended for community
     distribution). Update this section + package.json "license" + add LICENSE
     file when decided. -->
