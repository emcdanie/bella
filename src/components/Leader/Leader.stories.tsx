import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import Leader from './Leader';
import Pin from '../Pin/Pin';
import Button from '../Button/Button';
import cssRaw from './Leader.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.leader?.$extensions?.bella ?? {};

const meta: Meta<typeof Leader> = {
  title: 'Components/Layout/Leader',
  component: Leader,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    variant: { control: 'inline-radio' },
    end: { control: 'inline-radio' },
    draw: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
  },
  args: { from: '#leader-a', to: '#leader-b', label: 'Pin 3 points to what it explains', variant: 'blue', end: 'arrow' },
};
export default meta;

type Story = StoryObj<typeof Leader>;

/** Measured from one element to the other, in their positioned parent. */
export const SideBySide: Story = {
  render: (args) => (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 'var(--spacing-64)', paddingBlock: 'var(--spacing-32)' }}>
      <span id="leader-a"><Pin number="3" tone={args.variant === "neutral" ? undefined : args.variant} label="Box" /></span>
      <span id="leader-b" style={{ marginTop: 'var(--spacing-48)', color: 'var(--color-content-default)' }}>What it explains</span>
      <Leader {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('[data-bella-component="leader"]');
    await waitFor(() => expect(svg?.querySelector('path')?.getAttribute('d')).toMatch(/^M/));
  },
};

/** The dot landing, for a line that ends on a part. */
export const DotEnd: Story = {
  ...SideBySide,
  args: { end: 'dot', variant: 'red' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('[data-bella-component="leader"] circle')).toBeTruthy());
  },
};

/** draw: the line is revealed start to end once, at 900ms (map) or 250ms (pick); a resize redraw does not replay it. */
export const DrawIn: Story = {
  ...SideBySide,
  args: { draw: 'map' },
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('[data-bella-component="leader"]') as SVGElement;
    await waitFor(() => expect(svg).toHaveAttribute('data-draw', 'map'));
    await expect(svg).toHaveAttribute('data-heading', 'right');
    /* the snapshot harness mocks reduced motion on data-bella-reveal pages, so accept the still rule too */
    await expect(['0.9s', '0s'].includes(getComputedStyle(svg).animationDuration)).toBe(true);
    /* a resize redraw rebuilds the path but leaves the animation alone */
    await waitFor(() => expect(svg.getAnimations().every((a) => a.startTime !== null)).toBe(true));
    const first = svg.getAnimations().map((a) => a.startTime);
    window.dispatchEvent(new Event('resize'));
    await new Promise((r) => setTimeout(r, 100));
    await expect(svg.getAnimations().map((a) => a.startTime)).toEqual(first);
  },
};

const PickFrame = (args: React.ComponentProps<typeof Leader>) => {
  const [to, setTo] = useState('#leader-b');
  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 'var(--spacing-64)', paddingBlock: 'var(--spacing-32)' }}>
      <span id="leader-a"><Pin number="3" label="Box" /></span>
      <span id="leader-b" style={{ marginTop: 'var(--spacing-48)' }}>What it explains</span>
      <span id="leader-c" style={{ marginTop: 'var(--spacing-8)' }}>Another part</span>
      <span data-testid="repick" onClick={() => setTo('#leader-c')}><Button variant="secondary">Pick another part</Button></span>
      <Leader {...args} to={to} draw="pick" />
    </div>
  );
};

/** Pinning another part draws the line again at 250ms. */
export const DrawsAgainOnPick: Story = {
  render: (args) => <PickFrame {...args} />,
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('[data-bella-component="leader"]') as SVGElement;
    await waitFor(() => expect(svg).toHaveAttribute('data-draw', 'pick'));
    const before = svg.getAttribute('d');
    (canvasElement.querySelector('[data-testid="repick"] button') as HTMLButtonElement).click();
    await waitFor(() => expect(svg.querySelector('path')?.getAttribute('d')).not.toBe(before));
    await expect(svg).toHaveAttribute('data-draw', 'pick');
    await expect(['0.25s', '0s'].includes(getComputedStyle(svg).animationDuration)).toBe(true);
  },
};

/* prefers-reduced-motion mocked for a story, as MapLine and BarChart do. */
const ReducedFrame = ({ children }: { children: React.ReactNode }) => {
  const original = React.useRef<typeof window.matchMedia | null>(null);
  if (original.current === null) {
    original.current = window.matchMedia;
    const real = original.current.bind(window);
    window.matchMedia = ((q: string) =>
      q.includes('prefers-reduced-motion') ? ({ ...real(q), matches: true, addEventListener() {}, removeEventListener() {} } as MediaQueryList) : real(q)) as typeof window.matchMedia;
  }
  React.useEffect(
    () => () => {
      if (original.current) window.matchMedia = original.current;
    },
    []
  );
  return <>{children}</>;
};

/** Reduced motion: drawn at once, no reveal. */
export const ReducedMotion: Story = {
  render: (args) => (
    <ReducedFrame>
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 'var(--spacing-64)', paddingBlock: 'var(--spacing-32)' }}>
        <span id="leader-a"><Pin number="3" label="Box" /></span>
        <span id="leader-b" style={{ marginTop: 'var(--spacing-48)' }}>What it explains</span>
        <Leader {...args} draw="map" />
      </div>
    </ReducedFrame>
  ),
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('[data-bella-component="leader"]') as SVGElement;
    await waitFor(() => expect(svg.querySelector('path')?.getAttribute('d')).toMatch(/^M/));
    await expect(svg).toHaveAttribute('data-motion', 'still');
    await expect(svg).not.toHaveAttribute('data-draw');
    await expect(getComputedStyle(svg).animationName).toBe('none');
    await expect(svg.getAnimations()).toHaveLength(0);
  },
};
