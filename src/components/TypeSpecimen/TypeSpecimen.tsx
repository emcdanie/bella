import React, { type CSSProperties, type ReactNode } from 'react';
import styles from './TypeSpecimen.module.css';

export type TypeSpecimenSize = 'display-page' | 'display-section' | 'subsection' | 'xl' | 'base' | 'sm' | 'tag' | 'mono';

export interface TypeSpecimenProps {
  /** Figma "size": the step of the type ramp, set in its own token. */
  size: TypeSpecimenSize;
  /** Figma "Name": the words set in the step (usually the step's name). Defaults to the size. */
  name?: ReactNode;
  /** Figma "Size": the size in words ("44 to 60px", "20px"). */
  sizeLabel: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * One step of the type ramp, set in its own token, with its size beside it
 * (Figma BellaComponents "Type specimen" 796:8332, read 19 Nov 2026). Use: the
 * type ramp on CHIP Foundations. Not for headings on a page (Heading).
 */
export default function TypeSpecimen({ size, name, sizeLabel, className, style }: TypeSpecimenProps) {
  return (
    <div className={[styles.row, className].filter(Boolean).join(' ')} style={style} data-bella-component="type-specimen">
      <span className={[styles.specimen, styles[size.replace('-', '_') as keyof typeof styles]].join(' ')}>{name ?? size}</span>
      <span className={styles.size}>{sizeLabel}</span>
    </div>
  );
}
