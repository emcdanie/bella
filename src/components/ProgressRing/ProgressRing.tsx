import React, { useEffect, useId, useState, type CSSProperties } from 'react';
import Icon from '../Icon/Icon';
import { useReducedMotion } from '../shared/useCountTo';
import styles from './ProgressRing.module.css';

export type ProgressRingState = 'running' | 'done' | 'waiting' | 'failed';

const WORD: Record<ProgressRingState, string> = { running: 'Running', done: 'Done', waiting: 'Waiting', failed: 'Failed' };

export interface ProgressRingProps {
  /** Figma "state". running = a turning blue arc; done = a filled green circle with a tick; waiting = a grey ring (also paused); failed = a filled red circle with a cross. */
  state?: ProgressRingState;
  /** Figma "size". sm 20 (a check item, a card's step row); md 36 (a header count, Step's marker). */
  size?: 'sm' | 'md';
  /** running, determinate: steps done. With `total` the arc is value / total and md shows "n/m". Missing = indeterminate (a half arc turning). */
  value?: number;
  /** running, determinate: steps in all. */
  total?: number;
  /** Figma "Show count" (md, running, determinate). Off hides "n/m"; the accessible name still says it. */
  showCount?: boolean;
  /** Indeterminate only: seconds the arc may turn (default 2.5, under the 3 s rule). After that it settles to a still half arc and says "still working". */
  duration?: number;
  /** What the ring is for, put first in its accessible name ("Code, running, 2 of 5"). */
  label?: string;
  /** The words beside it already say the state: hide the ring from screen readers. */
  decorative?: boolean;
  /** Extra classes on the root. */
  className?: string;
  style?: CSSProperties;
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * The one small circle that says where a step or job is. Running turns for
 * under 3 s and then holds still; a job that knows its steps draws the arc
 * as n/m. Reduced motion: a still arc. Not interactive.
 */
export default function ProgressRing({
  state = 'running',
  size = 'sm',
  value,
  total,
  showCount = true,
  duration = 2.5,
  label,
  decorative = false,
  className,
  style,
}: ProgressRingProps) {
  const descId = useId();
  const reduced = useReducedMotion();
  const [timedOut, setTimedOut] = useState(false);
  const determinate = state === 'running' && value != null && total != null && total > 0;
  const indeterminate = state === 'running' && !determinate;

  /* Indeterminate motion lives under 3 s: past `duration` the arc stops and the ring says it is still working. */
  useEffect(() => {
    setTimedOut(false);
    if (!indeterminate || reduced) return undefined;
    const t = setTimeout(() => setTimedOut(true), duration * 1000);
    return () => clearTimeout(t);
  }, [indeterminate, reduced, duration]);
  const settled = indeterminate && (timedOut || reduced);

  const now = determinate ? Math.min(total!, Math.max(0, value!)) : 0;
  const pct = determinate ? clamp((now / total!) * 100) : 50;
  const amount = determinate ? `${now} of ${total}` : undefined;
  const name = [label, WORD[state], amount].filter(Boolean).join(', ');

  const a11y = decorative
    ? ({ 'aria-hidden': true } as const)
    : determinate
      ? ({
          role: 'progressbar',
          'aria-label': name,
          'aria-valuemin': 0,
          'aria-valuemax': total,
          'aria-valuenow': now,
          'aria-valuetext': name,
        } as const)
      : ({ role: 'img', 'aria-label': name, 'aria-describedby': settled ? descId : undefined } as const);

  const filled = state === 'done' || state === 'failed';
  const cls = [styles.root, styles[size], styles[state], className].filter(Boolean).join(' ');
  return (
    <span
      className={cls}
      style={style}
      data-bella-component="progress-ring"
      data-state={state}
      data-size={size}
      data-motion={indeterminate ? (settled ? 'still' : 'turning') : undefined}
      {...a11y}
    >
      {filled ? (
        <Icon name={state === 'done' ? 'Check' : 'Xmark'} size={size === 'md' ? 'md' : 'sm'} />
      ) : (
        <>
          <span className={styles.track} aria-hidden="true" />
          {state === 'running' ? (
            <span
              className={[styles.arc, indeterminate && !settled ? styles.turning : ''].filter(Boolean).join(' ')}
              style={{ '--ring-fill': `${pct}%`, '--ring-turn': `${pct * 3.6}deg` } as CSSProperties}
              aria-hidden="true"
            >
              <span className={styles.fill} />
              <span className={styles.cap} />
              <span className={[styles.cap, styles.end].join(' ')} />
            </span>
          ) : null}
          {size === 'md' && state === 'running' && determinate && showCount ? (
            <span className={styles.count} aria-hidden="true" data-bella-meta>
              {now}/{total}
            </span>
          ) : null}
        </>
      )}
      {settled && !decorative ? (
        <span id={descId} className={styles.srOnly}>
          Still working
        </span>
      ) : null}
    </span>
  );
}
