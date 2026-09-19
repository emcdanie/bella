import React, { type CSSProperties, type ElementType, type ReactNode } from 'react';
import styles from './Card.module.css';

export interface CardProps {
  /**
   * @deprecated No visual effect since the flat surface rules (2026-09-19):
   * cards carry no accent border, trace, or halo. Accepted so existing
   * callers keep compiling; slated for removal in the next major.
   */
  accent?: string;
  /**
   * Surface behavior. `"default"` is theme-aware: the inner panel renders
   * the flat card surface (surface-card: the page ground one step darker, in
   * both themes) and inks follow the semantic cascade, so a light page
   * structurally cannot show a dark card. `"peek"` is the one recorded
   * exception: a fixed always-light paper panel meant to float light on the
   * dark ground; its inks are re-scoped so dark mode cannot render
   * light-on-light. There is no fixed-dark variant.
   */
  variant?: 'default' | 'peek';
  /**
   * Full-bleed cover media above the padded body, shown as is: no gradient
   * or scrim over the image, so never set text on the cover. Marked
   * `aria-hidden` when an `ariaLabel` names the card.
   */
  media?: ReactNode;
  /**
   * @deprecated No effect since the flat surface rules (2026-09-19): media
   * never carries a scrim. Slated for removal in the next major.
   */
  mediaScrim?: boolean;
  /**
   * Whole card is ONE link, no nested links. External (http…) hrefs open in
   * a new tab. Interactive cards (href or onClick) are the only cards that
   * lift on hover and focus.
   */
  href?: string;
  /** Whole card is ONE button (e.g. opens a modal). Ignored when `href` is set. */
  onClick?: () => void;
  /** Accessible name for interactive cards whose visible content isn't the right name. */
  ariaLabel?: string;
  /**
   * Component used to render internal links; inject your router's Link
   * (e.g. next/link) at the consumer; defaults to a plain anchor.
   */
  linkComponent?: ElementType;
  /** Extra classes on the outer wrapper. */
  className?: string;
  /** Extra classes on the inner panel (e.g. custom padding/layout). */
  innerClassName?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

/**
 * The one-card system: every card surface renders through this. Flat at
 * rest (surface-card, a faint border, no shadow), theme-aware by
 * construction; only interactive cards lift on hover and focus. The only
 * fixed-light path is Peek, on purpose.
 */
export default function Card({
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
  /* stable hook for audit:quality's contract-driven rest-state checks */
  const outerProps = {
    className: outerClass,
    style,
    'data-bella-component': 'card',
  } as const;

  const content = (
    <div className={innerClass}>
      {media != null && (
        <div className={styles.media} aria-hidden={ariaLabel ? true : undefined}>
          {media}
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
          {...outerProps}
          aria-label={ariaLabel}
        >
          {content}
        </a>
      );
    }
    return (
      <LinkComponent href={href} {...outerProps} aria-label={ariaLabel}>
        {content}
      </LinkComponent>
    );
  }
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        {...outerProps}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }
  return (
    <div {...outerProps}>
      {content}
    </div>
  );
}
