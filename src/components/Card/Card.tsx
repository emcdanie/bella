import React, { type CSSProperties, type ElementType, type ReactNode } from 'react';
import styles from './Card.module.css';

// Component description (autodocs) lives in Card.stories.tsx
// parameters.docs.description.component — Elleta's line, verbatim.

export interface CardProps {
  /**
   * Identity colour driving the border tint, hover trace, and dark halo.
   * A CSS color value — pass a BELLA token reference, e.g.
   * `var(--color-iris-bright)` (the default) or a case identity variable.
   */
  accent?: string;
  /**
   * Surface behavior. `"default"` is theme-aware: the inner panel renders
   * the semantic surface (paper in light, navy card in dark) and inks follow
   * the semantic cascade — a light page structurally cannot show a dark
   * card. `"peek"` is the one recorded exception: a fixed always-light paper
   * panel meant to float light on navy; its inks are re-scoped so dark mode
   * cannot render light-on-light. There is no fixed-dark variant.
   */
  variant?: 'default' | 'peek';
  /**
   * Full-bleed cover media above the padded body. Rendered with the ink-mix
   * scrim so text over the image stays AA. Marked `aria-hidden` when an
   * `ariaLabel` names the card.
   */
  media?: ReactNode;
  /** Whole card is ONE link — no nested links. External (http…) hrefs open in a new tab. */
  href?: string;
  /** Whole card is ONE button (e.g. opens a modal). Ignored when `href` is set. */
  onClick?: () => void;
  /** Accessible name for interactive cards whose visible content isn't the right name. */
  ariaLabel?: string;
  /**
   * Component used to render internal links — inject your router's Link
   * (e.g. next/link) at the consumer; defaults to a plain anchor.
   */
  linkComponent?: ElementType;
  /** Extra classes on the outer trace wrapper. */
  className?: string;
  /** Extra classes on the inner panel (e.g. custom padding/layout). */
  innerClassName?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * THE card (one-card system): every card surface renders through this.
 * Calm at rest — 1px accent-tinted border, card-rest shadow; colour trace
 * on hover/focus; media cards add a covered top with the token scrim;
 * interactive cards are a single anchor/button with a visible focus ring
 * and hover lift. Reduced motion swaps the trace for a static accent ring.
 */
export default function Card({
  accent = 'var(--color-iris-bright)',
  variant = 'default',
  media,
  href,
  onClick,
  ariaLabel,
  linkComponent: LinkComponent = 'a',
  className,
  innerClassName,
  style,
  children,
}: CardProps) {
  const outerClass = [
    styles.card,
    href || onClick ? styles.interactive : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const innerClass = [
    styles.inner,
    variant === 'peek' ? styles.innerPeek : '',
    media != null ? styles.innerFlush : '',
    innerClassName,
  ]
    .filter(Boolean)
    .join(' ');
  const outerStyle = { ['--cc' as string]: accent, ...style };

  const content = (
    <div className={innerClass}>
      {media != null && (
        <div className={styles.media} aria-hidden={ariaLabel ? true : undefined}>
          {media}
          <span className={styles.scrim} aria-hidden="true" />
        </div>
      )}
      {media != null ? <div className={styles.body}>{children}</div> : children}
    </div>
  );

  if (href) {
    const external = href.startsWith('http');
    if (external) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={outerClass}
          style={outerStyle}
          aria-label={ariaLabel}
        >
          {content}
        </a>
      );
    }
    return (
      <LinkComponent href={href} className={outerClass} style={outerStyle} aria-label={ariaLabel}>
        {content}
      </LinkComponent>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={outerClass}
        style={outerStyle}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }
  return (
    <div className={outerClass} style={outerStyle}>
      {content}
    </div>
  );
}
