import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import StatCard from './StatCard';
import Button from '../Button/Button';
import cssRaw from './StatCard.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';
import reduceMotion from '../shared/reduceMotion';

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
    label: 'Have pairs',
    value: '80',
    unit: '%',
    context: '35 of 44 have pairs · 9 to go',
    caption: 'Compared today, 10:19',
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
        <StatCard key={`bar-${tone}`} title={`Bar · ${tone}`} value="80" unit="%" context="35 of 44 have pairs · 9 to go" caption="Compared today, 10:19" tone={tone} icon="Check" meter={{ fill: 80, target: 90 }} href="#x" />
      ))}
      {(['success', 'warning', 'info', 'danger'] as const).map((tone) => (
        <StatCard key={`seg-${tone}`} title={`Segments · ${tone}`} value="4" unit="of 5" context="4 of 5 checks pass · 1 to fix" caption="Compared today, 10:19" chart="segments" tone={tone} icon="Check" meter={{ segments: 5, done: 4 }} href="#x" />
      ))}
      <StatCard title="With action" value="0" unit="%" context="No target set yet" caption="Compared today, 10:19" tone="info" icon="Check" meter={{ fill: 0 }} button={<Button variant="secondary" size="sm">Set target</Button>} />
    </Themed>
  ),
};

/** The published variants side by side (Stat card 1168:56015, 21 Nov): bar, segments, none and empty, 330 wide. */
export const OnePattern: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 'var(--spacing-16)', padding: 'var(--spacing-16)', background: 'var(--color-background-default)' }}>
      <StatCard style={{ inlineSize: 'calc(var(--spacing-80) * 4.125)' }} title="Drift from BELLA" value="4" unit="of 5" context="Parts that differ from BELLA" caption="Compared today, 10:19" tone="success" icon="ShieldCheck" meter={{ fill: 80, target: 90 }} href="#a" />
      <StatCard style={{ inlineSize: 'calc(var(--spacing-80) * 4.125)' }} title="Drift from BELLA" value="4" unit="of 5" context="Parts that differ from BELLA" caption="Compared today, 10:19" chart="segments" tone="danger" icon="Brain" meter={{ segments: 5, done: 4 }} href="#b" />
      <StatCard style={{ inlineSize: 'calc(var(--spacing-80) * 4.125)' }} title="Drift from BELLA" value="4" unit="of 5" context="Parts that differ from BELLA" caption="Compared today, 10:19" chart="none" tone="info" icon="ShieldCheck" href="#c" />
      <StatCard style={{ inlineSize: 'calc(var(--spacing-80) * 4.125)' }} title="Drift from BELLA" context="Parts that differ from BELLA" caption="Not compared yet" chart="empty" tone="neutral" icon="Activity" href="#d" button={<Button variant="secondary" size="sm">Compare</Button>} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="stat-card"]');
    const well = cards[0].querySelector('[data-bella-component="icon-well"]') as HTMLElement;
    const value = cards[0].querySelector('p span') as HTMLElement;
    await waitFor(() => expect(value).toHaveTextContent('4'), { timeout: 3000 });
    await expect(Math.round(well.getBoundingClientRect().left - cards[0].getBoundingClientRect().left)).toBe(24);
    await expect(Math.round(value.getBoundingClientRect().left - cards[0].getBoundingClientRect().left)).toBe(24);
    await expect(getComputedStyle(value).fontWeight).toBe('600');
    await expect(cards[2].querySelector('[role="progressbar"]')).toBeNull();
    await expect(cards[3].querySelector('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '0');
    // chart=empty: no figure before a measure (22 Nov 19:08)
    await expect(cards[3].querySelector('[class*="number"]')).toBeNull();
    await expect(cards[3]).toHaveTextContent('Not compared yet');
    // batch 4 (published 22 Nov): value 40 on 48, unit 20 on 28, number to bar 8, bar to line 16
    const unit = value.nextElementSibling as HTMLElement;
    await expect([getComputedStyle(value).fontSize, getComputedStyle(value).lineHeight]).toEqual(['40px', '48px']);
    await expect([getComputedStyle(unit).fontSize, getComputedStyle(unit).lineHeight]).toEqual(['20px', '28px']);
    const number = value.parentElement as HTMLElement;
    const bar = cards[0].querySelector('[role="progressbar"]') as HTMLElement;
    const context = cards[0].querySelector<HTMLElement>('[class*="context"]')!;
    await expect(Math.round(bar.getBoundingClientRect().top - number.getBoundingClientRect().bottom)).toBe(8);
    // the Meter carries the 8 below its track (Figma Meter pad bottom 8), so track to line is 8 + 8
    const track = bar.getBoundingClientRect().bottom - parseFloat(getComputedStyle(bar).paddingBottom);
    await expect(Math.round(context.getBoundingClientRect().top - track)).toBe(16);
  },
};

/** The chart language row (22 Nov 20:48, as Figma "row"): three cards in a grid row, one chart=empty.
 * Each has a small-caps label over its number; the cards share the tallest height, each body fills it
 * with its content centred, and every footer sits on the card's bottom edge. */
export const Row: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        alignItems: 'stretch',
        gap: 'var(--spacing-24)',
        padding: 'var(--spacing-24)',
        background: 'var(--color-background-default)',
        maxInlineSize: 'calc(var(--spacing-80) * 14)',
      }}
    >
      <StatCard title="Contrast coverage" label="Have pairs" value="95" unit="%" context="81 of 85 · target 80%" caption="Compared today, 10:19" tone="success" icon="ShieldCheck" meter={{ fill: 95, target: 80 }} href="#coverage" />
      <StatCard title="Drift from BELLA" label="Parts that differ" value="4" unit="of 5" context="4 of 5 · target 5 of 5" caption="Compared today, 10:19" chart="segments" tone="warning" icon="Brain" meter={{ segments: 5, done: 3 }} href="#drift" />
      <StatCard title="Lowest contrast" label="Lowest pair" context="Waiting for the first check" caption="Not compared yet" chart="empty" tone="neutral" icon="Activity" href="#lowest" button={<Button variant="secondary" size="sm">Compare</Button>} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="stat-card"]'));
    await expect(cards).toHaveLength(3);
    // equal height, footers on one bottom line (within 1px)
    const heights = cards.map((c) => Math.round(c.getBoundingClientRect().height));
    await expect(new Set(heights).size).toBe(1);
    const footBottoms = cards.map((c) => (c.lastElementChild as HTMLElement).getBoundingClientRect().bottom);
    await expect(Math.max(...footBottoms) - Math.min(...footBottoms)).toBeLessThanOrEqual(1);
    // the label: uppercase small caps, 4 above the number; still drawn on chart=empty, the number not
    const label = cards[0].querySelector<HTMLElement>('[class*="label"]')!;
    await expect(getComputedStyle(label).textTransform).toBe('uppercase');
    await expect(getComputedStyle(label).fontSize).toBe('14px');
    const number = label.nextElementSibling as HTMLElement;
    await expect(Math.round(number.getBoundingClientRect().top - label.getBoundingClientRect().bottom)).toBe(4);
    // Figma row (22 Nov, parts-7 at 100%): the label right under the 44 header, the caption right under
    // the context line, the card 268 tall in Figma (code 272: label and meta lines on the 4 grid)
    const header = cards[0].firstElementChild as HTMLElement;
    const footer = cards[0].lastElementChild as HTMLElement;
    const ctxLine = cards[0].querySelector<HTMLElement>('[class*="context"]')!;
    await expect(Math.round(header.getBoundingClientRect().height)).toBe(44);
    await expect(Math.round(label.getBoundingClientRect().top - header.getBoundingClientRect().bottom)).toBe(0);
    await expect(Math.round(footer.getBoundingClientRect().top - ctxLine.getBoundingClientRect().bottom)).toBe(0);
    await expect(heights[0]).toBeLessThanOrEqual(272);
    await expect(cards[2].querySelector('[class*="label"]')).toBeVisible();
    await expect(cards[2].querySelector('[class*="number"]')).toBeNull();
    // context is one meta line at 14
    const meta = cards[0].querySelector<HTMLElement>('[class*="context"]')!;
    await expect([getComputedStyle(meta).fontSize, getComputedStyle(meta).lineHeight]).toEqual(['14px', '20px']);
  },
};

/** A caption too long to share the footer line with its button, 330 wide: the caption takes the line and the button moves under it, at the right edge. */
export const LongCaption: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-16)', background: 'var(--color-background-default)' }}>
      <StatCard style={{ inlineSize: 'calc(var(--spacing-80) * 4.125)' }} title="Lowest contrast" context="No pairs measured yet" caption="Runs after the next gate on main" chart="empty" tone="neutral" icon="Activity" href="#e" button={<Button variant="secondary" size="sm">Compare</Button>} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = canvasElement.querySelector<HTMLElement>('[data-bella-component="stat-card"]')!;
    const caption = card.querySelector<HTMLElement>('[class*="caption"]')!;
    const button = card.querySelector<HTMLElement>('button')!;
    const c = caption.getBoundingClientRect();
    const b = button.getBoundingClientRect();
    const k = card.getBoundingClientRect();
    // caption on one line, button under it at the right edge (24 padding)
    await expect(Math.round(c.height)).toBe(24);
    await expect(b.top).toBeGreaterThanOrEqual(c.bottom);
    await expect(Math.round(k.right - b.right)).toBe(24);
  },
};

/** The header row is one link with the ↗; the bar takes focus only for its callout. */
export const Behavior: Story = {
  play: async ({ canvas, step }) => {
    await step('header is one link, chart is a progressbar', async () => {
      const link = canvas.getByRole('link');
      expect(link).toHaveTextContent('Contrast coverage');
      expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '80');
    });
  },
};

/** The tip of a bar's callout: the Tooltip bubble round the Progress part. */
const tipOf = (bar: HTMLElement) => bar.closest('[data-bella-component="tooltip"]')!.querySelector<HTMLElement>('[aria-hidden="true"][id]')!;

/** Chart motion and callout (22 Nov, CHIP chart language): the bar grows from the start and the number
 * counts up from 0 over motion/duration/450; hover or focus on the bar shows BELLA's Tooltip 16 under it,
 * pointing up ("80% · target 90%"; segments "4 of 5 · target 80%"). Assistive tech reads the final value only. */
export const MotionAndCallout: Story = {
  render: () => (
    <Themed>
      <StatCard title="Contrast coverage" value="80" unit="%" context="35 of 44 have pairs · 9 to go" caption="Compared today, 10:19" tone="success" icon="Check" meter={{ fill: 80, target: 90 }} href="#coverage" />
      <StatCard title="Gate checks" value="4" unit="of 5" context="4 of 5 checks pass · 1 to fix" caption="Compared today, 10:19" chart="segments" tone="info" icon="Check" meter={{ segments: 5, done: 4, target: 80, valueText: '4 of 5' }} href="#gate" />
    </Themed>
  ),
  play: async ({ canvasElement, step }) => {
    const cards = canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="stat-card"]');
    const bar = cards[0].querySelector<HTMLElement>('[role="progressbar"]')!;
    await step('final state: 80, the fill at 80%, the words read once', async () => {
      const value = cards[0].querySelector<HTMLElement>('[class*="value"]')!;
      await waitFor(() => expect(value.querySelector('[aria-hidden="true"]')).toHaveTextContent(/^80$/), { timeout: 3000 });
      await expect(value.querySelector('[class*="srOnly"]')).toHaveTextContent(/^80$/);
      await expect(bar).toHaveAttribute('aria-valuenow', '80');
      await expect(bar).toHaveAttribute('aria-valuetext', '80%, target 90%');
    });
    await step('focus on the bar: the Tooltip with the value and the target, 16 under the bar', async () => {
      bar.focus();
      await waitFor(() => expect(tipOf(bar)).toBeVisible());
      await waitFor(() => expect(tipOf(bar)).toHaveTextContent('80% · target 90%'));
      const track = bar.querySelector<HTMLElement>('[data-bella-component="progress-fill"]')!.parentElement!;
      await expect(Math.round(tipOf(bar).getBoundingClientRect().top - track.getBoundingClientRect().bottom)).toBe(16);
      bar.blur();
      await waitFor(() => expect(tipOf(bar)).not.toBeVisible());
    });
    await step('hover on the segments: "4 of 5 · target 80%"', async () => {
      const segs = cards[1].querySelector<HTMLElement>('[role="progressbar"]')!;
      await userEvent.hover(segs);
      await waitFor(() => expect(tipOf(segs)).toHaveTextContent('4 of 5 · target 80%'));
      await userEvent.unhover(segs);
    });
  },
};

/** No data yet (22 Nov 19:08): title, the empty bar, the context line and "Not compared yet" with its Compare action, no number. */
export const Empty: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-16)', background: 'var(--color-background-default)' }}>
      <StatCard style={{ inlineSize: 'calc(var(--spacing-80) * 4.125)' }} title="Drift from BELLA" context="Parts that differ from BELLA" caption="Not compared yet" chart="empty" tone="neutral" icon="Activity" href="#d" button={<Button variant="secondary" size="sm">Compare</Button>} />
    </div>
  ),
  play: async ({ canvasElement, canvas }) => {
    const card = canvasElement.querySelector<HTMLElement>('[data-bella-component="stat-card"]')!;
    await expect(card.querySelector('[class*="number"]')).toBeNull();
    await expect(canvas.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    await expect(canvas.getByText('Not compared yet')).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Compare' })).toBeVisible();
  },
};

/** Reduced motion (matchMedia mocked to "reduce"): the number and the bar show their end state at once. */
export const ReducedMotion: Story = {
  beforeEach: reduceMotion,
  render: () => (
    <div style={{ maxInlineSize: '24rem' }}>
      <StatCard title="Contrast coverage" value="80" unit="%" context="35 of 44 have pairs · 9 to go" caption="Compared today, 10:19" tone="success" icon="Check" meter={{ fill: 80, target: 90 }} href="#coverage" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const value = canvasElement.querySelector<HTMLElement>('[class*="value"] [aria-hidden="true"]')!;
    await expect(value).toHaveTextContent(/^80$/);
    const fill = canvasElement.querySelector<HTMLElement>('[data-bella-component="progress-fill"]')!;
    await expect(getComputedStyle(fill).animationName).toBe('none');
  },
};
