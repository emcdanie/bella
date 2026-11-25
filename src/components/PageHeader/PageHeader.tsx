import React, { type ReactNode } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import Link from '../Link/Link';
import Trailing from '../Trailing/Trailing';
import styles from './PageHeader.module.css';

export interface PageHeaderProps {
  /** Figma "Meta" (+ "Show meta"). A quiet line above the title: breadcrumb, source or category ("Specimen No. 002 · Actions"). */
  meta?: ReactNode;
  /** Figma "Title". The page title, the page's one h1. Plain text: no brand dot, no icon in front on CHIP pages. */
  title: ReactNode;
  /** Figma "Lede" (+ "Show lede"). One or two sentences under the title, held to the body measure. */
  lede?: ReactNode;
  /** Figma "Show icon" + "icon". An Iconoir glyph in a 48 well before the title (BellaComponents, 11 Nov 2026). Decorative: the title names the page. */
  icon?: IconName;
  /** Figma "Show switcher". Something that belongs to the title, beside it but outside the h1 (the switcher chevron, a quiet ⋯ menu), so the heading's name stays the title alone. */
  titleAside?: ReactNode;
  /** Figma "Show story link". A link under the title to the story behind the page, with the › Trailing mark. */
  storyLink?: { label: ReactNode; href: string };
  /** Figma "Health" (+ "Show health"). The health line under the title, in the subtext face ("95% healthy · 13 checks to fix"). */
  health?: ReactNode;
  /** Figma "Show actions". The page's main action, top right: one primary Button. */
  actions?: ReactNode;
  /**
   * Figma "size" (PageHeader set 1663:281509). page (default) or project (a project's tabs). Since 22 Nov
   * 19:08 both set the title 28 on 36 and the meta and health lines 14 on 20.
   * bar (CHIP, 23 Nov, "page chrome is small"): ONE 56 row. The meta (the breadcrumb's parents) and the title (its
   * last segment, still the page's one h1, 22 on 28) read as one line, the page's one action at the right edge.
   * No lede, health line or story link in a bar: they are left out.
   */
  size?: 'page' | 'project' | 'bar';
  /** The h1's id. */
  id?: string;
  className?: string;
}

/**
 * The top of every page (layout foundation, 2026-10-03; re-synced to Figma
 * "PageHeader", CHIP Dashboard, read 19 Nov 2026). One fixed title size on
 * every page, not the display ramp. Meta, then the row (the title column on
 * the left, the main action top right), then the lede.
 */
export default function PageHeader({
  meta,
  icon,
  title,
  titleAside,
  storyLink,
  health,
  lede,
  actions,
  size = 'page',
  id,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={[styles.header, className].filter(Boolean).join(' ')}
      data-bella-component="page-header"
      data-size={size}
    >
      {meta != null ? <p className={styles.meta} data-bella-meta>{meta}</p> : null}
      <div className={styles.row}>
        <div className={styles.titleColumn}>
          <div className={styles.titleGroup}>
            {icon ? (
              <span className={styles.iconWell} aria-hidden="true">
                <Icon name={icon} size="lg" />
              </span>
            ) : null}
            <h1 id={id} className={styles.title}>
              {title}
            </h1>
            {titleAside != null ? <div className={styles.titleAside}>{titleAside}</div> : null}
          </div>
          {storyLink && size !== 'bar' ? (
            <span className={styles.storyLink}>
              <Link href={storyLink.href}>{storyLink.label}</Link>
              <Trailing />
            </span>
          ) : null}
          {health != null && size !== 'bar' ? <p className={styles.health} data-bella-meta>{health}</p> : null}
        </div>
        {actions != null ? <div className={styles.actions}>{actions}</div> : null}
      </div>
      {lede != null && size !== 'bar' ? <p className={styles.lede}>{lede}</p> : null}
    </header>
  );
}
