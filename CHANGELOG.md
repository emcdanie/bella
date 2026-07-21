# Changelog

All notable changes to BELLA. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning is semver against the token contract (see CONTRIBUTING.md). Releases are tagged `vX.Y.Z-bella`.

## [Unreleased]

## [0.3.0] — 2026-07-21

The lush identity. The April palette (parchment/amber/slate, Georgia/JetBrains Mono) is fully replaced; the portfolio's hand-edited vendored fork is synced back into the token sources and retired as a fork.

### Changed
- **Palette**: brand model is now ground `#F5F4EF` / ink `#1A1720` (light), navy `#1B1B40` (dark), with a single theme-flipping accent — iris `#5B4BD1` (light) ↔ periwinkle `#A79CE2` (dark). Amber, parchment, slate, dusk, and linen are retired. Neutral tier restructured into named light neutrals (`cream/paper/surface/border/graphite` + ink ladder) and a `navy` scale (card/raised/divider + dark ink ladder)
- **Typography**: Unique (display, 700 only, ≥24px) + Geist (everything else) replace Georgia + JetBrains Mono. The mono token is retired and repointed to Geist for legacy consumers — the type lock is exactly two faces
- **Shadows**: warm cognac shadow family (`#2C1810`) replaced by cool violet-ink `shadow-cool-*` (`#1C1A2E`); `--ink-on-dark-*` governance tokens rebased to the navy ink ladder
- **Accessibility bar recorded (Elleta, 2026-07-21)**: AAA-minded AA — AAA for ink/body text, AA where the accent speaks, the accent always theme-flips and is banned on its failing ground even as decoration, worst-ground-wins for text tokens. Verified, dated contrast ratios recorded in `$extensions.bella.a11y` per token
- `text-muted` adjusted one step in both modes to pass AA normal text on its worst ground: light `#757085` → `#6B6678`, dark `#8F8AA8` → `#9994B1`
- Dark-mode input focus ring resolves through the semantic accent (iris light / periwinkle dark); the fork's light-mode periwinkle literal (2.36:1, failed the 3:1 non-text minimum) was a bug and is not carried
- `surface-glass-amber` renamed `surface-glass-accent` (periwinkle-tinted active-state glass)
- Docs rewritten to the lush identity: `AGENTS.md`, `README.md`, `docs/typography.md`, `docs/principles.md`, `.microagents/{accessibility,surfaces}.md`; `docs/RULES.md` bumped to the v0.2 rule set (new rule 9 records the bar; v0.1 archived at `docs/RULES-v0.1.md`)

### Added
- Elevation token lock from the portfolio (2026-07-17): `shadow.orb*`, `shadow.key-{resting,hover,pressed}`, `shadow.switch-*`, `shadow.nav-bar`, `motion.transform.key-press`
- Icon tokens (`icon.sm/md/lg/stroke`, Iconoir defaults)
- Semantic `accent-hover`, `text-on-accent`, `accent-ink` (emitted as `--color-accent-ink`), `surface-inset`
- `build.py` emits component-tier dark overrides — component tokens that resolve differently under the dark semantic set flip with `[data-theme="dark"]` instead of baking in the light value
- Legacy var() aliases for pre-0.3 consumer names (`--color-alpha-parchment-6`, `--color-alpha-shadow-warm-*`, `--color-supporting-linen`) so the portfolio swap is drop-in; remove after the component swaps migrate
- MIT license, Contributor Covenant code of conduct
- Carried status colors (`steel`, `sage`) marked `carried-pending-lush-status-palette`, non-text roles only — lush-native status ladder tracked in an open issue

### Fixed
- Dark semantic lookup now falls back to light semantic for tokens dark doesn't override (previously `{shadow.raised}` emitted unresolved in the dark block)

_Earlier in this cycle (pre-0.3.0, folded from the professionalisation pass):_

### Added
- CI: token build + generated-artifact drift gate on every PR and push to main
- Generated docs: `docs/tokens.md` token reference and `docs/bella.css`, both emitted by `build.py`
- CONTRIBUTING.md, issue/PR templates, `.gitignore`, repo audit (`REPO-AUDIT.md`)

### Fixed
- `build.py` read the pre-restructure `semantic.{light,dark}.json` paths, breaking the build after the move to `tokens/semantic/`

## [0.2.0] — 2026-04-24

Unreleased/untagged at the time; folded here from history.

### Changed
- Restructured Tokens Studio themes into three tier groups (Primitives / Semantic / Components) producing three Figma variable collections with cross-tier references; mode switching cascades through the Semantic layer
- Moved semantic sources to `tokens/semantic/{light,dark}.json` to match the new theme paths

### Added
- `docs/RULES.md` — v0.1 governance rules for consumers (fixed-context `--ink-on-dark-*` tokens, focus ring, touch targets)

## [0.1.1] — 2026-04-19

### Added
- GH Pages site under `docs/` (token preview at emcdanie.github.io/bella)

### Fixed
- Dark-mode AAA contrast gaps

## [0.1.0] — 2026-04-19

### Added
- Initial three-tier token system: primitive, semantic (light + dark), component contracts
- `build.py` emitting `bella.css`, `bella.json`, `preview.html`
- Glass/shadow tokens ported from elleta.design; AAA contrast closure
- `AGENTS.md` rules for AI consumers; principles, typography, and motion docs

[Unreleased]: https://github.com/emcdanie/bella/compare/v0.3.0-bella...HEAD
[0.3.0]: https://github.com/emcdanie/bella/compare/v0.1.1-bella...v0.3.0-bella
[0.1.1]: https://github.com/emcdanie/bella/compare/v0.1.0-bella...v0.1.1-bella
[0.1.0]: https://github.com/emcdanie/bella/releases/tag/v0.1.0-bella
