import React, { type CSSProperties, type ElementType, type ReactNode } from 'react';
import styles from './TextStack.module.css';

export interface TextStackProps {
  /** Figma "Overline" + "↳ Overline text". Missing = off. Subtext face. */
  overline?: ReactNode;
  /** Figma "Title" + "↳ Title text". Missing = off. 20 regular ink (21 Nov publish). */
  title?: ReactNode;
  /** The title's element: a heading when the stack names a section or record ("h2" on a History record),
   * as ListRow and SectionHead offer. It looks the same at every level. Default span. */
  titleAs?: 'span' | 'h2' | 'h3' | 'h4';
  /**
   * Figma "Count" + "↳ Count text" (published 21 Nov): a number that belongs
   * to the title (a node's part count), at the right end of the Title row, 8
   * apart; number face 600, the subtitle's size and colour. Missing = off.
   * Never put the number inside the title text.
   */
  count?: ReactNode;
  /** Figma "Subtitle" + "↳ Subtitle text". Missing = off. Subtext face. */
  subtitle?: ReactNode;
  /** Figma "Meta" (21 Nov publish): one line of files, counts or places under the subtitle ("Button.tsx · 3 pages · 6 files"), reading face 16, content/subtle. */
  meta?: ReactNode;
  /** Figma "Body" + "↳ Body text". Missing = off. Reading face, wraps. */
  body?: ReactNode;
  /** Extra classes on the stack. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The text column every row, card and header reuses: overline, title,
 * subtitle, body, 4 apart on one left edge, fill width, wrap.
 */
export default function TextStack({ overline, title, titleAs = 'span', count, subtitle, meta, body, className, style }: TextStackProps) {
  const Title: ElementType = titleAs;
  return (
    <div className={[styles.stack, className].filter(Boolean).join(' ')} style={style} data-bella-component="text-stack">
      {overline != null ? <span className={styles.overline}>{overline}</span> : null}
      {title != null && count != null ? (
        <div className={styles.titleRow}>
          <Title className={styles.title}>{title}</Title>
          <span className={styles.count}>{count}</span>
        </div>
      ) : title != null ? (
        <Title className={styles.title}>{title}</Title>
      ) : null}
      {subtitle != null ? <span className={styles.subtitle}>{subtitle}</span> : null}
      {meta != null ? <span className={styles.meta}>{meta}</span> : null}
      {body != null ? <p className={styles.body}>{body}</p> : null}
    </div>
  );
}
