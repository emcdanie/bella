import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import EmptyState from './EmptyState';
import Button from '../Button/Button';
import cssRaw from './EmptyState.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

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
    wash: { control: 'inline-radio' },
    title: { control: 'text' },
    line: { control: 'text' },
    mark: { control: 'text' },
    showMark: { control: 'boolean' },
    actions: { control: false },
    className: { control: false },
    style: { control: false },
  },
  args: { size: 'lane', wash: 'none', title: 'Nothing here yet', line: 'Say what fills this space.', mark: '🤷' },
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

/** The lane size in every wash, with and without actions (Figma 1014:2670). */
export const LaneWashes: Story = {
  render: () => (
    <Surface>
      {(['none', 'pink', 'blue', 'ochre', 'navy'] as const).map((wash) => (
        <Card key={wash}>
          <EmptyState
            wash={wash}
            mark="🔁"
            title="Nothing counted yet"
            line="Not a single run this week. Start one and I'll keep score."
            actions={
              wash === 'none' ? (
                <>
                  <Button variant="secondary" size="sm">Learn more</Button>
                  <Button variant="primary" size="sm">Start a run</Button>
                </>
              ) : undefined
            }
          />
        </Card>
      ))}
    </Surface>
  ),
};

/** The page size as published (Figma size=page, Wash=blue): left edge, mark on top, one primary action pinned to the bottom, at least 300 tall. */
export const Page: Story = {
  render: () => (
    <Surface>
      <Card>
        <EmptyState
          size="page"
          wash="blue"
          mark="🤷"
          title="Nothing here yet"
          line="Say what fills this space."
          actions={<Button variant="primary">Primary action</Button>}
        />
      </Card>
    </Surface>
  ),
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
