import React, { type ReactNode } from 'react';

/* Tiles for the Brand pages (brand refresh, 2026-09-22). Tokens only. The
 * stage ground is fixed per tile (an asset is shown on the ground it is made
 * for: the white page, the panel, the dark page); the frame and caption flip
 * with [data-theme]. A tile holds an image (src) or a live component
 * (children). */

type Ground = 'light' | 'panel' | 'dark';

const stageBg: Record<Ground, string> = {
  light: 'var(--color-light-bg)',
  panel: 'var(--color-light-panel)',
  dark: 'var(--color-dark-bg)',
};

export function AssetGrid({ columns = 3, children }: { columns?: number; children: ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, ${columns === 2 ? 320 : 220}px), 1fr))`,
        gap: 'var(--spacing-4)',
        margin: 'var(--spacing-5) 0 var(--spacing-8)',
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
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-semantic-border)',
        overflow: 'hidden',
        background: 'var(--color-semantic-surface)',
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
          padding: 'var(--spacing-6)',
          color: ground === 'dark' ? 'var(--color-dark-ink)' : 'var(--color-light-ink)',
        }}
      >
        {children ?? <img src={src} alt={alt} style={{ height, maxWidth: '100%', display: 'block' }} />}
      </div>
      <figcaption
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--spacing-3)',
          padding: 'var(--spacing-3) var(--spacing-4)',
          borderTop: '1px solid var(--color-semantic-border)',
          fontSize: 'var(--typography-font-size-sm)',
          color: 'var(--color-semantic-text-secondary)',
        }}
      >
        <span>{label}</span>
        {src && download ? (
          <a href={src} download={download} style={{ color: 'var(--color-semantic-link)', fontWeight: 500 }}>
            {format} ↓
          </a>
        ) : null}
      </figcaption>
    </figure>
  );
}
