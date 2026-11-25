import React, { type CSSProperties, type MouseEventHandler, type ReactNode } from 'react';
import styles from './Pin.module.css';

export interface PinProps {
  /** The number on the disc. Missing = Figma label=false: a 28 disc with a 10 dot in the
   * tone's status colour (her "On the stage" pins). Then say what it marks nearby or in ariaLabel. */
  number?: ReactNode;
  /** The pop colour of the ring. It groups pins; it never means a status. */
  variant?: 'yellow' | 'pink' | 'blue' | 'red' | 'green';
  /** Figma "style". dot (default): the card disc with a pop-colour ring. solid: the disc filled in the tone with an ink number and a 2px surface edge (anatomy pins, the Tour step). comment: a comment's pin as Figma draws it (Elleta, 23 Nov 2026: "I want my comments to look like the Figma ones"): the author's initials on a pink teardrop (pink is for annotations) whose point (bottom left) marks the spot, with a white edge and the card's shadow; pass the initials as `number`. */
  pinStyle?: 'dot' | 'solid' | 'comment';
  /** The word beside the number. Without one, say what the pin means nearby. */
  label?: ReactNode;
  /** Makes the pin a button with a 44px box. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Lit: its match is hovered or focused elsewhere (the anatomy list, the stage chip). The pin pops. */
  active?: boolean;
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
  pinStyle = 'dot',
  label,
  onClick,
  active = false,
  ariaLabel,
  className,
  style,
}: PinProps) {
  const bare = number == null;
  const cls = [styles.pin, styles[variant], pinStyle === 'solid' ? styles.solid : pinStyle === 'comment' ? styles.comment : '', bare ? styles.bare : '', onClick ? styles.action : '', active ? styles.active : '', className]
    .filter(Boolean)
    .join(' ');
  const body = (
    <>
      <span className={styles.disc}>{bare ? <span className={styles.dot} /> : number}</span>
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
    <span className={cls} style={style} role={ariaLabel ? 'img' : undefined} aria-label={ariaLabel} data-bella-component="pin">
      {body}
    </span>
  );
}
