import React, { type MouseEvent } from 'react';
import styles from './SectionNav.module.css';

export interface SectionNavItem {
  href: string;
  label: string;
  /** The section on screen; rendered as aria-current="page". */
  current?: boolean;
}

export interface SectionNavProps {
  /** The sections, in order. */
  items: SectionNavItem[];
  /** Accessible name for the nav landmark. Required: a page can hold more than one nav. */
  label: string;
  /** Called on every link click, before navigation; call event.preventDefault() to route in-app. */
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Extra classes on the nav. */
  className?: string;
}

/**
 * The top bar's row of sections, as documentation sites draw it: plain links,
 * the current one marked by weight and a line under it, never by colour alone.
 */
export default function SectionNav({ items, label, onNavigate, className }: SectionNavProps) {
  return (
    <nav aria-label={label} className={[styles.nav, className].filter(Boolean).join(' ')} data-bella-component="section-nav">
      <ul className={styles.list}>
        {items.map((it) => (
          <li key={it.href}>
            <a
              href={it.href}
              className={styles.item}
              aria-current={it.current ? 'page' : undefined}
              onClick={onNavigate ? (e) => onNavigate(it.href, e) : undefined}
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
