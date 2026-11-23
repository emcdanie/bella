import React, { useEffect, type CSSProperties, type DragEventHandler, type ReactNode } from 'react';
import Icon from '../Icon/Icon';
import Progress from '../Progress/Progress';
import ProgressRing from '../ProgressRing/ProgressRing';
import StatusDot, { type StatusDotProps } from '../StatusDot/StatusDot';
import Tag from '../Tag/Tag';
import Trailing from '../Trailing/Trailing';
import { useAgo, useElapsed } from '../shared/useElapsed';
import styles from './TaskCard.module.css';

/** A path wraps after each "/", never mid-name: <wbr> marks where it may break. */
function pathBreaks(node: ReactNode): ReactNode {
  if (typeof node !== 'string' || !node.includes('/')) return node;
  return node.split('/').flatMap((part, i, all) => (i < all.length - 1 ? [part, '/', <wbr key={i} />] : [part]));
}

export interface TaskCardProps {
  /** Figma "Title". What the task is. Names the card and its open link. */
  title: ReactNode;
  /** Figma "Line". One line under the title, in the subtext face. */
  line?: ReactNode;
  /** Figma "Show branch" + the Branch Tag label: the branch name, for the board's branch filter. Missing = off. */
  branch?: ReactNode;
  /** Figma Status (Tag, style=line): the status in words. Default "To do". Shown only with `showTag`; otherwise screen readers still hear it. */
  status?: ReactNode;
  /** Figma "Show tag" (off by default, batch 4, 22 Nov: on the board the border says the status, so the Tag no longer repeats it). */
  showTag?: boolean;
  /** Figma "tone": the Tag's tone and the card's 2px border colour (21 Nov publish, her pick B · coloured border, no bar). neutral is Figma's tone=default, "To do". */
  statusTone?: StatusDotProps['tone'];
  /** Figma "state=dragging": the card is being dragged and lifts (shadow/lg). hover and focus are CSS states. */
  dragging?: boolean;
  /** Figma "Show progress" (off by default: existing cards are unchanged, 22 Nov). Shows the progress zone between the head and the ↗ row: a Progress bar with "n of m" beside it, then the step now. */
  progress?: boolean;
  /** progress: steps done. */
  progressDone?: number;
  /** progress: steps in all. */
  progressTotal?: number;
  /** progress: the step running now (one line, cut with an ellipsis). */
  stepNow?: string;
  /** progress: steps left (feedback plan, 23 Nov: every card shows steps done, the step running and what is left). Shown as "3 left" in the line under the step. */
  progressLeft?: number;
  /** progress: when the run started (ISO or epoch ms). The line under the step counts up from it, every second. Not while paused. */
  since?: string | number;
  /** progress: when the last step finished (ISO or epoch ms). The line says "last step 12 s ago", so a long quiet step reads as alive and slow, not stuck. Not while paused. */
  lastStepAt?: string | number;
  /** progress: dragged back to Next: a grey ring and "Paused · {stepNow}" instead of the turning arc and "Now · {stepNow}". */
  paused?: boolean;
  /** progress: the run stopped or failed (second-pass D6, 23 Nov): a red cross ring, "Stopped · {stepNow}" with the reason wrapped (never cut), the bar in the danger tone, and no clock. */
  stopped?: boolean;
  /** The whole card opens the task: a link. */
  href?: string;
  /** The whole card opens the task: a button. Ignored when `href` is set. */
  onOpen?: () => void;
  /** Figma "Move to…" (the drag handle): the keyboard way to move the card; open a Menu of lanes from here. Missing = the handle is drawn but does nothing (pointer drag only). */
  onMoveTo?: () => void;
  /** Selected (Elleta's Workbench A, 23 Nov 2026): the card open on the stage in a strip of cards, outlined in the
   *  selection blue around its border; aria-current is the page's to set on the list item. */
  selected?: boolean;
  /** board (default): the drag handle and the open arrow, as on the Work board. pick: a strip of cards you choose from
   *  (Playground picks, Needs you; 23 Nov 2026): no handle or arrow (a click selects, never leaves the page), the title
   *  and the line each clamped to two lines, the status as a StatusDot and its word (a part's own status, never a boxed
   *  Tag), and the card's three rows (title, line, status) on its grid parent's rows through subgrid, so in a row of
   *  pick cards every title, line and status sits at one height and the status is pinned to the foot. The parent
   *  gives three rows (grid-template-rows: auto auto 1fr or similar); alone, the card lays its rows out itself. */
  use?: 'board' | 'pick';
  /** Native drag, wired by the board. */
  draggable?: boolean;
  onDragStart?: DragEventHandler<HTMLElement>;
  onDragEnd?: DragEventHandler<HTMLElement>;
  /**
   * Arrives (rule "Motion that shows what happened", items 4 and 6): a new
   * card in Needs you, or one Undo brings back, pops in once on
   * motion/duration/250 and motion/easing/pop. Set it only on the card that
   * is new, never on first load. Reduced motion: it is simply there.
   */
  entering?: boolean;
  /**
   * Leaves (item 6, Accept): the card slides out to the right and fades on
   * motion/duration/250, then onLeft runs so the page removes it. Reduced
   * motion: onLeft runs at once.
   */
  leaving?: boolean;
  /** Called once the card has left. Remove it then. */
  onLeft?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * One task on the Work board: what it is and its status. The whole card
 * opens it (a stretched link or button on the title, so the card is one
 * target); "Move to…" is its own 44 button above that target. States:
 * default, hover (light blue, brand-subtle), focus (4 + 4 ring round the card),
 * dragging (only dragging lifts).
 */
/* the status tone on the line Tag and the border (StatusDot's names, Tag's tones) */
const TONE = { success: 'success', info: 'info', attention: 'attention', danger: 'danger', neutral: 'default' } as const;

export default function TaskCard({
  title,
  line,
  branch,
  status = 'To do',
  showTag = false,
  statusTone = 'neutral',
  dragging = false,
  progress = false,
  progressDone = 0,
  progressTotal = 0,
  stepNow,
  progressLeft,
  since,
  lastStepAt,
  paused = false,
  stopped = false,
  href,
  onOpen,
  onMoveTo,
  selected = false,
  use = 'board',
  draggable,
  onDragStart,
  onDragEnd,
  entering = false,
  leaving = false,
  onLeft,
  className,
  style,
}: TaskCardProps) {
  const elapsed = useElapsed(since, progress && !paused && !stopped);
  const lastAgo = useAgo(lastStepAt, progress && !paused && !stopped);
  const meta = [progressLeft != null ? (progressLeft === 0 ? 'none left' : `${progressLeft} left`) : null, elapsed, lastAgo ? `last\u00a0step ${lastAgo}` : null].filter(Boolean).join(' · ');
  const opens = href != null || onOpen != null;
  useEffect(() => {
    if (leaving && window.matchMedia('(prefers-reduced-motion: reduce)').matches) onLeft?.();
  }, [leaving, onLeft]);
  const cls = [styles.card, use === 'pick' ? styles.pick : '', opens ? styles.opens : '', dragging ? styles.dragging : '', entering ? styles.entering : '', leaving ? styles.leaving : '', className]
    .filter(Boolean)
    .join(' ');

  const titleInner =
    href != null ? (
      <a className={styles.open} href={href}>
        {title}
      </a>
    ) : onOpen != null ? (
      <button type="button" className={styles.open} onClick={onOpen}>
        {title}
      </button>
    ) : (
      title
    );

  return (
    <article
      className={cls}
      style={style}
      data-bella-component="task-card"
      data-state={dragging ? 'dragging' : 'default'}
      data-tone={TONE[statusTone]}
      data-selected={selected ? 'true' : undefined}
      onAnimationEnd={(e) => {
        if (leaving && e.target === e.currentTarget) onLeft?.();
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className={styles.content}>
      <div className={styles.head}>
        <div className={styles.text}>
          <h3 className={styles.title}>{titleInner}</h3>
          {line != null ? <p className={styles.line} data-bella-meta>{pathBreaks(line)}</p> : null}
          {branch != null ? (
            <Tag variant="outline" tone="count" className={styles.branch}>
              <span className={styles.branchText} title={typeof branch === 'string' ? branch : undefined}>
                {branch}
              </span>
            </Tag>
          ) : null}
        </div>
        {use === 'pick' ? null : onMoveTo != null ? (
          <button type="button" className={styles.move} onClick={onMoveTo} aria-label="Move to…">
            <Icon name="DragHandle" size="md" />
          </button>
        ) : (
          <span className={styles.move} aria-hidden="true">
            <Icon name="DragHandle" size="md" />
          </span>
        )}
      </div>
      {progress ? (
        <div className={styles.progress} data-bella-progress={paused ? 'paused' : 'running'}>
          <div className={styles.bar}>
            <Progress
              className={styles.barTrack}
              label="Steps done"
              value={`${progressDone} of ${progressTotal}`}
              showLabel={false}
              tone={stopped ? 'danger' : 'info'}
              fill={progressTotal > 0 ? (progressDone / progressTotal) * 100 : 0}
            />
            <span className={styles.count} aria-hidden="true">
              {progressDone} of {progressTotal}
            </span>
          </div>
          {stepNow != null ? (
            <div className={styles.stepNow}>
              <ProgressRing state={stopped ? 'failed' : paused ? 'waiting' : 'running'} size="sm" decorative />
              <span className={[styles.stepText, stopped ? styles.stepStopped : ''].filter(Boolean).join(' ')} data-bella-meta title={`${stopped ? 'Stopped' : paused ? 'Paused' : 'Now'} · ${stepNow}`}>
                {stopped ? 'Stopped' : paused ? 'Paused' : 'Now'} · {stepNow}
              </span>
            </div>
          ) : null}
          {meta ? (
            <span className={styles.stepMeta} data-bella-meta="">
              {meta}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className={styles.status}>
        {showTag && use === 'pick' ? (
          <StatusDot tone={statusTone} label={status} mark={statusTone === 'success' ? 'check' : 'dot'} />
        ) : showTag ? (
          <Tag variant="line" tone={TONE[statusTone]}>
            {status}
          </Tag>
        ) : (
          <span className={styles.srOnly}>{status}</span>
        )}
        {opens && use !== 'pick' ? <Trailing /> : null}
      </div>
      </div>
    </article>
  );
}
