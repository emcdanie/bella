import React, { type ReactNode } from 'react';
import styles from './StatusPill.module.css';

export interface StatusPillProps {
  /**
   * The state tint. `"accent"` is the pink fill with a near-black label (the
   * portfolio's "Current focus"; shared look, 8 Nov 2026). `"success"` and `"info"` wear the carried sage and
   * steel tints, non-text roles only per the recorded decision. `"neutral"`
   * has no tint: the inset fill and a hairline.
   *
   * Status-ladder variants (Elleta, 14 Oct 2026): `"attention"` = warning /
   * waiting (yellow fill); `"danger"` = failed (dot + wash on raised surface);
   * `"quiet"` = parked / inactive (muted fill); `"serving"` = success outline.
   */
  variant?: 'accent' | 'success' | 'info' | 'neutral' | 'attention' | 'danger' | 'quiet' | 'serving';
  /**
   * `"dot"` shows only a coloured mark in the state's colour; the word stays
   * the accessible name, visually hidden (CHIP's Today, Elleta 7 Nov 2026).
   */
  shape?: 'pill' | 'dot';
  /** Extra classes on the pill. */
  className?: string;
  children?: ReactNode;
}

/**
 * A status word in a pill. Non-interactive, one tint per state, readable
 * in both themes.
 */
export default function StatusPill({
  variant = 'accent',
  shape = 'pill',
  className,
  children,
}: StatusPillProps) {
  if (shape === 'dot') {
    return (
      <span className={[styles.dot, styles[`dot-${variant}`], className].filter(Boolean).join(' ')} data-bella-component="status-pill" data-shape="dot">
        <span className={styles.word}>{children}</span>
      </span>
    );
  }
  const cls = [styles.pill, styles[variant], className].filter(Boolean).join(' ');
  return (
    <span className={cls} data-bella-component="status-pill">
      {children}
    </span>
  );
}
