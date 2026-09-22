# Story UI considerations: BELLA

How Story UI must use BELLA. What BELLA *is* lives in `story-ui-docs/`
(symlinks to `AGENTS.md` and the component contracts, so nothing here can
drift from the source).

## Rules

- Compose from BELLA first: `src/components/*` and `src/patterns/*`. Where
  no BELLA part fits you may write markup, but mark each such block with a
  `GAP: <what was needed>` comment. That list is the point of the run.
- Tokens only. Every colour, space, radius and type size is a
  `var(--…)` BELLA custom property. No hex, no arbitrary pixel values.
- The rules in `AGENTS.md` are binding: type floors, no pure white, one
  primary Button per view, Heading never inside a Card, Card is ONE link or
  ONE button with nothing interactive nested inside.
- No em or en dashes in rendered text.

## Allowed additional imports

None.
