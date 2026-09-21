import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import { expectSharpImages } from '../../testing/behavioral';
import BeforeAfterFrame from './BeforeAfterFrame';
import { filterCaption, filterStudy } from '../fixtures';

const meta: Meta<typeof BeforeAfterFrame> = {
  title: 'Patterns/BeforeAfterFrame',
  component: BeforeAfterFrame,
  args: { states: filterStudy, label: 'Filters study: screen state', caption: filterCaption, fit: 'auto' },
  argTypes: { states: { control: false }, caption: { control: 'text' }, fit: { control: 'inline-radio' } },
};
export default meta;
type Story = StoryObj<typeof BeforeAfterFrame>;

/** Assert every marker draws whole inside the frame's stage. */
async function expectMarkersUnclipped(root: HTMLElement) {
  const stage = root.querySelector('figure [class*="stage"]')!.getBoundingClientRect();
  for (const m of Array.from(root.querySelectorAll('[class*="marker"]'))) {
    const r = m.getBoundingClientRect();
    await expect(r.left).toBeGreaterThanOrEqual(stage.left);
    await expect(r.right).toBeLessThanOrEqual(stage.right);
    await expect(r.top).toBeGreaterThanOrEqual(stage.top);
    await expect(r.bottom).toBeLessThanOrEqual(stage.bottom);
  }
}

/** Auto (the default): the whole screen fits while the frame is wide; on a
 * phone it keeps a legible width in a scrolling 16:10 window with a cue. */
export const Auto: Story = {
  play: ({ canvasElement }) => expectSharpImages(canvasElement),
};

/** Fit at every width: the whole screen, scaled into the frame. Markers at
 * the very edge (1.5% and 98.5%) still draw whole; the notes carry the
 * meaning. */
export const Fit: Story = {
  args: { fit: 'fit' },
  play: async ({ canvas, canvasElement, step }) => {
    await step('before: sharp, markers whole', async () => {
      await expectSharpImages(canvasElement);
      await expectMarkersUnclipped(canvasElement);
    });
    await step('switch to after', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'After' }));
      await expect(canvas.getByRole('button', { name: 'After' })).toHaveAttribute('aria-current', 'true');
      await expectMarkersUnclipped(canvasElement);
    });
  },
};

/** Scroll at every width: the screen keeps a legible size in a 16:10
 * window, with a cue. While it scrolls, the window is a focusable region,
 * so the keyboard can scroll it. */
export const Scroll: Story = {
  args: { fit: 'scroll' },
  /* the recreated screens are light-only captures; at scroll size they fill
     most of the frame in dark mode: content, not a surface leak */
  parameters: { bella: { themeIntegrity: false } },
};

/** A third state: the tabs take up to three. */
export const ThreeStates: Story = {
  args: {
    states: [
      ...filterStudy,
      { ...filterStudy[1], id: 'annotated', label: 'Shipped', markers: filterStudy[1].markers!.slice(0, 2) },
    ],
  },
};
