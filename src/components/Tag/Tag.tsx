import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './Tag.module.css';

export interface TagProps {
  /**
   * `"default"` is the quiet neutral wash. `"accent"` wears the accent
   * wash (subtle fill, accent text), the generic form of the portfolio's
   * per-case identity tint.
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
