import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor } from 'storybook/test';
import ScaledFrame from './ScaledFrame';
import { LiveSpecimen } from '../../patterns/fixtures';

const meta: Meta<typeof ScaledFrame> = {
  title: 'Components/ScaledFrame',
  component: ScaledFrame,
  argTypes: {
    children: { control: false },
    onLoad: { control: false },
    className: { control: false },
  },
  args: {
    title: 'BELLA specimen: status pills, a type sample, the semantic swatches',
    designWidth: 1280,
    designHeight: 800,
    interactive: false,
  },
};
export default meta;
type Story = StoryObj<typeof ScaledFrame>;

/** A live specimen laid out at 1280 x 800 and scaled to the container: the
 * whole canvas, no crop, no scroll. It reads the BELLA tokens in place, so
 * the theme toggle flips it with no plumbing. */
export const LiveSpecimenFrame: Story = {
  render: (args) => (
    <div style={{ maxWidth: '60rem' }}>
      <ScaledFrame {...args}>
        <LiveSpecimen />
      </ScaledFrame>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const frame = canvasElement.querySelector('[data-bella-component="scaled-frame"]')!;
    const canvas = frame.firstElementChild as HTMLElement;
    await waitFor(() => {
      const f = frame.getBoundingClientRect();
      const c = canvas.getBoundingClientRect();
      expect(Math.abs(c.width - f.width)).toBeLessThan(1);
      expect(Math.abs(c.height - f.height)).toBeLessThan(1);
    });
  },
};
