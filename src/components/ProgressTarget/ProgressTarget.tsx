import React, { type CSSProperties, useLayoutEffect, useRef } from 'react';
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
  /** Figma "target", 0 to 100: where the dash sits on the track. The caller maps its own value onto the track. */
  target: number;
  /** Figma exposed Label (22 Nov): the label in its own unit, e.g. "Target 7:1" or "Target 5 of 5". Default "Target n%". */
  label?: string;
}

/** Figma "Progress target" 1168:72541 (22 Nov publish, her pick B · dashed
 * marker and label; centred 22 Nov): a 1.5 dashed line in border/brand at
 * target %, 8 above and 8 below the 8 bar so the bar sits in its middle, and
 * a "Target n%" Tag (outline, number face 600) centred on the line above the
 * bar. Only where centring would push the label past an end of the track does
 * it stop at that end. Place it inside a position: relative track that has a
 * 32 Target row 8 above it (Progress does this with showTarget). The label is
 * real text; the bar's own name says the target too. */
export default function ProgressTarget({ target, label: text }: ProgressTargetProps) {
  const t = pct(target);
  const root = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  // Centred on the line by CSS; this only pulls the label back inside the
  // track when centring would push it past an end (Figma: targets near 0 or 100).
  useLayoutEffect(() => {
    const r = root.current;
    const l = label.current;
    if (!r || !l) return undefined;
    const place = () => {
      const w = r.clientWidth;
      const lw = l.offsetWidth;
      const centre = (t / 100) * w;
      const left = Math.min(Math.max(centre - lw / 2, 0), Math.max(w - lw, 0));
      // CSS already centres it at centre - lw / 2; shift only the overflow.
      l.style.setProperty('--progress-target-shift', `${left - (centre - lw / 2)}px`);
    };
    place();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(place);
    ro.observe(r);
    return () => ro.disconnect();
  }, [t]);
  return (
    <span
      ref={root}
      className={styles.target}
      style={{ '--progress-target': `${t}%` } as CSSProperties}
      data-bella-component="progress-target"
    >
      <span className={styles.dash} aria-hidden="true" />
      <span ref={label} className={styles.label}>
        <Tag variant="outline" count={text ?? `Target ${t}%`} />
      </span>
    </span>
  );
}
