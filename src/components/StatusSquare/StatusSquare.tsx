import React, { type CSSProperties } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import styles from './StatusSquare.module.css';

export interface StatusSquareProps {
  /** Figma "status". Shape of the glyph and the fill both change, so colour is never the only cue. */
  status?: 'failed' | 'waiting' | 'working' | 'passed';
  /** Accessible name. Defaults to the status word. */
  label?: string;
  /** Extra classes on the square. */
  className?: string;
  style?: CSSProperties;
}

const GLYPH: Record<NonNullable<StatusSquareProps['status']>, IconName> = {
  failed: 'WarningCircle',
  waiting: 'Clock',
  working: 'Sparks',
  passed: 'Check',
};

/**
 * A branch or run status: a 24 filled square with a 16 glyph. Starts a
 * branch row in the project tree. Not interactive.
 */
export default function StatusSquare({ status = 'failed', label, className, style }: StatusSquareProps) {
  return (
    <span
      role="img"
      aria-label={label ?? status}
      className={[styles.square, styles[status], className].filter(Boolean).join(' ')}
      style={style}
      data-bella-component="status-square"
    >
      <Icon name={GLYPH[status]} size="sm" />
    </span>
  );
}
