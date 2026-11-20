import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './Progress.module.css';

export type ProgressTone = 'info' | 'success' | 'attention' | 'danger';

/** Clamp to 0 to 100 so a bad number never draws outside the track. */
const pct = (n: number) => Math.min(100, Math.max(0, n));

/* ---------------------------------------------------------------------------
 * The pieces. Each is its own part in Figma; here they live in the Progress
 * folder and are exported so a legend or a chart can reuse the same mark.
 * ------------------------------------------------------------------------- */

export interface TargetMarkProps {
  className?: string;
  style?: CSSProperties;
}

/** Figma "_Target mark" (private): the one target mark. 4 wide, round ends,
 * border/brand, as tall as its frame. Also the key in a "Target N%" legend. */
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

export interface ProgressFillProps {
  /** Figma "value", 0 to 100. At 0 nothing is drawn: the track reads empty. */
  value: number;
  tone?: ProgressTone;
}

/** Figma "Progress fill": the filled part of a bar, width = value %. */
export function ProgressFill({ value, tone = 'info' }: ProgressFillProps) {
  const v = pct(value);
  if (v === 0) return null;
  return (
    <span
      className={[styles.fill, styles[tone]].join(' ')}
      style={{ '--progress-fill': `${v}%` } as CSSProperties}
      data-bella-component="progress-fill"
    />
  );
}

export interface ProgressSegmentProps {
  /** Figma "tone". */
  tone?: ProgressTone;
  /** Figma "done". true takes the tone's mark, false the track. */
  done?: boolean;
}

/** Figma "Progress segment": one step of shape=segments. */
export function ProgressSegment({ tone = 'info', done = true }: ProgressSegmentProps) {
  return (
    <span
      className={[styles.segment, done ? styles[tone] : ''].filter(Boolean).join(' ')}
      data-bella-component="progress-segment"
    />
  );
}

export interface ProgressTargetProps {
  /** Figma "target", 0 to 100. */
  target: number;
}

/** Figma "Progress target": the named overlay over the track (absolute, as
 * code positions it), holding the Target mark at left: target %. */
export function ProgressTarget({ target }: ProgressTargetProps) {
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

/* ---------------------------------------------------------------------------
 * Progress
 * ------------------------------------------------------------------------- */

export interface ProgressProps {
  /** Figma "Label". What is measured. Stays the accessible name when hidden. */
  label: ReactNode;
  /** Figma "Value". The amount in words ("60%", "4 of 6"). */
  value?: ReactNode;
  /** Figma "Show label". Off hides the Head (label and value) visually. */
  showLabel?: boolean;
  /** Figma "Show target". Bar only: draws the Target mark at `target`. */
  showTarget?: boolean;
  /** Figma "shape". */
  shape?: 'bar' | 'segments' | 'ring';
  /** Figma "tone". Status colours for status only. */
  tone?: ProgressTone;
  /** Figma "Fill · value" (bar, ring): 0 to 100. */
  fill?: number;
  /** Figma "Target · target" (bar): 0 to 100. */
  target?: number;
  /** Segments only: how many steps (Figma draws 6; the gate uses 5). */
  segments?: number;
  /** Segments only: how many are done. */
  done?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * How far something has got, as a bar, a row of segments or a ring. Always
 * shown with words. Not interactive. role="progressbar" with the amount.
 */
export default function Progress({
  label,
  value,
  showLabel = true,
  showTarget = false,
  shape = 'bar',
  tone = 'info',
  fill = 0,
  target = 0,
  segments = 6,
  done = 0,
  className,
  style,
}: ProgressProps) {
  const isSeg = shape === 'segments';
  const now = isSeg ? Math.min(segments, Math.max(0, done)) : pct(fill);
  /* A new amount (rule "Motion that shows what happened", item 5): the bar
   * and the ring move from the old amount to the new one (a transition on
   * the registered --progress-fill), and on a bar the stretch gained or lost
   * shows once as a band that fades. Nothing moves on first paint; reduced
   * motion shows the new amount at once, no band. */
  const before = useRef(now);
  const [band, setBand] = useState<{ from: number; to: number; key: number } | null>(null);
  useEffect(() => {
    if (before.current === now) return;
    const from = before.current;
    before.current = now;
    if (shape === 'bar') setBand((b) => ({ from, to: now, key: (b?.key ?? 0) + 1 }));
  }, [now, shape]);
  const aria = {
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': isSeg ? segments : 100,
    'aria-valuenow': now,
    'aria-valuetext': typeof value === 'string' ? value : undefined,
  } as const;
  const name = typeof label === 'string' ? label : undefined;
  const cls = [styles.root, shape === 'ring' ? styles.ringRoot : '', className].filter(Boolean).join(' ');

  if (shape === 'ring') {
    return (
      <div className={cls} style={style} data-bella-component="progress" aria-label={name} {...aria}>
        <span className={styles.ring}>
          <span className={styles.ringTrack} aria-hidden="true" />
          {now > 0 ? (
            <>
              <span
                className={[styles.ringFill, styles[tone]].join(' ')}
                style={{ '--progress-fill': `${now}%` } as CSSProperties}
                aria-hidden="true"
              />
              <span className={[styles.ringCap, styles[tone]].join(' ')} aria-hidden="true" />
              <span
                className={[styles.ringCap, styles.ringEnd, styles[tone]].join(' ')}
                style={{ '--progress-turn': `${now * 3.6}deg` } as CSSProperties}
                aria-hidden="true"
              />
            </>
          ) : null}
          {value != null ? <span className={styles.value}>{value}</span> : null}
        </span>
        <span className={showLabel ? styles.label : styles.srOnly}>{label}</span>
      </div>
    );
  }

  return (
    <div className={cls} style={style} data-bella-component="progress" aria-label={name} {...aria}>
      <div className={showLabel ? styles.head : styles.srOnly}>
        <span className={styles.label}>{label}</span>
        {value != null ? <span className={styles.value}>{value}</span> : null}
      </div>
      {isSeg ? (
        <div className={styles.segments} aria-hidden="true">
          {Array.from({ length: segments }, (_, i) => (
            <ProgressSegment key={i} tone={tone} done={i < now} />
          ))}
        </div>
      ) : (
        <div className={styles.track} aria-hidden="true">
          <ProgressFill value={now} tone={tone} />
          {band ? (
            <span
              key={band.key}
              className={[styles.band, styles[tone]].join(' ')}
              style={{ insetInlineStart: `${Math.min(band.from, band.to)}%`, inlineSize: `${Math.abs(band.to - band.from)}%` }}
              data-bella-change={band.to > band.from ? 'gain' : 'loss'}
            />
          ) : null}
          {showTarget ? <ProgressTarget target={target} /> : null}
        </div>
      )}
    </div>
  );
}
