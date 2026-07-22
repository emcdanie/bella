import React, { type ReactNode } from 'react';
import styles from './SegmentedControl.module.css';

export interface SegmentedControlProps {
  /**
   * The visible options; a segmented control shows ALL of them. `icon` is
   * a leading decorative slot (rendered aria-hidden, sized by the icon
   * tokens); the text label always stays and carries the semantics.
   */
  options: { value: string; label: string; icon?: ReactNode }[];
  /** The selected value; selection lives in aria-current, not just paint. */
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the group. Required: a view switcher without a name is a mystery list. */
  label: string;
  /** Extra classes on the group. */
  className?: string;
}

/**
 * Pick one view among a few, all options visible. The selected state lives
 * in ARIA, not just paint.
 */
export default function SegmentedControl({
  options,
  value,
  onChange,
  label,
  className,
}: SegmentedControlProps) {
  return (
    <ul
      className={[styles.control, className].filter(Boolean).join(' ')}
      aria-label={label}
      data-bella-component="segmented-control"
    >
      {options.map((o) => (
        <li key={o.value}>
          <button
            type="button"
            aria-current={value === o.value ? 'true' : undefined}
            onClick={() => onChange(o.value)}
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
