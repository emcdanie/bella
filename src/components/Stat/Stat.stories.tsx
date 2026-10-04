import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Stat from './Stat';
import statCssRaw from './Stat.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((statCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const statContract = (componentContract as any).component?.stat?.$extensions?.bella ?? {};

const meta: Meta<typeof Stat> = {
  title: 'Components/Stat',
  component: Stat,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: statContract.a11y },
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    delta: { control: 'text' },
    trend: { control: 'inline-radio', options: [undefined, 'up', 'down'] },
    series: { control: 'object' },
    seriesLabel: { control: 'text' },
    className: { control: false },
  },
  args: { label: 'Components', value: 18, delta: '2 since last sync', trend: 'up' },
};
export default meta;

type Story = StoryObj<typeof Stat>;

/** One figure with a change. */
export const Default: Story = {};

/** A row on the panel surface, the shape CHIP's health view uses. */
export const Row: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(calc(var(--spacing-20) * 2), 1fr))',
        gap: 'var(--spacing-6)',
        maxWidth: 720,
        padding: 'var(--spacing-6)',
        background: 'var(--color-semantic-surface-card)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Stat label="Components" value={18} delta="2 since last sync" trend="up" />
      <Stat label="Failures" value={4} delta="3 fewer" trend="down" />
      <Stat label="Indexed" value="1,240" delta="chunks" />
      <Stat label="Last sync" value="09:12" />
    </div>
  ),
};

/** With history: a sparkline beside the change line. Shape and words carry
 * the trend; the line is ink, never a status colour. One point draws nothing. */
export const Trend: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(calc(var(--spacing-20) * 2.5), 1fr))',
        gap: 'var(--spacing-6)',
        maxWidth: 720,
        padding: 'var(--spacing-6)',
        background: 'var(--color-semantic-surface-card)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <Stat label="Components" value={24} delta="3 since last sync" trend="up" series={[18, 19, 19, 21, 21, 24]} seriesLabel="Components over 6 syncs: 18 to 24" />
      <Stat label="Story coverage" value="92%" delta="no change" series={[92, 92]} />
      <Stat label="Failures" value={2} delta="2 fewer" trend="down" series={[6, 5, 4, 4, 2]} />
      <Stat label="One point" value={7} delta="no history yet" series={[7]} />
    </div>
  ),
};

/** A term-description pair; the trend is spoken, the arrow is hidden. */
export const Behavior: Story = {
  render: () => <Stat label="Failures" value={4} delta="3 fewer" trend="down" />,
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector('[data-bella-component="stat"]') as HTMLElement;

    await step('the label is a dt naming the figure', async () => {
      expect(root.tagName).toBe('DL');
      expect(root.querySelector('dt')?.textContent).toBe('Failures');
      expect(root.querySelectorAll('dd')[0].textContent).toBe('4');
    });

    await step('direction is a hidden arrow plus a spoken word', async () => {
      const delta = root.querySelectorAll('dd')[1];
      expect(delta.querySelector('[aria-hidden="true"]')?.textContent?.trim()).toBe('▼');
      expect(delta.textContent).toContain('Down');
      expect(getComputedStyle(delta).color).toBe(getComputedStyle(root.querySelector('dt')!).color);
    });

    await step('fewer than two points draw no sparkline', async () => {
      expect(root.querySelector('svg')).toBeNull();
    });

    await step('the figure is tabular', async () => {
      const value = root.querySelector('dd') as HTMLElement;
      expect(getComputedStyle(value).fontVariantNumeric).toContain('tabular-nums');
    });
  },
};

/** The sparkline is one spoken sentence, drawn in ink. */
export const TrendBehavior: Story = {
  render: () => <Stat label="Components" value={24} delta="3 since last sync" trend="up" series={[18, 21, 24]} />,
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector('[data-bella-component="stat"]') as HTMLElement;
    const svg = root.querySelector('svg') as SVGSVGElement;

    await step('the drawing is an image with a sentence for a name', async () => {
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'Components: 18 to 24 over 3 points');
    });

    await step('the line is ink, the same colour as the figure', async () => {
      const stroke = getComputedStyle(svg.querySelector('polyline')!).stroke;
      expect(stroke).toBe(getComputedStyle(root.querySelectorAll('dd')[0]).color);
    });

    await step('the change line still speaks the direction', async () => {
      expect(root.querySelectorAll('dd')[1].textContent).toContain('Up');
    });
  },
};
