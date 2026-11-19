# AGENTS.md — BELLA

BELLA is the design system for ctrl_alt_design, Elleta McDaniel's design engineering practice: tokens, React components and the rules that bind them.
It is used by Elleta and the AI agents building with her. Products: elleta.design and CHIP (CHIP builds on the `chip` theme).
Its job: keep that work editorial, deliberate and recognisably not AI-generic.

## Using BELLA (read this first)

1. Use a BELLA component before writing any UI. CHIP imports each component by path, `import Button from '@bella/components/Button/Button'` (`@bella/components/<Name>/<Name>`); every other consumer imports from the package:
   ```ts
   import { Button, Card, Input } from 'bella'
   ```
2. Never restyle a component from outside, never copy its colours, never write a local `<button>`, toggle, or card.
3. If no component fits, compose existing ones. If that still doesn't fit, STOP and say which component is missing. Don't invent one.
4. For layout glue between components only, use tokens as CSS variables: `var(--color-background-*)`, `var(--color-content-*)`, `var(--color-border-*)`, `var(--spacing-*)`, `var(--border-radius-*)`. Never hex, never raw px, never `var(--x, fallback)`.

## Which component for which job

| Job | Component |
|---|---|
| Main action (at most one per view) | `Button variant="primary"` |
| Other actions | `Button variant="secondary"` |
| Small inline actions (on a tile, under a card, "Test", "Copy") | `ActionChip` |
| Go somewhere | `Link` · sidebar nav: `NavList` · top bar sections: `SectionNav` · on this page: `PageOutline` |
| Filter / toggle / sort / pick a view | `FilterChip`, `SegmentedControl`, `Select`, `Tabs` |
| Text input | `Input` |
| Search / pick from list | `Combobox` |
| Range slider | `Slider` |
| Content card | `Card`, `ResourceCard` |
| Metrics / scores | `Stat` |
| Tabular data | `DataTable` |
| Code, contracts, diffs | `CodeBlock` |
| Name an icon button | `Tooltip` |
| Work list: status, title, why, one action | `ListRow` |
| Explain something in place: numbered marker, dashed line | `Pin`, `Leader` |
| Show / hide content | `Disclosure`, `Drawer` |
| Labels and status | `Tag`, `StatusPill`, `Kbd`, `Avatar` |
| Group of people (overlapping discs) | `AvatarStack` |
| Chat message bubble | `ChatBubble` |
| Chat message list | `ChatThread` |
| Someone is typing | `TypingDots` |
| Icons | `Icon` (Iconoir only) |
| Headings | `Heading`, `SectionHeader` |
| Above-heading label | `Eyebrow` |
| Page chrome | `PageHeader`, `Section` |
| Layout | `Columns`, `SidebarLayout`, `ScaledFrame`, `Stage` |
| Status beside a name: a dot and one word | `StatusDot` |
| Branch or run status mark | `StatusSquare` |
| A space with nothing in it yet (lane or page) | `EmptyState` |
| Icon in a tinted circle (section heads, rows) | `IconWell` |
| Title, subtitle and body as one text column | `TextStack` |
| The › on anything that opens something | `Trailing` |
| Bar, segments or ring, with a target | `Progress` |
| One number with its chart, context and caption | `StatCard` |
| How healthy the system is: the segmented arc gauge and the failing checks | `SystemHealth` |
| One step of the type ramp, set in its own size (Foundations) | `TypeSpecimen` |
| One spacing step drawn at its real size (Foundations) | `SpacingStep` |
| One colour role as a Pantone-style chip: colour, name, hex, contrast | `Swatch` |
| One step of a code walkthrough ("Help me understand"): pin, text, Back / Next | `TourStep` |
| Work board: a lane of cards, one task card, a group's name in an order | `BoardLane`, `TaskCard`, `GroupHead` |
| The actions on one thing, from a "…" button | `Menu` |
| One health check row (a ListRow set-up) and its list header | `CheckRow` |
| One step in a short ordered process, and its connector | `Step`, `MapLine` |
| A message that stays, with its actions | `Notification` |
| The head of a section card: icon, title, info, description | `SectionHead` |
| CHIP app shell | `IconRail`, `NavItem`, `ProjectPanel`, `TreeItem`, `ClientSwitcher`, `TopBar`, `SearchField` |
| Brand art (not for product UI) | `BrandWordmark`, `PatternField` |

Props, variants and examples: each component's `.tsx` types and Storybook stories. Machine-readable contracts: `bella.dsds.yaml`.

## Open

- Not in BELLA yet, ask, don't build: Switch/toggle, Checkbox, Radio, Dialog/Modal, Alert/Toast, Textarea, Pagination, destructive Button. Stopping to name the gap is intended (Elleta, 12 Nov: "Keep it, build parts"). Build order: Switch, Input password with show/hide, Dialog, destructive Button, Select error state, Pagination.
- Warning and info status tones: undecided (issue #1); don't invent values or new status UI.
- Warm theme (`[data-theme="warm"]`): deferred; don't rebuild or retire it until Elleta decides.
- Open foundation and component choices: the [Figma Decide board](https://www.figma.com/design/4VWkwaMTKZWoGvH6PRbud8/?node-id=244-2).

## Floors (always)

Body ≥ 16px, the Figma body size (Elleta, 17 Nov: "one size per token … body text 16", "1, yes") · nothing < 16px · targets ≥ 44px · focus ring = BELLA's (never removed) · pink only for selection, ochre for Needs you · AAA for body text.

## Rules with examples

**actions.one-primary** — at most one primary Button per view.
- BAD: `<Button variant="primary">Save</Button> <Button variant="primary">Export</Button>`
- GOOD: `<Button variant="primary">Save</Button> <Button variant="secondary">Export</Button>`
- WHY: two primaries compete, and the view stops saying what it is for.

**components.no-local-control** — never a local `<button>` or `<input>` where BELLA has one.
- BAD: `<button className="chip" onClick={copy}>Copy</button>` · `<input className="search" />`
- GOOD: `<ActionChip onClick={copy}>Copy</ActionChip>` · `<Input label="Search" value={q} onChange={setQ} />`
- WHY: a local control skips BELLA's focus ring, 44px target and contrast checks.

**tokens.only** — layout glue uses tokens, never raw values or fallbacks.
- BAD: `.panel { padding: 14px; color: rgb(29 32 48); gap: var(--spacing-12, 12px); }`
- GOOD: `.panel { padding: var(--spacing-16); color: var(--color-content-body); gap: var(--spacing-12); }`
- WHY: a raw value never follows a theme or a token change, and a fallback hides a missing token.

**type.floor** — no font size below `typography.label.default-font-size`.
- BAD: `.meta { font-size: 13px; }`
- GOOD: `.meta { font-size: var(--typography-label-default-font-size); }`
- WHY: `typography.label.default-font-size` is the floor (16px, "Never go smaller"); no token exists under it.

**colour.ochre-is-a-fill** — ochre is the Needs you fill with ink text, never text, a line or selection.
- BAD: `.due { color: var(--color-brand-ochre-300); }` · `.row[aria-selected] { background: var(--color-brand-ochre-300); }`
- GOOD: `<Tag tone="attention">Needs you</Tag>` · selection uses `var(--color-background-accent-1)`
- WHY: ochre fails contrast as text or a line on light, and selection is pink.

## Working on BELLA itself

Maintainer rules (tokens, contrast pairs, relay, commit protocol): [docs/agents/maintaining.md](docs/agents/maintaining.md). Building or changing a doc page (Figma or site): read its "Doc pages" section first.
