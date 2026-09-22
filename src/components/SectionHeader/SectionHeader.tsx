import React, { isValidElement, type ReactNode } from 'react';
import Heading from '../Heading/Heading';
import Eyebrow from '../Eyebrow/Eyebrow';
import styles from './SectionHeader.module.css';

export interface SectionHeaderProps {
  /** Optional Mono eyebrow above the heading (e.g. "01 · Decisions"). */
  eyebrow?: ReactNode;
  /** The heading text. */
  heading: ReactNode;
  /** One accent segment after the heading (the iris word), e.g. a glossary term. */
  accent?: ReactNode;
  /** Text after the accent in the primary ink (e.g. a full stop). */
  after?: ReactNode;
  /**
   * The accent's spoken word, for when `accent` is interactive (a term
   * button pads the heading's name, "Bella ." for "Bella."). When set, the
   * heading is named heading + term + after, spelled out.
   */
  term?: string;
  /** Semantic level; `h1` renders the page tier (the page opening). */
  as?: 'h1' | 'h2';
  /**
   * `"split"`: heading beside the lead and body once the header's own
   * container is wide enough, stacked below that. `"stacked"`: heading above
   * the lead at every width (a page opening whose h1 needs the full width).
   */
  layout?: 'split' | 'stacked';
  /** The heading's id (a section's aria-labelledby points at it). */
  id?: string;
  /** The lead paragraph. */
  lead?: ReactNode;
  /** Body: paragraphs, a list, a link, a figure. */
  children?: ReactNode;
  /** Extra classes on the header. */
  className?: string;
}

function spokenName(heading: ReactNode, term?: string, after?: ReactNode): string | undefined {
  if (!term || typeof heading !== 'string') return undefined;
  if (after != null && typeof after !== 'string') return undefined;
  return `${heading} ${term}${after ?? ''}`;
}

/**
 * The section header, ported from the portfolio's layout copy (2026-09-21).
 * No site imports: the glossary lookup became the optional `term` prop.
 * Split is decided by the header's own width (a named container), not the
 * window, so the header behaves the same in any column it is placed in.
 */
export default function SectionHeader({
  eyebrow,
  heading,
  accent,
  after,
  term,
  as = 'h2',
  layout = 'split',
  id,
  lead,
  children,
  className,
}: SectionHeaderProps) {
  const cls = [styles.header, layout === 'stacked' ? styles.stacked : '', className]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={styles.container} data-bella-component="section-header">
      <div className={cls}>
        <div className={styles.titleBlock}>
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <Heading
          tier={as === 'h1' ? 'page' : 'section'}
          as={as}
          id={id}
          accent={accent}
          after={after}
          label={isValidElement(accent) ? spokenName(heading, term, after) : undefined}
        >
          {heading}
        </Heading>
        </div>
        {lead || children ? (
          <div className={styles.side}>
            {lead ? <p className={styles.lead}>{lead}</p> : null}
            {children ? <div className={styles.body}>{children}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
