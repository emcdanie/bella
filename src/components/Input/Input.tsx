import React, { useId, type ReactNode } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import Button from '../Button/Button';
import styles from './Input.module.css';

export interface InputProps {
  /** Visible label, always rendered. An unlabelled field is a guess. */
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  /** Renders a textarea instead of a single-line input. */
  multiline?: boolean;
  /** Honest error: danger border, an error icon and a danger message (role=alert), wired via aria-invalid and aria-describedby. */
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
  /** Figma "Leading icon" (+ the icon swap): a 20 icon at the start of the field, subtle ink. Missing = off. */
  leadingIcon?: IconName;
  /** Figma "Send button": the small primary icon-only Button (32 plate, 44 hit area) inside the field at its end. Missing = off. Enter in a single-line field sends too. */
  onSend?: () => void;
  /** The Send button's name (and its tooltip words). */
  sendLabel?: string;
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
  leadingIcon,
  onSend,
  sendLabel = 'Send',
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
      {leadingIcon || onSend ? (
        /* Figma Field with zones: Leading icon, Value, Send button, 8 apart.
           The box carries the edge, corner and focus ring; the native control
           inside is bare. Without these props the field renders as before. */
        <div className={[styles.box, disabled ? styles.boxDisabled : ''].filter(Boolean).join(' ')}>
          {leadingIcon ? <Icon name={leadingIcon} size="md" className={styles.leading} /> : null}
          {multiline ? (
            <textarea {...shared} className={styles.bare} rows={5} />
          ) : (
            <input
              {...shared}
              className={styles.bare}
              type={type}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && onSend) {
                  e.preventDefault();
                  onSend();
                }
              }}
            />
          )}
          {onSend ? (
            <Button variant="primary" size="sm" iconOnly icon="SendDiagonal" ariaLabel={sendLabel} onClick={onSend} disabled={disabled} />
          ) : null}
        </div>
      ) : multiline ? (
        <textarea {...shared} rows={5} />
      ) : (
        <input {...shared} type={type} />
      )}
      {hint && !error ? (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className={styles.error}>
          <Icon name="WarningCircle" size="sm" className={styles.errorIcon} />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
