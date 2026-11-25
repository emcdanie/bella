import React, { type ReactNode } from 'react';
import styles from './FilterChip.module.css';

export interface FilterChipProps {
  /** Chosen or not: BELLA's "selected" for a choice (renamed from `pressed`, 25 Nov 2026). Rendered as aria-pressed,
   *  so a screen reader hears a toggle; the light-blue fill and the bold label are its paint. */
  selected: boolean;
  onClick: () => void;
  /** Accessible name when the visible label isn't the right name. */
  ariaLabel?: string;
  /** `md` (default) or `sm`: tighter padding for a long wrapping row of filters; the 44px target stays at both
   *  (renamed from `default` / `compact`, 25 Nov 2026, BELLA's sm / md / lg). */
  size?: 'md' | 'sm';
  /** The chip cannot be used: the native `disabled` attribute, so it takes no click or focus; the grey word and the
   *  faint edge (25 Nov 2026). */
  disabled?: boolean;
  /** Extra classes on the chip. */
  className?: string;
  children?: ReactNode;
}

/**
 * The toggle for narrowing a set. Selected is a real state with real
 * semantics (aria-pressed), not a restyle.
 */
export default function FilterChip({
  selected,
  onClick,
  ariaLabel,
  size = 'md',
  disabled = false,
  className,
  children,
}: FilterChipProps) {
  return (
    <button
      type="button"
      className={[styles.chip, size === 'sm' ? styles.sm : '', className].filter(Boolean).join(' ')}
      aria-pressed={selected}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      data-bella-component="filter-chip"
      data-size={size}
    >
      {children}
    </button>
  );
}
