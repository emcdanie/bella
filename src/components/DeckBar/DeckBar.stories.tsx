import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import DeckBar from './DeckBar';
import cssRaw from './DeckBar.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof DeckBar> = {
  title: 'Components/Layout/DeckBar',
  component: DeckBar,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof DeckBar>;
import { expect, userEvent, within } from 'storybook/test';

const wrap = { padding: 'var(--spacing-24)', background: 'var(--color-background-default)', display: 'grid', gap: 'var(--spacing-24)' } as const;
const noop = () => {};

/** A middle slide with every control: Back, the count, Next, Notes and All slides. */
export const Default: Story = {
  render: () => (
    <div style={wrap}>
      <DeckBar current={3} total={10} onBack={noop} onNext={noop} onNotes={noop} onGrid={noop} />
    </div>
  ),
};

/** The first and last slide: the Back or Next button is disabled, not hidden, so nothing moves. */
export const Ends: Story = {
  render: () => (
    <div style={wrap}>
      <DeckBar current={1} total={10} onBack={noop} onNext={noop} />
      <DeckBar current={10} total={10} onBack={noop} onNext={noop} />
    </div>
  ),
};

/** The notes panel is open: Notes reads as pressed. */
export const NotesOpen: Story = {
  render: () => (
    <div style={wrap}>
      <DeckBar current={5} total={10} onBack={noop} onNext={noop} onNotes={noop} notesOpen />
    </div>
  ),
};

/** Behavior: Next and Back call their handlers; the first slide's Back is disabled. */
export const Behavior: Story = {
  render: () => {
    const [n, setN] = React.useState(1);
    return (
      <div style={wrap}>
        <DeckBar current={n} total={4} onBack={() => setN((v) => v - 1)} onNext={() => setN((v) => v + 1)} />
        <p style={{ margin: 0 }} data-testid="now">Slide {n}</p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    await expect(c.getByRole('button', { name: /^Back/ })).toBeDisabled();
    await userEvent.click(c.getByRole('button', { name: /^Next/ }));
    await expect(c.getByTestId('now')).toHaveTextContent('Slide 2');
    await userEvent.click(c.getByRole('button', { name: /^Back/ }));
    await expect(c.getByTestId('now')).toHaveTextContent('Slide 1');
  },
};
