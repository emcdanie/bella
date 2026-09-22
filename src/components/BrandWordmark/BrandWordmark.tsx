import React, { useId, useMemo } from 'react';
import Button from '../Button/Button';
import { patternShapes, wordPaths } from '../../brand/pattern';
import styles from './BrandWordmark.module.css';

export interface BrandWordmarkProps {
  /** The word. Only ELLETA and BELLA are drawn. */
  word?: 'ELLETA' | 'BELLA';
  /** `"pattern"`: the seeded animal-print collage cut into the letters. `"ink"`: plain ink strokes (currentColor). */
  variant?: 'pattern' | 'ink';
  /** `"nav"`: 40px tall. `"full-bleed"`: fills its container's width and sits on the baseline. */
  size?: 'nav' | 'full-bleed';
  /** The pattern seed. The same seed always draws the same pattern. */
  seed?: number;
  /** When set, a Reroll control is rendered after the wordmark and calls this. */
  onReroll?: () => void;
  className?: string;
}

/**
 * BrandWordmark (brand refresh, 2026-09-22): the custom E, L, T, A, B
 * glyphs as stroke paths at the locked settings (weight 12, width 58,
 * height 130, tracking 16, soft corners), filled with the seeded brand
 * pattern and a grain, or in plain ink. A labelled image: the pattern
 * layers are aria-hidden. It never moves, so reduced motion needs nothing.
 */
export default function BrandWordmark({
  word = 'ELLETA',
  variant = 'pattern',
  size = 'nav',
  seed = 7,
  onReroll,
  className,
}: BrandWordmarkProps) {
  const uid = useId().replace(/:/g, '');
  const { paths, width, height, strokeWidth } = useMemo(() => wordPaths(word), [word]);
  const shapes = useMemo(
    () => (variant === 'pattern' ? patternShapes(width * 4, height * 4, seed) : []),
    [variant, width, height, seed]
  );
  const strokes = (color: string) => (
    <g fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="butt">
      {paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
    </g>
  );
  return (
    <span
      className={[styles.wordmark, styles[size], className].filter(Boolean).join(' ')}
      data-bella-component="brand-wordmark"
    >
      <svg
        className={styles.svg}
        viewBox={`0 0 ${width.toFixed(1)} ${height}`}
        role="img"
        aria-label={word}
        data-bella-brand
      >
        {variant === 'pattern' ? (
          <>
            <defs>
              {/* luminance mask: black hides, white shows (not design colours) */}
              <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width={width} height={height}>
                <rect width={width} height={height} fill="black" />
                {strokes('white')}
              </mask>
              <filter id={`g${uid}`}>
                <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} />
                <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.16 0" />
                <feComposite in2="SourceGraphic" operator="in" />
              </filter>
            </defs>
            <g mask={`url(#m${uid})`} aria-hidden="true">
              <g transform="scale(0.25)">
                {shapes.map((s, i) => (
                  <path
                    key={i}
                    d={s.d}
                    fill={s.fill ?? 'none'}
                    stroke={s.stroke}
                    strokeWidth={s.strokeWidth}
                    strokeLinecap={s.stroke ? 'round' : undefined}
                  />
                ))}
              </g>
              <rect width={width} height={height} filter={`url(#g${uid})`} fill="black" />
            </g>
          </>
        ) : (
          strokes('currentColor')
        )}
      </svg>
      {onReroll ? (
        <span className={styles.reroll}>
          <Button variant="tertiary" onClick={onReroll} ariaLabel={`Reroll the ${word} pattern`}>
            Reroll
          </Button>
        </span>
      ) : null}
    </span>
  );
}
