import React from 'react';
import Icon, { type IconName } from '../Icon/Icon';
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
  /** An Iconoir glyph in a round well above the label (BellaComponents, 11 Nov 2026). Decorative. */
  icon?: IconName;
  /** How full the measure is, 0 to 1, drawn as a bar under the figure. Spoken with `measureLabel`. */
  measure?: number;
  /** What the bar says, spoken in place of the drawing. Defaults to "<label>: <n>%". */
  measureLabel?: string;
  /** False when there is no real figure yet: the value reads "Not measured" and no sparkline or bar is drawn. Never invent a figure. Default true. */
  measured?: boolean;
  /** Extra classes on the root. */
  className?: string;
}

const ARROW = { up: '▲', down: '▼' } as const;
// the drawing's own grid; CSS sizes it from the trend tokens, proportions kept
const W = 80;
const H = 24;
const PAD = 2;

function Sparkline({ series, label }: { series: number[]; label: string }) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  const pts = series.map((v, i) => [
    PAD + (i * (W - PAD * 2)) / (series.length - 1),
    max === min ? H / 2 : H - PAD - ((v - min) * (H - PAD * 2)) / span,
  ]);
  const [lx, ly] = pts[pts.length - 1];
  return (
    <svg className={styles.spark} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} data-bella-diagram>
      <polyline points={pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')} />
      <circle cx={lx} cy={ly} r={PAD} />
    </svg>
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
  icon,
  measure,
  measureLabel,
  measured = true,
  className,
}: StatProps) {
  const spark = measured && series && series.length >= 2 ? series : null;
  const fill = measured && typeof measure === 'number' ? Math.min(1, Math.max(0, measure)) : null;
  return (
    <dl
      className={[styles.stat, className].filter(Boolean).join(' ')}
      data-bella-component="stat"
      data-measured={measured ? undefined : 'false'}
    >
      {icon ? (
        <span className={styles.iconWell} aria-hidden="true">
          <Icon name={icon} size="md" />
        </span>
      ) : null}
      <dt className={styles.label}>{label}</dt>
      <dd className={measured ? styles.value : styles.notMeasured}>{measured ? value : 'Not measured'}</dd>
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
      {delta || spark ? (
        <dd className={styles.delta}>
          {spark ? (
            <Sparkline
              series={spark}
              label={seriesLabel ?? `${label}: ${spark[0]} to ${spark[spark.length - 1]} over ${spark.length} points`}
            />
          ) : null}
          {delta && trend && measured ? (
            <>
              <span aria-hidden="true">{ARROW[trend]} </span>
              <span className={styles.srOnly}>{SPOKEN[trend]} </span>
            </>
          ) : null}
          {delta}
        </dd>
      ) : null}
    </dl>
  );
}
