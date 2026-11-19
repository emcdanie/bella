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
  /** Extra classes on the rail. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The app's first column (Figma "Icon rail", read 19 Nov 2026; no Figma
 * props). The CHIP mark once, at the top (the only place it appears), the
 * places under it, and the end item at the bottom. The rail fills the
 * height and width its layout gives it; it sets neither.
 */
export default function IconRail({ children, end, label = 'Main', className, style }: IconRailProps) {
  return (
    <nav
      aria-label={label}
      className={[styles.rail, className].filter(Boolean).join(' ')}
      style={style}
      data-bella-component="icon-rail"
    >
      <span className={styles.logo}>
        <BrandWordmark word="CHIP" variant="mark" />
      </span>
      {children}
      {end != null ? <span className={styles.end}>{end}</span> : null}
    </nav>
  );
}
