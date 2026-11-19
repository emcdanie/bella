import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Stage from './Stage';
import Button from '../Button/Button';
import BoardLane from '../BoardLane/BoardLane';
import TaskCard from '../TaskCard/TaskCard';
import cssRaw from './Stage.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.stage?.$extensions?.bella ?? {};

const meta: Meta<typeof Stage> = {
  title: 'Components/Layout/Stage',
  component: Stage,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    grid: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
    children: { control: false },
  },
  args: { grid: 'dots' },
  render: (args) => (
    <Stage {...args} style={{ blockSize: 'calc(var(--spacing-80) * 4)' }}>
      <Button variant="primary">Push</Button>
    </Stage>
  ),
};
export default meta;

type Story = StoryObj<typeof Stage>;

export const Playground: Story = {};

/** Figma's set: grid=dots and grid=none, on a card, as on a doc page. */
export const Grids: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
        gap: 'var(--spacing-24)',
        padding: 'var(--spacing-24)',
        background: 'var(--color-background-surface)',
      }}
    >
      <Stage grid="dots" style={{ blockSize: 'calc(var(--spacing-80) * 4)' }}>
        <Button variant="primary">Push</Button>
        <Button variant="secondary">Undo</Button>
      </Stage>
      <Stage grid="none" style={{ blockSize: 'calc(var(--spacing-80) * 4)' }}>
        <Button variant="primary">Push</Button>
        <Button variant="secondary">Undo</Button>
      </Stage>
    </div>
  ),
};

/* ---- Playground frame: beyond published Figma, on her decision card (19 Nov) ---- */

const page = (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-24)', padding: 'var(--spacing-32)' }}>
    {['Needs you', 'Claude', 'Gate', 'Ready'].map((name, i) => (
      <BoardLane key={name} name={name} index={`0${i + 1}`} lane={i === 0 ? 'needs-you' : 'other'} order="Oldest first.">
        <TaskCard title="Figma check" line="No file key in server/.env" status="Failed" statusTone="danger" href="#t" />
      </BoardLane>
    ))}
  </div>
);

function Framed({ width, start = 'fit', markup = false }: { width: number; start?: 'fit' | 'actual'; markup?: boolean }) {
  const [zoom, setZoom] = useState<'fit' | 'actual'>(start);
  const [marks, setMarks] = useState(markup ? [{ id: 'a', x: 120, y: 60, label: 1 }] : []);
  return (
    <Stage
      frameWidth={width}
      zoom={zoom}
      onZoomChange={setZoom}
      markers={marks}
      picking={markup}
      onPick={(x, y) => setMarks((m) => [...m, { id: String(m.length), x, y, label: m.length + 1 }])}
      style={{ blockSize: 'calc(var(--spacing-80) * 8)' }}
    >
      {page}
    </Stage>
  );
}

/** A 1440 page fitted to the stage; Fit / 100% floats in the top-right corner. */
export const FrameFit: Story = { render: () => <Framed width={1440} /> };

/** The same page at 100%: wider than the stage, so it scrolls sideways inside it. */
export const FrameActual: Story = { render: () => <Framed width={1440} start="actual" /> };

/** A phone-width frame (375) at 100%. */
export const FramePhone: Story = { render: () => <Framed width={375} start="actual" /> };

/** Mark up: a crosshair over the frame; each click drops the next numbered Pin. */
export const FrameMarkup: Story = { render: () => <Framed width={1440} markup /> };

/** Not a control: no tab stop of its own; named as a group only when given a label. */
export const Behavior: Story = {
  render: () => (
    <Stage label="Button on the stage" style={{ blockSize: 'calc(var(--spacing-80) * 2)' }}>
      <Button variant="primary">Push</Button>
    </Stage>
  ),
  play: async ({ canvas, step }) => {
    await step('a named group holding its content', async () => {
      const g = canvas.getByRole('group', { name: 'Button on the stage' });
      await expect(g).toContainElement(canvas.getByRole('button', { name: 'Push' }));
    });
  },
};

/** The frame names itself with its size; Fit / 100% is the SegmentedControl (buttons, the current one marked). */
export const FrameBehavior: Story = {
  render: () => <Framed width={1440} start="actual" />,
  play: async ({ canvas, step }) => {
    await step('named by its size and zoom', async () => {
      await expect(canvas.getByRole('group', { name: '1440 wide, shown at 100%' })).toBeInTheDocument();
    });
    await step('Fit scales it down', async () => {
      canvas.getByRole('button', { name: 'Fit' }).click();
      await expect(await canvas.findByText(/1440 wide · shown at \d+%/)).not.toHaveTextContent('100%');
    });
  },
};

/** Her "On the stage" look (CHIP Components, 690:492657): dot pins on its parts
 * (green passes, ochre is a finding), the part names in a column of chips, and a dashed pink leader
 * for the part in focus. Marker positions are pixels from the stage's centre. The specimen is
 * shown at 2x, as on her page. */
export const Anatomy: Story = {
  render: () => (
    <Stage
      grid="dots"
      label="Button on the stage"
      markers={[
        { id: 'plate', x: 41, y: -44, part: 'Plate', status: 'finding', chipX: -136, chipY: -80 },
        { id: 'label', x: 0, y: -22, part: 'Label', status: 'pass', chipX: -136, chipY: -40 },
        { id: 'edge', x: -82, y: 0, part: 'Edge', status: 'finding', chipX: -136, chipY: 0, leader: true },
        { id: 'focus', x: -96, y: 30, part: 'Focus ring', status: 'pass', chipX: -136, chipY: 40 },
        { id: 'box', x: 0, y: 44, part: 'Box', status: 'pass', chipX: -136, chipY: 80 },
      ]}
    >
      <div style={{ blockSize: 'calc(var(--spacing-80) * 5)', display: 'grid', placeItems: 'center' }}>
        <div style={{ scale: '2' }}>
          <Button variant="primary">Send</Button>
        </div>
      </div>
    </Stage>
  ),
};
