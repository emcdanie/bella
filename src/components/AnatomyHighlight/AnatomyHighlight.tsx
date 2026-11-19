import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './AnatomyHighlight.module.css';

export interface AnatomyTagProps {
  /** Figma "Label": the piece's name. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/** Figma _Anatomy tag (1311:5454): the label of a highlight, also placed alone in the margin level with its piece. */
export function AnatomyTag({ children, className, style }: AnatomyTagProps) {
  return (
    <span className={[styles.tag, className].filter(Boolean).join(' ')} style={style} data-bella-component="anatomy-tag">
      {children}
    </span>
  );
}

export interface AnatomyHighlightProps {
  /** The piece's name, on the tag. */
  label: ReactNode;
  /** Figma "shape": round for round pieces (pill, dot, avatar). */
  shape?: 'square' | 'round';
  /** Figma "tag": bottom when a piece above would cover the tag. */
  tag?: 'top' | 'bottom';
  /** Figma "Show tag". */
  showTag?: boolean;
  className?: string;
  /** Place it over the piece: absolute, sized to the piece's box (inset, or left / top / width / height). */
  style?: CSSProperties;
}

/**
 * Marks one piece of a part on a doc page (Figma BellaComponents Anatomy
 * highlight 1309:233, read 20 Nov 2026; her 18 Nov "so you can see what the
 * pieces are .. and it hightlights"): a 2px outline round the piece, outside
 * so it never covers it, and a tag naming the piece on the outline's edge.
 * No numbers. The page places it absolute over the specimen.
 */
export default function AnatomyHighlight({ label, shape = 'square', tag = 'top', showTag = true, className, style }: AnatomyHighlightProps) {
  return (
    <span
      className={[styles.highlight, shape === 'round' ? styles.round : '', tag === 'bottom' ? styles.bottom : '', className].filter(Boolean).join(' ')}
      style={style}
      data-bella-component="anatomy-highlight"
    >
      {showTag ? <AnatomyTag className={styles.onEdge}>{label}</AnatomyTag> : <span className={styles.name}>{label}</span>}
    </span>
  );
}
