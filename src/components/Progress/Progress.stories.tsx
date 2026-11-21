import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Button from '../Button/Button';
import Progress, { TargetMark } from './Progress';
import cssRaw from './Progress.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';
import reduceMotion from '../shared/reduceMotion';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.progress?.$extensions?.bella ?? {};

/** One surface; dark comes from the token modes, never a variant. The theme
 * toolbar picks the theme (audit:visual shoots all four). */
const Themed = ({ children }: { children: React.ReactNode }) => (
  <div
    style={{
      padding: 'var(--spacing-24)',
      background: 'var(--color-background-surface)',
      borderRadius: 'var(--border-radius-12)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(16rem, 1fr))',
      gap: 'var(--spacing-24)',
      alignItems: 'start',
    }}
  >
    {children}
  </div>
);

const meta: Meta<typeof Progress> = {
  title: 'Components/Data/Progress',
  component: Progress,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    shape: { control: 'inline-radio' },
    tone: { control: 'inline-radio' },
    fill: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    target: { control: { type: 'range', min: 0, max: 100, step: 5 } },
    className: { control: false },
    style: { control: false },
  },
  args: { label: 'Coverage', value: '60%', shape: 'bar', tone: 'info', fill: 60, target: 80, showTarget: true, showLabel: true, segments: 5, done: 3 },
};
export default meta;

type Story = StoryObj<typeof Progress>;

export const Playground: Story = {};

const TONES = ['info', 'success', 'attention', 'danger'] as const;

/** Bar in every tone with the target at 80, plus 0 (reads empty), 5 and 100. */
export const Bars: Story = {
  render: () => (
    <Themed>
      {TONES.map((tone) => (
        <Progress key={tone} label={`Bar · ${tone}`} value="60%" tone={tone} fill={60} target={80} showTarget />
      ))}
      <Progress label="At 0, empty" value="0%" tone="success" fill={0} target={90} showTarget />
      <Progress label="At 5" value="5%" tone="info" fill={5} />
      <Progress label="At 100" value="100%" tone="success" fill={100} target={100} showTarget />
      <Progress label="Label off" value="50%" tone="success" fill={50} showLabel={false} />
    </Themed>
  ),
};

/** Segments in every tone, 4 of 6 done; the gate as 5 of 5. */
export const Segments: Story = {
  render: () => (
    <Themed>
      {TONES.map((tone) => (
        <Progress key={tone} shape="segments" label={`Segments · ${tone}`} value="3 of 5" tone={tone} segments={5} done={3} />
      ))}
      <Progress shape="segments" label="The gate" value="5 of 5" tone="success" segments={5} done={5} />
      <Progress shape="segments" label="None yet" value="0 of 5" tone="info" segments={5} done={0} />
    </Themed>
  ),
};

/** Ring in every tone at 60, and at 0. */
export const Rings: Story = {
  render: () => (
    <Themed>
      {TONES.map((tone) => (
        <Progress key={tone} shape="ring" label={tone} value="60%" tone={tone} fill={60} />
      ))}
      <Progress shape="ring" label="At 0" value="0%" tone="info" fill={0} />
    </Themed>
  ),
};

/** The _Target mark on its own, as a legend key: "Target 90%". */
export const TargetLegend: Story = {
  render: () => (
    <Themed>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-8)', fontFamily: 'var(--typography-subtext-font-family)', color: 'var(--color-content-subtle)' }}>
        <TargetMark /> Target 90%
      </span>
    </Themed>
  ),
};

/** A progressbar with its amount; not a control. */
export const Behavior: Story = {
  render: () => <Progress label="Coverage" value="60%" fill={60} />,
  play: async ({ canvas, step }) => {
    await step('progressbar with value and name', async () => {
      const bar = canvas.getByRole('progressbar', { name: 'Coverage' });
      expect(bar).toHaveAttribute('aria-valuenow', '60');
      expect(bar).toHaveAttribute('aria-valuetext', '60%');
      expect(canvas.queryAllByRole('button')).toHaveLength(0);
    });
  },
};

function NewAmountDemo() {
  const [after, setAfter] = React.useState(false);
  const fill = after ? 93 : 80;
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', maxInlineSize: 'calc(var(--spacing-80) * 5)' }}>
      <Progress label="Stories" value={`${fill}%`} fill={fill} target={90} showTarget tone="success" />
      <Progress label="Docs" value={`${fill}%`} fill={fill} shape="ring" tone="info" />
      <Button variant="secondary" size="sm" onClick={() => setAfter((a) => !a)}>
        Check again
      </Button>
    </div>
  );
}

/** A new amount (rule "Motion that shows what happened", item 5): the bar and the ring move from 80
 * to 93, and on the bar the stretch gained shows once as a light band that fades (a loss is a dashed
 * outline). Nothing moves on first paint. Reduced motion: the new amount at once, no band. */
export const NewAmount: Story = {
  render: () => <NewAmountDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fill = () => canvasElement.querySelector('[data-bella-component="progress-fill"]') as HTMLElement;
    await step('first paint: no band', async () => {
      await expect(canvasElement.querySelector('[data-bella-change]')).toBeNull();
    });
    await step('a new amount: the bar says 93 and moves there', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Check again' }));
      await expect(canvas.getAllByRole('progressbar')[0]).toHaveAttribute('aria-valuenow', '93');
      await expect(parseFloat(getComputedStyle(fill()).transitionDuration)).toBe(reduced ? 0 : 0.45);
    });
    await step(reduced ? 'reduced motion: no band' : 'the gain shows once as a band', async () => {
      const band = canvasElement.querySelector('[data-bella-change]') as HTMLElement;
      if (reduced) {
        await expect(getComputedStyle(band).display).toBe('none');
        return;
      }
      await expect(band).toHaveAttribute('data-bella-change', 'gain');
      await expect(getComputedStyle(band).animationIterationCount).toBe('1');
      await waitFor(() => expect(Number(getComputedStyle(band).opacity)).toBe(0), { timeout: 3000 });
    });
  },
};

/** The tip of the callout: the Tooltip bubble inside the part's wrapper. */
const tipOf = (root: HTMLElement) => root.closest('[data-bella-component="tooltip"]')!.querySelector<HTMLElement>('[aria-hidden="true"][id]')!;

/** The chart callout (22 Nov, CHIP chart language): hover or keyboard focus on the bar shows BELLA's
 * Tooltip 16 under the track, pointing up, with the amount and the target. Draws in from the start of
 * the track on motion/duration/450, motion/easing/out; the target is there before the fill arrives. */
export const Callout: Story = {
  render: () => (
    <Themed>
      <Progress label="Stories" value="60%" fill={60} target={90} showTarget tone="success" drawIn callout />
      <Progress label="Checks" value="4 of 5" shape="segments" segments={5} done={4} tone="info" drawIn callout />
    </Themed>
  ),
  play: async ({ canvasElement, step }) => {
    const [bar, segs] = Array.from(canvasElement.querySelectorAll<HTMLElement>('[role="progressbar"]'));
    await step('final state: the fill reaches 60% of the track', async () => {
      const track = bar.querySelector<HTMLElement>('[data-bella-component="progress-fill"]')!.parentElement!;
      const fill = bar.querySelector<HTMLElement>('[data-bella-component="progress-fill"]')!;
      await waitFor(() => expect(Math.round((fill.getBoundingClientRect().width / track.getBoundingClientRect().width) * 100)).toBe(60), { timeout: 3000 });
    });
    await step('keyboard focus shows the Tooltip with the amount and the target, 16 under the track', async () => {
      await waitFor(() => expect(tipOf(bar)).not.toBeVisible());
      bar.focus();
      await waitFor(() => expect(tipOf(bar)).toBeVisible());
      await waitFor(() => expect(tipOf(bar)).toHaveTextContent('60% · target 90%'));
      const track = bar.querySelector<HTMLElement>('[data-bella-component="progress-fill"]')!.parentElement!;
      await expect(Math.round(tipOf(bar).getBoundingClientRect().top - track.getBoundingClientRect().bottom)).toBe(16);
      bar.blur();
      await waitFor(() => expect(tipOf(bar)).not.toBeVisible());
    });
    await step('segments: the callout says the count', async () => {
      await userEvent.hover(segs);
      await waitFor(() => expect(tipOf(segs)).toHaveTextContent('4 of 5'));
      await userEvent.unhover(segs);
    });
    await step('segments fill one after another, motion/stagger-120 apart', async () => {
      const s = segs.querySelectorAll<HTMLElement>('[data-bella-component="progress-segment"]');
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) return;
      await expect(parseFloat(getComputedStyle(s[2]).animationDelay)).toBeCloseTo(0.24, 2);
    });
  },
};

/** Reduced motion (matchMedia mocked to "reduce"): the end state at once, no draw-in, no slide; the
 * callout still shows. */
export const ReducedMotion: Story = {
  beforeEach: reduceMotion,
  render: () => (
    <Themed>
      <Progress label="Stories" value="60%" fill={60} target={90} showTarget tone="success" drawIn callout />
    </Themed>
  ),
  play: async ({ canvasElement }) => {
    const bar = canvasElement.querySelector<HTMLElement>('[role="progressbar"]')!;
    const fill = bar.querySelector<HTMLElement>('[data-bella-component="progress-fill"]')!;
    await expect(getComputedStyle(fill).animationName).toBe('none');
    await expect(parseFloat(getComputedStyle(fill).transitionDuration)).toBe(0);
    const track = fill.parentElement!;
    await expect(Math.round((fill.getBoundingClientRect().width / track.getBoundingClientRect().width) * 100)).toBe(60);
    bar.focus();
    await waitFor(() => expect(tipOf(bar)).toHaveTextContent('60% · target 90%'));
  },
};
