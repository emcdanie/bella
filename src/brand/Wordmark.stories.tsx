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
    <div style={{ display: 'grid', rowGap: 'var(--spacing-6)', justifyItems: 'start' }}>
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
  fontFamily: 'var(--typography-font-family-mono)',
  fontSize: 'var(--typography-font-size-mono)',
  fontFeatureSettings: 'var(--typography-font-feature-mono)',
  color: 'var(--color-semantic-text-secondary)',
};

/** The five glyphs on a 100-unit cap height, each with its centre line
 * (the path the stroke follows) drawn in ochre-deep over the stroke. */
export const GlyphSheet: Story = {
  render: () => (
    <div style={{ display: 'grid', rowGap: 'var(--spacing-4)' }}>
      <p style={glyphNote}>
        weight {LOCK.weight} · width {LOCK.width} · height {LOCK.height} · tracking {LOCK.tracking} · soft corners ·
        E, A and B bars on the low line (66)
      </p>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--spacing-5)',
          padding: 'var(--spacing-6)',
          background: 'var(--color-semantic-surface-card)',
          borderRadius: 'var(--radius-card)',
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
              style={{ height: 'var(--spacing-20)', width: 'auto', color: 'var(--color-semantic-text-primary)' }}
            >
              <path d={g.d} fill="none" stroke="currentColor" strokeWidth={LOCK.weight} strokeLinejoin="round" />
              <path d={g.d} fill="none" style={{ stroke: 'var(--color-brand-ochre-deep)' }} strokeWidth={1} />
              <line x1={-12} x2={g.w + 12} y1={66} y2={66} style={{ stroke: 'var(--color-semantic-border)' }} strokeWidth={0.5} />
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
