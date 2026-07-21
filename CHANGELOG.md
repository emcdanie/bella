# Changelog

All notable changes to BELLA. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning is semver against the token contract (see CONTRIBUTING.md). Releases are tagged `vX.Y.Z-bella`.

## [Unreleased]

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

[Unreleased]: https://github.com/emcdanie/bella/compare/v0.1.1-bella...HEAD
[0.1.1]: https://github.com/emcdanie/bella/compare/v0.1.0-bella...v0.1.1-bella
[0.1.0]: https://github.com/emcdanie/bella/releases/tag/v0.1.0-bella
