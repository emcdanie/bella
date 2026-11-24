import React, { type CSSProperties } from 'react';
import Disclosure from '../Disclosure/Disclosure';
import DataTable, { type DataTableColumn } from '../DataTable/DataTable';
import styles from './ShareBars.module.css';

export interface ShareBarsRow {
  /** Stable key for the row. */
  id: string;
  /** The item's name ("Contracts"). */
  name: string;
  /** One meta line under the name ("100 to 80, 25% of the score"). */
  detail?: string;
  /** What the item adds to (positive) or takes from (negative) the total. */
  share: number;
  /** Colour of the bar and the number's ink: success adds, danger takes; neutral = grey, no real change. */
  tone: 'success' | 'danger' | 'neutral';
}

export interface ShareBarsProps {
  /** One row per item, top to bottom (the caller sorts). */
  rows: ShareBarsRow[];
  /** What the chart is: names the group and captions the table ("Share of the gap, by check"). */
  label: string;
  /** Half the scale: a share of this size fills one side of the track. */
  max?: number;
  /** Row ids to bring forward (24 Nov 2026, a score tile picked above the chart): the other rows dim a little, never to unreadable; a status line names them. Missing or empty = none. */
  highlight?: string[] | null;
  className?: string;
  style?: CSSProperties;
}

/** Signed to one place with the real minus sign (U+2212); zero is "0.0". */
const signed = (v: number) => (v === 0 ? '0.0' : `${v > 0 ? '+' : '−'}${Math.abs(v).toFixed(1)}`);

/**
 * How much each item adds to or takes from a total, from a middle zero: one
 * row per item, a bar growing left of the dashed zero line for a negative
 * share and right for a positive one, the signed number at the row end. One
 * line per row in a wide container, stacked when narrow (a container query).
 * The same data is in a table behind a Disclosure.
 */
export default function ShareBars({ rows, label, max = 6, highlight = null, className, style }: ShareBarsProps) {
  const lit = highlight?.length ? new Set(highlight) : null;
  const len = (v: number) => (v === 0 ? 0 : Math.max(1, Math.min(50, (Math.abs(v) / (max || 1)) * 50)));

  const columns: DataTableColumn<Record<string, any>>[] = [
    { key: 'name', label: 'Name' },
    { key: 'detail', label: 'Detail' },
    { key: 'share', label: 'Share', numeric: true },
  ];
  const tableRows = rows.map((r) => ({ id: r.id, name: r.name, detail: r.detail ?? 'None', share: signed(r.share) }));

  return (
    <div className={[styles.root, className].filter(Boolean).join(' ')} style={style} role="group" aria-label={label} data-bella-component="share-bars" data-highlight={lit ? '' : undefined}>
      <span className={styles.srOnly} role="status">
        {lit ? `Highlighted: ${rows.filter((r) => lit.has(r.id)).map((r) => r.name).join(', ')}.` : ''}
      </span>
      <div className={styles.grid}>
        {rows.map((r) => (
          <div key={r.id} className={styles.row} data-tone={r.tone} data-lit={lit ? (lit.has(r.id) ? 'on' : 'off') : undefined}>
            <span className={styles.name}>
              <span className={styles.title}>{r.name}</span>
              {r.detail ? <span className={styles.detail} data-bella-meta>{r.detail}</span> : null}
            </span>
            <span
              className={styles.track}
              role="img"
              aria-label={`${r.name}: ${signed(r.share)}${r.detail ? `, ${r.detail}` : ''}`}
              data-testid="share-bars-track"
            >
              {r.share !== 0 ? (
                <span
                  className={styles.bar}
                  data-side={r.share < 0 ? 'left' : 'right'}
                  style={{ inlineSize: `${len(r.share)}%` }}
                />
              ) : null}
            </span>
            <span className={styles.value} data-testid="share-bars-value">{signed(r.share)}</span>
          </div>
        ))}
      </div>
      <Disclosure title="Table behind this chart">
        <DataTable caption={label} columns={columns} rows={tableRows} rowKey="id" density="compact" />
      </Disclosure>
    </div>
  );
}
