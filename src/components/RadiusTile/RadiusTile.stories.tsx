import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import RadiusTile from './RadiusTile';
import cssRaw from './RadiusTile.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof RadiusTile> = {
  title: 'Components/Data/RadiusTile',
  component: RadiusTile,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof RadiusTile>;

const RADII = ['0', '4', '8', '12', '16', '20', '24', 'round'] as const;

/** The radius ramp, as on CHIP Foundations · Shape and space: each tile's corner is its token. */
export const Ramp: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      {RADII.map((r) => (
        <RadiusTile key={r} radius={r} />
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByText('radius/round')).toBeInTheDocument();
    const tiles = canvasElement.querySelectorAll('[data-bella-component="radius-tile"] > span:first-child');
    const root = getComputedStyle(document.documentElement);
    RADII.forEach((r, i) => {
      const want = root.getPropertyValue(`--border-radius-${r}`).trim();
      expect(getComputedStyle(tiles[i]).borderTopLeftRadius).toBe(want);
    });
  },
};
