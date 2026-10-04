import React, { type ReactNode } from 'react';
import styles from './Eyebrow.module.css';

export interface EyebrowProps {
  /** `"muted"` (default) is text-body; `"ink"` is text-primary, for an eyebrow that leads a part. */
  variant?: 'muted' | 'ink';
  /** Semantic element. An eyebrow is a label above a heading, never the heading. */
  as?: 'p' | 'span' | 'div';
  className?: string;
  children?: ReactNode;
}

/**
 * Eyebrow (style unify, 2026-09-22): the label above a heading; Figtree 16px, sentence case since the type lock (2026-10-04).
 * 13px, ss09, no tracking, no caps. Never an accent: wayfinding is not action.
 */
export default function Eyebrow({ variant = 'muted', as: Tag = 'p', className, children }: EyebrowProps) {
  return (
    <Tag
      className={[styles.eyebrow, styles[variant], className].filter(Boolean).join(' ')}
      data-bella-component="eyebrow"
    >
      {children}
    </Tag>
  );
}
