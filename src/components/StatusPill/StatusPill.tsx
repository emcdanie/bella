import React, { type ReactNode } from 'react';
import styles from './StatusPill.module.css';

export interface StatusPillProps {
  /**
   * The state tint. `"accent"` is the quiet accent ring (the portfolio's
   * "Current focus"). `"success"` and `"info"` wear the carried sage and
   * steel tints, non-text roles only per the recorded decision. `"neutral"`
   * has no tint: the inset fill and a hairline.
   *
   * Status-ladder variants (Elleta, 14 Oct 2026): `"attention"` = warning /
   * waiting (yellow fill); `"danger"` = failed (dot + wash on raised surface);
   * `"quiet"` = parked / inactive (muted fill); `"serving"` = success outline.
   */
  variant?: 'accent' | 'success' | 'info' | 'neutral' | 'attention' | 'danger' | 'quiet' | 'serving';
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
  className,
  children,
}: StatusPillProps) {
  const cls = [styles.pill, styles[variant], className].filter(Boolean).join(' ');
  return (
    <span className={cls} data-bella-component="status-pill">
      {children}
    </span>
  );
}
