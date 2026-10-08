# AGENTS.md — BELLA

## Using BELLA (read this first)

1. Use a BELLA component before writing any UI. Import from the package:
   ```ts
   import { Button, Card, Input } from 'bella'
   ```
2. Never restyle a component from outside, never copy its colours, never write a local `<button>`, toggle, or card.
3. If no component fits, compose existing ones. If that still doesn't fit, STOP and say which component is missing. Don't invent one.
4. For layout glue between components only, use tokens as CSS variables: `var(--color-semantic-*)`, `var(--spacing-*)`, `var(--radius-*)`. Never hex, never raw px, never `var(--x, fallback)`.

## Which component for which job

| Job | Component |
|---|---|
| Main action (at most one per view) | `Button variant="primary"` |
| Other actions | `Button variant="secondary"` |
| Small inline actions (on a tile, under a card, "Test", "Copy") | `ActionChip` |
| Go somewhere | `Link` · sidebar nav: `NavList` |
| Filter / toggle / sort / pick a view | `FilterChip`, `SegmentedControl`, `Select`, `Tabs` |
| Text input | `Input` |
| Search / pick from list | `Combobox` |
| Range slider | `Slider` |
| Content card | `Card`, `ResourceCard` |
| Metrics / scores | `Stat`, `ScoreStrip` |
| Tabular data | `DataTable` |
| Show / hide content | `Disclosure`, `Drawer` |
| Labels and status | `Tag`, `StatusPill`, `Kbd`, `Avatar` |
| Icons | `Icon` (Iconoir only) |
| Headings | `Heading`, `SectionHeader` |
| Above-heading label | `Eyebrow` |
| Page chrome | `PageHeader`, `Section` |
| Layout | `Columns`, `SidebarLayout`, `ScaledFrame` |
| Brand art (not for product UI) | `BrandWordmark`, `PatternField` |

Props, variants and examples: each component's `.tsx` types and Storybook stories. Machine-readable contracts: `bella.dsds.yaml`.

## Not in BELLA yet — ask, don't build

Switch/toggle, Checkbox, Radio, Dialog/Modal, Alert/Toast, Textarea, Pagination, destructive Button.

## Floors (always)

Body ≥ 18px · nothing < 16px · targets ≥ 44px · focus ring = BELLA's (never removed) · ochre only on clickable things · AAA for body text.

## Working on BELLA itself

Maintainer rules (tokens, contrast pairs, relay, commit protocol): [docs/agents/maintaining.md](docs/agents/maintaining.md)
