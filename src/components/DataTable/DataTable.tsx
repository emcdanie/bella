import React, { useMemo, useState, type ReactNode } from 'react';
import Icon from '../Icon/Icon';
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
  /** Selection, single. The first column renders as a toggle button; the selected row fills ochre. */
  selectedKey?: string | null;
  onSelect?: (key: string | null) => void;
  /** Caps the height (a token, e.g. `calc(var(--spacing-20) * 5)`) so the sticky header has something to stick in. */
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
 * Rows of facts in columns. Sortable headers are buttons with aria-sort,
 * the header sticks, and an optional single selection fills the chosen row
 * ochre without dimming any other row.
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
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      style={maxHeight ? { maxBlockSize: maxHeight } : undefined}
      data-bella-component="data-table"
      data-density={compact ? 'compact' : undefined}
      tabIndex={maxHeight ? 0 : undefined}
      role={maxHeight ? 'region' : undefined}
      aria-label={maxHeight ? caption : undefined}
    >
      <table className={styles.table}>
        <caption className={styles.caption}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              return (
                <th
                  key={c.key}
                  scope="col"
                  className={c.numeric ? styles.numeric : undefined}
                  aria-sort={c.sortable ? (active ? sort!.direction : 'none') : undefined}
                >
                  {c.sortable ? (
                    <button type="button" className={styles.sort} onClick={() => toggle(c.key)}>
                      {c.label}
                      <span
                        className={styles.arrow}
                        data-direction={active ? sort!.direction : undefined}
                        aria-hidden="true"
                      >
                        <Icon name="NavArrowDown" size="sm" />
                      </span>
                    </button>
                  ) : (
                    c.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => {
            const key = String(r[rowKey]);
            const selected = selectable && selectedKey === key;
            return (
              <tr key={key} data-selected={selected || undefined}>
                {columns.map((c, i) => {
                  const content = c.render ? c.render(r) : r[c.key];
                  const cls = c.numeric ? styles.numeric : undefined;
                  if (i === 0) {
                    return (
                      <th key={c.key} scope="row" className={cls}>
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
                      </th>
                    );
                  }
                  return (
                    <td key={c.key} className={cls}>
                      {content}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
