import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './Tag.module.css';

export interface TagProps {
  /**
   * `"default"` is the quiet neutral wash. `"accent"` is the pink fill
   * (#E58BBB) with a near-black label, 8.13:1 (shared look, 8 Nov 2026). Both set in DM Sans at 16px, sentence case (type lock, 2026-10-04).
   */
  variant?: 'default' | 'accent';
  /** Extra classes on the chip. */
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Non-interactive metadata. If you can click it, it is not a Tag.
 */
export default function Tag({
  variant = 'default',
  className,
  style,
  children,
}: TagProps) {
  const cls = [styles.tag, variant === 'accent' ? styles.accent : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <span className={cls} style={style} data-bella-component="tag">
      {children}
    </span>
  );
}
