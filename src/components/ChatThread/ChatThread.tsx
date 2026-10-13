import React, { type ReactNode } from 'react';
import styles from './ChatThread.module.css';

export interface ChatThreadTimestampProps {
  children: ReactNode;
}

/** Centred timestamp row between groups of messages. */
export function ChatThreadTimestamp({ children }: ChatThreadTimestampProps) {
  return (
    <div className={styles.stamp} aria-hidden="true">
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
    <div className={styles.delivered} aria-live="assertive" aria-atomic="true">
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
 * See component-contract:chat-thread.
 */
export default function ChatThread({ children, label = 'Messages', className }: ChatThreadProps) {
  return (
    <div
      className={[styles.thread, className].filter(Boolean).join(' ')}
      role="log"
      aria-label={label}
      aria-live="polite"
      data-bella-component="chat-thread"
    >
      {children}
    </div>
  );
}
