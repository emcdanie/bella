import React, { type CSSProperties, type ReactNode } from 'react';
import StatusDot, { type StatusDotProps } from '../StatusDot/StatusDot';
import styles from './ConnectorTile.module.css';

export interface ConnectorTileProps {
  /** Figma "App tile": the service's AppTile (md). */
  appTile: ReactNode;
  /** Figma "Status": the StatusDot's word ("Live", "Waiting"). */
  status: ReactNode;
  /** Figma "Status" tone. */
  statusTone?: StatusDotProps['tone'];
  /** Figma "Name": the service ("GitHub CI"). */
  name: ReactNode;
  /** Figma "Value": what it says now ("4 to push"). */
  value: ReactNode;
  /** Figma "Detail" + "Show detail": one line of meta ("CI hasn't run"). Missing = off. */
  detail?: ReactNode;
  /** Figma "Show action": the one action it offers, a Button secondary sm, on the right. Missing = off. */
  action?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

/**
 * One connected service on CHIP Connectors: its app tile and live status, its
 * name, what it says now, and the one action it offers (Figma BellaComponents
 * Connector tile 1330:51190, read 20 Nov 2026). Tiles in a grid share a height.
 */
export default function ConnectorTile({ appTile, status, statusTone = 'success', name, value, detail, action, className, style }: ConnectorTileProps) {
  return (
    <section className={[styles.tile, className].filter(Boolean).join(' ')} style={style} data-bella-component="connector-tile">
      <div className={styles.main}>
        <div className={styles.top}>
          {appTile}
          <StatusDot tone={statusTone} label={status} />
        </div>
        <div className={styles.text}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.value}>{value}</p>
          {detail != null ? <p className={styles.detail}>{detail}</p> : null}
        </div>
      </div>
      {action != null ? <div className={styles.footer}>{action}</div> : null}
    </section>
  );
}
