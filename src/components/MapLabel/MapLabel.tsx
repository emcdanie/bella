import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './MapLabel.module.css';

export interface MapLabelProps {
  /** root = the map's name in a rounded white box (the left of a mind map); stage = a stage's name as bare bold text, where its branches meet. */
  kind?: 'root' | 'stage';
  /** The name. */
  children: ReactNode;
  /** The element: a heading level when it titles a region, else a div. */
  as?: 'h2' | 'h3' | 'h4' | 'div';
  className?: string;
  style?: CSSProperties;
}

/**
 * A node of a mind map that is not a step: the root, or a stage's name.
 * Not interactive. A stage name carries no box and no state, because its
 * colour is on its branches and its steps carry their own states.
 */
export default function MapLabel({ kind = 'stage', children, as = 'div', className, style }: MapLabelProps) {
  const El = as;
  return (
    <El className={[styles.label, styles[kind], className].filter(Boolean).join(' ')} style={style} data-bella-component="map-label" data-kind={kind}>
      {children}
    </El>
  );
}
