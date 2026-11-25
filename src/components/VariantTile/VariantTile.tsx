import React, { type CSSProperties, type MouseEventHandler, type ReactNode } from 'react';
import Icon from '../Icon/Icon';
import styles from './VariantTile.module.css';

export interface VariantTileProps {
  /** Figma "Label": the state or variant name under the preview. */
  label: ReactNode;
  /** Figma "Preview" (slot): the mini specimen, centred. */
  children?: ReactNode;
  /** Figma "selected": a 2px brand edge on the preview, the label in 600 and default ink. */
  selected?: boolean;
  /** Figma "Show check badge": a success badge with a check, for a copied or done state. */
  checked?: boolean;
  /** Makes the tile a button that picks this state; selected is then announced as pressed. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
  style?: CSSProperties;
}

/**
 * A variant thumbnail (Figma VariantTile, read 20 Nov 2026 from her CHIP
 * Components design): a mini preview with its label under. A row of them is
 * the "states" strip under the stage (Default, Hover, Pressed, Focus, Disabled).
 */
export default function VariantTile({ label, children, selected = false, checked = false, onClick, className, style }: VariantTileProps) {
  const cls = [styles.tile, selected ? styles.selected : '', onClick ? styles.action : '', className].filter(Boolean).join(' ');
  const body = (
    <>
      <span className={styles.preview} aria-hidden={onClick ? true : undefined}>
        {/* a picture of the state, not a control: nothing inside takes focus or clicks */}
        <span className={styles.specimen} inert>
          {children}
        </span>
        {checked ? (
          <span className={styles.badge} role="img" aria-label="Done">
            <Icon name="Check" size="sm" />
          </span>
        ) : null}
      </span>
      <span className={styles.label}>{label}</span>
    </>
  );
  return onClick ? (
    <button type="button" className={cls} style={style} onClick={onClick} aria-pressed={selected} data-bella-component="variant-tile">
      {body}
    </button>
  ) : (
    <div className={cls} style={style} data-bella-component="variant-tile">
      {body}
    </div>
  );
}
