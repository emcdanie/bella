import React, { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './Progress.module.css';
import ProgressTarget, { TargetMark } from '../ProgressTarget/ProgressTarget';
import Tooltip from '../Tooltip/Tooltip';
import { useReducedMotion } from '../shared/useCountTo';

/* Progress target and the private _Target mark are their own parts (Figma
 * 1168:72541); re-exported here so older imports keep working. */
export { ProgressTarget, TargetMark };
export type { ProgressTargetProps, TargetMarkProps } from '../ProgressTarget/ProgressTarget';

/** neutral (23 Nov, CHIP Drift): a measure nobody has taken yet ("not read from Figma"): grey, unknown, never a warning. */
export type ProgressTone = 'info' | 'success' | 'attention' | 'danger' | 'neutral';

/** Clamp to 0 to 100 so a bad number never draws outside the track. */
const pct = (n: number) => Math.min(100, Math.max(0, n));

/* ---------------------------------------------------------------------------
 * The pieces. Each is its own part in Figma; here they live in the Progress
 * folder and are exported so a legend or a chart can reuse the same mark.
 * ------------------------------------------------------------------------- */

export interface ProgressFillProps {
  /** Figma "value", 0 to 100. At 0 nothing is drawn: the track reads empty. */
  value: number;
  tone?: ProgressTone;
  /** A later part of a bar in parts: it follows the part before it, a 4 gap apart in the track's own colour. */
  part?: boolean;
}

/** Figma "Progress fill": the filled part of a bar, width = value %. */
export function ProgressFill({ value, tone = 'info', part = false }: ProgressFillProps) {
  const v = pct(value);
  if (v === 0) return null;
  return (
    <span
      className={[styles.fill, styles[tone], part ? styles.part : ''].filter(Boolean).join(' ')}
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
  /** Its place in the row, from 0: on draw-in the segments fill one after another, motion/stagger-120 apart. */
  order?: number;
}

/** Figma "Progress segment": one step of shape=segments. */
export function ProgressSegment({ tone = 'info', done = true, order = 0 }: ProgressSegmentProps) {
  return (
    <span
      className={[styles.segment, done ? styles[tone] : ''].filter(Boolean).join(' ')}
      style={{ '--progress-order': order } as CSSProperties}
      data-bella-component="progress-segment"
    />
  );
}

/* ---------------------------------------------------------------------------
 * Progress
 * ------------------------------------------------------------------------- */

export interface ProgressPart {
  /** This part's share of the track, 0 to 100. */
  value: number;
  /** What it is, in words ("specified, not in code"). Spoken, not drawn. */
  label: string;
  /** Status colour for this part. Default the bar's tone. */
  tone?: ProgressTone;
}

export interface ProgressProps {
  /** Figma "Label". What is measured. Stays the accessible name when hidden. */
  label: ReactNode;
  /** Figma "Value". The amount in words ("60%", "4 of 6"). */
  value?: ReactNode;
  /** Figma "Show label". Off hides the Head (label and value) visually. */
  showLabel?: boolean;
  /** Figma "Show target". Bar only: a 32 row above the track with a "Target n%" label and a dashed line at `target`. */
  showTarget?: boolean;
  /** Figma "shape". */
  shape?: 'bar' | 'segments' | 'ring';
  /** Figma "tone". Status colours for status only. */
  tone?: ProgressTone;
  /** Figma "Fill · value" (bar, ring): 0 to 100. */
  fill?: number;
  /** Figma "Target · target" (bar): 0 to 100. */
  target?: number;
  /** The target label in its own unit ("Target 7:1"); default "Target n%". Bar only, with showTarget. */
  targetLabel?: string;
  /** Bar with a target: false draws the thin tick only, with no "Target" tag and no 32 row for it (23 Nov). The target is still said in the summary and callout. Default true. */
  showTargetLabel?: boolean;
  /**
   * Bar only: a bar in parts (23 Nov, Gaps: "specified, not in code" beside "not in BELLA yet"). Each part is a share of
   * the whole track, 0 to 100, drawn one after another from the start; `fill` is ignored. Each says what it is in `label`,
   * which is spoken ("12 specified, not in code, 8 not in BELLA yet") and never drawn on the bar.
   */
  parts?: ProgressPart[];
  /** Segments only: how many steps (Figma draws 6; the gate uses 5). */
  segments?: number;
  /** Segments only: how many are done. */
  done?: number;
  /** Draws in once when it first appears: the bar grows, the ring sweeps, the segments fill, to the
   * value on motion/duration/450 and motion/easing/out; the target is there before the mark arrives.
   * Reduced motion: drawn at once. A demo for Health charts (21 Nov: "should we not put motion on the
   * graphs??"), off by default. */
  drawIn?: boolean;
  /**
   * The chart callout (22 Nov, CHIP chart language): hover or keyboard focus on the bar shows BELLA's
   * Tooltip 16 under the track, pointing up, with the amount and the target ("60% · target 90%").
   * true writes that text from `value` and `target`; a string says it instead ("4 of 5 · target 80%").
   * On, the bar takes keyboard focus. Off by default, so rows of bars add no tab stops.
   */
  callout?: boolean | string;
  /**
   * The chart's one-line summary (22 Nov reading: every chart has a summary behind it), read as the
   * bar's description (aria-describedby) and never drawn. Missing: written from the data, e.g.
   * "Contrast coverage: 95%, target 80%, above target".
   */
  summary?: string;
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
  targetLabel,
  showTargetLabel = true,
  parts,
  segments = 5,
  done = 0,
  drawIn = false,
  callout = false,
  summary,
  className,
  style,
}: ProgressProps) {
  const summaryId = useId();
  const still = useReducedMotion();
  const isSeg = shape === 'segments';
  const split = shape === 'bar' && parts && parts.length ? parts : null;
  const now = isSeg ? Math.min(segments, Math.max(0, done)) : split ? pct(split.reduce((t, x) => t + pct(x.value), 0)) : pct(fill);
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
  const amount = typeof value === 'string' || typeof value === 'number' ? String(value) : split ? split.map((x) => `${x.value}% ${x.label}`).join(', ') : isSeg ? `${now} of ${segments}` : `${now}%`;
  const withTarget = shape === 'bar' && showTarget;
  /* the one-line summary: what, how much, and where it stands against its target */
  const said = summary ?? (() => {
    const parts = [name ? `${name}: ${amount}` : amount];
    if (withTarget) {
      const t = pct(target);
      if (!/target/i.test(amount)) parts.push(`target ${t}%`);
      parts.push(now > t ? 'above target' : now < t ? 'below target' : 'at target');
    }
    return parts.join(', ');
  })();
  const described = (
    <span id={summaryId} className={styles.srOnly} data-bella-summary="">
      {said}
    </span>
  );
  const calloutText = typeof callout === 'string' ? callout : withTarget ? `${amount} · target ${pct(target)}%` : amount;
  const cls = [
    styles.root,
    shape === 'ring' ? styles.ringRoot : '',
    drawIn ? styles.drawIn : '',
    callout ? styles.focusable : '',
    still ? styles.still : '',
    className,
  ].filter(Boolean).join(' ');
  const focus = callout ? { tabIndex: 0 } : {};
  /* the callout: BELLA's Tooltip round the whole part (the bar is the trigger) */
  const withCallout = (node: React.ReactElement<{ 'aria-describedby'?: string }>) =>
    callout ? (
      <Tooltip label={calloutText} placement="bottom" className={styles.callout}>
        {node}
      </Tooltip>
    ) : (
      node
    );

  if (shape === 'ring') {
    return withCallout(
      <div className={cls} style={style} data-bella-component="progress" aria-label={name} aria-describedby={summaryId} {...aria} {...focus}>
        {described}
        <span className={styles.ring}>
          <span className={styles.ringTrack} aria-hidden="true" />
          {now > 0 ? (
            <span className={styles.ringArc} data-tone={tone} aria-hidden="true">
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
            </span>
          ) : null}
          {value != null ? <span className={styles.value}>{value}</span> : null}
        </span>
        <span className={showLabel ? styles.label : styles.srOnly}>{label}</span>
      </div>
    );
  }

  return withCallout(
    <div className={cls} style={style} data-bella-component="progress" aria-label={name} aria-describedby={summaryId} {...aria} {...focus}>
      {described}
      <div className={showLabel ? styles.head : styles.srOnly}>
        <span className={styles.label}>{label}</span>
        {value != null ? <span className={styles.value}>{value}</span> : null}
      </div>
      {isSeg ? (
        <div className={styles.segments} aria-hidden="true">
          {Array.from({ length: segments }, (_, i) => (
            <ProgressSegment key={i} tone={tone} done={i < now} order={i} />
          ))}
        </div>
      ) : (
        <>
        {/* Show target (22 Nov, her pick B): a 32 Target row between Head and
            Track, 8 apart, that the target's label sits in */}
        {showTarget ? <div className={[styles.targetRow, showTargetLabel ? '' : styles.targetRowTick].filter(Boolean).join(' ')} aria-hidden="true" /> : null}
        <div className={styles.track} aria-hidden="true">
          {split ? (
            split.map((x, i) => <ProgressFill key={i} value={Math.min(pct(x.value), 100 - split.slice(0, i).reduce((t, y) => t + pct(y.value), 0))} tone={x.tone ?? tone} part={i > 0} />)
          ) : (
            <ProgressFill value={now} tone={tone} />
          )}
          {band ? (
            <span
              key={band.key}
              className={[styles.band, styles[tone]].join(' ')}
              style={{ insetInlineStart: `${Math.min(band.from, band.to)}%`, inlineSize: `${Math.abs(band.to - band.from)}%` }}
              data-bella-change={band.to > band.from ? 'gain' : 'loss'}
            />
          ) : null}
          {showTarget ? <ProgressTarget target={target} label={targetLabel} showLabel={showTargetLabel} /> : null}
        </div>
        </>
      )}
    </div>
  );
}
