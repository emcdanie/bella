import React, { useId, useState, type ReactNode } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import Button from '../Button/Button';
import Kbd from '../Kbd/Kbd';
import styles from './Input.module.css';

export interface InputProps {
  /** Visible label, always rendered. An unlabelled field is a guess. */
  label: ReactNode;
  value: string;
  onChange: (value: string) => void;
  /** Renders a textarea instead of a single-line input. */
  multiline?: boolean;
  /** Figma "labelPosition" (21 Nov publish). top (default): label above the field. inline: one line, the label 8 to the field's left and the hint or error 8 to its right, all centred on the 44 field; single-line fields only (multiline keeps the label on top). */
  labelPosition?: 'top' | 'inline';
  /** Honest error: danger border, an error icon and a danger message (role=alert), wired via aria-invalid and aria-describedby. */
  error?: string;
  /** Supporting hint below the field, wired via aria-describedby. */
  hint?: string;
  /** Input type for the single-line control. password (23 Nov): masked, with a Show / Hide button at the end of the field; autocomplete off, spellcheck, autocorrect and capitals off, and the value lives only in the field itself (no title, no aria text, no other attribute). Hides again whenever the field is cleared or disabled. */
  type?: 'text' | 'email' | 'url' | 'password';
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
  /** Figma "Menu" (Input 149:107): a control at the start of the field, such as the model picker (a Menu
   * trigger Button). A 1×24 border/strong divider follows it, before the text. Missing = off. */
  menu?: ReactNode;
  /** Figma "Send button": the small primary icon-only Button (32 plate, 44 hit area) inside the field at its end. Missing = off. Enter in a single-line field sends too. Called with the text sent: the value, or the suggestion when Enter accepts it. */
  onSend?: (text: string) => void;
  /** Figma state=suggestion (Input 1608:3716): the likely next question as ghost text in the empty field, with a one-cap "↵" Kbd before Send. Enter sends it; typing replaces it and the keycap goes. Single-line with onSend only; it stands in for the placeholder. */
  suggestion?: string;
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
  labelPosition = 'top',
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
  menu,
  suggestion,
  className,
}: InputProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  const suggestId = `${fieldId}-suggest`;
  const isPassword = type === 'password' && !multiline;
  const [revealed, setRevealed] = useState(false);
  const shownAsText = isPassword && revealed && !disabled && value !== '';
  // A suggestion shows only in an empty single-line field that can send.
  const suggesting = Boolean(suggestion && !value && onSend && !multiline && !disabled);
  const describedBy =
    [error ? errorId : null, hint ? hintId : null, suggesting ? suggestId : null].filter(Boolean).join(' ') ||
    undefined;

  const shared = {
    id: fieldId,
    className: styles.field,
    value,
    placeholder: suggesting ? undefined : placeholder,
    'aria-placeholder': suggesting ? suggestion : undefined,
    autoComplete: autoComplete ?? (isPassword ? 'off' : undefined),
    spellCheck: isPassword ? false : undefined,
    autoCapitalize: isPassword ? 'off' : undefined,
    autoCorrect: isPassword ? 'off' : undefined,
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
      className={[styles.wrapper, labelPosition === 'inline' && !multiline ? styles.inline : '', error ? styles.invalid : '', className]
        .filter(Boolean)
        .join(' ')}
      data-bella-component="input"
    >
      <label className={styles.label} htmlFor={fieldId}>
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      {leadingIcon || onSend || menu || isPassword ? (
        /* Figma Field with zones: Leading icon, Value, Send button, 8 apart.
           The box carries the edge, corner and focus ring; the native control
           inside is bare. Without these props the field renders as before. */
        <div className={[styles.box, menu ? styles.boxMenu : '', disabled ? styles.boxDisabled : ''].filter(Boolean).join(' ')}>
          {menu ? (
            <>
              <span className={styles.menu}>{menu}</span>
              <span className={styles.divider} aria-hidden="true" />
            </>
          ) : null}
          {leadingIcon ? <Icon name={leadingIcon} size="md" className={styles.leading} /> : null}
          {multiline ? (
            <textarea {...shared} className={styles.bare} rows={5} />
          ) : (
            <span className={styles.slot}>
              <input
                {...shared}
                className={styles.bare}
                type={isPassword ? (shownAsText ? 'text' : 'password') : type}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onSend) {
                    e.preventDefault();
                    onSend(suggesting ? (suggestion as string) : value);
                  }
                }}
              />
              {/* The ghost text is drawn over the empty field so a long suggestion ends in an
                  ellipsis (a native placeholder cannot); the field carries it as aria-placeholder. */}
              {suggesting ? (
                <span className={styles.ghost} aria-hidden="true">
                  {suggestion}
                </span>
              ) : null}
            </span>
          )}
          {suggesting ? (
            <>
              {/* The keycap marks the ghost text as a suggestion, not a placeholder (aria-hidden; the hint says it). */}
              <span className={styles.enterHint} aria-hidden="true">
                <Kbd keys={['↵']} />
              </span>
              <span id={suggestId} className={styles.srOnly}>
                Press Enter to ask
              </span>
            </>
          ) : null}
          {isPassword ? (
            <Button
              variant="tertiary"
              size="sm"
              ariaPressed={shownAsText}
              ariaLabel={shownAsText ? 'Hide the password' : 'Show the password'}
              onClick={() => setRevealed(!shownAsText)}
              disabled={disabled || value === ''}
            >
              {shownAsText ? 'Hide' : 'Show'}
            </Button>
          ) : null}
          {onSend ? (
            <Button
              variant="primary"
              size="sm"
              iconOnly
              icon="SendDiagonal"
              ariaLabel={sendLabel}
              onClick={() => onSend(suggesting ? (suggestion as string) : value)}
              disabled={disabled}
            />
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
