import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import CheckRow, { CheckListHeader } from './CheckRow';
import { ListRowGroup } from '../ListRow/ListRow';
import cssRaw from './CheckRow.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['check-row']?.$extensions?.bella ?? {};

/** Checks sit in a card on the page. */
const Card = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-surface)',
      borderRadius: 'var(--border-radius-card)',
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--spacing-12)',
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof CheckRow> = {
  title: 'Components/Data/CheckRow',
  component: CheckRow,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    status: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
    onAction: { control: false },
  },
  args: { status: 'pass', title: 'Story', subtitle: 'Missing: BrandWordmark, PatternField', value: '42/44', fill: 95, target: 90, as: 'div' },
  render: (args) => (
    <Card>
      <CheckRow {...args} onAction={() => {}} />
    </Card>
  ),
};
export default meta;

type Story = StoryObj<typeof CheckRow>;

export const Playground: Story = {};

/** Figma's set: pass, then fail with the text button underneath. Counts say what they count. */
export const ComponentChecks: Story = {
  render: () => (
    <Card>
      <CheckListHeader title="Component checks" count={3} legend="Target 90%" />
      <ListRowGroup ariaLabel="Component checks">
        <CheckRow status="pass" title="Story" subtitle="Above the 90% target" value="44/44" fill={100} target={90} />
        <CheckRow status="fail" title="Contrast pairs" subtitle="Missing: BrandWordmark, PatternField" value="35/44" fill={80} target={90} onAction={() => {}} actionLabel="Add pairs" />
        <CheckRow status="fail" title="Docs" subtitle="Missing: Menu, TaskCard" value="40/44" fill={91} target={95} onAction={() => {}} actionLabel="Add docs" />
      </ListRowGroup>
    </Card>
  ),
};

/** The bar is named by the check and reads its amount; the action is a real button. */
export const Behavior: Story = {
  render: () => (
    <Card>
      <ListRowGroup ariaLabel="Checks">
        <CheckRow status="fail" title="Story" subtitle="Missing: BrandWordmark" value="42/44" fill={95} target={90} onAction={() => {}} />
      </ListRowGroup>
    </Card>
  ),
  play: async ({ canvas, step }) => {
    await step('progress named by the check, with its amount', async () => {
      const bar = canvas.getByRole('progressbar', { name: 'Story' });
      await expect(bar).toHaveAttribute('aria-valuetext', '42/44');
    });
    await step('the action is a button with a 44 target', async () => {
      const b = canvas.getByRole('button', { name: 'Add stories' });
      await expect(b).toBeVisible();
    });
  },
};

const WEATHER = [
  { title: 'Story', passed: 83 },
  { title: 'Docs', passed: 80 },
  { title: 'Contract', passed: 83 },
  { title: 'Spec', passed: 83 },
  { title: 'Contrast', passed: 81 },
  { title: 'A11y', passed: 52 },
];

/** layout=weather (Figma, 22 Nov, her pick "C · Weather rows"): one 56 row per check, a pip per 5
 * parts, the dashed target at 90%, the count on the right; no divider under the last row. */
export const Weather: Story = {
  render: () => (
    <Card>
      <ListRowGroup ariaLabel="Component checks">
        {WEATHER.map((c, i) => (
          <CheckRow key={c.title} layout="weather" title={c.title} passed={c.passed} total={85} value={`${c.passed}/85`} target={90} showDivider={i < WEATHER.length - 1} />
        ))}
      </ListRowGroup>
    </Card>
  ),
  play: async ({ canvas, canvasElement }) => {
    const rows = canvasElement.querySelectorAll<HTMLElement>('[data-bella-layout="weather"]');
    await expect(rows).toHaveLength(6);
    await expect(rows[0].tagName).toBe('LI');
    await expect(Math.round(rows[0].getBoundingClientRect().height)).toBe(56);
    // 85 parts = 17 pips; 83 pass = 17 filled; A11y 52 = 10 filled, under the target
    const story = canvas.getByRole('img', { name: 'Story: 83 of 85 pass, target 90%' });
    await expect(story.querySelectorAll(':scope > span')).toHaveLength(18); // 17 pips + the target line
    const pip = story.firstElementChild as HTMLElement;
    await expect(Math.round(pip.getBoundingClientRect().height)).toBe(20);
    await expect(getComputedStyle(pip).borderRadius).toBe('4px');
    // Docs 80 of 85: 16 filled, the 17th on the track
    const docs = canvas.getByRole('img', { name: 'Docs: 80 of 85 pass, target 90%' });
    await expect(getComputedStyle(docs.children[15]).backgroundColor).toBe(getComputedStyle(pip).backgroundColor);
    await expect(getComputedStyle(docs.children[16]).backgroundColor).not.toBe(getComputedStyle(pip).backgroundColor);
    const a11y = canvas.getByRole('img', { name: 'A11y: 52 of 85 pass, target 90%' });
    const a11yPips = Array.from(a11y.children).slice(0, 17) as HTMLElement[];
    await expect(getComputedStyle(a11yPips[0]).backgroundColor).not.toBe(getComputedStyle(pip).backgroundColor);
    await expect(getComputedStyle(a11yPips[9]).backgroundColor).toBe(getComputedStyle(a11yPips[0]).backgroundColor);
    await expect(getComputedStyle(a11yPips[10]).backgroundColor).not.toBe(getComputedStyle(a11yPips[0]).backgroundColor);
    // the target line reaches 4 above and below the pips
    const line = story.lastElementChild as HTMLElement;
    await expect(Math.round(story.getBoundingClientRect().top - line.getBoundingClientRect().top)).toBe(4);
    await expect(Math.round(line.getBoundingClientRect().bottom - story.getBoundingClientRect().bottom)).toBe(4);
    // divider on every row but the last
    await expect(getComputedStyle(rows[0]).borderBottomStyle).toBe('solid');
    await expect(getComputedStyle(rows[5]).borderBottomStyle).toBe('none');
  },
};
