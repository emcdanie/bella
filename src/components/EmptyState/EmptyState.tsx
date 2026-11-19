import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  /** Figma "size". lane: the compact one, for a card or lane; page: a whole view. */
  size?: 'lane' | 'page';
  /** Figma "Wash". One brand wash per page, or none. */
  wash?: 'none' | 'pink' | 'blue' | 'ochre' | 'navy';
  /** Figma "Title". Short, says what is missing. */
  title: ReactNode;
  /** Figma "Line". One line on what fills this space (Belfast mode allowed). */
  line?: ReactNode;
  /** Figma "Mark". An emoji in a white circle. Decorative: hidden from assistive tech. */
  mark?: string;
  /** Figma "Show mark". Missing mark = off. */
  showMark?: boolean;
  /** Figma "Show action" / "Show secondary action": the Button(s), sm in a lane. Missing = off. */
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Says a space is empty, kindly, and what fills it (BellaComponents
 * "Empty state" 1014:2670, 20 Nov publish). lane: a centred column; page:
 * left edge, mark and text on top, actions pinned to the bottom. Not
 * interactive itself.
 */
export default function EmptyState({
  size = 'lane',
  wash = 'none',
  title,
  line,
  mark,
  showMark = mark != null,
  actions,
  className,
  style,
}: EmptyStateProps) {
  const cls = [styles.root, styles[size], wash !== 'none' ? styles[wash] : '', className].filter(Boolean).join(' ');
  return (
    <div className={cls} style={style} data-bella-component="empty-state">
      <div className={styles.content}>
        {showMark && mark ? (
          <span className={styles.mark} aria-hidden="true">
            <span className={styles.emoji}>{mark}</span>
          </span>
        ) : null}
        <div className={styles.text}>
          <p className={styles.title}>{title}</p>
          {line != null ? <p className={styles.line}>{line}</p> : null}
        </div>
      </div>
      {actions != null ? <div className={styles.actions}>{actions}</div> : null}
    </div>
  );
}
