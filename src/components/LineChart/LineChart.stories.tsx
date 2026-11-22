import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import LineChart from './LineChart';
import cssRaw from './LineChart.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';
import reduceMotion from '../shared/reduceMotion';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['line-chart']?.$extensions?.bella ?? {};

const score = [
  { label: 'Mon', value: 62 },
  { label: 'Tue', value: 64 },
  { label: 'Wed', value: 63 },
  { label: 'Thu', value: 70 },
  { label: 'Fri', value: 74 },
  { label: 'Sat', value: 73 },
  { label: 'Sun', value: 78 },
];

const Frame = ({ children, w = '32rem' }: { children: React.ReactNode; w?: string }) => (
  <div style={{ inlineSize: w, maxInlineSize: '100%', padding: 'var(--spacing-16)', background: 'var(--color-background-surface)', borderRadius: 'var(--border-radius-20)' }}>{children}</div>
);

const meta: Meta<typeof LineChart> = {
  title: 'Components/Data/LineChart',
  component: LineChart,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: {
    tone: { control: 'select' },
    baseline: { control: 'inline-radio' },
    draw: { control: 'inline-radio' },
    variant: { control: 'inline-radio' },
    view: { control: 'inline-radio' },
    points: { control: false },
    reference: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: { points: score, label: 'Audit score', unit: '%', tone: 'brand', defaultSelectedIndex: 4 },
  render: (args) => (
    <Frame>
      <LineChart {...args} />
    </Frame>
  ),
};
export default meta;
type Story = StoryObj<typeof LineChart>;

const live = (root: HTMLElement) => root.querySelector('[data-testid="line-chart-live"]') as HTMLElement;

/** The picked point: a rounded scrubber on the line, a dark pill with the change against the previous point. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const pill = canvasElement.querySelector('[data-testid="line-chart-callout"]') as HTMLElement;
    await expect(pill).toHaveTextContent('+6%');
    await expect(pill).toHaveTextContent('74%');
    await expect(canvasElement.querySelector('[data-testid="line-chart-scrubber"]')).not.toBeNull();
    await expect(live(canvasElement)).toHaveTextContent('Fri, 74%, up 6% on the previous point');
  },
};

/** Six tones by meaning; the pill and summary say it in words as well. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))', padding: 'var(--spacing-16)' }}>
      {(['brand', 'success', 'warning', 'danger', 'info', 'neutral'] as const).map((tone) => (
        <Frame key={tone} w="100%">
          <LineChart points={score} label={`Score, ${tone}`} tone={tone} unit="%" />
        </Frame>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const colours = Array.from(canvasElement.querySelectorAll<SVGPathElement>('path[class*="line"]')).map((p) => getComputedStyle(p).stroke);
    await expect(new Set(colours).size).toBe(6);
    await expect(getComputedStyle(canvasElement.querySelector('path[class*="line"]')!).strokeWidth).toBe('1.5px');
  },
};

/** The scale starts at zero by default; auto fits the data and prints why. */
export const Baseline: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', padding: 'var(--spacing-16)' }}>
      <Frame><LineChart points={score} label="From zero" unit="%" /></Frame>
      <Frame><LineChart points={score} label="Fitted to the data" unit="%" baseline="auto" baselineReason="it shows how the score moved, not the score." /></Frame>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [zero, auto] = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="line-chart"]'));
    await expect(zero).not.toHaveTextContent('Scale does not start at zero');
    await expect(auto).toHaveTextContent('Scale does not start at zero: it shows how the score moved, not the score.');
    await expect(zero.querySelectorAll('[class*="yLabel"]')[1]).toHaveTextContent('0');
  },
};

/** The sparkline: line, area and a dot on the last point; no axes, grid or scrubber. */
export const Compact: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', inlineSize: '16rem', padding: 'var(--spacing-16)' }}>
      <LineChart variant="compact" points={score} label="Audit score" tone="success" unit="%" />
      <LineChart variant="compact" points={score.map((p) => ({ ...p, value: 100 - p.value }))} label="Failures" tone="danger" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const c of Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-variant="compact"]'))) {
      await expect(c.querySelector('[data-testid="line-chart-dot"]')).not.toBeNull();
      await expect(c.querySelector('[class*="gridline"]')).toBeNull();
      await expect(c.querySelector('[class*="xAxis"]')).toBeNull();
      await expect(c.querySelector('[role="slider"]')).toBeNull();
      await expect(c.querySelector('[class*="plot"]')!.getBoundingClientRect().height).toBeLessThanOrEqual(44);
    }
  },
};

/** Arrow keys move the scrubber, Home and End jump, Escape clears; the words are spoken through a live region. */
export const Keyboard: Story = {
  args: { defaultSelectedIndex: null },
  play: async ({ canvasElement }) => {
    const slider = canvasElement.querySelector('[role="slider"]') as HTMLElement;
    await userEvent.tab();
    await expect(slider).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(slider).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await expect(slider).toHaveAttribute('aria-valuenow', '2');
    await expect(slider.getAttribute('aria-valuetext')).toContain('Wed, 63%');
    await waitFor(() => expect(live(canvasElement)).toHaveTextContent('Wed, 63%, down 2% on the previous point'));
    await userEvent.keyboard('{End}');
    await expect(slider).toHaveAttribute('aria-valuenow', '6');
    await userEvent.keyboard('{Home}');
    await expect(slider).toHaveAttribute('aria-valuenow', '0');
    await userEvent.keyboard('{Escape}');
    await expect(canvasElement.querySelector('[data-testid="line-chart-callout"]')).toBeNull();
  },
};

/** Controlled: the caller holds the index; pointer and keys report through onSelectedIndexChange. */
export const Controlled: Story = {
  render: () => {
    const [i, setI] = useState<number | null>(1);
    return (
      <Frame>
        <LineChart points={score} label="Audit score" unit="%" selectedIndex={i} onSelectedIndexChange={setI} />
        <button type="button" data-testid="jump" onClick={() => setI(5)} style={{ minBlockSize: 'var(--spacing-44)', fontSize: 'var(--typography-font-size-16)' }}>Pick Sat</button>
      </Frame>
    );
  },
  play: async ({ canvasElement }) => {
    const slider = canvasElement.querySelector('[role="slider"]') as HTMLElement;
    await expect(slider).toHaveAttribute('aria-valuenow', '1');
    (canvasElement.querySelector('[data-testid="jump"]') as HTMLButtonElement).click();
    await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '5'));
  },
};

/** The change is against the previous point, or against a number you give (a target). */
export const AgainstReference: Story = {
  args: { points: [{ label: 'Mon', value: 40 }, { label: 'Tue', value: 54 }, { label: 'Wed', value: 54 }], defaultSelectedIndex: 1, onSelectedIndexChange: fn() },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-testid="line-chart-callout"]')).toHaveTextContent('+35%');
  },
};

export const AgainstTarget: Story = {
  args: { reference: 70, defaultSelectedIndex: 6 },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-testid="line-chart-callout"]')).toHaveTextContent('+11%');
    await expect(live(canvasElement)).toHaveTextContent('up 11% on the reference of 70%');
  },
};

/** The same data as a table: always there for screen readers, shown when asked. */
export const TableFallback: Story = {
  args: { showViewToggle: true },
  play: async ({ canvasElement }) => {
    const hidden = canvasElement.querySelector('table[data-bella-chart-table]') as HTMLElement;
    await expect(hidden.querySelectorAll('tbody tr')).toHaveLength(7);
    await userEvent.click(canvasElement.querySelector('button') as HTMLButtonElement);
    await waitFor(() => expect(canvasElement.querySelector('[data-bella-component="line-chart"]')!.querySelectorAll('table').length).toBeGreaterThan(1));
  },
};

export const NotEnoughData: Story = {
  args: { points: [{ label: 'Mon', value: 3 }], defaultSelectedIndex: null },
  play: async ({ canvasElement }) => {
    await expect(canvasElement).toHaveTextContent('Not enough data to draw a trend');
    await expect(canvasElement.querySelector('[role="slider"]')).toBeNull();
  },
};

/** draw: the line draws left to right, the area fades in (map 900ms, pick 250ms). */
export const DrawIn: Story = {
  args: { draw: 'map' },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-bella-component="line-chart"]') as HTMLElement;
    await expect(root).toHaveAttribute('data-draw', 'map');
    const line = root.querySelector('path[class*="line"]') as SVGElement;
    /* the snapshot harness mocks reduced motion on data-bella-reveal pages, so accept the still rule too */
    await expect(['0.9s', '0s'].includes(getComputedStyle(line).animationDuration)).toBe(true);
  },
};

export const DrawPick: Story = {
  args: { draw: 'pick' },
  play: async ({ canvasElement }) => {
    const line = canvasElement.querySelector('path[class*="line"]') as SVGElement;
    await expect(['0.25s', '0s'].includes(getComputedStyle(line).animationDuration)).toBe(true);
  },
};

/** Reduced motion: static, fully drawn; the scrubber and pill still work. */
export const ReducedMotion: Story = {
  beforeEach: reduceMotion,
  args: { draw: 'map' },
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('[data-bella-component="line-chart"]') as HTMLElement;
    await expect(root).toHaveAttribute('data-motion', 'still');
    await expect(root).not.toHaveAttribute('data-draw');
    await expect(getComputedStyle(root.querySelector('path[class*="line"]')!).animationName).toBe('none');
    await expect(root.getAnimations({ subtree: true })).toHaveLength(0);
    await expect(root.querySelector('[data-testid="line-chart-callout"]')).not.toBeNull();
  },
};
