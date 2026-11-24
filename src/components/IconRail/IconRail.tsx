import React, { type CSSProperties, type ReactNode } from 'react';
import BrandWordmark from '../BrandWordmark/BrandWordmark';
import styles from './IconRail.module.css';

export interface IconRailProps {
  /** The places, as NavItem iconOnly: Home, Projects, Not again, Team, System map. */
  children?: ReactNode;
  /** The item pinned to the bottom (Settings, as NavItem iconOnly). */
  end?: ReactNode;
  /** Accessible name for the navigation landmark. */
  label?: string;
  /**
   * What stands at the top. Default the CHIP mark. An app whose rule is the whole logotype passes it here
   * (CHIP, 24 Nov 2026: BrandWordmark word="CHIP" variant="logotype" in the rail's width); null leaves the top empty.
   */
  logo?: ReactNode;
  /** Extra classes on the rail. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The app's first column (Figma "Icon rail", read 19 Nov 2026; no Figma
 * props). The CHIP mark once (or the app's own `logo`), at the top (the only place it appears), the
 * places under it, and the end item at the bottom. The rail fills the
 * height and width its layout gives it; it sets neither.
 */
export default function IconRail({ children, end, label = 'Main', logo, className, style }: IconRailProps) {
  return (
    <nav
      aria-label={label}
      className={[styles.rail, className].filter(Boolean).join(' ')}
      style={style}
      data-bella-component="icon-rail"
    >
      {logo === null ? null : <span className={styles.logo}>{logo ?? <BrandWordmark word="CHIP" variant="mark" />}</span>}
      {children}
      {end != null ? <span className={styles.end}>{end}</span> : null}
    </nav>
  );
}
