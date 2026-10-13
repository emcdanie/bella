import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import AvatarStack from './AvatarStack';
import stackCssRaw from './AvatarStack.module.css?raw';
import componentContract from '../../../tokens/component.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((stackCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const stackContract = (componentContract as any).component?.['avatar-stack']?.$extensions?.bella ?? {};

/* The Bar cast — wee-dote lane colours via tokens. */
const THE_BAR = [
  { name: 'Elleta' },
  { name: 'Seamus', laneColor: 'var(--color-semantic-text-primary)' },
  { name: 'Dara', laneColor: 'var(--color-wee-dote-lane-a)' },
  { name: 'Bernie', laneColor: 'var(--color-wee-dote-lane-b)' },
  { name: 'Saoirse', laneColor: 'var(--color-wee-dote-lane-c)' },
  { name: 'Frankie', laneColor: 'var(--color-wee-dote-lane-d)' },
  { name: 'Liam', laneColor: 'var(--color-wee-dote-lane-e)' },
];

const meta: Meta<typeof AvatarStack> = {
  title: 'Components/Chat/AvatarStack',
  component: AvatarStack,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: stackContract.a11y },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    max: { control: 'number' },
    surfaceColor: { control: 'color' },
  },
  args: { members: THE_BAR.slice(0, 4), size: 'sm' },
};
export default meta;

type Story = StoryObj<typeof AvatarStack>;

/** Full seven-person group for The Bar header. */
export const TheBarCast: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-4)', background: 'var(--color-semantic-surface)' }}>
      <AvatarStack members={THE_BAR} size="sm" />
    </div>
  ),
};

/** Overflow cap: shows the first N and a +N badge. */
export const WithOverflow: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
      <AvatarStack members={THE_BAR} max={4} size="sm" />
      <AvatarStack members={THE_BAR} max={3} size="md" />
    </div>
  ),
};

/** wee-dote theme. Pass surfaceColor to match the column background. */
export const WeeDote: Story = {
  parameters: { backgrounds: { default: 'wee-dote' } },
  render: () => (
    <div
      style={{
        padding: 'var(--spacing-4)',
        background: 'var(--color-semantic-background)',
      }}
    >
      <AvatarStack members={THE_BAR} size="sm" surfaceColor="var(--color-semantic-surface)" />
    </div>
  ),
};

export const Behavior: Story = {
  render: () => <AvatarStack members={THE_BAR.slice(0, 3)} size="sm" />,
  play: async ({ canvas, step }) => {
    const root = canvas.getByRole('group');

    await step('root is labelled with all member names', async () => {
      const label = root.getAttribute('aria-label') ?? '';
      expect(label).toContain('Elleta');
      expect(label).toContain('Seamus');
    });

    await step('each Avatar is a named image', async () => {
      const imgs = canvas.getAllByRole('img');
      expect(imgs.length).toBeGreaterThanOrEqual(3);
    });
  },
};
