import React, { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import SegmentedControl from '../SegmentedControl/SegmentedControl';
import Pin from '../Pin/Pin';
import PinLabel from '../PinLabel/PinLabel';
import Leader from '../Leader/Leader';
import styles from './Stage.module.css';

export interface StageMarker {
  id: string;
  /** Position in the frame's own pixels (design size), not the shown size. */
  x: number;
  y: number;
  /** The Pin's number. */
  label: ReactNode;
  /** The Pin's tone (default pink; anatomy pins are yellow). */
  tone?: 'yellow' | 'pink' | 'blue' | 'red' | 'green';
  /** Her "On the stage" look: the part's name in a Pin label part chip, tied to the pin by a solid Leader. Missing = the pin alone. */
  part?: ReactNode;
  /** The chip's status: pass (a check) or finding (a dot). */
  status?: 'pass' | 'finding';
  /** Where the chip sits, in the same pixels as x / y (its left edge, middle). */
  chipX?: number;
  chipY?: number;
  /** The part whose card is open: an ink chip edge and a 2px ink leader. */
  selected?: boolean;
}

export interface StageProps {
  /** Figma "grid". dots: a 2px dot every 24, centred 16 in from the corner. none: the plain tinted surface. */
  grid?: 'dots' | 'none';
  /** Figma "Content" (slot): what stands on the stage, centred, 16 apart. With frameWidth, it is the page drawn inside the frame. */
  children?: ReactNode;
  /** Names the stage when its content needs a group name ("Button on the stage"). */
  label?: string;

  /* ---- Playground frame (beyond published Figma; waits on her decision card, 19 Nov) ---- */
  /** Design width of a page shown on the stage (1440, 1024, 768, 375). Turns on the frame, its size row and zoom. */
  frameWidth?: number;
  /** Design height of the frame. Missing = the content's own height. */
  frameHeight?: number;
  /** fit: scale the frame down to the stage width (never up). actual: 100%; a wider frame scrolls sideways inside the stage. */
  zoom?: 'fit' | 'actual';
  /** Shows the Fit / 100% control floating in the stage's top-right corner. */
  onZoomChange?: (zoom: 'fit' | 'actual') => void;
  /** Mark up: numbered Pins on the frame, in frame pixels; they scale with the frame. */
  markers?: StageMarker[];
  /** Scrolls the frame's content up by this many frame pixels. */
  offsetY?: number;
  /** Mark up: a crosshair over the frame; a click reports where, in frame pixels. */
  picking?: boolean;
  /** Called with the picked point, in frame pixels. */
  onPick?: (x: number, y: number) => void;

  className?: string;
  style?: CSSProperties;
}

const ZOOM_OPTIONS = [
  { value: 'fit', label: 'Fit' },
  { value: 'actual', label: '100%' },
];

/**
 * A stage for specimens: a tinted surface with an optional dot grid and a
 * content slot. Doc stages and diagrams. With frameWidth it also holds a
 * page at its design width, scaled to fit or at 100%, for the Playground.
 */
/* Pins on the stage, each with an optional part chip tied by a solid pink
   leader (her rule "pink for leaders", 19 Nov; Pin, Pin label kind=part and
   Leader as published). Positioned in the parent's own pixels. */
function Markers({ markers, offsetY = 0 }: { markers: StageMarker[]; offsetY?: number }) {
  return (
    <>
      {markers.map((m) => {
        const pinSel = `[data-stage-pin="${m.id}"]`;
        const chipSel = `[data-stage-chip="${m.id}"]`;
        return (
          <React.Fragment key={m.id}>
            <span data-stage-pin={m.id} className={styles.marker} style={{ insetInlineStart: m.x, insetBlockStart: m.y - offsetY }}>
              <Pin number={m.label} variant={m.tone ?? 'pink'} pinStyle="solid" />
            </span>
            {m.part != null && m.chipX != null && m.chipY != null ? (
              <>
                <span data-stage-chip={m.id} className={styles.chip} style={{ insetInlineStart: m.chipX, insetBlockStart: m.chipY - offsetY }}>
                  <PinLabel kind="part" status={m.status} selected={m.selected}>
                    {m.part}
                  </PinLabel>
                </span>
                <Leader from={pinSel} to={chipSel} label={`Pin ${String(m.label)} points to ${typeof m.part === 'string' ? m.part : 'its part'}`} variant="pink" lineStyle="solid" end="dot" selected={m.selected} />
              </>
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
}

export default function Stage({
  grid = 'dots',
  children,
  label,
  frameWidth,
  frameHeight,
  zoom = 'fit',
  onZoomChange,
  markers,
  offsetY = 0,
  picking = false,
  onPick,
  className,
  style,
}: StageProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [room, setRoom] = useState(0);

  useLayoutEffect(() => {
    const el = viewport.current;
    if (!el || frameWidth == null) return;
    const measure = () => {
      const cs = getComputedStyle(el);
      setRoom(el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [frameWidth]);

  const cls = [styles.stage, grid === 'dots' ? styles.dots : '', className].filter(Boolean).join(' ');

  if (frameWidth == null) {
    return (
      <div className={cls} style={style} role={label ? 'group' : undefined} aria-label={label} data-bella-component="stage">
        <div className={styles.content}>
          {children}
          {markers?.length ? <Markers markers={markers} /> : null}
        </div>
      </div>
    );
  }

  const scale = zoom === 'fit' && room > 0 ? Math.min(1, room / frameWidth) : 1;
  const shown = Math.round(scale * 100);

  function pick(e: MouseEvent<HTMLDivElement>) {
    if (!onPick) return;
    const r = e.currentTarget.getBoundingClientRect();
    onPick(Math.round((e.clientX - r.left) / scale), Math.round((e.clientY - r.top) / scale + offsetY));
  }

  return (
    <div className={cls} style={style} role="group" aria-label={label ?? `${frameWidth} wide, shown at ${shown}%`} data-bella-component="stage">
      {onZoomChange ? (
        <div className={styles.zoom}>
          <SegmentedControl label="Zoom" options={ZOOM_OPTIONS} value={zoom} onChange={(v) => onZoomChange(v as 'fit' | 'actual')} />
        </div>
      ) : null}
      <div ref={viewport} className={styles.viewport}>
        <p className={styles.size}>
          {frameWidth} wide · shown at {shown}%
        </p>
        {/* zoom (not transform) so the scaled frame takes its scaled room in the layout */}
        <div className={styles.frameBox}>
          <div className={styles.frame} style={{ inlineSize: frameWidth, blockSize: frameHeight, zoom: scale }}>
            <div className={styles.page} style={offsetY ? { transform: `translateY(${-offsetY}px)` } : undefined}>
              {children}
            </div>
            {markers?.length ? <Markers markers={markers} offsetY={offsetY} /> : null}
            {picking ? <div className={styles.picker} onClick={pick} aria-hidden="true" /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
