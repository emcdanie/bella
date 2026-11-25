import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import PartRow from './PartRow';
import cssRaw from './PartRow.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof PartRow> = {
  title: 'Components/Layout/PartRow',
  component: PartRow,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof PartRow>;

/** An anatomy list: the numbers match the Pins on the render beside it. The last row has no detail. */
export const List: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', maxInlineSize: '24rem', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      <PartRow number="1" title="Title bar" description="File name of the snippet" detail="Tokens: --color-background-subtle" />
      <PartRow number="2" title="Copy button" description="Copies the code and says Copied" detail="Tokens: --spacing-8, --border-radius-8" />
      <PartRow number="3" title="Line numbers" description="Count the lines; never copied" />
    </div>
  ),
};
