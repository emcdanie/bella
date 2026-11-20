import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
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
