import React, { type ElementType } from 'react';
import FeaturedCase, { type FeaturedCaseProps } from '../FeaturedCase/FeaturedCase';
import styles from './CaseGrid.module.css';

export type CaseGridItem = Omit<FeaturedCaseProps, 'layout' | 'emphasis' | 'linkComponent'>;

export interface CaseGridProps {
  /** The cases, in reading order. */
  items: CaseGridItem[];
  /** Accessible name for the list (e.g. "Selected work"). */
  label?: string;
  /** Inject the router's Link (e.g. next/link); defaults to a plain anchor. */
  linkComponent?: ElementType;
}

/**
 * CaseGrid (Work patterns, 2026-09-21): two columns once the grid's own
 * container is wide, one column below. NEVER an orphan: with an odd count
 * the last case spans both columns and turns horizontal (it is a
 * FeaturedCase at standard emphasis, which goes wide on its own width), so
 * the grid always closes flush.
 */
export default function CaseGrid({ items, label, linkComponent }: CaseGridProps) {
  const odd = items.length % 2 === 1;
  return (
    <div className={styles.container} data-bella-pattern="case-grid">
      <ul className={styles.grid} role="list" aria-label={label}>
        {items.map((item, i) => {
          const closer = odd && i === items.length - 1 && items.length > 1;
          return (
            <li key={item.href} className={closer ? styles.closer : undefined}>
              <FeaturedCase
                {...item}
                layout={closer ? 'auto' : 'stacked'}
                emphasis="standard"
                linkComponent={linkComponent}
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
