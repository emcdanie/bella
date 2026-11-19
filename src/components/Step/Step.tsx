import React, { type CSSProperties, type ReactNode } from 'react';
import IconWell from '../IconWell/IconWell';
import MapLine from '../MapLine/MapLine';
import type { IconName } from '../Icon/Icon';
import styles from './Step.module.css';

export type StepState = 'done' | 'current' | 'pending';

const MARKER: Record<StepState, { tone: 'success' | 'info' | 'neutral'; icon: IconName }> = {
  done: { tone: 'success', icon: 'Check' },
  current: { tone: 'info', icon: 'RefreshDouble' },
  pending: { tone: 'neutral', icon: 'Clock' },
};

export interface StepProps {
  /** Figma "Title". */
  title: ReactNode;
  /** Figma "Detail" + "Show detail". Missing = off. Subtext face; says the state in words. */
  detail?: ReactNode;
  /** Figma "Show connector". The line to the next marker; off on the last step. */
  showConnector?: boolean;
  /** Figma "Show tag". A Tag under the title (vertical). Missing = off. */
  tag?: ReactNode;
  /** Figma "Time" + "Show time". Right column, subtext face (vertical). Missing = off. */
  time?: ReactNode;
  /** Figma "Show line above". Vertical: the line into this marker; off on the first row. */
  showLineAbove?: boolean;
  /** Figma "state". done = check in a soft success circle; current = info; pending = neutral. */
  state?: StepState;
  /** Figma "layout". horizontal = a pipeline (marker and connector on top, text under); vertical = a list. */
  layout?: 'horizontal' | 'vertical';
  /** Figma "selected". Vertical rows that open a record (History): light-blue row. */
  selected?: boolean;
  /** Figma "Marker" icon swap (the kind icon). Defaults: Check, RefreshDouble, Clock by state. */
  icon?: IconName;
  /** Makes the row a button that opens its record (vertical, History). The whole row is the target. */
  onSelect?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * One step in a short ordered process, or one event in an activity list.
 * Renders an <li>: put Steps in an <ol>. aria-current="step" on the current one.
 */
export default function Step({
  title,
  detail,
  showConnector = true,
  tag,
  time,
  showLineAbove = false,
  state = 'done',
  layout = 'vertical',
  selected = false,
  icon,
  onSelect,
  className,
  style,
}: StepProps) {
  const m = MARKER[state];
  const horizontal = layout === 'horizontal';
  /* Figma: vertical connectors are solid when done, dashed when current or
   * pending; the horizontal variants are drawn solid in every state. */
  const lineStyle = !horizontal && state !== 'done' ? 'dashed' : 'solid';
  const marker = <IconWell icon={icon ?? m.icon} tone={m.tone} className={styles.marker} />;

  const text = (
    <span className={styles.text}>
      <span className={styles.title}>{title}</span>
      {!horizontal && tag != null ? <span className={styles.tag}>{tag}</span> : null}
      {detail != null ? <span className={styles.detail}>{detail}</span> : null}
      {!horizontal && time != null ? <span className={[styles.time, styles.timeUnder].join(' ')}>{time}</span> : null}
    </span>
  );

  const body = horizontal ? (
    <>
      <span className={styles.markerRow}>
        {marker}
        {showConnector ? <MapLine direction="horizontal" end="none" variant={lineStyle} /> : null}
      </span>
      {text}
    </>
  ) : (
    <>
      <span className={styles.markerColumn}>
        {showLineAbove ? <MapLine direction="vertical" end="none" variant={lineStyle} className={styles.lineAbove} /> : null}
        {marker}
        {showConnector ? <MapLine direction="vertical" end="none" variant={lineStyle} /> : null}
      </span>
      {text}
      {time != null ? <span className={[styles.time, styles.timeSide].join(' ')}>{time}</span> : null}
    </>
  );

  const cls = [
    styles.step,
    styles[layout],
    styles[state],
    !horizontal && selected ? styles.selected : '',
    onSelect ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <li className={cls} style={style} aria-current={state === 'current' ? 'step' : undefined} data-bella-component="step">
      {onSelect ? (
        <button type="button" className={styles.row} aria-pressed={selected} onClick={onSelect}>
          {body}
        </button>
      ) : (
        <span className={styles.row}>{body}</span>
      )}
    </li>
  );
}
