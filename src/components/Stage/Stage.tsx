import React, { useLayoutEffect, useRef, useState, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import SegmentedControl from '../SegmentedControl/SegmentedControl';
import Pin from '../Pin/Pin';
import PinLabel from '../PinLabel/PinLabel';
import Leader from '../Leader/Leader';
import styles from './Stage.module.css';

export interface StageMarker {
  id: string;
  /** The point on the part the annotation explains, on the part's nearest edge (the leader's dot
   * lands here). With frameWidth: frame pixels (design size). Without: the specimen's own pixels
   * from the stage's centre, multiplied by `scale`, so the marks stay on a centred specimen. */
  x: number;
  y: number;
  /** The number, in her light red pin (Pin tone red, solid, ink number). */
  label?: ReactNode;
  /** "part · value" in the Pin label chip ("Plate · #63b4e8"). With it, a neutral solid Leader runs
   * from the chip to x / y: straight when level, else one curved bend. Missing = a numbered pin at
   * x / y (Mark up). */
  part?: ReactNode;
  /** The chip's edge nearest the part (its middle for chipY). With frameWidth: frame pixels. Without:
   * stage pixels from the centre, not scaled (chips stay at reading size).
   * Left of the point, the chip ends there; right of it, it starts there. */
  chipX?: number;
  chipY?: number;
  /** The part whose card is open: a 2px ink edge on its chip and a 2px ink leader. */
  selected?: boolean;
}

export interface StageProps {
  /** Figma "grid". dots: a 2px dot every 24, centred 16 in from the corner. none: the plain tinted surface. */
  grid?: 'dots' | 'none';
  /** Figma "Content" (slot): what stands on the stage, centred, 16 apart. With frameWidth, it is the page drawn inside the frame. */
  children?: ReactNode;
  /** Names the stage when its content needs a group name ("Button on the stage"). */
  label?: string;
  /** Plain stage: shows the content at this size (2 = her "Shown at 2x"). The content takes its
   * scaled room, pins follow it; chips stay at reading size. */
  scale?: number;

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

  /** A click on a marker's pin or chip: opens that part (its card). Makes pins and chips buttons. */
  onSelect?: (id: string) => void;
  /** The marker lit from outside (its row in the anatomy list is hovered or focused). */
  activeId?: string | null;
  /** Hover or focus on a pin or chip starts (its id) or ends (null): light its row in the list. */
  onActiveChange?: (id: string | null) => void;

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
/* Annotations on the stage (Elleta, 20 Nov: "these annotations are not correct .."; CHIP
   Components, read 21 Nov): each part gets a Pin label chip in her light red with its numbered
   pin ("part · value"), right-aligned in a column beside the part, and a neutral solid Leader
   from the chip to a dot on the part's nearest edge, straight when level, else one curved bend.
   Never status-coloured dots: pass or finding lives in the part card. */
/* Plain stage: tall enough that every pin and chip, measured from the centre, sits inside with
   a 32 margin (the chip column often runs taller than the part). */
function markerRoom(markers: StageMarker[], scale: number) {
  const reach = Math.max(...markers.map((m) => Math.max(Math.abs(m.y * scale), m.chipY != null ? Math.abs(m.chipY) : 0)));
  return `calc(${2 * reach}px + var(--spacing-32) * 2)`;
}

/* An SVG with no size draws nothing, so leaders live on the full stage (or frame), not the centre origin. */
interface MarkerEvents {
  onSelect?: (id: string) => void;
  activeId?: string | null;
  onActiveChange?: (id: string | null) => void;
}

function Leaders({ markers }: { markers: StageMarker[] }) {
  return (
    <>
      {markers.filter(hasChip).map((m) => (
        <Leader
          key={m.id}
          from={`[data-stage-chip="${m.id}"]`}
          to={`[data-stage-pin="${m.id}"]`}
          label={`${m.label != null ? `Pin ${m.label}` : 'The label'} points to ${typeof m.part === 'string' ? m.part : 'the part'}`}
          variant="neutral"
          lineStyle="solid"
          end="dot"
          selected={m.selected}
        />
      ))}
    </>
  );
}

function hasChip(m: StageMarker) {
  return m.part != null && m.chipX != null && m.chipY != null;
}

function Markers({ markers, offsetY = 0, scale = 1, onSelect, activeId, onActiveChange }: { markers: StageMarker[]; offsetY?: number; scale?: number } & MarkerEvents) {
  return (
    <>
      {markers.map((m) => {
        const chip = hasChip(m);
        const active = activeId === m.id;
        const name = typeof m.part === 'string' ? m.part : m.label != null ? `part ${m.label}` : 'the part';
        const hover = onActiveChange
          ? {
              onPointerEnter: () => onActiveChange(m.id),
              onPointerLeave: () => onActiveChange(null),
              onFocus: () => onActiveChange(m.id),
              onBlur: () => onActiveChange(null),
            }
          : {};
        return (
          <React.Fragment key={m.id}>
            {/* with a chip, the point is where the leader's dot lands; without, the numbered pin */}
            <span data-stage-pin={m.id} className={styles.marker} style={{ insetInlineStart: m.x * scale, insetBlockStart: m.y * scale - offsetY }}>
              {chip ? null : (
                <span className={styles.pinHover} {...hover}>
                  <Pin
                    number={m.label}
                    variant="red"
                    pinStyle="solid"
                    active={active}
                    onClick={onSelect ? () => onSelect(m.id) : undefined}
                    ariaLabel={onSelect ? `Open ${name}` : undefined}
                  />
                </span>
              )}
            </span>
            {chip ? (
              <span
                data-stage-chip={m.id}
                className={[styles.chip, m.chipX! < m.x * scale ? styles.chipBefore : ''].filter(Boolean).join(' ')}
                style={{ insetInlineStart: m.chipX, insetBlockStart: m.chipY! - offsetY }}
              >
                <PinLabel
                  tone="red"
                  number={m.label}
                  selected={m.selected}
                  active={active}
                  onClick={onSelect ? () => onSelect(m.id) : undefined}
                  onActiveChange={onActiveChange ? (on) => onActiveChange(on ? m.id : null) : undefined}
                >
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
  scale: contentScale = 1,
  frameWidth,
  frameHeight,
  zoom = 'fit',
  onZoomChange,
  markers,
  offsetY = 0,
  picking = false,
  onPick,
  onSelect,
  activeId,
  onActiveChange,
  className,
  style,
}: StageProps) {
  const events = { onSelect, activeId, onActiveChange };
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
        <div className={styles.content} style={markers?.length ? { minBlockSize: markerRoom(markers, contentScale) } : undefined}>
          {contentScale !== 1 ? (
            /* zoom (not transform) so the scaled content takes its scaled room */
            <div className={styles.scaled} style={{ zoom: contentScale }}>
              {children}
            </div>
          ) : (
            children
          )}
          {markers?.length ? (
            <>
              <div className={styles.origin}>
                <Markers markers={markers} scale={contentScale} {...events} />
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
                <Markers markers={markers} offsetY={offsetY} {...events} />
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
