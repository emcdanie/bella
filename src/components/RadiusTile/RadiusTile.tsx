import React, { type CSSProperties } from 'react';
import styles from './RadiusTile.module.css';

export type RadiusTileRadius = '0' | '4' | '8' | '12' | '16' | '20' | '24' | 'round';

export interface RadiusTileProps {
  /** The corner token the tile is drawn with (border/radius/…). */
  radius: RadiusTileRadius;
  /** The Chip semantic names and size under the token ("sm · 4px"). Defaults to Chip's names. */
  use?: string;
  /** Pink tile whose corner grows from square to the token as it scrolls into view (CHIP Foundations). Still under reduced motion. */
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

/* Chip's semantic names per step, as CHIP Foundations writes them. */
const USE: Record<RadiusTileRadius, string> = {
  '0': 'none · 0px',
  '4': 'sm · 4px',
  '8': 'md, lg · 8px',
  '12': 'lg-focus · 12px',
  '16': 'form · 16px',
  '20': 'card · 20px',
  '24': '24px',
  round: 'pill · 999px',
};

/**
 * One corner token drawn on a 72 tile, with its token name and the semantic
 * names that use it (CHIP Dashboard "Foundations · Shape and space" 808:82396,
 * read 21 Nov 2026). Use: the radius ramp on CHIP Foundations.
 */
export default function RadiusTile({ radius, use, animated, className, style }: RadiusTileProps) {
  return (
    <div className={[styles.tile, animated && styles.animated, className].filter(Boolean).join(' ')} style={style} data-bella-component="radius-tile">
      <span className={[styles.shape, styles[`r${radius}` as keyof typeof styles]].join(' ')} aria-hidden="true" />
      <span className={styles.token}>radius/{radius}</span>
      <span className={styles.use}>{use ?? USE[radius]}</span>
    </div>
  );
}
