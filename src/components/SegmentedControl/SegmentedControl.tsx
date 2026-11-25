import React, { type ReactNode } from 'react';
import styles from './SegmentedControl.module.css';

export interface SegmentedControlProps {
  /**
   * The visible options; a segmented control shows ALL of them. `icon` is
   * a leading decorative slot (rendered aria-hidden, sized by the icon
   * tokens); the text label always stays and carries the semantics. `ariaLabel` names a segment whose visible
   * label is a letter (D, W, M, Y).
   */
  options: { value: string; label: string; icon?: ReactNode; ariaLabel?: string }[];
  /** The selected value; selection lives in aria-current, not just paint. */
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the group. Required: a view switcher without a name is a mystery list. */
  label: string;
  /**
   * Figma: the instance drawn at the card's width, its segments sharing it equally (Gate runs' range:
   * D, W, M, Y; Figma "Show segment 4" is a fourth option in `options`, nothing more). Off = the group hugs its labels.
   */
  stretch?: boolean;
  /** Extra classes on the group. */
  className?: string;
}

/**
 * Pick one view among a few, all options visible. The selected state lives
 * in ARIA, not just paint.
 */
/* every number in Geist Mono (her font rule): a label made only of digits, with % or px */
const NUMERIC = /^\d[\d.,]*\s*(%|px)?$/;

export default function SegmentedControl({
  options,
  value,
  onChange,
  label,
  stretch = false,
  className,
}: SegmentedControlProps) {
  return (
    <ul
      className={[styles.control, stretch ? styles.stretch : '', className].filter(Boolean).join(' ')}
      aria-label={label}
      data-bella-component="segmented-control"
    >
      {options.map((o) => (
        <li key={o.value}>
          <button
            type="button"
            aria-current={value === o.value ? 'true' : undefined}
            aria-label={o.ariaLabel}
            onClick={() => onChange(o.value)}
            /* a label that is a number ("375", "1440", "100%") takes the number face */
            data-numeric={NUMERIC.test(o.label) ? '' : undefined}
          >
            {o.icon != null ? (
              <span className={styles.icon} aria-hidden="true">
                {o.icon}
              </span>
            ) : null}
            {o.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
