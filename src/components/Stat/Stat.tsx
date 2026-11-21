import React, { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import useCountTo, { bezier, formatDiff, reducedMotion, tokenMs, useReducedMotion } from '../shared/useCountTo';
import { EASING_POINTS } from '../EasingCurve/EasingCurve';
import Icon, { type IconName } from '../Icon/Icon';
import Tooltip from '../Tooltip/Tooltip';
import styles from './Stat.module.css';

export interface StatProps {
  /** What is counted, as a short Mono label. */
  label: string;
  /** The figure. Numbers set in tabular figures. */
  value: string | number;
  /** Change or context under the figure (`"2 since last sync"`). Plain text; the trend arrow is added for you. */
  delta?: string;
  /** Direction of the delta: an arrow plus a spoken word, never colour. Omit for a neutral note. */
  trend?: 'up' | 'down';
  /** Earlier values, oldest first, ending with the current one. Two or more draw a sparkline; fewer draw nothing. */
  series?: number[];
  /** What the sparkline says, spoken in place of the drawing. Defaults to "<label>: <first> to <last> over <n> points". */
  seriesLabel?: string;
  /** One name per point, same order as `series` ("Mon", "10:00"): the scrubber's callout says it after the value. */
  seriesLabels?: string[];
  /**
   * The sparkline's one-line summary (22 Nov reading: every chart has a summary and a table behind
   * it), read as its description (aria-describedby), never drawn. Missing: written from the series,
   * e.g. "Components: up 6 from 18 to 24, low 18 (Mon), high 24 (Sun)".
   */
  summary?: string;
  /** The sparkline's points as a visually hidden table (name and value per row, from `seriesLabels` and `series`). Default true. */
  table?: boolean;
  /**
   * The span the series covers, picked by the parent's D/W/M/Y control, in words ("this week"). Spoken
   * with the sparkline. A new range brings a new `series`; the line morphs point by point from the old
   * one over motion/duration/450, never redrawn from zero.
   */
  range?: string;
  /** An Iconoir glyph in a round well above the label (BellaComponents, 11 Nov 2026). Decorative. */
  icon?: IconName;
  /** How full the measure is, 0 to 1, drawn as a bar under the figure. Spoken with `measureLabel`. */
  measure?: number;
  /** What the bar says, spoken in place of the drawing. Defaults to "<label>: <n>%". */
  measureLabel?: string;
  /** False when there is no real figure yet: only the label and "Not measured" show; no bar, sparkline or change line. Never invent a figure. Default true. */
  measured?: boolean;
  /** Extra classes on the root. */
  className?: string;
}

/* Figma Delta row (22 Nov): a thin arrow in the meta face, 8 from the words */
const ARROW = { up: '↑', down: '↓' } as const;
// the drawing's own grid; CSS sizes it from the trend tokens, proportions kept
const W = 80;
const H = 24;
const PAD = 2;

type Pt = [number, number];

/* Scales start at zero (22 Nov reading) is for charts that compare amounts.
 * The sparkline is a mini trend line, not a comparison: it zooms to the
 * series' own low and high so a small change still shows as a slope in its
 * 24 px. Its numbers are in the summary, the hidden table and the callout,
 * so nothing is read off the height. Starting it at zero would flatten most
 * lines (a look change, which waits for Elleta). */
function toPoints(series: number[]): Pt[] {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  return series.map((v, i) => [
    PAD + (i * (W - PAD * 2)) / (series.length - 1),
    max === min ? H / 2 : H - PAD - ((v - min) * (H - PAD * 2)) / span,
  ]);
}

/** The old line laid onto n points, so a series of another length still morphs point by point. */
function resample(pts: Pt[], n: number): Pt[] {
  if (pts.length === n) return pts;
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : (i * (pts.length - 1)) / (n - 1);
    const a = pts[Math.floor(t)];
    const b = pts[Math.min(pts.length - 1, Math.ceil(t))];
    const f = t - Math.floor(t);
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
  });
}

/* Chart motion (22 Nov, CHIP chart language). First show: the line draws
 * left to right (stroke-dashoffset, motion/duration/450, motion/easing/out),
 * then the end dot fades in on motion/duration/150. A new series (a new
 * range): every point moves from the old line to the new one over 450,
 * never from zero. The scrubber: pointer move, or the arrow keys once
 * focused, moves a 1px guide (border/strong) from point to point, and
 * BELLA's Tooltip says that point's value and name; leaving hides both.
 * Reduced motion: the end state at once. */
/** The sparkline's one line, from its numbers: which way, from what to what, the low and the high. */
function sparkSummary(label: string, series: number[], names?: string[], range?: string) {
  const first = series[0];
  const last = series[series.length - 1];
  const lo = series.indexOf(Math.min(...series));
  const hi = series.indexOf(Math.max(...series));
  const name = (i: number) => (names?.[i] ? ` (${names[i]})` : '');
  const change = last > first ? `up ${last - first} from ${first} to ${last}` : last < first ? `down ${first - last} from ${first} to ${last}` : `level at ${last}`;
  return `${label}: ${change}${range ? ` ${range}` : ''}, low ${series[lo]}${name(lo)}, high ${series[hi]}${name(hi)}`;
}

function Sparkline({
  series,
  names,
  label,
  range,
  summary,
  table,
  caption,
}: {
  series: number[];
  names?: string[];
  label: string;
  range?: string;
  summary: string;
  table: boolean;
  caption: string;
}) {
  const still = useReducedMotion();
  const summaryId = useId();
  const target = useMemo(() => toPoints(series), [series.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps
  const [drawn, setDrawn] = useState<Pt[]>(target);
  const shownRef = useRef<Pt[]>(target);
  useEffect(() => {
    const from = resample(shownRef.current, target.length);
    const ms = tokenMs('--motion-duration-450');
    const same = from.every(([x, y], i) => x === target[i][0] && y === target[i][1]);
    if (same || still || reducedMotion() || ms === 0) {
      shownRef.current = target;
      setDrawn(target);
      return undefined;
    }
    const ease = bezier(EASING_POINTS.out);
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = reducedMotion() ? 1 : Math.min(1, (now - t0) / ms);
      const e = ease(p);
      const next: Pt[] = p === 1 ? target : from.map(([x, y], i) => [x + (target[i][0] - x) * e, y + (target[i][1] - y) * e]);
      shownRef.current = next;
      setDrawn(next);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, still]);

  /* the scrubber: null = not exploring; the callout then names the newest point */
  const [active, setActive] = useState<number | null>(null);
  const [spoken, setSpoken] = useState('');
  const last = series.length - 1;
  const at = active == null ? last : Math.min(active, last);
  const say = (i: number) => `${series[i]}${names?.[i] ? ` · ${names[i]}` : ''}`;
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = r.width ? (e.clientX - r.left) / r.width : 1;
    setActive(Math.max(0, Math.min(last, Math.round(f * last))));
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    /* Esc: BELLA's Tooltip hides the callout (WCAG 1.4.13); the guide goes with it */
    if (e.key === 'Escape') {
      setActive(null);
      setSpoken('');
      return;
    }
    const keys: Record<string, number> = { ArrowLeft: at - 1, ArrowRight: at + 1, Home: 0, End: last };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const i = Math.max(0, Math.min(last, keys[e.key]));
    setActive(i);
    setSpoken(say(i));
  };
  const leave = () => {
    setActive(null);
    setSpoken('');
  };
  const [lx, ly] = drawn[drawn.length - 1];
  const gx = drawn[Math.min(at, drawn.length - 1)][0];
  return (
    <>
      <Tooltip label={say(at)} placement="bottom">
        <svg
          className={[styles.spark, still ? styles.still : ''].filter(Boolean).join(' ')}
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={label}
          aria-describedby={summaryId}
          tabIndex={0}
          data-bella-diagram
          data-bella-range={range}
          onPointerMove={onMove}
          onPointerLeave={leave}
          onFocus={() => setActive(last)}
          onBlur={leave}
          onKeyDown={onKey}
        >
          <polyline pathLength={1} points={drawn.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} />
          <circle cx={lx} cy={ly} r={PAD} />
          {active != null ? <line className={styles.guide} x1={gx} x2={gx} y1={0} y2={H} data-bella-scrub={active} /> : null}
        </svg>
      </Tooltip>
      {/* the keyboard scrubber says each point once it moves there */}
      <span className={styles.srOnly} aria-live="polite">{spoken}</span>
      <span id={summaryId} className={styles.srOnly} data-bella-summary="">
        {summary}
      </span>
      {/* the table behind the chart: one row per point, never drawn */}
      {table ? (
        <span className={styles.srOnly}>
          <table data-bella-chart-table="">
            <caption>{caption}</caption>
            <thead>
              <tr>
                <th scope="col">Point</th>
                <th scope="col">Value</th>
              </tr>
            </thead>
            <tbody>
              {series.map((v, i) => (
                <tr key={i}>
                  <th scope="row">{names?.[i] ?? String(i + 1)}</th>
                  <td>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </span>
      ) : null}
    </>
  );
}
const SPOKEN = { up: 'Up', down: 'Down' } as const;

/**
 * One figure with its label and an optional change. A term-description pair,
 * so the label names the figure for assistive tech.
 */
export default function Stat({
  label,
  value,
  delta,
  trend,
  series,
  seriesLabel,
  seriesLabels,
  summary,
  table = true,
  range,
  icon,
  measure,
  measureLabel,
  measured = true,
  className,
}: StatProps) {
  /* A new figure (rule "Motion that shows what happened", items 1 and 5): a
   * number counts from the old value to the new one and its difference shows
   * once beside it; a word glows once in the change wash. Nothing moves on
   * first paint; reduced motion shows the new value at once. */
  const numeric = typeof value === 'number' ? value : NaN;
  const count = useCountTo(Number.isNaN(numeric) ? 0 : numeric);
  const firstWords = useRef(value);
  const wordsChanged = typeof value === 'string' && value !== firstWords.current;
  const spark = measured && series && series.length >= 2 ? series : null;
  const fill = measured && typeof measure === 'number' ? Math.min(1, Math.max(0, measure)) : null;
  return (
    <dl
      className={[styles.stat, className].filter(Boolean).join(' ')}
      data-bella-component="stat"
      data-measured={measured ? undefined : 'false'}
      data-bella-reveal={spark ? '' : undefined}
    >
      {icon ? (
        <span className={styles.iconWell} aria-hidden="true">
          <Icon name={icon} size="md" />
        </span>
      ) : null}
      <dt className={styles.label}>{label}</dt>
      <dd className={measured ? styles.value : styles.notMeasured}>
        {!measured ? (
          'Not measured'
        ) : typeof value === 'number' ? (
          <>
            {/* the drawing counts; assistive tech reads the final value only */}
            <span aria-hidden="true">{count.shown}</span>
            <span className={styles.srOnly}>{value}</span>
            {count.diff ? (
              <span key={count.changeKey} className={styles.diff} aria-hidden="true">
                {formatDiff(count.diff)}
              </span>
            ) : null}
          </>
        ) : wordsChanged ? (
          <span key={value} className={styles.glow}>
            {value}
          </span>
        ) : (
          value
        )}
      </dd>
      {fill !== null ? (
        <dd className={styles.measure}>
          <span
            className={styles.bar}
            role="img"
            aria-label={measureLabel ?? `${label}: ${Math.round(fill * 100)}%`}
          >
            <span className={styles.barFill} style={{ inlineSize: `${fill * 100}%` }} />
          </span>
        </dd>
      ) : null}
      {/* measured=false draws nothing with a number: no change line (Figma, 22 Nov) */}
      {measured && (delta || spark) ? (
        <dd className={styles.delta} data-bella-meta>
          {spark ? (
            <Sparkline
              series={spark}
              names={seriesLabels}
              range={range}
              label={seriesLabel ?? `${label}: ${spark[0]} to ${spark[spark.length - 1]} over ${spark.length} points${range ? `, ${range}` : ''}`}
              summary={summary ?? sparkSummary(label, spark, seriesLabels, range)}
              table={table}
              caption={`${label}${range ? `, ${range}` : ''}`}
            />
          ) : null}
          {delta && trend && measured ? (
            <>
              <span className={styles.arrow} aria-hidden="true">{ARROW[trend]}</span>
              <span className={styles.srOnly}>{SPOKEN[trend]} </span>
            </>
          ) : null}
          {delta}
        </dd>
      ) : null}
    </dl>
  );
}
