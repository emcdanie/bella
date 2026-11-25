import React, { type CSSProperties, type ReactNode } from 'react';
import IconWell, { type IconWellKind, type IconWellTone } from '../IconWell/IconWell';
import TextStack from '../TextStack/TextStack';
import { type IconName } from '../Icon/Icon';
import styles from './SectionHead.module.css';

export interface SectionHeadProps {
  /** Figma "Title". The section's name, top left inside its card. */
  title: ReactNode;
  /** Figma "Number". The count in the info, bold in the number face. */
  number?: ReactNode;
  /** Figma "Words". What the number counts, in subtext ("waiting on you"). */
  words?: ReactNode;
  /** Figma "Show number". Defaults to on when `number` is set. */
  showNumber?: boolean;
  /** Figma "Show info". The number and words on the right of the title line. Defaults to on when either is set. */
  showInfo?: boolean;
  /** Figma "Description". One line under the title, in subtext. */
  description?: ReactNode;
  /** Figma "Show description". Defaults to on when `description` is set. */
  showDescription?: boolean;
  /** Figma "Show icon" + the exposed Icon well's icon. Missing = no icon well. */
  icon?: IconName;
  /** The exposed Icon well's tone: the status the section means (success, warning, info, neutral, error). Warning for
   *  sections that wait on you. Status only since 25 Nov 2026; the History topics moved to `iconKind`. */
  iconTone?: IconWellTone;
  /** The exposed Icon well's kind, for a section about one kind of change (fix, visual, tokens, tooling, docs,
   *  contract, decision). Wins over `iconTone` when set (25 Nov 2026). */
  iconKind?: IconWellKind;
  /** Figma "Show action". A Button secondary sm at the right end. Missing = off. */
  action?: ReactNode;
  /** The title's heading level (role heading + aria-level, since it sits in TextStack's inline title). Defaults to 2; 0 = plain text. */
  titleLevel?: 0 | 2 | 3 | 4;
  /** The title size. "section" (default): 20. "card": 16 on a 24 line, the Stat card title, for a head inside a card in a row of Stat cards. Her pick, 19 Nov: "A · card size". */
  size?: 'section' | 'card';
  /** Extra classes on the row. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The first row inside a section card: icon well, title with its count on
 * the right of the same line (number bold, no count circle), one line of
 * description under it, and an optional action at the right end. Not a page
 * opening (PageHeader) or an editorial header (SectionHeader).
 */
export default function SectionHead({
  title,
  number,
  words,
  showNumber,
  showInfo,
  description,
  showDescription,
  icon,
  iconTone = 'warning',
  iconKind,
  action,
  titleLevel = 2,
  size = 'section',
  className,
  style,
}: SectionHeadProps) {
  const numberOn = (showNumber ?? number != null) && number != null;
  const infoOn = (showInfo ?? (number != null || words != null)) && (numberOn || words != null);
  const descriptionOn = (showDescription ?? description != null) && description != null;
  return (
    <div className={[styles.root, size === 'card' ? styles.card : '', className].filter(Boolean).join(' ')} style={style} data-bella-component="section-head">
      {icon ? <IconWell icon={icon} tone={iconTone} kind={iconKind} /> : null}
      <TextStack
        className={[styles.column, descriptionOn ? '' : styles.titleOnly].filter(Boolean).join(' ')}
        title={
          <span className={styles.titleRow}>
            <span className={styles.title} role={titleLevel ? 'heading' : undefined} aria-level={titleLevel || undefined}>
              {title}
            </span>
            {infoOn ? (
              <span className={styles.info}>
                {numberOn ? <span className={styles.number}>{number}</span> : null}
                {words != null ? <span className={styles.words}>{words}</span> : null}
              </span>
            ) : null}
          </span>
        }
        subtitle={descriptionOn ? <span className={styles.description}>{description}</span> : undefined}
      />
      {action != null ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
