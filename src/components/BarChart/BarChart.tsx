import React, { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import Button from '../Button/Button';
import DataTable, { type DataTableColumn } from '../DataTable/DataTable';
import Icon from '../Icon/Icon';
import SegmentedControl from '../SegmentedControl/SegmentedControl';
import { useReducedMotion } from '../shared/useCountTo';
import styles from './BarChart.module.css';

export type BarChartRange = 'day' | 'week' | 'month' | 'year';

export interface BarChartSlot {
  /** The slot's time or name ("14:15"): on the axis and in the table when `range` is missing. */
  label: string;
  /** Runs that passed in this slot (the green bar, at the base). */
  passed: number;
  /** Runs that failed in this slot (the red bar on top, with its cross mark). */
  failed: number;
  /** The slot's full span ("14:15-14:30"): the callout and the accessible name. Missing = `label`. */
  range?: string;
  /** The axis label under this slot ("12:00", on the hour). If any slot sets one, only those slots label the axis; if none does, every few slots shows its `label`. */
  axisLabel?: string;
  /** What failed ("contracts"): in the callout and the accessible name when this slot has failures. */
  cause?: string;
}

export interface BarChartProps {
  /** One slot per bar, left to right (a quarter hour per slot on the day range). Empty = the empty state. */
  slots: BarChartSlot[];
  /** The card's title (Figma Title). */
  title?: string;
  /** Figma "view". chart draws the bars; table swaps them for a DataTable of the same data. Missing = held by the chart. */
  view?: 'chart' | 'table';
  onViewChange?: (view: 'chart' | 'table') => void;
  /** Figma "Show table" control (the way to the table for keyboards and screen readers). Off hides it. */
  showViewToggle?: boolean;
  /** The range shown; D, W, M, Y. Missing = held by the chart, starting at `defaultRange`. */
  range?: BarChartRange;
  defaultRange?: BarChartRange;
  /** Fires on a range pick: the consumer then passes that range's slots; the bars morph from the old heights to the new. */
  onRangeChange?: (range: BarChartRange) => void;
  /** Figma "Label" of the summary block, a small-caps eyebrow. */
  label?: string;
  /** Figma "Unit" beside the number ("Commits"), small caps. */
  unit?: string;
  /** Figma "Context": one meta line under the number ("Fri 20 Nov · target 90%"). */
  context?: string;
  /** The words after "Failed" in the legend and the callout ("Failed, contracts"). Missing = "Failed". */
  failedLabel?: string;
  /** Figma "Summary": the one line under the chart, always present. Missing = written from the data ("7 of 30 runs failed today"). */
  summary?: string;
  /** Extra classes on the card. */
  className?: string;
  style?: CSSProperties;
}

const RANGES: { value: BarChartRange; label: string; ariaLabel: string; word: string }[] = [
  { value: 'day', label: 'D', ariaLabel: 'Day', word: 'today' },
  { value: 'week', label: 'W', ariaLabel: 'Week', word: 'this week' },
  { value: 'month', label: 'M', ariaLabel: 'Month', word: 'this month' },
  { value: 'year', label: 'Y', ariaLabel: 'Year', word: 'this year' },
];

/** The top of the scale: two even intervals (0, half, top) on a round step. */
function niceTop(max: number) {
  if (max <= 0) return 4;
  const half = Math.ceil(max / 2);
  const steps = [1, 2, 5];
  for (let pow = 1; ; pow *= 10) {
    for (const s of steps) if (s * pow >= half) return s * pow * 2;
  }
}

/* the cross mark: a 12 glyph (a 16 box is wider than the 18 bar leaves room for), drawn bolder so it reads on red */
const CROSS: CSSProperties = { width: 'var(--size-12)', height: 'var(--size-12)', strokeWidth: 3 };

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/**
 * Runs over time: one rounded bar per slot from a visible zero, passes in
 * green and failures in red on top with a cross mark, so a failure is found
 * at a glance and never by colour alone. Hover, touch or the arrow keys pick
 * a bar: a thin guide runs through it, it gets an outline (the others stay as
 * they are) and a callout above the plot says its value. Every chart has a
 * table and a one-line summary behind it. Bars grow from the base and morph
 * between ranges; reduced motion shows the end state at once.
 */
export default function BarChart({
  slots,
  title = 'Gate runs',
  view: viewProp,
  onViewChange,
  showViewToggle = true,
  range: rangeProp,
  defaultRange = 'day',
  onRangeChange,
  label = 'Passed',
  unit = 'Commits',
  context,
  failedLabel = 'Failed',
  summary,
  className,
  style,
}: BarChartProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const [viewState, setViewState] = useState<'chart' | 'table'>('chart');
  const [rangeState, setRangeState] = useState<BarChartRange>(defaultRange);
  const [picked, setPicked] = useState<number | null>(null);
  const [tabIdx, setTabIdx] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(HTMLDivElement | null)[]>([]);

  const view = viewProp ?? viewState;
  const range = rangeProp ?? rangeState;
  const n = slots.length;
  const runs = (s: BarChartSlot) => s.passed + s.failed;
  const totals = useMemo(() => {
    const passed = slots.reduce((a, s) => a + s.passed, 0);
    const failed = slots.reduce((a, s) => a + s.failed, 0);
    return { passed, failed, runs: passed + failed };
  }, [slots]);
  const top = niceTop(Math.max(0, ...slots.map(runs)));
  const empty = n === 0 || totals.runs === 0;
  const rangeWord = RANGES.find((r) => r.value === range)?.word ?? 'today';
  const line =
    summary ??
    (totals.runs === 0
      ? `No runs ${rangeWord}`
      : `${totals.failed} of ${totals.runs} runs failed ${rangeWord}`);
  const axisEvery = Math.max(1, Math.ceil(n / 5));
  const hasTicks = slots.some((s) => s.axisLabel !== undefined);
  const tickOf = (s: BarChartSlot, i: number) => (hasTicks ? s.axisLabel : i % axisEvery === 0 ? s.label : undefined);
  const failedWord = failedLabel;
  const cause = (s: BarChartSlot) => (s.failed > 0 && s.cause ? `, ${s.cause}` : '');
  const nameOf = (s: BarChartSlot) =>
    `${s.range ?? s.label}, ${plural(runs(s), 'run', 'runs')}, ${s.failed} failed${cause(s)}`;

  const pick = (i: number | null) => setPicked(i == null ? null : Math.min(n - 1, Math.max(0, i)));

  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    const el = areaRef.current;
    if (!el || n === 0) return;
    const r = el.getBoundingClientRect();
    const i = Math.floor(((e.clientX - r.left) / r.width) * n);
    pick(i);
    setTabIdx(Math.min(n - 1, Math.max(0, i)));
  };

  const focusCell = (i: number) => {
    const next = Math.min(n - 1, Math.max(0, i));
    setTabIdx(next);
    setPicked(next);
    cellRefs.current[next]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (n === 0) return;
    const from = tabIdx;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') focusCell(from + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') focusCell(from - 1);
    else if (e.key === 'Home') focusCell(0);
    else if (e.key === 'End') focusCell(n - 1);
    else if (e.key === 'Escape') {
      if (picked == null) return;
      setPicked(null);
    } else return;
    e.preventDefault();
  };

  const setRange = (value: string) => {
    const next = value as BarChartRange;
    setRangeState(next);
    setPicked(null);
    onRangeChange?.(next);
  };
  const setView = (next: 'chart' | 'table') => {
    setViewState(next);
    onViewChange?.(next);
  };

  const columns: DataTableColumn<Record<string, any>>[] = [
    { key: 'slot', label: 'Slot' },
    { key: 'runs', label: 'Runs', numeric: true },
    { key: 'passed', label: 'Passed', numeric: true },
    { key: 'failed', label: 'Failed', numeric: true },
  ];
  const rows = slots.map((s, i) => ({ id: String(i), slot: s.range ?? s.label, runs: runs(s), passed: s.passed, failed: s.failed }));

  const sel = picked != null ? slots[picked] : null;
  const guide = picked != null && n > 0 ? ((picked + 0.5) / n) * 100 : 0;
  const calloutLeft = picked != null && picked + 0.5 > n / 2;
  const calloutFailed = sel ? sel.failed > 0 : false;

  return (
    <section
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={style}
      role="group"
      aria-labelledby={`${uid}-title`}
      aria-describedby={`${uid}-summary`}
      data-bella-component="bar-chart"
      data-view={view}
      data-motion={reduced ? 'still' : 'live'}
    >
      <h3 id={`${uid}-title`} className={styles.title}>
        {title}
      </h3>
      <SegmentedControl
        stretch
        label="Range"
        value={range}
        onChange={setRange}
        options={RANGES.map((r) => ({ value: r.value, label: r.label, ariaLabel: r.ariaLabel }))}
      />
      <div className={styles.summary}>
        <p className={styles.eyebrow} data-bella-meta>
          {label}
        </p>
        <p className={styles.number}>
          <span className={styles.value}>
            {totals.passed}/{totals.runs}
          </span>
          <span className={styles.unit}>{unit}</span>
        </p>
        {context != null ? (
          <p className={styles.context} data-bella-meta>
            {context}
          </p>
        ) : null}
      </div>

      {view === 'table' ? (
        <DataTable caption={`${title} by slot`} columns={columns} rows={rows} rowKey="id" density="compact" />
      ) : (
        <div className={styles.plot}>
          <div className={styles.main}>
            <div className={styles.stack}>
              <div className={styles.room}>
                {sel ? (
                  <div
                    className={styles.callout}
                    style={{ '--guide': `${guide}%` } as CSSProperties}
                    data-side={calloutLeft ? 'left' : 'right'}
                    data-testid="bar-chart-callout"
                    aria-hidden="true"
                  >
                    <span className={styles.calloutStatus} data-bella-meta>
                      {calloutFailed ? failedWord.split(',')[0] : 'Passed'}
                    </span>
                    <span className={styles.calloutNumber}>
                      <span className={styles.calloutValue}>{calloutFailed ? sel.failed : sel.passed}</span>
                      <span className={styles.calloutUnit}>{unit}</span>
                    </span>
                    <span className={styles.calloutContext} data-bella-meta>
                      {[sel.range ?? sel.label, calloutFailed ? sel.cause : undefined].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                ) : null}
              </div>
              <div
                className={styles.area}
                ref={areaRef}
                onPointerMove={onPointer}
                onPointerDown={onPointer}
                onPointerLeave={(e) => {
                  if (e.pointerType === 'touch') return;
                  const focused = cellRefs.current.some((c) => c && c === document.activeElement);
                  setPicked(focused ? tabIdx : null);
                }}
              >
                <span className={styles.gridline} style={{ insetBlockStart: 0 }} aria-hidden="true" />
                <span className={styles.gridline} style={{ insetBlockStart: '50%' }} aria-hidden="true" />
                <span className={styles.baseline} aria-hidden="true" data-testid="bar-chart-baseline" />
                {empty ? <p className={styles.emptyText}>{totals.runs === 0 && n > 0 ? 'No runs in this range' : 'No data in this range'}</p> : null}
                <div className={styles.cells} role="group" aria-label={`${title}, by slot`} onKeyDown={onKey}>
                  {slots.map((s, i) => {
                    const total = runs(s);
                    const latest = i === n - 1;
                    const isPicked = picked === i;
                    return (
                      <div
                        key={i}
                        ref={(el) => {
                          cellRefs.current[i] = el;
                        }}
                        className={styles.cell}
                        role="img"
                        tabIndex={tabIdx === i ? 0 : -1}
                        aria-label={nameOf(s)}
                        data-picked={isPicked ? '' : undefined}
                        onFocus={() => {
                          setTabIdx(i);
                          setPicked(i);
                        }}
                        onBlur={(e) => {
                          if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) setPicked(null);
                        }}
                      >
                        <span className={styles.bar} style={{ blockSize: `${(total / top) * 100}%` }} data-bar="">
                          {s.passed > 0 ? <span className={styles.passed} style={{ flex: `${s.passed} 1 0` }} data-segment="passed" /> : null}
                          {s.failed > 0 ? (
                            <span className={styles.failed} style={{ flex: `${s.failed} 1 0` }} data-segment="failed">
                              <Icon name="Xmark" size="sm" className={styles.cross} style={CROSS} />
                            </span>
                          ) : null}
                          {isPicked || (latest && picked == null) ? (
                            <span className={styles.valueLabel} data-bella-meta>
                              {total}
                            </span>
                          ) : null}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {picked != null && n > 0 ? (
                  <span className={styles.guide} style={{ left: `${guide}%` }} aria-hidden="true" data-testid="bar-chart-guide" />
                ) : null}
              </div>
            </div>
            <div className={styles.xAxis} aria-hidden="true">
              {slots.map((s, i) => (
                <span key={i} className={styles.xCell}>
                  {tickOf(s, i) ? <span className={styles.xLabel} data-bella-meta>{tickOf(s, i)}</span> : null}
                </span>
              ))}
            </div>
          </div>
          <div className={styles.yAxis} aria-hidden="true">
            <span className={styles.yLabel} style={{ insetBlockStart: 0 }} data-bella-meta>{top}</span>
            <span className={styles.yLabel} style={{ insetBlockStart: '50%' }} data-bella-meta>{top / 2}</span>
            <span className={styles.yLabel} style={{ insetBlockStart: '100%' }} data-bella-meta>0</span>
          </div>
        </div>
      )}

      {view === 'chart' || showViewToggle ? (
        <div className={styles.foot}>
          {view === 'chart' ? (
            <ul className={styles.legend}>
              <li className={styles.key}>
                <span className={[styles.keyMark, styles.keyPassed].join(' ')} aria-hidden="true" />
                Passed
              </li>
              <li className={styles.key}>
                <span className={[styles.keyMark, styles.keyFailed].join(' ')} aria-hidden="true">
                  <Icon name="Xmark" size="sm" className={styles.cross} style={CROSS} />
                </span>
                {failedWord}
              </li>
            </ul>
          ) : (
            <span />
          )}
          {showViewToggle ? (
            <Button variant="tertiary" size="sm" onClick={() => setView(view === 'chart' ? 'table' : 'chart')} ariaExpanded={view === 'table'}>
              {view === 'chart' ? 'Show table' : 'Show chart'}
            </Button>
          ) : null}
        </div>
      ) : null}
      <p id={`${uid}-summary`} className={styles.summaryLine}>
        {line}
      </p>
    </section>
  );
}
