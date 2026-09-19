import React, { type CSSProperties, type ElementType, type ReactNode } from 'react';
import Card from '../Card/Card';
import Icon from '../Icon/Icon';
import styles from './ResourceCard.module.css';

export interface ResourceCardProps {
  /** The tab label. The kind of thing this is: WORKFLOW, AUDIT, and so on. */
  type: string;
  /** The resource's name. Renders at the card-title floor, never smaller. */
  title: string;
  /** One or two lines. It clamps at two, so write to two. */
  description: string;
  /** Where the card goes. The whole card is one link. */
  href: string;
  /** The file-window preview that fills the cover well. */
  cover?: ReactNode;
  /**
   * Current state, e.g. "Live". The dot beside it is deliberately neutral:
   * BELLA has no status colour ladder yet (issue #1), and inventing one here
   * would be a colour nobody can defend.
   */
  statusLabel?: string;
  /** Identity colour, passed through to Card's border tint and hover trace. */
  accent?: string;
  /** Router Link for internal hrefs; injected by the consumer, defaults to an anchor. */
  linkComponent?: ElementType;
  /** Extra classes on the card root. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The folder card. A dark file window on top, a warm sheet below, and a tab
 * folded up from the sheet itself so the two read as one piece of paper.
 */
export default function ResourceCard({
  type,
  title,
  description,
  href,
  cover,
  statusLabel,
  accent,
  linkComponent,
  className,
  style,
}: ResourceCardProps) {
  return (
    <Card
      href={href}
      accent={accent}
      linkComponent={linkComponent}
      className={[styles.card, className].filter(Boolean).join(' ')}
      innerClassName={styles.sheet}
      style={style}
    >
      <div className={styles.cover} data-bella-resource-cover="">
        {cover}
      </div>

      {/* Pulled up over the cover, so the tab overlaps rather than sits below. */}
      <div className={styles.body}>
        <div className={styles.tabRow}>
          <div className={styles.tab}>
            <span className={styles.tabLabel}>{type}</span>
          </div>
          {/* The fold. One background, no content: see ResourceCard.module.css. */}
          <span className={styles.notch} aria-hidden="true" />
          <span className={styles.filler} aria-hidden="true" />
        </div>

        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
          <div className={styles.footer}>
            {statusLabel ? (
              <span className={styles.status}>
                <span className={styles.dot} aria-hidden="true" />
                {statusLabel}
              </span>
            ) : (
              <span />
            )}
            {/* A span, not a link: the whole card is already the link, and a
                nested one would be a second tab stop to the same place. */}
            <span className={styles.action}>
              Open
              <Icon name="ArrowUpRight" size="sm" />
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
