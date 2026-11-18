import React, { type ReactNode } from 'react';

/* Tiles for the Brand pages (brand refresh, 2026-09-22). Tokens only. The
 * stage ground is fixed per tile (an asset is shown on the ground it is made
 * for: the white page, the panel, the dark page); the frame and caption flip
 * with [data-theme]. A tile holds an image (src) or a live component
 * (children). */

type Ground = 'light' | 'panel' | 'dark';

const stageBg: Record<Ground, string> = {
  /* colour B (2026-10-04): the light ground is cool.25; white is the card */
  light: 'var(--color-background-default)',
  panel: 'var(--color-neutral-100)',
  dark: 'var(--color-neutral-black)',
};

export function AssetGrid({ columns = 3, children }: { columns?: number; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${columns === 2 ? 320 : 220}px), 1fr))`,
        gap: 'var(--spacing-16)',
        margin: 'var(--spacing-20) 0 var(--spacing-32)',
      }}
    >
      {children}
    </div>
  );
}

export function AssetTile({
  src,
  alt = '',
  ground = 'light',
  label,
  height = 96,
  download,
  format = 'SVG',
  children,
}: {
  src?: string;
  alt?: string;
  ground?: Ground;
  label: ReactNode;
  height?: number;
  download?: string;
  format?: string;
  children?: ReactNode;
}) {
  return (
    <figure
      style={{
        margin: 0,
        borderRadius: 'var(--border-radius-12)',
        border: '1px solid var(--color-border-default)',
        overflow: 'hidden',
        background: 'var(--color-background-surface)',
      }}
    >
      <div
        data-bella-ground
        style={{
          background: stageBg[ground],
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-24)',
          color: ground === 'dark' ? 'var(--color-neutral-100)' : 'var(--color-content-default)',
        }}
      >
        {children ?? <img src={src} alt={alt} style={{ height, maxWidth: '100%', display: 'block' }} />}
      </div>
      <figcaption
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--spacing-12)',
          padding: 'var(--spacing-12) var(--spacing-16)',
          borderTop: '1px solid var(--color-border-default)',
          fontSize: 'var(--typography-font-size-18)',
          color: 'var(--color-content-body)',
        }}
      >
        <span>{label}</span>
        {src && download ? (
          <a href={src} download={download} style={{ color: 'var(--color-content-link)', fontWeight: 500 }}>
            {format} ↓
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}
