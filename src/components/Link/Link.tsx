import React, { type ReactNode } from 'react';
import styles from './Link.module.css';

export interface LinkProps {
  href: string;
  /** Opens in a new tab with rel="noopener noreferrer"; the visible text should say where it goes. */
  external?: boolean;
  className?: string;
  children?: ReactNode;
}

/**
 * Link (brand refresh, 2026-09-22): the inline text link. Ink with an
 * underline at rest; hover thickens the underline to 2px; focus-visible is
 * the shared ochre ring (3px, 3px offset). Visited stays ink. Never colour
 * alone: the underline is the affordance.
 */
export default function Link({ href, external = false, className, children }: LinkProps) {
  return (
    <a
      href={href}
      className={[styles.link, className].filter(Boolean).join(' ')}
      data-bella-component="link"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}
