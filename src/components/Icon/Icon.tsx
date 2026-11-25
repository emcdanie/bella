import React, { type CSSProperties } from 'react';
import { GLYPHS, BRAND_GLYPHS, type BrandName, type IconName } from './registry';

export type { IconName };

export interface IconProps {
  name: IconName;
  /** Size step from the icon ramp: sm 16, md 20, lg 24, xl 32 (Figma Icon 156:98). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Decorative by default (aria-hidden). Pass a label to make it meaningful (role=img). */
  label?: string;
  /** Extra classes on the svg. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The only way BELLA renders an icon. Iconoir glyphs from the registry
 * (one set, declared), sized by the icon ramp, always currentColor so the
 * themed ink recolours them for free. Decorative by default; a meaningful
 * icon requires the label prop and never stands without text unless its
 * accessible name is proven in a Behavior story.
 */
/* sm / md / lg / xl on the Figma size scale: 16, 20, 24, 32 */
const ICON_SIZE = { sm: 'var(--size-16)', md: 'var(--size-20)', lg: 'var(--size-24)', xl: 'var(--size-32)' } as const;

/* Figma's Icon set (156:98, read 19 Nov 2026) draws Iconoir's line at 1.8 on
 * the 24 grid and scales it with the box: 1.2 at 16, 1.5 at 20, 1.8 at 24,
 * 2.4 at 32, round caps and joins. In the 24 viewBox that is one number. */
const STROKE = '1.8';

export default function Icon({ name, size = 'md', label, className, style }: IconProps) {
  const brand = name in BRAND_GLYPHS;
  const paths: readonly string[] = brand ? BRAND_GLYPHS[name as BrandName] : GLYPHS[name as keyof typeof GLYPHS];
  return (
    <svg
      data-bella-icon=""
      data-bella-brand={brand ? '' : undefined}
      viewBox="0 0 24 24"
      fill={brand ? 'currentColor' : 'none'}
      stroke={brand ? 'none' : 'currentColor'}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      /* size/stroke ride on style, not SVG attributes: attributes do not
         evaluate CSS custom properties, the style property does */
      style={{
        width: ICON_SIZE[size],
        height: ICON_SIZE[size],
        strokeWidth: brand ? undefined : STROKE,
        flexShrink: 0,
        ...style,
      }}
    >
      {paths.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
