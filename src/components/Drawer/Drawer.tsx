import React, { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import Button from '../Button/Button';
import styles from './Drawer.module.css';

export interface DrawerProps {
  /** Whether the drawer is open. The drawer is a modal dialog while open. */
  open: boolean;
  /** Called when the drawer closes itself: Esc, the Close button or a click on the scrim. */
  onClose: () => void;
  /** The drawer's visible title, which also names the dialog. */
  label: string;
  /** The edge it slides from: left for navigation (default), right for a tool panel. */
  side?: 'left' | 'right';
  /**
   * Width. sm (default): 320, for navigation and filters (BellaComponents Drawer).
   * lg: 640 from a 768 window, the full width on a phone, for a session's run
   * or the terminal (CHIP · Dashboard Flow 12, 791:264033 and 791:264846).
   */
  size?: 'sm' | 'lg';
  /** The drawer's content (a NavList, filters, settings). */
  children?: ReactNode;
  /** Figma "Show status" + "Status": one line under the title ("Checks ran 2 min ago"). Missing = off. */
  status?: ReactNode;
  /** Figma "Show subtitle" + "Subtitle": one line under the title, above the status, the same subtle 16. Missing = off. */
  subtitle?: ReactNode;
  /** Figma "Show action" + "Action": one control in the head before Close, a tertiary Button ("New chat"). Missing = off. */
  action?: ReactNode;
  /** Figma "Show back": the tertiary icon-only Back (44) at the head's start, for a drawer opened one level down. Missing = off. */
  onBack?: () => void;
  /** Back's name for screen readers. Default "Back". */
  backLabel?: string;
  /** Figma "Show footer" + Footer: actions pinned under the body, above a hairline: at most one primary Button, the rest secondary. Missing = off. */
  footer?: ReactNode;
  /** Extra classes on the dialog. */
  className?: string;
}

/**
 * A panel that slides in from an edge over a scrim, for navigation or a tool panel on
 * small screens. A native modal dialog: the rest of the page is inert while
 * it is open, so focus stays inside; Esc closes it; focus goes back to
 * whatever opened it.
 */
export default function Drawer({ open, onClose, label, side = 'left', size = 'sm', children, status, subtitle, action, onBack, backLabel = 'Back', footer, className }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();
  /* the body is a tab stop only while it scrolls, in every browser */
  const bodyRef = useRef<HTMLDivElement>(null);
  const [scrolls, setScrolls] = useState(false);
  // content renders only while open: a closed drawer holds no hidden controls
  const [shown, setShown] = useState(false);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !shown) {
      returnTo.current = document.activeElement as HTMLElement | null;
      setShown(true);
    } else if (open && shown && !dialog.open) {
      dialog.showModal(); // after the content mounts
      dialog.focus(); // the dialog itself takes focus and is announced by its title; Tab moves into it
    } else if (!open && dialog.open) {
      shut();
    }
  }, [open, shown]);

  /* Goes as it came (rule "Motion that shows what happened", item 8): the
   * panel slides back out to its edge and the scrim fades, then the dialog
   * closes. Reduced motion: it closes at once. */
  function shut() {
    const dialog = ref.current;
    if (!dialog?.open || dialog.dataset.closing) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) dialog.close();
    else dialog.dataset.closing = 'true';
  }
  function onAnimationEnd(e: React.AnimationEvent<HTMLDialogElement>) {
    const dialog = ref.current;
    if (e.target !== dialog || !dialog?.dataset.closing) return;
    delete dialog.dataset.closing;
    dialog.close();
  }

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const closed = () => {
      setShown(false);
      returnTo.current?.focus?.();
      returnTo.current = null;
      onCloseRef.current();
    };
    dialog.addEventListener('close', closed);
    return () => dialog.removeEventListener('close', closed);
  }, []);

  useLayoutEffect(() => {
    const body = bodyRef.current;
    if (!shown || !body) return;
    const measure = () => setScrolls(body.scrollHeight > body.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(body);
    Array.from(body.children).forEach((c) => ro.observe(c));
    return () => ro.disconnect();
  }, [shown, children]);

  // the scrim is the dialog's own box outside the panel's content
  function onClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === ref.current) shut();
  }

  // Esc: the browser's own cancel does this too; listening on the document
  // while open also covers focus on <body> and synthetic key events
  useEffect(() => {
    if (!shown) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape' || !ref.current?.open) return;
      e.preventDefault();
      shut();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [shown]);

  return (
    <dialog
      ref={ref}
      className={[styles.drawer, className].filter(Boolean).join(' ')}
      aria-labelledby={titleId}
      tabIndex={-1}
      data-side={side}
      data-size={size}
      onClick={onClick}
      onCancel={(e) => {
        e.preventDefault();
        shut();
      }}
      onAnimationEnd={onAnimationEnd}
      data-bella-component="drawer"
    >
      {shown ? (
        <>
          {/* Figma Head (172:528): Back, Title row (Title, Subtitle, Status) fills, Action, Close, 12 apart; Close is
              the 44 secondary icon-only Button in the flow, never pinned */}
          <div className={styles.head}>
            {onBack ? <Button variant="tertiary" size="md" iconOnly icon="NavArrowLeft" ariaLabel={backLabel} onClick={onBack} /> : null}
            <div className={styles.titleRow}>
              <h2 id={titleId} className={styles.title}>
                {label}
              </h2>
              {subtitle != null ? <p className={styles.status}>{subtitle}</p> : null}
              {status != null ? <p className={styles.status}>{status}</p> : null}
            </div>
            {action != null ? <div className={styles.action}>{action}</div> : null}
            <Button variant="secondary" size="md" iconOnly icon="Xmark" ariaLabel="Close" onClick={shut} />
          </div>
          {/* the body scrolls; Chrome makes a scrolling box a tab stop, so it is a
              named region with BELLA's ring, and the keyboard can scroll it */}
          <div ref={bodyRef} className={styles.body} role="region" aria-label={`${label}: content`} tabIndex={scrolls ? 0 : undefined}>
            {children}
          </div>
          {footer != null ? <div className={styles.footer}>{footer}</div> : null}
        </>
      ) : null}
    </dialog>
  );
}
