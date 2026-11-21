import React, { type CSSProperties, type ReactNode } from 'react';
import IconWell from '../IconWell/IconWell';
import Trailing from '../Trailing/Trailing';
import Progress from '../Progress/Progress';
import useCountTo from '../shared/useCountTo';
import type { IconName } from '../Icon/Icon';
import styles from './StatCard.module.css';

export type StatCardTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

/* Figma tone onto the parts' own names: Progress has no neutral (a neutral
   card is chart=none or empty, where no mark is drawn) */
const PROGRESS_TONE = { info: 'info', success: 'success', warning: 'attention', danger: 'danger', neutral: 'info' } as const;
const WELL_TONE = { info: 'info', success: 'success', warning: 'warning', danger: 'error', neutral: 'neutral' } as const;

export interface StatCardMeter {
  /** Bar: Progress "Fill · value", 0 to 100. */
  fill?: number;
  /** Bar: Progress "Target · target", 0 to 100. Drawn when set. */
  target?: number;
  /** Bar: the target in its own unit, e.g. "7:1" or "5 of 5". Default is the target as a percent. Drawn on the label ("Target 7:1") and spoken ("..., target 7:1"). */
  targetText?: string;
  /** Segments: how many. */
  segments?: number;
  /** Segments: how many are done. */
  done?: number;
  /** Accessible amount in words ("1 of 2"). Defaults to value + unit. */
  valueText?: string;
}

export interface StatCardProps {
  /** Figma "Title". The card title, and the chart's accessible name. */
  title: ReactNode;
  /** Figma "Label" (22 Nov chart language): a small-caps line above the big number saying what it
   * counts ("Have pairs"). Drawn on chart=empty too, where the number is not. Missing = off. */
  label?: ReactNode;
  /** Figma "Value". The big number. Not drawn on chart=empty: no figure before a measure. */
  value?: ReactNode;
  /** Figma "Unit". Small, beside the number ("%", "of 2"). Missing = off. */
  unit?: ReactNode;
  /** Figma "Context". One short meta line (subtext face, 14) worked out from real numbers: what the number means and which way. */
  context?: ReactNode;
  /** Figma "Empty count" (21 Nov publish). Kept for compatibility, not drawn: chart=empty shows no figure before a measure (22 Nov 19:08). Removal waits for Elleta's yes (public API). */
  emptyCount?: ReactNode;
  /** Figma "Empty total" (21 Nov publish). Kept for compatibility, not drawn (see emptyCount). */
  emptyTotal?: ReactNode;
  /** Figma "Caption". Footer left: the target or where it came from. */
  caption?: ReactNode;
  /** Figma "Show button". Footer right: a secondary Button only when it acts ("Set target"), never to navigate. Missing = off. */
  button?: ReactNode;
  /**
   * Figma "chart". none: the number only (counts such as Runs). empty: no
   * data yet: the title, the empty bar, the context line and the footer
   * ("Not compared yet" with its Compare action), and no number (22 Nov
   * 19:08: a number only once something is measured).
   */
  chart?: 'bar' | 'segments' | 'none' | 'empty';
  /** Figma "tone". Status only: the icon well and the chart marks; a count with no status is neutral. */
  tone?: StatCardTone;
  /** Figma Icon well icon swap. */
  icon: IconName;
  /** The chart's numbers for bar and segments. Missing = no chart. */
  meter?: StatCardMeter;
  /** Header opens the detail: a link. The whole 44 header row is the target and carries the ↗. */
  href?: string;
  /** Header opens the detail: a button. Ignored when `href` is set. */
  onOpen?: () => void;
  /** Chart motion (22 Nov, CHIP chart language): when the card first shows, the bar grows from the
   * start (segments fill one after another) and a numeric value counts up from 0, over
   * motion/duration/450 on motion/easing/out; a new value slides and counts from the old one. Reduced
   * motion: the end state at once. On by default; false shows the first value still. */
  drawIn?: boolean;
  /**
   * The chart's one-line summary (22 Nov reading), passed to Progress and read as the bar's
   * description, never drawn. Missing: written from the title, value and target ("Contrast
   * coverage: 95%, target 80%, above target").
   */
  summary?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * One figure on a card (published 21 Nov, one pattern; chart language 22 Nov):
 * header (icon well, title, ↗), body (small-caps label over number and unit,
 * chart, one meta line), footer (caption, optional action), all from one left
 * edge, no indent. Cards in a row share the tallest height; the body fills it
 * with its content centred and the footer stays on the bottom edge.
 */
export default function StatCard({
  title,
  label,
  value,
  unit,
  context,
  caption,
  button,
  chart = 'bar',
  tone = 'success',
  icon,
  meter,
  href,
  onOpen,
  drawIn = true,
  summary,
  className,
  style,
}: StatCardProps) {
  const opens = href != null || onOpen != null;
  const headInner = (
    <>
      {/* Figma Header (21 Nov): the 36 Icon well, 12, the title, the ↗ */}
      <IconWell icon={icon} tone={WELL_TONE[tone]} className={WELL_TONE[tone] === 'neutral' ? styles.neutralGlyph : undefined} />
      <span className={styles.title}>{title}</span>
      {opens ? <Trailing /> : null}
    </>
  );
  const header = href ? (
    <a className={[styles.header, styles.opens].join(' ')} href={href}>
      {headInner}
    </a>
  ) : onOpen ? (
    <button type="button" className={[styles.header, styles.opens].join(' ')} onClick={onOpen}>
      {headInner}
    </button>
  ) : (
    <div className={styles.header}>{headInner}</div>
  );

  /* chart=empty: no figure before a measure (22 Nov 19:08) */
  const empty = chart === 'empty';
  /* a plain number counts from the old value to the new one (from 0 when it first shows) */
  const asNumber = typeof value === 'number' ? value : typeof value === 'string' && /^-?\d+(\.\d+)?$/.test(value) ? Number(value) : null;
  const count = useCountTo(asNumber ?? 0, drawIn ? { from: 0 } : {});
  const plain = (x: ReactNode) => typeof x === 'string' || typeof x === 'number';
  const said = meter?.valueText ?? (plain(value) && unit === '%' ? `${value}%` : [value, unit].filter(plain).join(' '));
  /* the meter is spoken with its target ("95%, target 90%"), Figma description; the callout says
     the same with a dot ("95% · target 90%") */
  const targetWord = meter?.targetText ?? (meter?.target != null ? `${meter.target}%` : undefined);
  const words = chart === 'bar' && meter?.target != null && said ? `${said}, target ${targetWord}` : said;
  const calloutText = meter?.target != null && said ? `${said} · target ${targetWord}` : said;

  return (
    <section
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={style}
      data-bella-component="stat-card"
      data-bella-reveal={drawIn ? '' : undefined}
    >
      {header}
      <div className={styles.body}>
        {/* Label and number, one group 4 apart (22 Nov chart language) */}
        {label != null || !empty ? (
          <div className={styles.lead}>
            {label != null ? <p className={styles.label} data-bella-meta>{label}</p> : null}
            {empty ? null : (
              <p className={styles.number}>
                {asNumber != null ? (
                  <span className={styles.value}>
                    {/* the drawing counts; assistive tech reads the final value only */}
                    <span aria-hidden="true">{count.shown}</span>
                    <span className={styles.srOnly}>{value}</span>
                  </span>
                ) : (
                  <span className={styles.value}>{value}</span>
                )}
                {unit != null && unit !== '' ? <span className={styles.unit}>{unit}</span> : null}
              </p>
            )}
          </div>
        ) : null}
        {empty ? (
          <Progress
            label={typeof title === 'string' ? title : 'Progress'}
            value="Not measured"
            showLabel={false}
            shape="bar"
            fill={0}
            summary={summary}
          />
        ) : meter && chart !== 'none' ? (
          <Progress
            callout={calloutText || true}
            label={typeof title === 'string' ? title : 'Progress'}
            value={words || undefined}
            showLabel={false}
            shape={chart}
            tone={PROGRESS_TONE[tone]}
            fill={meter.fill}
            target={meter.target}
            targetLabel={meter.targetText != null ? `Target ${meter.targetText}` : undefined}
            showTarget={chart === 'bar' && meter.target != null}
            segments={meter.segments}
            done={meter.done}
            drawIn={drawIn}
            summary={summary}
          />
        ) : null}
        {context != null ? <p className={styles.context} data-bella-meta>{context}</p> : null}
      </div>
      {caption != null || button != null ? (
        <div className={styles.footer}>
          {caption != null ? <span className={styles.caption}>{caption}</span> : <span />}
          {button}
        </div>
      ) : null}
    </section>
  );
}
