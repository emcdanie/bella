import React, { type ReactNode } from 'react';

/* Tiles for the Logo and Illustration pages. Tokens only. The stage colour
 * is fixed per tile (a logo is shown on the ground it was made for), so the
 * stage uses brand primitives; the frame and caption flip with [data-theme]. */

type Ground = 'ground' | 'navy' | 'paper';

const stageBg: Record<Ground, string> = {
  ground: 'var(--color-brand-ground)',
  navy: 'var(--color-brand-navy)',
  paper: 'var(--color-neutral-paper)',
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
  alt,
  ground = 'ground',
  label,
  height = 96,
  download,
}: {
  src: string;
  alt: string;
  ground?: Ground;
  label: ReactNode;
  height?: number;
  download?: string;
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
        style={{
          background: stageBg[ground],
          minHeight: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--spacing-6)',
        }}
      >
        <img src={src} alt={alt} style={{ height, maxWidth: '100%', display: 'block' }} />
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
        <a href={src} download={download} style={{ color: 'var(--color-semantic-link)', fontWeight: 500 }}>
          SVG ↓
        </a>
      </figcaption>
    </figure>
  );
}

/** The lockup inside a dashed clear-space frame (one ear-height all round). */
export function ClearSpace({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      style={{
        display: 'inline-block',
        padding: 'var(--spacing-8)',
        outline: '1.5px dashed var(--color-semantic-accent-border)',
        borderRadius: 'var(--radius-sm)',
        margin: 'var(--spacing-5) 0 var(--spacing-8)',
      }}
    >
      <img src={src} alt={alt} style={{ height: 64, display: 'block' }} />
    </div>
  );
}
