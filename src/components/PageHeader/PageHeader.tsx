import React, { type ReactNode } from 'react';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  /** A quiet line above the title: breadcrumb, source or category ("Specimen No. 002 · Actions"). */
  meta?: ReactNode;
  /** The page title, the page's one h1. */
  title: ReactNode;
  /** One or two sentences under the title, held to the body measure. */
  lede?: ReactNode;
  /** The page's actions: at most one primary Button, the rest secondary or ActionChip. */
  actions?: ReactNode;
  /** The h1's id. */
  id?: string;
  className?: string;
}

/**
 * The top of every page (layout foundation, 2026-10-03). One fixed title
 * size on every page, not the display ramp: an app page title is a label
 * for the page, not a hero. The title balances; the lede wraps pretty and
 * stops at 70ch. Actions sit beside the title when there is room.
 */
export default function PageHeader({ meta, title, lede, actions, id, className }: PageHeaderProps) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')} data-bella-component="page-header">
      {meta != null ? <p className={styles.meta}>{meta}</p> : null}
      <div className={styles.row}>
        <h1 id={id} className={styles.title}>
          {title}
        </h1>
        {actions != null ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {lede != null ? <p className={styles.lede}>{lede}</p> : null}
    </header>
  );
}
