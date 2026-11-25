import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import TypeSpecimen from './TypeSpecimen';
import cssRaw from './TypeSpecimen.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))).sort();

const meta: Meta<typeof TypeSpecimen> = {
  title: 'Components/Data/TypeSpecimen',
  component: TypeSpecimen,
  parameters: { docs: { page: ComponentDocsPage }, bellaDocs: { tokens: consumedTokens } },
};
export default meta;
type Story = StoryObj<typeof TypeSpecimen>;

/** The whole ramp, as on CHIP Foundations (the 368 card Figma draws). */
export const Ramp: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 'var(--spacing-24)', maxInlineSize: '20rem', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      <TypeSpecimen size="display-page" sizeLabel="44 to 60px" />
      <TypeSpecimen size="display-section" sizeLabel="34 to 40px" />
      <TypeSpecimen size="subsection" sizeLabel="28px" />
      <TypeSpecimen size="xl" sizeLabel="22px" />
      <TypeSpecimen size="base" sizeLabel="20px" />
      <TypeSpecimen size="sm" sizeLabel="18px" />
      <TypeSpecimen size="tag" sizeLabel="16px" />
      <TypeSpecimen size="mono" sizeLabel="16px" />
    </div>
  ),
};
