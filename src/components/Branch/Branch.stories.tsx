import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Branch from './Branch';
import cssRaw from './Branch.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';
import reduceMotion from '../shared/reduceMotion';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['branch']?.$extensions?.bella ?? {};

const Frame = ({ children, h = 160 }: { children: React.ReactNode; h?: number }) => (
  <div style={{ position: 'relative', inlineSize: '20rem', blockSize: h, background: 'var(--color-background-surface)', borderRadius: 'var(--border-radius-12)' }}>{children}</div>
);

const meta: Meta<typeof Branch> = {
  title: 'Components/Data/Branch',
  component: Branch,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens, a11y: contract.a11y } },
  argTypes: {
    hue: { control: 'inline-radio' },
    weight: { control: 'inline-radio' },
    draw: { control: 'inline-radio' },
    travel: { control: 'boolean' },
    from: { control: false },
    to: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: { hue: 'pink', weight: 'regular', draw: 'none', travel: false, from: { x: 16, y: 24 }, to: { x: 300, y: 136 } },
  render: (args) => (
    <Frame>
      <Branch {...args} />
    </Frame>
  ),
};
export default meta;
type Story = StoryObj<typeof Branch>;

export const Playground: Story = {};

/** Five brand colours by name; the colour names a stage only. */
export const Hues: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      {(['pink', 'navy', 'ochre', 'stone', 'blue'] as const).map((hue) => (
        <Frame key={hue} h={72}>
          <Branch hue={hue} from={{ x: 16, y: 12 }} to={{ x: 300, y: 60 }} />
        </Frame>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const colours = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="branch"]')).map((b) => getComputedStyle(b).color);
    await expect(new Set(colours).size).toBe(5);
  },
};

/** regular is 3 wide, thin is 2; both round-capped. */
export const Weights: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      <Frame h={72}><Branch from={{ x: 16, y: 12 }} to={{ x: 300, y: 60 }} /></Frame>
      <Frame h={72}><Branch weight="thin" from={{ x: 16, y: 12 }} to={{ x: 300, y: 60 }} /></Frame>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [a, b] = Array.from(canvasElement.querySelectorAll('path')).map((p) => getComputedStyle(p));
    await expect(a.strokeWidth).toBe('3px');
    await expect(b.strokeWidth).toBe('2px');
    await expect(a.strokeLinecap).toBe('round');
  },
};

/** It runs up, or leftwards, when the end is above or left of the start. */
export const Flips: Story = {
  render: () => (
    <Frame>
      <Branch hue="navy" from={{ x: 16, y: 136 }} to={{ x: 150, y: 24 }} />
      <Branch hue="ochre" from={{ x: 300, y: 24 }} to={{ x: 160, y: 136 }} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const [up, left] = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="branch"]'));
    await expect(up).toHaveAttribute('data-flip-y');
    await expect(up).not.toHaveAttribute('data-flip-x');
    await expect(left).toHaveAttribute('data-flip-x');
    await expect(left).toHaveAttribute('data-heading', 'left');
    await expect(up).toHaveAttribute('aria-hidden', 'true');
  },
};

/** draw: map is 900ms and pick 250ms, start to end, ease-out. */
export const DrawIn: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
      <Frame h={72}><Branch draw="map" from={{ x: 16, y: 12 }} to={{ x: 300, y: 60 }} /></Frame>
      <Frame h={72}><Branch draw="pick" from={{ x: 16, y: 12 }} to={{ x: 300, y: 60 }} /></Frame>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const [map, pick] = Array.from(canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="branch"]'));
    await expect(map).toHaveAttribute('data-draw', 'map');
    await expect(pick).toHaveAttribute('data-draw', 'pick');
    /* the snapshot harness mocks reduced motion on data-bella-reveal pages, so accept the still rule too */
    await expect(['0.9s', '0s'].includes(getComputedStyle(map).animationDuration)).toBe(true);
    await expect(['0.25s', '0s'].includes(getComputedStyle(pick).animationDuration)).toBe(true);
  },
};

/** travel: one soft highlight along the branch, then it rests. */
export const Travel: Story = {
  render: () => (
    <Frame>
      <Branch draw="pick" travel from={{ x: 16, y: 24 }} to={{ x: 300, y: 136 }} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const glint = canvasElement.querySelector('[class*="glint"]') as SVGElement;
    await expect(glint).not.toBeNull();
    await expect(['1', 'none'].includes(getComputedStyle(glint).animationIterationCount) || getComputedStyle(glint).animationName === 'none').toBe(true);
  },
};

/** Reduced motion: fully drawn, nothing travels. */
export const ReducedMotion: Story = {
  beforeEach: reduceMotion,
  render: () => (
    <Frame>
      <Branch draw="map" travel from={{ x: 16, y: 24 }} to={{ x: 300, y: 136 }} />
    </Frame>
  ),
  play: async ({ canvasElement }) => {
    const b = canvasElement.querySelector('[data-bella-component="branch"]') as HTMLElement;
    await expect(b).toHaveAttribute('data-motion', 'still');
    await expect(b).not.toHaveAttribute('data-draw');
    await expect(canvasElement.querySelector('[class*="glint"]')).toBeNull();
    await expect(getComputedStyle(b).animationName).toBe('none');
    await expect(b.getAnimations()).toHaveLength(0);
  },
};
