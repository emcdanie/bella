import React, { type CSSProperties, type ReactNode } from "react";
import Icon, { type IconName } from "../Icon/Icon";
import Button from "../Button/Button";
import styles from "./Notification.module.css";

export type NotificationTone = "info" | "success" | "attention" | "danger";

export interface NotificationAction {
  /** The button's words. */
  label: ReactNode;
  onClick?: () => void;
  href?: string;
}

export interface NotificationProps {
  /** Figma "Message". The line under the title; wraps. */
  message?: ReactNode;
  /** Figma "Show icon" (on by default, her 21 Nov pick "A · outline circle icons"). Off drops the icon column. */
  showIcon?: boolean;
  /** Figma "Show action". The first action, the small secondary Button (white, grey edge, ink label; 32 plate, 44 hit; as Figma draws it). Missing = off. */
  action?: NotificationAction;
  /** Figma "Title". */
  title?: ReactNode;
  /** Figma "Show second action". Missing = off. */
  secondAction?: NotificationAction;
  /** Figma "Show close". Missing = off. Close is Button tertiary, sm, icon only, top right in the flow. */
  onClose?: () => void;
  /** Accessible name of the close button. */
  closeLabel?: string;
  /** Figma "tone". */
  tone?: NotificationTone;
  /**
   * Figma "Icon" (nested swap). Defaults per tone to the registry glyph
   * Figma uses: info InfoCircle, success CheckCircle, attention
   * WarningCircle, danger XmarkCircle.
   */
  icon?: IconName;
  /** Extra classes on the root. */
  className?: string;
  style?: CSSProperties;
}

const DEFAULT_ICON: Record<NotificationTone, IconName> = {
  info: "InfoCircle",
  success: "CheckCircle",
  attention: "WarningCircle",
  danger: "XmarkCircle",
};

const TONE_WORD: Record<NotificationTone, string> = {
  info: "Information",
  success: "Success",
  attention: "Needs attention",
  danger: "Error",
};

/**
 * A message that stays on the page until it is resolved or closed (Toast is
 * for ones that come and go). As published 21 Nov (951:4124): soft status
 * fill, no border, no bar and no Tag; an outline circle icon in the tone
 * leads, top-aligned with the title, 12 from the text; title 20 regular
 * names the thing, message subtle says why; actions on the right; close top
 * right, in the flow. The icon shape and the tint carry the state.
 */
export default function Notification({
  message,
  showIcon = true,
  action,
  title,
  secondAction,
  onClose,
  closeLabel = "Close",
  tone = "attention",
  icon,
  className,
  style,
}: NotificationProps) {
  const actions = [action, secondAction].filter(
    Boolean,
  ) as NotificationAction[];
  return (
    <div
      className={[styles.root, styles[tone], className]
        .filter(Boolean)
        .join(" ")}
      style={style}
      role={tone === "danger" ? "alert" : "status"}
      data-bella-component="notification"
    >
      <div
        className={[styles.row, showIcon ? "" : styles.noIcon]
          .filter(Boolean)
          .join(" ")}
      >
        {showIcon ? (
          <span className={[styles.iconColumn, title != null ? styles.iconColumnTitled : ""].filter(Boolean).join(" ")} aria-hidden="true">
            <span className={styles.iconSlot}>
              <Icon name={icon ?? DEFAULT_ICON[tone]} size="md" />
            </span>
          </span>
        ) : null}
        <div className={styles.text}>
          {title != null ? (
            <p className={styles.title}>
              <span className={styles.srOnly}>{TONE_WORD[tone]}: </span>
              {title}
            </p>
          ) : null}
          {message != null ? <p className={styles.message}>{message}</p> : null}
        </div>
        {actions.length ? (
          <div className={styles.actions}>
            {actions.map((a, i) => (
              <Button
                key={i}
                variant="secondary"
                size="sm"
                onClick={a.onClick}
                href={a.href}
              >
                {a.label}
              </Button>
            ))}
          </div>
        ) : null}
        {onClose ? (
          <Button
            variant="tertiary"
            size="sm"
            iconOnly
            icon="Xmark"
            ariaLabel={closeLabel}
            onClick={onClose}
            className={styles.close}
          />
        ) : null}
      </div>
    </div>
  );
}
