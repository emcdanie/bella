import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './SizeTag.module.css';

export interface SizeTagProps {
  /** Figma "Value": the measured size ("24"). */
  children: ReactNode;
  /** Figma "tone": the colour of the annotation it belongs to. */
  tone?: 'yellow' | 'pink' | 'blue' | 'red';
  className?: string;
  style?: CSSProperties;
}

/**
 * A measured size beside a bracket, in the colour of its annotation (Figma
 * BellaComponents Size tag 634:1152, read 20 Nov 2026). A filled rectangle
 * with small corners, never a pill.
 */
export default function SizeTag({ children, tone = 'yellow', className, style }: SizeTagProps) {
  return (
    <span className={[styles.tag, styles[tone], className].filter(Boolean).join(' ')} style={style} data-bella-component="size-tag">
      {children}
    </span>
  );
}
