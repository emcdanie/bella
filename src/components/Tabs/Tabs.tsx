import React, { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import Button from '../Button/Button';
import Icon, { type IconName } from '../Icon/Icon';
import StatusDot from '../StatusDot/StatusDot';
import Tag from '../Tag/Tag';
import styles from './Tabs.module.css';

export interface TabsItem {
  id: string;
  label: string;
  /** Figma Tab "status". Optional run state, drawn as the StatusDot part (running = info, idle = neutral) and spoken as text. */
  status?: 'running' | 'idle';
  /** Figma Tab "Show count". How many items the panel holds, as the Tag count pill after the label; spoken after the label. */
  count?: number;
  /** Figma Tab "Show icon" + "icon". An Iconoir glyph before the label (sm). Decorative: the label names the tab. */
  icon?: IconName;
}

export interface TabsProps {
  /** The tabs, in order. Every tab owns one panel; render each panel with `tabPanelProps`. */
  tabs: TabsItem[];
  /** The selected tab id; selection lives in aria-selected, not just paint. */
  value: string;
  onChange: (id: string) => void;
  /** Accessible name for the tablist. Required. */
  label: string;
  /** Prefix for the tab and panel ids, unique on the page, so aria-controls and aria-labelledby resolve. */
  idBase: string;
  /** Extra classes on the root (the row that carries the base line). */
  className?: string;
}

const tabId = (idBase: string, id: string) => `${idBase}-tab-${id}`;
const panelId = (idBase: string, id: string) => `${idBase}-panel-${id}`;

/** Props for the panel a tab owns: id, role, labelling, hidden when not selected. */
export function tabPanelProps(idBase: string, id: string, selected: boolean) {
  return {
    id: panelId(idBase, id),
    role: 'tabpanel' as const,
    'aria-labelledby': tabId(idBase, id),
    hidden: !selected,
    tabIndex: 0,
  };
}

/**
 * Switch between panels that share one place on the page. W3C APG tabs with
 * automatic activation: one tab stop, arrows move and select, Home and End
 * jump to the ends.
 */
export default function Tabs({ tabs, value, onChange, label, idBase, className }: TabsProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  /* When the tabs are wider than their space the list scrolls sideways
   * inside itself (Material, Carbon); the selected tab is always brought
   * into view there, never cut off, and the page itself never moves. */
  useEffect(() => {
    const list = listRef.current;
    const tab = refs.current[tabs.findIndex((t) => t.id === value)];
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
    const start = tab.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft;
    const end = start + tab.offsetWidth;
    if (start < list.scrollLeft) list.scrollLeft = start;
    else if (end > list.scrollLeft + list.clientWidth) list.scrollLeft = end - list.clientWidth;
  }, [value, tabs]);

  /* Her pick, 20 Nov ("B · chevron button", as Carbon): when the tabs are
   * wider than their space, a 44 tertiary chevron sits at each end that has
   * more, and scrolls the row that way. Swipe still works; tabs never wrap. */
  const [more, setMore] = useState({ start: false, end: false });
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const max = list.scrollWidth - list.clientWidth;
      setMore({ start: list.scrollLeft > 1, end: list.scrollLeft < max - 1 });
    };
    update();
    list.addEventListener('scroll', update, { passive: true });
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(list);
    return () => {
      list.removeEventListener('scroll', update);
      ro?.disconnect();
    };
  }, [tabs]);
  const scrollBy = (dir: 1 | -1) => {
    const list = listRef.current;
    if (list) list.scrollBy({ left: dir * list.clientWidth * 0.8, behavior: 'smooth' });
  };

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = tabs.findIndex((t) => t.id === value);
    const last = tabs.length - 1;
    const next =
      e.key === 'ArrowRight' ? (i >= last ? 0 : i + 1)
      : e.key === 'ArrowLeft' ? (i <= 0 ? last : i - 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div className={[styles.tabs, className].filter(Boolean).join(' ')} data-bella-component="tabs">
      {more.start ? (
        <span className={styles.more}>
          <Button variant="tertiary" iconOnly icon="NavArrowLeft" ariaLabel="Earlier tabs" onClick={() => scrollBy(-1)} />
        </span>
      ) : null}
      <div role="tablist" aria-label={label} className={styles.list} onKeyDown={onKeyDown} ref={listRef}>
        {tabs.map((t, i) => {
          const selected = t.id === value;
          return (
            <button
              key={t.id}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="tab"
              id={tabId(idBase, t.id)}
              aria-selected={selected}
              aria-controls={panelId(idBase, t.id)}
              tabIndex={selected ? 0 : -1}
              className={styles.tab}
              onClick={() => onChange(t.id)}
            >
              {t.icon ? <Icon name={t.icon} size="sm" /> : null}
              {t.status ? <StatusDot tone={t.status === 'running' ? 'info' : 'neutral'} /> : null}
              {t.label}
              {t.count != null ? (
                <>
                  <span className={styles.count} aria-hidden="true">
                    <Tag tone="count">{t.count}</Tag>
                  </span>
                  <span className={styles.srOnly}>, {t.count}</span>
                </>
              ) : null}
              {t.status ? <span className={styles.srOnly}>, {t.status}</span> : null}
            </button>
          );
        })}
      </div>
      {more.end ? (
        <span className={styles.more}>
          <Button variant="tertiary" iconOnly icon="NavArrowRight" ariaLabel="More tabs" onClick={() => scrollBy(1)} />
        </span>
      ) : null}
    </div>
  );
}
