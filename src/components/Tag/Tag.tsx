import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './Tag.module.css';

export type TagTone = 'default' | 'count' | 'success' | 'info' | 'attention' | 'danger';

export interface TagProps {
  /**
   * Two jobs on one prop, both kept:
   * - `"default"` / `"accent"`: the original look. `"default"` is the quiet
   *   neutral wash; `"accent"` is the pink fill (#E58BBB) with a near-black
   *   label, 8.13:1 (shared look, 8 Nov 2026). Retired in Figma (17 Nov:
   *   accent is gone from the Tag tones); kept here so existing pages render.
   * - `"outline"` / `"flat"` / `"index"`: Figma's `style` axis (Figma calls
   *   it style; code cannot, `style` is the CSS prop). outline = wash and
   *   edge per tone; flat = grey fill, no edge (18 Nov "B,
   *   flat"); index = the numbered lane pin, number face 600; line = the
   *   surface with the tone's edge and ink (Figma style=line, every tone,
   *   re-read 21 Nov).
   * Every style has the small corner, none is round (21 Nov, "A, small corner").
   * Passing `tone` or `showDot` with `"default"` gives Figma's outline.
   */
  variant?: 'default' | 'accent' | 'outline' | 'flat' | 'index' | 'line';
  /** Figma "tone". Status ladder: attention waiting, info working, success done, danger failed; default neutral; count for numbers. */
  tone?: TagTone;
  /** Figma "Show dot". A 12 dot in the tone before the label. */
  showDot?: boolean;
  /** Extra classes on the chip. */
  className?: string;
  style?: CSSProperties;
  /** Figma "Label". */
  children?: ReactNode;
}

/**
 * Non-interactive metadata. If you can click it, it is not a Tag.
 */
export default function Tag({
  variant = 'default',
  tone,
  showDot = false,
  className,
  style,
  children,
}: TagProps) {
  const figma = tone !== undefined || showDot || variant === 'outline' || variant === 'flat' || variant === 'index' || variant === 'line';
  if (!figma) {
    const cls = [styles.tag, variant === 'accent' ? styles.accent : '', className]
      .filter(Boolean)
      .join(' ');
    return (
      <span className={cls} style={style} data-bella-component="tag">
        {children}
      </span>
    );
  }
  const look = variant === 'flat' || variant === 'index' || variant === 'line' ? variant : 'outline';
  const t: TagTone = look === 'flat' ? 'default' : tone ?? 'default';
  const cls = [styles.plate, styles[look], styles[`tone-${t}`], className].filter(Boolean).join(' ');
  return (
    <span className={cls} style={style} data-bella-component="tag">
      {showDot ? <span className={styles.dot} aria-hidden="true" /> : null}
      {children}
    </span>
  );
}
