import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import ListRow, { ListRowGroup } from './ListRow';
import Button from '../Button/Button';
import StatusPill from '../StatusPill/StatusPill';
import IconWell from '../IconWell/IconWell';
import StatusDot from '../StatusDot/StatusDot';
import Tag from '../Tag/Tag';
import ActionChip from '../ActionChip/ActionChip';
import cssRaw from './ListRow.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['list-row']?.$extensions?.bella ?? {};

const meta: Meta<typeof ListRow> = {
  title: 'Components/Data/ListRow',
  component: ListRow,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    status: { control: false },
    action: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: { title: 'Button has no dark story' },
};
export default meta;

type Story = StoryObj<typeof ListRow>;

const rows = (
  <>
    <ListRow
      status={<StatusPill variant="danger">Failing</StatusPill>}
      title="Button has no dark story"
      description="Every component shows both themes, so a dark regression stays hidden."
      action={<Button variant="secondary">Review</Button>}
    />
    <ListRow
      status={<StatusPill variant="success">Passing</StatusPill>}
      title="Tabs meets the 44px floor"
      description="Measured at every width. Nothing left to do."
      action={<Button variant="secondary">See check</Button>}
    />
    <ListRow title="No status on this one" description="A row can stand without a marker." />
  </>
);

/** A work list: statuses and actions line up down the list. */
export const WorkList: Story = {
  render: () => <ListRowGroup ariaLabel="What to do next">{rows}</ListRowGroup>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('list', { name: 'What to do next' });
    await expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    for (const b of canvas.getAllByRole('button')) {
      await expect(b.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
  },
};

/** In a narrow frame the same rows stack, with no sideways scroll. */
export const Narrow: Story = {
  render: () => (
    <div style={{ maxWidth: 'calc(var(--spacing-80) * 4)' }}>
      <ListRowGroup ariaLabel="What to do next, narrow">{rows}</ListRowGroup>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const list = within(canvasElement).getByRole('list');
    await expect(list.scrollWidth).toBeLessThanOrEqual(list.clientWidth);
  },
};

/** The title can carry a heading level when the page needs one. */
export const WithHeadingLevel: Story = {
  render: () => (
    <ListRowGroup ariaLabel="Changes">
      <ListRow titleAs="h3" title="Tokens rebuilt" description="The theme took the new scale." />
    </ListRowGroup>
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole('heading', { level: 3 })).toBeTruthy();
  },
};

/* ---- Zoned List item (Figma re-sync, 19 Nov 2026) ---- */

/** One card on the page ground; rows sit in a list inside it. The theme
 * toolbar picks the theme (audit:visual shoots all four). */
const Card = ({ children, width = 640, label }: { children: React.ReactNode; width?: number; label: string }) => (
  <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
    <ul
      aria-label={label}
      style={{ margin: 0, padding: 'var(--spacing-12)', listStyle: 'none', display: 'grid', gap: 'var(--spacing-4)', maxWidth: width, background: 'var(--color-background-surface)', borderRadius: 'var(--border-radius-card)' }}
    >
      {children}
    </ul>
  </div>
);

/** The Not again library rows: Icon well left, title and subtitle, ActionChip "Run" right. */
export const ZonedLibrary: Story = {
  render: () => (
    <Card label="Playbooks">
      {['Add contrast pair', 'Draw in Figma', 'Fill behaviour lines'].map((t) => (
        <ListRow
          key={t}
          layout="stacked"
          iconWell={<IconWell icon="Book" tone="info" />}
          title={t}
          description="Used 3 times · last 12 Nov"
          actionButton={<ActionChip>Run</ActionChip>}
        />
      ))}
    </Card>
  ),
};

/** layout stacked and inline, with every zone on: status dot and icon well
 * left; overline, title, subtitle, tag and text button in the middle; value,
 * sub value and action right; trailing; progress, helper and divider below. */
export const ZonedEveryZone: Story = {
  render: () => (
    <Card label="Every zone">
      <ListRow
        layout="stacked"
        iconWell={<IconWell icon="WarningCircle" tone="warning" />}
        overline="chip/theme"
        title="Figma check"
        description="No file key in server/.env"
        body="Body: the longer explanation, wrapping onto more lines when it needs to."
        tag={<Tag tone="attention">Waiting</Tag>}
        textButton={<Button variant="tertiary" size="sm">Add key</Button>}
        value="42/44"
        subValue="pass"
        actionButton={<ActionChip variant="quiet">Run</ActionChip>}
        progress={<div style={{ blockSize: 'var(--spacing-8)', borderRadius: 'var(--border-radius-round)', background: 'var(--color-border-strong)' }} aria-hidden="true" />}
        helperText="Progress is a slot: the Progress part goes here."
        divider
      />
      <ListRow layout="inline" statusDot={<StatusDot tone="success" label="Live" />} title="Tabs" tag={<Tag tone="success">Ready</Tag>} value="44/44" />
      <ListRow layout="inline" iconWell={<IconWell icon="Folder" tone="neutral" />} title="Opens something else" description="The whole row is the target" trailing href="#row" />
    </Card>
  ),
};

/** States: default, hover and pressed come from the target (hover a row);
 * selected is light blue; focus is the 4/4 ring (Tab into a row). */
export const ZonedStates: Story = {
  render: () => (
    <Card label="States">
      <ListRow layout="inline" title="Default, opens" description="Hover me: light blue" trailing href="#a" />
      <ListRow layout="inline" title="Selected" description="The darker light blue, never pink" trailing href="#b" selected />
      <ListRow layout="stacked" title="Does a thing" description="onClick row, with its own action" onClick={() => {}} actionButton={<ActionChip>Run</ActionChip>} />
    </Card>
  ),
  play: async ({ canvasElement, step }) => {
    for (const link of within(canvasElement).getAllByRole('link')) {
      const row = link.closest('[data-bella-component="list-row"]') as HTMLElement;
      await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    }
    await step('selected: the subtitle is content/default ink (21 Nov publish)', async () => {
      const selected = canvasElement.querySelector('[data-bella-component="list-row"][aria-current="true"]') as HTMLElement;
      const sub = within(selected).getByText('The darker light blue, never pink');
      const title = within(selected).getByText('Selected');
      await expect(getComputedStyle(sub).color).toBe(getComputedStyle(title).color);
    });
  },
};

/** 320 wide: the text wraps in its column, the right zone keeps its width. */
export const ZonedNarrow: Story = {
  render: () => (
    <Card label="Narrow" width={320}>
      <ListRow layout="stacked" iconWell={<IconWell icon="Book" tone="info" />} title="Fill behaviour lines" description="Used 3 times · last 12 Nov" actionButton={<ActionChip>Run</ActionChip>} />
      <ListRow layout="inline" title="Interface critique" value="9/44" trailing href="#n" />
    </Card>
  ),
};

/** Meta in the subtext face: a sentence in `description` (Lexend), a code and a date in `meta` (Geist Mono), as Team's trust rows. */
export const ZonedMeta: Story = {
  render: () => (
    <Card label="Meta" width={560}>
      <ListRow layout="stacked" title="Ships after review" description="Merges only on her typed OK." meta="OK #184 · 15 Oct" />
      <ListRow layout="stacked" title="Picks up the brief" meta="#212 · 19 Nov" />
    </Card>
  ),
};

/** Status bar (Figma 20 Nov, her reference 3): the bar the height of the text, Label / Title / Sub title, a text button over an outlined Tag on the right, then ›. Value label is a word in the body face. */
export const ZonedStatusBar: Story = {
  render: () => (
    <Card label="Status bar" width={560}>
      <ListRow
        layout="stacked"
        statusBar="attention"
        overline="Needs you"
        title="Figma check"
        description="No file key in server/.env · 10:29"
        actionButton={<Button variant="tertiary">Add file key</Button>}
        rightTag={<Tag variant="line">Design systems</Tag>}
        divider
      />
      <ListRow
        layout="stacked"
        statusBar="neutral"
        overline="Label"
        title="Title"
        meta="Sub title"
        actionButton={<Button variant="tertiary" size="sm">button</Button>}
        rightTag={<Tag variant="line">Label</Tag>}
        trailing
        href="#status-bar"
        divider
      />
      <ListRow layout="stacked" statusBar="attention" title="Contrast pairs" description="9 of 44 fail" valueLabel="Open stories" actionButton={<ActionChip variant="quiet">Fix</ActionChip>} />
      <ListRow layout="inline" statusBar="success" title="Focus ring" value="44/44" />
    </Card>
  ),
};

function GlowDemo() {
  const [n, setN] = React.useState(42);
  return (
    <ListRowGroup ariaLabel="Checks">
      <ListRow layout="inline" title="Story" description="Every component has one" value={`${n}/44`} actionButton={<ActionChip onClick={() => setN((x) => Math.min(44, x + 1))}>Test</ActionChip>} />
    </ListRowGroup>
  );
}

/** A changed value glows once (rule "Motion that shows what happened", item 1): Test runs the check
 * again and the new count glows, once. Nothing glows on first paint; reduced motion: none. */
export const ValueGlow: Story = {
  render: () => <GlowDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await step('first paint: no glow', async () => {
      await expect(canvasElement.querySelector('[class*="glow"]')).toBeNull();
    });
    await step(reduced ? 'a new value: no glow under reduced motion' : 'a new value glows once', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Test' }));
      const glow = canvasElement.querySelector('[class*="glow"]') as HTMLElement;
      await expect(glow).not.toBeNull();
      await expect(getComputedStyle(glow).animationName).toMatch(reduced ? /^none$/ : /valueGlow/);
      if (!reduced) await expect(getComputedStyle(glow).animationIterationCount).toBe('1');
    });
  },
};
