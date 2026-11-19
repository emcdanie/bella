import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import PinLabel from './PinLabel';
import cssRaw from './PinLabel.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof PinLabel> = {
  title: 'Components/Layout/PinLabel',
  component: PinLabel,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof PinLabel>;

/** Both kinds: a pin with its token name, and the stage chip passing, with a finding, and selected. */
export const Kinds: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-16)', alignItems: 'center', padding: 'var(--spacing-24)', background: 'var(--color-background-highlight)' }}>
      <PinLabel number="01" tone="pink">--radius-full</PinLabel>
      <PinLabel number="02" tone="yellow">--focus-ring</PinLabel>
      <PinLabel kind="part" status="pass">Copy button</PinLabel>
      <PinLabel kind="part" status="finding">Line numbers</PinLabel>
      <PinLabel kind="part" status="pass" selected>Title bar</PinLabel>
    </div>
  ),
};
