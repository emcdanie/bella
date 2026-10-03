import React, { type ReactNode } from 'react';
import styles from './SidebarLayout.module.css';

export interface SidebarLayoutProps {
  /** The sticky aside on the left: a list, a library, an "On this page". */
  aside: ReactNode;
  /** The aside's landmark name ("Components", "On this page"). */
  asideLabel: string;
  /** An optional rail on the right: facts, status, metadata. */
  rail?: ReactNode;
  /** The rail's landmark name; required with a rail. */
  railLabel?: string;
  /** The content column. */
  children?: ReactNode;
  className?: string;
}

/**
 * The aside, the content and an optional rail on the page grid (layout
 * foundation, 2026-10-03). The layout follows its own width, not the
 * window: 12 columns from 1200px (aside 3, content 9 or 6 + rail 3),
 * 8 from 768px (aside 3, content 5, the rail under the content), one column
 * below. The aside sticks under the header and scrolls on its own when it is
 * taller than the screen.
 */
export default function SidebarLayout({ aside, asideLabel, rail, railLabel, children, className }: SidebarLayoutProps) {
  return (
    <div className={styles.container} data-bella-component="sidebar-layout">
      <div className={[styles.grid, rail != null ? styles.withRail : '', className].filter(Boolean).join(' ')}>
        {/* a scrolling aside must be reachable by keyboard */}
        <aside className={styles.aside} aria-label={asideLabel} tabIndex={0}>
          {aside}
        </aside>
        <div className={styles.content}>{children}</div>
        {rail != null ? (
          <aside className={styles.rail} aria-label={railLabel}>
            {rail}
          </aside>
        ) : null}
      </div>
    </div>
  );
}
