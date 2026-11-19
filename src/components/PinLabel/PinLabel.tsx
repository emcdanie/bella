import React, { type CSSProperties, type ReactNode } from 'react';
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
  /** kind="label": the Pin's tone (matches its Leader). */
  tone?: 'yellow' | 'pink' | 'blue' | 'red';
  /** kind="part" + "Show status": pass (a success check) or finding (an attention dot): they differ by shape, not only colour. */
  status?: 'pass' | 'finding';
  /** Figma "selected": a 2px ink edge, the part whose card is open. */
  selected?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * The label at the end of a Leader (Figma BellaComponents Pin label 629:1116,
 * read 20 Nov 2026): the Pin's number and the token or part name, or, as the
 * stage chip (kind="part"), a status and the part name.
 */
export default function PinLabel({ kind = 'label', children, number, tone = 'pink', status, selected = false, className, style }: PinLabelProps) {
  return (
    <span
      className={[styles.label, kind === 'part' ? styles.part : '', selected ? styles.selected : '', className].filter(Boolean).join(' ')}
      style={style}
      data-bella-component="pin-label"
    >
      {kind === 'label' && number != null ? <Pin number={number} variant={tone} pinStyle="solid" /> : null}
      {kind === 'part' && status ? (
        <StatusDot tone={status === 'pass' ? 'success' : 'attention'} mark={status === 'pass' ? 'check' : 'dot'} showLabel={false} />
      ) : null}
      <span className={styles.text}>{children}</span>
    </span>
  );
}
