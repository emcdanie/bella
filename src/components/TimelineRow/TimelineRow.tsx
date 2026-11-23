import React, { type CSSProperties, type ReactNode } from 'react';
import ProgressRing, { type ProgressRingState } from '../ProgressRing/ProgressRing';
import Trailing from '../Trailing/Trailing';
import styles from './TimelineRow.module.css';

export type TimelineRowState = ProgressRingState;

export interface TimelineRowProps {
  /** Figma "Title". What ran or is running. */
  title: ReactNode;
  /** Figma "Line". One line under it: when, how long, how far ("09:41 to now · step 3 of 7"). */
  line?: ReactNode;
  /** Figma "state". running = turning ring, done = tick, waiting = empty ring (queued), failed = red cross. Always named in words for assistive tech. */
  state?: TimelineRowState;
  /** running: steps done and in all, so the ring draws n/m. */
  stepDone?: number;
  stepTotal?: number;
  /** The row opens the run: a button. Missing = a plain row. */
  onOpen?: () => void;
  /** Extra classes on the root. */
  className?: string;
  style?: CSSProperties;
}

const WORD: Record<TimelineRowState, string> = { running: 'Running', done: 'Done', waiting: 'Queued', failed: 'Did not land' };

/**
 * One job in the Activity timeline: a rounded row with its state ring, the title and one line. Click opens
 * the run. The state is a shape and a word, never colour alone.
 */
export default function TimelineRow({ title, line, state = 'done', stepDone, stepTotal, onOpen, className, style }: TimelineRowProps) {
  const cls = [styles.row, onOpen ? styles.action : '', className].filter(Boolean).join(' ');
  const body = (
    <>
      <ProgressRing state={state} size="sm" value={state === 'running' ? stepDone : undefined} total={state === 'running' ? stepTotal : undefined} decorative />
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {line != null ? <span className={styles.line}>{line}</span> : null}
        <span className={styles.srOnly}>{WORD[state]}</span>
      </span>
      {onOpen ? <Trailing icon="NavArrowRight" /> : null}
    </>
  );
  return onOpen ? (
    <button type="button" className={cls} style={style} onClick={onOpen} data-state={state} data-bella-component="timeline-row">
      {body}
    </button>
  ) : (
    <div className={cls} style={style} data-state={state} data-bella-component="timeline-row">
      {body}
    </div>
  );
}
