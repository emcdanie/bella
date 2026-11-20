import React, { type CSSProperties, type ReactNode } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import Tag from '../Tag/Tag';
import { BRAND_MARKS, FILLED_MARKS, type BrandMark } from './brandMarks';
import styles from './AppTile.module.css';

export interface AppTileProps {
  /** Figma "tone". inverse (ink tile), outline (white with an edge), git, claude (the service colours), info (light blue). */
  tone?: 'inverse' | 'outline' | 'git' | 'claude' | 'info';
  /** Figma "size". sm 32, md 44, lg 48. */
  size?: 'sm' | 'md' | 'lg';
  /** Figma "icon" swap: a glyph from the Icon set (Brain for the agent, GitBranch for git…). */
  icon?: IconName;
  /** A service's brand mark, in place of an icon (GitHub, Figma, Claude). */
  brand?: BrandMark;
  /** Figma "Show badge": a count Tag beside the tile. */
  badge?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * A connected app or service on CHIP Connectors: its icon on a tile, with an
 * optional badge (Figma BellaComponents App tile 796:8193, read 20 Nov 2026).
 * Decorative beside its name: the name carries the meaning.
 */
export default function AppTile({ tone = 'inverse', size = 'md', icon = 'ViewGrid', brand, badge, className, style }: AppTileProps) {
  return (
    <span className={[styles.wrap, className].filter(Boolean).join(' ')} style={style} data-bella-component="app-tile">
      <span className={[styles.tile, styles[tone], styles[size]].join(' ')} aria-hidden="true">
        {brand && FILLED_MARKS[brand] ? (
          <svg viewBox={FILLED_MARKS[brand]} width="24" height="24" fill="currentColor" data-bella-brand aria-hidden="true">
            {BRAND_MARKS[brand].map((d, i) => (
              <path key={i} d={d} />
            ))}
          </svg>
        ) : brand ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" data-bella-brand aria-hidden="true">
            {BRAND_MARKS[brand].map((d, i) => (
              <path key={i} d={d} />
            ))}
          </svg>
        ) : (
          <Icon name={icon} size="lg" />
        )}
      </span>
      {badge != null ? (
        <Tag variant="outline" tone="count">
          {badge}
        </Tag>
      ) : null}
    </span>
  );
}
