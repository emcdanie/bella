import React, { useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import styles from './PageOutline.module.css';

export interface PageOutlineItem {
  /** The id of the section's heading on the page. */
  id: string;
  label: string;
  /** 2 for a section, 3 for a subsection: drawn indented. */
  level?: 2 | 3;
}

export interface PageOutlineProps {
  /** The page's sections, in order. It renders only with three or more. */
  items: PageOutlineItem[];
  /** The list's heading and the toggle's name. */
  label?: string;
  /** Called on a jump; call event.preventDefault() to route in-app. Without it the section scrolls into view. */
  onNavigate?: (id: string, event: MouseEvent<HTMLAnchorElement>) => void;
  /** Extra classes on the outline. */
  className?: string;
}

/**
 * "On this page", as documentation sites draw it: a small marker of lines,
 * one per section, the one you are reading darker. It opens a list to jump.
 */
export default function PageOutline({ items, label = 'On this page', onNavigate, className }: PageOutlineProps) {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState(items[0]?.id);
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);

  // where you are: the last section whose heading has passed a third of the way down
  useEffect(() => {
    const read = () => {
      let at = items[0]?.id;
      for (const it of items) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight / 3) at = it.id;
      }
      setCurrent(at);
    };
    read();
    window.addEventListener('scroll', read, { passive: true, capture: true });
    window.addEventListener('resize', read);
    return () => {
      window.removeEventListener('scroll', read, { capture: true });
      window.removeEventListener('resize', read);
    };
  }, [items.map((i) => i.id).join()]);

  useEffect(() => {
    if (!open) return undefined;
    const away = (e: Event) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('pointerdown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const jump = (id: string, e: MouseEvent<HTMLAnchorElement>) => {
    setOpen(false);
    if (onNavigate) onNavigate(id, e);
    if (e.defaultPrevented && onNavigate) return;
    e.preventDefault();
    const el = document.getElementById(id);
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el?.scrollIntoView({ behavior: still ? 'auto' : 'smooth', block: 'start' });
    if (el && !el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
    el?.focus({ preventScroll: true });
  };

  // fewer than three sections need no outline
  if (items.length < 3) return null;
  const now = items.find((i) => i.id === current);
  return (
    <div ref={root} className={[styles.outline, className].filter(Boolean).join(' ')} data-bella-component="page-outline">
      <button
        ref={toggle}
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.lines} aria-hidden="true">
          {items.map((it) => (
            <i key={it.id} className={[it.level === 3 ? styles.sub : '', it.id === current ? styles.on : ''].filter(Boolean).join(' ')} />
          ))}
        </span>
        <span className={styles.srOnly}>
          {label}
          {now ? `, reading ${now.label}` : ''}
        </span>
      </button>
      <div id={listId} className={styles.panel} hidden={!open}>
        <p className={styles.heading}>{label}</p>
        <ul className={styles.list}>
          {items.map((it) => (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className={[styles.link, it.level === 3 ? styles.indent : ''].filter(Boolean).join(' ')}
                aria-current={it.id === current ? 'location' : undefined}
                onClick={(e) => jump(it.id, e)}
              >
                {it.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
