import React, { type CSSProperties } from 'react';
import { useReducedMotion } from '../shared/useCountTo';
import styles from './Branch.module.css';

export type BranchHue = 'pink' | 'navy' | 'ochre' | 'stone' | 'blue';

export interface BranchProps {
  /** Where the branch starts, in the pixels of its positioned parent (the right edge of the node it leaves). */
  from: { x: number; y: number };
  /** Where the branch ends (the left edge of the node it reaches). The curve flips to run up, or leftwards, when `to` is above or left of `from`. */
  to: { x: number; y: number };
  /** The branch's colour: one of five brand colours, by name (a stage's colour on a mind map). It names the stage only; state is always a shape and a word. */
  hue?: BranchHue;
  /** regular = 3px (root to stage); thin = 2px (stage to step). */
  weight?: 'regular' | 'thin';
  /** Draw-in, start to end, when the branch appears or this prop changes: map = 900ms (the first draw of a map), pick = 250ms (a branch becoming the picked step's). none = drawn at once. */
  draw?: 'none' | 'map' | 'pick';
  /** A soft highlight travels the branch once in its direction, then rests; plays each time it turns on. */
  travel?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * One branch of a mind map: an S-curve between any two points that leaves
 * and arrives level, in a stage's colour. Decorative: the words beside it
 * carry the meaning, so it is aria-hidden. Motion follows MapLine's: a
 * draw-in, one travelling highlight, and nothing moves under reduced motion.
 */
export default function Branch({ from, to, hue = 'pink', weight = 'regular', draw = 'none', travel = false, className, style }: BranchProps) {
  const still = useReducedMotion();
  const drawn = still ? 'none' : draw;
  const right = to.x >= from.x;
  const down = to.y >= from.y;
  const box: CSSProperties = {
    position: 'absolute',
    left: Math.min(from.x, to.x),
    top: Math.min(from.y, to.y),
    width: Math.abs(to.x - from.x),
    height: Math.abs(to.y - from.y),
  };
  const path = <path d="M 0 0 C 50 0, 50 100, 100 100" vectorEffect="non-scaling-stroke" />;
  const svg = (extra?: string) => (
    <svg className={[styles.path, extra].filter(Boolean).join(' ')} viewBox="0 0 100 100" preserveAspectRatio="none" data-bella-diagram="" role="img" aria-label={extra ? 'Highlight travelling along the branch' : 'Branch'}>
      {path}
    </svg>
  );
  return (
    <span
      className={[styles.root, styles[hue], weight === 'thin' ? styles.thin : '', className].filter(Boolean).join(' ')}
      style={{ ...box, ...style }}
      aria-hidden="true"
      data-bella-component="branch"
      data-heading={right ? 'right' : 'left'}
      data-flip-y={down ? undefined : ''}
      data-flip-x={right ? undefined : ''}
      data-motion={still ? 'still' : undefined}
      data-draw={drawn === 'none' ? undefined : drawn}
      data-travel={!still && travel ? '' : undefined}
      data-bella-reveal={drawn !== 'none' || travel ? '' : undefined}
    >
      {svg()}
      {!still && travel ? svg(styles.glint) : null}
    </span>
  );
}
