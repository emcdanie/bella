import React from 'react';
import styles from './SectionIndex.module.css';

export interface SectionIndexProps {
  /** The index number, zero-padded (e.g. "01"). */
  index: string;
  /** The section name (e.g. "Featured"); set in caps by the pattern. */
  label: string;
  /**
   * Semantic element. `"h2"` (default) keeps the page outline honest: the
   * index names the section below it. `"p"` when a real heading follows.
   */
  as?: 'h2' | 'h3' | 'p';
  /** Heading id, for the section's aria-labelledby. */
  id?: string;
}

/**
 * SectionIndex (Work patterns, 2026-09-21): Southleft's "01 / FEATURED"
 * rule line. Index, slash, label, then a hairline to the edge. The slash
 * and the rule are decoration; the name reads "01 Featured".
 */
export default function SectionIndex({ index, label, as: Tag = 'h2', id }: SectionIndexProps) {
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
