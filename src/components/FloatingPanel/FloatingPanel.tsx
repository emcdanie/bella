import React, { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import Button from '../Button/Button';
import Icon from '../Icon/Icon';
import StatusDot, { type StatusDotProps } from '../StatusDot/StatusDot';
import Tooltip from '../Tooltip/Tooltip';
import { reducedMotion, tokenMs, useReducedMotion } from '../shared/useCountTo';
import styles from './FloatingPanel.module.css';

export interface FloatingPanelProps {
  /** Figma "Title". What the panel is ("Terminal"); names the dialog and the Dock and Close buttons. */
  title?: string;
  /** Figma "Show status" + the StatusDot word ("Working"). Missing = off. */
  status?: string;
  /** The StatusDot tone beside the title. Default info, a dot with no wash. */
  statusTone?: StatusDotProps['tone'];
  /** Figma "Show action" + its label ("Stop"): a secondary Button in the title bar. Missing = off. */
  actionLabel?: string;
  onAction?: () => void;
  /** Figma "Body" slot: the drawer's content as it is (the Terminal steps and composer). */
  children?: ReactNode;
  /** Dock puts it back in the drawer: the Dock button or Esc. Focus goes back to the button that opened it. */
  onDock?: () => void;
  /** Close closes it (a running job keeps running; Stop stops it). Focus goes back to the opener. */
  onClose?: () => void;
  /** Where it opens, in viewport pixels from the top left. Missing = the bottom right corner, 16 in from both edges. */
  defaultPosition?: { x: number; y: number };
  /** Fires once a move ends (a drag drop or an arrow press). */
  onMove?: (position: { x: number; y: number }) => void;
  /** Extra classes on the window. */
  className?: string;
  style?: CSSProperties;
}

/**
 * A panel detached from its drawer into a small window that floats over any
 * page, so you can watch an agent and keep working. Move it by dragging the
 * title bar, or with the arrow keys on the focused bar (Shift moves further).
 * It stays fully on screen. Esc or Dock puts it back; focus returns to where
 * it came from. A non-modal dialog: the page behind stays usable.
 */
export default function FloatingPanel({
  title = 'Terminal',
  status,
  statusTone = 'info',
  actionLabel,
  onAction,
  children,
  onDock,
  onClose,
  defaultPosition,
  onMove,
  className,
  style,
}: FloatingPanelProps) {
  const uid = useId();
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(typeof document !== 'undefined' ? document.activeElement : null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [leaving, setLeaving] = useState(false);

  const token = (name: string) => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;

  /** Keep the whole window on screen, 16 from the viewport edges. */
  const clamp = useCallback((p: { x: number; y: number }) => {
    const el = rootRef.current;
    if (!el) return p;
    const edge = token('--spacing-16');
    const { width, height } = el.getBoundingClientRect();
    const maxX = Math.max(edge, window.innerWidth - width - edge);
    const maxY = Math.max(edge, window.innerHeight - height - edge);
    return { x: Math.min(maxX, Math.max(edge, p.x)), y: Math.min(maxY, Math.max(edge, p.y)) };
  }, []);

  /* open: place it, and move focus to the title bar */
  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const { width, height } = el.getBoundingClientRect();
    const edge = token('--spacing-16');
    setPos(clamp(defaultPosition ?? { x: window.innerWidth - width - edge, y: window.innerHeight - height - edge }));
    handleRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* back to the opener when it docks or closes (it unmounts) */
  useEffect(
    () => () => {
      const o = opener.current as HTMLElement | null;
      if (o && o.isConnected && typeof o.focus === 'function') o.focus();
    },
    []
  );

  /* a smaller window pulls it back on screen */
  useEffect(() => {
    const on = () => setPos((p) => (p ? clamp(p) : p));
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [clamp]);

  const leave = (done?: () => void) => {
    if (!done) return;
    if (reducedMotion()) {
      done();
      return;
    }
    setLeaving(true);
    window.setTimeout(done, tokenMs('--motion-duration-250'));
  };
  const dock = () => leave(onDock ?? onClose);
  const close = () => leave(onClose ?? onDock);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !pos) return;
    if ((e.target as HTMLElement).closest('[data-bella-component="button"]')) return;
    drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setPos(clamp({ x: e.clientX - drag.current.dx, y: e.clientY - drag.current.dy }));
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    drag.current = null;
    e.currentTarget.releasePointerCapture?.(e.pointerId);
    if (pos) onMove?.(pos);
  };

  /* arrow keys on the focused title bar: 8 a press, Shift 40 */
  const onHandleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget || !pos) return;
    const step = token(e.shiftKey ? '--spacing-40' : '--spacing-8');
    const d: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const m = d[e.key];
    if (!m) return;
    e.preventDefault();
    const next = clamp({ x: pos.x + m[0], y: pos.y + m[1] });
    setPos(next);
    onMove?.(next);
  };

  const onRootKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    e.stopPropagation();
    dock();
  };

  return (
    <div
      ref={rootRef}
      className={[styles.panel, className].filter(Boolean).join(' ')}
      style={{ ...style, left: pos?.x, top: pos?.y, opacity: pos ? undefined : 0 }}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${uid}-title`}
      data-bella-component="floating-panel" data-bella-reveal=""
      data-motion={reduced ? 'still' : leaving ? 'leaving' : 'live'}
      onKeyDown={onRootKey}
    >
      <div className={styles.bar}>
        <div
          ref={handleRef}
          className={styles.handle}
          tabIndex={0}
          role="group"
          aria-label={`${title} title bar`}
          aria-describedby={`${uid}-hint`}
          data-testid="floating-panel-handle"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onHandleKey}
        >
          <span className={styles.grip}>
            <Icon name="DragHandle" size="md" />
          </span>
          <span id={`${uid}-title`} className={styles.title}>
            {title}
          </span>
          {status ? <StatusDot label={status} tone={statusTone} showWash={false} /> : null}
          <span id={`${uid}-hint`} className={styles.srOnly}>
            Arrow keys move it, Esc docks it
          </span>
        </div>
        <div className={styles.actions}>
          {actionLabel ? (
            <Button variant="secondary" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          ) : null}
          <Tooltip label={`Dock ${title}`} placement="bottom">
            <Button variant="tertiary" iconOnly icon="SidebarExpand" ariaLabel={`Dock ${title}`} onClick={dock} />
          </Tooltip>
          <Tooltip label={`Close ${title}`} placement="bottom">
            <Button variant="tertiary" iconOnly icon="Xmark" ariaLabel={`Close ${title}`} onClick={close} />
          </Tooltip>
        </div>
      </div>
      <div className={styles.body}>{children}</div>
    </div>
  );
}
