import React, { useEffect, useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import styles from './Menu.module.css';

/* ---------------------------------------------------------------------------
 * Menu item and Menu divider: their own Figma parts (1014:84, 1014:87),
 * exported from here because they live only inside a Menu.
 * ------------------------------------------------------------------------- */

export interface MenuItemProps {
  /** Figma "Label". */
  label: ReactNode;
  /** Figma "Show icon" + "icon" (instance swap). Missing = off. */
  icon?: IconName;
  /** Figma "tone". danger: the label in the error ink, error wash on hover and press. Always after a divider, last. */
  tone?: 'default' | 'danger';
  /** What the item does. The menu closes after (the Menu's onClose). */
  onSelect?: () => void;
  className?: string;
}

/** One action in a Menu. role=menuitem; focus is a ring inside the item. */
export function MenuItem({ label, icon, tone = 'default', onSelect, className }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={[styles.item, tone === 'danger' ? styles.danger : '', className].filter(Boolean).join(' ')}
      onClick={onSelect}
      data-bella-component="menu-item"
    >
      {icon ? <Icon name={icon} size="md" className={styles.icon} /> : null}
      <span className={styles.label}>{label}</span>
    </button>
  );
}

/** Splits a Menu into groups; always sits before the danger item. */
export function MenuDivider() {
  return <div role="separator" className={styles.divider} data-bella-component="menu-divider" />;
}

/* ---------------------------------------------------------------------------
 * Menu
 * ------------------------------------------------------------------------- */

export interface MenuProps {
  /** Names the menu for assistive tech ("Actions for Figma check"). */
  label: string;
  /** Figma "Items" (slot): MenuItem and MenuDivider. About seven items at most. */
  children: ReactNode;
  /** Called on Esc, Tab, or after an item is chosen. Give focus back to the "…" button that opened it. */
  onClose?: () => void;
  /** Move focus to the first item when the menu mounts (default true: it opened from a button). */
  autoFocus?: boolean;
  className?: string;
  style?: CSSProperties;
}

const items = (root: HTMLElement | null) =>
  root ? Array.from(root.querySelectorAll<HTMLElement>('[role="menuitem"]')) : [];

/**
 * A short list of actions that opens from a "…" button: the actions on one
 * thing. Not navigation (NavList), not choosing a value (Select). Arrow
 * keys move between items, Home and End jump, Enter or Space acts, Esc
 * closes. The opener positions it and takes focus back on close.
 */
export default function Menu({ label, children, onClose, autoFocus = true, className, style }: MenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoFocus) items(ref.current)[0]?.focus();
  }, [autoFocus]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const list = items(ref.current);
    const i = list.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      list[(n + list.length) % list.length]?.focus();
    };
    if (e.key === 'ArrowDown') go(i + 1);
    else if (e.key === 'ArrowUp') go(i < 0 ? list.length - 1 : i - 1);
    else if (e.key === 'Home') go(0);
    else if (e.key === 'End') go(list.length - 1);
    else if (e.key === 'Escape') {
      e.preventDefault();
      onClose?.();
    } else if (e.key === 'Tab') onClose?.();
  }

  return (
    <div
      ref={ref}
      role="menu"
      aria-label={label}
      className={[styles.menu, className].filter(Boolean).join(' ')}
      style={style}
      onKeyDown={onKeyDown}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[role="menuitem"]')) onClose?.();
      }}
      data-bella-component="menu"
    >
      {children}
    </div>
  );
}
