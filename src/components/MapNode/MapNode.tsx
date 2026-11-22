import React, { type CSSProperties } from 'react';
import StatusDot, { type StatusDotProps } from '../StatusDot/StatusDot';
import styles from './MapNode.module.css';

export interface MapNodeProps {
  /** Figma "Title". The step's name ("Tokens"). */
  title: string;
  /** Figma "Status". The word after the dot ("Healthy", "Needs you", "Blocked: Figma"). */
  status: string;
  /**
   * Figma "tone". default = the strong edge; attention = the warning edge (a step that needs you);
   * blocked = the strong edge with a neutral dot, status "Blocked: <what>". Like Board cards, the edge is the status colour.
   */
  tone?: 'default' | 'attention' | 'blocked';
  /** The dot's colour. Missing = success for default, attention for attention, neutral for blocked. */
  statusTone?: StatusDotProps['tone'];
  /** Figma "selected". The selected step: light-blue fill and the 2px brand edge (one selected look). Sets aria-pressed. */
  selected?: boolean;
  /** Selecting the step (a click, Enter or Space). */
  onSelect?: () => void;
  /** Extra classes on the node. */
  className?: string;
  style?: CSSProperties;
}

const DOT: Record<NonNullable<MapNodeProps['tone']>, StatusDotProps['tone']> = {
  default: 'success',
  attention: 'attention',
  blocked: 'neutral',
};

/**
 * One step of a process map: its name and its health, as a flat box on the
 * board (no shadow). A button with aria-pressed, 176 wide. The dot lines up
 * with the title's left edge; the status word starts 8 after it.
 */
export default function MapNode({ title, status, tone = 'default', statusTone, selected = false, onSelect, className, style }: MapNodeProps) {
  return (
    <button
      type="button"
      className={[styles.node, styles[tone], selected ? styles.selected : '', className].filter(Boolean).join(' ')}
      style={style}
      aria-pressed={selected}
      onClick={onSelect}
      data-bella-component="map-node"
    >
      <span className={styles.title}>{title}</span>
      <span className={styles.status}>
        {/* the dot names itself for assistive tech; the word beside it is the visible copy */}
        <StatusDot label={status} showLabel={false} showWash={false} tone={statusTone ?? DOT[tone]} className={styles.dot} />
        <span aria-hidden="true">{status}</span>
      </span>
    </button>
  );
}
