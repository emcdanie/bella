import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { leavesUnder, primitive, semanticLight, walk, SectionTitle, SwatchGrid, TokenTable } from './TokenSheet';

const meta: Meta = {
  title: 'Foundations/Colors',
};
export default meta;

export const Brand: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Brand</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.brand')} />
      <SectionTitle>Iris / periwinkle ramp</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.iris')} />
    </div>
  ),
};

export const Neutrals: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Light neutrals</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.neutral')} />
      <SectionTitle>Navy scale</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.navy')} />
      <SectionTitle>Status (carried, non-text only)</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.supporting')} />
    </div>
  ),
};

export const Semantic: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Semantic (theme-aware)</SectionTitle>
      <p style={{ maxWidth: '60ch', color: 'var(--color-semantic-text-secondary)' }}>
        Chips resolve through the generated CSS custom properties, so this table
        shows the ACTIVE theme's bindings. Flip the theme toolbar to see the dark set.
      </p>
      <TokenTable leaves={walk(semanticLight as never, ['color', 'semantic']).filter((l) => !l.value.startsWith('linear-gradient'))} />
    </div>
  ),
};
