import React, { type CSSProperties, type ReactNode } from 'react';
import Pin from '../Pin/Pin';
import styles from './PartRow.module.css';

export interface PartRowProps {
  /** The Pin's number; the same number sits on the part in the render. */
  number: ReactNode;
  /** The Pin's tone (Figma: blue). */
  tone?: 'yellow' | 'pink' | 'blue' | 'red' | 'green';
  /** Figma "Title": the part's name. */
  title: ReactNode;
  /** Figma "Description": what the part does. */
  description?: ReactNode;
  /** Figma "Detail" (Show detail): its tokens. */
  detail?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * One numbered part in an anatomy list: pin, part name, what it does, and
 * its tokens (Figma BellaComponents Part row 841:124467, read 20 Nov 2026).
 * A caption beside a render whose parts carry the same numbered Pins, not a control.
 */
export default function PartRow({ number, tone = 'blue', title, description, detail, className, style }: PartRowProps) {
  return (
    <div className={[styles.row, className].filter(Boolean).join(' ')} style={style} data-bella-component="part-row">
      <Pin number={number} variant={tone} pinStyle="solid" />
      <div className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description != null ? <span className={styles.line}>{description}</span> : null}
        {detail != null ? <span className={styles.line}>{detail}</span> : null}
      </div>
    </div>
  );
}
