import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import SizeTag from './SizeTag';
import cssRaw from './SizeTag.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof SizeTag> = {
  title: 'Components/Layout/SizeTag',
  component: SizeTag,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof SizeTag>;

/** The four Figma tones, each the pop colour of its annotation. */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--spacing-16)', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      <SizeTag tone="yellow">24</SizeTag>
      <SizeTag tone="pink">16</SizeTag>
      <SizeTag tone="blue">44</SizeTag>
      <SizeTag tone="red">8</SizeTag>
    </div>
  ),
};
