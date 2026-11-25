import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './Marker.module.css';

export interface MarkerProps {
  /** Figma "Phrase": the key word or phrase, a few words, never a sentence. */
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * Figma "Marker" 1600:45992 (22 Nov publish): the keyword mark. The key
 * phrase at 600 over a soft blue underline (wash/blue-strong), inline, so it
 * wraps with its line. One per paragraph or answer; bold is for keywords
 * only, and every keyword gets this underline (22 Nov).
 */
export default function Marker({ children, className, style }: MarkerProps) {
  return (
    <mark className={[styles.marker, className].filter(Boolean).join(' ')} style={style} data-bella-component="marker">
      {children}
    </mark>
  );
}
