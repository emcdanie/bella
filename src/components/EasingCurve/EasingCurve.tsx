import React, { type CSSProperties, type ReactNode, useState } from 'react';
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
  /** The row becomes a button: select it and a pink dot rides the curve, time across, progress up, over 900ms on the token's own easing. Under reduced motion the dot jumps to the end. */
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * One easing token drawn as its cubic-bezier curve, with the token name and
 * its value (CHIP Dashboard "Foundations · Motion" 810:82446, read 21 Nov
 * 2026). Use: the easing list on CHIP Foundations.
 */
export default function EasingCurve({ easing, animated, className, style }: EasingCurveProps) {
  const [run, setRun] = useState(0);
  const [x1, y1, x2, y2] = EASING_POINTS[easing];
  const p = (n: number) => +(n * BOX).toFixed(2);
  const d = `M0 ${BOX} C${p(x1)} ${p(1 - y1)} ${p(x2)} ${p(1 - y2)} ${BOX} 0`;
  const well = (
    <span className={styles.well}>
      <span className={styles.plot}>
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
        {animated ? <span key={run} className={[styles.rider, run ? styles.ride : ''].join(' ')} style={{ animationTimingFunction: `linear, var(--motion-easing-${easing})` }} aria-hidden="true" /> : null}
      </span>
    </span>
  );
  const text = (
    <span className={styles.text}>
      <span className={styles.token}>motion/<wbr />easing/<wbr />{easing}</span>
      <span className={styles.value}>
        <span className={styles.nowrap}>cubic-bezier({x1},</span> {y1}, {x2}, {y2})
      </span>
    </span>
  );
  const cls = [styles.row, animated && styles.playable, className].filter(Boolean).join(' ');
  if (animated) {
    return (
      <button type="button" className={cls} style={style} data-bella-component="easing-curve" aria-label={`Play ${easing} easing, motion/easing/${easing}`} onClick={() => setRun((n) => n + 1)}>
        {well}
        {text}
      </button>
    );
  }
  return (
    <div className={cls} style={style} data-bella-component="easing-curve">
      {well}
      {text}
    </div>
  );
}

export interface DurationBarProps {
  /** The motion/duration token; the bar is to scale against the longest (3400ms). */
  duration: DurationBarDuration;
  /** What the duration is for ("fast", "hover lift"). Missing = off. */
  use?: ReactNode;
  /** The row becomes a button: select it and a pink dot crosses the track in exactly this duration, on a straight line. Under reduced motion the dot jumps to the end. */
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

/** One duration token as a to-scale bar, with its name, use and value (same Figma section). */
export function DurationBar({ duration, use, animated, className, style }: DurationBarProps) {
  const [run, setRun] = useState(0);
  const cls = [styles.duration, animated && styles.playable, className].filter(Boolean).join(' ');
  const body = (
    <>
      <span className={styles.name}>
        <span className={styles.token}>motion/<wbr />duration/<wbr />{duration}</span>
        {use != null ? <span className={styles.value}>{typeof use === 'string' ? use.split(' ').map((w, i) => <React.Fragment key={i}>{i ? ' ' : null}<span className={styles.nowrap}>{w}</span></React.Fragment>) : use}</span> : null}
      </span>
      {/* the bar and its ms wrap together, never apart */}
      <span className={styles.bar}>
        <span className={styles.track} aria-hidden="true">
          <span className={styles.fill} style={{ inlineSize: `${(duration / 3400) * 100}%` }} />
          {animated ? <span key={run} className={[styles.dot, run ? styles.cross : ''].join(' ')} style={{ animationDuration: `var(--motion-duration-${duration})` }} /> : null}
        </span>
        <span className={styles.ms}>{duration}ms</span>
      </span>
    </>
  );
  if (animated) {
    return (
      <button type="button" className={cls} style={style} data-bella-component="duration-bar" aria-label={`Play ${duration}ms, motion/duration/${duration}`} onClick={() => setRun((n) => n + 1)}>
        {body}
      </button>
    );
  }
  return (
    <div className={cls} style={style} data-bella-component="duration-bar">
      {body}
    </div>
  );
}
