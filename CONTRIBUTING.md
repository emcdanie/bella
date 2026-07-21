# Contributing to BELLA

BELLA is small on purpose. Before adding anything, read [`AGENTS.md`](./AGENTS.md) and [`docs/principles.md`](./docs/principles.md) — most rejected changes are rejected for violating those, not for code quality.

## Ground rules

- **Token-first.** No hard-coded hex values, arbitrary pixel numbers, or one-off font sizes anywhere. If the token you need doesn't exist, open an issue proposing it — don't invent one inline.
- **Sources vs. generated.** Edit only `tokens/primitive.json`, `tokens/semantic/{light,dark}.json`, `tokens/component.json`, `tokens/build.py`, and prose docs. `tokens/bella.css`, `tokens/bella.json`, `tokens/preview.html`, `docs/bella.css`, and `docs/tokens.md` are generated — never edit them by hand.
- **References flow downward only.** Primitives reference nothing. Semantic references primitives. Component references semantic (or primitives). Never upward.
- **Non-negotiables** (from `AGENTS.md`): typography floors (16px body, nothing below 13px), no pure white, amber is the only accent, Georgia + JetBrains Mono.

## Workflow

1. Branch from `main`.
2. Edit the source JSON (or `build.py` / docs).
3. Run the build and commit its output **in the same commit** as the source change:

   ```sh
   python3 tokens/build.py
   ```

   CI fails any PR where regenerating produces a diff.

4. Check the result visually: `open tokens/preview.html` (toggle dark mode; check contrast on new colors — BELLA targets AAA).
5. Open a PR using the template.

No dependencies to install — the build is stdlib Python 3.9+.

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
