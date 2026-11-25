import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import EmptyState from './EmptyState';
import Button from '../Button/Button';
import cssRaw from './EmptyState.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';
import reduceMotion from '../shared/reduceMotion';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['empty-state']?.$extensions?.bella ?? {};

/* The theme toolbar picks the theme (audit:visual shoots all four). */
const Surface = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-default)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
      gap: 'var(--spacing-24)',
      alignItems: 'start',
    }}
  >
    {children}
  </div>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div style={{ background: 'var(--color-background-surface)', borderRadius: 'var(--border-radius-card)', overflow: 'hidden' }}>{children}</div>
);

const meta: Meta<typeof EmptyState> = {
  title: 'Components/Layout/EmptyState',
  component: EmptyState,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    size: { control: 'inline-radio' },
    title: { control: 'text' },
    line: { control: 'text' },
    mark: { control: 'text' },
    showMark: { control: 'boolean' },
    actions: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: { size: 'lane', title: 'Nothing here yet', line: 'Say what fills this space.', mark: '🤷' },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Playground: Story = {
  render: (args) => (
    <Surface>
      <Card>
        <EmptyState {...args} />
      </Card>
    </Surface>
  ),
};

/** The lane size (Figma size=lane): centred, the emoji alone, two small actions, primary last. */
export const Lane: Story = {
  render: () => (
    <Surface>
      <Card>
        <EmptyState
          mark="🔁"
          title="Nothing counted yet"
          line="Not a single run this week. Start one and I'll keep score."
          actions={
            <>
              <Button variant="secondary" size="sm">Learn more</Button>
              <Button variant="primary" size="sm">Start a run</Button>
            </>
          }
        />
      </Card>
    </Surface>
  ),
  play: async ({ canvasElement, step }) => {
    await step('lane emoji 48 in a 48 mark; 16 between mark, words and actions; title to line 4 (22 Nov)', async () => {
      const root = canvasElement.querySelector('[data-bella-component="empty-state"]') as HTMLElement;
      const mark = root.querySelector('[aria-hidden="true"]') as HTMLElement;
      await expect(getComputedStyle(mark.firstElementChild as HTMLElement).fontSize).toBe('48px');
      await expect(mark.getBoundingClientRect().height).toBe(48);
      const title = root.querySelector('p') as HTMLElement;
      const line = title.nextElementSibling as HTMLElement;
      await expect(Math.round(title.getBoundingClientRect().top - mark.getBoundingClientRect().bottom)).toBe(16);
      await expect(Math.round(line.getBoundingClientRect().top - title.getBoundingClientRect().bottom)).toBe(4);
    });
  },
};

/** The page size as published (Figma size=page): centred, mark on top, one primary action, at least 300 tall. */
export const Page: Story = {
  render: () => (
    <Surface>
      <Card>
        <EmptyState
          size="page"
          mark="🤷"
          title="Nothing here yet"
          line="Say what fills this space."
          actions={<Button variant="primary">Primary action</Button>}
        />
      </Card>
    </Surface>
  ),
  play: async ({ canvasElement, step }) => {
    await step('page: centred on both axes, no circle behind the emoji (21 Nov publish)', async () => {
      const root = canvasElement.querySelector('[data-bella-component="empty-state"]') as HTMLElement;
      await expect(getComputedStyle(root).textAlign).toBe('center');
      await expect(getComputedStyle(root).alignItems).toBe('center');
      const mark = root.querySelector('[aria-hidden="true"]') as HTMLElement;
      await expect(getComputedStyle(mark).backgroundColor).toBe('rgba(0, 0, 0, 0)');
      await expect(getComputedStyle(mark).boxShadow).toBe('none');
    });
    await step('page emoji 64 on a 64 line in a 64 mark; 16 between mark, words and action; title to line 4 (22 Nov, "B · 64")', async () => {
      const root = canvasElement.querySelector('[data-bella-component="empty-state"]') as HTMLElement;
      const mark = root.querySelector('[aria-hidden="true"]') as HTMLElement;
      const emoji = mark.firstElementChild as HTMLElement;
      await expect(getComputedStyle(emoji).fontSize).toBe('64px');
      await expect(mark.getBoundingClientRect().height).toBe(64);
      const title = root.querySelector('p') as HTMLElement;
      const line = title.nextElementSibling as HTMLElement;
      await expect(Math.round(title.getBoundingClientRect().top - mark.getBoundingClientRect().bottom)).toBe(16);
      await expect(Math.round(line.getBoundingClientRect().top - title.getBoundingClientRect().bottom)).toBe(4);
      const btn = root.querySelector('button') as HTMLElement;
      await expect(Math.round(btn.getBoundingClientRect().top - line.getBoundingClientRect().bottom)).toBe(16);
    });
  }
};

/** Behavior: the mark is decorative (hidden), the title and line are read in order. */
export const Behavior: Story = {
  render: () => <EmptyState mark="🤷" title="Nothing here yet" line="Say what fills this space." />,
  play: async ({ canvasElement, canvas }) => {
    expect(canvas.getByText('Nothing here yet')).toBeInTheDocument();
    const mark = canvasElement.querySelector('[aria-hidden="true"]');
    expect(mark?.textContent).toBe('🤷');
  },
};

/** The small animation (rules/empty-states-and-history.md): the emoji pops up, overshoots a step and
 * settles, once, on motion/duration/900 and motion/easing/pop; then it holds still. Reduced motion:
 * it is simply there. No Replay. */
export const Arrives: Story = {
  render: () => <EmptyState mark="👀" title="Pick a part" line="Go on, pick one. They don't bite." />,
  play: async ({ canvasElement, step }) => {
    const emoji = canvasElement.querySelector('[data-bella-component="empty-state"] [aria-hidden="true"] > span') as HTMLElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await step(reduced ? 'reduced motion: no movement, the end state' : 'plays once on the motion tokens', async () => {
      const cs = getComputedStyle(emoji);
      if (reduced) {
        await expect(cs.animationName).toBe('none');
      } else {
        await expect(cs.animationName).toMatch(/emptyRise/);
        await expect(cs.animationIterationCount).toBe('1');
      }
    });
    await step('then holds still at its place', async () => {
      await Promise.all(emoji.getAnimations().map((a) => a.finished));
      await expect(['none', 'matrix(1, 0, 0, 1, 0, 0)']).toContain(getComputedStyle(emoji).transform);
      await expect(Number(getComputedStyle(emoji).opacity)).toBe(1);
    });
  },
};

/* Stand-ins for the animated WebP and its still (the real marks are passed in by the product). */
const svg = (fill: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="10" y="8" width="44" height="48" rx="8" fill="${fill}"/><path d="M20 24h24M20 34h24M20 44h14" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`)}`;
const ANIMATED = svg('#e5a33a');
const STILL = svg('#6b7a90');

/** markSrc: an animated image in the mark's own box, no circle or fill, decorative unless markLabel says something. */
export const AnimatedMark: Story = {
  args: { title: 'Nothing here yet', line: 'Say what fills this space.', markSrc: ANIMATED, markStill: STILL, mark: '🤷' },
  play: async ({ canvasElement }) => {
    const mark = canvasElement.querySelector('[data-mark="image"]') as HTMLElement;
    const img = mark.querySelector('img') as HTMLImageElement;
    await expect(img.getAttribute('src')).toBe(ANIMATED);
    await expect(img.alt).toBe('');
    await expect(mark).toHaveAttribute('aria-hidden', 'true');
    await expect(mark.getBoundingClientRect().width).toBe(48);
    await expect(getComputedStyle(mark).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  },
};

/** On a page the image takes the 64 box. */
export const AnimatedMarkPage: Story = {
  args: { size: 'page', title: 'Nothing here yet', line: 'Say what fills this space.', markSrc: ANIMATED, markStill: STILL },
  play: async ({ canvasElement }) => {
    await expect((canvasElement.querySelector('[data-mark="image"]') as HTMLElement).getBoundingClientRect().width).toBe(64);
  },
};

/** markLabel: when the picture says something the words don't, it has a name. */
export const LabelledMark: Story = {
  args: { title: 'No runs yet', markSrc: ANIMATED, markStill: STILL, markLabel: 'A note, waiting' },
  play: async ({ canvasElement }) => {
    const mark = canvasElement.querySelector('[data-mark="image"]') as HTMLElement;
    await expect(mark).not.toHaveAttribute('aria-hidden');
    await expect((mark.querySelector('img') as HTMLImageElement).alt).toBe('A note, waiting');
  },
};

/** Reduced motion: the still is shown, never the animation. */
export const AnimatedMarkReducedMotion: Story = {
  beforeEach: reduceMotion,
  args: { title: 'Nothing here yet', line: 'Say what fills this space.', markSrc: ANIMATED, markStill: STILL },
  play: async ({ canvasElement }) => {
    const img = canvasElement.querySelector('[data-mark="image"] img') as HTMLImageElement;
    await expect(img.getAttribute('src')).toBe(STILL);
  },
};

/** A mark that fails to load falls back to the emoji. */
export const AnimatedMarkFallback: Story = {
  args: { title: 'Nothing here yet', markSrc: 'data:image/webp;base64,AAAA', mark: '🤷' },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(canvasElement.querySelector('[data-mark="image"]')).toBeNull());
    await expect(canvasElement).toHaveTextContent('🤷');
  },
};
