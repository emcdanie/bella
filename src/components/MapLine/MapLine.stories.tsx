import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import MapLine from './MapLine';
import cssRaw from './MapLine.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['map-line']?.$extensions?.bella ?? {};

/* The theme toolbar picks the theme (audit:visual shoots all four). */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-surface)',
      borderRadius: 'var(--border-radius-12)',
      display: 'grid',
      gap: 'var(--spacing-24)',
    }}
  >
    {children}
  </div>
);

const Cell = ({ children, label }: { children: React.ReactNode; label: string }) => (
  <div style={{ display: 'grid', gap: 'var(--spacing-8)', fontFamily: 'var(--typography-subtext-font-family)', color: 'var(--color-content-subtle)' }}>
    <span>{label}</span>
    <div style={{ display: 'flex', minBlockSize: 'var(--spacing-64)', alignItems: 'stretch' }}>{children}</div>
  </div>
);

const meta: Meta<typeof MapLine> = {
  title: 'Components/Data/MapLine',
  component: MapLine,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    direction: { control: 'inline-radio' },
    end: { control: 'inline-radio' },
    variant: { control: 'inline-radio' },
    tone: { control: 'inline-radio' },
    corner: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
  },
  args: { direction: 'horizontal', end: 'arrow', variant: 'solid', tone: 'default', corner: 'none' },
  render: (args) => (
    <div style={{ display: 'flex', inlineSize: '20rem', blockSize: '8rem' }}>
      <MapLine {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof MapLine>;

export const Playground: Story = {};

const ENDS = ['arrow', 'none'] as const;
const STYLES = ['solid', 'dashed'] as const;
const TONES = ['default', 'accent'] as const;
const CORNERS = ['top-left', 'top-right', 'bottom-left', 'bottom-right'] as const;

/** Every straight variant (direction × end × style × tone). */
export const Straight: Story = {
  render: () => (
    <Themed>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))', gap: 'var(--spacing-24)' }}>
        {ENDS.flatMap((end) =>
          STYLES.flatMap((variant) =>
            TONES.map((tone) => (
              <Cell key={`h-${end}-${variant}-${tone}`} label={`h · ${end} · ${variant} · ${tone}`}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <MapLine direction="horizontal" end={end} variant={variant} tone={tone} />
                </div>
              </Cell>
            ))
          )
        )}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-24)', blockSize: '8rem' }}>
        {ENDS.flatMap((end) =>
          STYLES.flatMap((variant) =>
            TONES.map((tone) => <MapLine key={`v-${end}-${variant}-${tone}`} direction="vertical" end={end} variant={variant} tone={tone} />)
          )
        )}
      </div>
    </Themed>
  ),
};

/** The four turns in each style and tone; and a ┌ path joining straight pieces. */
export const Turns: Story = {
  render: () => (
    <Themed>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-24)' }}>
        {STYLES.flatMap((variant) =>
          TONES.flatMap((tone) => CORNERS.map((corner) => <MapLine key={`${variant}-${tone}-${corner}`} direction="turn" corner={corner} variant={variant} tone={tone} />))
        )}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'var(--size-24) 10rem', gridTemplateRows: 'var(--size-24) 4rem' }}>
        <MapLine direction="turn" corner="top-left" />
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <MapLine direction="horizontal" end="none" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <MapLine direction="vertical" end="arrow" />
        </div>
      </div>
    </Themed>
  ),
};

/** Decorative: hidden from assistive tech. */
export const Behavior: Story = {
  play: async ({ canvasElement, step }) => {
    await step('aria-hidden', async () => {
      const el = canvasElement.querySelector('[data-bella-component="map-line"]');
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });
  },
};

/** direction="curve" (22 Nov, Processes): one S-curve that scales with its box, in every tone, solid or dashed, no arrow. */
export const Curves: Story = {
  render: () => (
    <Themed>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(10rem, 1fr))', gap: 'var(--spacing-24)' }}>
        {(['default', 'selected', 'accent', 'danger'] as const).flatMap((tone) =>
          (['solid', 'dashed'] as const).map((variant) => (
            <Cell key={`${tone}-${variant}`} label={`curve · ${variant} · ${tone}`}>
              <MapLine direction="curve" tone={tone} variant={variant} />
            </Cell>
          ))
        )}
      </div>
    </Themed>
  ),
  play: async ({ canvasElement, step }) => {
    const lines = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="map-line"]'));
    await step('eight curves, each one 2 wide round-capped path with no arrow', async () => {
      await expect(lines).toHaveLength(8);
      for (const l of lines) {
        const path = l.querySelector('path') as SVGPathElement;
        await expect(path.getAttribute('d')).toBe('M 0 0 C 0 50, 100 50, 100 100');
        await expect(getComputedStyle(path).strokeWidth).toBe('2px');
        await expect(getComputedStyle(path).strokeLinecap).toBe('round');
        await expect(l.querySelector('[data-bella-icon]')).toBeNull();
      }
    });
    await step('dashed is 6 on and 6 off; the selected tone is the brand colour', async () => {
      await expect(getComputedStyle(lines[1].querySelector('path')!).strokeDasharray).toBe('6px');
      await expect(getComputedStyle(lines[0].querySelector('path')!).strokeDasharray).toBe('none');
      await expect(getComputedStyle(lines[2]).color).not.toBe(getComputedStyle(lines[0]).color);
    });
  },
};

/** from and to place and size the curve between two points of the board and flip it when the next step is to the left. */
export const FollowsTwoPoints: Story = {
  render: () => (
    <div style={{ position: 'relative', inlineSize: '20rem', blockSize: '10rem' }}>
      <MapLine direction="curve" tone="selected" from={{ x: 40, y: 8 }} to={{ x: 200, y: 120 }} />
      <MapLine direction="curve" variant="dashed" from={{ x: 280, y: 8 }} to={{ x: 220, y: 120 }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [a, b] = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="map-line"]'));
    await expect(a.style.left).toBe('40px');
    await expect(a.style.width).toBe('160px');
    await expect(a.style.height).toBe('112px');
    await expect(a).not.toHaveAttribute('data-flip');
    await expect(b.style.left).toBe('220px');
    await expect(b.style.width).toBe('60px');
    await expect(b).toHaveAttribute('data-flip');
  },
};
