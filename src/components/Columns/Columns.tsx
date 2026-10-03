import React, { type ReactNode } from 'react';
import styles from './Columns.module.css';

export interface ColumnsProps {
  /** How many equal columns at full width: 2, or 3. */
  count?: 2 | 3;
  /** `"even"`: equal columns. `"wide-start"`: two columns, the first twice the second (a stage beside its facts). */
  split?: 'even' | 'wide-start';
  /** The cells, usually Cards. */
  children?: ReactNode;
  className?: string;
}

/**
 * Equal columns that collapse by their own width (layout foundation,
 * 2026-10-03): 3 become 2 under 1200px and 1 under 768px; 2 become 1 under
 * 768px. split="wide-start" makes two columns 2:1 from 768px. Cells stretch
 * to the row so cards line up.
 */
export default function Columns({ count = 2, split = 'even', children, className }: ColumnsProps) {
  return (
    <div className={styles.container} data-bella-component="columns">
      <div className={[styles.grid, count === 3 ? styles.three : styles.two, split === 'wide-start' && count === 2 ? styles.wideStart : '', className].filter(Boolean).join(' ')}>{children}</div>
    </div>
  );
}
