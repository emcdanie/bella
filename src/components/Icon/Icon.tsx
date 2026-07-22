import React, { type CSSProperties } from 'react';
import { GLYPHS, type IconName } from './registry';

export type { IconName };

export interface IconProps {
  name: IconName;
  /** Size step from the icon ramp: sm 16, md 20, lg 24. */
  size?: 'sm' | 'md' | 'lg';
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
export default function Icon({ name, size = 'md', label, className, style }: IconProps) {
  return (
    <svg
      data-bella-icon=""
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      /* size/stroke ride on style, not SVG attributes: attributes do not
         evaluate CSS custom properties, the style property does */
      style={{
        width: `var(--icon-${size})`,
        height: `var(--icon-${size})`,
        strokeWidth: 'var(--icon-stroke)',
        flexShrink: 0,
        ...style,
      }}
    >
      {GLYPHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
