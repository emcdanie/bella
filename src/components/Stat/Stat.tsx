import React from 'react';
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
  /** Extra classes on the root. */
  className?: string;
}

const ARROW = { up: '▲', down: '▼' } as const;
const SPOKEN = { up: 'Up', down: 'Down' } as const;

/**
 * One figure with its label and an optional change. A term-description pair,
 * so the label names the figure for assistive tech.
 */
export default function Stat({ label, value, delta, trend, className }: StatProps) {
  return (
    <dl className={[styles.stat, className].filter(Boolean).join(' ')} data-bella-component="stat">
      <dt className={styles.label}>{label}</dt>
      <dd className={styles.value}>{value}</dd>
      {delta ? (
        <dd className={styles.delta}>
          {trend ? (
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
