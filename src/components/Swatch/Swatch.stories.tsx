import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import Swatch from './Swatch';
import cssRaw from './Swatch.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof Swatch> = {
  title: 'Components/Data/Swatch',
  component: Swatch,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof Swatch>;

/** The four Figma variants: pair true / false, sm and lg (lg carries Copy). */
export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(12.5rem, 1fr))', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--color-background-default)', alignItems: 'start' }}>
      <Swatch color="var(--color-content-default)" name="text-primary" hex="#1D2030" ratio="AAA 16.1" />
      <Swatch color="var(--color-content-default)" name="text-primary" hex="#1D2030" pair={false} />
      <Swatch color="var(--color-content-default)" name="text-primary" hex="#1D2030" ratio="AAA 16.1" size="lg" onCopy={() => {}} />
      <Swatch color="var(--color-content-default)" name="text-primary" hex="#1D2030" pair={false} size="lg" onCopy={() => {}} />
    </div>
  ),
};
