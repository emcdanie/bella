import React, { type CSSProperties, type DragEventHandler, type ReactNode } from 'react';
import Icon from '../Icon/Icon';
import StatusDot, { type StatusDotProps } from '../StatusDot/StatusDot';
import Tag from '../Tag/Tag';
import Trailing from '../Trailing/Trailing';
import styles from './TaskCard.module.css';

export interface TaskCardProps {
  /** Figma "Title". What the task is. Names the card and its open link. */
  title: ReactNode;
  /** Figma "Line". One line under the title, in the subtext face. */
  line?: ReactNode;
  /** Figma "Show branch" + the Branch Tag label: the branch name, for the board's branch filter. Missing = off. */
  branch?: ReactNode;
  /** Figma Status (StatusDot) label: the status in words. */
  status: ReactNode;
  /** Figma Status (StatusDot) tone. */
  statusTone?: StatusDotProps['tone'];
  /** Figma "state=dragging": the card is being dragged and lifts (shadow/lg). hover and focus are CSS states. */
  dragging?: boolean;
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
  className?: string;
  style?: CSSProperties;
}

/**
 * One task on the Work board: what it is and its status. The whole card
 * opens it (a stretched link or button on the title, so the card is one
 * target); "Move to…" is its own 44 button above that target. States:
 * default, hover (edge goes strong), focus (4 + 4 ring round the card),
 * dragging (only dragging lifts).
 */
export default function TaskCard({
  title,
  line,
  branch,
  status,
  statusTone = 'neutral',
  dragging = false,
  href,
  onOpen,
  onMoveTo,
  draggable,
  onDragStart,
  onDragEnd,
  className,
  style,
}: TaskCardProps) {
  const opens = href != null || onOpen != null;
  const cls = [styles.card, opens ? styles.opens : '', dragging ? styles.dragging : '', className]
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
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className={styles.head}>
        <div className={styles.text}>
          <h3 className={styles.title}>{titleInner}</h3>
          {line != null ? <p className={styles.line}>{line}</p> : null}
          {branch != null ? (
            <Tag variant="outline" tone="count" className={styles.branch}>
              {branch}
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
      <div className={styles.status}>
        <StatusDot label={status} tone={statusTone} showWash showDot showLabel className={styles.statusDot} />
        {opens ? <Trailing /> : null}
      </div>
    </article>
  );
}
