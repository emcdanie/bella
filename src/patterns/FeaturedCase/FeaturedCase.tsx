import React, { type ElementType, type ReactNode } from 'react';
import Card from '../../components/Card/Card';
import Tag from '../../components/Tag/Tag';
import Icon from '../../components/Icon/Icon';
import styles from './FeaturedCase.module.css';

export interface FeaturedCaseProps {
  /** Eyebrow line: discipline and years. */
  kicker: string;
  /** The case name; also the start of the card's accessible name. */
  title: string;
  /** One impact line. */
  impact: string;
  /** Skill tags; the first four render. */
  tags?: string[];
  /** The case route. The whole card is ONE link. */
  href: string;
  /**
   * The cover slot: an `<img>` (natural width at least 2x rendered), a live
   * specimen in a ScaledFrame, or nothing (the placeholder shows the title).
   */
  cover?: ReactNode;
  /** The visible call to action at the foot of the body. */
  cta?: string;
  /**
   * `"auto"`: cover left (about 60%) beside the body once the card's own
   * container is wide, stacked below that. `"stacked"`: cover above the body
   * at every width (a grid tile).
   */
  layout?: 'auto' | 'stacked';
  /** `"featured"` sets the larger title; `"standard"` matches grid tiles. */
  emphasis?: 'featured' | 'standard';
  /** Inject the router's Link (e.g. next/link); defaults to a plain anchor. */
  linkComponent?: ElementType;
}

/**
 * FeaturedCase (Work patterns, 2026-09-21): the one wide case card,
 * Southleft's horizontal feature. Composes Card (media) + Tag + Icon; the
 * cover sits in Card's 16:10 contain slot. The arrangement follows the
 * card's own width (a named container), never the window.
 */
export default function FeaturedCase({
  kicker,
  title,
  impact,
  tags = [],
  href,
  cover,
  cta = 'Read it',
  layout = 'auto',
  emphasis = 'featured',
  linkComponent,
}: FeaturedCaseProps) {
  return (
    <div
      className={[styles.container, layout === 'auto' ? styles.auto : ''].filter(Boolean).join(' ')}
      data-bella-pattern="featured-case"
    >
      <Card
        href={href}
        linkComponent={linkComponent}
        ariaLabel={`${title}. ${cta}`}
        className={styles.card}
        innerClassName={styles.inner}
        media={cover ?? <span className={styles.placeholder}>{title}</span>}
      >
        <span className={styles.kicker}>{kicker}</span>
        <span className={[styles.title, emphasis === 'featured' ? styles.titleFeatured : ''].filter(Boolean).join(' ')}>
          {title}
        </span>
        <span className={styles.impact}>{impact}</span>
        {tags.length > 0 && (
          <span className={styles.tags}>
            {tags.slice(0, 4).map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </span>
        )}
        <span className={styles.cta}>
          {cta}
          <Icon name="ArrowRight" size="sm" />
        </span>
      </Card>
    </div>
  );
}
