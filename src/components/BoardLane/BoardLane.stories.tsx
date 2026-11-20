import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Button from '../Button/Button';
import BoardLane, { BoardLaneDropSpace } from './BoardLane';
import TaskCard from '../TaskCard/TaskCard';
import cssRaw from './BoardLane.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['board-lane']?.$extensions?.bella ?? {};

/** The board: lanes side by side on the page ground, 24 apart. */
const Board = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-default)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(16.5rem, 1fr))',
      gap: 'var(--spacing-24)',
      alignItems: 'start',
    }}
  >
    {children}
  </div>
);

const card = (title: string, line: string, status: string, tone: 'danger' | 'attention' | 'info' | 'success') => (
  <TaskCard title={title} line={line} status={status} statusTone={tone} href={`#${title}`} onMoveTo={() => {}} />
);

const meta: Meta<typeof BoardLane> = {
  title: 'Components/Data/BoardLane',
  component: BoardLane,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    lane: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
    children: { control: false },
  },
  args: {
    name: 'Needs you',
    order: 'Failures first, then what blocks a push.',
    lane: 'needs-you',
  },
  render: (args) => (
    <div style={{ maxInlineSize: '16.5rem' }}>
      <BoardLane {...args}>{card('Figma check', 'No file key in server/.env', 'Failed', 'danger')}</BoardLane>
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof BoardLane>;

export const Playground: Story = {};

/** The Work board's four lanes, numbered because they are a sequence (guideline 11). Needs you takes the wash and edge. */
export const WorkBoard: Story = {
  render: () => (
    <Board>
      <BoardLane name="Needs you" index="01" lane="needs-you" order="Failures first, then what blocks a push.">
        {card('Figma check', 'No file key in server/.env', 'Failed', 'danger')}
        {card('Hero at 390', 'Wraps under the photo', 'Waiting on you', 'attention')}
      </BoardLane>
      <BoardLane name="Agent" index="02" order="Oldest first.">
        {card('Contrast pairs', '9 to go', 'Working', 'info')}
      </BoardLane>
      <BoardLane name="Gate" index="03" order="In the order they were sent.">
        {card('Button pressed', 'Checks 4 of 5', 'Gate checking', 'info')}
      </BoardLane>
      <BoardLane name="Ready" index="04" order="Ready to push.">
        {card('Tabs count', 'All checks pass', 'Passed', 'success')}
      </BoardLane>
    </Board>
  ),
};

/** Figma "state=drop-target" while a card is dragged: the drop space marks where it lands and where it left. */
export const Dragging: Story = {
  render: () => (
    <Board>
      <BoardLane name="Needs you" lane="needs-you" order="Failures first, then what blocks a push." count={1}>
        <BoardLaneDropSpace kind="origin" />
      </BoardLane>
      <BoardLane name="Agent" order="Oldest first." dropTarget count={0}>
        <BoardLaneDropSpace kind="target" />
      </BoardLane>
    </Board>
  ),
};

/** Figma's set, same content and order: needs-you default and drop-target, other default and drop-target. */
export const FigmaSet: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, calc(var(--spacing-80) * 3 + var(--spacing-24)))', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      {(['needs-you', 'needs-you', 'other', 'other'] as const).map((lane, i) => (
        /* Figma repeats "Needs you"; a page never has two lanes with one name (each is a landmark) */
        <BoardLane key={i} name={['Needs you', 'Needs you · drop target', 'Agent', 'Agent · drop target'][i]} lane={lane} dropTarget={i % 2 === 1} count={4} order="Failures first, then what blocks a push.">
          {card('Figma check', 'No file key in server/.env', 'Failed', 'danger')}
        </BoardLane>
      ))}
    </div>
  ),
};

/** Drop space kinds on their own. */
export const DropSpace: Story = {
  render: () => (
    <Board>
      <BoardLaneDropSpace kind="target" />
      <BoardLaneDropSpace kind="origin" />
    </Board>
  ),
};

/** A list with a heading: the lane is a region named by its Name; the count reads "2 cards". */
export const Behavior: Story = {
  render: () => (
    <div style={{ maxInlineSize: '16.5rem' }}>
      <BoardLane name="Needs you" lane="needs-you" order="Failures first.">
        {card('Figma check', 'No file key', 'Failed', 'danger')}
        {card('Hero at 390', 'Wraps', 'Waiting on you', 'attention')}
      </BoardLane>
    </div>
  ),
  play: async ({ canvas, step }) => {
    await step('a region named by its heading', async () => {
      await expect(canvas.getByRole('region', { name: 'Needs you' })).toBeInTheDocument();
      await expect(canvas.getByRole('heading', { name: 'Needs you' })).toBeInTheDocument();
    });
    await step('the cards are a list', async () => {
      await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    });
    await step('the count says what it counts', async () => {
      await expect(canvas.getByText('cards', { exact: false })).toBeInTheDocument();
    });
  },
};

function OpenCloseDemo() {
  const [phase, setPhase] = React.useState<'idle' | 'over' | 'dropped'>('idle');
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', justifyItems: 'start', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      <BoardLane name="Agent" count={2} order="Failures first, then what blocks a push." style={{ inlineSize: 'calc(var(--spacing-80) * 4)' }}>
        {phase !== 'idle' ? (
          <BoardLaneDropSpace open={phase === 'over'} onClosed={() => setPhase('idle')} />
        ) : null}
        <TaskCard title="Figma check" line="No file key in server/.env" status="Failed" statusTone="danger" />
      </BoardLane>
      <Button variant="secondary" size="sm" onClick={() => setPhase(phase === 'over' ? 'dropped' : 'over')}>
        {phase === 'over' ? 'Drop' : 'Drag a card over'}
      </Button>
    </div>
  );
}

/** Opens instead of jumping (rule "Motion that shows what happened", item 2): a card over the lane
 * opens the drop space from nothing, and after the drop it closes up, so the cards under it slide.
 * Reduced motion: it appears and goes at once. */
export const OpensAndClosesUp: Story = {
  render: () => <OpenCloseDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const space = () => canvasElement.querySelector('[data-bella-component="board-lane-drop-space"]') as HTMLElement | null;
    await step(reduced ? 'a card over: the space is there' : 'a card over: the space opens', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Drag a card over' }));
      await expect(space()).toHaveAttribute('data-state', 'open');
      await expect(getComputedStyle(space()!).animationName).toMatch(reduced ? /^none$/ : /dropOpen/);
    });
    await step('dropped: it closes up, then it is gone', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Drop' }));
      await waitFor(() => expect(space()).toBeNull(), { timeout: 2000 });
    });
  },
};

function CountDemo() {
  const [cards, setCards] = React.useState(['Figma check']);
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', justifyItems: 'start', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      <BoardLane name="Needs you" lane="needs-you" count={cards.length} order="Failures first, then what blocks a push." style={{ inlineSize: 'calc(var(--spacing-80) * 4)' }}>
        {cards.map((t, i) => (
          <TaskCard key={t} title={t} line="Waiting on you" status="Failed" statusTone="danger" entering={i > 0 && i === cards.length - 1} />
        ))}
      </BoardLane>
      <Button variant="secondary" size="sm" onClick={() => setCards((c) => [...c, `Contrast pair ${c.length}`])}>
        Add a card
      </Button>
    </div>
  );
}

/** A new card in Needs you (rule "Motion that shows what happened", item 4): the card pops in once and
 * the count bumps once. Nothing moves on first paint; reduced motion: no movement. */
export const NewCard: Story = {
  render: () => <CountDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bump = () => canvasElement.querySelector('[class*="bump"]') as HTMLElement | null;
    await step('first paint: no bump', async () => {
      await expect(bump()).toBeNull();
    });
    await step(reduced ? 'a new card: the count changes, no movement' : 'a new card pops in and the count bumps once', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Add a card' }));
      await waitFor(() => expect(canvasElement.querySelectorAll('[data-bella-component="task-card"]').length).toBe(2));
      await expect(getComputedStyle(bump()!).animationName).toMatch(reduced ? /^none$/ : /countBump/);
      const cards = canvasElement.querySelectorAll<HTMLElement>('[data-bella-component="task-card"]');
      await expect(getComputedStyle(cards[1]).animationName).toMatch(reduced ? /^none$/ : /taskEnter/);
      await expect(getComputedStyle(cards[0]).animationName).toBe('none');
    });
  },
};
