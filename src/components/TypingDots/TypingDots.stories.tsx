import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import TypingDots from './TypingDots';
import dotsCssRaw from './TypingDots.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((dotsCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const dotsContract = (componentContract as any).component?.['typing-dots']?.$extensions?.bella ?? {};

const meta: Meta<typeof TypingDots> = {
  title: 'Components/Chat/TypingDots',
  component: TypingDots,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: dotsContract.a11y },
  },
  args: { name: 'Dara' },
};
export default meta;

type Story = StoryObj<typeof TypingDots>;

export const Default: Story = {};

/** All four wee-dote lanes. */
export const AllLanes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <TypingDots name="Dara" />
      <TypingDots name="Bernie" />
      <TypingDots name="Saoirse" />
      <TypingDots name="Frankie" />
    </div>
  ),
};

/** wee-dote theme. */
export const WeeDote: Story = {
  parameters: { backgrounds: { default: 'wee-dote' } },
  render: () => (
    <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-semantic-background)' }}>
      <TypingDots name="Seamus" />
    </div>
  ),
};

export const Behavior: Story = {
  render: () => <TypingDots name="Frankie" />,
  play: async ({ canvas, step }) => {
    const root = canvas.getByRole('status');

    await step('accessible label names the person typing', async () => {
      expect(root).toHaveAttribute('aria-label', 'Frankie is typing');
    });

    await step('dots are aria-hidden', async () => {
      const dots = root.querySelectorAll('[aria-hidden="true"]');
      expect(dots.length).toBe(3);
    });
  },
};
