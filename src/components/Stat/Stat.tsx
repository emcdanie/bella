import React, { useRef } from 'react';
import useCountTo, { formatDiff } from '../shared/useCountTo';
import Icon, { type IconName } from '../Icon/Icon';
import Sparkline, { sparkSummary } from '../Sparkline/Sparkline';
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
  /**
   * `"display"` is the presenting size (deck plan, 23 Nov 2026): the figure in Geist Mono Bold 88 for a
   * slide read from the back of a room. Default `"default"` is the 40 card figure. The label, change
   * line and sparkline keep their sizes; the 16 floor is untouched.
   */
  size?: 'default' | 'display';
  /** Extra classes on the root. */
  className?: string;
}

/* Figma Delta row (22 Nov): a thin arrow in the meta face, 8 from the words */
const ARROW = { up: '↑', down: '↓' } as const;
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
  size = 'default',
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
      className={[styles.stat, size === 'display' ? styles.display : '', className].filter(Boolean).join(' ')}
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
