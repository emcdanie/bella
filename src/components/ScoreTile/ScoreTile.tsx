import React, { type CSSProperties, type ReactNode } from 'react';
import StatusDot from '../StatusDot/StatusDot';
import styles from './ScoreTile.module.css';

export type ScoreTileTone = 'neutral' | 'success' | 'attention' | 'danger';

export interface ScoreTileProps {
  /** What the number is ("No file", "AGENTS.md"). Above the number. */
  label: ReactNode;
  /** The score, in the number face, centred. */
  value: ReactNode;
  /** A short unit after the number ("out of 100"). Missing = off. */
  unit?: ReactNode;
  /** The light tint, one meaning each: neutral the base, success ahead, attention behind, danger failing. */
  tone?: ScoreTileTone;
  /** The state word under the number with its status dot ("ahead", "behind"), so colour is never the only cue. Missing = no word (neutral base). */
  word?: ReactNode;
  /** Picked: the 2px brand edge, announced as pressed. Only with onSelect. */
  selected?: boolean;
  /** Makes the tile a button (a toggle, aria-pressed); without it the tile is plain content. */
  onSelect?: () => void;
  className?: string;
  style?: CSSProperties;
}

const DOT = { neutral: 'neutral', success: 'success', attention: 'attention', danger: 'danger' } as const;

/**
 * One score in a tile (Audit reports, 24 Nov 2026: four scores side by side read as off centre): the label above,
 * the number centred in the number face, a light tint by its tone and the state word with BELLA's status dot.
 * Tiles in a row share their size; the consumer lays them on the grid. With onSelect it is a toggle button.
 */
export default function ScoreTile({ label, value, unit, tone = 'neutral', word, selected = false, onSelect, className, style }: ScoreTileProps) {
  const body = (
    <>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        {value}
        {unit ? <span className={styles.unit}> {unit}</span> : null}
      </span>
      {word ? <StatusDot tone={DOT[tone]} label={word} /> : <span className={styles.spacer} aria-hidden="true" />}
    </>
  );
  const cls = [styles.tile, styles[tone], onSelect && selected ? styles.selected : '', className].filter(Boolean).join(' ');
  return onSelect ? (
    <button type="button" className={cls} style={style} aria-pressed={selected} onClick={onSelect} data-bella-component="score-tile">
      {body}
    </button>
  ) : (
    <div className={cls} style={style} data-bella-component="score-tile">
      {body}
    </div>
  );
}
