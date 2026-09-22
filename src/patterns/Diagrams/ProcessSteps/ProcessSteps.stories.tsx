import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import ProcessSteps from './ProcessSteps';

const meta: Meta<typeof ProcessSteps> = {
  title: 'Patterns/Diagrams/ProcessSteps',
  component: ProcessSteps,
  args: {
    label: 'How I work, in five steps',
    /* step copy from the Geist direction study (marked placeholder there) */
    steps: [
      { title: 'Discovery and research', body: 'Audit what exists, talk to the people who use it.' },
      { title: 'Structure and systems', body: 'Name the parts. Map the drift.' },
      { title: 'Design systems', body: 'Tokens, components, one source of truth.' },
      { title: 'Prototyping and validation', body: 'Test in the browser with real content.' },
      { title: 'Delivery and documentation', body: 'Ship with developers, write it down, keep it alive.' },
    ],
  },
};
export default meta;
type Story = StoryObj<typeof ProcessSteps>;

/** Five steps: a row once the container is 768px wide, stacked below. */
export const FiveSteps: Story = {};

/** Three steps: the columns follow the count. */
export const ThreeSteps: Story = {
  args: {
    label: 'Three steps',
    steps: [
      { title: 'Audit', body: 'What exists, and who uses it.' },
      { title: 'Decide', body: 'Name it once, write it down.' },
      { title: 'Ship', body: 'Into code, with the team.' },
    ],
  },
};

export const Behavior: Story = {
  play: async ({ canvas, canvasElement, step }) => {
    await step('an ordered, labelled list with real step headings', async () => {
      const list = canvas.getByRole('list', { name: /five steps/i });
      await expect(list.tagName).toBe('OL');
      await expect(canvas.getAllByRole('heading', { level: 3 })).toHaveLength(5);
    });
    await step('Mono numbers at the 13px floor', async () => {
      const n = canvas.getByText('01');
      const cs = getComputedStyle(n);
      await expect(cs.fontFamily).toMatch(/Geist Mono/);
      await expect(parseFloat(cs.fontSize)).toBe(13);
    });
    await step('no shadows', async () => {
      for (const el of canvasElement.querySelectorAll('[data-bella-pattern="process-steps"] *')) {
        await expect(getComputedStyle(el).boxShadow).toBe('none');
      }
    });
  },
};
