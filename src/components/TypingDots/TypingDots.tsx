import React from 'react';
import styles from './TypingDots.module.css';

export interface TypingDotsProps {
  /** Who is typing. Used for the accessible label. */
  name: string;
  className?: string;
}

/**
 * Three animated dots indicating a lane is composing a message.
 * Still under reduced-motion (no animation, dots remain visible).
 * See component-contract:typing-dots.
 */
export default function TypingDots({ name, className }: TypingDotsProps) {
  return (
    <span
      className={[styles.root, className].filter(Boolean).join(' ')}
      role="status"
      aria-label={`${name} is typing`}
      data-bella-component="typing-dots"
    >
      <span className={styles.dot} aria-hidden="true" />
      <span className={[styles.dot, styles.dot2].join(' ')} aria-hidden="true" />
      <span className={[styles.dot, styles.dot3].join(' ')} aria-hidden="true" />
    </span>
  );
}
