import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Tag from './Tag';
import tagCssRaw from './Tag.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((tagCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const tagContract = (componentContract as any).component?.tag?.$extensions?.bella ?? {};

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: tagContract.a11y },
  },
  argTypes: {
    variant: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
    children: { control: false },
  },
  args: { variant: 'default' },
};
export default meta;

type Story = StoryObj<typeof Tag>;

/** Both variants in a metadata row, on the raised surface cards provide:
 * the default wash is a RECESS into its surface, so it reads against
 * paper (light) and the navy card (dark), not against the page. */
export const Variants: Story = {
  render: () => (
    <div
      style={{
        maxWidth: 420,
        padding: 'var(--spacing-5)',
        background: 'var(--color-semantic-surface)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        gap: 'var(--spacing-2)',
        flexWrap: 'wrap',
      }}
    >
      <Tag>Design systems</Tag>
      <Tag>Case study</Tag>
      <Tag variant="accent">Current</Tag>
    </div>
  ),
};

/** A Tag is not a control: no role, no tab stop, no pointer affordance. */
export const Behavior: Story = {
  render: () => <Tag>Metadata only</Tag>,
  play: async ({ canvas, step }) => {
    await step('non-interactive: no button or link role, no tab stop', async () => {
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
      expect(canvas.queryAllByRole('link')).toHaveLength(0);
      const el = canvas.getByText('Metadata only');
      expect(el).not.toHaveAttribute('tabindex');
      expect(getComputedStyle(el).cursor).toBe('default');
    });
  },
};
