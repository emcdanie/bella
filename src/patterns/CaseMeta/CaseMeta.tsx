import React, { type ReactNode } from 'react';
import styles from './CaseMeta.module.css';

export interface CaseMetaProps {
  /** The case facts: role, timeline, team, scope. */
  items: { label: string; value: ReactNode }[];
  /** Accessible name for the meta column. */
  label?: string;
  /** The case body: Challenge, Objectives, Actions, Milestones, Results. */
  children: ReactNode;
}

/**
 * CaseMeta (Work patterns, 2026-09-21): the case facts in a sticky left
 * column beside the case body, once the pattern's own container is wide;
 * above the body as a compact two-column list below that. The body order
 * it is built for: Challenge / Objectives / Actions / Milestones (the
 * laurenbasser.site structure), with Results kept last.
 */
export default function CaseMeta({ items, label = 'Case details', children }: CaseMetaProps) {
  return (
    <div className={styles.container} data-bella-pattern="case-meta">
      <div className={styles.layout}>
        <aside className={styles.meta} aria-label={label}>
          <dl className={styles.list}>
            {items.map((it) => (
              <div key={it.label} className={styles.item}>
                <dt className={styles.term}>{it.label}</dt>
                <dd className={styles.value}>{it.value}</dd>
              </div>
            ))}
          </dl>
        </aside>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
