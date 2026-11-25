import React, { type ReactNode } from 'react';
import styles from './TableRow.module.css';

export interface TableRowProps {
  /** Figma state=selected: the shared selected light blue. Put its cells on selected too (bold ink). */
  selected?: boolean;
  /** Figma state=hover on pointer hover: the shared hover light blue. Header rows leave it off. */
  hover?: boolean;
  /** Extra classes on the row. */
  className?: string;
  /** Figma "Cells": one TableCell per column. */
  children?: ReactNode;
}

/**
 * One row of a table (Figma Table row 1510:348603, 20 Nov): a Cells slot,
 * one Table cell per column. No edge of its own: each cell carries the
 * bottom edge. As Carbon TableRow, Primer Table.Row, Polaris IndexTable.Row.
 */
export default function TableRow({ selected = false, hover = true, className, children }: TableRowProps) {
  return (
    <tr
      className={[styles.row, hover ? styles.hover : '', className].filter(Boolean).join(' ')}
      data-selected={selected || undefined}
      aria-selected={selected || undefined}
      data-bella-component="table-row"
    >
      {children}
    </tr>
  );
}
