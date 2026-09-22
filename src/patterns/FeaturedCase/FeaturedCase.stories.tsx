import type { Meta, StoryObj } from '@storybook/react-vite';
import { expectSharpImages } from '../../testing/behavioral';
import FeaturedCase from './FeaturedCase';
import { featured, liveCover } from '../fixtures';

const meta: Meta<typeof FeaturedCase> = {
  title: 'Patterns/FeaturedCase',
  component: FeaturedCase,
  args: featured,
  argTypes: {
    cover: { control: false },
    linkComponent: { control: false },
    layout: { control: 'inline-radio' },
    emphasis: { control: 'inline-radio' },
  },
};
export default meta;
type Story = StoryObj<typeof FeaturedCase>;

/** One wide card: cover left (about 60%), the body right. It stacks when
 * its own width drops below the tablet breakpoint (390 stacks). */
export const B2BTravel: Story = {
  play: ({ canvasElement }) => expectSharpImages(canvasElement),
};

/** The cover slot holding a live BELLA specimen instead of an image. */
export const LiveCover: Story = { args: { cover: liveCover } };

/** No cover yet: the placeholder holds the well. */
export const Placeholder: Story = { args: { cover: undefined } };
