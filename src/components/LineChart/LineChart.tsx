import React, { useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import DataTable, { type DataTableColumn } from '../DataTable/DataTable';
import Button from '../Button/Button';
import { useReducedMotion } from '../shared/useCountTo';
import styles from './LineChart.module.css';

export interface LineChartPoint {
  /** The point's name on the axis, in the callout and in the table ("Mon", "14:15"). */
  label: string;
  /** Its value. */
  value: number;
}

export interface LineChartProps {
  /** One point per step, left to right. Fewer than two points shows the empty state. */
  points: LineChartPoint[];
  /** What the chart is, for assistive tech and the table caption ("Audit score"). */
  label: string;
  /** Semantic colour of the line, area and scrubber: success, warning, danger, info, neutral or brand. Status colours keep their meaning on every page; the callout and summary carry the meaning in words. */
  tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';
  /** The soft gradient under the line, fading from the tone to nothing at the baseline. */
  area?: boolean;
  /** The unit after each value ("%", "ms", "runs"). */
  unit?: string;
  /** zero (default): the scale starts at zero. auto: the scale fits the data, for a chart about change; it must come with `baselineReason`, which is printed under the chart. */
  baseline?: 'zero' | 'auto';
  /** Why the scale does not start at zero ("Shows change in score, not the score"). Required with baseline="auto" and printed under the chart. */
  baselineReason?: string;
  /** Dashed thin gridlines (full variant). */
  grid?: boolean;
  /** The scrubber: hover, touch drag, and the arrow keys, Home and End move it; Escape clears it. Off = a plain line. */
  scrubber?: boolean;
  /** The callout above the scrubber (value, label and the change against the reference). */
  callout?: boolean;
  /** What the change in the callout is measured against: the previous point (default), or a number (a target or last week's value). */
  reference?: 'previous' | number;
  /** The picked point's index, or null for none. Controlled when set. */
  selectedIndex?: number | null;
  /** The picked point at the start, when uncontrolled. */
  defaultSelectedIndex?: number | null;
  /** Fires when the pick changes (hover, drag, keys, Escape). */
  onSelectedIndexChange?: (index: number | null) => void;
  /** Draw-in: the line draws left to right and the area fades in. map = 900ms (first draw), pick = 250ms (a refresh). none = at once. Replays when it changes. Reduced motion draws at once. */
  draw?: 'none' | 'map' | 'pick';
  /** full: axes, grid, scrubber and callout. compact: a sparkline for a stat card or drawer, with the line, the area and a dot on the last point, no axes, no grid, no scrubber. */
  variant?: 'full' | 'compact';
  /** The one-line summary under the chart, always present. Missing = written from the data. */
  summary?: string;
  /** chart or table; the table is the same data. Missing = held by the chart. */
  view?: 'chart' | 'table';
  onViewChange?: (view: 'chart' | 'table') => void;
  /** The "Show table" button. Off by default: the table is always there for screen readers, visually hidden. */
  showViewToggle?: boolean;
  className?: string;
  style?: CSSProperties;
}

const TONE_CLASS = { success: 'success', warning: 'warning', danger: 'danger', info: 'info', neutral: 'neutral', brand: 'brand' } as const;

function niceCeil(max: number) {
  if (max <= 0) return 1;
  const e = 10 ** Math.floor(Math.log10(max));
  const m = max / e;
  return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * e;
}

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : String(Math.round(v * 10) / 10));
const withUnit = (v: number, unit?: string) => (unit ? (unit === '%' ? `${fmt(v)}%` : `${fmt(v)} ${unit}`) : fmt(v));

/** One S between two points that leaves and arrives level: monotone, never overshoots. */
function smooth(pts: [number, number][]) {
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const mx = (x0 + x1) / 2;
    d += ` C ${mx} ${y0}, ${mx} ${y1}, ${x1} ${y1}`;
  }
  return d;
}

/**
 * A trend over time: a thin round-capped line over a soft gradient of its
 * tone, on dashed gridlines. Hover, touch drag or the arrow keys stand a
 * rounded scrubber on the line; above it a dark pill says the value, the
 * label and the change against the previous point (or a reference). The
 * pill's words are also spoken through a live region, and the same data is
 * in a visually hidden table. The scale starts at zero unless told why not.
 * The compact variant is a sparkline. Reduced motion shows the end state.
 */
export default function LineChart({
  points,
  label,
  tone = 'brand',
  area = true,
  unit,
  baseline = 'zero',
  baselineReason,
  grid = true,
  scrubber = true,
  callout = true,
  reference = 'previous',
  selectedIndex,
  defaultSelectedIndex = null,
  onSelectedIndexChange,
  draw = 'none',
  variant = 'full',
  summary,
  view: viewProp,
  onViewChange,
  showViewToggle = false,
  className,
  style,
}: LineChartProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const plotRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<number | null>(defaultSelectedIndex);
  const [viewState, setViewState] = useState<'chart' | 'table'>('chart');
  const compact = variant === 'compact';
  const n = points.length;
  const ready = n >= 2;
  const view = viewProp ?? viewState;
  const picked = selectedIndex !== undefined ? selectedIndex : sel;
  const interactive = scrubber && !compact && ready;

  const { lo, hi } = useMemo(() => {
    const vs = points.map((p) => p.value);
    const mx = Math.max(0, ...vs);
    const mn = Math.min(...vs);
    if (baseline === 'auto' && ready) {
      const pad = (mx - mn) * 0.15 || Math.abs(mx) * 0.1 || 1;
      return { lo: mn - pad, hi: mx + pad };
    }
    return { lo: Math.min(0, mn), hi: niceCeil(mx) };
  }, [points, baseline, ready]);

  const xOf = (i: number) => (n < 2 ? 50 : (i / (n - 1)) * 100);
  const yOf = (v: number) => 100 - ((v - lo) / (hi - lo || 1)) * 100;
  const xy = points.map((p, i) => [xOf(i), yOf(p.value)] as [number, number]);
  const line = ready ? smooth(xy) : '';
  const areaPath = ready ? `${line} L ${xy[n - 1][0]} 100 L ${xy[0][0]} 100 Z` : '';
  const gradId = `${uid}-grad`;

  const setPick = (i: number | null) => {
    const next = i == null ? null : Math.min(n - 1, Math.max(0, i));
    if (selectedIndex === undefined) setSel(next);
    if (next !== picked) onSelectedIndexChange?.(next);
  };

  const onPointer = (e: PointerEvent<HTMLDivElement>) => {
    const el = plotRef.current;
    if (!el || !interactive) return;
    const r = el.getBoundingClientRect();
    setPick(Math.round(((e.clientX - r.left) / r.width) * (n - 1)));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const at = picked ?? (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'End' ? n : -1);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setPick(picked == null ? 0 : at + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setPick(picked == null ? n - 1 : at - 1);
    else if (e.key === 'Home') setPick(0);
    else if (e.key === 'End') setPick(n - 1);
    else if (e.key === 'Escape') {
      if (picked == null) return;
      setPick(null);
    } else return;
    e.preventDefault();
  };

  const change = (i: number) => {
    const ref = reference === 'previous' ? (i > 0 ? points[i - 1].value : null) : reference;
    if (ref == null) return null;
    const diff = points[i].value - ref;
    const pct = ref !== 0 ? Math.round((diff / Math.abs(ref)) * 100) : null;
    const up = diff > 0;
    const flat = diff === 0;
    const mag = pct != null ? `${Math.abs(pct)}%` : fmt(Math.abs(diff));
    return { text: flat ? '0%' : `${up ? '+' : '−'}${mag}`, word: flat ? 'no change' : `${up ? 'up' : 'down'} ${mag}`, up, flat };
  };

  const shown = picked != null && picked >= 0 && picked < n ? picked : null;
  const ch = shown != null ? change(shown) : null;
  const against = reference === 'previous' ? 'the previous point' : `the reference of ${withUnit(reference, unit)}`;
  const spoken =
    shown != null
      ? `${points[shown].label}, ${withUnit(points[shown].value, unit)}${ch ? `, ${ch.word} on ${against}` : ''}`
      : '';
  const first = points[0];
  const last = points[n - 1];
  const written = !ready
    ? `${label}: not enough data to draw a trend`
    : `${label} went from ${withUnit(first.value, unit)} at ${first.label} to ${withUnit(last.value, unit)} at ${last.label}`;
  const summaryLine = summary ?? written;

  const columns: DataTableColumn<Record<string, any>>[] = [
    { key: 'label', label: 'Point' },
    { key: 'value', label: unit ? `Value (${unit})` : 'Value', numeric: true },
  ];
  const rows = points.map((p, i) => ({ id: String(i), label: p.label, value: p.value }));
  const axisEvery = Math.max(1, Math.ceil(n / 5));

  const side = shown == null ? 'mid' : xOf(shown) < 18 ? 'start' : xOf(shown) > 82 ? 'end' : 'mid';

  const table = (
    <table data-bella-chart-table="">
      <caption>{label}</caption>
      <thead>
        <tr>
          <th scope="col">Point</th>
          <th scope="col">{unit ? `Value (${unit})` : 'Value'}</th>
        </tr>
      </thead>
      <tbody>
        {points.map((p, i) => (
          <tr key={i}>
            <th scope="row">{p.label}</th>
            <td>{fmt(p.value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div
      className={[styles.root, styles[TONE_CLASS[tone]], compact ? styles.compact : '', className].filter(Boolean).join(' ')}
      style={style}
      role="group"
      aria-label={label}
      aria-describedby={`${uid}-summary`}
      data-bella-component="line-chart"
      data-variant={variant}
      data-tone={tone}
      data-motion={reduced ? 'still' : 'live'}
      data-draw={!reduced && draw !== 'none' ? draw : undefined}
      data-bella-reveal={draw !== 'none' ? '' : undefined}
    >
      {view === 'table' && !compact ? (
        <DataTable caption={label} columns={columns} rows={rows} rowKey="id" density="compact" />
      ) : (
        <>
          {!compact && callout ? (
            <div className={styles.room}>
              {shown != null ? (
                <div className={styles.pill} style={{ left: `calc(var(--inset) + (100% - var(--inset) * 2) * ${xOf(shown) / 100})` }} data-side={side} data-testid="line-chart-callout" aria-hidden="true">
                  {ch && !ch.flat ? <span className={styles.tri} data-dir={ch.up ? 'up' : 'down'} /> : null}
                  <span className={styles.pillNum}>{ch ? ch.text : withUnit(points[shown].value, unit)}</span>
                  <span className={styles.pillRest} data-bella-meta>
                    {ch ? `${withUnit(points[shown].value, unit)} · ` : ''}
                    {points[shown].label}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
          <div
            className={styles.plot}
            ref={plotRef}
            role={interactive ? 'slider' : 'img'}
            tabIndex={interactive ? 0 : undefined}
            aria-label={interactive ? `${label}, move through the points` : written}
            aria-orientation={interactive ? 'horizontal' : undefined}
            aria-valuemin={interactive ? 0 : undefined}
            aria-valuemax={interactive ? n - 1 : undefined}
            aria-valuenow={interactive ? (shown ?? 0) : undefined}
            aria-valuetext={interactive ? (spoken || 'No point picked') : undefined}
            onKeyDown={onKey}
            onPointerMove={interactive ? onPointer : undefined}
            onPointerDown={interactive ? onPointer : undefined}
            onPointerLeave={interactive ? (e) => { if (e.pointerType !== 'touch' && document.activeElement !== plotRef.current) setPick(null); } : undefined}
            onBlur={interactive ? () => setPick(null) : undefined}
            data-interactive={interactive ? '' : undefined}
          >
            {!compact && grid ? (
              <>
                <span className={styles.gridline} style={{ insetBlockStart: 0 }} aria-hidden="true" />
                <span className={styles.gridline} style={{ insetBlockStart: '50%' }} aria-hidden="true" />
              </>
            ) : null}
            {!compact ? <span className={styles.baseline} aria-hidden="true" /> : null}
            {ready ? (
              <div className={styles.inner}>
                <svg className={styles.svg} viewBox="0 0 100 100" preserveAspectRatio="none" data-bella-diagram="" role="img" aria-label={written}>
                  <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
                      <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {area ? <path className={styles.area} d={areaPath} fill={`url(#${gradId})`} stroke="none" /> : null}
                  <path className={styles.line} d={line} vectorEffect="non-scaling-stroke" />
                </svg>
                {shown != null ? (
                  <span
                    className={styles.scrub}
                    style={{ left: `${xOf(shown)}%`, insetBlockStart: `${yOf(points[shown].value)}%` }}
                    aria-hidden="true"
                    data-testid="line-chart-scrubber"
                  />
                ) : null}
                {compact ? <span className={styles.dot} style={{ left: `${xOf(n - 1)}%`, top: `${yOf(last.value)}%` }} aria-hidden="true" data-testid="line-chart-dot" /> : null}
              </div>
            ) : (
              <p className={styles.empty}>Not enough data to draw a trend</p>
            )}
            {!compact ? (
              <>
                <span className={styles.yLabel} style={{ insetBlockStart: 0 }} aria-hidden="true" data-bella-meta>{fmt(hi)}</span>
                <span className={styles.yLabel} style={{ insetBlockStart: '100%' }} aria-hidden="true" data-bella-meta>{fmt(lo)}</span>
              </>
            ) : null}
          </div>
          {!compact && ready ? (
            <div className={styles.xAxis} aria-hidden="true">
              {points.map((p, i) => (
                <span key={i} className={styles.xCell} style={{ left: `${xOf(i)}%` }}>
                  {i % axisEvery === 0 || i === n - 1 ? <span className={styles.xLabel} data-bella-meta>{p.label}</span> : null}
                </span>
              ))}
            </div>
          ) : null}
        </>
      )}
      {!compact && baseline === 'auto' && baselineReason ? (
        <p className={styles.note} data-bella-meta>
          Scale does not start at zero: {baselineReason}
        </p>
      ) : null}
      {!compact && showViewToggle ? (
        <div className={styles.foot}>
          <Button variant="tertiary" size="sm" ariaExpanded={view === 'table'} onClick={() => {
            const next = view === 'chart' ? 'table' : 'chart';
            setViewState(next);
            onViewChange?.(next);
          }}>
            {view === 'chart' ? 'Show table' : 'Show chart'}
          </Button>
        </div>
      ) : null}
      {!compact ? (
        <p id={`${uid}-summary`} className={styles.summary}>
          {summaryLine}
        </p>
      ) : (
        <span id={`${uid}-summary`} className={styles.srOnly}>{summaryLine}</span>
      )}
      <span className={styles.srOnly} role="status" aria-live="polite" data-testid="line-chart-live">{spoken}</span>
      <span className={styles.srOnly}>{table}</span>
    </div>
  );
}
