import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor } from 'storybook/test';
import Button from '../Button/Button';
import Stat from './Stat';
import statCssRaw from './Stat.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';
import SegmentedControl from '../SegmentedControl/SegmentedControl';
import reduceMotion from '../shared/reduceMotion';

const consumedTokens = Array.from(
  new Set((statCssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const statContract = (componentContract as any).component?.stat?.$extensions?.bella ?? {};

const meta: Meta<typeof Stat> = {
  title: 'Components/Data/Stat',
  component: Stat,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: statContract.a11y },
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'text' },
    delta: { control: 'text' },
    trend: { control: 'inline-radio', options: [undefined, 'up', 'down'] },
    series: { control: 'object' },
    seriesLabel: { control: 'text' },
    className: { control: false },
  },
  args: { label: 'Components', value: 18, delta: '2 since last sync', trend: 'up' },
};
export default meta;

type Story = StoryObj<typeof Stat>;

/** One figure with a change. */
export const Default: Story = {};

/** A row on the panel surface, the shape CHIP's health view uses. */
export const Row: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(calc(var(--spacing-80) * 2), 1fr))',
        gap: 'var(--spacing-24)',
        maxWidth: 720,
        padding: 'var(--spacing-24)',
        background: 'var(--color-background-surface)',
        borderRadius: 'var(--border-radius-12)',
      }}
    >
      <Stat label="Components" value={18} delta="2 since last sync" trend="up" />
      <Stat label="Failures" value={4} delta="3 fewer" trend="down" />
      <Stat label="Indexed" value="1,240" delta="chunks" />
      <Stat label="Last sync" value="09:12" />
    </div>
  ),
};

/** With history: a sparkline beside the change line. Shape and words carry
 * the trend; the line is ink, never a status colour. One point draws nothing. */
export const Trend: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(calc(var(--spacing-80) * 2.5), 1fr))',
        gap: 'var(--spacing-24)',
        maxWidth: 720,
        padding: 'var(--spacing-24)',
        background: 'var(--color-background-surface)',
        borderRadius: 'var(--border-radius-12)',
      }}
    >
      <Stat label="Components" value={24} delta="3 since last sync" trend="up" series={[18, 19, 19, 21, 21, 24]} seriesLabel="Components over 6 syncs: 18 to 24" />
      <Stat label="Story coverage" value="92%" delta="no change" series={[92, 92]} />
      <Stat label="Failures" value={2} delta="2 fewer" trend="down" series={[6, 5, 4, 4, 2]} />
      <Stat label="One point" value={7} delta="no history yet" series={[7]} />
    </div>
  ),
};

/** A term-description pair; the trend is spoken, the arrow is hidden. */
export const Behavior: Story = {
  render: () => <Stat label="Failures" value={4} delta="3 fewer" trend="down" />,
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector('[data-bella-component="stat"]') as HTMLElement;

    await step('the label is a dt naming the figure', async () => {
      expect(root.tagName).toBe('DL');
      expect(root.querySelector('dt')?.textContent).toBe('Failures');
      // the drawing (aria-hidden) and the words (read once) both say 4
      expect(root.querySelectorAll('dd')[0].querySelector('[aria-hidden="true"]')?.textContent).toBe('4');
      expect(root.querySelectorAll('dd')[0].querySelector('[class*="srOnly"]')?.textContent).toBe('4');
    });

    await step('direction is a hidden arrow plus a spoken word', async () => {
      const delta = root.querySelectorAll('dd')[1];
      expect(delta.querySelector('[aria-hidden="true"]')?.textContent?.trim()).toBe('↓');
      expect(delta.textContent).toContain('Down');
      expect(getComputedStyle(delta).color).toBe(getComputedStyle(root.querySelector('dt')!).color);
    });

    await step('fewer than two points draw no sparkline', async () => {
      expect(root.querySelector('svg')).toBeNull();
    });

    await step('the figure is tabular', async () => {
      const value = root.querySelector('dd') as HTMLElement;
      expect(getComputedStyle(value).fontVariantNumeric).toContain('tabular-nums');
    });
  },
};

/** The sparkline is one spoken sentence, drawn in ink. */
export const TrendBehavior: Story = {
  render: () => <Stat label="Components" value={24} delta="3 since last sync" trend="up" series={[18, 21, 24]} />,
  play: async ({ canvasElement, step }) => {
    const root = canvasElement.querySelector('[data-bella-component="stat"]') as HTMLElement;
    const svg = root.querySelector('svg') as SVGSVGElement;

    await step('the drawing is an image with a sentence for a name', async () => {
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'Components: 18 to 24 over 3 points');
    });

    await step('the line is ink, the same colour as the figure', async () => {
      const stroke = getComputedStyle(svg.querySelector('polyline')!).stroke;
      expect(stroke).toBe(getComputedStyle(root.querySelectorAll('dd')[0]).color);
    });

    await step('the change line still speaks the direction', async () => {
      expect(root.querySelectorAll('dd')[1].textContent).toContain('Up');
    });
  },
};

/** icon and measure (BellaComponents, 11 Nov 2026): a round icon well above
 * the label and an ink bar under the figure. The bar is named by measureLabel. */
export const IconAndMeasure: Story = {
  args: { icon: 'Activity', label: 'Coverage', value: '52%', delta: '4 since last sync', trend: 'up', measure: 0.52, measureLabel: 'Coverage: 52 of 100 stories' },
  play: async ({ canvas }) => {
    await expect(canvas.getByRole('img', { name: 'Coverage: 52 of 100 stories' })).toBeVisible();
  },
};

/** measured=false: no figure yet. The value says "Not measured"; no bar, no
 * sparkline, no arrow, so nothing implies a number that does not exist. */
export const NotMeasured: Story = {
  args: { icon: 'Activity', label: 'Trust', value: 18, delta: 'Waiting for the first sync', trend: 'up', series: [1, 2, 3], measure: 0.5, measured: false },
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('Not measured')).toBeVisible();
    await expect(canvas.queryByText('18')).toBeNull();
    await expect(canvasElement.querySelector('[role="img"]')).toBeNull();
    await expect(canvas.queryByText('Up')).toBeNull();
    // Figma measured=false (22 Nov): only the label and "Not measured"; the change line is dropped
    await expect(canvas.queryByText(/Waiting for the first sync/)).toBeNull();
  },
};

function ChangeDemo() {
  const [run, setRun] = React.useState(0);
  const fixed = [38, 41][run % 2];
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', justifyItems: 'start', padding: 'var(--spacing-24)' }}>
      <Stat label="Parts passing" value={fixed} measure={fixed / 44} measureLabel={`${fixed} of 44 parts pass`} delta="of 44" />
      <Stat label="Gate" value={run % 2 ? 'Passing' : 'Failing'} />
      <Button variant="secondary" size="sm" onClick={() => setRun((r) => r + 1)}>
        Check again
      </Button>
    </div>
  );
}

/** A new figure (rule "Motion that shows what happened", items 1 and 5): the number counts from 38
 * to 41 and "+3" shows once beside it; the bar moves with it; a changed word glows once. Nothing
 * moves on first paint. Reduced motion: the new value at once, no difference mark. */
export const NewValue: Story = {
  render: () => <ChangeDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const value = () => canvasElement.querySelector('[data-bella-component="stat"] dd') as HTMLElement;
    await step('first paint: 38, no difference mark', async () => {
      await expect(value().firstChild).toHaveTextContent(/^38$/);
    });
    await step('a new value counts up and lands on 41', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Check again' }));
      await waitFor(() => expect(value().firstChild?.textContent).toBe('41'), { timeout: 3000 });
    });
    await step(reduced ? 'reduced motion: no difference mark' : 'the difference shows once', async () => {
      const diff = value().querySelector('[class*="diff"]') as HTMLElement | null;
      if (reduced) {
        await expect(diff === null || getComputedStyle(diff).display === 'none').toBe(true);
        return;
      }
      await expect(diff).toHaveTextContent('+3');
      await expect(getComputedStyle(diff!).animationIterationCount).toBe('1');
    });
    await step('a changed word glows once', async () => {
      await expect(canvas.getByText('Passing')).toBeInTheDocument();
    });
  },
};

const WEEK = [18, 19, 19, 21, 21, 23, 24];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const tipOf = (svg: Element) => svg.closest('[data-bella-component="tooltip"]')!.querySelector<HTMLElement>('[aria-hidden="true"][id]')!;

/** Chart motion and the scrubber (22 Nov, CHIP chart language): the line draws left to right on
 * motion/duration/450, the end dot fades in after it. Pointer move, or the arrow keys once focused, move
 * a 1px guide from point to point and BELLA's Tooltip says that point's value and name; leaving hides it. */
export const Scrubber: Story = {
  render: () => (
    <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      <Stat label="Components" value={24} delta="3 since last sync" trend="up" series={WEEK} seriesLabels={DAYS} range="this week" />
    </div>
  ),
  play: async ({ canvasElement, step }) => {
    const svg = canvasElement.querySelector<SVGSVGElement>('svg[role="img"]')!;
    await step('final state: the whole line drawn, the end dot shown', async () => {
      await waitFor(() => expect(parseFloat(getComputedStyle(svg.querySelector('polyline')!).strokeDashoffset)).toBe(0), { timeout: 3000 });
      await waitFor(() => expect(Number(getComputedStyle(svg.querySelector('circle')!).opacity)).toBe(1), { timeout: 3000 });
      await expect(svg).toHaveAttribute('aria-label', 'Components: 18 to 24 over 7 points, this week');
    });
    await step('focus: the guide on the newest point, the Tooltip says its value and name', async () => {
      await waitFor(() => expect(tipOf(svg)).not.toBeVisible());
      svg.focus();
      await waitFor(() => expect(tipOf(svg)).toBeVisible());
      await waitFor(() => expect(tipOf(svg)).toHaveTextContent('24 · Sun'));
      await waitFor(() => expect(svg.querySelector('[data-bella-scrub]')).toHaveAttribute('data-bella-scrub', '6'));
    });
    await step('arrow keys move the guide point by point, and it is said', async () => {
      await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
      await waitFor(() => expect(tipOf(svg)).toHaveTextContent('21 · Fri'));
      await waitFor(() => expect(svg.querySelector('[data-bella-scrub]')).toHaveAttribute('data-bella-scrub', '4'));
      await waitFor(() => expect(canvasElement.querySelector('[aria-live="polite"]')).toHaveTextContent('21 · Fri'));
      await userEvent.keyboard('{Home}');
      await waitFor(() => expect(tipOf(svg)).toHaveTextContent('18 · Mon'));
    });
    await step('leaving hides the guide and the Tooltip', async () => {
      svg.blur();
      await waitFor(() => expect(tipOf(svg)).not.toBeVisible());
      await waitFor(() => expect(svg.querySelector('[data-bella-scrub]')).toBeNull());
    });
  },
};

const RANGES = {
  D: { words: 'today', series: [20, 22, 21, 24] },
  W: { words: 'this week', series: WEEK },
  M: { words: 'this month', series: [12, 14, 15, 18, 20, 24] },
  Y: { words: 'this year', series: [4, 9, 12, 24] },
} as const;

function RangeDemo() {
  const [range, setRange] = React.useState<keyof typeof RANGES>('W');
  const r = RANGES[range];
  return (
    <div style={{ display: 'grid', gap: 'var(--spacing-16)', justifyItems: 'start', padding: 'var(--spacing-24)', background: 'var(--color-background-surface)' }}>
      <SegmentedControl
        label="Range"
        value={range}
        onChange={(v: string) => setRange(v as keyof typeof RANGES)}
        options={(Object.keys(RANGES) as (keyof typeof RANGES)[]).map((k) => ({ value: k, label: k }))}
      />
      <Stat label="Components" value={24} delta={`up ${r.series[r.series.length - 1] - r.series[0]} ${r.words}`} trend="up" series={[...r.series]} range={r.words} />
    </div>
  );
}

/** D/W/M/Y, handled by the parent: a new range brings a new series, and the line morphs point by point
 * from the old one over motion/duration/450, never redrawn from zero. */
export const RangeSwitch: Story = {
  render: () => <RangeDemo />,
  play: async ({ canvasElement, canvas, step }) => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const line = () => canvasElement.querySelector<SVGPolylineElement>('svg[role="img"] polyline')!;
    // the first draw-in ends before the range changes
    await waitFor(() => expect(parseFloat(getComputedStyle(line()).strokeDashoffset)).toBe(0), { timeout: 3000 });
    const before = line().getAttribute('points');
    await step('a new range: the line moves from the old points, not from zero, and lands on the new ones', async () => {
      await userEvent.click(canvas.getByRole('button', { name: 'Y' }));
      const svg = canvasElement.querySelector('svg[role="img"]')!;
      await waitFor(() => expect(svg).toHaveAttribute('data-bella-range', 'this year'));
      // the line is never cut back to nothing: the draw-in does not replay
      await expect(parseFloat(getComputedStyle(line()).strokeDashoffset)).toBe(0);
      if (!reduced) await waitFor(() => expect(line().getAttribute('points')).not.toBe(before));
      // final: the four "this year" points, 2 to 78 across
      await waitFor(() => expect(line().getAttribute('points')).toBe('2.0,22.0 27.3,17.0 52.7,14.0 78.0,2.0'), { timeout: 3000 });
    });
  },
};

/** Reduced motion (matchMedia mocked to "reduce"): the line and dot drawn at once, a new range jumps. */
export const ReducedMotion: Story = {
  beforeEach: reduceMotion,
  render: () => <RangeDemo />,
  play: async ({ canvasElement, canvas }) => {
    const svg = canvasElement.querySelector<SVGSVGElement>('svg[role="img"]')!;
    await expect(getComputedStyle(svg.querySelector('polyline')!).animationName).toBe('none');
    await expect(getComputedStyle(svg.querySelector('circle')!).animationName).toBe('none');
    await userEvent.click(canvas.getByRole('button', { name: 'Y' }));
    await expect(svg.querySelector('polyline')).toHaveAttribute('points', '2.0,22.0 27.3,17.0 52.7,14.0 78.0,2.0');
  },
};
