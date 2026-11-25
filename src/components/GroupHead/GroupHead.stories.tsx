import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import GroupHead from './GroupHead';
import cssRaw from './GroupHead.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['group-head']?.$extensions?.bella ?? {};

const meta: Meta<typeof GroupHead> = {
  title: 'Components/Data/GroupHead',
  component: GroupHead,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    as: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
  },
  args: { name: 'Needs you', index: '1' },
};
export default meta;

type Story = StoryObj<typeof GroupHead>;

export const Playground: Story = {};

/** The lanes in order, then a group with no order (no index). */
export const Groups: Story = {
  render: () => (
    <div
      style={{
        padding: 'var(--spacing-24)',
        background: 'var(--color-background-surface)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-16)',
      }}
    >
      <GroupHead index="1" name="Needs you" />
      <GroupHead index="2" name="Claude" />
      <GroupHead index="3" name="Gate" />
      <GroupHead index="4" name="Ready" />
      <GroupHead name="Sources" />
    </div>
  ),
};

/** Not a control: no role beyond the heading it is given, no tab stop. */
export const Behavior: Story = {
  render: () => <GroupHead as="h3" index="1" name="Needs you" />,
  play: async ({ canvas, step }) => {
    await step('a heading when asked', async () => {
      await expect(canvas.getByRole('heading', { level: 3 })).toHaveTextContent('1Needs you');
    });
    await step('no tab stop', async () => {
      await expect(canvas.queryByRole('button')).toBeNull();
      await expect(canvas.queryByRole('link')).toBeNull();
    });
  },
};
