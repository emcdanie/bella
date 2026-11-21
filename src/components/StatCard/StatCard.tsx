import React, { type CSSProperties, type ReactNode } from 'react';
import IconWell from '../IconWell/IconWell';
import Trailing from '../Trailing/Trailing';
import Progress from '../Progress/Progress';
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
  /** Figma "Value". The big number. */
  value: ReactNode;
  /** Figma "Unit". Small, beside the number ("%", "of 2"). Missing = off. */
  unit?: ReactNode;
  /** Figma "Context". One line worked out from real numbers: what the number means and which way. */
  context?: ReactNode;
  /** Figma "Empty count" (21 Nov publish): the number on chart=empty, 0 by default. */
  emptyCount?: ReactNode;
  /** Figma "Empty total" (21 Nov publish): the unit on chart=empty ("of 44"); missing = `unit`. */
  emptyTotal?: ReactNode;
  /** Figma "Caption". Footer left: the target or where it came from. */
  caption?: ReactNode;
  /** Figma "Show button". Footer right: a secondary Button only when it acts ("Set target"), never to navigate. Missing = off. */
  button?: ReactNode;
  /**
   * Figma "chart". none: the number only (counts such as Runs). empty: no
   * data yet, the same card with the count at zero, an empty bar, and the
   * footer saying why with an action (her 21 Nov pick A).
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
  /** The chart draws in once when the card first appears (Progress drawIn). Off by default (demo). */
  drawIn?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * One figure on a card (published 21 Nov, one pattern): header (icon well,
 * title, ↗), body (number and unit, chart, context), footer (caption,
 * optional action), all from one left edge, no indent. Cards in a row share
 * a height; the body centres between header and footer.
 */
export default function StatCard({
  title,
  value,
  unit,
  emptyCount = 0,
  emptyTotal,
  context,
  caption,
  button,
  chart = 'bar',
  tone = 'success',
  icon,
  meter,
  href,
  onOpen,
  drawIn = false,
  className,
  style,
}: StatCardProps) {
  const opens = href != null || onOpen != null;
  const headInner = (
    <>
      {/* Figma Header (21 Nov): the 36 Icon well, 12, the title, the ↗ */}
      <IconWell icon={icon} tone={WELL_TONE[tone]} />
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

  /* Figma chart=empty binds Value and Unit to Empty count and Empty total */
  const empty = chart === 'empty';
  const shownValue = empty ? emptyCount : value;
  const shownUnit = empty ? (emptyTotal ?? unit) : unit;
  const said = meter?.valueText ?? [value, unit].filter((x) => typeof x === 'string' || typeof x === 'number').join(' ');
  /* the meter is spoken with its target ("95%, target 90%"), Figma description */
  const words = chart === 'bar' && meter?.target != null && said ? `${said}, target ${meter.target}%` : said;
  const emptyWords = [shownValue, shownUnit].filter((x) => typeof x === 'string' || typeof x === 'number').join(' ');

  return (
    <section
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={style}
      data-bella-component="stat-card"
    >
      {header}
      <div className={styles.body}>
        <p className={styles.number}>
          <span className={styles.value}>{shownValue}</span>
          {shownUnit != null && shownUnit !== '' ? <span className={styles.unit}>{shownUnit}</span> : null}
        </p>
        {chart === 'empty' ? (
          <Progress
            className={styles.meter}
            label={typeof title === 'string' ? title : 'Progress'}
            value={emptyWords || undefined}
            showLabel={false}
            shape="bar"
            fill={0}
          />
        ) : meter && chart !== 'none' ? (
          <Progress
            className={styles.meter}
            label={typeof title === 'string' ? title : 'Progress'}
            value={words || undefined}
            showLabel={false}
            shape={chart}
            tone={PROGRESS_TONE[tone]}
            fill={meter.fill}
            target={meter.target}
            showTarget={chart === 'bar' && meter.target != null}
            segments={meter.segments}
            done={meter.done}
            drawIn={drawIn}
          />
        ) : null}
        {context != null ? <p className={styles.context}>{context}</p> : null}
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
