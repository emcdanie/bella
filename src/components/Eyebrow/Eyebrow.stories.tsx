import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import Eyebrow from './Eyebrow';
import Heading from '../Heading/Heading';

const meta: Meta<typeof Eyebrow> = {
  title: 'Components/Eyebrow',
  component: Eyebrow,
  args: { children: '01 · The problem, framed' },
  argTypes: { variant: { control: 'inline-radio' }, as: { control: 'inline-radio' } },
};
export default meta;
type Story = StoryObj<typeof Eyebrow>;

/** The muted label above a section heading. */
export const Muted: Story = {};

/** Ink, for an eyebrow that leads a part. */
export const Ink: Story = { args: { variant: 'ink', children: 'Part A · the work index' } };

/** In place: eyebrow, then the h2 it labels. */
export const AboveAHeading: Story = {
  render: (args) => (
    <div style={{ display: 'grid', rowGap: 'var(--spacing-4)' }}>
      <Eyebrow {...args} />
      <Heading tier="section" as="h2">
        It felt complicated. The numbers said why.
      </Heading>
    </div>
  ),
};

export const Behavior: Story = {
  play: async ({ canvas, step }) => {
    const el = canvas.getByText('01 · The problem, framed');
    const cs = getComputedStyle(el);
    await step('Figtree at the 16px label floor, no tracking, no caps', async () => {
      await expect(cs.fontFamily).toMatch(/^Figtree\b/);
      await expect(parseFloat(cs.fontSize)).toBe(16);
      await expect(parseFloat(cs.letterSpacing) || 0).toBe(0);
      await expect(cs.textTransform).toBe('none');
      await expect(cs.fontFamily).not.toMatch(/Mono/);
    });
    await step('never a heading', async () => {
      await expect(canvas.queryByRole('heading')).toBeNull();
    });
  },
};
