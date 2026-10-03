import React, { useId, type MouseEvent, type ReactNode } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import styles from './NavList.module.css';

export interface NavListItem {
  href: string;
  label: string;
  /** Decorative leading glyph from the Icon registry; the label carries the name. */
  icon?: IconName;
  /** A short count or word after the label, read as part of the link. */
  badge?: string | number;
  /** The page or view on screen; rendered as aria-current="page". */
  current?: boolean;
}

export interface NavListGroup {
  /** Optional group heading, set as a Mono label; it names the list for assistive tech. */
  label?: string;
  items: NavListItem[];
}

export interface NavListProps {
  groups: NavListGroup[];
  /** Accessible name for the nav landmark. Required: a page can hold more than one nav. */
  label: string;
  /** Hides the lists, leaving only the toggle. Needs onToggle to be reachable. */
  collapsed?: boolean;
  /** Renders the hide / show toggle and is called when it is pressed. */
  onToggle?: () => void;
  /** Called on every link click, before navigation; call event.preventDefault() to route in-app. */
  onNavigate?: (href: string, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Content pinned under the lists (an account row, a version line). Hidden with the lists. */
  footer?: ReactNode;
  /** Extra classes on the nav. */
  className?: string;
}

/**
 * A sidebar of grouped links: where you are is aria-current, not just paint.
 * Collapses to its toggle.
 */
export default function NavList({
  groups,
  label,
  collapsed = false,
  onToggle,
  onNavigate,
  footer,
  className,
}: NavListProps) {
  const id = useId();
  const bodyId = `${id}-body`;
  return (
    <nav
      aria-label={label}
      className={[styles.nav, className].filter(Boolean).join(' ')}
      data-collapsed={collapsed || undefined}
      data-bella-component="nav-list"
    >
      {onToggle ? (
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={!collapsed}
          aria-controls={bodyId}
          onClick={onToggle}
        >
          <Icon name={collapsed ? 'SidebarExpand' : 'SidebarCollapse'} size="md" />
          <span className={styles.srOnly}>{collapsed ? `Show ${label}` : `Hide ${label}`}</span>
        </button>
      ) : null}
      <div id={bodyId} className={styles.body} hidden={collapsed}>
        {groups.map((g, gi) => {
          const headId = `${id}-g${gi}`;
          return (
            <div key={gi} className={styles.group}>
              {g.label ? (
                <p id={headId} className={styles.groupLabel}>
                  {g.label}
                </p>
              ) : null}
              <ul className={styles.list} aria-labelledby={g.label ? headId : undefined}>
                {g.items.map((it) => (
                  <li key={it.href + it.label}>
                    <a
                      href={it.href}
                      className={styles.item}
                      aria-current={it.current ? 'page' : undefined}
                      onClick={onNavigate ? (e) => onNavigate(it.href, e) : undefined}
                    >
                      {it.icon ? <Icon name={it.icon} size="sm" /> : null}
                      <span className={styles.itemLabel}>{it.label}</span>
                      {it.badge != null ? <span className={styles.badge}>{it.badge}</span> : null}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        {footer ? <div className={styles.footer}>{footer}</div> : null}
      </div>
    </nav>
  );
}
