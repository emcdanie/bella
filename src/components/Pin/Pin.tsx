import React, { type CSSProperties, type MouseEventHandler, type ReactNode } from 'react';
import styles from './Pin.module.css';

export interface PinProps {
  /** The number on the disc. Required: colour is never the only signal. */
  number: ReactNode;
  /** The pop colour of the ring. It groups pins; it never means a status. */
  variant?: 'yellow' | 'pink' | 'blue' | 'red';
  /** The word beside the number. Without one, say what the pin means nearby. */
  label?: ReactNode;
  /** Makes the pin a button with a 44px box. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Accessible name, for a clickable pin with no label. */
  ariaLabel?: string;
  /** Extra classes on the pin. */
  className?: string;
  style?: CSSProperties;
}

/**
 * A numbered marker that explains something in place, from the site's hero
 * pins (elleta.design). The number and word sit on the card disc, never on the
 * pop colour, because ink fails AA on the pop red.
 */
export default function Pin({
  number,
  variant = 'pink',
  label,
  onClick,
  ariaLabel,
  className,
  style,
}: PinProps) {
  const cls = [styles.pin, styles[variant], onClick ? styles.action : '', className]
    .filter(Boolean)
    .join(' ');
  const body = (
    <>
      <span className={styles.disc}>{number}</span>
      {label != null ? <span className={styles.label}>{label}</span> : null}
    </>
  );
  return onClick ? (
    <button
      type="button"
      className={cls}
      style={style}
      onClick={onClick}
      aria-label={ariaLabel}
      data-bella-component="pin"
    >
      {body}
    </button>
  ) : (
    <span className={cls} style={style} aria-label={ariaLabel} data-bella-component="pin">
      {body}
    </span>
  );
}
