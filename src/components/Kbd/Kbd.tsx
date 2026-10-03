import React from 'react';
import styles from './Kbd.module.css';

export interface KbdProps {
  /** The keys in the combination, in order, as they read on the keyboard: `['⌘', 'K']`. */
  keys: string[];
  /**
   * Spoken form of the combination (`"Command K"`). Pass it whenever a key is a
   * symbol: screen readers say "⌘" inconsistently. The glyphs are then hidden
   * from the tree and the label is read instead.
   */
  label?: string;
  /** Extra classes on the root. */
  className?: string;
}

/**
 * A keyboard shortcut, set in Mono keycaps. Not a control: it names keys,
 * it does not press them.
 */
export default function Kbd({ keys, label, className }: KbdProps) {
  const caps = keys.map((k, i) => (
    <kbd key={i} className={styles.key}>
      {k}
    </kbd>
  ));
  return (
    <kbd className={[styles.combo, className].filter(Boolean).join(' ')} data-bella-component="kbd">
      {label ? (
        <>
          <span className={styles.caps} aria-hidden="true">{caps}</span>
          <span className={styles.srOnly}>{label}</span>
        </>
      ) : (
        <span className={styles.caps}>{caps}</span>
      )}
    </kbd>
  );
}
