# Testing — the BELLA harness

Tests are part of the component, not a follow-up. A Phase 3 extraction without
its Behavior story and committed both-theme baselines is not extracted; it is
pasted.

Consumer projects inherit this file. Downstream microagents may tighten these
rules; they do not get to relax them.

## The behavioral template is the law of shape

`src/testing/BehavioralTemplate.stories.tsx` is the proven-green pipeline
(interactions + a11y + both-theme snapshots + theme integrity). Every
component copies its shape:

- **One `Behavior` story** with a `play` function exercising real interaction:
  keyboard operation, visible focus, ARIA state flips, touch target. Use the
  shared assertions from `src/testing/behavioral.ts` (`expectKeyboardOperable`,
  `expectVisibleFocus`, `expectAriaStates`, `expectTouchTarget`); do not
  re-implement them per story.
- **One story per visual variant.** A variant that has no story does not exist
  as far as the gate is concerned, and its regressions ship silently.
- Stories render real BELLA tokens (`var(--...)`), never resolved values. A
  story that hardcodes a hex is testing the wrong thing.
- Every bug fix adds the story or assertion that would have caught it.

Do not test the framework (React rendering a prop, Storybook mounting a
story). Test the component's behavior, states, and contract.

## Both themes, every story, no exceptions

The test runner (`.storybook/test-runner.ts`) verifies EVERY story in light
and dark:

1. **Theme integrity**: the stage must actually be light in light mode and
   dark in dark mode, checked twice (stage computed background + mean rendered
   luminance of the full screenshot). This is the tripwire for the About-cards
   class of bug, dark surfaces leaking into a light theme. A deliberately
   fixed-context story opts out with
   `parameters: { bella: { themeIntegrity: false } }`, and says why in a
   comment.
2. **Image snapshot per theme** (jest-image-snapshot): baselines are committed
   at `src/__image_snapshots__/` as `<story-id>-<theme>.png`. Baselines are
   per-platform; CI sets `SKIP_VISUAL_SNAPSHOTS=1` and relies on integrity +
   a11y + interactions until the Linux-baseline decision is made.

A new component is not done until both baselines per story are committed and
reviewed by eye once, in both themes. Regenerating a baseline to silence a
diff without looking at it is the cardinal sin of this file.

## Gate commands

- `npm run gate` is the ship check: token build, drift diff on every generated
  artifact (`tokens/bella.css`, `tokens/bella.json`, `docs/bella.css`,
  `docs/tokens.md`, theme values, favicon), then `audit:visual`. Green or it
  does not merge.
- `npm run audit:visual` builds Storybook and runs the full test-runner suite
  (interactions, a11y, theme integrity, snapshots) against the static build.
- `npm run test-storybook` runs the same suite against an already-running
  Storybook, the fast loop while developing.
- a11y: `@storybook/addon-a11y` runs per story; the bar is
  `.microagents/accessibility.md` (AAA-minded AA), not axe's defaults alone.

If the gate exits non-zero, the work is not done. Do not skip, do not
allowlist, do not lower a threshold to pass; fix the surface or record the
exception where the failing check documents exceptions.
