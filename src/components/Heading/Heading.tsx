import React, { type CSSProperties, type ElementType, type ReactNode } from 'react';
import styles from './Heading.module.css';

export interface HeadingProps {
  /**
   * Visual tier: `"hero"` and `"page"` are the 40 to 76px display ramp,
   * `"section"` the 32 to 44px h2 ramp. All Geist Light 300, sentence case,
   * tight tracking; the 32px section floor is structural.
   */
  tier?: 'hero' | 'page' | 'section';
  /** Semantic element, decoupled from the visual tier; defaults h1 for hero/page, h2 otherwise. */
  as?: 'h1' | 'h2' | 'h3';
  /** Optional accent segment rendered in the theme accent after the text. */
  accent?: ReactNode;
  /** Text that follows the accent segment in the primary ink (e.g. a full stop). */
  after?: ReactNode;
  /**
   * Accessible name override, for when an interactive accent (a glossary
   * term button) would otherwise pad or garble the heading's name.
   */
  label?: string;
  id?: string;
  /** Extra classes on the heading. */
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * Geist Light carries every heading tier; Unique is the wordmark only.
 * 32px floor, never inside a card.
 */
export default function Heading({
  tier = 'section',
  as,
  accent,
  after,
  label,
  id,
  className,
  style,
  children,
}: HeadingProps) {
  const Tag: ElementType = as ?? (tier === 'hero' || tier === 'page' ? 'h1' : 'h2');
  return (
    <Tag
      id={id}
      aria-label={label}
      style={style}
      className={[styles.heading, styles[tier], className].filter(Boolean).join(' ')}
      data-bella-component="heading"
    >
      {children}
      {accent != null ? <span className={styles.accent}> {accent}</span> : null}
      {after}
    </Tag>
  );
}
