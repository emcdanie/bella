import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Icon, { type IconName } from '../Icon/Icon';
import Button from '../Button/Button';
import styles from './Toast.module.css';

export type ToastTone = 'info' | 'success' | 'attention' | 'danger';

const ICON: Record<ToastTone, IconName> = { info: 'InfoCircle', success: 'CheckCircle', attention: 'WarningCircle', danger: 'XmarkCircle' };

export interface ToastProps {
  /** Figma "tone". */
  tone?: ToastTone;
  /** Figma "Message": what just happened, one line ("Accepted. Logged in History."). */
  children: ReactNode;
  /** Figma "Show action": at most one action (Undo, Stop). */
  action?: { label: string; onClick: () => void };
  /** Figma "Show close". Also called when the toast times out. */
  onClose?: () => void;
  /** How long it stays, in ms (default 6000; 0 = until closed). Paused while hovered or focused. */
  duration?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * A short message after an action that comes and goes (Figma BellaComponents
 * Toast 956:56, read 20 Nov 2026; her rules: "every action gets feedback on the
 * control itself, plus a toast", "Toast comes and goes; Notification stays").
 * A polite live region: the message is announced without moving focus.
 */
export default function Toast({ tone = 'success', children, action, onClose, duration = 6000, className, style }: ToastProps) {
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const left = useRef(duration);
  /* Comes and goes (rule "Motion that shows what happened", item 3): it slides
   * up and fades in on arrival, and fades out before onClose; with reduced
   * motion it simply appears and goes. */
  const close = () => {
    if (!onClose || leaving) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) onClose();
    else setLeaving(true);
  };
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!onClose || !duration || paused) return;
    const started = Date.now();
    const t = window.setTimeout(() => closeRef.current(), left.current);
    return () => {
      window.clearTimeout(t);
      left.current -= Date.now() - started;
    };
  }, [paused, onClose, duration]);

  return (
    <div
      className={[styles.toast, styles[tone], leaving ? styles.leaving : '', className].filter(Boolean).join(' ')}
      style={style}
      onAnimationEnd={(e) => {
        if (leaving && e.target === e.currentTarget) onClose?.();
      }}
      role="status"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      data-bella-component="toast"
      data-bella-reveal=""
    >
      <div className={styles.body}>
      <span className={styles.icon} aria-hidden="true">
        <Icon name={ICON[tone]} size="lg" />
      </span>
      <span className={styles.message}>{children}</span>
      {action ? (
        <span className={styles.action}>
          <Button variant="secondary" onClick={action.onClick}>
            {action.label}
          </Button>
        </span>
      ) : null}
      {onClose ? (
        <span className={styles.close}>
          <Button variant="tertiary" iconOnly icon="Xmark" ariaLabel="Close" onClick={close} />
        </span>
      ) : null}
      </div>
    </div>
  );
}
