import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Swatch from './Swatch';
import cssRaw from './Swatch.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof Swatch> = {
  title: 'Components/Data/Swatch',
  component: Swatch,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof Swatch>;

/** The four Figma variants: pair true / false, sm and lg (lg carries Copy). */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12.5rem, 1fr))', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--color-background-default)', alignItems: 'start' }}>
      <Swatch color="var(--color-content-default)" name="text-primary" hex="#1D2030" ratio="AAA 16.1" />
      <Swatch color="var(--color-content-default)" name="text-primary" hex="#1D2030" pair={false} />
      <Swatch color="var(--color-content-default)" name="text-primary" hex="#1D2030" ratio="AAA 16.1" size="lg" onCopy={() => {}} />
      <Swatch color="var(--color-content-default)" name="text-primary" hex="#1D2030" pair={false} size="lg" onCopy={() => {}} />
    </div>
  ),
};

/** CHIP Foundations pairs: swatches 156 wide (calc of the 12 step) keep hex and ratio on one line. */
export const Narrow: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--color-background-default)', alignItems: 'start' }}>
      {[
        ['text-primary', 'var(--color-content-default)', '#1D2030', '16.1:1'],
        ['text-subtle', 'var(--color-content-subtle)', '#4A4F63', '8.2:1'],
        ['action', 'var(--color-background-brand)', '#63B4E8', '10.9:1'],
      ].map(([name, color, hex, ratio]) => (
        <Swatch key={name} style={{ inlineSize: 'calc(var(--spacing-12) * 13)' }} color={color} name={name} hex={hex} ratio={ratio} />
      ))}
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    await step('every meta row is one 24 line at 156 wide', async () => {
      const swatches = canvasElement.querySelectorAll('[data-bella-component="swatch"]');
      await expect(swatches.length).toBe(3);
      for (const sw of swatches) {
        await expect(Math.round(sw.getBoundingClientRect().width)).toBe(156);
        const meta = sw.querySelector('[class*="meta"]') as HTMLElement;
        await expect(Math.round(meta.getBoundingClientRect().height)).toBe(24);
      }
    });
  },
};
