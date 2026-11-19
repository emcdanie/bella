import React, { type CSSProperties } from 'react';
import Icon from '../Icon/Icon';
import styles from './MapLine.module.css';

export type MapLineCorner = 'none' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface MapLineProps {
  /** Figma "direction". horizontal and vertical stretch to their box; turn is a 24 box with a 16-radius quarter curve. */
  direction?: 'horizontal' | 'vertical' | 'turn';
  /** Figma "end". Arrow on the last piece only (straight pieces; Figma draws turns with none). */
  end?: 'arrow' | 'none';
  /** Figma "style" (code cannot use `style`, the CSS prop; same move as Tag's
   * variant). dashed = an optional path, or a step not yet done. */
  variant?: 'solid' | 'dashed';
  /** Figma "tone". default = border/strong; accent = the open node. */
  tone?: 'default' | 'accent';
  /** Figma "corner". Turn only: which corner the curve bends round. */
  corner?: MapLineCorner;
  className?: string;
  style?: CSSProperties;
}

/* Turn: a 16-radius quarter curve in a 24 box, measured from the Figma
 * vectors (16 x 16 at x/y 0 or 8), drawn as the rounded corner of a CSS
 * border (no inline SVG, one-set rule). Every bend is a curve, never a
 * square elbow (guideline 17). */
const TURN_CLASS: Record<Exclude<MapLineCorner, 'none'>, string> = {
  'top-left': styles.arcTopLeft,
  'top-right': styles.arcTopRight,
  'bottom-left': styles.arcBottomLeft,
  'bottom-right': styles.arcBottomRight,
};

/**
 * A line between two nodes (Map, Step row, pipeline). 2px in its tone.
 * Decorative: the words beside it carry the meaning, so it is aria-hidden.
 */
export default function MapLine({
  direction = 'horizontal',
  end = 'arrow',
  variant = 'solid',
  tone = 'default',
  corner = 'none',
  className,
  style,
}: MapLineProps) {
  const cls = [styles.root, styles[direction], styles[tone], variant === 'dashed' ? styles.dashed : '', className]
    .filter(Boolean)
    .join(' ');

  if (direction === 'turn') {
    const arc = TURN_CLASS[corner === 'none' ? 'top-left' : corner];
    return (
      <span className={cls} style={style} aria-hidden="true" data-bella-component="map-line">
        <span className={[styles.arc, arc].join(' ')} />
      </span>
    );
  }

  return (
    <span className={cls} style={style} aria-hidden="true" data-bella-component="map-line">
      <span className={styles.path} />
      {end === 'arrow' ? (
        <Icon name={direction === 'vertical' ? 'NavArrowDown' : 'NavArrowRight'} size="sm" className={styles.arrow} />
      ) : null}
    </span>
  );
}
