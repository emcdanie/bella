import React, { type ElementType, type ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  /**
   * Tier. `"primary"` is the raised keycap, the one 3D moment in a view;
   * render at most ONE per view. `"secondary"` is the flat accent outline.
   * `"tertiary"` is the text tier: accent and underlined, nothing else.
   * The neutral keycap is retired; there is no fourth tier.
   */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Renders the button as ONE anchor. External (http...) hrefs open in a new tab. */
  href?: string;
  /** Renders a real button. Ignored when `href` is set. */
  onClick?: () => void;
  /** Button element type; `"submit"` for forms. */
  type?: 'button' | 'submit';
  /** Disabled state: muted surface, no elevation, no affordances. Buttons only, not links. */
  disabled?: boolean;
  /**
   * Component used to render internal links; inject your router's Link
   * (e.g. next/link) at the consumer; defaults to a plain anchor.
   */
  linkComponent?: ElementType;
  /** Accessible name when the visible label isn't the right name. */
  ariaLabel?: string;
  /** Extra classes on the control. */
  className?: string;
  children?: ReactNode;
}

/**
 * Keycaps with real hierarchy: two colour treatments, three tiers, one
 * primary per view. Labels are Geist caps, never Unique.
 */
export default function Button({
  variant = 'secondary',
  href,
  onClick,
  type = 'button',
  disabled,
  linkComponent: LinkComponent = 'a',
  ariaLabel,
  className,
  children,
}: ButtonProps) {
  const cls = [styles.button, styles[variant], className].filter(Boolean).join(' ');
  /* stable hook for audit:quality's contract-driven rest-state checks */
  const shared = {
    className: cls,
    'data-bella-component': 'button',
    'aria-label': ariaLabel,
  } as const;

  if (href) {
    const external = href.startsWith('http');
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...shared}>
          {children}
        </a>
      );
    }
    return (
      <LinkComponent href={href} {...shared}>
        {children}
      </LinkComponent>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} {...shared}>
      {children}
    </button>
  );
}
