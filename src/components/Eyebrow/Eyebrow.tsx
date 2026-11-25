import React, { type ReactNode } from 'react';
import styles from './Eyebrow.module.css';

export interface EyebrowProps {
  /** The text colour (BELLA: tone = colour, variant = style; renamed from `variant`, 25 Nov 2026). `"muted"` (default)
   *  is text-body; `"ink"` is text-primary, for an eyebrow that leads a part. */
  tone?: 'muted' | 'ink';
  /** Semantic element. An eyebrow is a label above a heading, never the heading. */
  as?: 'p' | 'span' | 'div';
  className?: string;
  children?: ReactNode;
}

/**
 * Eyebrow (style unify, 2026-09-22): the label above a heading; DM Sans 16px, sentence case since the type lock (2026-10-04).
 * 16px (font-size.tag), ss09, no tracking, no caps. Never an accent: wayfinding is not action.
 */
export default function Eyebrow({ tone = 'muted', as: Tag = 'p', className, children }: EyebrowProps) {
  return (
    <Tag
      className={[styles.eyebrow, styles[tone], className].filter(Boolean).join(' ')}
      data-bella-component="eyebrow"
      data-tone={tone}
    >
      {children}
    </Tag>
  );
}
