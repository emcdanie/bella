import React from 'react';
import styles from './Select.module.css';

export interface SelectProps {
  /** Visible label, always rendered; the control is labelled by containment. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** Extra classes on the control. */
  className?: string;
}

/**
 * For long lists only. If the options fit on screen, chips or a segmented
 * control do it better.
 */
export default function Select({
  label,
  value,
  onChange,
  options,
  className,
}: SelectProps) {
  return (
    <label
      className={[styles.control, className].filter(Boolean).join(' ')}
      data-bella-component="select"
    >
      <span>{label}</span>
      <span className={styles.field}>
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className={styles.chevron} aria-hidden="true" />
      </span>
    </label>
  );
}
