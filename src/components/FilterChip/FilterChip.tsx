import React, { type ReactNode } from 'react';
import styles from './FilterChip.module.css';

export interface FilterChipProps {
  /** The real state. Rendered as aria-pressed; the fill is its paint. */
  pressed: boolean;
  onClick: () => void;
  /** Accessible name when the visible label isn't the right name. */
  ariaLabel?: string;
  /** Extra classes on the chip. */
  className?: string;
  children?: ReactNode;
}

/**
 * The toggle for narrowing a set. Pressed is a real state with real
 * semantics, not a restyle.
 */
export default function FilterChip({
  pressed,
  onClick,
  ariaLabel,
  className,
  children,
}: FilterChipProps) {
  return (
    <button
      type="button"
      className={[styles.chip, className].filter(Boolean).join(' ')}
      aria-pressed={pressed}
      aria-label={ariaLabel}
      onClick={onClick}
      data-bella-component="filter-chip"
    >
      {children}
    </button>
  );
}
