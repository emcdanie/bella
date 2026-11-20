import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import StatCard from './StatCard';
import Button from '../Button/Button';
import cssRaw from './StatCard.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['stat-card']?.$extensions?.bella ?? {};

/** Cards sit on the page ground (background/default), as on a screen. */
/* The theme toolbar picks the theme (audit:visual shoots all four). */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-default)',
      borderRadius: 'var(--border-radius-12)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(18rem, 1fr))',
      gap: 'var(--spacing-24)',
      alignItems: 'stretch',
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof StatCard> = {
  title: 'Components/Data/StatCard',
  component: StatCard,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    chart: { control: 'inline-radio' },
    tone: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
    button: { control: false },
  },
  args: {
    title: 'Contrast coverage',
    value: '80',
    unit: '%',
    context: '35 of 44 have pairs · 9 to go',
    caption: 'Target 90%',
    chart: 'bar',
    tone: 'success',
    icon: 'Check',
    meter: { fill: 80, target: 90 },
    href: '#coverage',
  },
  render: (args) => (
    <div style={{ maxInlineSize: '24rem' }}>
      <StatCard {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof StatCard>;

export const Playground: Story = {};

/** The "Not again" results row (kept): two cards share a height. "Runs this week" has no chart, as in Figma. */
export const NotAgainRow: Story = {
  render: () => (
    <Themed>
      <StatCard
        title="Runs this week"
        value="2"
        context="Playbook runs since Monday"
        caption="Last run today"
        chart="bar"
        tone="info"
        icon="RefreshDouble"
        href="#runs"
      />
      <StatCard
        title="Kept"
        value="1"
        unit="of 2"
        context="Kept 1 · undone 1 · 0 waiting on you"
        caption="Undone runs stay in History"
        chart="bar"
        tone="success"
        icon="Check"
        meter={{ fill: 50, valueText: '1 of 2 kept' }}
        href="#kept"
      />
    </Themed>
  ),
};

/** Every chart × tone, with the target on bars; one card with its action button, one at 0. */
export const ChartsAndTones: Story = {
  render: () => (
    <Themed>
      {(['success', 'warning', 'info', 'danger'] as const).map((tone) => (
        <StatCard key={`bar-${tone}`} title={`Bar · ${tone}`} value="80" unit="%" context="35 of 44 have pairs · 9 to go" caption="Target 90%" tone={tone} icon="Check" meter={{ fill: 80, target: 90 }} href="#x" />
      ))}
      {(['success', 'warning', 'info', 'danger'] as const).map((tone) => (
        <StatCard key={`seg-${tone}`} title={`Segments · ${tone}`} value="4" unit="of 5" context="4 of 5 checks pass · 1 to fix" caption="Target 5 of 5" chart="segments" tone={tone} icon="Check" meter={{ segments: 5, done: 4 }} href="#x" />
      ))}
      <StatCard title="With action" value="0" unit="%" context="No target set yet" caption="No target" tone="info" icon="Check" meter={{ fill: 0 }} button={<Button variant="secondary" size="sm">Set target</Button>} />
    </Themed>
  ),
};

/** The published variants side by side (Stat card 1168:56015, 21 Nov): bar, segments, none and empty, 330 wide. */
export const OnePattern: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 'var(--spacing-16)', padding: 'var(--spacing-16)', background: 'var(--color-background-default)' }}>
      <StatCard style={{ inlineSize: 'calc(var(--spacing-80) * 4.125)' }} title="Drift from BELLA" value="5" unit="of 5" context="Parts that differ from BELLA" caption="Not compared yet" tone="success" icon="ShieldCheck" meter={{ fill: 80, target: 90 }} href="#a" />
      <StatCard style={{ inlineSize: 'calc(var(--spacing-80) * 4.125)' }} title="Drift from BELLA" value="5" unit="of 5" context="Parts that differ from BELLA" caption="Not compared yet" chart="segments" tone="danger" icon="Brain" meter={{ segments: 5, done: 5 }} href="#b" />
      <StatCard style={{ inlineSize: 'calc(var(--spacing-80) * 4.125)' }} title="Drift from BELLA" value="5" unit="of 5" context="Parts that differ from BELLA" caption="Not compared yet" chart="none" tone="info" icon="ShieldCheck" href="#c" />
      <StatCard style={{ inlineSize: 'calc(var(--spacing-80) * 4.125)' }} title="Drift from BELLA" value="5" unit="of 5" context="Parts that differ from BELLA" caption="Not compared yet" chart="empty" tone="neutral" icon="Activity" href="#d" button={<Button variant="secondary" size="sm">Compare</Button>} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="stat-card"]');
    const well = cards[0].querySelector('[data-bella-component="icon-well"]') as HTMLElement;
    const value = cards[0].querySelector('p span') as HTMLElement;
    await expect(Math.round(well.getBoundingClientRect().left - cards[0].getBoundingClientRect().left)).toBe(24);
    await expect(Math.round(value.getBoundingClientRect().left - cards[0].getBoundingClientRect().left)).toBe(24);
    await expect(getComputedStyle(value).fontWeight).toBe('700');
    await expect(cards[2].querySelector('[role="progressbar"]')).toBeNull();
    await expect(cards[3].querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '0');
  },
};

/** The header row is one link with the ↗; nothing else is a target. */
export const Behavior: Story = {
  play: async ({ canvas, step }) => {
    await step('header is one link, chart is a progressbar', async () => {
      const link = canvas.getByRole('link');
      expect(link).toHaveTextContent('Contrast coverage');
      expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80');
    });
  },
};
