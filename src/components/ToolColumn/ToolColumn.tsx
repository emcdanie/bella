import React, { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import Button from '../Button/Button';
import type { IconName } from '../Icon/Icon';
import Tooltip from '../Tooltip/Tooltip';
import styles from './ToolColumn.module.css';

/** The zoom steps of a stage: Zoom in and out move one step along them. */
export const ZOOM_STEPS = [25, 50, 75, 100, 150, 200, 300, 400] as const;

export interface ToolColumnProps {
  /** The zoom in percent (the readout and where Zoom in / out start). Missing = held by the column, starting at `defaultZoom`. */
  zoom?: number;
  defaultZoom?: number;
  /** Fires with the next step when Zoom in or Zoom out is used (also + and -). The stage applies it. */
  onZoomChange?: (zoom: number) => void;
  /** Fit: fit the part to the stage (also Shift+1). The stage applies it and then passes its zoom back. */
  onFit?: () => void;
  /** Figma "Show zoom": the readout ("200%") 16 right of and 8 under the column. */
  showZoom?: boolean;
  /** Light or dark: on = the dark look of the part is showing (aria-pressed). */
  dark?: boolean;
  onDarkChange?: (dark: boolean) => void;
  /** Mark up: on = a click on the stage drops a pin (aria-pressed). */
  markUp?: boolean;
  onMarkUpChange?: (on: boolean) => void;
  /** Compare: on = two panes side by side (aria-pressed). */
  compare?: boolean;
  onCompareChange?: (on: boolean) => void;
  /** The toolbar's accessible name. */
  label?: string;
  /** Extra classes on the wrapper. */
  className?: string;
  style?: CSSProperties;
}

/**
 * The thin column of view tools beside a stage: zoom in, fit, zoom out, then
 * light or dark, mark up and compare. Icon-only buttons, each with its name
 * in a Tooltip on the right. One tab stop; arrow keys move between the tools.
 */
export default function ToolColumn({
  zoom: zoomProp,
  defaultZoom = 100,
  onZoomChange,
  onFit,
  showZoom = true,
  dark = false,
  onDarkChange,
  markUp = false,
  onMarkUpChange,
  compare = false,
  onCompareChange,
  label = 'View tools',
  className,
  style,
}: ToolColumnProps) {
  const [zoomState, setZoomState] = useState(defaultZoom);
  const zoom = zoomProp ?? zoomState;
  const barRef = useRef<HTMLDivElement>(null);

  const step = (dir: 1 | -1) => {
    const next = dir === 1 ? ZOOM_STEPS.find((s) => s > zoom) : [...ZOOM_STEPS].reverse().find((s) => s < zoom);
    if (next == null) return;
    setZoomState(next);
    onZoomChange?.(next);
  };

  /* roving tabindex: one tab stop in the column. The Button part has no tabIndex of its own, so the column sets it. */
  const buttons = () => Array.from(barRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? []);
  const [active, setActive] = useState(0);
  useEffect(() => {
    buttons().forEach((b, i) => b.setAttribute('tabindex', i === active ? '0' : '-1'));
  });

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const list = buttons();
    const at = Math.max(0, list.indexOf(document.activeElement as HTMLButtonElement));
    let to: number | null = null;
    if (e.key === 'ArrowDown') to = Math.min(list.length - 1, at + 1);
    else if (e.key === 'ArrowUp') to = Math.max(0, at - 1);
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = list.length - 1;
    else if (e.key === '+' || e.key === '=') step(1);
    else if (e.key === '-') step(-1);
    else if (e.shiftKey && (e.key === '1' || e.key === '!' || e.code === 'Digit1')) onFit?.();
    else return;
    e.preventDefault();
    if (to != null) {
      setActive(to);
      list[to]?.focus();
    }
  };

  const tool = (name: string, icon: IconName, onClick: () => void, pressed?: boolean) => (
    <Tooltip label={name} placement="right">
      <Button variant="tertiary" iconOnly icon={icon} ariaLabel={name} ariaPressed={pressed} onClick={onClick} />
    </Tooltip>
  );

  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')} style={style} data-bella-component="tool-column">
      <div
        ref={barRef}
        className={styles.column}
        role="toolbar"
        aria-orientation="vertical"
        aria-label={label}
        onKeyDown={onKeyDown}
        onFocusCapture={(e) => {
          const i = buttons().indexOf(e.target as unknown as HTMLButtonElement);
          if (i >= 0) setActive(i);
        }}
      >
        <div className={styles.group}>
          {tool('Zoom in', 'ZoomIn', () => step(1))}
          {tool('Fit', 'Expand', () => onFit?.())}
          {tool('Zoom out', 'ZoomOut', () => step(-1))}
        </div>
        <span className={styles.divider} role="separator" aria-orientation="horizontal" />
        <div className={styles.group}>
          {tool('Light or dark', dark ? 'HalfMoon' : 'SunLight', () => onDarkChange?.(!dark), dark)}
          {tool('Mark up', 'EditPencil', () => onMarkUpChange?.(!markUp), markUp)}
          {tool('Compare', 'Copy', () => onCompareChange?.(!compare), compare)}
        </div>
      </div>
      {showZoom ? (
        <span className={styles.zoom} role="status" aria-label="Zoom">
          {zoom}%
        </span>
      ) : null}
    </div>
  );
}
