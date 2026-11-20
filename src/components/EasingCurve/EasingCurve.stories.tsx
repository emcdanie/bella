import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import EasingCurve, { DurationBar, EASING_POINTS } from './EasingCurve';
import cssRaw from './EasingCurve.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof EasingCurve> = {
  title: 'Components/Data/EasingCurve',
  component: EasingCurve,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof EasingCurve>;

const EASINGS = ['standard', 'emphasis', 'out', 'draw', 'pop'] as const;
const DURATIONS: { d: 150 | 200 | 250 | 400 | 450 | 900 | 3400; use?: string }[] = [
  { d: 150, use: 'fast' },
  { d: 200, use: 'hover lift' },
  { d: 250 },
  { d: 400 },
  { d: 450, use: 'pop-in' },
  { d: 900, use: 'line draw' },
  { d: 3400 },
];

/** CHIP Foundations · Motion: durations to scale, then every easing as its curve. */
export const Motion: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      <div style={{ display: 'grid', gap: 'var(--spacing-16)', flex: '1 1 20rem' }}>
        {DURATIONS.map(({ d, use }) => (
          <DurationBar key={d} duration={d} use={use} />
        ))}
      </div>
      <div style={{ display: 'grid', gap: 'var(--spacing-16)', flex: '1 1 20rem', alignContent: 'start' }}>
        {EASINGS.map((e) => (
          <EasingCurve key={e} easing={e} />
        ))}
      </div>
    </div>
  ),
  /* The drawn curves must be the tokens: each copy matches its CSS variable. */
  play: async () => {
    const root = getComputedStyle(document.documentElement);
    for (const e of EASINGS) {
      const nums = (root.getPropertyValue(`--motion-easing-${e}`).match(/-?\d*\.?\d+/g) ?? []).map(Number);
      await expect(nums).toEqual(EASING_POINTS[e]);
    }
    for (const { d } of DURATIONS) {
      const v = root.getPropertyValue(`--motion-duration-${d}`).trim();
      await expect(Math.round(parseFloat(v) * (v.endsWith('ms') ? 1 : 1000))).toBe(d);
    }
  },
};
