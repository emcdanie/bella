import React, { type ReactNode } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  /** A quiet line above the title: breadcrumb, source or category ("Specimen No. 002 · Actions"). */
  meta?: ReactNode;
  /** The page title, the page's one h1. */
  title: ReactNode;
  /** One or two sentences under the title, held to the body measure. */
  lede?: ReactNode;
  /** An Iconoir glyph in a quiet well before the title (BellaComponents, 11 Nov 2026). Decorative: the title names the page. */
  icon?: IconName;
  /** Something that belongs to the title, beside it but outside the h1 (a quiet ⋯ menu), so the heading's name stays the title alone. */
  titleAside?: ReactNode;
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
export default function PageHeader({ meta, icon, title, titleAside, lede, actions, id, className }: PageHeaderProps) {
  return (
    <header className={[styles.header, className].filter(Boolean).join(' ')} data-bella-component="page-header">
      {meta != null ? <p className={styles.meta}>{meta}</p> : null}
      <div className={styles.row}>
        <div className={styles.titleGroup}>
          {icon ? (
            <span className={styles.iconWell} aria-hidden="true">
              <Icon name={icon} size="lg" />
            </span>
          ) : null}
          <h1 id={id} className={styles.title}>
            {title}
          </h1>
          {titleAside != null ? <div className={styles.titleAside}>{titleAside}</div> : null}
        </div>
        {actions != null ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {lede != null ? <p className={styles.lede}>{lede}</p> : null}
    </header>
  );
}
