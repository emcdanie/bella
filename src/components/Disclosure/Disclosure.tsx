import React, { useRef, type MouseEvent, type ReactNode } from 'react';
import Icon from '../Icon/Icon';
import styles from './Disclosure.module.css';

export interface DisclosureProps {
  /** The section's name, always visible ("Checks"). */
  title: ReactNode;
  /** A short summary beside the title, so a closed section still says something ("5 of 5 pass"). */
  summary?: ReactNode;
  /** Open on first render (uncontrolled). */
  defaultOpen?: boolean;
  /** Controlled open state; pair with onToggle. */
  open?: boolean;
  /** Called with the new state when the person opens or closes it. */
  onToggle?: (open: boolean) => void;
  /** What opens. */
  children?: ReactNode;
  id?: string;
  className?: string;
}

/**
 * One open/close section: a native details/summary. The whole header row is
 * the 44px target; a chevron turns when it opens (no motion under reduced
 * motion). Stack several for a card that fits the screen. Not a tab set and
 * not navigation.
 */
export default function Disclosure({ title, summary, defaultOpen, open, onToggle, children, id, className }: DisclosureProps) {
  const controlled = open !== undefined;
  // uncontrolled: report real changes only (a details that starts open fires
  // a toggle on mount, which is not the person's choice)
  const last = useRef(Boolean(defaultOpen));
  // controlled: the click asks the parent, the prop decides; the browser's own
  // toggle never runs, so the two cannot drift apart
  const onSummaryClick = controlled
    ? (e: MouseEvent<HTMLElement>) => {
        e.preventDefault();
        onToggle?.(!open);
      }
    : undefined;
  return (
    <details
      id={id}
      className={[styles.disclosure, className].filter(Boolean).join(' ')}
      open={controlled ? open : defaultOpen}
      onToggle={
        controlled
          ? undefined
          : (e) => {
              const now = (e.currentTarget as HTMLDetailsElement).open;
              if (now !== last.current) {
                last.current = now;
                onToggle?.(now);
              }
            }
      }
      data-bella-component="disclosure"
    >
      <summary className={styles.summary} onClick={onSummaryClick}>
        <span className={styles.title}>{title}</span>
        {summary != null ? <span className={styles.meta}>{summary}</span> : null}
        <Icon name="NavArrowDown" size="sm" className={styles.chevron} />
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
