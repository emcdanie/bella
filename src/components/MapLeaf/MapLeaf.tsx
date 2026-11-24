import React, { type CSSProperties } from 'react';
import StatusDot from '../StatusDot/StatusDot';
import styles from './MapLeaf.module.css';

export type MapLeafState = 'ok' | 'attention' | 'failed' | 'blocked' | 'unmeasured';

export interface MapLeafProps {
  /** The step's name ("Tokens"). */
  name: string;
  /** Its state, drawn as BELLA's status dot in its tone; the word (`status`) is the cue that never relies on colour. */
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

/* One status mark in CHIP (her review, 24 Nov 2026): the state is BELLA's status dot and its word, not a shape of
 * its own. The word stays the cue that does not rely on colour. */
const TONE: Record<MapLeafState, 'success' | 'attention' | 'danger' | 'neutral'> = {
  ok: 'success',
  attention: 'attention',
  failed: 'danger',
  blocked: 'attention',
  unmeasured: 'neutral',
};

/**
 * One step of a mind map: bare text on the end of a branch, no box. Its name,
 * then its status dot and word, then an optional measured line. A button with
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
        <StatusDot tone={TONE[state]} label={status} />
        {detail ? (
          <span>
            <span aria-hidden="true">·</span> {detail}
          </span>
        ) : null}
      </span>
    </button>
  );
}
