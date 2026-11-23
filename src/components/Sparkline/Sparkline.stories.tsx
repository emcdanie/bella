import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Sparkline, { sparkSummary } from './Sparkline';
import cssRaw from './Sparkline.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.sparkline?.$extensions?.bella ?? {};

const SERIES = [79, 79, 81, 90, 93];
const NAMES = ['21 Nov', '21 Nov', '22 Nov', '23 Nov', '23 Nov'];

const meta: Meta<typeof Sparkline> = {
  title: 'Components/Data/Sparkline',
  component: Sparkline,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  args: {
    series: SERIES,
    names: NAMES,
    label: 'Drift: 79 to 93 over 5 points',
    summary: sparkSummary('Drift', SERIES, NAMES),
    table: true,
    caption: 'Drift',
  },
  render: (args) => (
    <div style={{ padding: 'var(--spacing-24)' }}>
      <Sparkline {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof Sparkline>;

export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg[role="img"]') as SVGElement;
    await expect(svg.getAttribute('data-bella-component')).toBe('sparkline');
    await expect(canvasElement.querySelectorAll('table[data-bella-chart-table] tbody tr').length).toBe(5);
    await expect(canvasElement.textContent).toContain('up 14 from 79 to 93');
  },
};

/** A level series and a falling one: the line zooms to its own low and high; numbers are in the summary and the table. */
export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)' }}>
      <Sparkline series={[5, 5, 5]} label="Level" summary={sparkSummary('Level', [5, 5, 5])} table caption="Level" />
      <Sparkline series={[24, 20, 20]} label="Falling" summary={sparkSummary('Falling', [24, 20, 20])} table caption="Falling" />
    </div>
  ),
};

/** The mini bar sparkline: one bar per point from zero, the latest in ink; same scrubber, summary and table (23 Nov). */
export const Bars: Story = {
  args: { form: 'bars' },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelectorAll('svg[role="img"] rect').length).toBe(5);
    await expect(canvasElement.querySelectorAll('svg[role="img"] rect[data-latest]').length).toBe(1);
    await expect(canvasElement.querySelector('svg[role="img"] polyline')).toBeNull();
  },
};
