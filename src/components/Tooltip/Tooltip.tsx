import React, { cloneElement, useEffect, useId, useState, type ReactElement, type ReactNode } from 'react';
import styles from './Tooltip.module.css';

export interface TooltipProps {
  /** What the bubble says. Give the trigger the same words as its accessible name. For `kind="rich"` this is the card's title. */
  label: string;
  /** The trigger: an icon button carrying aria-label. */
  children: ReactElement<{ 'aria-describedby'?: string }>;
  /** Where the bubble sits. */
  placement?: 'top' | 'bottom';
  /**
   * `"plain"` names an icon button (visual only). `"rich"` is a small hover
   * card (BellaComponents, 11 Nov 2026): the label as a title plus `rows`,
   * read to assistive tech as the trigger's description.
   */
  kind?: 'plain' | 'rich';
  /** For `kind="rich"`: the short lines under the title ("Doing: quiet since 14 Oct"). */
  rows?: ReactNode[];
  /** Extra classes on the wrapper. */
  className?: string;
}

/**
 * A short label that shows on hover and on keyboard focus, for an icon
 * button. The trigger's own aria-label is its name, so the plain bubble is
 * visual only; a rich card describes the trigger (aria-describedby). It stays
 * while the pointer is over it, and Esc hides it (WCAG 1.4.13).
 */
export default function Tooltip({ label, children, placement = 'bottom', kind = 'plain', rows, className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const rich = kind === 'rich';
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
      {rich ? cloneElement(children, { 'aria-describedby': id }) : children}
      {rich ? (
        <span id={id} className={[styles.tip, styles.rich, styles[placement]].join(' ')} hidden={!open}>
          {/* the spaces between the lines keep the description's words apart for assistive tech */}
          <span className={styles.title}>{label}</span>
          {rows?.map((row, i) => (
            <React.Fragment key={i}>
              {' '}
              <span>{row}</span>
            </React.Fragment>
          ))}
        </span>
      ) : (
        <span id={id} className={[styles.tip, styles[placement]].join(' ')} hidden={!open} aria-hidden="true">
          {label}
        </span>
      )}
    </span>
  );
}
