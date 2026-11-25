import React, { type ElementType, type ReactNode } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import styles from './Button.module.css';

export interface ButtonProps {
  /**
   * Tier. `"primary"` is the flat ink plate, no shadow, never lifts;
   * render at most ONE per view. `"secondary"` is the flat accent outline.
   * `"tertiary"` is the text tier: no plate. BELLA themes: an ink label, hover lays a fill under it (Figma 26:320). Chip (her pick E, 22 Nov): dark brand blue text only, and hover, pressed and focus lay a pale blue wash under it and underline the label in blue.
   * The neutral tier is retired; there is no fourth tier.
   */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /**
   * Outline shape. `"default"` is border/radius/lg every tier shares (8 in Chip, the pill in BELLA);
   * `"pill"` rounds the ends fully (e.g. a nav call to action).
   */
  shape?: 'default' | 'pill';
  /**
   * `"sm"` is a 32 plate with 12px sides (Figma Button 26:320) for dense
   * rows and tool bars. The label stays 16px and the 44px tap area stays,
   * extended invisibly around the plate. With `iconOnly` it is a 32 square.
   */
  size?: 'default' | 'md' | 'sm';
  /** Figma "Label". The words on the button; `children` still works and wins when both are set. */
  label?: ReactNode;
  /** Figma "icon" (instance swap). An Icon registry name, drawn 20 in the label's ink. */
  icon?: IconName;
  /** Figma "Show icon". Shows `icon` after the label (or alone with `iconOnly`). Defaults to on when `icon` is set. */
  showIcon?: boolean;
  /** Figma "Leading icon". Puts the icon before the label instead of after it. */
  leadingIcon?: boolean;
  /**
   * A 44 square (32 at sm) holding one Icon, corner border/radius/lg, ring
   * following the corner (Figma Button 26:320).
   * Needs `ariaLabel`, and a Tooltip with the same words.
   */
  iconOnly?: boolean;
  /** Renders the button as ONE anchor. External (http...) hrefs open in a new tab. */
  href?: string;
  /** Renders a real button. Ignored when `href` is set. */
  onClick?: () => void;
  /** Button element type; `"submit"` for forms. */
  type?: 'button' | 'submit';
  /** Disabled state: muted surface, no elevation, no affordances. Buttons only, not links. */
  disabled?: boolean;
  /**
   * A job this button started is running ("Check again", "Test"): its icon
   * turns (RefreshDouble, leading, when it has none), aria-busy is set and
   * clicks wait until it is done. The label stays. Reduced motion: the icon
   * holds still. Buttons only, not links.
   */
  busy?: boolean;
  /**
   * Component used to render internal links; inject your router's Link
   * (e.g. next/link) at the consumer; defaults to a plain anchor.
   */
  linkComponent?: ElementType;
  /** Accessible name when the visible label isn't the right name. */
  ariaLabel?: string;
  /** For a button that shows or hides content: whether that content is open (aria-expanded). */
  ariaExpanded?: boolean;
  /** For a toggle button (light or dark, mark up, compare in ToolColumn): whether it is on. On shows the pressed look, the same fill as hover (aria-pressed). */
  ariaPressed?: boolean;
  /** For a button that opens a dialog (aria-haspopup). */
  ariaHaspopup?: 'dialog';
  /** Extra classes on the control. */
  className?: string;
  children?: ReactNode;
}

/**
 * Buttons with real hierarchy: two colour treatments, three tiers, one
 * primary per view. Labels are DM Sans 16px, sentence case, never Unique. One job per
 * state: hover and focus-visible roll the label, active presses the
 * primary down a little; a button never lifts on hover (lift is for cards).
 */
export default function Button({
  variant = 'secondary',
  shape = 'default',
  size = 'default',
  label: labelProp,
  icon,
  showIcon,
  leadingIcon = false,
  iconOnly = false,
  href,
  onClick,
  type = 'button',
  disabled,
  busy = false,
  linkComponent: LinkComponent = 'a',
  ariaLabel,
  ariaExpanded,
  ariaPressed,
  ariaHaspopup,
  className,
  children: childrenProp,
}: ButtonProps) {
  /* Figma Label + icon zones, additive (19 Nov re-sync): children still win */
  const busyHere = busy && !href;
  const shownIcon = busyHere ? (icon ?? 'RefreshDouble') : icon;
  const glyph =
    shownIcon && (busyHere || (showIcon ?? true)) ? (
      busyHere ? (
        <span className={styles.turn}>
          <Icon name={shownIcon} size="md" />
        </span>
      ) : (
        <Icon name={shownIcon} size="md" />
      )
    ) : null;
  const words = childrenProp ?? labelProp;
  const children = glyph ? (
    iconOnly ? (
      glyph
    ) : leadingIcon || (busyHere && !icon) ? (
      <>
        {glyph}
        {words}
      </>
    ) : (
      <>
        {words}
        {glyph}
      </>
    )
  ) : (
    words
  );
  const cls = [styles.button, styles[variant], shape === 'pill' ? styles.pill : '', size === 'sm' ? styles.sm : '', iconOnly ? styles.iconOnly : '', busyHere ? styles.busy : '', className]
    .filter(Boolean)
    .join(' ');
  /* The label roll: the real label slides up and out while an identical
   * copy slides in from below. The copy is a real span, aria-hidden, so
   * assistive tech reads the label once (never CSS content:). Icons roll
   * with the text because the whole children block is duplicated. */
  const label = (
    <span className={styles.roll} data-bella-roll="window">
      <span className={styles.rollLabel} data-bella-roll="label">
        {children}
      </span>
      <span className={styles.rollCopy} data-bella-roll="copy" aria-hidden="true">
        {children}
      </span>
    </span>
  );
  /* stable hook for audit:quality's contract-driven rest-state checks */
  const shared = {
    className: cls,
    'data-bella-component': 'button',
    'data-bella-variant': variant,
    'data-bella-size': size === 'sm' ? 'sm' : undefined,
    'aria-label': ariaLabel,
  } as const;

  if (href) {
    const external = href.startsWith('http');
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" {...shared}>
          {label}
        </a>
      );
    }
    return (
      <LinkComponent href={href} {...shared}>
        {label}
      </LinkComponent>
    );
  }
  return (
    <button
      type={type}
      onClick={busyHere ? undefined : onClick}
      disabled={disabled}
      aria-busy={busyHere || undefined}
      aria-disabled={busyHere || undefined}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      aria-haspopup={ariaHaspopup}
      {...shared}
    >
      {label}
    </button>
  );
}
