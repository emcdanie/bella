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

    await step('the figure is tabular', async () => {
      const value = root.querySelector('dd') as HTMLElement;
      expect(getComputedStyle(value).fontVariantNumeric).toContain('tabular-nums');
    });
  },
};
