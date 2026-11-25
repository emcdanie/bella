import React, { useId, type ReactNode } from 'react';
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
  /** The field cannot be changed: the native `disabled` attribute, so it takes no focus, clicks or keys; muted text on the subtle fill, as Input draws it (25 Nov 2026). */
  disabled?: boolean;
  /** Honest error: the danger edge, an error icon and the message under the field (role=alert), wired by aria-invalid and aria-describedby, as Input does it (25 Nov 2026). */
  error?: string;
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
  disabled = false,
  error,
  className,
}: SelectProps) {
  const base = useId();
  const labelId = `${base}-label`;
  const errorId = `${base}-error`;
  return (
    <label
      className={[styles.control, error ? styles.invalid : '', disabled ? styles.disabled : '', className]
        .filter(Boolean)
        .join(' ')}
      data-bella-component="select"
    >
      <span id={labelId}>{label}</span>
      <span className={styles.field} data-leading={leading != null ? '' : undefined}>
        {leading != null ? (
          <span className={styles.leading} aria-hidden="true">
            {leading}
          </span>
        ) : null}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-labelledby={labelId}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="NavArrowDown" size="md" className={styles.chevron} />
      </span>
      {error ? (
        <span id={errorId} role="alert" className={styles.error}>
          <Icon name="WarningCircle" size="sm" className={styles.errorIcon} />
          <span>{error}</span>
        </span>
      ) : null}
    </label>
  );
}
