import React, { useId, useMemo, useState, type ReactNode } from 'react';
import TableRow from '../TableRow/TableRow';
import TableCell from '../TableCell/TableCell';
import Trailing from '../Trailing/Trailing';
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
  /** kind=swatch: this row's colour as a token (`var(--color-content-default)`). Missing = no colour: the square is empty (it has no edge). */
  swatch?: (row: Row) => string | undefined;
  /** kind=swatch: the theme the colour resolves in, so a Light and a Dark column each show their own mode
   *  ("chip-light", "chip-dark"), as Figma sets the Colour block's mode. Missing = the page's theme. */
  swatchTheme?: string;
  /** stack: under 480 this column goes under the name as "Label: value" in the subtle ink, even when it is the second
   *  column (which otherwise sits beside the name). For a word too long to share the first line at 320, such as a
   *  state ("Spec, no code"), so the name never touches it (23 Nov 2026, CHIP's Gaps drawer). */
  stackUnder?: boolean;
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
  /** A sort held by the page (CHIP search-filter plan, 23 Nov: the toolbar's Sort follows the table). With `onSortChange`,
   *  the header buttons ask the page to change it; `null` means unsorted. Without it, the table holds its own. */
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort) => void;
  /** The first column stays put while the other columns scroll sideways, so a row keeps its name (CHIP second pass S11). */
  freezeFirst?: boolean;
  /** Selection, single. The first column renders as a toggle button; the selected row is the shared light blue with bold ink text (Figma 20 Nov). */
  selectedKey?: string | null;
  onSelect?: (key: string | null) => void;
  /** The row opens its detail (CHIP drawers, 23 Nov plan: "a table row that opens its detail"). The row's name becomes
   *  a button that covers the whole row, and a ↗ Trailing mark ends it (rule 12: the whole row is the target). Not with onSelect. */
  onOpen?: (key: string) => void;
  /** Narrow mode: below 480 of its container the header row goes and each row stacks: the name and the second
   *  column's value on one line, the other columns under the name as "Label: value" ("reorganise, do not squeeze"). */
  stack?: boolean;
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
  sort: sortGiven,
  onSortChange,
  freezeFirst = false,
  selectedKey,
  onSelect,
  maxHeight,
  density = 'default',
  stack = false,
  onOpen,
  className,
}: DataTableProps<Row>) {
  const [sortOwn, setSort] = useState<DataTableSort | undefined>(defaultSort);
  const sort = sortGiven !== undefined ? sortGiven ?? undefined : sortOwn;
  const captionId = useId();
  // compact only where nothing in a row is interactive
  const compact = density === 'compact' && !onSelect && !onOpen && !columns.some((c) => c.sortable);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return rows;
    const val = (r: Row) => (col.sortValue ? col.sortValue(r) : r[col.key]);
    const out = [...rows].sort((a, b) => compare(val(a), val(b), col.numeric));
    return sort.direction === 'descending' ? out.reverse() : out;
  }, [rows, columns, sort]);

  function toggle(key: string) {
    const next: DataTableSort =
      sort?.key === key && sort.direction === 'ascending' ? { key, direction: 'descending' } : { key, direction: 'ascending' };
    if (onSortChange) onSortChange(next);
    if (sortGiven === undefined) setSort(next);
  }

  const selectable = Boolean(onSelect) && !onOpen;

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      data-bella-component="data-table"
      data-density={compact ? 'compact' : undefined}
      data-stack={stack ? '' : undefined}
      data-open={onOpen ? '' : undefined}
      data-freeze={freezeFirst ? '' : undefined}
    >
      {/* The caption sits outside the frame so the frame's edge and corners stay
          put while the table scrolls inside it; it still names the table. */}
      <div className={styles.caption} id={captionId}>{caption}</div>
      {/* Figma "Edge left" / "Edge right" (22 Nov): the frame holds the two
          24 fades over the scroller; CSS shows each only while there is more
          to scroll on its side. */}
      <div className={styles.frame} data-bella-scroll-edge="">
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
            {onOpen ? (
              <TableCell kind="header" className={styles.openCell}>
                <span className={styles.hidden}>Open</span>
              </TableCell>
            ) : null}
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
                        {onOpen ? (
                          <button type="button" className={styles.open} onClick={() => onOpen(key)}>
                            {content}
                          </button>
                        ) : selectable ? (
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
                      className={c.stackUnder ? styles.under : undefined}
                    >
                      {stack ? <span className={styles.stackLabel}>{`${c.label}: `}</span> : null}
                      {content}
                    </TableCell>
                  );
                })}
                {onOpen ? (
                  <TableCell className={styles.openCell}>
                    <Trailing />
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </tbody>
      </table>
      </div>
      </div>
    </div>
  );
}
