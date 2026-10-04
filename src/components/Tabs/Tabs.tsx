import React, { useRef, type KeyboardEvent } from 'react';
import styles from './Tabs.module.css';

export interface TabsItem {
  id: string;
  label: string;
  /** Optional run state, drawn as a dot and spoken as text: filled ink for running, a hollow ring for idle. */
  status?: 'running' | 'idle';
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
  /** Extra classes on the tablist. */
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
    <div
      role="tablist"
      aria-label={label}
      className={[styles.list, className].filter(Boolean).join(' ')}
      onKeyDown={onKeyDown}
      data-bella-component="tabs"
    >
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
            {t.status ? (
              <>
                <span className={styles.dot} data-status={t.status} aria-hidden="true" />
                {t.label}
                <span className={styles.srOnly}>, {t.status}</span>
              </>
            ) : (
              t.label
            )}
          </button>
        );
      })}
    </div>
  );
}
