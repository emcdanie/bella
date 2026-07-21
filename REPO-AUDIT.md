# REPO-AUDIT — BELLA professionalisation pass

2026-07-21. Reference bar: Primer, Carbon, Shoelace. Scored before any changes.

## Headline risks

1. **The repo is already PUBLIC** (`github.com/emcdanie/bella`, visibility: PUBLIC) and GH Pages is live at `https://emcdanie.github.io/bella/`. The brief says "repo stays PRIVATE until the Phase 5 publish go" — that ship has sailed. Decide: flip to private now, or accept it's out. History is clean (no NDA terms, no secrets — scanned all revs), so exposure is reputational, not contractual.
2. **The build is broken on main.** Commit `cdd396d` moved semantic sources to `tokens/semantic/{light,dark}.json` but `build.py:28-29` still reads `tokens/semantic.light.json` → `FileNotFoundError`. Generated artifacts (`bella.css`, `bella.json`, `preview.html`) predate the move. File contents are byte-identical to pre-move, so a path fix + regen is safe.

## Scorecard

| Area | Score | Gap |
|---|---|---|
| README | 4/10 | Voice and value prop are good. Missing: screenshot/GIF, install/consume instructions, token architecture diagram, docs links (GH Pages not linked), CI badge. File tree is stale (lists `semantic.light.json` at `tokens/` root; omits `docs/RULES.md`, `docs/index.html`). |
| LICENSE | 0/10 | Absent. `package.json` says `UNLICENSED`. Public repo with no license = all rights reserved, contributors can't legally touch it. **Elleta's call — MIT recommended for community distribution.** |
| CONTRIBUTING.md | 0/10 | Absent. |
| CHANGELOG | 1/10 | No CHANGELOG file. Tags exist (`v0.1.0-bella`, `v0.1.1-bella`) but stop at 0.1.1; package.json is at 0.2.0 untagged. No GitHub releases. Recommend keep-a-changelog (changesets is npm-ecosystem machinery this Python-built repo doesn't need yet). |
| CODE_OF_CONDUCT | 0/10 | Absent. Only needed if community contribution is the goal — **Elleta's call.** |
| package.json | 4/10 | Has name/version/description/files/license-field. Missing: `repository`, `homepage`, `bugs`, `keywords`, `exports` map. `main: tokens/bella.css` is wrong (`main` is for JS entry; `exports`/`style` cover CSS). No `types` needed (no JS surface). `private: true` — keep until publish decision. |
| CI | 0/10 | No `.github/` at all. Nothing verifies the build runs or that generated artifacts match sources — which is exactly how main shipped broken. Gate needed: run `build.py`, fail if `git diff` is dirty. |
| Issue/PR templates | 0/10 | Absent. |
| Hygiene | 5/10 | No `.gitignore` (no `.DS_Store`/`__pycache__` committed yet — luck, not policy). `demo-prep/` untracked working notes sitting in the tree. `docs/bella.css` is a **hand-copied duplicate** of `tokens/bella.css` (identical today, will drift — build.py doesn't write it). Stray demo branch `demo/tokens-drift-broken` pushed to origin (intentional demo artifact — leave, but note it's publicly visible). Commit style is already conventional-commits-ish; keep it. Repo description is set; **topics: none, homepage field: empty** — wording is Elleta's call. |
| Docs | 6/10 | Prose docs (`principles`, `typography`, `motion-system`, `RULES`) are strong. No generated token reference — nothing documents tokens from `bella.json`; the only token listing is `preview.html` (visual, generated) and the hand-authored `docs/index.html`. Checklist requires: token docs generated from `bella.json`, never hand-copied. |

## Stage 2 plan — mechanical (applied, one commit each)

1. Fix `build.py` semantic paths; make it also emit `docs/bella.css` (kills the hand-copy drift) and a generated `docs/tokens.md` reference from the rollup; regenerate all artifacts.
2. `.gitignore` — OS junk, `__pycache__`, `demo-prep/` (working notes).
3. README rebuild — keeps existing voice paragraphs verbatim; adds install/quickstart, architecture diagram, docs links, status, CI badge; `TODO(elleta)` on new voice-dependent lines. Screenshot slot left as TODO (needs her pick).
4. CONTRIBUTING.md — token-first workflow, build-and-commit-artifacts rule, commit style.
5. CI workflow — build + drift gate on every PR/push to main.
6. `.github` issue templates (token request / bug / docs) + PR template with DS checklist.
7. package.json — `repository`, `homepage`, `bugs`, `keywords`, `exports`; drop `main`.
8. CHANGELOG.md — keep-a-changelog seeded from tags/history.

## Stopped — Elleta decides

- **Public/private**: repo is live-public now. Flip back or accept.
- **LICENSE**: MIT recommended; UNLICENSED stays until chosen.
- **CODE_OF_CONDUCT**: only if community is the goal.
- **Repo description / topics / homepage-field wording** (suggestions in Stage 2 notes, not applied).
- **README voice lines + screenshot** (marked `TODO(elleta)`).
- Tag `v0.2.0` and backfill a GitHub release, or wait for Phase 5.
