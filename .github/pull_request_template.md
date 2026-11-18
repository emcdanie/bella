## What & why

<!-- One or two sentences. Link the issue if there is one. -->

## Checklist

- [ ] Token changes came from Figma (re-exported to `tokens/figma/`); no hand edits to `tokens/figma/` or to generated files
- [ ] Ran `npm run build` and committed the regenerated output
- [ ] No hard-coded hex values, arbitrary pixels, or one-off font sizes introduced
- [ ] References flow downward only (primitive → semantic → component)
- [ ] New/changed colours checked in all four themes in Storybook; `node scripts/contrast-pairs.mjs --verbose` output noted below if text-bearing
- [ ] Typography floors respected (16px body min, nothing below 13px)
- [ ] Breaking token rename/removal? Called out below + CHANGELOG entry added

## Contrast notes

<!-- Only if colors changed: token, surface it sits on, measured ratio. -->
