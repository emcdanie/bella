import React, { useId, type CSSProperties, type ReactNode } from 'react';
import styles from './ProjectPanel.module.css';

export interface ProjectPanelProps {
  /** The top: the ClientSwitcher. */
  switcher?: ReactNode;
  /** Under "Projects": TreeItem folders, each open one followed by its branch rows. */
  projects?: ReactNode;
  /** Under "Status": TreeItem status rows (Needs you, Claude, Gate, Ready). */
  status?: ReactNode;
  /**
   * Inside a Drawer (the phone Projects drawer): no fill, padding, edge,
   * width or height of its own, so it sits flush in the drawer body; the
   * "Projects" heading is kept for assistive tech but not shown, because the
   * drawer's title already says it.
   */
  flush?: boolean;
  /**
   * Figma "Show heading" (published 21 Nov), for flush only: show the
   * Projects heading when the drawer's title names something else ("Menu").
   * It then takes the drawer title's size (18), never larger. Off by default.
   */
  showHeading?: boolean;
  /** Extra classes on the panel. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The CHIP side panel between the Icon rail and the page (Figma "Project
 * panel", read 19 Nov 2026; no Figma props): which client, its projects and
 * branches, and the run status counts. Not page navigation (the rail has
 * the pages). It fills the height and width its layout gives it.
 */
export default function ProjectPanel({ switcher, projects, status, flush = false, showHeading = false, className, style }: ProjectPanelProps) {
  const id = useId();
  return (
    <aside
      className={[styles.panel, flush ? styles.flush : '', className].filter(Boolean).join(' ')}
      style={style}
      aria-label="Projects and status"
      data-bella-component="project-panel"
    >
      {switcher}
      {projects != null ? (
        <section className={styles.group} aria-labelledby={`${id}-projects`}>
          <h2 id={`${id}-projects`} className={!flush ? styles.heading : showHeading ? [styles.heading, styles.drawerHeading].join(' ') : styles.srOnly}>
            Projects
          </h2>
          {projects}
        </section>
      ) : null}
      {status != null ? (
        <section className={styles.group} aria-labelledby={`${id}-status`}>
          <h2 id={`${id}-status`} className={flush && showHeading ? [styles.heading, styles.drawerHeading].join(' ') : styles.heading}>
            Status
          </h2>
          {status}
        </section>
      ) : null}
    </aside>
  );
}
