import React, { type CSSProperties, type ElementType, type ReactNode } from 'react';
import styles from './ListRow.module.css';

export interface ListRowProps {
  /** What the item is. */
  title: ReactNode;
  /** One line of why it matters. */
  description?: ReactNode;
  /** The status marker, with a word: a StatusPill. */
  status?: ReactNode;
  /** The one thing to do next: a Button, ActionChip or Link. */
  action?: ReactNode;
  /** Sets the title's level when the page needs one. Defaults to plain text. */
  titleAs?: 'span' | 'h2' | 'h3' | 'h4';
  /** Extra classes on the row. */
  className?: string;
  style?: CSSProperties;
}

export interface ListRowGroupProps {
  /** Accessible name of the list. */
  ariaLabel?: string;
  /** Extra classes on the list's frame. */
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * The list a ListRow sits in. It aligns every row's status, text and action
 * into one set of columns, and stacks them when its own width is narrow.
 */
export function ListRowGroup({ ariaLabel, className, style, children }: ListRowGroupProps) {
  return (
    <div className={[styles.frame, className].filter(Boolean).join(' ')} style={style}>
      <ul className={styles.group} aria-label={ariaLabel}>
        {children}
      </ul>
    </div>
  );
}

/**
 * One item in a work list: a status with a word, a title, one line of why and
 * one action. The action brings its own 44px box.
 */
export default function ListRow({
  title,
  description,
  status,
  action,
  titleAs = 'span',
  className,
  style,
}: ListRowProps) {
  const Title: ElementType = titleAs;
  return (
    <li className={[styles.row, className].filter(Boolean).join(' ')} style={style} data-bella-component="list-row">
      {status != null ? <div className={styles.status}>{status}</div> : null}
      <div className={styles.text}>
        <Title className={styles.title}>{title}</Title>
        {description != null ? <p className={styles.description}>{description}</p> : null}
      </div>
      {action != null ? <div className={styles.action}>{action}</div> : null}
    </li>
  );
}
