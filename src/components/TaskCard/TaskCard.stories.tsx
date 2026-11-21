import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Button from '../Button/Button';
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
    line: 'main · 10:19',
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
      <TaskCard title="Figma check" line="main · 10:19" status="Failed" statusTone="danger" href="#a" onMoveTo={() => {}} />
      <TaskCard title="Figma check" line="main · 10:19" status="Failed" statusTone="danger" href="#b" onMoveTo={() => {}} dragging />
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
          <TaskCard title="Figma check" line="main · 10:19" status="Failed" statusTone="danger" href={`#t${i}`} onMoveTo={() => {}} dragging={dragging} />
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
      <TaskCard title="Figma check" line="main · 10:19" status="Failed" statusTone="danger" href="#task" onMoveTo={() => {}} />
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

function LiftDemo() {
  const [dragging, setDragging] = React.useState(false);
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-24)', justifyItems: 'start', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      <TaskCard title="Figma check" line="main · 10:19" status="Failed" statusTone="danger" dragging={dragging} style={{ inlineSize: 'calc(var(--spacing-80) * 3)' }} />
      <Button variant="secondary" size="sm" onClick={() => setDragging((d) => !d)}>
        {dragging ? 'Drop it' : 'Pick it up'}
      </Button>
    </div>
  );
}

/** Lifts when picked up (rule "Motion that shows what happened", item 2): the shadow deepens and the
 * card grows a step on the motion tokens, and settles back when dropped. Reduced motion: the lifted
 * look at once. */
export const Lift: Story = {
  render: () => <LiftDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const card = () => canvasElement.querySelector('[data-bella-component="task-card"]') as HTMLElement;
    await step('at rest: no lift', async () => {
      await expect(card()).toHaveAttribute('data-state', 'default');
      await expect(getComputedStyle(card()).scale).toMatch(/^(none|1)$/);
    });
    await step('picked up: it lifts, on the motion token', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Pick it up' }));
      await expect(card()).toHaveAttribute('data-state', 'dragging');
      await waitFor(() => expect(getComputedStyle(card()).scale).toBe('1.02'));
      await expect(parseFloat(getComputedStyle(card()).transitionDuration)).toBe(reduced ? 0 : 0.2);
    });
    await step('dropped: it settles', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Drop it' }));
      await expect(card()).toHaveAttribute('data-state', 'default');
    });
  },
};

function AcceptUndoDemo() {
  const [phase, setPhase] = React.useState<'here' | 'leaving' | 'gone' | 'back'>('here');
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', justifyItems: 'start', alignContent: 'start', padding: 'var(--spacing-24)', background: 'var(--color-background-default)', minBlockSize: 'calc(var(--spacing-80) * 3)' }}>
      {phase !== 'gone' ? (
        <TaskCard
          title="Figma check"
          line="main · 10:19"
          status="Ready"
          statusTone="success"
          entering={phase === 'back'}
          leaving={phase === 'leaving'}
          onLeft={() => setPhase('gone')}
          style={{ inlineSize: 'calc(var(--spacing-80) * 3)' }}
        />
      ) : null}
      {phase === 'gone' ? (
        <Button variant="secondary" size="sm" onClick={() => setPhase('back')}>
          Undo
        </Button>
      ) : (
        <Button variant="primary" size="sm" onClick={() => setPhase('leaving')}>
          Accept
        </Button>
      )}
    </div>
  );
}

/** Accept and Undo (rule "Motion that shows what happened", items 4 and 6): Accept slides the card
 * out to the right and it is removed when it has left; Undo brings it back with the pop-in a new card
 * uses. Reduced motion: it goes and comes back at once. */
export const AcceptAndUndo: Story = {
  render: () => <AcceptUndoDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const card = () => canvasElement.querySelector('[data-bella-component="task-card"]') as HTMLElement | null;
    await step(reduced ? 'Accept: gone at once' : 'Accept: it slides out, then it is gone', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Accept' }));
      if (!reduced && card()) await expect(getComputedStyle(card()!).animationName).toMatch(/taskLeave/);
      await waitFor(() => expect(card()).toBeNull());
    });
    await step(reduced ? 'Undo: back at once' : 'Undo: it pops back in, once', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Undo' }));
      await waitFor(() => expect(card()).not.toBeNull());
      await expect(getComputedStyle(card()!).animationName).toMatch(reduced ? /^none$/ : /taskEnter/);
      if (!reduced) await expect(getComputedStyle(card()!).animationIterationCount).toBe('1');
    });
  },
};

/** Her pick "B · coloured border, no bar" (TaskCard 799:177248) and batch 4 (published 22 Nov): the 2px border
 * in the status tone says the status, the Tag is off by default (`showTag` turns it on), the ↗ stays at the
 * right end, and the two groups sit 16 apart. Screen readers still hear the status words. */
export const BorderSaysStatus: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      <TaskCard title="Figma check" line="main · 10:19" style={{ inlineSize: 'calc(var(--spacing-80) * 3)' }} onOpen={() => {}} onMoveTo={() => {}} />
      <TaskCard title="Contrast pairs" line="main · 10:19" status="Working" statusTone="info" style={{ inlineSize: 'calc(var(--spacing-80) * 3)' }} onOpen={() => {}} onMoveTo={() => {}} />
      <TaskCard title="Figma check" line="main · 10:19" status="Waiting on you" statusTone="attention" style={{ inlineSize: 'calc(var(--spacing-80) * 3)' }} onOpen={() => {}} onMoveTo={() => {}} />
      <TaskCard title="Figma check" line="main · 10:19" status="Done" statusTone="success" style={{ inlineSize: 'calc(var(--spacing-80) * 3)' }} onOpen={() => {}} onMoveTo={() => {}} />
      <TaskCard title="Figma check" line="main · 10:19" status="Failed" statusTone="danger" showTag style={{ inlineSize: 'calc(var(--spacing-80) * 3)' }} onOpen={() => {}} onMoveTo={() => {}} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const cards = canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="task-card"]');
    await expect(cards[0].querySelector('[data-bella-component="tag"]')).toBeNull();
    await expect(cards[0]).toHaveTextContent('To do');
    await expect(cards[4].querySelector('[data-bella-component="tag"]')).toHaveTextContent('Failed');
    await expect(cards[2]).toHaveAttribute('data-tone', 'attention');
    await expect(getComputedStyle(cards[2]).borderTopWidth).toBe('2px');
    await expect(cards[2].querySelector('[aria-hidden="true"][class*="bar"]')).toBeNull();
    for (const card of [cards[0], cards[4]]) {
      const content = card.firstElementChild as HTMLElement;
      await expect(getComputedStyle(content).rowGap).toBe('16px');
      const row = content.lastElementChild as HTMLElement;
      const arrow = row.lastElementChild as HTMLElement;
      await expect(Math.round(row.getBoundingClientRect().right - arrow.getBoundingClientRect().right)).toBe(0);
    }
  },
};
