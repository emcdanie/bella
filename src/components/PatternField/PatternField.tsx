import React, { useMemo } from 'react';
import { patternShapes } from '../../brand/pattern';
import styles from './PatternField.module.css';

export interface PatternFieldProps {
  /** The pattern seed; the same seed always draws the same field. */
  seed?: number;
  className?: string;
}

const W = 1600;
const H = 700;

/**
 * PatternField (brand refresh, 2026-09-22): the brand pattern as a quiet
 * hero background. Greyscale at about 7% (inverted grey at about 6% in
 * dark), fading out radially from the upper right. Decorative only:
 * aria-hidden, no interaction, never moves. It fills its positioned
 * parent; put it first inside a `position: relative` hero. Replaces the
 * dot grid.
 */
export default function PatternField({ seed = 7, className }: PatternFieldProps) {
  const shapes = useMemo(() => patternShapes(W, H, seed), [seed]);
  return (
    <svg
      className={[styles.field, className].filter(Boolean).join(' ')}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      data-bella-brand
      data-bella-component="pattern-field"
    >
      {shapes.map((s, i) => (
        <path
          key={i}
          d={s.d}
          fill={s.fill ?? 'none'}
          stroke={s.stroke}
          strokeWidth={s.strokeWidth}
          strokeLinecap={s.stroke ? 'round' : undefined}
        />
      ))}
    </svg>
  );
}
