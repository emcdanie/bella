import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import Button from '../Button/Button';
import SystemHealth from './SystemHealth';
import cssRaw from './SystemHealth.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const meta: Meta<typeof SystemHealth> = {
  title: 'Components/Data/SystemHealth',
  component: SystemHealth,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens },
  },
};
export default meta;

type Story = StoryObj<typeof SystemHealth>;

/* every number in Geist Mono: the element's face is the number token's first family */
const numberFace = (el: Element) => getComputedStyle(document.documentElement).getPropertyValue('--typography-number-font-family').split(',')[0].trim().replace(/['"]/g, '');
const faceOf = (el: Element) => getComputedStyle(el).fontFamily.split(',')[0].trim().replace(/['"]/g, '');

/* Cards sit on the page ground, at the width Figma draws the card (331). */
const Ground = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-default)', maxInlineSize: 'calc(331px + var(--spacing-48))', boxSizing: 'border-box' }}>
    {children}
  </div>
);

const FAILING = [
  { name: 'Contrast', count: 9, ofTotal: 'of 44 parts', href: '#contrast' },
  { name: 'Story', count: 2, ofTotal: 'of 44 parts', href: '#story' },
  { name: 'A11y', count: 2, ofTotal: 'of 44 parts', href: '#a11y' },
];

/** As the published Figma instance: 95% healthy, the blue target tick at 90%, three failing checks. */
export const Healthy: Story = {
  render: () => (
    <Ground>
      <SystemHealth
        value={95}
        status="Healthy"
        passed="251 of 264 pass"
        why="Healthy means 90% or more pass (the blue tick). 13 checks still fail:"
        failing={FAILING}
      />
    </Ground>
  ),
  play: async ({ canvasElement }) => {
    const count = canvasElement.querySelector('[class*="countNumber"]') as HTMLElement;
    await expect(faceOf(count)).toBe(numberFace(count));
  },
};

/** Under the target: fewer ticks lit, the target tick still marks 90%. */
export const BelowTarget: Story = {
  render: () => (
    <Ground>
      <SystemHealth value={72} status="Needs work" passed="190 of 264 pass" why="Healthy means 90% or more pass (the blue tick). 74 checks still fail:" failing={FAILING} />
    </Ground>
  ),
};

/** One column (a window under about 700): the card runs wide, the gauge stops at 320 and centres. */
export const OneColumn: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-default)', maxInlineSize: '42rem', boxSizing: 'border-box' }}>
      <SystemHealth value={95} status="Healthy" passed="251 of 264 pass" why="Healthy means 90% or more pass (the blue tick). 13 checks still fail:" failing={FAILING} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const gauge = canvasElement.querySelector('[role="meter"]')?.parentElement?.getBoundingClientRect();
    await expect(gauge && gauge.width).toBeLessThanOrEqual(320);
  },
};

/** The gauge reads as a meter: value, range and words. */
export const Behavior: Story = {
  render: () => (
    <Ground>
      <SystemHealth value={95} status="Healthy" passed="251 of 264 pass" failing={FAILING} />
    </Ground>
  ),
  play: async ({ canvasElement }) => {
    const c = within(canvasElement);
    const meter = c.getByRole('meter', { name: 'System health' });
    await expect(meter).toHaveAttribute('aria-valuenow', '95');
    await expect(meter).toHaveAttribute('aria-valuetext', '95%, Healthy');
    await expect(c.getAllByRole('link')).toHaveLength(3);
  },
};

function NewScoreDemo() {
  const [after, setAfter] = React.useState(false);
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', justifyItems: 'start', maxInlineSize: 'calc(var(--spacing-80) * 5)' }}>
      <SystemHealth value={after ? 91 : 84} status={after ? 'Healthy' : 'Below target'} passed={after ? '40 of 44 pass' : '37 of 44 pass'} />
      <Button variant="secondary" size="sm" onClick={() => setAfter((a) => !a)}>
        Check again
      </Button>
    </div>
  );
}

/** A new score (rule "Motion that shows what happened", item 5): the gauge fills tick by tick from 84
 * to 91 and "+7" shows once beside the number. Nothing moves on first paint; aria-valuenow is the real
 * score throughout. Reduced motion: the new score at once, no difference mark. */
export const NewScore: Story = {
  render: () => <NewScoreDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const meter = canvas.getByRole('meter');
    await step('a new score: the meter says 91 at once, the drawing counts there', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Check again' }));
      await expect(meter).toHaveAttribute('aria-valuenow', '91');
      await waitFor(() => expect(canvasElement.querySelector('[class*="number"]')!.textContent).toMatch(/^91%/), { timeout: 3000 });
    });
    await step(reduced ? 'reduced motion: no difference mark' : 'the difference shows once', async () => {
      const diff = canvasElement.querySelector('[class*="diff"]') as HTMLElement | null;
      if (reduced) {
        await expect(diff === null || getComputedStyle(diff).display === 'none').toBe(true);
        return;
      }
      await expect(diff).toHaveTextContent('+7');
      await expect(getComputedStyle(diff!).animationIterationCount).toBe('1');
    });
  },
};
