import React, { type CSSProperties } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import styles from './IconWell.module.css';

export interface IconWellProps {
  /** Figma "Icon" (instance swap). Any name from the Icon registry. */
  icon: IconName;
  /**
   * Figma "tone". Status: success, warning, info, neutral, error (the tone's
   * wash and ink). History kinds: fix, visual, tokens, tooling, docs,
   * contract (the kind's strong wash, an ink glyph); decision (an ink circle,
   * a knockout glyph). BellaComponents Icon well 1168:72470, 21 Nov publish.
   */
  tone?: 'success' | 'warning' | 'info' | 'neutral' | 'error' | 'fix' | 'visual' | 'tokens' | 'tooling' | 'docs' | 'contract' | 'decision';
  /** Figma "size". md: a 36 circle, 24 glyph. sm: a 24 circle, 16 glyph (a source's findings, dense rows). */
  size?: 'md' | 'sm';
  /** Decorative by default. Pass a label only when the icon carries meaning the text beside it does not. */
  label?: string;
  /** Extra classes on the well. */
  className?: string;
  style?: CSSProperties;
}

/**
 * A circle in the tone's wash with an icon in the tone's ink (md 36 / 24,
 * sm 24 / 16). Card and section headers, Stat cards, the Step marker, a
 * source's findings. Not interactive.
 */
export default function IconWell({ icon, tone = 'success', size = 'md', label, className, style }: IconWellProps) {
  return (
    <span className={[styles.well, styles[tone], size === 'sm' ? styles.sm : '', className].filter(Boolean).join(' ')} style={style} data-bella-component="icon-well">
      <Icon name={icon} size={size === 'sm' ? 'sm' : 'lg'} label={label} />
    </span>
  );
}
