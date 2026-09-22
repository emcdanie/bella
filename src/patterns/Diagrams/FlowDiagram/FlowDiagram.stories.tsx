import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent } from 'storybook/test';
import FlowDiagram from './FlowDiagram';

const meta: Meta<typeof FlowDiagram> = {
  title: 'Patterns/Diagrams/FlowDiagram',
  component: FlowDiagram,
};
export default meta;
type Story = StoryObj<typeof FlowDiagram>;

/** Tokens become components become pages. Plays once in view, then holds. */
export const Default: Story = {};

/** With a caption under the panel. */
export const WithCaption: Story = {
  args: { caption: 'One lavender token travels the whole way. Recreated concept.' },
};

export const Behavior: Story = {
  play: async ({ canvas, canvasElement, step }) => {
    await step('a labelled image that tells the story', async () => {
      const img = canvas.getByRole('img');
      await expect(img.getAttribute('aria-label') ?? '').toMatch(/travels/);
      await expect(img.hasAttribute('data-bella-diagram')).toBe(true);
    });
    await step('replay is a real, keyboard-reachable button', async () => {
      const replay = canvas.getByRole('button', { name: /replay/i });
      await userEvent.tab();
      await expect(canvasElement.ownerDocument.activeElement).toBe(replay);
      await userEvent.keyboard('{Enter}');
      await expect(canvas.getByRole('img')).toBeInTheDocument();
    });
    await step('strokes are ink, colour lives in fills', async () => {
      const frame = canvasElement.querySelector('rect[pathLength]') as SVGRectElement;
      const cs = getComputedStyle(frame);
      await expect(cs.fill).toBe('none');
      const ink = getComputedStyle(canvasElement.ownerDocument.documentElement)
        .getPropertyValue('--color-semantic-border-ink')
        .trim();
      await expect(ink.length).toBeGreaterThan(0);
    });
  },
};
