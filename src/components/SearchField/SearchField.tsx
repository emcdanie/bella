import React, { useEffect, useRef, type ChangeEvent, type CSSProperties } from 'react';
import Icon from '../Icon/Icon';
import Kbd from '../Kbd/Kbd';
import styles from './SearchField.module.css';

export interface SearchFieldProps {
  /** Figma "Placeholder". */
  placeholder?: string;
  /** Figma "Show shortcut". The ⌘K legend at the right; ⌘K (or Ctrl K) then focuses the field. */
  showShortcut?: boolean;
  /** Accessible name. Defaults to the placeholder. */
  label?: string;
  /**
   * Fill the row it sits in, past Figma's 420 (CHIP, 26 Nov 2026): a menu's Find row runs edge to edge with the menu
   * rows under it, the field growing and its button last at the right edge. Off: up to 420, as the top bar.
   */
  fill?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Called with the query when Enter is pressed. */
  onSubmit?: (value: string) => void;
  /** Extra classes on the field. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The app search in the top bar (Figma "Search field", read 19 Nov 2026).
 * Not a form Input: no label row, no border. The whole field is the target
 * (it is a label, so a click anywhere focuses the input).
 */
export default function SearchField({
  placeholder = 'Search',
  showShortcut = true,
  label,
  fill = false,
  value,
  defaultValue,
  onChange,
  onSubmit,
  className,
  style,
}: SearchFieldProps) {
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!showShortcut) return undefined;
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
      }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [showShortcut]);
  return (
    <label className={[styles.field, fill && styles.fill, className].filter(Boolean).join(' ')} style={style} data-bella-component="search-field">
      <Icon name="Search" size="md" className={styles.icon} />
      <input
        ref={input}
        type="search"
        className={styles.input}
        placeholder={placeholder}
        aria-label={label ?? placeholder}
        aria-keyshortcuts={showShortcut ? 'Meta+K Control+K' : undefined}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange ? (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value) : undefined}
        onKeyDown={onSubmit ? (e) => e.key === 'Enter' && onSubmit(e.currentTarget.value) : undefined}
      />
      {showShortcut ? <Kbd keys={['⌘', 'K']} label="Command K" /> : null}
    </label>
  );
}
