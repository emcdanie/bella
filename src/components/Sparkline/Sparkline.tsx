import React, { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { bezier, reducedMotion, tokenMs, useReducedMotion } from '../shared/useCountTo';
import { EASING_POINTS } from '../EasingCurve/EasingCurve';
import Tooltip from '../Tooltip/Tooltip';
import styles from './Sparkline.module.css';

/* Sparkline (own part, 23 Nov 2026; AGENTS rule 2: a mark used in two parts is its own part first). Stat and StatCard
 * draw it: a 1px ink line and an end dot, a scrubber with a callout, a one-line summary and a table behind it.
 * Moved out of Stat unchanged; Stat's and StatCard's drawings are as before. */
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
export function sparkSummary(label: string, series: number[], names?: string[], range?: string) {
  const first = series[0];
  const last = series[series.length - 1];
  const lo = series.indexOf(Math.min(...series));
  const hi = series.indexOf(Math.max(...series));
  const name = (i: number) => (names?.[i] ? ` (${names[i]})` : '');
  const change = last > first ? `up ${last - first} from ${first} to ${last}` : last < first ? `down ${first - last} from ${first} to ${last}` : `level at ${last}`;
  return `${label}: ${change}${range ? ` ${range}` : ''}, low ${series[lo]}${name(lo)}, high ${series[hi]}${name(hi)}`;
}

export interface SparklineProps {
  /** The values, oldest first, ending with the current one. Two or more draw a line. */
  series: number[];
  /** One name per point, same order ("21 Nov"): the scrubber's callout says it after the value. */
  names?: string[];
  /** What the drawing is, spoken in place of the drawing. */
  label: string;
  /** The span the series covers, in words ("this week"). */
  range?: string;
  /** The one-line summary, read as the drawing's description and never drawn (sparkSummary writes one from the series). */
  summary: string;
  /** The points as a visually hidden table, one row per point. */
  table: boolean;
  /** The hidden table's caption. */
  caption: string;
}

/** The sparkline: the numbers as a mini trend line, with its scrubber, summary and table. series: oldest first. */
export default function Sparkline({
  series,
  names,
  label,
  range,
  summary,
  table,
  caption,
}: SparklineProps) {
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
          data-bella-component="sparkline"
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
