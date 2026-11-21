import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import Button from '../Button/Button';
import SystemHealth from './SystemHealth';
import cssRaw from './SystemHealth.module.css?raw';
import { ComponentDocsPage } from '../../docs/DocBlocks';
import reduceMotion from '../shared/reduceMotion';

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
  { name: 'Contrast', count: 9, ofTotal: 'of 44 fail', href: '#contrast' },
  { name: 'Story', count: 2, ofTotal: 'of 44 fail', href: '#story' },
  { name: 'A11y', count: 2, ofTotal: 'of 44 fail', href: '#a11y' },
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
    // rule 12, a count says of what, as the Figma Fail row: "9 of 44 fail"
    for (const c of canvasElement.querySelectorAll<HTMLElement>('[class*="count"]:not([class*="countNumber"])')) {
      await expect(c.textContent).toMatch(/^\d+ of \d+ fail$/);
    }
    // chart language (22 Nov 20:48): the status is a small-caps label 4 above the number
    const status = canvasElement.querySelector<HTMLElement>('[class*="status"]')!;
    const number = canvasElement.querySelector<HTMLElement>('[class*="number"]')!;
    await expect(status.nextElementSibling).toBe(number);
    await expect(getComputedStyle(status).textTransform).toBe('uppercase');
    await expect(Math.round(number.getBoundingClientRect().top - status.getBoundingClientRect().bottom)).toBe(4);
    // lit ticks glow; off ticks and the target tick do not. At 95: ticks 1 to 38 lit, 36 the target, 39 and 40 off
    await waitFor(() => expect(number.textContent).toMatch(/^95%/), { timeout: 3000 });
    const ticks = Array.from(canvasElement.querySelector<HTMLElement>('[class*="arc"]')!.children);
    await expect(getComputedStyle(ticks[0]).filter).toContain('drop-shadow');
    await expect(getComputedStyle(ticks[35]).filter).toBe('none');
    await expect(getComputedStyle(ticks[39]).filter).toBe('none');
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
 * to 91 and "+7" shows once beside the number. aria-valuenow is the real score throughout. Reduced
 * motion: the new score at once, no difference mark. */
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

/** A long check name in a narrow card (Health's gauge card at 1100, 21 Nov): "Parts that need work" keeps
 * word groups and its count sits beside it, or under it when there is no room; never one word a line. */
export const LongName: Story = {
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-24)', alignItems: 'start', padding: 'var(--spacing-24)', background: 'var(--color-background-default)' }}>
      {[3, 4, 5].map((n) => (
        <div key={n} data-width={n} style={{ inlineSize: `calc(var(--spacing-80) * ${n})` }}>
          <SystemHealth value={72} status="Needs work" passed="190 of 264 pass" failing={[{ name: 'Parts that need work', count: 36, ofTotal: 'of 83 fail', href: '#parts' }, ...FAILING.slice(0, 1)]} />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    for (const name of canvasElement.querySelectorAll<HTMLElement>('[class*="name"]')) {
      if (!name.textContent?.startsWith('Parts')) continue;
      const lh = parseFloat(getComputedStyle(name).lineHeight);
      await expect(Math.round(name.getBoundingClientRect().height / lh)).toBeLessThanOrEqual(2);
    }
  },
};

/* lit ticks: the arc's spans with the "on" class (CSS module names are _on_<hash> or on) */
const litTicks = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('[role="meter"] [aria-hidden="true"] > span')).filter((t) =>
    Array.from(t.classList).some((c) => /^_?on(_|$)/.test(c)),
  ).length;

/** Chart motion (22 Nov): when the gauge first shows, the ticks light one after another from Low to the
 * score while the number counts up from 0, over motion/duration/450 on motion/easing/out; no difference
 * mark for that first count. The meter says the real score from the start. */
export const FirstShow: Story = {
  render: () => (
    <Ground>
      <SystemHealth value={95} status="Healthy" passed="251 of 264 pass" />
    </Ground>
  ),
  play: async ({ canvasElement, canvas }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    await expect(canvas.getByRole('meter')).toHaveAttribute('aria-valuenow', '95');
    const number = canvasElement.querySelector<HTMLElement>('[class*="number"]')!;
    if (!reduced) await expect(Number(number.textContent!.replace('%', ''))).toBeLessThan(95);
    await waitFor(() => expect(number.textContent).toBe('95%'), { timeout: 3000 });
    // 95% of 40 ticks = 38 lit; the target tick at 90% (tick 36) is drawn on its own
    await expect(litTicks(canvasElement)).toBe(37);
    await expect(canvasElement.querySelector('[class*="diff"]')).toBeNull();
  },
};

/** Reduced motion (matchMedia mocked to "reduce"): the score and its ticks at once. */
export const ReducedMotion: Story = {
  beforeEach: reduceMotion,
  render: () => (
    <Ground>
      <SystemHealth value={95} status="Healthy" passed="251 of 264 pass" />
    </Ground>
  ),
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[class*="number"]')).toHaveTextContent(/^95%$/);
    await expect(litTicks(canvasElement)).toBe(37);
  },
};
