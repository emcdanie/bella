import React, { type CSSProperties } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import styles from './IconWell.module.css';

export interface IconWellProps {
  /** Figma "Icon" (instance swap). Any name from the Icon registry. */
  icon: IconName;
  /** Figma "tone". The wash of the circle and the ink of the glyph. */
  tone?: 'success' | 'warning' | 'info' | 'neutral';
  /** Decorative by default. Pass a label only when the icon carries meaning the text beside it does not. */
  label?: string;
  /** Extra classes on the well. */
  className?: string;
  style?: CSSProperties;
}

/**
 * A 36 circle in the tone's wash with a 24 icon in the tone's ink. Card and
 * section headers, Stat cards, the Step marker. Not interactive.
 */
export default function IconWell({ icon, tone = 'success', label, className, style }: IconWellProps) {
  return (
    <span className={[styles.well, styles[tone], className].filter(Boolean).join(' ')} style={style} data-bella-component="icon-well">
      <Icon name={icon} size="lg" label={label} />
    </span>
  );
}
