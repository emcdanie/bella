import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, waitFor } from 'storybook/test';
import BarChart, { type BarChartRange, type BarChartSlot } from './BarChart';
import cssRaw from './BarChart.module.css?raw';
import componentContract from '../../../tokens/contracts.json';
import { ComponentDocsPage } from '../../docs/DocBlocks';

const consumedTokens = Array.from(
  new Set((cssRaw.match(/var\((--[a-z0-9-]+)/g) ?? []).map((m) => m.slice('var('.length)))
).sort();

const contract = (componentContract as any).component?.['bar-chart']?.$extensions?.bella ?? {};

/* Figma sample: Gate runs on Fri 20 Nov, a quarter hour per slot, 23 passed and 7 failed of 30 */
const SPAN = (from: string, to: string) => `${from}-${to}`;
const QUARTERS: [string, string, number, number, string?][] = [
  ['11:45', '12:00', 3, 0],
  ['12:00', '12:15', 1, 0],
  ['12:15', '12:30', 2, 0],
  ['12:30', '12:45', 4, 0],
  ['12:45', '13:00', 2, 0],
  ['13:00', '13:15', 2, 0],
  ['13:15', '13:30', 2, 1, 'contracts'],
  ['13:30', '13:45', 1, 0],
  ['13:45', '14:00', 1, 0],
  ['14:00', '14:15', 0, 0],
  ['14:15', '14:30', 0, 3, 'contracts'],
  ['14:30', '14:45', 0, 3, 'contracts'],
  ['14:45', '15:00', 1, 0],
  ['15:00', '15:15', 3, 0],
  ['15:15', '15:30', 1, 0],
];
const DAY: BarChartSlot[] = QUARTERS.map(([from, to, passed, failed, cause]) => ({
  label: from,
  axisLabel: from.endsWith(':00') && from !== '11:45' ? from : '',
  range: SPAN(from, to),
  passed,
  failed,
  cause,
}));

const WEEK: BarChartSlot[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({
  label: d,
  passed: [18, 22, 15, 26, 23, 6, 3][i],
  failed: [2, 1, 4, 3, 7, 0, 0][i],
  cause: i === 4 ? 'contracts' : undefined,
}));

const Surface = ({ children }: { children: React.ReactNode }) => (
  <div style={{ padding: 'var(--spacing-24)', background: 'var(--color-background-subtle)', inlineSize: 'calc(var(--spacing-80) * 7)', maxInlineSize: '100%' }}>{children}</div>
);

const meta: Meta<typeof BarChart> = {
  title: 'Components/Data/BarChart',
  component: BarChart,
  parameters: {
    docs: { page: ComponentDocsPage },
    bellaDocs: { tokens: consumedTokens, a11y: contract.a11y },
  },
  argTypes: {
    slots: { control: false },
    view: { control: 'inline-radio' },
    range: { control: 'inline-radio' },
    className: { control: false },
    style: { control: false },
    onViewChange: { control: false },
    onRangeChange: { control: false },
  },
  args: {
    slots: DAY,
    title: 'Gate runs',
    label: 'Passed',
    unit: 'Commits',
    context: 'Fri 20 Nov · target 90%',
    failedLabel: 'Failed, contracts',
    summary: '7 of 30 runs failed today, 6 of them after 14:00',
  },
  render: (args) => (
    <Surface>
      <BarChart {...args} />
    </Surface>
  ),
};
export default meta;

type Story = StoryObj<typeof BarChart>;

const root = (el: HTMLElement) => el.querySelector('[data-bella-component="bar-chart"]') as HTMLElement;
const cells = (el: HTMLElement) => Array.from(el.querySelectorAll<HTMLElement>('[role="img"][aria-label*="runs"], [role="img"][aria-label*="run,"]'));

/** The Figma default: bars per quarter hour, failed runs red with a cross, the latest bar labelled. */
export const Default: Story = {
  play: async ({ canvasElement, step }) => {
    const card = root(canvasElement);
    await step('one bar per slot, 15', async () => {
      await expect(card.querySelectorAll('[data-bar]')).toHaveLength(15);
    });
    await step('failed runs carry a cross mark, in the bar and in the legend', async () => {
      const failed = card.querySelectorAll('[data-segment="failed"]');
      await expect(failed).toHaveLength(3);
      for (const f of Array.from(failed)) await expect(f.querySelector('svg')).not.toBeNull();
      await expect(card.querySelectorAll('li svg')).toHaveLength(1);
    });
    await step('the scale starts at a visible zero baseline, with 0, 2, 4 on the axis', async () => {
      const base = card.querySelector('[data-testid="bar-chart-baseline"]') as HTMLElement;
      await expect(getComputedStyle(base).height).toBe('1px');
      const ys = Array.from(card.querySelectorAll('[class*="yLabel"]')).map((e) => e.textContent);
      await expect(ys).toEqual(['4', '2', '0']);
    });
    await step('only the latest bar carries a value label', async () => {
      const labels = card.querySelectorAll('[class*="valueLabel"]');
      await expect(labels).toHaveLength(1);
      await expect(labels[0].textContent).toBe('1');
    });
    await step('the summary is the number in Geist Mono 600 with tabular figures', async () => {
      const v = card.querySelector('[class*="value"]') as HTMLElement;
      await expect(v).toHaveTextContent('23/30');
      await expect(getComputedStyle(v).fontWeight).toBe('600');
      await expect(getComputedStyle(v).fontVariantNumeric).toContain('tabular-nums');
    });
  },
};

/** The summary line is always there and describes the card; without one it is written from the data. */
export const SummaryFromData: Story = {
  args: { summary: undefined },
  play: async ({ canvasElement }) => {
    const card = root(canvasElement);
    await expect(card).toHaveAccessibleDescription('7 of 30 runs failed today');
    await expect(card).toHaveAccessibleName('Gate runs');
  },
};

/** Scrub: the arrow keys move a 1px guide through a bar, outline it and open the callout; Esc closes it. */
export const Scrub: Story = {
  play: async ({ canvasElement, step }) => {
    const card = root(canvasElement);
    const all = cells(card);
    await step('every slot is named and only one is a tab stop', async () => {
      await expect(all).toHaveLength(15);
      await expect(all[10]).toHaveAttribute('aria-label', '14:15-14:30, 3 runs, 3 failed, contracts');
      await expect(all.filter((c) => c.tabIndex === 0)).toHaveLength(1);
    });
    await step('an arrow key shows the guide and the callout above the plot', async () => {
      all[0].focus();
      await waitFor(() => expect(card.querySelector('[data-testid="bar-chart-callout"]')).not.toBeNull());
      await userEvent.keyboard('{ArrowRight}');
      await waitFor(() => expect(document.activeElement).toBe(all[1]));
      const callout = card.querySelector('[data-testid="bar-chart-callout"]') as HTMLElement;
      await expect(callout).toHaveTextContent('Passed');
      await expect(callout).toHaveTextContent('1');
      await expect(callout).toHaveTextContent('12:00-12:15');
      const guide = card.querySelector('[data-testid="bar-chart-guide"]') as HTMLElement;
      await expect(getComputedStyle(guide).width).toBe('1px');
    });
    await step('End and Home jump to the last and first bars; a failed bar says Failed and its cause', async () => {
      await userEvent.keyboard('{End}');
      await waitFor(() => expect(document.activeElement).toBe(all[14]));
      await userEvent.keyboard('{Home}');
      await waitFor(() => expect(document.activeElement).toBe(all[0]));
      all[10].focus();
      await waitFor(() => expect(card.querySelector('[data-testid="bar-chart-callout"]')).toHaveTextContent('Failed'));
      const callout = card.querySelector('[data-testid="bar-chart-callout"]') as HTMLElement;
      await expect(callout).toHaveTextContent('3');
      await expect(callout).toHaveTextContent('contracts');
    });
    await step('the picked bar is outlined and no other bar changes', async () => {
      const bars = Array.from(card.querySelectorAll<HTMLElement>('[data-bar]'));
      await expect(getComputedStyle(bars[10]).outlineStyle).toBe('solid');
      /* keyboard focus draws the 4 wide focus ring on the picked bar; the pointer pick draws the 2px ink outline (PointerScrub) */
      await expect(['2px', '4px']).toContain(getComputedStyle(bars[10]).outlineWidth);
      await expect(bars.filter((b, i) => i !== 10 && getComputedStyle(b).outlineStyle === 'solid')).toHaveLength(0);
      await expect(bars.every((b) => getComputedStyle(b).opacity === '1')).toBe(true);
    });
    await step('Esc closes the callout and the guide', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() => expect(card.querySelector('[data-testid="bar-chart-callout"]')).toBeNull());
      await expect(card.querySelector('[data-testid="bar-chart-guide"]')).toBeNull();
    });
  },
};

/** Pointer scrubbing: moving over the plot picks the nearest bar (the whole plot is the target, not the 18-wide bar). */
export const PointerScrub: Story = {
  play: async ({ canvasElement }) => {
    const card = root(canvasElement);
    const area = card.querySelector('[class*="area"]') as HTMLElement;
    const r = area.getBoundingClientRect();
    await fireEvent.pointerMove(area, { clientX: r.left + (r.width * 10.5) / 15, clientY: r.top + 20 });
    await waitFor(() => expect(card.querySelector('[data-testid="bar-chart-callout"]')).toHaveTextContent('14:15-14:30'));
    const picked = card.querySelectorAll<HTMLElement>('[data-bar]')[10];
    await expect(getComputedStyle(picked).outlineWidth).toBe('2px');
    await expect(getComputedStyle(picked).outlineStyle).toBe('solid');
    await fireEvent.pointerOut(area, { relatedTarget: document.body });
    await waitFor(() => expect(card.querySelector('[data-testid="bar-chart-callout"]')).toBeNull());
  },
};

/** view="table": a DataTable of the same data (Slot, Runs, Passed, Failed) and the summary line, from the control or the prop. */
export const TableView: Story = {
  args: { view: 'table', showViewToggle: false },
  play: async ({ canvasElement, step }) => {
    const card = root(canvasElement);
    await step('the table rows match the data', async () => {
      const rows = card.querySelectorAll('tbody tr');
      await expect(rows).toHaveLength(DAY.length);
      await expect(Array.from(card.querySelectorAll('thead th')).map((t) => t.textContent)).toEqual(['Slot', 'Runs', 'Passed', 'Failed']);
      const cellsOf = (i: number) => Array.from(rows[i].querySelectorAll('th, td')).map((c) => c.textContent);
      await expect(cellsOf(10)).toEqual(['14:15-14:30', '3', '0', '3']);
      await expect(cellsOf(0)).toEqual(['11:45-12:00', '3', '3', '0']);
    });
    await step('no chart is drawn, the summary stays', async () => {
      await expect(card.querySelector('[data-bar]')).toBeNull();
      await expect(card).toHaveAccessibleDescription('7 of 30 runs failed today, 6 of them after 14:00');
    });
  },
};

/** The way to the table for everyone: a button under the chart swaps chart and table. */
export const ShowTableControl: Story = {
  play: async ({ canvasElement }) => {
    const card = root(canvasElement);
    await userEvent.click(Array.from(card.querySelectorAll('button')).find((b) => (b.textContent ?? '').startsWith('Show table'))!);
    await waitFor(() => expect(card.querySelector('table')).not.toBeNull());
    await userEvent.click(Array.from(card.querySelectorAll('button')).find((b) => (b.textContent ?? '').startsWith('Show chart'))!);
    await waitFor(() => expect(card.querySelectorAll('[data-bar]')).toHaveLength(15));
  },
};

/** D, W, M, Y: a range pick passes the next slots, and the bars morph from their old heights (never from zero). */
export const RangeSwitch: Story = {
  render: (args) => {
    const [range, setRange] = useState<BarChartRange>('day');
    return (
      <Surface>
        <BarChart {...args} range={range} onRangeChange={setRange} slots={range === 'day' ? DAY : WEEK} summary={undefined} />
      </Surface>
    );
  },
  play: async ({ canvasElement, step }) => {
    const card = root(canvasElement);
    await step('the range control has four segments with names, the first selected', async () => {
      const seg = card.querySelector('[data-bella-component="segmented-control"]') as HTMLElement;
      const bs = Array.from(seg.querySelectorAll('button'));
      await expect(bs.map((b) => b.getAttribute('aria-label'))).toEqual(['Day', 'Week', 'Month', 'Year']);
      await expect(bs[0]).toHaveAttribute('aria-current', 'true');
    });
    await step('Week swaps the slots, the summary and the scale', async () => {
      await userEvent.click(card.querySelector('button[aria-label="Week"]')!);
      await waitFor(() => expect(card.querySelectorAll('[data-bar]')).toHaveLength(7));
      await expect(card).toHaveAccessibleDescription('17 of 130 runs failed this week');
    });
  },
};

/** Nothing measured in the range: the baseline stays, the empty state and summary say so. */
export const Empty: Story = {
  args: { slots: [], summary: undefined, context: undefined },
  play: async ({ canvasElement }) => {
    const card = root(canvasElement);
    await expect(card.querySelectorAll('[data-bar]')).toHaveLength(0);
    await expect(card.querySelector('[data-testid="bar-chart-baseline"]')).not.toBeNull();
    await expect(card).toHaveTextContent('No data in this range');
    await expect(card).toHaveAccessibleDescription('No runs today');
  },
};

/** Reduced motion: bars stand at their full height at once, no grow, no morph, no callout slide. */
const ReducedFrame = ({ children }: { children: React.ReactNode }) => {
  const original = useRef<typeof window.matchMedia | null>(null);
  if (original.current === null) {
    original.current = window.matchMedia;
    const real = original.current.bind(window);
    window.matchMedia = ((q: string) =>
      q.includes('prefers-reduced-motion') ? ({ ...real(q), matches: true, addEventListener() {}, removeEventListener() {} } as MediaQueryList) : real(q)) as typeof window.matchMedia;
  }
  useEffect(
    () => () => {
      if (original.current) window.matchMedia = original.current;
    },
    []
  );
  return <>{children}</>;
};

export const ReducedMotion: Story = {
  render: (args) => (
    <ReducedFrame>
      <Surface>
        <BarChart {...args} />
      </Surface>
    </ReducedFrame>
  ),
  play: async ({ canvasElement }) => {
    const card = root(canvasElement);
    await expect(card).toHaveAttribute('data-motion', 'still');
    const bar = card.querySelector('[data-bar]') as HTMLElement;
    await expect(getComputedStyle(bar).animationName).toBe('none');
    await expect(getComputedStyle(bar).transitionProperty === 'none' || getComputedStyle(bar).transitionDuration === '0s').toBe(true);
  },
};

/** With motion on, bars grow from the base. */
export const GrowsFromTheBase: Story = {
  play: async ({ canvasElement }) => {
    const card = root(canvasElement);
    const bar = card.querySelector('[data-bar]') as HTMLElement;
    await expect(card).toHaveAttribute('data-motion', 'live');
    await expect(getComputedStyle(bar).animationName).toContain('grow');
  },
};

/** 320 wide: a long unit goes under the number, nothing runs past the card (23 Nov). */
export const NarrowNumberRow: Story = {
  render: (args) => (
    <div style={{ inlineSize: '20rem', maxInlineSize: '100%', padding: 'var(--spacing-16)', background: 'var(--color-background-subtle)' }}>
      <BarChart {...args} unit="Commits this half hour" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const card = root(canvasElement);
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
    const number = card.querySelector('[class*="number"]') as HTMLElement;
    await expect(getComputedStyle(number).flexWrap).toBe('wrap');
    const unit = number.lastElementChild as HTMLElement;
    await expect(unit.getBoundingClientRect().right).toBeLessThanOrEqual(card.getBoundingClientRect().right);
  },
};

/** axisUnit prints what the axis counts once; an empty slot never prints a number over it. */
export const AxisUnitAndEmptySlot: Story = {
  args: { axisUnit: 'Runs per half hour', slots: [...DAY.slice(0, 14), { label: '15:15', range: '15:15-15:30', passed: 0, failed: 0 }] },
  render: (args) => (
    <Surface>
      <BarChart {...args} />
    </Surface>
  ),
  play: async ({ canvasElement }) => {
    const card = root(canvasElement);
    await expect(card.querySelectorAll('[data-testid="bar-chart-axis-unit"]')).toHaveLength(1);
    await expect(card.querySelector('[data-testid="bar-chart-axis-unit"]')).toHaveTextContent('Runs per half hour');
    /* the last slot is empty and is the latest: no "0" over it */
    const last = card.querySelectorAll('[data-bar]')[14] as HTMLElement;
    await expect(last.querySelector('[class*="valueLabel"]')).toBeNull();
  },
};

/** calloutText: the callout says what the caller words from the data. */
export const CalloutFromData: Story = {
  args: { calloutText: (s: BarChartSlot) => `${s.passed + s.failed} runs · ${s.failed} failed · ${s.passed} passed` },
  render: (args) => (
    <Surface>
      <BarChart {...args} />
    </Surface>
  ),
  play: async ({ canvasElement }) => {
    const card = root(canvasElement);
    const cells = card.querySelectorAll<HTMLElement>('[role="img"], [role="button"]');
    await userEvent.click(cells[10]);
    await expect(card.querySelector('[data-testid="bar-chart-callout-text"]')).toHaveTextContent('3 runs · 3 failed · 0 passed');
    await expect(cells[10].getAttribute('aria-label')).toContain('3 runs · 3 failed · 0 passed');
  },
};

/** onSlotSelect: slots with failures are buttons (click, Enter, Space) with a spoken action; the others stay plain. */
export const SlotsWithFailuresOpen: Story = {
  args: { onSlotSelect: fn() },
  render: (args) => (
    <Surface>
      <BarChart {...args} />
    </Surface>
  ),
  play: async ({ canvasElement, args }) => {
    const card = root(canvasElement);
    const buttons = card.querySelectorAll<HTMLElement>('[role="button"]');
    await expect(buttons).toHaveLength(3);
    await expect(card.querySelectorAll('[role="img"]').length).toBe(12);
    await expect(buttons[0].getAttribute('aria-label')).toContain('open what failed');
    await userEvent.click(buttons[1]);
    await expect(args.onSlotSelect).toHaveBeenCalledTimes(1);
    buttons[2].focus();
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onSlotSelect).toHaveBeenCalledTimes(3);
    const calls = (args.onSlotSelect as ReturnType<typeof fn>).mock.calls;
    await expect(calls[0][1]).toBe(10);
  },
};
