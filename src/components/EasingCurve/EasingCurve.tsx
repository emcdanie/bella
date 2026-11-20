import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './EasingCurve.module.css';

export type EasingCurveEasing = 'standard' | 'emphasis' | 'out' | 'draw' | 'pop';
export type DurationBarDuration = 150 | 200 | 250 | 400 | 450 | 900 | 3400;

/* The motion/easing tokens' control points (tokens/bella.css). The story's
 * play test checks each one against its CSS variable, so a token change that
 * is not copied here fails the gate. */
export const EASING_POINTS: Record<EasingCurveEasing, [number, number, number, number]> = {
  standard: [0.4, 0, 0.2, 1],
  emphasis: [0.34, 1.56, 0.64, 1],
  out: [0.22, 1, 0.36, 1],
  draw: [0.65, 0, 0.35, 1],
  pop: [0.34, 1.4, 0.64, 1],
};

const BOX = 48; /* the curve's square inside the 64 well, 8 from each side */

export interface EasingCurveProps {
  /** The motion/easing token the curve is drawn from. */
  easing: EasingCurveEasing;
  className?: string;
  style?: CSSProperties;
}

/**
 * One easing token drawn as its cubic-bezier curve, with the token name and
 * its value (CHIP Dashboard "Foundations · Motion" 810:82446, read 21 Nov
 * 2026). Use: the easing list on CHIP Foundations.
 */
export default function EasingCurve({ easing, className, style }: EasingCurveProps) {
  const [x1, y1, x2, y2] = EASING_POINTS[easing];
  const p = (n: number) => +(n * BOX).toFixed(2);
  const d = `M0 ${BOX} C${p(x1)} ${p(1 - y1)} ${p(x2)} ${p(1 - y2)} ${BOX} 0`;
  return (
    <div className={[styles.row, className].filter(Boolean).join(' ')} style={style} data-bella-component="easing-curve">
      <span className={styles.well}>
        {/* a diagram, the one named exception to the one-icon-set rule */}
        <svg
          className={styles.curve}
          viewBox={`0 0 ${BOX} ${BOX}`}
          overflow="visible"
          focusable="false"
          data-bella-diagram=""
          role="img"
          aria-label={`The ${easing} easing curve: how a move speeds up and slows down over its time`}
        >
          <path d={d} />
        </svg>
      </span>
      <span className={styles.text}>
        <span className={styles.token}>motion/easing/{easing}</span>
        <span className={styles.value}>cubic-bezier({[x1, y1, x2, y2].join(', ')})</span>
      </span>
    </div>
  );
}

export interface DurationBarProps {
  /** The motion/duration token; the bar is to scale against the longest (3400ms). */
  duration: DurationBarDuration;
  /** What the duration is for ("fast", "hover lift"). Missing = off. */
  use?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** One duration token as a to-scale bar, with its name, use and value (same Figma section). */
export function DurationBar({ duration, use, className, style }: DurationBarProps) {
  return (
    <div className={[styles.duration, className].filter(Boolean).join(' ')} style={style} data-bella-component="duration-bar">
      <span className={styles.name}>
        <span className={styles.token}>motion/duration/{duration}</span>
        {use != null ? <span className={styles.value}>{use}</span> : null}
      </span>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.fill} style={{ inlineSize: `${(duration / 3400) * 100}%` }} />
      </span>
      <span className={styles.ms}>{duration}ms</span>
    </div>
  );
}
