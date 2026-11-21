import React, { type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import styles from './TopBar.module.css';

export interface TopBarProps {
  /** Figma "Place parent". Where the current page lives ("CHIP"), in the subtle ink. */
  placeParent?: string;
  /** Where Place parent goes. Without it the parent is plain text. */
  placeParentHref?: string;
  /** Called when Place parent is clicked (route in the app with event.preventDefault()). */
  onPlaceParent?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Figma "Place current". The page you are on ("Work"), ink 600, aria-current="page". */
  placeCurrent?: string;
  /** Figma "Show place". */
  showPlace?: boolean;
  /** The SearchField, in the right group; it grows up to layout/search/max-width. */
  search?: ReactNode;
  /** After search, 12 apart: Notifications (Button tertiary, icon only, Bell) and the person's Avatar. */
  right?: ReactNode;
  /** Extra classes on the bar. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The top bar of the CHIP app frame (Figma "Top bar" 1168:95226, published
 * 22 Nov 2026; her pick "B · search on the right"): where you are on the
 * left ("CHIP › Work"), search beside the bell and the person on the right.
 */
export default function TopBar({
  placeParent = 'CHIP',
  placeParentHref,
  onPlaceParent,
  placeCurrent = 'Work',
  showPlace = true,
  search,
  right,
  className,
  style,
}: TopBarProps) {
  return (
    <div className={[styles.bar, className].filter(Boolean).join(' ')} style={style} data-bella-component="top-bar">
      {showPlace ? (
        <nav aria-label="Breadcrumb" className={styles.place}>
          <ol className={styles.placeList}>
            <li className={styles.parent}>
              {placeParentHref ? (
                <a href={placeParentHref} onClick={onPlaceParent} className={styles.parentLink}>
                  {placeParent}
                </a>
              ) : (
                placeParent
              )}
              <span className={styles.separator} aria-hidden="true">
                ›
              </span>
            </li>
            <li className={styles.current} aria-current="page">
              {placeCurrent}
            </li>
          </ol>
        </nav>
      ) : null}
      <div className={styles.right}>
        {search != null ? (
          <div role="search" className={styles.search}>
            {search}
          </div>
        ) : null}
        {right}
      </div>
    </div>
  );
}
