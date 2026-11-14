import React, { type ReactNode } from 'react';
import styles from './Select.module.css';
import Icon from '../Icon/Icon';

export interface SelectProps {
  /** Visible label, always rendered; the control is labelled by containment. */
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  /** An Icon or a small logo at the start of the field (BellaComponents, 11 Nov 2026). Decorative: the option text names the choice. */
  leading?: ReactNode;
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
  leading,
  className,
}: SelectProps) {
  return (
    <label
      className={[styles.control, className].filter(Boolean).join(' ')}
      data-bella-component="select"
    >
      <span>{label}</span>
      <span className={styles.field} data-leading={leading != null ? '' : undefined}>
        {leading != null ? (
          <span className={styles.leading} aria-hidden="true">
            {leading}
          </span>
        ) : null}
        <select value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="NavArrowDown" size="sm" className={styles.chevron} />
      </span>
    </label>
  );
}
