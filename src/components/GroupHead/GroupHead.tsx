import React, { type CSSProperties, type ReactNode } from 'react';
import Tag from '../Tag/Tag';
import styles from './GroupHead.module.css';

export interface GroupHeadProps {
  /** Figma "Name". The group's name. */
  name: ReactNode;
  /** Figma "Show index" + the Index Tag label: the group's position ("1"). Missing = off. Only where the groups are a sequence a person moves through (guideline 11). */
  index?: ReactNode;
  /** The element: a heading level when the group head titles a region, else a div. */
  as?: 'h2' | 'h3' | 'h4' | 'div';
  className?: string;
  style?: CSSProperties;
}

/**
 * The name of a group in an order: an index Tag and the group's name, for
 * board lanes and System map stages. Not a card section title (SectionHead)
 * or a page heading (PageHeader, SectionHeader).
 */
export default function GroupHead({ name, index, as = 'div', className, style }: GroupHeadProps) {
  const El = as;
  return (
    <El className={[styles.head, className].filter(Boolean).join(' ')} style={style} data-bella-component="group-head">
      {index != null ? (
        <Tag variant="index" tone="count">
          {index}
        </Tag>
      ) : null}
      <span className={styles.name}>{name}</span>
    </El>
  );
}
