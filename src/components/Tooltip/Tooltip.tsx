import React, { useEffect, useId, useState, type ReactElement } from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  /** What the bubble says. Give the trigger the same words as its accessible name. */
  label: string;
  /** The trigger: an icon button carrying aria-label. */
  children: ReactElement;
  /** Where the bubble sits. */
  placement?: 'top' | 'bottom';
  /** Extra classes on the wrapper. */
  className?: string;
}

/**
 * A short label that shows on hover and on keyboard focus, for an icon
 * button. The trigger's own aria-label is its name, so the bubble is visual
 * only. It stays while the pointer is over it, and Esc hides it (WCAG 1.4.13).
 */
export default function Tooltip({ label, children, placement = 'bottom', className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  useEffect(() => {
    if (!open) return undefined;
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', esc);
    return () => document.removeEventListener('keydown', esc);
  }, [open]);
  return (
    <span
      className={[styles.wrap, className].filter(Boolean).join(' ')}
      data-bella-component="tooltip"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <span id={id} className={[styles.tip, styles[placement]].join(' ')} hidden={!open} aria-hidden="true">
        {label}
      </span>
    </span>
  );
}
