import React, { type ReactNode } from 'react';
import Icon from '../Icon/Icon';
import BellaTag, { type TagTone } from '../Tag/Tag';
import styles from './TableCell.module.css';

export interface TableCellProps {
  /** Figma "kind". header: the column label (th scope=col), 600 subtle · text: body face · mono: number face (role names, numbers, ratios) · swatch: a 20 square of the colour plus the hex in mono · link: pass a Link as children. */
  kind?: 'header' | 'text' | 'mono' | 'swatch' | 'link' | 'tag';
  /** kind=tag: the Tag's tone (style line, as the 21 Nov publish draws it). */
  tagTone?: TagTone;
  /** Figma "align". end for a column that reads from the right (counts, links). */
  align?: 'start' | 'end';
  /** Figma "selected": the text goes 600 in ink, so a selected row is never colour alone. Set on every cell of a selected TableRow. */
  selected?: boolean;
  /** Figma "Show sort" on a header: none draws ⇅; ascending / descending draw the direction. Omit on a column that does not sort. */
  sort?: 'none' | 'ascending' | 'descending';
  /** kind=swatch: the colour the chip shows, as a token (`var(--color-background-accent-1)`). */
  swatch?: string;
  /** kind=swatch: the theme the colour resolves in ("chip-light" for a Light column, "chip-dark" for a Dark column), as Figma sets the Colour block's mode. Missing = the page's theme. */
  swatchTheme?: string;
  /** Renders a body cell as th scope=row (the row's name). */
  rowHeader?: boolean;
  /** Extra classes on the cell. */
  className?: string;
  children?: ReactNode;
}

const SORT_ICON = { none: 'NavArrowUpDown', ascending: 'NavArrowUp', descending: 'NavArrowDown' } as const;

/**
 * One cell of a table (Figma Table cell 1510:348599, 20 Nov): one row holds
 * one cell per column. 44 min tall, 8 above and below, 16 at the sides, one
 * bottom edge. As Carbon TableCell, Primer Table.Cell, Polaris IndexTable.Cell.
 */
export default function TableCell({
  kind = 'text',
  align = 'start',
  selected = false,
  sort,
  swatch,
  swatchTheme,
  tagTone = 'default',
  rowHeader = false,
  className,
  children,
}: TableCellProps) {
  const header = kind === 'header';
  const Tag = header || rowHeader ? 'th' : 'td';
  const cls = [styles.cell, styles[kind], align === 'end' ? styles.end : '', selected ? styles.selected : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <Tag
      className={cls}
      scope={header ? 'col' : rowHeader ? 'row' : undefined}
      aria-sort={header && sort ? sort : undefined}
      data-bella-component="table-cell"
    >
      <span className={styles.inner}>
        {kind === 'swatch' ? (
          <span className={styles.chip} aria-hidden="true">
            <span className={styles.colour} data-theme={swatchTheme} style={{ background: swatch }} />
          </span>
        ) : null}
        {kind === 'tag' ? (
          <BellaTag variant="line" tone={tagTone}>
            {children}
          </BellaTag>
        ) : (
          <span className={styles.text}>{children}</span>
        )}
        {header && sort ? (
          <span className={styles.sortMark} aria-hidden="true">
            <Icon name={SORT_ICON[sort]} size="sm" />
          </span>
        ) : null}
      </span>
    </Tag>
  );
}
