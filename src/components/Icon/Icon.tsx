import React, { type CSSProperties } from 'react';

/* Iconoir glyph paths (regular set, MIT), inlined as a registry: BELLA
 * carries the paths it ships, not the library's component surface (the
 * recorded borrow-behavior-only decision). Growing the registry is adding
 * a name and its paths; nothing else changes. */
const GLYPHS = {
  ViewGrid: [
    'M14 20.4V14.6C14 14.2686 14.2686 14 14.6 14H20.4C20.7314 14 21 14.2686 21 14.6V20.4C21 20.7314 20.7314 21 20.4 21H14.6C14.2686 21 14 20.7314 14 20.4Z',
    'M3 20.4V14.6C3 14.2686 3.26863 14 3.6 14H9.4C9.73137 14 10 14.2686 10 14.6V20.4C10 20.7314 9.73137 21 9.4 21H3.6C3.26863 21 3 20.7314 3 20.4Z',
    'M14 9.4V3.6C14 3.26863 14.2686 3 14.6 3H20.4C20.7314 3 21 3.26863 21 3.6V9.4C21 9.73137 20.7314 10 20.4 10H14.6C14.2686 10 14 9.73137 14 9.4Z',
    'M3 9.4V3.6C3 3.26863 3.26863 3 3.6 3H9.4C9.73137 3 10 3.26863 10 3.6V9.4C10 9.73137 9.73137 10 9.4 10H3.6C3.26863 10 3 9.73137 3 9.4Z',
  ],
  Map: [
    'M9 19L3.78974 20.7368C3.40122 20.8663 3 20.5771 3 20.1675L3 5.43246C3 5.1742 3.16526 4.94491 3.41026 4.86325L9 3M9 19L15 21M9 19L9 3M15 21L20.5897 19.1368C20.8347 19.0551 21 18.8258 21 18.5675L21 3.83246C21 3.42292 20.5988 3.13374 20.2103 3.26325L15 5M15 21L15 5M15 5L9 3',
  ],
  Table: [
    'M21 3V21H3V3H21Z',
    'M3 16.5H21',
    'M3 12H21',
    'M3 7.5H21',
    'M16.5 3V21',
    'M12 3V21',
    'M7.5 3V21',
  ],
  NavArrowDown: ['M6 9L12 15L18 9'],
} as const;

export type IconName = keyof typeof GLYPHS;

export interface IconProps {
  name: IconName;
  /** Size step from the icon tokens: sm 16, md 20, lg 24. */
  size?: 'sm' | 'md' | 'lg';
  /** Decorative by default (aria-hidden). Pass a label to make it meaningful (role=img). */
  label?: string;
  /** Extra classes on the svg. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The only way BELLA renders an icon. Iconoir glyphs from the inlined
 * registry, sized by the icon tokens, always currentColor so the themed
 * ink recolours them for free. Decorative by default; a label makes the
 * icon meaningful.
 */
export default function Icon({ name, size = 'md', label, className, style }: IconProps) {
  return (
    <svg
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
