import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { expectSharpImages } from '../../testing/behavioral';
import CaseGrid from './CaseGrid';
import { featured, grid } from '../fixtures';

const meta: Meta<typeof CaseGrid> = {
  title: 'Patterns/CaseGrid',
  component: CaseGrid,
  args: { items: grid, label: 'Selected work' },
  argTypes: { items: { control: false }, linkComponent: { control: false } },
};
export default meta;
type Story = StoryObj<typeof CaseGrid>;

/** Three cases, no orphan: two tiles, then the third closes the grid wide
 * (cover beside body). One column at 390. */
export const ThreeCases: Story = {
  /* the covers are light product screenshots (Code First, CHIP) and stay
     light in dark mode: content, not a surface leak. The surfaces around
     them are checked by eye in the dark captures. */
  parameters: { bella: { themeIntegrity: false } },
  play: async ({ canvasElement }) => {
    await expectSharpImages(canvasElement);
    const items = Array.from(canvasElement.querySelectorAll('li'));
    const last = items[items.length - 1].getBoundingClientRect();
    const first = items[0].getBoundingClientRect();
    const list = canvasElement.querySelector('ul')!.getBoundingClientRect();
    // no orphan: the last row is always flush to both edges
    await expect(Math.abs(last.left - list.left)).toBeLessThan(1);
    await expect(Math.abs(last.right - list.right)).toBeLessThan(1);
    await expect(first.width).toBeGreaterThan(0);
  },
};

/** Four cases: the full 2x2 at 1024 and up. */
export const FourCases: Story = {
  args: { items: [...grid, { ...featured, cover: featured.cover }] },
};
