import React, { useEffect, useState, type CSSProperties } from 'react';
import Icon from '../Icon/Icon';
import styles from './MapLine.module.css';

export type MapLineCorner = 'none' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export interface MapLineProps {
  /** Figma "direction". horizontal and vertical stretch to their box; turn is a 24 box with a 16-radius quarter curve. */
  direction?: 'horizontal' | 'vertical' | 'turn' | 'curve';
  /** Figma "end". Arrow on the last piece only (straight pieces; Figma draws turns with none). */
  end?: 'arrow' | 'none';
  /** Figma "style" (code cannot use `style`, the CSS prop; same move as Tag's
   * variant). dashed = an optional path, or a step not yet done. */
  variant?: 'solid' | 'dashed';
  /** Figma "tone". default = border/strong; selected = brand blue (the selected step's lines, curve); accent = pink, annotations only (the open node); danger = a failing link. */
  tone?: 'default' | 'selected' | 'accent' | 'danger';
  /** curve only: where the line starts, in the pixels of its positioned parent (the middle of a step's bottom edge). With `to`, the line positions and sizes itself to run between the two points, flipping when `to` is left of `from`, so it follows measured nodes when the board moves or zooms. */
  from?: { x: number; y: number };
  /** curve only: where the line ends (the middle of the next step's top edge). */
  to?: { x: number; y: number };
  /** curve only, without `from` and `to`: flip the line horizontally so it runs top right to bottom left in its own box. */
  flip?: boolean;
  /** Figma "corner". Turn only: which corner the curve bends round. */
  corner?: MapLineCorner;
  /** curve only. Weight: regular is 2px; thin is 1px in a lighter tone, for the lines of steps that are not picked so a busy map does not bunch. */
  weight?: 'regular' | 'thin';
  /** curve only. Draw-in along the line, start to end, when it appears or this prop changes: map = 900ms (the first draw of a map), pick = 250ms (a line becoming the picked step's). none = drawn at once. */
  draw?: 'none' | 'map' | 'pick';
  /** curve only. A soft highlight travels the line in its direction, once, then rests. Set it on the picked step's lines; it plays each time it turns on. */
  travel?: boolean;
  className?: string;
  style?: CSSProperties;
}

/* prefers-reduced-motion: the line is fully drawn and nothing travels. */
function useStill(): boolean {
  const [still, setStill] = useState(() =>
    typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return undefined;
    const on = () => setStill(mq.matches);
    on();
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return still;
}

/* Turn: a 16-radius quarter curve in a 24 box, measured from the Figma
 * vectors (16 x 16 at x/y 0 or 8), drawn as the rounded corner of a CSS
 * border (no inline SVG, one-set rule). Every bend is a curve, never a
 * square elbow (guideline 17). */
const TURN_CLASS: Record<Exclude<MapLineCorner, 'none'>, string> = {
  'top-left': styles.arcTopLeft,
  'top-right': styles.arcTopRight,
  'bottom-left': styles.arcBottomLeft,
  'bottom-right': styles.arcBottomRight,
};

/**
 * A line between two nodes (Map, Step row, pipeline). 2px in its tone.
 * Decorative: the words beside it carry the meaning, so it is aria-hidden.
 */
export default function MapLine({
  direction = 'horizontal',
  end = 'arrow',
  variant = 'solid',
  tone = 'default',
  corner = 'none',
  from,
  to,
  flip = false,
  weight = 'regular',
  draw = 'none',
  travel = false,
  className,
  style,
}: MapLineProps) {
  const still = useStill();
  const cls = [styles.root, styles[direction], styles[tone], variant === 'dashed' ? styles.dashed : '', direction === 'curve' && weight === 'thin' ? styles.thin : '', className]
    .filter(Boolean)
    .join(' ');

  if (direction === 'curve') {
    /* One bezier, M 0 0 C 0 h/2, w h/2, w h, in a viewBox the box stretches (no arrow: the approved map has none).
       The stroke stays 2 wide however the box scales (non-scaling-stroke). */
    const placed = from && to;
    const box: CSSProperties = placed
      ? {
          position: 'absolute',
          left: Math.min(from.x, to.x),
          top: Math.min(from.y, to.y),
          width: Math.abs(to.x - from.x),
          height: Math.abs(to.y - from.y),
        }
      : {};
    const mirrored = placed ? to.x < from.x : flip;
    const drawn = still ? 'none' : draw;
    const path = <path d="M 0 0 C 0 50, 100 50, 100 100" vectorEffect="non-scaling-stroke" />;
    return (
      <span
        className={cls}
        style={{ ...box, ...style }}
        aria-hidden="true"
        data-bella-component="map-line"
        data-flip={mirrored ? '' : undefined}
        data-motion={still ? 'still' : undefined}
        data-bella-reveal={drawn !== 'none' || travel ? '' : undefined}
        data-draw={drawn === 'none' ? undefined : drawn}
        data-travel={!still && travel ? '' : undefined}
      >
        <svg
          className={styles.curvePath}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          data-bella-diagram=""
          role="img"
          aria-label="Connection"
        >
          {path}
        </svg>
        {!still && travel ? (
          <svg className={[styles.curvePath, styles.glint].join(' ')} viewBox="0 0 100 100" preserveAspectRatio="none" data-bella-diagram="" role="img" aria-label="Highlight travelling along the connection" data-glint="">
            {path}
          </svg>
        ) : null}
      </span>
    );
  }

  if (direction === 'turn') {
    const arc = TURN_CLASS[corner === 'none' ? 'top-left' : corner];
    return (
      <span className={cls} style={style} aria-hidden="true" data-bella-component="map-line">
        <span className={[styles.arc, arc].join(' ')} />
      </span>
    );
  }

  return (
    <span className={cls} style={style} aria-hidden="true" data-bella-component="map-line">
      <span className={styles.path} />
      {end === 'arrow' ? (
        <Icon name={direction === 'vertical' ? 'NavArrowDown' : 'NavArrowRight'} size="sm" className={styles.arrow} />
      ) : null}
    </span>
  );
}
