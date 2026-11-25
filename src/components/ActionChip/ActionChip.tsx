import React, { type ElementType, type ReactNode } from 'react';
import Icon from '../Icon/Icon';
import styles from './ActionChip.module.css';

export interface ActionChipProps {
  /** What happens, in sentence case ("Try in sandbox"). */
  children?: ReactNode;
  /** Figma "Label". Same as children; children win when both are set. */
  label?: ReactNode;
  /** The action. Use href instead when the chip goes somewhere. */
  onClick?: () => void;
  /** Renders a link instead of a button. */
  href?: string;
  /** For client-side routers: the component that renders the link. */
  linkComponent?: ElementType;
  disabled?: boolean;
  /**
   * The job this chip started is running ("Ask"): a RefreshDouble icon turns
   * before the label, aria-busy is set and clicks wait; the label stays (as
   * Button busy). Reduced motion: the icon holds still. Buttons only.
   */
  busy?: boolean;
  /** An accessible name when the visible words are not enough. */
  ariaLabel?: string;
  /** `"quiet"`: no border at rest, the inset fill on hover and focus; for a small icon action like a ⋯ menu beside content. */
  variant?: 'default' | 'quiet';
  className?: string;
}

/**
 * The quiet action: a sentence-case pill for suggestions, chips and the
 * small actions under an answer. Below secondary in weight, never a toggle
 * (that is FilterChip) and never the page's main action (that is Button).
 */
export default function ActionChip({
  children: childrenProp,
  label,
  onClick,
  href,
  linkComponent: LinkComponent = 'a',
  disabled,
  busy = false,
  ariaLabel,
  variant = 'default',
  className,
}: ActionChipProps) {
  const busyHere = busy && !href;
  const words = childrenProp ?? label;
  const children = busyHere ? (
    <>
      <span className={styles.turn} aria-hidden="true">
        <Icon name="RefreshDouble" size="sm" />
      </span>
      {words}
    </>
  ) : (
    words
  );
  const cls = [styles.chip, variant === 'quiet' ? styles.quiet : '', busyHere ? styles.busy : '', className].filter(Boolean).join(' ');
  if (href && !disabled) {
    return (
      <LinkComponent href={href} className={cls} aria-label={ariaLabel} data-bella-component="action-chip">
        {children}
      </LinkComponent>
    );
  }
  return (
    <button
      type="button"
      className={cls}
      onClick={busyHere ? undefined : onClick}
      disabled={disabled}
      aria-busy={busyHere || undefined}
      aria-disabled={busyHere || undefined}
      aria-label={ariaLabel}
      data-bella-component="action-chip"
    >
      {children}
    </button>
  );
}
