import React, { type CSSProperties, type ReactNode } from 'react';
import IconWell from '../IconWell/IconWell';
import Trailing from '../Trailing/Trailing';
import Progress from '../Progress/Progress';
import type { IconName } from '../Icon/Icon';
import styles from './StatCard.module.css';

export type StatCardTone = 'info' | 'success' | 'warning';

const PROGRESS_TONE = { info: 'info', success: 'success', warning: 'attention' } as const;

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
  /** Figma "Caption". Footer left: the target or where it came from. */
  caption?: ReactNode;
  /** Figma "Show button". Footer right: a secondary Button only when it acts ("Set target"), never to navigate. Missing = off. */
  button?: ReactNode;
  /** Figma "chart". */
  chart?: 'bar' | 'segments';
  /** Figma "tone". Icon well, chart marks. warning maps to Progress attention. */
  tone?: StatCardTone;
  /** Figma Icon well icon swap. */
  icon: IconName;
  /** The chart's numbers. Missing = no chart (as the "Runs this week" instance). */
  meter?: StatCardMeter;
  /** Header opens the detail: a link. The whole 44 header row is the target and carries the ›. */
  href?: string;
  /** Header opens the detail: a button. Ignored when `href` is set. */
  onOpen?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * A number with its meaning: header (icon well, title, ›), body (number and
 * unit, chart, context), footer (caption, optional action). Cards in a row
 * share a height; the body centres between header and footer.
 */
export default function StatCard({
  title,
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
  className,
  style,
}: StatCardProps) {
  const opens = href != null || onOpen != null;
  const headInner = (
    <>
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

  const words = meter?.valueText ?? [value, unit].filter((x) => typeof x === 'string' || typeof x === 'number').join(' ');

  return (
    <section
      className={[styles.card, className].filter(Boolean).join(' ')}
      style={style}
      data-bella-component="stat-card"
    >
      {/* Figma 20 Nov (rule 20): the icon well in its own Lead column, centred
          on the 44 header row; every text in Content shares one left edge. */}
      <div className={styles.lead}>
        <IconWell icon={icon} tone={tone} />
      </div>
      <div className={styles.content}>
      {header}
      <div className={styles.body}>
        <p className={styles.number}>
          <span className={styles.value}>{value}</span>
          {unit != null && unit !== '' ? <span className={styles.unit}>{unit}</span> : null}
        </p>
        {meter ? (
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
      </div>
    </section>
  );
}
