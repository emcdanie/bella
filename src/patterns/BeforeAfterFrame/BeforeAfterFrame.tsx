import React, { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import SegmentedControl from '../../components/SegmentedControl/SegmentedControl';
import Icon from '../../components/Icon/Icon';
import styles from './BeforeAfterFrame.module.css';

export interface BeforeAfterMarker {
  /** Horizontal position, percent of the screen's width (0 to 100). */
  x: number;
  /** Vertical position, percent of the screen's height (0 to 100). */
  y: number;
  /** What the marker points at; renders in the numbered notes list. */
  note: ReactNode;
}

export interface BeforeAfterState {
  /** Stable key for the state. */
  id: string;
  /** The tab label (Before, After, an optional third). */
  label: string;
  /** The screen image; natural width at least 2x the rendered width. */
  src: string;
  /** What the screen shows, for anyone not seeing it. */
  alt: string;
  /** Natural pixel size, so the frame reserves its space before load. */
  width: number;
  height: number;
  /** Numbered markers, placed by percent coordinates. */
  markers?: BeforeAfterMarker[];
}

export interface BeforeAfterFrameProps {
  /** Two or three states: Before, After, and an optional third. */
  states: BeforeAfterState[];
  /** Accessible name for the state switcher. */
  label: string;
  /** Caption under the frame. */
  caption?: ReactNode;
  /**
   * `"auto"` (default): fit while the frame is wide, scroll once it is
   * narrow (a phone), so the screen never shrinks past legible. `"fit"`:
   * the whole screen always scales into the frame. `"scroll"`: the screen
   * always keeps a readable size inside a 16:10 window that scrolls, with a
   * visible cue.
   */
  fit?: 'auto' | 'fit' | 'scroll';
  /** The state shown first; defaults to the first. */
  defaultState?: string;
}

/**
 * BeforeAfterFrame (Work patterns, 2026-09-21). One screen at a time behind
 * a SegmentedControl, numbered markers at percent coordinates, the notes
 * list beside. The whole screen is always visible (fit), or scrolls with a
 * cue. Markers are NEVER clipped: the stage carries a gutter the size of a
 * marker on every side and coordinates clamp to the screen, so a marker on
 * the very edge still draws whole.
 *
 * Markers are visual indexes (aria-hidden); the ordered notes list carries
 * the meaning, in the same order, for everyone.
 */
export default function BeforeAfterFrame({
  states,
  label,
  caption,
  fit = 'auto',
  defaultState,
}: BeforeAfterFrameProps) {
  const [active, setActive] = useState(defaultState ?? states[0]?.id);
  const scrollerRef = useRef<HTMLDivElement>(null);
  /* the window is a tab stop only while it actually scrolls */
  const [scrolls, setScrolls] = useState(fit === 'scroll');
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    /* any overflow at all makes it scrollable, so it must be reachable */
    const check = () =>
      setScrolls(
        fit === 'scroll' || el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
      );
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => ro.disconnect();
  }, [active, fit]);
  const state = states.find((s) => s.id === active) ?? states[0];
  const notesId = useId();
  if (!state) return null;
  const markers = state.markers ?? [];
  const clamp = (n: number) => Math.min(100, Math.max(0, n));

  const shot = (
    <div className={styles.shot} style={{ aspectRatio: `${state.width} / ${state.height}` }}>
      <img src={state.src} alt={state.alt} width={state.width} height={state.height} className={styles.img} />
      {markers.map((m, i) => (
        <span
          key={i}
          className={styles.marker}
          style={{ left: `${clamp(m.x)}%`, top: `${clamp(m.y)}%` }}
          aria-hidden="true"
        >
          {i + 1}
        </span>
      ))}
    </div>
  );

  return (
    <figure
      className={[styles.container, styles[fit]].join(' ')}
      data-bella-pattern="before-after-frame"
    >
      <div className={styles.frame}>
        {states.length > 1 && (
          <SegmentedControl
            label={label}
            value={state.id}
            onChange={setActive}
            options={states.map((s) => ({ value: s.id, label: s.label }))}
          />
        )}
        <div className={[styles.layout, markers.length ? styles.withNotes : ''].filter(Boolean).join(' ')}>
          <div className={styles.stage}>
            <div
              ref={scrollerRef}
              className={styles.scroller}
              tabIndex={scrolls ? 0 : undefined}
              role={scrolls ? 'region' : undefined}
              aria-label={scrolls ? `${state.label} screen, scrollable` : undefined}
            >
              {shot}
            </div>
            <p className={styles.cue}>
              <Icon name="NavArrowDown" size="sm" />
              Scroll the frame to see the whole screen
            </p>
          </div>
          {markers.length > 0 && (
            <ol className={styles.notes} id={notesId} role="list" aria-label={`${state.label}: notes`}>
              {markers.map((m, i) => (
                <li key={i} className={styles.note}>
                  <span className={styles.noteIndex} aria-hidden="true">
                    {i + 1}
                  </span>
                  <span>{m.note}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
      {caption && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
