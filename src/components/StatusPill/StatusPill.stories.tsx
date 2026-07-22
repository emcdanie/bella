import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import StatusPill from './StatusPill';
import pillCssRaw from './StatusPill.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((pillCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const pillContract =
  (componentContract as any).component?.['status-pill']?.$extensions?.bella ?? {};

const meta: Meta<typeof StatusPill> = {
  title: 'Components/StatusPill',
  component: StatusPill,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: pillContract.a11y },
  },
  argTypes: {
    variant: { control: 'inline-radio' },
    className: { control: false },
    children: { control: false },
  },
  args: { variant: 'accent' },
};
export default meta;

type Story = StoryObj<typeof StatusPill>;

/** One tint per state; the word carries the meaning, the tint reinforces.
 * The success/info tints are the carried pair, pending the status-ladder
 * sitting (issue #1). */
export const Variants: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 420,
        padding: 'var(--spacing-5)',
        background: 'var(--color-semantic-surface)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        gap: 'var(--spacing-3)',
        flexWrap: 'wrap',
      }}
    >
      <StatusPill variant="accent">Current focus</StatusPill>
      <StatusPill variant="success">Shipped</StatusPill>
      <StatusPill variant="info">In review</StatusPill>
    </div>
  ),
};

/** Non-interactive: no role, no tab stop; the state is readable from the
 * word alone. */
export const Behavior: Story = {
  render: () => <StatusPill variant="accent">Current focus</StatusPill>,
  play: async ({ canvas, step }) => {
    await step('non-interactive: no control roles, no tab stop', async () => {
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
      expect(canvas.queryAllByRole('link')).toHaveLength(0);
      const el = canvas.getByText('Current focus');
      expect(el).not.toHaveAttribute('tabindex');
      expect(getComputedStyle(el).cursor).toBe('default');
    });
  },
};
