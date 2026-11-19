import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import TextStack from './TextStack';
import cssRaw from './TextStack.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['text-stack']?.$extensions?.bella ?? {};

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

const meta: Meta<typeof TextStack> = {
  title: 'Components/Layout/TextStack',
  component: TextStack,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    overline: { control: 'text' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    body: { control: 'text' },
    className: { control: false },
    style: { control: false },
  },
  args: { title: 'Title', subtitle: 'Subtitle: one line on what this is.' },
};
export default meta;

type Story = StoryObj<typeof TextStack>;

export const Playground: Story = {};

/** Each line on and off, in Chip light and Chip dark. */
export const AllLines: Story = {
  render: () => (
    <Themed>
      <div style={{ inlineSize: 320 }}>
        <TextStack
          overline="Overline"
          title="Title"
          subtitle="Subtitle: one line on what this is."
          body="Body: the longer explanation, wrapping onto more lines when it needs to."
        />
      </div>
      <div style={{ inlineSize: 320 }}>
        <TextStack title="Title" subtitle="Subtitle: one line on what this is." />
      </div>
      <div style={{ inlineSize: 320 }}>
        <TextStack title="Title only" />
      </div>
    </Themed>
  ),
};

/** A missing value means the line is off: nothing renders for it. */
export const Behavior: Story = {
  render: () => <TextStack title="Only a title" />,
  play: async ({ canvasElement, step }) => {
    await step('one line rendered', async () => {
      const root = canvasElement.querySelector('[data-bella-component="text-stack"]');
      expect(root?.children).toHaveLength(1);
    });
  },
};
