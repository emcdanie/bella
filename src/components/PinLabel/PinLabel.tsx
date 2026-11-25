import React, { type CSSProperties, type MouseEventHandler, type ReactNode } from 'react';
import Pin from '../Pin/Pin';
import StatusDot from '../StatusDot/StatusDot';
import styles from './PinLabel.module.css';

export interface PinLabelProps {
  /** Figma "kind". label: the Pin's number and a token or part name (mono). part: the stage chip, a status and the part name. */
  kind?: 'label' | 'part';
  /** Figma "Label": the token or part name. */
  children: ReactNode;
  /** kind="label": the Pin's number. */
  number?: ReactNode;
  /** Figma "Show pin" (kind="label"). Off: the name alone, as the stage's name chips. */
  showPin?: boolean;
  /** kind="label": the Pin's tone (matches its Leader). */
  tone?: 'yellow' | 'pink' | 'blue' | 'red';
  /** kind="part" + "Show status": pass (a success check) or finding (an attention dot): they differ by shape, not only colour. */
  status?: 'pass' | 'finding';
  /** Figma "selected": a 2px ink edge, the part whose card is open. */
  selected?: boolean;
  /** Lit: hovered or focused, here or on its match (the anatomy list). Light blue, its pin pops. */
  active?: boolean;
  /** Makes the chip a button (44 tall hit area) that opens its part; selected becomes aria-pressed. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Hover or focus on the chip starts (true) or ends (false): light its match. */
  onActiveChange?: (active: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * The label at the end of a Leader (Figma BellaComponents Pin label 629:1116,
 * read 20 Nov 2026): the Pin's number and the token or part name, or, as the
 * stage chip (kind="part"), a status and the part name.
 */
export default function PinLabel({
  kind = 'label',
  children,
  number,
  showPin = true,
  tone = 'pink',
  status,
  selected = false,
  active = false,
  onClick,
  onActiveChange,
  className,
  style,
}: PinLabelProps) {
  const cls = [styles.label, kind === 'part' ? styles.part : '', selected ? styles.selected : '', active ? styles.active : '', onClick ? styles.action : '', className]
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
      {kind === 'label' && showPin && number != null ? <Pin number={number} tone={tone} variant="solid" active={active} /> : null}
      {kind === 'part' && status ? (
        <StatusDot tone={status === 'pass' ? 'success' : 'attention'} mark={status === 'pass' ? 'check' : 'dot'} showLabel={false} />
      ) : null}
      <span className={styles.text}>{children}</span>
    </>
  );
  return onClick ? (
    <button type="button" className={cls} style={style} onClick={onClick} aria-pressed={selected} data-bella-component="pin-label" data-active={active || undefined} {...hover}>
      {body}
    </button>
  ) : (
    <span className={cls} style={style} data-bella-component="pin-label" data-active={active || undefined} {...hover}>
      {body}
    </span>
  );
}
