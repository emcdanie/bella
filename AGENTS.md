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
| Tabular data | `DataTable` · a table built from parts: `TableRow`, `TableCell` |
| Code, contracts, diffs | `CodeBlock` |
| Name an icon button | `Tooltip` |
| Work list: status, title, why, one action | `ListRow` |
| Explain something in place: numbered marker, dashed or solid line, pin with its name | `Pin`, `Leader`, `PinLabel` |
| Doc-page anatomy: outline and name on a piece; numbered part list; a measured size | `AnatomyHighlight`, `PartRow`, `SizeTag` |
| Show / hide content | `Disclosure`, `Drawer` |
| Labels and status | `Tag`, `StatusPill`, `Kbd`, `Avatar` |
| The key phrase in a line (bold plus blue underline) | `Marker` |
| Group of people (overlapping discs) | `AvatarStack` |
| Chat message bubble | `ChatBubble` |
| Chat message list | `ChatThread` |
| Someone is typing | `TypingDots` |
| Icons | `Icon` (Iconoir only) |
| Headings | `Heading`, `SectionHeader` |
| Above-heading label | `Eyebrow` |
| Page chrome | `PageHeader`, `Section` |
| Layout | `Columns`, `SidebarLayout`, `ScaledFrame`, `Stage` |
| The page frame: side menu, one top row (menu button, breadcrumb, title, actions), tabs, the scrolling content; one per page | `Screen` |
| Status beside a name: a dot and one word | `StatusDot` |
| Branch or run status mark | `StatusSquare` |
| A space with nothing in it yet (lane or page) | `EmptyState` |
| Icon in a tinted circle (section heads, rows) | `IconWell` |
| Title, subtitle and body as one text column | `TextStack` |
| The › on anything that opens something | `Trailing` |
| Bar, segments or ring, with a target | `Progress` (target: `ProgressTarget`) |
| Where a step or job is: running (turning arc), done, waiting, failed | `ProgressRing` |
| Whether anything is running, which run, its step and the time (one pill, always visible) | `RunIndicator` |
| One job in an activity list: state ring, title, when and how far | `TimelineRow` |
| The stamp under an action that can run again ("Ran 09:24 · 2 s · nothing new") | `LastRun` |
| One number with its chart, context and caption | `StatCard` |
| Runs over time as bars, failures red with a cross, a callout, a table behind it (Gate runs) | `BarChart` |
| How healthy the system is: the segmented arc gauge and the failing checks | `SystemHealth` |
| One step of the type ramp, set in its own size (Foundations) | `TypeSpecimen` |
| One spacing step drawn at its real size (Foundations) | `SpacingStep` |
| One corner token on a tile with its names (Foundations) | `RadiusTile` |
| One easing token as its curve; one duration as a to-scale bar, its DurationBar (Foundations) | `EasingCurve` |
| One colour role as a Pantone-style chip: colour, name, hex, contrast | `Swatch` |
| A variant or state thumbnail with its label; a row picks one | `VariantTile` |
| One step of a code walkthrough ("Help me understand"): pin, text, Back / Next | `TourStep` |
| A connected app or service: its icon on a coloured tile, optional badge | `AppTile` |
| One 16:9 slide (drawn at 1280 by 720, scaled to fit); the first or last slide with an eyebrow, hero title and lead | `Slide`, `TitleSlide` |
| Controls under a presented deck: Back, count, Next, Notes, All slides | `DeckBar` |
| A silent clip with a still, captions and a Play or Pause button (a deck's opening film) | `VideoPlayer` |
| A short message after an action that comes and goes (Notification stays) | `Toast` |
| One connected service on Connectors: app tile, status, name, value, one action | `ConnectorTile` |
| Work board: a lane of cards, one task card, a group's name in an order | `BoardLane`, `TaskCard`, `GroupHead` |
| A panel detached into a small window you can move over any page (the Terminal) | `FloatingPanel` |
| The thin column of view tools beside a stage: zoom, fit, light or dark, mark up, compare | `ToolColumn` |
| The actions on one thing, from a "…" button | `Menu` |
| A trend over time (line and soft area, scrubber and callout) and its sparkline | `LineChart` |
| Two scores per item on one scale, the gap between them | `GapChart` |
| How much each item adds to or takes from a total, from a middle zero | `ShareBars` |
| One score in a tile: label above, number centred, tinted by its state with its word; can toggle | `ScoreTile` |
| The mini trend line of a stat (line, end dot, scrubber, summary and table) | `Sparkline` |
| One health check row (a ListRow set-up) and its list header | `CheckRow` |
| One step in a short ordered process, and its connector | `Step`, `MapLine` |
| One step of a process map (name and health), joined by `MapLine` curves | `MapNode` |
| A process as a mind map: a branch between any two points, a step as bare text on its end, the root and stage names, and a stage as a tappable group on a phone | `Branch`, `MapLeaf`, `MapLabel`, `BranchGroup` |
| A message that stays, with its actions | `Notification` |
| The head of a section card: icon, title, info, description | `SectionHead` |
| CHIP app shell | `SideMenu`, `IconRail`, `NavItem`, `ProjectPanel`, `TreeItem`, `ClientSwitcher`, `TopBar`, `SearchField` |
| Brand art (not for product UI) | `BrandWordmark`, `PatternField` |

Props, variants and examples: each component's `.tsx` types and Storybook stories. Machine-readable contracts: `bella.dsds.yaml`.

## Open

- Not in BELLA yet, ask, don't build: Switch/toggle, Checkbox, Radio, Dialog/Modal, Alert, Textarea, Pagination, destructive Button, Skeleton (a loading placeholder of the content's shape; CHIP's Progress rule wants one for waits of 1 to 3 seconds, and its loading view shows a bar instead until it exists). Stopping to name the gap is intended (decided 12 Nov). Build order: Switch, Input password with show/hide, Dialog, destructive Button, Pagination (Select's error state shipped 25 Nov 2026).
- Warning and info status tones: undecided (issue #1); don't invent values or new status UI.
- Warm theme (`[data-theme="warm"]`): deferred; don't rebuild or retire it until Elleta decides.
- Open foundation and component choices: the Figma Decide board (file key in `FIGMA_DECIDE_FILE_KEY`, node 244-2).

## Floors (always)

Body ≥ 16px, the Figma body size (decided 17 Nov) · nothing < 16px except meta lines at 14 (`typography.font-size.14`, Geist Mono on a 20 line, marked `data-bella-meta`; decided 22 Nov) · targets ≥ 44px · focus ring = BELLA's (never removed) · pink only for selection, ochre for Needs you · AAA for body text.

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
- WHY: `typography.label.default-font-size` is the floor (16px, "Never go smaller"). The one exception is a meta line (14, `data-bella-meta`), never reading text.

**colour.ochre-is-a-fill** — ochre is the Needs you fill with ink text, never text, a line or selection.
- BAD: `.due { color: var(--color-brand-ochre-300); }` · `.row[aria-selected] { background: var(--color-brand-ochre-300); }`
- GOOD: `<Tag tone="attention">Needs you</Tag>` · selection uses `var(--color-background-accent-1)`
- WHY: ochre fails contrast as text or a line on light, and selection is pink.

## Working on BELLA itself

Maintainer rules (tokens, contrast pairs, relay, commit protocol): [docs/agents/maintaining.md](docs/agents/maintaining.md). Building or changing a doc page (Figma or site): read its "Doc pages" section first.
