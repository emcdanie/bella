import React, { useId, type CSSProperties, type ReactNode } from 'react';
import styles from './ProjectPanel.module.css';

export interface ProjectPanelProps {
  /** The top: the ClientSwitcher. */
  switcher?: ReactNode;
  /** Under "Projects": TreeItem folders, each open one followed by its branch rows. */
  projects?: ReactNode;
  /** Under "Status": TreeItem status rows (Needs you, Claude, Gate, Ready). */
  status?: ReactNode;
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
export default function ProjectPanel({ switcher, projects, status, className, style }: ProjectPanelProps) {
  const id = useId();
  return (
    <aside
      className={[styles.panel, className].filter(Boolean).join(' ')}
      style={style}
      aria-label="Projects and status"
      data-bella-component="project-panel"
    >
      {switcher}
      {projects != null ? (
        <section className={styles.group} aria-labelledby={`${id}-projects`}>
          <h2 id={`${id}-projects`} className={styles.heading}>
            Projects
          </h2>
          {projects}
        </section>
      ) : null}
      {status != null ? (
        <section className={styles.group} aria-labelledby={`${id}-status`}>
          <h2 id={`${id}-status`} className={styles.heading}>
            Status
          </h2>
          {status}
        </section>
      ) : null}
    </aside>
  );
}
