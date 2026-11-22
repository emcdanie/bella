import React, { type CSSProperties, type ReactNode, useId } from 'react';
import type { BranchHue } from '../Branch/Branch';
import styles from './BranchGroup.module.css';

export interface BranchGroupProps {
  /** The group's name ("Sources"). */
  name: string;
  /** How many steps it holds. */
  count: number;
  /** The stage's colour on the bar at the left; the same name as the stage's Branch. It names the stage only. */
  hue?: BranchHue;
  /** Open: the steps show under the name. One group is open at a time on a phone; the caller keeps that rule. */
  open?: boolean;
  /** Open or close it (a click, Enter or Space on the head). */
  onToggle?: () => void;
  /** The steps: MapLeaf buttons. */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * A stage on a phone mind map: a tappable row with a colour bar at the left,
 * the stage's name, its count and a plus or minus. Opens to its steps. The
 * head is a button with aria-expanded; 48 tall.
 */
export default function BranchGroup({ name, count, hue = 'pink', open = false, onToggle, children, className, style }: BranchGroupProps) {
  const id = useId();
  return (
    <div className={[styles.group, styles[hue], className].filter(Boolean).join(' ')} style={style} data-bella-component="branch-group" data-open={open ? '' : undefined}>
      <button type="button" className={styles.head} aria-expanded={open} aria-controls={id} onClick={onToggle}>
        <span className={styles.name}>{name}</span>
        <span className={styles.meta}>
          <span className={styles.num}>{count}</span>
          <span className={styles.sign} aria-hidden="true">{open ? '−' : '+'}</span>
        </span>
      </button>
      {open ? (
        <ul id={id} className={styles.list}>
          {React.Children.toArray(children).map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
