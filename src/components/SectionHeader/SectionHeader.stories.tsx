import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import SectionHeader from './SectionHeader';

const meta: Meta<typeof SectionHeader> = {
  title: 'Components/SectionHeader',
  component: SectionHeader,
  argTypes: {
    layout: { control: 'inline-radio' },
    as: { control: 'inline-radio' },
    accent: { control: 'text' },
    children: { control: false },
    className: { control: false },
  },
  args: {
    heading: 'Start with the',
    accent: 'work',
    after: '.',
    lead: 'Three cases, each with a working specimen you can open.',
    layout: 'split',
    as: 'h2',
  },
};
export default meta;
type Story = StoryObj<typeof SectionHeader>;

/** Split: heading beside the lead once the header's own width allows it. */
export const Split: Story = {
  render: (args) => (
    <SectionHeader {...args}>
      <p>
        Tokens, components, and the governance that keeps them from drifting.
        Every case links to the real thing.
      </p>
    </SectionHeader>
  ),
};

/** Stacked: the page opening, heading above the lead at every width. */
export const StackedPageOpening: Story = {
  args: { as: 'h1', layout: 'stacked', heading: 'The', accent: 'library', after: '.' },
};

/** An interactive accent (the portfolio's glossary term) with `term`: the
 * heading's accessible name is spelled out, not padded by the button. */
export const TermAccent: Story = {
  args: {
    heading: 'Built on',
    accent: (
      <button
        type="button"
        style={{
          font: 'inherit',
          color: 'inherit',
          letterSpacing: 'inherit',
          textTransform: 'inherit',
          background: 'none',
          border: 0,
          padding: 0,
          cursor: 'help',
          textDecoration: 'underline dotted',
        }}
      >
        Bella
      </button>
    ),
    term: 'Bella',
    after: '.',
    lead: undefined,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('heading', { name: 'Built on Bella.' })).toBeInTheDocument();
  },
};
