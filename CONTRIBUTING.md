# Contributing to BELLA

BELLA is small on purpose. Before adding anything, read [`AGENTS.md`](./AGENTS.md) and [`docs/principles.md`](./docs/principles.md) — most rejected changes are rejected for violating those, not for code quality.

## Ground rules

- **Token-first.** No hard-coded hex values, arbitrary pixel numbers, or one-off font sizes anywhere. If the token you need doesn't exist, open an issue proposing it — don't invent one inline.
- **Sources vs. generated.** Token values come from Figma Foundations, exported as DTCG JSON into `tokens/figma/`; never edit those by hand. Hand-written: `tokens/build.mjs` (the Style Dictionary build), `tokens/contracts.json` (part contracts) and prose docs. `tokens/bella.css`, `tokens/bella.json`, `docs/bella.css`, `docs/tokens.md` and `.storybook/theme-values.json` are generated — never edit them by hand.
- **References flow downward only.** Primitives reference nothing. Semantic references primitives. Component references semantic (or primitives). Never upward.
- **Non-negotiables** (from `AGENTS.md`): typography floors (16px body, nothing below 13px), the page ground is never pure white (white is the card), ochre is the only accent, Geist + Geist Mono.

## Workflow

1. Branch from `main`.
2. Change the token in Figma and re-export to `tokens/figma/` (or edit `build.mjs`, `contracts.json`, docs).
3. Run the build and commit its output **in the same commit** as the source change:

   ```sh
   npm run build
   ```

   CI fails any PR where regenerating produces a diff.

4. Check the result in Storybook (`npm run storybook`) in all four themes, and run `node scripts/contrast-pairs.mjs` (text 7:1, marks 3:1).
5. Open a PR using the template.

Run `npm ci` first; the build needs Node 22 or later (Style Dictionary).

## Commit style

Conventional-commits-ish, matching the existing history:

```
feat(tokens): add spacing.14
fix(build): escape quotes in preview strings
docs(typography): clarify mono usage
chore: update .gitignore
```

Scope is optional; imperative mood; no trailing period on the subject.

## Versioning

Semver against the token contract: renaming or removing a token is a breaking change (major once past 1.0); adding tokens is minor; value corrections are patch. Every released version gets a `CHANGELOG.md` entry ([keep-a-changelog](https://keepachangelog.com/) format) and a `vX.Y.Z-bella` tag.

## Reporting issues

Use the issue templates — token request, bug, or docs. For anything touching contrast or accessibility, include the measured ratio and the surfaces involved.
