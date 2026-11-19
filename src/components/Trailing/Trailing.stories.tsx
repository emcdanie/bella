import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Trailing from './Trailing';
import cssRaw from './Trailing.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['trailing']?.$extensions?.bella ?? {};

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

const meta: Meta<typeof Trailing> = {
  title: 'Components/Trailing',
  component: Trailing,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    icon: { control: 'inline-radio' },
    label: { control: 'text' },
    className: { control: false },
    style: { control: false },
  },
  args: { icon: 'NavArrowRight' },
};
export default meta;

type Story = StoryObj<typeof Trailing>;

export const Playground: Story = {};

/** › opens, ↗ leaves, each at the end of a 44 row, in Chip light and Chip dark. */
export const AllIcons: Story = {
  render: () => (
    <Themed>
      {(['NavArrowRight', 'ArrowUpRight'] as const).map((icon) => (
        <div
          key={icon}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-12)',
            minBlockSize: 'var(--spacing-44)',
            inlineSize: 240,
            fontFamily: 'var(--typography-body-default-font-family)',
            fontSize: 'var(--typography-font-size-16)',
            color: 'var(--color-content-default)',
          }}
        >
          <span style={{ flex: 1 }}>{icon === 'NavArrowRight' ? 'Open the row' : 'Leaves the app'}</span>
          <Trailing icon={icon} />
        </div>
      ))}
    </Themed>
  ),
};

/** Decorative by default; the row is the target. */
export const Behavior: Story = {
  render: () => <Trailing />,
  play: async ({ canvas, step }) => {
    await step('no role, no tab stop', async () => {
      expect(canvas.queryAllByRole('img')).toHaveLength(0);
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
    });
  },
};
