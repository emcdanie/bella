import React, { useState, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from '../shared/useCountTo';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  /** Figma "size". lane: the compact one, for a card or lane; page: a whole view. */
  size?: 'lane' | 'page';
  /** Figma "Title". Short, says what is missing. */
  title: ReactNode;
  /** Figma "Line". One line on what fills this space (Belfast mode allowed). */
  line?: ReactNode;
  /** Figma "Mark". An emoji, no circle or fill behind it. Decorative: hidden from assistive tech. */
  mark?: string;
  /** An animated image for the mark (an animated WebP, 23 Nov: Noto animated emoji), instead of the emoji. Sized like the emoji's box (48 in a lane, 64 on a page), no circle or fill behind it. The emoji in `mark` stays as the fallback when the image fails to load. */
  markSrc?: string;
  /** The still of `markSrc` (a PNG). Shown instead of the animation when the reader asked for less motion. Without it the animated image is shown as it is. */
  markStill?: string;
  /** What the image shows, only if it says something the words don't. Missing = decorative (empty alt, hidden from assistive tech). */
  markLabel?: string;
  /** Figma "Show mark". Missing mark = off. */
  showMark?: boolean;
  /** Figma "Show action" / "Show secondary action": the Button(s), sm in a lane. Missing = off. */
  actions?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Says a space is empty, kindly, and what fills it (BellaComponents
 * "Empty state" 1014:2670, re-read from the 21 Nov publish). The emoji
 * stands alone, no circle or fill; lane and page are both centred on both
 * axes, the page's text at most 408. Not interactive itself.
 */
export default function EmptyState({
  size = 'lane',
  title,
  line,
  mark,
  markSrc,
  markStill,
  markLabel,
  showMark = mark != null || markSrc != null,
  actions,
  className,
  style,
}: EmptyStateProps) {
  const cls = [styles.root, styles[size], className].filter(Boolean).join(' ');
  const reduced = useReducedMotion();
  const [broken, setBroken] = useState(false);
  const image = markSrc && !broken ? (reduced && markStill ? markStill : markSrc) : null;
  return (
    <div className={cls} style={style} data-bella-component="empty-state" data-bella-reveal="">
      <div className={styles.content}>
        {showMark && image ? (
          <span className={styles.mark} aria-hidden={markLabel ? undefined : true} data-mark="image">
            <img className={styles.image} src={image} alt={markLabel ?? ''} onError={() => setBroken(true)} draggable={false} />
          </span>
        ) : showMark && mark ? (
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
