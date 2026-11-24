import React, { useId, useState, type CSSProperties } from 'react';
import Button from '../Button/Button';
import Tag, { type TagTone } from '../Tag/Tag';
import Disclosure from '../Disclosure/Disclosure';
import DataTable, { type DataTableColumn } from '../DataTable/DataTable';
import styles from './GapChart.module.css';

export interface GapChartRow {
  /** Stable key for the row. */
  id: string;
  /** The item's name ("Make a settings page"). */
  name: string;
  /** The base value (the hollow ring), on the 0 to max scale. null = no base: only the solid dot, no line. */
  base: number | null;
  /** The new value (the solid dot), on the 0 to max scale. */
  value: number;
  /** The gap printed at the row end (value minus base, as the caller measured it). null = no number. */
  gap: number | null;
  /** The state word on the row's Tag ("no file ahead", "no real change"). */
  word: string;
  /** Colour of the gap line, the gap number's ink and the Tag. success, danger, warning; neutral = grey, no real change. */
  tone: 'success' | 'danger' | 'warning' | 'neutral';
  /** Why the gap is what it is. Present = a Why button that shows it under the row. */
  why?: string;
}

export interface GapChartProps {
  /** One row per item, top to bottom. */
  rows: GapChartRow[];
  /** What the chart is: names the group and captions the table ("Benchmark jobs"). */
  label: string;
  /** The base value's name, in the legend, the table and each row's spoken label. */
  baseLabel?: string;
  /** The new value's name, in the legend, the table and each row's spoken label. */
  valueLabel?: string;
  /** The top of the scale; the axis reads 0, half and max. */
  max?: number;
  /** Which marks to bring forward (24 Nov 2026, a score tile picked above the chart): 'base' the rings, 'value' the dots and their gaps. The rest dims a little, never to unreadable; a status line says what is highlighted. Missing = none. */
  highlight?: 'base' | 'value' | null;
  className?: string;
  style?: CSSProperties;
}

const TONE_TAG: Record<GapChartRow['tone'], TagTone> = { success: 'success', danger: 'danger', warning: 'attention', neutral: 'default' };
const one = (v: number) => v.toFixed(1);
/** Signed to one place with the real minus sign (U+2212). */
const signed = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}`;
const fmtAxis = (v: number) => (Number.isInteger(v) ? String(v) : one(v));

/**
 * Two scores per item on one scale: a hollow ring for the base, a solid dot
 * for the new value and a line in the tone between them (the gap), on dashed
 * gridlines at 0, half and max. Each row ends with the gap in numbers, a Tag
 * word and, when the row has one, a Why button that opens the reason under
 * the row. One line per row in a wide container, stacked when narrow (a
 * container query). The same data is in a table behind a Disclosure.
 */
export default function GapChart({ rows, label, baseLabel = 'No file', valueLabel = 'AGENTS.md', max = 100, highlight = null, className, style }: GapChartProps) {
  const uid = useId();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const pos = (v: number) => `${Math.min(100, Math.max(0, (v / (max || 1)) * 100))}%`;

  const spoken = (r: GapChartRow) =>
    r.base == null
      ? `${r.name}: ${valueLabel} ${one(r.value)}, no ${baseLabel} value`
      : `${r.name}: ${baseLabel} ${one(r.base)}, ${valueLabel} ${one(r.value)}${r.gap != null ? `, gap ${signed(r.gap)}` : ''}`;

  const columns: DataTableColumn<Record<string, any>>[] = [
    { key: 'name', label: 'Name' },
    { key: 'base', label: baseLabel, numeric: true },
    { key: 'value', label: valueLabel, numeric: true },
    { key: 'gap', label: 'Gap', numeric: true },
    { key: 'word', label: 'State' },
  ];
  const tableRows = rows.map((r) => ({
    id: r.id,
    name: r.name,
    base: r.base == null ? 'None' : one(r.base),
    value: one(r.value),
    gap: r.gap == null ? 'None' : signed(r.gap),
    word: r.word,
  }));

  return (
    <div
      className={[styles.root, className].filter(Boolean).join(' ')}
      style={style}
      role="group"
      aria-label={label}
      data-bella-component="gap-chart"
      data-highlight={highlight ?? undefined}
    >
      <span className={styles.srOnly} role="status">
        {highlight === 'base' ? `Highlighted: the ${baseLabel} rings.` : highlight === 'value' ? `Highlighted: the ${valueLabel} dots and their gaps.` : ''}
      </span>
      <div className={styles.legend}>
        <span className={styles.key}>
          <span className={styles.ring} aria-hidden="true" />
          {baseLabel}
        </span>
        <span className={styles.key}>
          <span className={styles.dot} aria-hidden="true" />
          {valueLabel}
        </span>
        <span className={styles.key}>The line is the gap, out of {fmtAxis(max)}</span>
      </div>
      <div className={styles.grid}>
        <div className={[styles.row, styles.head].join(' ')} aria-hidden="true">
          <span className={styles.pad} />
          <span className={[styles.track, styles.axis].join(' ')}>
            <span className={styles.tick} style={{ left: '0%' }} data-bella-meta>0</span>
            <span className={styles.tick} style={{ left: '50%' }} data-bella-meta>{fmtAxis(max / 2)}</span>
            <span className={styles.tick} style={{ left: '100%' }} data-bella-meta>{fmtAxis(max)}</span>
          </span>
          <span className={styles.pad} />
          <span className={styles.pad} />
        </div>
        {rows.map((r) => {
          const isOpen = !!open[r.id];
          const whyId = `${uid}-why-${r.id}`;
          return (
            <div key={r.id} className={styles.row} data-tone={r.tone} data-open={isOpen ? '' : undefined}>
              <span className={styles.name}>
                <span className={styles.title}>{r.name}</span>
                <span className={styles.nums} data-bella-meta>
                  {r.base == null ? one(r.value) : `${one(r.base)} → ${one(r.value)}`}
                </span>
              </span>
              <span className={styles.track} role="img" aria-label={spoken(r)} data-testid="gap-chart-track">
                {r.base != null ? (
                  <span
                    className={styles.gap}
                    style={{ left: pos(Math.min(r.base, r.value)), width: `calc(${pos(Math.max(r.base, r.value))} - ${pos(Math.min(r.base, r.value))})` }}
                  />
                ) : null}
                {r.base != null ? <span className={[styles.mark, styles.ring].join(' ')} style={{ left: pos(r.base) }} /> : null}
                <span className={[styles.mark, styles.dot].join(' ')} style={{ left: pos(r.value) }} />
              </span>
              <span className={styles.end}>
                {r.gap != null ? <span className={styles.gapNum}>{signed(r.gap)}</span> : null}
                <Tag tone={TONE_TAG[r.tone]}>{r.word}</Tag>
              </span>
              {r.why ? (
                <span className={styles.whyCell}>
                  <Button variant="tertiary" size="sm" ariaExpanded={isOpen} onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}>
                    {isOpen ? 'Hide' : 'Why'}
                  </Button>
                </span>
              ) : (
                <span className={styles.pad} />
              )}
              {r.why ? (
                <p id={whyId} className={styles.why} hidden={!isOpen}>
                  {r.why}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <Disclosure title="Table behind this chart">
        <DataTable caption={label} columns={columns} rows={tableRows} rowKey="id" density="compact" />
      </Disclosure>
    </div>
  );
}
