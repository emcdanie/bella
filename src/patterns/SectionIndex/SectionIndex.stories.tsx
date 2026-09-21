import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import SectionIndex from './SectionIndex';

const meta: Meta<typeof SectionIndex> = {
  title: 'Patterns/SectionIndex',
  component: SectionIndex,
  args: { index: '01', label: 'Featured', as: 'h2' },
  argTypes: { as: { control: 'inline-radio' } },
};
export default meta;
type Story = StoryObj<typeof SectionIndex>;

/** The "01 / FEATURED" rule line. */
export const Featured: Story = {};

/** The Work page's three indexes, stacked as they read down the page. */
export const Sequence: Story = {
  render: () => (
    <div style={{ display: 'grid', rowGap: 'var(--spacing-10)' }}>
      <SectionIndex index="01" label="Featured" />
      <SectionIndex index="02" label="Selected work" />
      <SectionIndex index="03" label="Pattern studies" />
    </div>
  ),
};
