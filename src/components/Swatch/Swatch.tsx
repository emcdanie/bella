import React, { type CSSProperties, type ReactNode } from 'react';
import Button from '../Button/Button';
import styles from './Swatch.module.css';

export interface SwatchProps {
  /** The colour the block shows: a token as a CSS value, e.g. "var(--color-content-default)". */
  color: string;
  /** Figma "Name": the role's token name ("text-primary"). */
  name: ReactNode;
  /** Figma "Hex": the colour's hex. */
  hex: ReactNode;
  /** Figma "Ratio": its contrast pair ("AAA 16.1"). Ignored when `pair` is false. */
  ratio?: ReactNode;
  /** Figma "pair". false shows "No pair". */
  pair?: boolean;
  /** Figma "size". sm: a 64 block (Foundations grid); lg: a 96 block with the Copy button (the colour hover popover). */
  size?: 'sm' | 'lg';
  /** lg: copies the token name or value. The Copy button shows only when this is set. */
  onCopy?: () => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * One colour role as a Pantone-style chip (Figma BellaComponents Swatch
 * 794:169044; the colour chip card again on 22 Nov, while a table cell keeps
 * its plain square): the colour block on top, a label strip under it with
 * the name, the hex and the contrast pair, inside a light edge so a colour
 * close to the page still shows where it ends. Never text on the colour.
 */
export default function Swatch({ color, name, hex, ratio, pair = true, size = 'sm', onCopy, className, style }: SwatchProps) {
  const meta = (
    <span className={styles.meta} data-bella-meta>
      <span>{hex}</span>
      <span>{pair ? ratio : 'No pair'}</span>
    </span>
  );
  return (
    <div className={[styles.swatch, size === 'lg' ? styles.lg : '', className].filter(Boolean).join(' ')} style={style} data-bella-component="swatch">
      <span className={styles.colour} style={{ background: color }} aria-hidden="true" />
      <span className={styles.label}>
        <span className={styles.name}>{name}</span>
        {size === 'lg' && onCopy ? (
          <span className={styles.metaRow}>
            {meta}
            <Button variant="secondary" size="sm" iconOnly icon="Copy" ariaLabel="Copy" onClick={onCopy} />
          </span>
        ) : (
          meta
        )}
      </span>
    </div>
  );
}
