import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Stage from './Stage';
import Button from '../Button/Button';
import BoardLane from '../BoardLane/BoardLane';
import TaskCard from '../TaskCard/TaskCard';
import PartRow from '../PartRow/PartRow';
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
    {['Needs you', 'Agent', 'Gate', 'Ready'].map((name, i) => (
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

/** Her "On the stage" look, as redone 20 Nov ("these annotations are not correct .."): numbered pins
 * in her light red inside "part · value" chips, right-aligned 48 left of the part, and a neutral solid
 * leader to a dot on the part's nearest edge, straight when level, else one curved bend. scale={3}
 * shows the part at 3x, as her stage ("Shown at 3×"); x / y are the part's own pixels from the centre. */
export const Anatomy: Story = {
  render: () => (
    <Stage
      grid="dots"
      label="Button on the stage"
      scale={3}
      markers={[
        { id: 'plate', x: 30, y: -22, label: 1, part: 'Plate · #63b4e8', chipX: -184, chipY: -96 },
        { id: 'label', x: -6, y: -8, label: 2, part: 'Label · 16px', chipX: -184, chipY: -48 },
        { id: 'edge', x: -41, y: 0, label: 3, part: 'Edge · none', chipX: -184, chipY: 0 },
        { id: 'focus', x: -41, y: 10, label: 4, part: 'Focus ring · #2b8fd0', chipX: -184, chipY: 48 },
        { id: 'box', x: 0, y: 22, label: 5, part: 'Box · 44px', chipX: -184, chipY: 96 },
      ]}
    >
      <Button variant="primary">Send</Button>
    </Stage>
  ),
};

const ANATOMY = [
  { id: 'plate', x: 30, y: -22, label: 1, part: 'Plate · #63b4e8', chipX: -184, chipY: -96, title: 'Plate', description: 'The light blue fill that says this commits.' },
  { id: 'label', x: -6, y: -8, label: 2, part: 'Label · 16px', chipX: -184, chipY: -48, title: 'Label', description: 'Lexend 16 on a 22 line, navy on the plate.' },
  { id: 'edge', x: -41, y: 0, label: 3, part: 'Edge · none', chipX: -184, chipY: 0, title: 'Edge', description: 'No edge: the fill carries the shape.' },
  { id: 'focus', x: -41, y: 10, label: 4, part: 'Focus ring · #2b8fd0', chipX: -184, chipY: 48, title: 'Focus ring', description: '4 wide with a 4 gap, outside.' },
  { id: 'box', x: 0, y: 22, label: 5, part: 'Box · 44px', chipX: -184, chipY: 96, title: 'Box', description: 'The 44 target round the 32 plate.' },
];

function AnatomyHoverDemo() {
  const [active, setActive] = useState<string | null>(null);
  const [selected, setSelected] = useState('plate');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, calc(var(--spacing-80) * 9)), 1fr))', gap: 'var(--spacing-24)', alignItems: 'start' }}>
      <Stage
        grid="dots"
        label="Button on the stage"
        scale={3}
        markers={ANATOMY.map(({ title, description, ...m }) => ({ ...m, selected: m.id === selected }))}
        activeId={active}
        onActiveChange={setActive}
        onSelect={setSelected}
      >
        <Button variant="primary">Send</Button>
      </Stage>
      <div role="list" aria-label="Button parts" style={{ display: 'grid', gap: 'var(--spacing-4)' }}>
        {ANATOMY.map((m) => (
          <div role="listitem" key={m.id}>
            <PartRow
              number={m.label}
              tone="red"
              title={m.title}
              description={m.description}
              active={active === m.id}
              selected={selected === m.id}
              onActiveChange={(on) => setActive(on ? m.id : null)}
              onClick={() => setSelected(m.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Anatomy hover (her website's interaction and side list, 18 Nov: "i just wanted the animation and
 * the side part"): hovering or focusing a chip lights its row in the numbered list, and a row lights
 * its chip, both popping on the motion tokens; a click on either opens that part. Reduced motion: the
 * lit look at once, no movement. */
export const AnatomyHover: Story = {
  render: () => <AnatomyHoverDemo />,
  play: async ({ canvasElement, step }) => {
    const chip = (n: number) => canvasElement.querySelectorAll('[data-bella-component="pin-label"]')[n - 1] as HTMLElement;
    const row = (n: number) => canvasElement.querySelectorAll('[data-bella-component="part-row"]')[n - 1] as HTMLElement;
    await step('hovering chip 2 lights row 2', async () => {
      await userEvent.hover(chip(2));
      await expect(row(2)).toHaveAttribute('data-active', 'true');
      await expect(row(1)).not.toHaveAttribute('data-active');
    });
    await step('hovering row 4 lights chip 4, and back again', async () => {
      await userEvent.hover(row(4));
      await expect(chip(4)).toHaveAttribute('data-active', 'true');
      await expect(chip(2)).not.toHaveAttribute('data-active');
      await userEvent.unhover(row(4));
      await expect(chip(4)).not.toHaveAttribute('data-active');
    });
    await step('a click on chip 3 opens part 3, row and chip both selected', async () => {
      await userEvent.click(chip(3));
      await expect(chip(3)).toHaveAttribute('aria-pressed', 'true');
      await expect(row(3)).toHaveAttribute('aria-pressed', 'true');
      await expect(row(1)).toHaveAttribute('aria-pressed', 'false');
    });
    await step('keyboard: focus on a row lights its chip', async () => {
      row(5).focus();
      await waitFor(() => expect(chip(5)).toHaveAttribute('data-active', 'true'));
      row(5).blur();
      await waitFor(() => expect(chip(5)).not.toHaveAttribute('data-active'));
    });
  },
};
