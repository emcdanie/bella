import React, { type ReactNode } from 'react';
import PageHeader from '../PageHeader/PageHeader';
import Tabs, { tabPanelProps, type TabsItem } from '../Tabs/Tabs';
import styles from './Screen.module.css';

export interface ScreenTabs {
  /** The tabs under the top row. */
  items: TabsItem[];
  /** The selected tab's id; the content is its panel. */
  value: string;
  onChange: (id: string) => void;
  /** The tab list's accessible name ("Project views"). */
  label: string;
  /** Ties each tab to its panel (aria-controls). */
  idBase: string;
}

export interface ScreenProps {
  /** The side menu column: a SideMenu, an IconRail, or nothing when it is hidden or stepped out into a Drawer. */
  menu?: ReactNode;
  /** The page's title: the breadcrumb's last segment and the page's one h1. */
  title: ReactNode;
  /** Before the title on the top row: the menu button and the breadcrumb's parents. */
  lead?: ReactNode;
  /** At the top row's right edge: status, tools and the page's one main action. They move under the title when the row is full. */
  actions?: ReactNode;
  /** Tabs under the top row; the content becomes the selected tab's panel. */
  tabs?: ScreenTabs;
  /** The content slot: the page's one content component, on the 12-column page grid. */
  children?: ReactNode;
  /** Drawn after the page: drawers, docks and toolbars that open over it. */
  overlay?: ReactNode;
  className?: string;
}

/**
 * The page frame (CHIP / Screen in Figma): the side menu, one top row (lead, title, actions), the tabs and the
 * content, which is the only part that scrolls. The frame is the window's height; the menu keeps it while the content
 * scrolls. No data, routes or calls: a product passes its menu, words and parts.
 */
export default function Screen({ menu, title, lead, actions, tabs, children, overlay, className }: ScreenProps) {
  const hasMenu = menu != null && menu !== false;
  return (
    <div
      className={[styles.screen, hasMenu ? '' : styles.noMenu, className].filter(Boolean).join(' ')}
      data-bella-component="screen"
    >
      {/* the page first in the source, so the top row's first control comes before the menu for the keyboard; the grid
          puts the menu back on the left */}
      <div className={styles.main} data-screen-part="main">
        <div className={styles.page} data-screen-part="page">
          <div className={[styles.head, tabs ? '' : styles.plain].filter(Boolean).join(' ')} data-screen-part="head">
            <div className={styles.row}>
              <PageHeader size="bar" title={title} meta={lead} />
              {actions != null ? <div className={styles.actions}>{actions}</div> : null}
            </div>
            {tabs ? (
              <Tabs className={styles.tabs} tabs={tabs.items} value={tabs.value} onChange={tabs.onChange} label={tabs.label} idBase={tabs.idBase} />
            ) : null}
          </div>
          <main className={styles.content} id="main" data-screen-part="content">
            {tabs ? (
              <>
                {/* the selected tab's panel holds the content, and every other tab has its empty hidden one, so each
                    tab's aria-controls lands; the panel keeps the page grid */}
                <div {...tabPanelProps(tabs.idBase, tabs.value, true)} tabIndex={undefined} className={styles.panel} data-screen-part="panel">
                  {children}
                </div>
                {tabs.items
                  .filter((t) => t.id !== tabs.value)
                  .map((t) => (
                    <div key={t.id} {...tabPanelProps(tabs.idBase, t.id, false)} tabIndex={undefined} />
                  ))}
              </>
            ) : (
              children
            )}
          </main>
        </div>
      </div>
      {hasMenu ? (
        <div className={styles.menu} data-screen-part="menu">
          {menu}
        </div>
      ) : null}
      {overlay}
    </div>
  );
}
