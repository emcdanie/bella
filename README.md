# BELLA

BELLA is the design system for **ctrl_alt_design** — Elleta McDaniel's design engineering practice.

Named for the Italian and Spanish word for *beautiful*. That's the bar: not "clean," not "modern," not "minimal." Beautiful. Editorial in its typography, warm in its surfaces, confident in its restraint.

*Architecture inspired by Brad Frost's [bfw-process](https://github.com/Brad-Frost-Web/bfw-process).*

BELLA is token-first and AI-ready. Every color, space, and type ramp is a named token in `tokens/bella.json`, which means humans and agents build against the same source of truth. Rules for AI collaborators live in [`AGENTS.md`](./AGENTS.md) and are enforced by any repo that installs BELLA as a `devDependency`.

It powers:

- `elleta.design` — the practice's site
- **CHIP** — Elleta's companion tool
- The rest of the ctrl_alt_design portfolio as it comes online

## What's here

```
bella/
├── AGENTS.md                  Rules for AI agents consuming BELLA
├── README.md                  You are here
├── package.json
├── tokens/
│   ├── $metadata.json         Tokens Studio set order
│   ├── $themes.json           Light / dark theme mapping
│   ├── primitive.json         Tier 1 — raw token values
│   ├── semantic.light.json    Tier 2 — meaning, light mode
│   ├── semantic.dark.json     Tier 2 — meaning, dark mode
│   ├── component.json         Tier 3 — button, card, tag, eyebrow, input, link, nav-link, section
│   ├── build.py               Build script
│   ├── bella.css              Generated — CSS custom properties
│   ├── bella.json             Generated — flat rollup
│   └── preview.html           Generated — visual preview
└── docs/
    ├── principles.md          Why BELLA looks the way it looks
    ├── typography.md          The type system in detail
    └── motion-system.md       Hover, elevation, and duration
```

## Status

v0.2 — tokens complete across all three tiers. Primitive, semantic (light + dark), and component layers all ship. Typography is decided: Georgia for body and display, JetBrains Mono for tags and eyebrows.

Not yet: a React component package, Figma library sync, or npm publication. The component layer lives in `tokens/component.json` as a contract for AI tools generating code — the React implementations come next.

### Build

```
python3 tokens/build.py
```

Regenerates `tokens/bella.css` (CSS custom properties, light default with `[data-theme="dark"]` overrides), `tokens/bella.json` (flat rollup), and `tokens/preview.html`.
