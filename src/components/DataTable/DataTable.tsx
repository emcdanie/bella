import React, { useId, useMemo, useState, type ReactNode } from 'react';
import TableRow from '../TableRow/TableRow';
import TableCell from '../TableCell/TableCell';
import type { TagTone } from '../Tag/Tag';
import styles from './DataTable.module.css';

export interface DataTableColumn<Row> {
  key: string;
  label: string;
  /** Right-aligned, tabular figures, sorted as numbers. */
  numeric?: boolean;
  /** The header becomes a sort button and carries aria-sort. */
  sortable?: boolean;
  /** Cell content; defaults to the row's value at `key`. */
  render?: (row: Row) => ReactNode;
  /** What to sort by when the cell renders something else; defaults to the value at `key`. */
  sortValue?: (row: Row) => string | number;
  /** tag: each cell is a Tag (TableCell kind=tag, style line). swatch: each cell is the colour square plus
   *  its value in the number face (TableCell kind=swatch; rule "Colour swatch is one square of one colour").
   *  Not for the first column. */
  kind?: 'tag' | 'swatch';
  /** kind=tag: the tone for this row's Tag ("success" for Ready, "attention" for Needs you). Missing = default. */
  tagTone?: (row: Row) => TagTone;
  /** kind=swatch: this row's colour as a token (`var(--color-content-default)`). Missing = no colour, the square shows its edge only. */
  swatch?: (row: Row) => string | undefined;
  /** kind=swatch: the theme the colour resolves in, so a Light and a Dark column each show their own mode
   *  ("chip-light", "chip-dark"), as Figma sets the Colour block's mode. Missing = the page's theme. */
  swatchTheme?: string;
}

export type DataTableSort = { key: string; direction: 'ascending' | 'descending' };

export interface DataTableProps<Row extends Record<string, any>> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** The field that identifies a row: React key and selection value. */
  rowKey: string;
  /** Visible caption naming the table. Required: a table without a name is a grid of guesses. */
  caption: string;
  /** Initial sort; sorting is then held by the table. */
  defaultSort?: DataTableSort;
  /** Selection, single. The first column renders as a toggle button; the selected row is the shared light blue with bold ink text (Figma 20 Nov). */
  selectedKey?: string | null;
  onSelect?: (key: string | null) => void;
  /** Caps the height (a token, e.g. `calc(var(--spacing-80) * 5)`) so the sticky header has something to stick in. */
  maxHeight?: string;
  /** Row height. compact is for display-only tables (answers, read-only lists): rows under 44px.
   *  It is ignored on a sortable or selectable table, whose rows keep the 44px target. */
  density?: 'default' | 'compact';
  /** Extra classes on the scroll wrapper. */
  className?: string;
}

function compare(a: unknown, b: unknown, numeric?: boolean) {
  if (numeric) return Number(a ?? 0) - Number(b ?? 0);
  return String(a ?? '').localeCompare(String(b ?? ''), undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Rows of facts in columns, built from Table row and Table cell (Figma 20
 * Nov). Sortable headers are buttons with aria-sort, the header sticks, and
 * an optional single selection marks the chosen row light blue with bold ink
 * text, without dimming any other row.
 */
export default function DataTable<Row extends Record<string, any>>({
  columns,
  rows,
  rowKey,
  caption,
  defaultSort,
  selectedKey,
  onSelect,
  maxHeight,
  density = 'default',
  className,
}: DataTableProps<Row>) {
  const [sort, setSort] = useState<DataTableSort | undefined>(defaultSort);
  const captionId = useId();
  // compact only where nothing in a row is interactive
  const compact = density === 'compact' && !onSelect && !columns.some((c) => c.sortable);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const val = (r: Row) => (col.sortValue ? col.sortValue(r) : r[col.key]);
    const out = [...rows].sort((a, b) => compare(val(a), val(b), col.numeric));
    return sort.direction === 'descending' ? out.reverse() : out;
  }, [rows, columns, sort]);

  function toggle(key: string) {
    setSort((s) =>
      s?.key === key && s.direction === 'ascending'
        ? { key, direction: 'descending' }
        : { key, direction: 'ascending' }
    );
  }

  const selectable = Boolean(onSelect);

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-bella-component="data-table"
      data-density={compact ? 'compact' : undefined}
    >
      {/* The caption sits outside the frame so the frame's edge and corners stay
          put while the table scrolls inside it; it still names the table. */}
      <div className={styles.caption} id={captionId}>{caption}</div>
      <div
        className={styles.wrap}
        style={maxHeight ? { maxBlockSize: maxHeight } : undefined}
        tabIndex={maxHeight ? 0 : undefined}
        role={maxHeight ? 'region' : undefined}
        aria-labelledby={maxHeight ? captionId : undefined}
      >
      <table className={styles.table} aria-labelledby={captionId}>
        <thead>
          <TableRow hover={false}>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <TableCell
                  key={c.key}
                  kind="header"
                  align={c.numeric ? 'end' : 'start'}
                  sort={c.sortable ? (active ? sort!.direction : 'none') : undefined}
                  className={c.sortable ? styles.sortable : undefined}
                >
                  {c.sortable ? (
                    <button type="button" className={styles.sort} onClick={() => toggle(c.key)}>
                      {c.label}
                    </button>
                  ) : (
                    c.label
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const key = String(r[rowKey]);
            const selected = selectable && selectedKey === key;
            return (
              <TableRow key={key} selected={selected}>
                {columns.map((c, i) => {
                  const content = c.render ? c.render(r) : r[c.key];
                  const align = c.numeric ? 'end' : 'start';
                  if (i === 0) {
                    return (
                      <TableCell key={c.key} rowHeader align={align} selected={selected} className={styles.rowLabel}>
                        {selectable ? (
                          <button
                            type="button"
                            className={styles.select}
                            aria-pressed={selected}
                            onClick={() => onSelect!(selected ? null : key)}
                          >
                            {content}
                          </button>
                        ) : (
                          content
                        )}
                      </TableCell>
                    );
                  }
                  return (
                    /* numeric columns: the number face (every number in Geist Mono) */
                    <TableCell
                      key={c.key}
                      kind={c.kind ?? (c.numeric ? 'mono' : undefined)}
                      tagTone={c.kind === 'tag' ? c.tagTone?.(r) : undefined}
                      swatch={c.kind === 'swatch' ? c.swatch?.(r) : undefined}
                      swatchTheme={c.kind === 'swatch' ? c.swatchTheme : undefined}
                      align={align}
                      selected={selected}
                    >
                      {content}
                    </TableCell>
                  );
                })}
              </TableRow>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );
}
