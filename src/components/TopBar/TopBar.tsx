import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './TopBar.module.css';

export interface TopBarProps {
  /** The left side: the SearchField. */
  search?: ReactNode;
  /** The right side, 12 apart: the person's Avatar (size sm, image). */
  right?: ReactNode;
  /** Extra classes on the bar. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The bar across the top of the page column (Figma "Top bar", read 19 Nov
 * 2026; no Figma props): search on the left, the person on the right.
 */
export default function TopBar({ search, right, className, style }: TopBarProps) {
  return (
    <div className={[styles.bar, className].filter(Boolean).join(' ')} style={style} data-bella-component="top-bar">
      <div className={styles.search}>{search}</div>
      {right != null ? <div className={styles.right}>{right}</div> : null}
    </div>
  );
}
