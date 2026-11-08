import React, { type ReactNode } from 'react';
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
