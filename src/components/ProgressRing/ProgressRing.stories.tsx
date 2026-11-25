import React, { useEffect, useRef } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import ProgressRing from './ProgressRing';
import cssRaw from './ProgressRing.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['progress-ring']?.$extensions?.bella ?? {};

/* The theme toolbar picks the theme (audit:visual shoots all four). */
const Surface = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-surface)',
      borderRadius: 'var(--border-radius-12)',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--spacing-24)',
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof ProgressRing> = {
  title: 'Components/Data/ProgressRing',
  component: ProgressRing,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    state: { control: 'inline-radio' },
    size: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
  },
  args: { state: 'running', size: 'sm', showCount: true, duration: 2.5 },
  render: (args) => (
    <Surface>
      <ProgressRing {...args} />
    </Surface>
  ),
};
export default meta;

type Story = StoryObj<typeof ProgressRing>;

export const Playground: Story = {};

const STATES = ['running', 'done', 'waiting', 'failed'] as const;

/** The Figma set: four states in sm (20) and md (36). */
export const FigmaSet: Story = {
  render: () => (
    <Surface>
      {(['sm', 'md'] as const).map((size) => (
        <React.Fragment key={size}>
          {STATES.map((state) => (
            <ProgressRing key={`${size}-${state}`} state={state} size={size} duration={0.01} />
          ))}
        </React.Fragment>
      ))}
    </Surface>
  ),
  play: async ({ canvasElement, step }) => {
    const rings = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="progress-ring"]'));
    await step('eight variants, 20 and 36 wide', async () => {
      await expect(rings).toHaveLength(8);
      await expect(rings[0].getBoundingClientRect().width).toBe(20);
      await expect(rings[4].getBoundingClientRect().width).toBe(36);
    });
    await step('every state has its words as the accessible name', async () => {
      await expect(rings.slice(0, 4).map((r) => r.getAttribute('aria-label'))).toEqual(['Running', 'Done', 'Waiting', 'Failed']);
    });
    await step('done and failed are filled circles with a mark, waiting a ring', async () => {
      await expect(rings[1].querySelector('svg')).not.toBeNull();
      await expect(rings[3].querySelector('svg')).not.toBeNull();
      await expect(getComputedStyle(rings[2]).borderTopWidth).toBe('4px');
    });
  },
};

/** Determinate: the arc is value / total and md shows "n/m" in the number face. */
export const Determinate: Story = {
  render: () => (
    <Surface>
      <ProgressRing state="running" size="sm" value={2} total={5} label="Code" />
      <ProgressRing state="running" size="md" value={2} total={5} label="Code" />
      <ProgressRing state="running" size="md" value={2} total={5} showCount={false} label="Code" />
    </Surface>
  ),
  play: async ({ canvasElement, step }) => {
    const bars = Array.from(canvasElement.querySelectorAll<HTMLElement>('[role="progressbar"]'));
    await step('named by label, state and amount; aria-valuenow follows value', async () => {
      await expect(bars[0]).toHaveAttribute('aria-label', 'Code, Running, 2 of 5');
      await expect(bars[0]).toHaveAttribute('aria-valuenow', '2');
      await expect(bars[0]).toHaveAttribute('aria-valuemax', '5');
    });
    await step('arc is 40 percent, md shows the count in Geist Mono 600 with tabular figures', async () => {
      await expect(getComputedStyle(bars[1].querySelector('[class*="arc"]') as HTMLElement).getPropertyValue('--ring-fill').trim()).toBe('40%');
      await expect(bars[1]).toHaveTextContent('2/5');
      const count = bars[1].querySelector('[class*="count"]') as HTMLElement;
      await expect(getComputedStyle(count).fontWeight).toBe('600');
      await expect(getComputedStyle(count).fontVariantNumeric).toContain('tabular-nums');
      await expect(bars[0]).not.toHaveTextContent('2/5');
      await expect(bars[2]).not.toHaveTextContent('2/5');
    });
  },
};

/** Indeterminate turns, then settles to a still half arc after `duration` seconds (rule: motion under 3 s). */
export const SettlesAfterTheCap: Story = {
  args: { state: 'running', size: 'md', duration: 0.3 },
  play: async ({ canvasElement, step }) => {
    const ring = canvasElement.querySelector('[data-bella-component="progress-ring"]') as HTMLElement;
    await step('half an arc, role img', async () => {
      await expect(ring).toHaveAttribute('role', 'img');
      await expect(getComputedStyle(ring.querySelector('[class*="arc"]') as HTMLElement).getPropertyValue('--ring-fill').trim()).toBe('50%');
    });
    await step('after the cap it stops turning and says it is still working', async () => {
      await waitFor(() => expect(ring).toHaveAttribute('data-motion', 'still'), { timeout: 2000 });
      await expect(getComputedStyle(ring.querySelector('[class*="arc"]') as HTMLElement).animationName).toBe('none');
      await expect(ring).toHaveAccessibleDescription('Still working');
    });
  },
};

/** The default cap is under 3 seconds. */
export const DefaultCap: Story = {
  args: { state: 'running', size: 'sm' },
  play: async ({ canvasElement }) => {
    const ring = canvasElement.querySelector('[data-bella-component="progress-ring"]') as HTMLElement;
    await expect(ring).toHaveAttribute('data-motion', 'turning');
    await waitFor(() => expect(ring).toHaveAttribute('data-motion', 'still'), { timeout: 3000 });
  },
};

/** Reduced motion: never turns, a still arc from the start. */
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

export const ReducedMotion: Story = {
  render: () => (
    <ReducedFrame>
      <Surface>
        <ProgressRing state="running" size="md" label="Code" />
      </Surface>
    </ReducedFrame>
  ),
  play: async ({ canvasElement }) => {
    const ring = canvasElement.querySelector('[data-bella-component="progress-ring"]') as HTMLElement;
    await expect(ring).toHaveAttribute('data-motion', 'still');
    await expect(getComputedStyle(ring.querySelector('[class*="arc"]') as HTMLElement).animationName).toBe('none');
  },
};

/** Decorative: the words beside it carry the state. */
export const Decorative: Story = {
  args: { decorative: true },
  play: async ({ canvasElement }) => {
    const ring = canvasElement.querySelector('[data-bella-component="progress-ring"]') as HTMLElement;
    await expect(ring).toHaveAttribute('aria-hidden', 'true');
  },
};
