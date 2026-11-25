import React, { useRef, type CSSProperties, type ReactNode } from 'react';
import Icon from '../Icon/Icon';
import styles from './StatusDot.module.css';

export interface StatusDotProps {
  /** Figma "Label". The word that carries the meaning. */
  label?: ReactNode;
  /** Figma "Show label". Off hides the word visually; it stays the accessible name. */
  showLabel?: boolean;
  /** Figma "Show dot". Off drops the mark and its halo. */
  showDot?: boolean;
  /** Figma "Show wash". Off gives a bare dot with no halo. */
  showWash?: boolean;
  /** Figma "tone". The status colour of the halo and the mark. */
  tone?: 'success' | 'info' | 'attention' | 'danger' | 'neutral';
  /** Figma "mark". `check` shows a Check 16 in the tone's ink instead of the dot (Figma draws it for success only). */
  mark?: 'dot' | 'check';
  /** Extra classes on the root. */
  className?: string;
  style?: CSSProperties;
}

/**
 * A status beside a title: the dot carries the tone, the word carries the
 * meaning. The only dot in CHIP, and it means status. Not interactive.
 */
export default function StatusDot({
  label,
  showLabel = true,
  showDot = true,
  showWash = true,
  tone = 'success',
  mark = 'dot',
  className,
  style,
}: StatusDotProps) {
  const cls = [styles.root, styles[tone], className].filter(Boolean).join(' ');
  /* A status change (rule "Motion that shows what happened", item 7): the
   * colour fades to the new tone and the halo grows out once. A pulse keyed
   * on the tone plays once per change, never on first paint. */
  const firstTone = useRef(tone);
  const changed = tone !== firstTone.current;
  return (
    <span className={cls} style={style} data-bella-component="status-dot">
      {showDot ? (
        <span className={[styles.slot, showWash ? styles.wash : ''].filter(Boolean).join(' ')} aria-hidden="true">
          {changed && showWash ? <span key={tone} className={styles.pulse} data-bella-pulse="" /> : null}
          {mark === 'check' ? <Icon name="Check" size="sm" className={styles.check} /> : <span className={styles.dot} />}
        </span>
      ) : null}
      {label != null ? <span className={showLabel ? styles.label : styles.srOnly}>{label}</span> : null}
    </span>
  );
}
