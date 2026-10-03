import React, { type ElementType, type ReactNode } from 'react';
import styles from './ActionChip.module.css';

export interface ActionChipProps {
  /** What happens, in sentence case ("Try in sandbox"). */
  children?: ReactNode;
  /** The action. Use href instead when the chip goes somewhere. */
  onClick?: () => void;
  /** Renders a link instead of a button. */
  href?: string;
  /** For client-side routers: the component that renders the link. */
  linkComponent?: ElementType;
  disabled?: boolean;
  /** An accessible name when the visible words are not enough. */
  ariaLabel?: string;
  className?: string;
}

/**
 * The quiet action: a sentence-case pill for suggestions, chips and the
 * small actions under an answer. Below secondary in weight, never a toggle
 * (that is FilterChip) and never the page's main action (that is Button).
 */
export default function ActionChip({
  children,
  onClick,
  href,
  linkComponent: LinkComponent = 'a',
  disabled,
  ariaLabel,
  className,
}: ActionChipProps) {
  const cls = [styles.chip, className].filter(Boolean).join(' ');
  if (href && !disabled) {
    return (
      <LinkComponent href={href} className={cls} aria-label={ariaLabel} data-bella-component="action-chip">
        {children}
      </LinkComponent>
    );
  }
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} aria-label={ariaLabel} data-bella-component="action-chip">
      {children}
    </button>
  );
}
