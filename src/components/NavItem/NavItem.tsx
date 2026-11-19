import React, { type CSSProperties } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import Tooltip from '../Tooltip/Tooltip';
import styles from './NavItem.module.css';

export interface NavItemProps {
  /** Figma "Label". The place's name; with `iconOnly` it is the accessible name and the tooltip. */
  label: string;
  /** Figma "Badge". A count after the label (not drawn when `iconOnly`). */
  badge?: string | number;
  /** Figma "Show badge". */
  showBadge?: boolean;
  /** Figma "Show icon". */
  showIcon?: boolean;
  /** Figma "icon" (instance swap). */
  icon?: IconName;
  /** Figma "iconOnly". A 44 square with the icon alone; the label becomes its name and its tooltip. */
  iconOnly?: boolean;
  /** Figma "current". The page you are on: light-blue fill, bold ink label and ink icon (aria-current="page"). */
  current?: boolean;
  /** Renders a link. Without it the item is a button. */
  href?: string;
  onClick?: () => void;
  /** Extra classes on the control. */
  className?: string;
  style?: CSSProperties;
}

/**
 * One place in the app navigation (Figma "Nav item", CHIP Dashboard, read
 * 19 Nov 2026). Figma's `state` (default, hover, focus) is CSS, not a prop.
 * The whole row is the 44 target.
 */
export default function NavItem({
  label,
  badge,
  showBadge = badge != null,
  showIcon = true,
  icon = 'ViewGrid',
  iconOnly = false,
  current = false,
  href,
  onClick,
  className,
  style,
}: NavItemProps) {
  const cls = [styles.item, iconOnly ? styles.iconOnly : '', className].filter(Boolean).join(' ');
  const content = (
    <>
      {showIcon || iconOnly ? <Icon name={icon} size="md" className={styles.icon} /> : null}
      {iconOnly ? null : <span className={styles.label}>{label}</span>}
      {!iconOnly && showBadge && badge != null ? <span className={styles.badge}>{badge}</span> : null}
    </>
  );
  const shared = {
    className: cls,
    style,
    'aria-current': current ? ('page' as const) : undefined,
    'aria-label': iconOnly ? label : undefined,
    'data-bella-component': 'nav-item',
  };
  const control = href ? (
    <a href={href} onClick={onClick} {...shared}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={onClick} {...shared}>
      {content}
    </button>
  );
  /* the rail names sit to the right of the icon (CHIP / Screen template) */
  return iconOnly ? <Tooltip label={label} placement="right">{control}</Tooltip> : control;
}
