import React, { useEffect, useRef } from 'react';
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
    weight: { control: 'inline-radio' },
    draw: { control: 'inline-radio' },
    travel: { control: 'boolean' },
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

/** weight="thin" (curve only): 1px in a lighter tone, for the lines of steps that are not picked. */
export const ThinWeight: Story = {
  render: () => (
    <Themed>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-24)' }}>
        <Cell label="curve · regular"><MapLine direction="curve" /></Cell>
        <Cell label="curve · thin"><MapLine direction="curve" weight="thin" /></Cell>
      </div>
    </Themed>
  ),
  play: async ({ canvasElement }) => {
    const [regular, thin] = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="map-line"]'));
    await expect(getComputedStyle(regular.querySelector('path')!).strokeWidth).toBe('2px');
    await expect(getComputedStyle(thin.querySelector('path')!).strokeWidth).toBe('1px');
    await expect(getComputedStyle(thin).color).not.toBe(getComputedStyle(regular).color);
  },
};

/* prefers-reduced-motion mocked for a story, as BarChart does. */
const ReducedFrame = ({ children }: { children: React.ReactNode }) => {
  const original = useRef<typeof window.matchMedia | null>(null);
  if (original.current === null) {
    original.current = window.matchMedia;
    const real = original.current.bind(window);
    window.matchMedia = ((q: string) =>
      q.includes('prefers-reduced-motion') ? ({ ...real(q), matches: true, addEventListener() {}, removeEventListener() {} } as MediaQueryList) : real(q)) as typeof window.matchMedia;
  }
  useEffect(
    () => () => {
      if (original.current) window.matchMedia = original.current;
    },
    []
  );
  return <>{children}</>;
};

const motionOf = (el: Element) => el.getAnimations().map((a) => (a as CSSAnimation).animationName);

/** draw="map": the first draw of a map runs 900ms along the line, ease-out; draw="pick" runs 250ms. */
export const DrawIn: Story = {
  render: () => (
    <Themed>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-24)' }}>
        <Cell label="draw · map"><MapLine direction="curve" tone="selected" draw="map" /></Cell>
        <Cell label="draw · pick"><MapLine direction="curve" tone="selected" draw="pick" /></Cell>
      </div>
    </Themed>
  ),
  play: async ({ canvasElement }) => {
    const [map, pick] = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="map-line"]'));
    await expect(map).toHaveAttribute('data-draw', 'map');
    await expect(pick).toHaveAttribute('data-draw', 'pick');
    /* the snapshot harness mocks reduced motion for data-bella-reveal pages, so read the rule itself */
    await expect(getComputedStyle(map).animationDuration === '0.9s' || getComputedStyle(map).animationName === 'none').toBe(true);
    await expect(getComputedStyle(pick).animationDuration === '0.25s' || getComputedStyle(pick).animationName === 'none').toBe(true);
  },
};

/** travel: a soft highlight runs the line once in its direction, then rests; it is in the page only while travel is on. */
export const Travel: Story = {
  render: () => (
    <Themed>
      <Cell label="travel · picked step's line"><MapLine direction="curve" tone="selected" draw="pick" travel /></Cell>
    </Themed>
  ),
  play: async ({ canvasElement }) => {
    const line = canvasElement.querySelector('[data-bella-component="map-line"]') as HTMLElement;
    const glint = line.querySelector('[data-glint]') as SVGElement;
    await expect(glint).not.toBeNull();
    await expect(getComputedStyle(glint).animationIterationCount === '1' || getComputedStyle(glint).animationName === 'none').toBe(true);
    await expect(line).toHaveAttribute('aria-hidden', 'true');
  },
};

/** Reduced motion: fully drawn, no draw-in and no travelling highlight. */
export const ReducedMotion: Story = {
  render: () => (
    <ReducedFrame>
      <Themed>
        <Cell label="reduced · draw and travel asked for"><MapLine direction="curve" tone="selected" draw="map" travel /></Cell>
      </Themed>
    </ReducedFrame>
  ),
  play: async ({ canvasElement }) => {
    const line = canvasElement.querySelector('[data-bella-component="map-line"]') as HTMLElement;
    await expect(line).toHaveAttribute('data-motion', 'still');
    await expect(line).not.toHaveAttribute('data-draw');
    await expect(line.querySelector('[data-glint]')).toBeNull();
    await expect(getComputedStyle(line).animationName).toBe('none');
    await expect(motionOf(line)).toHaveLength(0);
    await expect(getComputedStyle(line.querySelector('path')!).strokeWidth).toBe('2px');
  },
};
