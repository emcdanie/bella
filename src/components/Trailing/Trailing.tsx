import React, { type CSSProperties } from 'react';
import Icon from '../Icon/Icon';
import styles from './Trailing.module.css';

/** Figma "Icon" choices: › opens, ↗ leaves, ⇅ switches (the client switcher). */
export type TrailingIcon = 'NavArrowRight' | 'ArrowUpRight' | 'NavArrowUpDown';

export interface TrailingProps {
  /** Figma "Icon" (instance swap). Default › = "open where you see more". */
  icon?: TrailingIcon;
  /** Decorative by default (the row names the target). Pass a label to make the glyph meaningful. */
  label?: string;
  /** Extra classes on the frame. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The end-of-row mark: a 24 frame that fills the row height with the glyph
 * centred, and a 44 hit area. The whole row is the target; this only marks it.
 */
export default function Trailing({ icon = 'NavArrowRight', label, className, style }: TrailingProps) {
  return (
    <span className={[styles.trailing, className].filter(Boolean).join(' ')} style={style} data-bella-component="trailing">
      {/* Figma Trailing (1240:554): › and ↗ are the xl (32) icon so the
          chevron draws 8 x 16, its line overridden to 1.5px (1.125 on the 24
          grid); ⇅ is the plain lg (24) icon at its own 1.8 line. */}
      {icon === 'NavArrowUpDown' ? (
        <Icon name={icon} label={label} size="lg" />
      ) : (
        <Icon name={icon} label={label} size="xl" style={{ strokeWidth: '1.125' }} />
      )}
    </span>
  );
}
