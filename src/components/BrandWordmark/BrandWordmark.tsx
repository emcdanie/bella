import React, { useId, useMemo, useState } from 'react';
import Button from '../Button/Button';
import { patternShapes, wordPaths } from '../../brand/pattern';
import styles from './BrandWordmark.module.css';

export interface BrandWordmarkProps {
  /** The word. ELLETA and BELLA are drawn as wordmarks; BELLA and CHIP also have a mark. CHIP is always its mark. */
  word?: 'ELLETA' | 'BELLA' | 'CHIP';
  /**
   * `"pattern"`: the seeded animal-print collage cut into the letters. `"ink"`: plain ink strokes (currentColor).
   * `"mark"` (Figma "Brand / CHIP logo" variant=mark and "Brand / BELLA mark", read 19 Nov 2026): the
   * drawn mark in its own colours, from theme tokens. BELLA's is the B; CHIP's is the board with the C,
   * its pins and the yellow and red dots (the red dot lives only here, in the artwork).
   * `"logotype"` (CHIP only, drawn 8 Nov 2026 in the CHIP app): the blue chip with its ink C, and the chip's right
   * wall writes out HIP in one ink line. A pink signal runs the circuit once on open and rests as the full stop;
   * under reduced motion it starts at rest (the still final frame).
   */
  variant?: 'pattern' | 'ink' | 'mark' | 'logotype';
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
/* The marks, exported from Figma as SVG (19 Nov 2026). Paint rides on the
   style property so it reads the theme tokens: SVG attributes do not
   evaluate CSS custom properties. Figma colours: #2B8FD0 = background/accent-3,
   #1D2030 = content/default, #E9B820 = background/accent-2, #E2473B =
   background/accent-4. */
const ACCENT_3 = { stroke: 'var(--color-background-accent-3)' };
const MARKS = {
  CHIP: {
    viewBox: '0 0 32 32',
    art: (
      <>
        <rect x="9.25" y="6.95" width="17" height="18" rx="2.5" strokeWidth="1.25" strokeLinejoin="round" style={ACCENT_3} />
        <path
          d="M13.25 3.45V6.95M17.75 3.45V6.95M22.25 3.45V6.95M13.25 24.95V28.45M17.75 24.95V28.45M22.25 24.95V28.45M5.75 11.95H9.25M5.75 15.95H9.25M5.75 19.95H9.25"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={ACCENT_3}
        />
        <path
          d="M22.5753 11.595C21.695 10.6196 20.5397 9.93388 19.2618 9.62828C17.9839 9.32268 16.6434 9.41151 15.417 9.88311C14.1907 10.3547 13.136 11.1869 12.3921 12.2699C11.6482 13.353 11.25 14.6361 11.25 15.95C11.25 17.2639 11.6482 18.547 12.3921 19.6301C13.136 20.7131 14.1907 21.5453 15.417 22.0169C16.6434 22.4885 17.9839 22.5773 19.2618 22.2717C20.5397 21.9661 21.695 21.2804 22.5753 20.305"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: 'var(--color-content-default)' }}
        />
        <circle cx="22.55" cy="2.25" r="1.3" style={{ fill: 'var(--color-background-accent-2)' }} />
        <circle cx="13.55" cy="29.75" r="1.3" style={{ fill: 'var(--color-background-accent-4)' }} />
      </>
    ),
  },
  BELLA: {
    viewBox: '0 0 16 40',
    art: (
      <path
        d="M2.58667 0.5V2.3M2.58667 2.3V27.08M2.58667 2.3H8.45334C11.1378 2.3 12.48 6.43 12.48 14.69C12.48 22.95 11.1378 27.08 8.45334 27.08M2.58667 27.08V37.7M2.58667 27.08H8.45334M2.58667 37.7V39.5M2.58667 37.7H10C12.2756 37.7 13.4133 35.93 13.4133 32.39C13.4133 28.85 12.2756 27.08 10 27.08H8.45334"
        strokeWidth="3.6"
        strokeLinejoin="round"
        style={ACCENT_3}
      />
    ),
  },
} as const;

/* The letters' own left and right edges in the viewBox, so the mark hugs its
 * art with no side bearing (Elleta, 18 Nov, brand A: "the logo hugs its
 * art"; 19 Nov: "the weird padding on each side is really annoying me").
 * The paths are absolute M/H/V/Q: a stem (V, or a curve meeting a vertical
 * tangent) reaches half the stroke past its centre line; a bar (H) ends
 * flat on its point. */
function inkX(paths: string[], sw: number): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  const hit = (x: number, half: number) => {
    lo = Math.min(lo, x - half);
    hi = Math.max(hi, x + half);
  };
  for (const d of paths) {
    let cx = 0;
    for (const [, c, a] of d.matchAll(/([MLHVQ])([^MLHVQ]*)/g)) {
      const n = a.trim().split(/[\s,]+/).filter(Boolean).map(Number);
      if (c === 'M') cx = n[0];
      else if (c === 'H') {
        hit(cx, 0);
        hit(n[0], 0);
        cx = n[0];
      } else if (c === 'V') hit(cx, sw / 2);
      else if (c === 'L') {
        hit(cx, sw / 2);
        hit(n[0], sw / 2);
        cx = n[0];
      } else if (c === 'Q') {
        hit(cx, cx === n[0] ? sw / 2 : 0);
        hit(n[2], n[0] === n[2] ? sw / 2 : 0);
        cx = n[2];
      }
    }
  }
  return [lo, hi];
}

/* The CHIP logotype, shapes and motion exactly as drawn in the CHIP app on 8 Nov 2026 (commit 024a1be):
 * a blue chip whose right wall is the H's first stroke, the wall, C and HIP in one ink line, a pink signal
 * that runs SIGNAL once in 1.8s and rests as the full stop. Paint reads the theme tokens (blue accent-3,
 * ink content-default, yellow accent-2, red accent-4, pink accent-1). Reduced motion: no animation, the
 * signal starts at rest on the full stop. */
const SIGNAL = 'M5 32 H12 V19 A5 5 0 0 1 17 14 H46 V32 H57 V44 H63.5 V20 H76 A6.48 6.48 0 0 1 76 32.96 H70 V44 L86 42.4';
const LINE = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const POP = (token: string) => ({ fill: `var(--color-background-${token})` });

function ChipLogotype({ size = 'nav', className }: { size?: 'nav' | 'full-bleed'; className?: string }) {
  const [still] = useState(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  );
  return (
    <span
      className={[styles.wordmark, styles[size], className].filter(Boolean).join(' ')}
      data-bella-component="brand-wordmark"
    >
      <svg className={styles.svg} viewBox="0 0 94 64" role="img" aria-label="CHIP" data-bella-brand data-bella-logotype>
        <g style={{ ...LINE, stroke: 'var(--color-background-accent-3)', strokeWidth: 2.4 }}>
          <path d="M46 14 H17 A5 5 0 0 0 12 19 V45 A5 5 0 0 0 17 50 H46" />
          <path d="M20 7v7M29 7v7M38 7v7M20 50v7M29 50v7M38 50v7M5 24h7M5 32h7M5 40h7" />
        </g>
        <g style={{ ...LINE, stroke: 'var(--color-content-default)', strokeWidth: 2.8 }}>
          <path d="M38.88 23.29 A13 13 0 1 0 38.88 40.71" />
          <path d="M46 14V50 M46 32H57V20 M57 32V44H63.5V20H76A6.48 6.48 0 0 1 76 32.96H70 M70 20V44" />
        </g>
        <circle cx="38" cy="4.5" r="2.6" style={POP('accent-2')} />
        <circle cx="20" cy="59.5" r="2.6" style={POP('accent-4')} />
        {still ? (
          <circle cx="86" cy="42.4" r="2.6" style={POP('accent-1')} data-signal="rest" />
        ) : (
          <circle r="2.6" style={POP('accent-1')} data-signal="run">
            <animateMotion dur="1.8s" fill="freeze" calcMode="linear" path={SIGNAL} />
          </circle>
        )}
      </svg>
    </span>
  );
}

export default function BrandWordmark(props: BrandWordmarkProps) {
  const { word = 'ELLETA', variant = 'pattern', size = 'nav', className } = props;
  if (word === 'CHIP' && variant === 'logotype') return <ChipLogotype size={size} className={className} />;
  if (word === 'CHIP' || (variant === 'mark' && word === 'BELLA')) {
    const mark = MARKS[word];
    return (
      <span
        className={[styles.wordmark, styles[size], className].filter(Boolean).join(' ')}
        data-bella-component="brand-wordmark"
      >
        <svg className={styles.svg} viewBox={mark.viewBox} fill="none" role="img" aria-label={word} data-bella-brand>
          {mark.art}
        </svg>
      </span>
    );
  }
  return <Wordmark {...props} word={word} variant={variant === 'mark' ? 'ink' : variant} />;
}

function Wordmark({
  word = 'ELLETA',
  variant = 'pattern',
  size = 'nav',
  seed = 7,
  onReroll,
  className,
}: BrandWordmarkProps & { word: 'ELLETA' | 'BELLA'; variant: 'pattern' | 'ink' }) {
  const uid = useId().replace(/:/g, '');
  const { paths, width, height, strokeWidth } = useMemo(() => wordPaths(word), [word]);
  const [x0, x1] = useMemo(() => inkX(paths, strokeWidth), [paths, strokeWidth]);
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
        viewBox={`${x0.toFixed(1)} 0 ${(x1 - x0).toFixed(1)} ${height}`}
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
