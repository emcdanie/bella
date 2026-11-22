import React, { useEffect, type CSSProperties, type DragEventHandler, type ReactNode } from 'react';
import Icon from '../Icon/Icon';
import Progress from '../Progress/Progress';
import ProgressRing from '../ProgressRing/ProgressRing';
import { type StatusDotProps } from '../StatusDot/StatusDot';
import Tag from '../Tag/Tag';
import Trailing from '../Trailing/Trailing';
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
  /** Figma "tone": the Tag's tone and the card's 2px border colour (21 Nov publish, her pick "B · coloured border, no bar"). neutral is Figma's tone=default, "To do". */
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
  /** progress: dragged back to Next: a grey ring and "Paused · {stepNow}" instead of the turning arc and "Now · {stepNow}". */
  paused?: boolean;
  /** The whole card opens the task: a link. */
  href?: string;
  /** The whole card opens the task: a button. Ignored when `href` is set. */
  onOpen?: () => void;
  /** Figma "Move to…" (the drag handle): the keyboard way to move the card; open a Menu of lanes from here. Missing = the handle is drawn but does nothing (pointer drag only). */
  onMoveTo?: () => void;
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
  paused = false,
  href,
  onOpen,
  onMoveTo,
  draggable,
  onDragStart,
  onDragEnd,
  entering = false,
  leaving = false,
  onLeft,
  className,
  style,
}: TaskCardProps) {
  const opens = href != null || onOpen != null;
  useEffect(() => {
    if (leaving && window.matchMedia('(prefers-reduced-motion: reduce)').matches) onLeft?.();
  }, [leaving, onLeft]);
  const cls = [styles.card, opens ? styles.opens : '', dragging ? styles.dragging : '', entering ? styles.entering : '', leaving ? styles.leaving : '', className]
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
        {onMoveTo != null ? (
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
              fill={progressTotal > 0 ? (progressDone / progressTotal) * 100 : 0}
            />
            <span className={styles.count} aria-hidden="true">
              {progressDone} of {progressTotal}
            </span>
          </div>
          {stepNow != null ? (
            <div className={styles.stepNow}>
              <ProgressRing state={paused ? 'waiting' : 'running'} size="sm" decorative />
              <span className={styles.stepText} data-bella-meta title={`${paused ? 'Paused' : 'Now'} · ${stepNow}`}>
                {paused ? 'Paused' : 'Now'} · {stepNow}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}
      <div className={styles.status}>
        {showTag ? (
          <Tag variant="line" tone={TONE[statusTone]}>
            {status}
          </Tag>
        ) : (
          <span className={styles.srOnly}>{status}</span>
        )}
        {opens ? <Trailing /> : null}
      </div>
      </div>
    </article>
  );
}
