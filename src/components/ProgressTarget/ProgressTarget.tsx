import React, { type CSSProperties } from 'react';
import styles from './ProgressTarget.module.css';

const pct = (n: number) => Math.min(100, Math.max(0, n));

export interface TargetMarkProps {
  className?: string;
  style?: CSSProperties;
}

/** Figma "_Target mark" (private): the one target mark. 4 wide, round ends,
 * border/brand, as tall as its frame, with a 1px edge in background/surface
 * outside it so it reads on the fill (21 Nov publish). Also the key in a
 * "Target N%" legend. */
export function TargetMark({ className, style }: TargetMarkProps) {
  return (
    <span
      className={[styles.targetMark, className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden="true"
      data-bella-component="target-mark"
    />
  );
}

export interface ProgressTargetProps {
  /** Figma "target", 0 to 100. */
  target: number;
}

/** Figma "Progress target" 1168:72541 (21 Nov publish): the named overlay
 * over the track (absolute, as code positions it), the bar's own height
 * (8), holding the Target mark centred on target %. Place it inside a
 * position: relative track. */
export default function ProgressTarget({ target }: ProgressTargetProps) {
  return (
    <span
      className={styles.target}
      style={{ '--progress-target': `${pct(target)}%` } as CSSProperties}
      data-bella-component="progress-target"
    >
      <TargetMark className={styles.targetPlaced} />
    </span>
  );
}

