## What & why

<!-- One or two sentences. Link the issue if there is one. -->

## Checklist

- [ ] Edited **source** files only (`primitive.json`, `semantic/*.json`, `component.json`, `build.py`, prose docs) — no hand edits to generated files
- [ ] Ran `python3 tokens/build.py` and committed the regenerated output
- [ ] No hard-coded hex values, arbitrary pixels, or one-off font sizes introduced
- [ ] References flow downward only (primitive → semantic → component)
- [ ] New/changed colors checked in **both modes** in `tokens/preview.html`, contrast ratios noted below if text-bearing
- [ ] Typography floors respected (16px body min, nothing below 13px)
- [ ] Breaking token rename/removal? Called out below + CHANGELOG entry added

## Contrast notes

<!-- Only if colors changed: token, surface it sits on, measured ratio. -->
