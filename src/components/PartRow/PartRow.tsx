import React, { type CSSProperties, type MouseEventHandler, type ReactNode } from 'react';
import Pin from '../Pin/Pin';
import styles from './PartRow.module.css';

export interface PartRowProps {
  /** The Pin's number; the same number sits on the part in the render. */
  number: ReactNode;
  /** The Pin's tone (Figma: blue). */
  tone?: 'yellow' | 'pink' | 'blue' | 'red' | 'green';
  /** Figma "Title": the part's name. */
  title: ReactNode;
  /** Figma "Description": what the part does. */
  description?: ReactNode;
  /** Figma "Detail" (Show detail): its tokens. */
  detail?: ReactNode;
  /** Lit: this part is hovered or focused, here or on the specimen (its pin or chip). Light blue, the pin pops. */
  active?: boolean;
  /** Hover or focus on the row starts (true) or ends (false): light its pin on the specimen. */
  onActiveChange?: (active: boolean) => void;
  /** Makes the row a button that picks the part; selected becomes aria-pressed. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** The part whose card is open. */
  selected?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * One numbered part in an anatomy list: pin, part name, what it does, and
 * its tokens (Figma BellaComponents Part row 841:124467, read 20 Nov 2026).
 * A caption beside a render whose parts carry the same numbered Pins. With
 * onActiveChange it lights its match on the specimen and back (anatomy hover).
 */
export default function PartRow({ number, tone = 'blue', title, description, detail, active = false, onActiveChange, onClick, selected = false, className, style }: PartRowProps) {
  const cls = [styles.row, onActiveChange || onClick ? styles.live : '', active ? styles.active : '', selected ? styles.selected : '', onClick ? styles.action : '', className]
    .filter(Boolean)
    .join(' ');
  const hover = onActiveChange
    ? {
        onPointerEnter: () => onActiveChange(true),
        onPointerLeave: () => onActiveChange(false),
        onFocus: () => onActiveChange(true),
        onBlur: () => onActiveChange(false),
      }
    : {};
  const body = (
    <>
      <Pin number={number} variant={tone} pinStyle="solid" active={active} />
      <span className={styles.text}>
        <span className={styles.title}>{title}</span>
        {description != null ? <span className={styles.line}>{description}</span> : null}
        {detail != null ? <span className={styles.line}>{detail}</span> : null}
      </span>
    </>
  );
  return onClick ? (
    <button type="button" className={cls} style={style} onClick={onClick} aria-pressed={selected} data-bella-component="part-row" data-active={active || undefined} {...hover}>
      {body}
    </button>
  ) : (
    <div className={cls} style={style} data-bella-component="part-row" data-active={active || undefined} {...hover}>
      {body}
    </div>
  );
}
