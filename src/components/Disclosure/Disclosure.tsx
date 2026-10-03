import React, { useEffect, useRef, type ReactNode } from 'react';
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
  const ref = useRef<HTMLDetailsElement>(null);
  // controlled: the prop wins on every render
  useEffect(() => {
    if (open !== undefined && ref.current && ref.current.open !== open) ref.current.open = open;
  }, [open]);
  return (
    <details
      ref={ref}
      id={id}
      className={[styles.disclosure, className].filter(Boolean).join(' ')}
      open={open ?? defaultOpen}
      onToggle={(e) => onToggle?.((e.currentTarget as HTMLDetailsElement).open)}
      data-bella-component="disclosure"
    >
      <summary className={styles.summary}>
        <span className={styles.title}>{title}</span>
        {summary != null ? <span className={styles.meta}>{summary}</span> : null}
        <Icon name="NavArrowDown" size="sm" className={styles.chevron} />
      </summary>
      <div className={styles.body}>{children}</div>
    </details>
  );
}
