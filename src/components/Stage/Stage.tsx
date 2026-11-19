import React, { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import SegmentedControl from '../SegmentedControl/SegmentedControl';
import Pin from '../Pin/Pin';
import PinLabel from '../PinLabel/PinLabel';
import Leader from '../Leader/Leader';
import styles from './Stage.module.css';

export interface StageMarker {
  id: string;
  /** Where the pin sits. With frameWidth: frame pixels (design size). Without: pixels from the
   * stage's centre, so the marks stay on a centred specimen at any width. */
  x: number;
  y: number;
  /** The Pin's number. Missing = the dot pin (her "On the stage" look). */
  label?: ReactNode;
  /** The Pin's tone. Missing: from status (pass green, finding yellow), else pink. */
  tone?: 'yellow' | 'pink' | 'blue' | 'red' | 'green';
  /** The part's name in a Pin label chip (no pin). Missing = the pin alone. */
  part?: ReactNode;
  /** pass (green dot) or finding (ochre dot). */
  status?: 'pass' | 'finding';
  /** The chip's edge nearest the pin, in the same pixels as x / y (its middle for chipY).
   * Left of the pin, the chip ends there; right of it, it starts there. */
  chipX?: number;
  chipY?: number;
  /** A dashed pink leader from the chip to the pin (the part in focus). */
  leader?: boolean;
  /** The part whose card is open: a 2px ink edge on its chip. */
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
/* Pins on the stage (her CHIP Components design, 690:492657, read 20 Nov 2026):
   dot pins, the part names in Pin label chips (no pin), and a dashed pink
   Leader with a dot end for the part in focus ("pink for leaders", 19 Nov). */
/* An SVG with no size draws nothing, so leaders live on the full stage (or frame), not the centre origin. */
function Leaders({ markers }: { markers: StageMarker[] }) {
  return (
    <>
      {markers
        .filter((m) => m.leader && m.part != null && m.chipX != null && m.chipY != null)
        .map((m) => (
          <Leader
            key={m.id}
            from={`[data-stage-chip="${m.id}"]`}
            to={`[data-stage-pin="${m.id}"]`}
            label={`${typeof m.part === 'string' ? m.part : 'The part'} is marked on the stage`}
            variant="pink"
            end="dot"
          />
        ))}
    </>
  );
}

function Markers({ markers, offsetY = 0 }: { markers: StageMarker[]; offsetY?: number }) {
  return (
    <>
      {markers.map((m) => {
        const tone = m.tone ?? (m.status === 'pass' ? 'green' : m.status === 'finding' ? 'yellow' : 'pink');
        const name = typeof m.part === 'string' ? m.part : undefined;
        const hasChip = m.part != null && m.chipX != null && m.chipY != null;
        return (
          <React.Fragment key={m.id}>
            <span data-stage-pin={m.id} className={styles.marker} style={{ insetInlineStart: m.x, insetBlockStart: m.y - offsetY }}>
              <Pin number={m.label} variant={tone} ariaLabel={m.label == null ? [name, m.status].filter(Boolean).join(', ') || undefined : undefined} />
            </span>
            {hasChip ? (
              <span
                data-stage-chip={m.id}
                className={[styles.chip, m.chipX! < m.x ? styles.chipBefore : ''].filter(Boolean).join(' ')}
                style={{ insetInlineStart: m.chipX, insetBlockStart: m.chipY! - offsetY }}
              >
                <PinLabel showPin={false} selected={m.selected}>
                  {m.part}
                </PinLabel>
              </span>
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
          {markers?.length ? (
            <>
              <div className={styles.origin}>
                <Markers markers={markers} />
              </div>
              <Leaders markers={markers} />
            </>
          ) : null}
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
            {markers?.length ? (
              <>
                <Markers markers={markers} offsetY={offsetY} />
                <Leaders markers={markers} />
              </>
            ) : null}
            {picking ? <div className={styles.picker} onClick={pick} aria-hidden="true" /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
