import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import StatusSquare from './StatusSquare';
import cssRaw from './StatusSquare.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['status-square']?.$extensions?.bella ?? {};

const THEMES = ['chip-light', 'chip-dark'] as const;

/** One surface per Chip theme; dark comes from the token modes, never a variant. */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>
    {THEMES.map((theme) => (
      <div
        key={theme}
        data-theme={theme}
        style={{
          padding: 'var(--spacing-20)',
          background: 'var(--color-background-surface)',
          borderRadius: 'var(--border-radius-12)',
          display: 'flex',
          gap: 'var(--spacing-16)',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {children}
      </div>
    ))}
  </div>
);

const meta: Meta<typeof StatusSquare> = {
  title: 'Components/StatusSquare',
  component: StatusSquare,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    status: { control: 'inline-radio' },
    label: { control: 'text' },
    className: { control: false },
    style: { control: false },
  },
  args: { status: 'failed' },
};
export default meta;

type Story = StoryObj<typeof StatusSquare>;

export const Playground: Story = {};

/** Every status in Chip light and Chip dark. */
export const AllStatuses: Story = {
  render: () => (
    <Themed>
      <StatusSquare status="failed" />
      <StatusSquare status="waiting" />
      <StatusSquare status="working" />
      <StatusSquare status="passed" />
    </Themed>
  ),
};

/** The status is the accessible name. */
export const Behavior: Story = {
  render: () => <StatusSquare status="waiting" />,
  play: async ({ canvas, step }) => {
    await step('named image, not a control', async () => {
      expect(canvas.getByRole('img', { name: 'waiting' })).toBeInTheDocument();
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
    });
  },
};
