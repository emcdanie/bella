import React, { type CSSProperties, type ReactNode } from 'react';
import IconWell from '../IconWell/IconWell';
import Icon from '../Icon/Icon';
import MapLine from '../MapLine/MapLine';
import type { IconName } from '../Icon/Icon';
import styles from './Step.module.css';

export type StepState = 'done' | 'current' | 'pending';

/** What a History record is (CHIP History flow, read 21 Nov): one deeper
 * wash per kind with an ink glyph, so the list is not all green; green stays
 * Merged (empty-states-and-history.md, 19 Nov). */
export type StepKind = 'docs' | 'tooling' | 'tokens' | 'code' | 'visual' | 'fix' | 'decision' | 'merged';

const KIND_ICON: Record<StepKind, IconName> = {
  docs: 'Page',
  tooling: 'Settings',
  tokens: 'Palette',
  code: 'Code',
  visual: 'Eye',
  fix: 'EditPencil',
  decision: 'Check',
  merged: 'Check',
};

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
  /** Figma "Show tag". The status Tag on the right edge, top-aligned with the title (vertical; her pick B, 22 Nov). Missing = off. */
  tag?: ReactNode;
  /** Figma "Time" + "Show time". On the title line after a dot, a meta line (Geist Mono 14 on 20; vertical; her pick B, 22 Nov). A long title wraps and takes the dot and time with it. Missing = off. */
  time?: ReactNode;
  /** Figma "Show time under title": put the time on its own line under the title instead of on the title line. Default false. */
  timeUnderTitle?: boolean;
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
  /** The record's kind (History): its marker takes the kind's wash and an ink glyph, and wins over `state` for the marker only. docs Page on the yellow wash, tooling Settings on grey, tokens Palette on navy, code Code on blue, visual Eye on ochre, fix EditPencil on the red wash; decision a dark ink circle with a knockout glyph; merged Check on the success wash (green only for Merged). Pass `icon` to swap a glyph. Missing = the state's marker. */
  kind?: StepKind;
  /** Figma "Show number" (Show icon off): the step's number for a real sequence (rule 11). done draws a check, current the number in a 2px ring, pending the plain number. */
  number?: number;
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
  timeUnderTitle = false,
  showLineAbove = false,
  state = 'done',
  layout = 'vertical',
  selected = false,
  icon,
  kind,
  number,
  onSelect,
  className,
  style,
}: StepProps) {
  const m = MARKER[state];
  const horizontal = layout === 'horizontal';
  /* Figma (re-read from the 21 Nov publish): vertical connectors are solid
   * when done or current, dashed only for what has not started (pending);
   * the horizontal variants are drawn solid in every state. */
  const lineStyle = !horizontal && state === 'pending' ? 'dashed' : 'solid';
  const marker =
    number != null ? (
      <StepNumber state={state} number={number} />
    ) : (
      <IconWell
        icon={icon ?? (kind ? KIND_ICON[kind] : m.icon)}
        tone={kind === 'merged' ? 'success' : m.tone}
        className={[styles.marker, kind && kind !== 'merged' ? styles[`kind-${kind}`] : ''].filter(Boolean).join(' ')}
      />
    );

  const inlineTime = !horizontal && time != null && !timeUnderTitle;
  const text = (
    <span className={styles.text}>
      {/* Figma Title row (22 Nov, her pick B): Title · Separator · Time */}
      <span className={styles.titleRow}>
        <span className={styles.title}>{title}</span>
        {inlineTime ? (
          <span className={styles.timeInline}>
            <span className={styles.time} aria-hidden="true" data-bella-meta>
              ·
            </span>
            <span className={styles.time} data-bella-meta>
              {time}
            </span>
          </span>
        ) : null}
      </span>
      {!horizontal && time != null && timeUnderTitle ? (
        <span className={[styles.time, styles.timeUnder].join(' ')} data-bella-meta>
          {time}
        </span>
      ) : null}
      {detail != null ? <span className={styles.detail}>{detail}</span> : null}
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
      {/* Figma 20 Nov: Above (always there; the boolean hides only its line)
          · Marker · Below (fills the row; the boolean hides only its line), so
          the line meets the next row's line at every height. */}
      <span className={styles.markerColumn}>
        <span className={styles.above}>
          {showLineAbove ? <MapLine direction="vertical" end="none" variant={lineStyle} className={styles.fill} /> : null}
        </span>
        {marker}
        <span className={styles.below}>
          {showConnector ? <MapLine direction="vertical" end="none" variant={lineStyle} className={styles.fill} /> : null}
        </span>
      </span>
      {text}
      {/* Figma Time zone now holds the status Tag on the right edge (22 Nov, B) */}
      {tag != null ? <span className={styles.tagSide}>{tag}</span> : null}
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

/** Figma "_Step number" 1510:348034 (private): done = a check, current = the
 * number in a 2px info ring, pending = the plain number. */
function StepNumber({ state, number }: { state: StepState; number: number }) {
  return (
    /* the <ol> already says the order; the number is drawn, not read twice */
    <span className={[styles.number, styles[`number-${state}`]].join(' ')} aria-hidden="true">
      {state === 'done' ? <Icon name="Check" size="md" /> : number}
    </span>
  );
}

export interface StepDayProps {
  /** Figma "Day": the date heading ("14 Nov"). */
  children: ReactNode;
  className?: string;
}

/**
 * Figma "Step day" 1510:347998 (20 Nov): a day heading inside a vertical
 * Step list, with the list's line running straight through it (as Primer's
 * Timeline break). Renders an <li> for the Steps' <ol>.
 */
export function StepDay({ children, className }: StepDayProps) {
  return (
    <li className={[styles.day, className].filter(Boolean).join(' ')} data-bella-component="step-day">
      <span className={styles.dayLine} aria-hidden="true">
        <MapLine direction="vertical" end="none" variant="solid" className={styles.fill} />
      </span>
      <span className={styles.dayText}>{children}</span>
    </li>
  );
}
