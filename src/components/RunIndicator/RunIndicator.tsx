import React, { type CSSProperties, type ReactNode } from 'react';
import ProgressRing, { type ProgressRingState } from '../ProgressRing/ProgressRing';
import { useElapsed } from '../shared/useElapsed';
import styles from './RunIndicator.module.css';

export type RunIndicatorState = 'idle' | 'running' | 'done' | 'failed';

const RING: Record<RunIndicatorState, ProgressRingState> = { idle: 'waiting', running: 'running', done: 'done', failed: 'failed' };

export interface RunIndicatorProps {
  /** Figma "state". idle reads "Nothing running" in grey, in the same place, so a quiet screen is never ambiguous; running shows the count, the step and the time; done and failed name the run that just ended. */
  state?: RunIndicatorState;
  /** Figma "Count". How many runs are going (running). More than one reads "3 running"; one reads its title. */
  count?: number;
  /** Figma "Title". The run it speaks of: the one running, or the one that just ended. */
  title?: ReactNode;
  /** running: steps done and steps in all. With both, the ring draws done/total and the pill reads "Step 3 of 7". */
  stepDone?: number;
  stepTotal?: number;
  /** running: when it started (ISO or epoch ms). The pill counts up from it, every second. */
  since?: string | number;
  /** running: the time in words, when the caller counts ("2:41"). Wins over `since`. */
  elapsed?: string;
  /** The pill opens the list of runs. Missing = a plain status, not a button. */
  onOpen?: () => void;
  /** Whether that list is open (aria-expanded). */
  expanded?: boolean;
  /** Extra classes on the root. */
  className?: string;
  style?: CSSProperties;
}

/**
 * One persistent pill that says whether anything is running, which run, its step and the time it has been
 * going. Idle, running, done and failed are all drawn, so the page is never silent. The turning arc stops
 * after 3 s (ProgressRing); the ticking time is what shows it is alive. Narrow screens keep the ring and the
 * count; the full sentence stays the accessible name.
 */
export default function RunIndicator({
  state = 'idle',
  count = 1,
  title,
  stepDone,
  stepTotal,
  since,
  elapsed,
  onOpen,
  expanded,
  className,
  style,
}: RunIndicatorProps) {
  const ticking = useElapsed(since, state === 'running' && elapsed == null);
  const time = state === 'running' ? (elapsed ?? ticking) : null;
  const known = stepDone != null && stepTotal != null && stepTotal > 0;
  const step = known ? `Step ${Math.min(stepTotal!, stepDone! + 1)} of ${stepTotal}` : null;
  const many = state === 'running' && count > 1;
  const name = typeof title === 'string' ? title : undefined;
  const head =
    state === 'idle' ? 'Nothing running'
    : state === 'running' ? (many ? `${count} running` : (title ?? '1 running'))
    : state === 'done' ? 'Done'
    : 'Did not land';
  const tail = state === 'done' || state === 'failed' ? title : null;
  const said = [
    state === 'idle' ? 'Nothing running' : state === 'running' ? (many ? `${count} runs running` : `Running${name ? `: ${name}` : ''}`) : `${head}${name ? `: ${name}` : ''}`,
    state === 'running' && !many ? step : null,
    state === 'running' && time ? `${time} so far` : null,
  ].filter(Boolean).join(', ');

  const body = (
    <>
      <ProgressRing
        state={RING[state]}
        size="sm"
        value={state === 'running' && !many && known ? stepDone : undefined}
        total={state === 'running' && !many && known ? stepTotal : undefined}
        decorative
      />
      {state === 'running' && many ? <span className={styles.count} data-bella-count="">{count}</span> : null}
      <span className={styles.text} data-bella-text="">
        <span className={styles.head}>{head}</span>
        {tail != null ? <span className={styles.tail}>{tail}</span> : null}
        {state === 'running' && !many && step ? <span className={styles.meta}>{step}</span> : null}
        {time ? <span className={[styles.meta, styles.time].join(' ')}>{time}</span> : null}
      </span>
    </>
  );
  const cls = [styles.root, onOpen ? styles.action : '', className].filter(Boolean).join(' ');
  const live = (
    <span className={styles.srOnly} role="status">
      {state === 'idle' ? '' : state === 'running' ? (many ? `${count} runs running` : `Running${name ? `: ${name}` : ''}`) : `${head}${name ? `: ${name}` : ''}`}
    </span>
  );
  return onOpen ? (
    <>
      <button type="button" className={cls} style={style} onClick={onOpen} aria-expanded={expanded} aria-label={said} data-state={state} data-bella-component="run-indicator">
        {body}
      </button>
      {live}
    </>
  ) : (
    <>
      <span className={cls} style={style} role="img" aria-label={said} data-state={state} data-bella-component="run-indicator">
        {body}
      </span>
      {live}
    </>
  );
}
