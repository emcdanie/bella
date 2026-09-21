import React from 'react';
import styles from './SectionIndex.module.css';

export interface SectionIndexProps {
  /** The index number, zero-padded (e.g. "01"). */
  index: string;
  /** The section name (e.g. "Featured"); set in caps by the pattern. */
  label: string;
  /**
   * Semantic element. `"p"` (default): at 14px the index is a label, not a
   * heading, and section headings are 32px minimum (AGENTS.md). Name the
   * section with its id via aria-labelledby. Opt into `"h2"`/`"h3"` only
   * where the page has no real section heading, knowing it breaks the floor.
   */
  as?: 'h2' | 'h3' | 'p';
  /** Element id, for the section's aria-labelledby. */
  id?: string;
}

/**
 * SectionIndex (Work patterns, 2026-09-21): Southleft's "01 / FEATURED"
 * rule line. Index, slash, label, then a hairline to the edge. The slash
 * and the rule are decoration; the name reads "01 Featured".
 */
export default function SectionIndex({ index, label, as: Tag = 'p', id }: SectionIndexProps) {
  return (
    <div className={styles.row} data-bella-pattern="section-index">
      <Tag className={styles.text} id={id}>
        <span className={styles.index}>{index}</span>
        <span className={styles.slash} aria-hidden="true">/</span>
        <span>{label}</span>
      </Tag>
      <span className={styles.rule} aria-hidden="true" />
    </div>
  );
}
