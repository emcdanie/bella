import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './TextStack.module.css';

export interface TextStackProps {
  /** Figma "Overline" + "↳ Overline text". Missing = off. Subtext face. */
  overline?: ReactNode;
  /** Figma "Title" + "↳ Title text". Missing = off. Semibold ink. */
  title?: ReactNode;
  /** Figma "Subtitle" + "↳ Subtitle text". Missing = off. Subtext face. */
  subtitle?: ReactNode;
  /** Figma "Body" + "↳ Body text". Missing = off. Reading face, wraps. */
  /** Figma "Meta" (21 Nov publish): one line of files, counts or places under the subtitle ("Button.tsx · 3 pages · 6 files"), reading face 16, content/subtle. */
  meta?: ReactNode;
  body?: ReactNode;
  /** Extra classes on the stack. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The text column every row, card and header reuses: overline, title,
 * subtitle, body, 4 apart on one left edge, fill width, wrap.
 */
export default function TextStack({ overline, title, subtitle, meta, body, className, style }: TextStackProps) {
  return (
    <div className={[styles.stack, className].filter(Boolean).join(' ')} style={style} data-bella-component="text-stack">
      {overline != null ? <span className={styles.overline}>{overline}</span> : null}
      {title != null ? <span className={styles.title}>{title}</span> : null}
      {subtitle != null ? <span className={styles.subtitle}>{subtitle}</span> : null}
      {meta != null ? <span className={styles.meta}>{meta}</span> : null}
      {body != null ? <p className={styles.body}>{body}</p> : null}
    </div>
  );
}
