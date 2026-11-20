import React, { Children, useEffect, useId, type CSSProperties, type ReactNode } from 'react';
import Tag from '../Tag/Tag';
import { useChangeKey } from '../shared/useCountTo';
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
  /**
   * The space opens when it mounts (rule "Motion that shows what happened",
   * item 2). Set false to close it up (after the drop, or when the card left
   * for good): it shrinks to nothing, then onClosed runs so you can remove it.
   */
  open?: boolean;
  /** Called once the space has closed up. Remove it then. */
  onClosed?: () => void;
  className?: string;
  /** Size it to the card it stands for (Figma draws it at the card's size). */
  style?: CSSProperties;
}

/** Shows only while a card is being dragged. A dashed 2px edge: brand where it lands, strong where it left. */
export function BoardLaneDropSpace({ kind = 'target', label = 'Drop here to start', open = true, onClosed, className, style }: BoardLaneDropSpaceProps) {
  /* Opens on motion/duration/250 and closes up on motion/duration/200; with
   * reduced motion it appears and goes at once. */
  useEffect(() => {
    if (!open && window.matchMedia('(prefers-reduced-motion: reduce)').matches) onClosed?.();
  }, [open, onClosed]);
  return (
    <div
      className={[styles.drop, kind === 'origin' ? styles.origin : styles.target, open ? '' : styles.closing, className].filter(Boolean).join(' ')}
      style={style}
      onAnimationEnd={(e) => {
        if (!open && e.target === e.currentTarget) onClosed?.();
      }}
      data-state={open ? 'open' : 'closing'}
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

export type BoardLaneKind = 'needs-you' | 'agent' | 'gate' | 'ready';

export interface BoardLaneProps {
  /** Figma "Name". The lane's name; the lane's heading. */
  name: ReactNode;
  /** Figma "Order". One line on how the lane is sorted. Missing = off. */
  order?: ReactNode;
  /** @deprecated The lane number plate left the published BoardLane (21 Nov late: "take the lane numbers off"); ignored. Removing the prop is a public API change and waits for Elleta. */
  index?: ReactNode;
  /** Figma "lane" (21 Nov publish, "A, light tints"): each lane its own light tint, the count plate filled in the lane's tone. needs-you warning, agent info, gate the lane grey, ready success. "other" is the old name of gate. */
  lane?: BoardLaneKind | 'other';
  /** Figma "state=drop-target": a card is over this lane. Figma draws it the same as default; the drop space inside marks where it lands. */
  dropTarget?: boolean;
  /** Figma Count (Tag) label. Defaults to the number of cards. */
  count?: number;
  /** Figma "Show empty" + Empty (Empty state size=lane): shown, centred under the head, when the lane has no cards. */
  empty?: ReactNode;
  /** Figma Cards (Card 1 to 4, TaskCard; Show card 1 to 4): the cards, each in a list item. */
  children?: ReactNode;
  /** Heading level of the Name. */
  headingLevel?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

/* the count plate per lane: Tag style=solid in the lane's knockout tone; gate
   keeps the outlined count until a neutral fill is decided (no existing
   neutral pair stays light in both themes) */
const COUNT: Record<BoardLaneKind, { variant: 'solid' | 'outline'; tone: 'attention' | 'info' | 'success' | 'count' }> = {
  'needs-you': { variant: 'solid', tone: 'attention' },
  agent: { variant: 'solid', tone: 'info' },
  gate: { variant: 'outline', tone: 'count' },
  ready: { variant: 'solid', tone: 'success' },
};

/**
 * One lane of the Work board: name and count, order, then its cards (or
 * the empty state). A list with a heading. Cards move by drag or by each
 * card's "Move to…". Figma BoardLane 783:496472, published 21 Nov: no lane
 * number, no status dot ("less is more"), a light tint per lane.
 */
export default function BoardLane({
  name,
  order,
  lane: laneIn = 'gate',
  dropTarget = false,
  count,
  empty,
  children,
  headingLevel = 2,
  className,
  style,
}: BoardLaneProps) {
  const lane: BoardLaneKind = laneIn === 'other' ? 'gate' : laneIn;
  const id = useId();
  const items = Children.toArray(children);
  const n = count ?? items.length;
  const plate = COUNT[lane];
  /* the count bumps once when it changes (item 4), never on first paint */
  const countKey = useChangeKey(n);
  const H = `h${headingLevel}` as 'h2' | 'h3' | 'h4';
  return (
    <section
      className={[styles.lane, className].filter(Boolean).join(' ')}
      style={style}
      aria-labelledby={id}
      data-bella-component="board-lane"
      data-lane={lane}
      data-state={dropTarget ? 'drop-target' : 'default'}
    >
      <div className={styles.head}>
        <H id={id} className={styles.name}>
          {name}
        </H>
        <span key={countKey} className={[styles.countWrap, countKey ? styles.bump : ''].filter(Boolean).join(' ')}>
          <Tag variant={plate.variant} tone={plate.tone}>
            {n}
            <span className={styles.srOnly}> {n === 1 ? 'card' : 'cards'}</span>
          </Tag>
        </span>
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
      ) : empty != null ? (
        <div className={styles.empty}>{empty}</div>
      ) : null}
    </section>
  );
}
