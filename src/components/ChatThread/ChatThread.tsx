import React, { type ReactNode } from 'react';
import Icon from '../Icon/Icon';
import styles from './ChatThread.module.css';

export interface ChatThreadTimestampProps {
  children: ReactNode;
  /** Optional leading word rendered in bold before children. E.g. boldWord="Friday" + children "13:54" → "Friday 13:54" with Friday semibold. */
  boldWord?: string;
}

/** Centred timestamp row between groups of messages. */
export function ChatThreadTimestamp({ children, boldWord }: ChatThreadTimestampProps) {
  return (
    <div className={styles.stamp}>
      {boldWord && <><span className={styles.stampBold}>{boldWord}</span>{' '}</>}
      {children}
    </div>
  );
}

export interface ChatThreadDeliveredProps {
  children?: ReactNode;
}

/** The "Delivered" confirmation line beneath the final sent bubble. */
export function ChatThreadDelivered({ children = 'Delivered' }: ChatThreadDeliveredProps) {
  return (
    <div className={styles.delivered} aria-live="polite" aria-atomic="true">
      {children}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * Thinking tick (Figma _Thinking tick 1514:344566, read 21 Nov): one line of
 * her thinking tick list (20 Nov: "one chat"; the thinking state is her
 * sheet's tick list). A row, 12 apart: a 20 mark (done = a Check, working =
 * a 6 dot), then the label (reading face 16, content/body) and its meta
 * (number face 16, content/subtle), 4 apart.
 * ------------------------------------------------------------------------- */

export interface ThinkingTickProps {
  /** done: a check. working: a dot (the step under way). */
  state?: 'done' | 'working';
  /** What was read or is being done ("BELLA data", "Writing"). */
  label: ReactNode;
  /** A date, a count or a time, in the number face ("18 Nov 21:42", "3 s"). */
  meta?: ReactNode;
}

export function ThinkingTick({ state = 'done', label, meta }: ThinkingTickProps) {
  return (
    <li className={styles.tick} data-state={state} data-bella-component="thinking-tick">
      <span className={styles.tickMark} aria-hidden="true">
        {state === 'done' ? <Icon name="Check" size="md" /> : <span className={styles.tickDot} />}
      </span>
      <span className={styles.tickText}>
        <span className={styles.srOnly}>{state === 'done' ? 'Done: ' : 'Working: '}</span>
        <span className={styles.tickLabel}>{label}</span>
        {meta != null ? <span className={styles.tickMeta}>{meta}</span> : null}
      </span>
    </li>
  );
}

export interface ThinkingListProps {
  /** ThinkingTick rows, in order. */
  children: ReactNode;
  /** Names the list ("What BELLA is doing"). */
  label?: string;
}

/** Her tick list: the ThinkingTick rows of one answer, 8 apart. A polite live region, so a new tick is read out. */
export function ThinkingList({ children, label = 'What BELLA is doing' }: ThinkingListProps) {
  return (
    <ul className={styles.ticks} aria-label={label} aria-live="polite" data-bella-component="thinking-list">
      {children}
    </ul>
  );
}

export interface ChatThreadProps {
  children: ReactNode;
  /** aria-label for the scrollable message region. */
  label?: string;
  className?: string;
}

/**
 * Column layout for a sequence of ChatBubble rows.
 * Fluid from 320px, no fixed heights, no breakpoints outside BELLA's four.
 * tabIndex=0: the log scrolls, so keyboard users must be able to focus it
 * (Safari does not make scroll containers focusable on its own).
 * See component-contract:chat-thread.
 */
export default function ChatThread({ children, label = 'Messages', className }: ChatThreadProps) {
  return (
    <div
      className={[styles.thread, className].filter(Boolean).join(' ')}
      role="log"
      tabIndex={0}
      aria-label={label}
      aria-live="polite"
      data-bella-component="chat-thread"
    >
      {children}
    </div>
  );
}
