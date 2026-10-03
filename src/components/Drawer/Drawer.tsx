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
  /** The drawer's content (a NavList, filters, settings). */
  children?: ReactNode;
  /** Extra classes on the dialog. */
  className?: string;
}

/**
 * A panel that slides in from an edge over a scrim, for navigation or a tool panel on
 * small screens. A native modal dialog: the rest of the page is inert while
 * it is open, so focus stays inside; Esc closes it; focus goes back to
 * whatever opened it.
 */
export default function Drawer({ open, onClose, label, side = 'left', children, className }: DrawerProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const titleId = useId();
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
      dialog.close();
    }
  }, [open, shown]);

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

  // the scrim is the dialog's own box outside the panel's content
  function onClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === ref.current) ref.current?.close();
  }

  // Esc: the browser's own cancel does this too; listening on the document
  // while open also covers focus on <body> and synthetic key events
  useEffect(() => {
    if (!shown) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape' || !ref.current?.open) return;
      e.preventDefault();
      ref.current.close();
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
      onClick={onClick}
      data-bella-component="drawer"
    >
      {shown ? (
        <>
          <div className={styles.head}>
            <h2 id={titleId} className={styles.title}>
              {label}
            </h2>
            <Button variant="tertiary" onClick={() => ref.current?.close()}>
              Close
            </Button>
          </div>
          <div className={styles.body}>{children}</div>
        </>
      ) : null}
    </dialog>
  );
}
