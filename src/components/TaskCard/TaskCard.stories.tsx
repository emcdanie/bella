import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import TaskCard from './TaskCard';
import cssRaw from './TaskCard.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['task-card']?.$extensions?.bella ?? {};

/** Cards sit in a lane on the board; the lane grey is their ground. */
const Lane = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-lane)',
      borderRadius: 'var(--border-radius-card)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(15rem, 1fr))',
      gap: 'var(--spacing-24)',
      alignItems: 'start',
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof TaskCard> = {
  title: 'Components/Data/TaskCard',
  component: TaskCard,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    statusTone: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
    onOpen: { control: false },
    onMoveTo: { control: false },
    onDragStart: { control: false },
    onDragEnd: { control: false },
  },
  args: {
    title: 'Figma check',
    line: 'No file key in server/.env',
    status: 'Failed',
    statusTone: 'danger',
    href: '#task',
    onMoveTo: () => {},
  },
  render: (args) => (
    <div style={{ maxInlineSize: '15rem' }}>
      <TaskCard {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof TaskCard>;

export const Playground: Story = {};

/** Figma's variants side by side: default, dragging (lifts), with the branch tag. Hover and focus are shown live. */
export const States: Story = {
  render: () => (
    <Lane>
      <TaskCard title="Figma check" line="No file key in server/.env" status="Failed" statusTone="danger" href="#a" onMoveTo={() => {}} />
      <TaskCard title="Figma check" line="No file key in server/.env" status="Failed" statusTone="danger" href="#b" onMoveTo={() => {}} dragging />
      <TaskCard
        title="Hero at 390"
        line="Wraps under the photo"
        branch="feat/hero-390"
        status="Waiting on you"
        statusTone="attention"
        href="#c"
        onMoveTo={() => {}}
      />
      <TaskCard title="Contrast pairs" line="9 to go" status="Working" statusTone="info" href="#d" onMoveTo={() => {}} />
    </Lane>
  ),
};

/** Figma's set, same content and order: default, dragging, hover, focus (hover and focus are live states; the picture script hovers and tabs to them). */
export const FigmaSet: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      {[false, true, false, false].map((dragging, i) => (
        <div key={i} style={{ inlineSize: 'calc(var(--spacing-80) * 2 + var(--spacing-64) + var(--spacing-8))' }}>
          <TaskCard title="Figma check" line="No file key in server/.env" status="Failed" statusTone="danger" href={`#t${i}`} onMoveTo={() => {}} dragging={dragging} />
        </div>
      ))}
    </div>
  ),
};

/** A long title and line wrap; nothing clips. */
export const LongContent: Story = {
  render: () => (
    <Lane>
      <TaskCard
        title="Retire the old StatusPill from every CHIP screen and the docs"
        line="components/StatusPill/StatusPill.module.css still read by 3 pages"
        branch="chip/retire-status-pill-everywhere"
        status="Gate checking"
        statusTone="info"
        href="#long"
        onMoveTo={() => {}}
      />
    </Lane>
  ),
};

/** The whole card opens the task (one link, named by the title); Move to… is its own 44 button. */
export const Behavior: Story = {
  render: () => (
    <div style={{ maxInlineSize: '15rem' }}>
      <TaskCard title="Figma check" line="No file key in server/.env" status="Failed" statusTone="danger" href="#task" onMoveTo={() => {}} />
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('one link, named by the title', async () => {
      const link = canvas.getByRole('link');
      await expect(link).toHaveAccessibleName('Figma check');
    });
    await step('the whole card is the open target', async () => {
      const card = canvas.getByRole('article');
      const target = getComputedStyle(canvas.getByRole('link'), '::after');
      await expect(target.position).toBe('absolute');
      await expect(card.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    });
    await step('Move to… is a named button with a 44 target', async () => {
      const move = canvas.getByRole('button', { name: 'Move to…' });
      const hit = getComputedStyle(move, '::after');
      const r = move.getBoundingClientRect();
      const w = r.width - parseFloat(hit.left) - parseFloat(hit.right);
      const h = r.height - parseFloat(hit.top) - parseFloat(hit.bottom);
      await expect(w).toBeGreaterThanOrEqual(44);
      await expect(h).toBeGreaterThanOrEqual(44);
    });
    await step('keyboard: Tab reaches the link, then Move to…', async () => {
      canvas.getByRole('link').focus();
      await expect(canvas.getByRole('link')).toHaveFocus();
    });
  },
};
