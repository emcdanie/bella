import React, { useId, type ReactNode } from 'react';
import styles from './Section.module.css';

export interface SectionProps {
  /** The section's heading, an h2 at the one section size. */
  heading: ReactNode;
  /** The section's id: an "On this page" link points at it, and it clears a sticky header. */
  id?: string;
  /** One or two sentences under the heading, held to the body measure. */
  lede?: ReactNode;
  /** Small actions beside the heading: secondary Buttons, ActionChips or Links. */
  actions?: ReactNode;
  /** The body: Cards, Columns, a table. */
  children?: ReactNode;
  className?: string;
}

/**
 * A vertical slice of a page (layout foundation, 2026-10-03). A section
 * named by its h2, then the lede and body. Two sections in a row are spaced
 * by the section space; nothing else sets margins between them.
 */
export default function Section({ heading, id, lede, actions, children, className }: SectionProps) {
  const auto = useId();
  const headingId = `${id ?? auto}-heading`;
  return (
    <section id={id} aria-labelledby={headingId} className={[styles.section, className].filter(Boolean).join(' ')} data-bella-component="section">
      <div className={styles.head}>
        <h2 id={headingId} className={styles.heading}>
          {heading}
        </h2>
        {actions != null ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {lede != null ? <p className={styles.lede}>{lede}</p> : null}
      {children != null ? <div className={styles.body}>{children}</div> : null}
    </section>
  );
}
