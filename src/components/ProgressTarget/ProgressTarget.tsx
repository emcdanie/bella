import React, { type CSSProperties } from 'react';
import Tag from '../Tag/Tag';
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

/** Figma "Progress target" 1168:72541 (22 Nov publish, her pick "B · dashed
 * marker and label"): a 1.5 dashed line in border/brand at target %, from
 * the label's bottom to 4 below the bar, and a "Target n%" Tag (outline,
 * number face 600) above the bar. Up to 50 the label starts at the line and
 * runs right; above 50 it ends at the line, so it never sticks out of the
 * bar. Place it inside a position: relative track that has a 32 Target row
 * 8 above it (Progress does this with showTarget). The label is real text;
 * the bar's own name says the target too. */
export default function ProgressTarget({ target }: ProgressTargetProps) {
  const t = pct(target);
  return (
    <span
      className={[styles.target, t > 50 ? styles.end : styles.start].join(' ')}
      style={{ '--progress-target': `${t}%`, '--progress-target-rest': `${100 - t}%` } as CSSProperties}
      data-bella-component="progress-target"
    >
      <span className={styles.dash} aria-hidden="true" />
      <Tag variant="outline" className={styles.label} count={`Target ${t}%`} />
    </span>
  );
}
