import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import StatCard from '../components/StatCard/StatCard';
import Button from '../components/Button/Button';

/* Demo only, not wired into CHIP (decided 21 Nov). The chart CHIP's Health renders:
 * StatCard with a Progress bar and its blue target ("Contrast coverage").
 * Left: as it is today. Right: drawIn. */

const meta: Meta = {
  title: 'Motion/ChartDrawIn',
  parameters: { layout: 'padded' },
};
export default meta;
type Story = StoryObj;

const TARGET = 90;

function Demo() {
  const [after, setAfter] = useState(false);
  const pct = after ? 93 : 84;
  const card = (drawIn: boolean) => (
    <StatCard
      title="Contrast coverage"
      icon="Palette"
      tone={pct >= TARGET ? 'success' : 'warning'}
      value={pct}
      unit="%"
      chart="bar"
      meter={{ fill: pct, target: TARGET }}
      context={`${Math.round((pct / 100) * 44)} of 44 have pairs`}
      caption={`Target ${TARGET}%`}
      drawIn={drawIn}
    />
  );
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-24)', justifyItems: 'start' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(calc(var(--spacing-80) * 4), 1fr))', gap: 'var(--spacing-24)', inlineSize: '100%' }}>
        <div data-testid="today">{card(false)}</div>
        <div data-testid="draw-in">{card(true)}</div>
      </div>
      <Button variant="secondary" size="sm" onClick={() => setAfter((a) => !a)}>
        Check again
      </Button>
    </div>
  );
}

/** (1) On first load the bar grows to its value once, on motion/duration/450 and motion/easing/out;
 * the blue target is drawn before the bar arrives. (2) A new value: the bar slides from the old value
 * to the new one on the same tokens, and the gained stretch shows once. (3) Reduced motion: the end
 * state, no movement. No loop, no bounce; round caps stay. */
export const ChartDrawIn: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fill = (id: string) => canvasElement.querySelector(`[data-testid="${id}"] [data-bella-component="progress-fill"]`) as HTMLElement;
    const target = canvasElement.querySelector('[data-testid="draw-in"] [class*="target"]') as HTMLElement;
    await step(reduced ? 'reduced motion: drawn at once, no movement' : 'draws in once on the motion tokens', async () => {
      const cs = getComputedStyle(fill('draw-in'));
      if (reduced) {
        await expect(cs.animationName).toBe('none');
      } else {
        await expect(cs.animationName).toMatch(/progressDraw/);
        await expect(cs.animationIterationCount).toBe('1');
        await expect(parseFloat(cs.animationDuration)).toBe(0.45);
      }
      await expect(getComputedStyle(fill('today')).animationName).toBe('none');
    });
    await step('the target is drawn before the mark arrives', async () => {
      await expect(target).not.toBeNull();
      await expect(getComputedStyle(target).animationName).toBe('none');
    });
    await step('ends at the value', async () => {
      await Promise.all(fill('draw-in').getAnimations().map((a) => a.finished));
      const w = (id: string) => fill(id).getBoundingClientRect().width;
      await expect(Math.abs(w('draw-in') - w('today'))).toBeLessThan(1);
    });
    await step(reduced ? 'a new value: there at once' : 'a new value slides there on the same tokens, in both cards', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Check again' }));
      await waitFor(() => expect(canvasElement.querySelector('[data-testid="draw-in"] [role="progressbar"]')).toHaveAttribute('aria-valuenow', '93'));
      if (reduced) return;
      await waitFor(() => expect(document.getAnimations().filter((a) => (a as CSSTransition).transitionProperty === '--progress-fill').length).toBe(2));
    });
  },
};
