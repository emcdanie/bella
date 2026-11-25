import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import BrandWordmark from '../components/BrandWordmark/BrandWordmark';
import { GLYPHS, LOCK, type Glyph } from './pattern';

const meta: Meta<typeof BrandWordmark> = {
  title: 'Brand/Wordmark',
  component: BrandWordmark,
  args: { word: 'ELLETA', variant: 'pattern', size: 'full-bleed', seed: 7 },
  argTypes: {
    word: { control: 'inline-radio' },
    variant: { control: 'inline-radio' },
    size: { control: 'inline-radio' },
    onReroll: { control: false },
  },
};
export default meta;
type Story = StoryObj<typeof BrandWordmark>;

/** ELLETA, pattern, full-bleed: fills its container and sits on the baseline. */
export const Elleta: Story = {};

/** BELLA, pattern. */
export const Bella: Story = { args: { word: 'BELLA' } };

/** The ink variant: plain strokes in text-primary. */
export const Ink: Story = { args: { variant: 'ink' } };

/** Nav size: 40px tall, both words, both variants. */
export const NavSize: Story = {
  render: () => (
    <div style={{ display: 'grid', rowGap: 'var(--spacing-24)', justifyItems: 'start' }}>
      <BrandWordmark word="ELLETA" size="nav" />
      <BrandWordmark word="BELLA" size="nav" />
      <BrandWordmark word="ELLETA" size="nav" variant="ink" />
      <BrandWordmark word="BELLA" size="nav" variant="ink" />
    </div>
  ),
};

function RerollDemo() {
  const [seed, setSeed] = useState(7);
  return (
    <BrandWordmark
      word="ELLETA"
      size="full-bleed"
      seed={seed}
      onReroll={() => setSeed((s) => (s * 48271) % 2147483647)}
    />
  );
}

/** Deterministic from `seed`; `onReroll` adds a Reroll control. */
export const Reroll: Story = { render: () => <RerollDemo /> };

const glyphNote: React.CSSProperties = {
  fontFamily: 'var(--typography-font-family-geist-mono)',
  fontSize: 'var(--typography-font-size-16)',
  fontFeatureSettings: 'var(--typography-font-feature-ss09)',
  color: 'var(--color-content-body)',
};

/** The five glyphs on a 100-unit cap height, each with its centre line
 * (the path the stroke follows) drawn in ochre-deep over the stroke. */
export const GlyphSheet: Story = {
  render: () => (
    <div style={{ display: 'grid', rowGap: 'var(--spacing-16)' }}>
      <ul style={{ ...glyphNote, margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-16)' }}>
        <li>weight {LOCK.weight}</li>
        <li>width {LOCK.width}</li>
        <li>height {LOCK.height}</li>
        <li>tracking {LOCK.tracking}</li>
        <li>soft corners</li>
        <li>bars on the low line, 66</li>
      </ul>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--spacing-20)',
          padding: 'var(--spacing-24)',
          background: 'var(--color-background-surface)',
          borderRadius: 'var(--border-radius-card)',
        }}
      >
        {(Object.keys(GLYPHS) as Glyph[]).map((k) => {
          const g = GLYPHS[k];
          return (
            <svg
              key={k}
              viewBox={`-12 -12 ${g.w + 24} 124`}
              role="img"
              aria-label={`Glyph ${k} with its centre line`}
              data-bella-brand
              style={{ height: 'var(--spacing-80)', width: 'auto', color: 'var(--color-content-default)' }}
            >
              <path d={g.d} fill="none" stroke="currentColor" strokeWidth={LOCK.weight} strokeLinejoin="round" />
              <path d={g.d} fill="none" style={{ stroke: 'var(--color-brand-ochre-500)' }} strokeWidth={2} />
              <line x1={-12} x2={g.w + 12} y1={66} y2={66} style={{ stroke: 'var(--color-border-default)' }} strokeWidth={0.5} />
            </svg>
          );
        })}
      </div>
    </div>
  ),
};

export const Behavior: Story = {
  args: { word: 'BELLA' },
  play: async ({ canvas, canvasElement, step }) => {
    await step('a labelled image named by its word', async () => {
      await expect(canvas.getByRole('img', { name: 'BELLA' })).toBeInTheDocument();
    });
    await step('the pattern layers are hidden from assistive tech', async () => {
      await expect(canvasElement.querySelector('svg[role="img"] g[aria-hidden="true"]')).not.toBeNull();
    });
    await step('the same seed draws the same pattern', async () => {
      const a = canvasElement.querySelector('svg[role="img"] g[aria-hidden="true"]')?.innerHTML.length;
      await expect(a).toBeGreaterThan(1000);
    });
  },
};

/** CHIP's logotype: the chip with its C, HIP written by its right wall, a pink signal that runs once and rests as the full stop. Under reduced motion it is the still final frame. */
export const ChipLogotype: Story = {
  args: { word: 'CHIP', variant: 'logotype' },
  render: (args) => (
    <div style={{ padding: 'var(--spacing-80) var(--spacing-48)' }}>
      <BrandWordmark {...args} />
    </div>
  ),
  play: async ({ canvas, canvasElement, step }) => {
    await step('a labelled image named CHIP', async () => {
      await expect(canvas.getByRole('img', { name: 'CHIP' })).toBeInTheDocument();
    });
    await step('the signal run is jumped to its end so the capture is the resting frame', async () => {
      const svg = canvasElement.querySelector('svg[data-bella-logotype]') as SVGSVGElement | null;
      svg?.pauseAnimations?.();
      svg?.setCurrentTime?.(2);
    });
    await step('the pink signal is there, running or at rest, in the brand pink', async () => {
      const dot = canvasElement.querySelector('circle[data-signal]');
      await expect(dot).not.toBeNull();
      await expect(dot?.getAttribute('style')).toContain('--color-background-accent-1');
    });
  },
};
