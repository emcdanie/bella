import React, { useId, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import ClientSwitcher from '../ClientSwitcher/ClientSwitcher';
import NavItem from '../NavItem/NavItem';
import type { IconName } from '../Icon/Icon';
import styles from './SideMenu.module.css';

export interface SideMenuItem {
  /** The row's name (Nav item "Label"). */
  label: string;
  /** Where it goes. Without it the row is a button (Search opens the search). */
  href?: string;
  /** The Nav item icon. Projects default to Folder. */
  icon?: IconName;
  /** A count after the label ("Needs you" 3), Geist Mono SemiBold. */
  badge?: string | number;
  /** The page you are on: bold ink on the selected light blue (Chip), aria-current="page". */
  current?: boolean;
  /** Called on click (a button row, or a link the app routes in place). */
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}

export interface SideMenuProps {
  /** The nav landmark's name. Default "Main". */
  label?: string;
  /** Switcher name, the plain Client switcher ("BELLA ⌄"). */
  client?: string;
  /** The client's own logo in the switcher, in place of the visible name (CHIP, 23 Nov 2026), e.g. BrandWordmark word="BELLA". `client` stays the accessible name. */
  clientLogo?: ReactNode;
  /** Opens the client list. */
  onClientClick?: () => void;
  /** Whether the client list is open (aria-expanded on the switcher). */
  clientExpanded?: boolean;
  /**
   * The Find field at the top of the menu, over the first row (CHIP, 23 Nov 2026: one search, where Figma has its Find
   * field). A SearchField, and after it at most one icon Button (its filter): the field takes the room, the button keeps
   * its 44; 16 above the rows, the gap between groups. The slot is the menu's search landmark. Leave the Search row out of `items` when this is set.
   */
  search?: ReactNode;
  /** Group · Go to: Home, Needs you (count), Not again (and a Search row when there is no `search` slot). */
  items: SideMenuItem[];
  /** Group · Pinned: what she pinned. */
  pinned?: SideMenuItem[];
  /** Group · Projects: one Folder row per project. */
  projects?: SideMenuItem[];
  /** Foot, pushed to the bottom: Team, Settings. */
  foot?: SideMenuItem[];
  /** Figma "Show pinned". */
  showPinned?: boolean;
  /** Figma "Show projects". */
  showProjects?: boolean;
  /** Called on every row click with the row's href, before navigation; call event.preventDefault() to route in the app. */
  onNavigate?: (href: string, event: MouseEvent<HTMLElement>) => void;
  /** Extra classes on the menu. */
  className?: string;
  style?: CSSProperties;
}

/* The search slot is the menu's search landmark. Spread, not written on the tag: the menu's own root has no role, and
   spec-build reads a role written in this file as the root's. */
const SEARCH_LANDMARK = { role: 'search' } as const;

/**
 * The one side menu of the CHIP app (Figma "Side menu" 1709:48082, published
 * 22 Nov 2026; her pick A · a new Side menu part): the plain Client switcher
 * level with the Top bar, the Find field when the app has one, then where you go, what you pinned, your projects,
 * and Team and Settings at the foot. Every row is a Nav item.
 */
export default function SideMenu({
  label = 'Main',
  client = 'BELLA',
  clientLogo,
  onClientClick,
  clientExpanded,
  search,
  items,
  pinned = [],
  projects = [],
  foot = [],
  showPinned = true,
  showProjects = true,
  onNavigate,
  className,
  style,
}: SideMenuProps) {
  const id = useId();
  const row = (it: SideMenuItem, fallbackIcon?: IconName) => (
    <li key={(it.href ?? '') + it.label}>
      <NavItem
        href={it.href}
        label={it.label}
        icon={it.icon ?? fallbackIcon}
        showIcon={(it.icon ?? fallbackIcon) != null}
        badge={it.badge}
        current={it.current}
        onClick={(e) => {
          it.onClick?.(e);
          if (it.href && onNavigate) onNavigate(it.href, e);
        }}
      />
    </li>
  );
  const group = (name: string, rows: SideMenuItem[], fallbackIcon?: IconName) => {
    const headId = `${id}-${name}`;
    return (
      <div className={styles.group}>
        <p id={headId} className={styles.groupLabel}>
          {name}
        </p>
        <ul className={styles.list} aria-labelledby={headId}>
          {rows.map((it) => row(it, fallbackIcon))}
        </ul>
      </div>
    );
  };
  const nav = (
    <nav aria-label={label} className={styles.nav}>
      <div className={styles.main}>
        <ul className={styles.list}>{items.map((it) => row(it))}</ul>
        {showPinned && pinned.length ? group('Pinned', pinned) : null}
        {showProjects && projects.length ? group('Projects', projects, 'Folder') : null}
      </div>
      {foot.length ? <ul className={[styles.list, styles.foot].join(' ')}>{foot.map((it) => row(it))}</ul> : null}
    </nav>
  );
  return (
    <div className={[styles.menu, className].filter(Boolean).join(' ')} style={style} data-bella-component="side-menu">
      <ClientSwitcher variant="plain" name={client} logo={clientLogo} onClick={onClientClick} expanded={clientExpanded} />
      {search != null ? (
        <div className={styles.body}>
          <div {...SEARCH_LANDMARK} className={styles.search}>
            {search}
          </div>
          {nav}
        </div>
      ) : (
        nav
      )}
    </div>
  );
}
