import React, { Children, useId, type CSSProperties, type ReactNode } from 'react';
import StatusDot, { type StatusDotProps } from '../StatusDot/StatusDot';
import Tag from '../Tag/Tag';
import styles from './BoardLane.module.css';

/* ---------------------------------------------------------------------------
 * BoardLane drop space: its own Figma part (783:496703), exported from here
 * so the board draws the one mark wherever a card lands or left.
 * ------------------------------------------------------------------------- */

export interface BoardLaneDropSpaceProps {
  /** Figma "kind". target = where the dragged card lands (with the Label); origin = the space it left (no words). */
  kind?: 'target' | 'origin';
  /** Figma "Label". target only. */
  label?: ReactNode;
  className?: string;
  /** Size it to the card it stands for (Figma draws it at the card's size). */
  style?: CSSProperties;
}

/** Shows only while a card is being dragged. A dashed 2px edge: brand where it lands, strong where it left. */
export function BoardLaneDropSpace({ kind = 'target', label = 'Drop here to start', className, style }: BoardLaneDropSpaceProps) {
  return (
    <div
      className={[styles.drop, kind === 'origin' ? styles.origin : styles.target, className].filter(Boolean).join(' ')}
      style={style}
      data-bella-component="board-lane-drop-space"
      aria-hidden={kind === 'origin' ? true : undefined}
    >
      {kind === 'target' ? <span className={styles.dropLabel}>{label}</span> : null}
    </div>
  );
}

/* ---------------------------------------------------------------------------
 * BoardLane
 * ------------------------------------------------------------------------- */

export interface BoardLaneProps {
  /** Figma "Name". The lane's name; the lane's heading. */
  name: ReactNode;
  /** Figma "Order". One line on how the lane is sorted. Missing = off. */
  order?: ReactNode;
  /** Figma "Show index" + the Index Tag label ("01"): the lane's place in the sequence. Missing = off. Only where the lanes are a sequence (guideline 11). */
  index?: ReactNode;
  /** Figma "lane". Both lanes are the neutral lane grey; needs-you colours only its count and index (attention tone). */
  lane?: 'needs-you' | 'other';
  /** Figma "state=drop-target": a card is over this lane. Figma draws it the same as default; the drop space inside marks where it lands. */
  dropTarget?: boolean;
  /** Figma Status (StatusDot) tone in the Head. */
  statusTone?: StatusDotProps['tone'];
  /** Figma Count (Tag) label. Defaults to the number of cards. */
  count?: number;
  /** Figma Cards (Card 1 to 4, TaskCard; Show card 1 to 4): the cards, each in a list item. */
  children?: ReactNode;
  /** Heading level of the Name. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/**
 * One lane of the Work board: name, count, order, then its cards. A list
 * with a heading. Cards move by drag or by each card's "Move to…".
 */
export default function BoardLane({
  name,
  order,
  index,
  lane = 'other',
  dropTarget = false,
  statusTone = 'attention',
  count,
  children,
  headingLevel = 2,
  className,
  style,
}: BoardLaneProps) {
  const id = useId();
  const items = Children.toArray(children);
  const n = count ?? items.length;
  const tone = lane === 'needs-you' ? 'attention' : 'count';
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <section
      className={[styles.lane, lane === 'needs-you' ? styles.needsYou : styles.other, className].filter(Boolean).join(' ')}
      style={style}
      aria-labelledby={id}
      data-bella-component="board-lane"
      data-state={dropTarget ? 'drop-target' : 'default'}
    >
      <div className={styles.head}>
        {index != null ? (
          <Tag variant="index" tone={tone}>
            {index}
          </Tag>
        ) : null}
        {/* the heading names the lane; the dot only carries the tone */}
        <span className={styles.status} aria-hidden="true">
          <StatusDot tone={statusTone} showDot showWash showLabel={false} label={name} />
        </span>
        <H id={id} className={styles.name}>
          {name}
        </H>
        <Tag variant="outline" tone={tone}>
          {n}
          <span className={styles.srOnly}> {n === 1 ? 'card' : 'cards'}</span>
        </Tag>
      </div>
      {order != null ? <p className={styles.order}>{order}</p> : null}
      {items.length > 0 ? (
        <ul className={styles.cards}>
          {items.map((child, i) => (
            <li key={i} className={styles.item}>
              {child}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
