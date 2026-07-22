import React, { useId, type ReactNode } from 'react';
import styles from './Input.module.css';

export interface InputProps {
  /** Visible label, always rendered. An unlabelled field is a guess. */
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  /** Renders a textarea instead of a single-line input. */
  multiline?: boolean;
  /** Honest error: sets aria-invalid, renders a role=alert message wired via aria-describedby. */
  error?: string;
  /** Supporting hint below the field, wired via aria-describedby. */
  hint?: string;
  /** Input type for the single-line control. */
  type?: 'text' | 'email' | 'url';
  placeholder?: string;
  /** Autofill hint, passed straight through (the shipped contact form sets these). */
  autoComplete?: string;
  /** Form field name, passed straight through. */
  name?: string;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  /** Extra classes on the field wrapper. */
  className?: string;
}

/**
 * Labelled, stateful, honest about errors. The form is the channel, so the
 * fields carry the trust.
 */
export default function Input({
  label,
  value,
  onChange,
  multiline,
  error,
  hint,
  type = 'text',
  placeholder,
  autoComplete,
  name,
  required,
  disabled,
  id,
  className,
}: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  const shared = {
    id: fieldId,
    className: styles.field,
    value,
    placeholder,
    autoComplete,
    name,
    required,
    disabled,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    onChange: (
      e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>
    ) => onChange(e.target.value),
  } as const;

  return (
    <div
      className={[styles.wrapper, error ? styles.invalid : '', className]
        .filter(Boolean)
        .join(' ')}
      data-bella-component="input"
    >
      <label className={styles.label} htmlFor={fieldId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {multiline ? <textarea {...shared} rows={5} /> : <input {...shared} type={type} />}
      {hint && !error ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
