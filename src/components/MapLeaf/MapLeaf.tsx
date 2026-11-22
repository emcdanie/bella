import React, { type CSSProperties } from 'react';
import styles from './MapLeaf.module.css';

export type MapLeafState = 'ok' | 'attention' | 'failed' | 'blocked' | 'unmeasured';

export interface MapLeafProps {
  /** The step's name ("Tokens"). */
  name: string;
  /** Its state. One shape each, so colour is never the only cue: ok a ticked circle, attention a triangle, failed a diamond, blocked a minus square, unmeasured a dashed circle. */
  state: MapLeafState;
  /** The word beside the shape ("Healthy", "Needs you"). Always shown. */
  status: string;
  /** An optional measured line after the word ("407 CSS variables"), in plain text. */
  detail?: string;
  /** The picked step: the light-blue fill and the 2px brand edge, as MapNode. Sets aria-pressed. */
  selected?: boolean;
  /** A step the picked one is linked to: a 1px brand edge. */
  related?: boolean;
  /** Selecting the step (a click, Enter or Space). */
  onSelect?: () => void;
  className?: string;
  style?: CSSProperties;
}

const SHAPE: Record<MapLeafState, React.ReactNode> = {
  ok: (
    <>
      <circle className={styles.ok} cx="7" cy="7" r="6" />
      <path d="M4 7.2l2 2 4-4.2" fill="none" />
    </>
  ),
  attention: (
    <>
      <path className={styles.attention} d="M7 1.5l6 10.5H1z" strokeLinejoin="round" />
      <path d="M7 5.5v3" fill="none" />
    </>
  ),
  failed: <path className={styles.failed} d="M7 1l6 6-6 6-6-6z" strokeLinejoin="round" />,
  blocked: (
    <>
      <rect className={styles.blocked} x="1.5" y="1.5" width="11" height="11" rx="2" />
      <path d="M4.5 7h5" fill="none" />
    </>
  ),
  unmeasured: <circle className={styles.unmeasured} cx="7" cy="7" r="6" strokeDasharray="2.5 2.5" />,
};

/**
 * One step of a mind map: bare text on the end of a branch, no box. Its name,
 * then a state shape and word, then an optional measured line. A button with
 * aria-pressed, 44 tall, with MapNode's selected state and focus ring.
 */
export default function MapLeaf({ name, state, status, detail, selected = false, related = false, onSelect, className, style }: MapLeafProps) {
  return (
    <button
      type="button"
      className={[styles.leaf, selected ? styles.selected : '', related && !selected ? styles.related : '', className].filter(Boolean).join(' ')}
      style={style}
      aria-pressed={selected}
      onClick={onSelect}
      data-bella-component="map-leaf"
      data-state={state}
    >
      <span className={styles.name}>{name}</span>
      <span className={styles.state}>
        <svg className={styles.shape} width="14" height="14" viewBox="0 0 14 14" data-bella-diagram="" role="img" aria-label={status}>
          {SHAPE[state]}
        </svg>
        <span>
          {/* the shape names itself with the word, so the visible word is not read twice */}
          <span aria-hidden="true">{status}</span>
          {detail ? <> <span aria-hidden="true">·</span> {detail}</> : null}
        </span>
      </span>
    </button>
  );
}
