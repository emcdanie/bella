import React, { type CSSProperties, type ReactNode } from 'react';
import BrandWordmark from '../BrandWordmark/BrandWordmark';
import Trailing from '../Trailing/Trailing';
import styles from './ClientSwitcher.module.css';

export interface ClientSwitcherProps {
  /** Figma "Name". The client, Lexend 700. No dot: the red dot lives only inside the drawn logo. */
  name: string;
  /** Figma "Caption". What the client is. */
  caption?: string;
  /** The client's mark in the tile (Figma: swap Tile › Mark). Default: the BELLA mark. */
  mark?: ReactNode;
  /** Opens the client list. */
  onClick?: () => void;
  /** Whether the client list is open (aria-expanded). */
  expanded?: boolean;
  /** Extra classes on the button. */
  className?: string;
  style?: CSSProperties;
}

/**
 * Which client the CHIP panel shows (Figma "Client switcher", read 19 Nov
 * 2026). Figma's `state` (default, hover, focus) is CSS, not a prop. The
 * whole block is one button, named "Switch client" plus what it shows; the
 * ⇅ is the Trailing part.
 */
export default function ClientSwitcher({ name, caption, mark, onClick, expanded, className, style }: ClientSwitcherProps) {
  return (
    <button
      type="button"
      className={[styles.switcher, className].filter(Boolean).join(' ')}
      style={style}
      onClick={onClick}
      aria-haspopup="listbox"
      aria-expanded={expanded}
      data-bella-component="client-switcher"
    >
      <span className={styles.tile} aria-hidden="true">{mark ?? <BrandWordmark word="BELLA" variant="mark" />}</span>
      <span className={styles.text}>
        <span className={styles.srOnly}>Switch client: </span>
        <span className={styles.name}>{name}</span>
        {caption != null ? <span className={styles.caption}>{caption}</span> : null}
      </span>
      <Trailing icon="NavArrowUpDown" />
    </button>
  );
}
