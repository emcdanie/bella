import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EASING_POINTS } from '../EasingCurve/EasingCurve';

/* Numbers move to the new value and show the difference once (rule "Motion
 * that shows what happened", item 5, Elleta 21 Nov). Shared by Stat and
 * SystemHealth so both count the same way: motion/duration/450 on
 * motion/easing/out, read from the tokens; reduced motion jumps to the new
 * value. Nothing moves on first paint unless `from` is given (charts count
 * up when they first show, 22 Nov). */

export function bezier([x1, y1, x2, y2]: [number, number, number, number]) {
  const at = (a: number, b: number, t: number) => 3 * a * (1 - t) ** 2 * t + 3 * b * (1 - t) * t ** 2 + t ** 3;
  return (x: number) => {
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}

/** True when the reader asked for less motion: every count then shows its end value at once. */
export function reducedMotion() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function tokenMs(name: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const n = parseFloat(v);
  return Number.isFinite(n) ? (v.endsWith('ms') ? n : n * 1000) : 0;
}

export interface CountTo {
  /** The number to draw this frame. */
  shown: number;
  /** The last change (new minus old), or null before any change. */
  diff: number | null;
  /** Bumps on every change: key the difference mark on it so it plays once per change. */
  changeKey: number;
}

export interface CountToOptions {
  /** Count up from this number when the value first shows (charts, 22 Nov: "plays when the chart first
   * shows"). No difference mark for that first count. Missing = the first value shows at once. */
  from?: number;
}

export default function useCountTo(target: number, { from: first }: CountToOptions = {}): CountTo {
  const [shown, setShown] = useState(() => (first != null && !reducedMotion() ? first : target));
  const [diff, setDiff] = useState<number | null>(null);
  const [changeKey, setChangeKey] = useState(0);
  const from = useRef(first ?? target);
  const intro = useRef(first != null);

  useEffect(() => {
    const start = from.current;
    const isIntro = intro.current;
    intro.current = false;
    if (start === target) return;
    from.current = target;
    if (!isIntro) {
      setDiff(target - start);
      setChangeKey((k) => k + 1);
    }
    const ms = tokenMs('--motion-duration-450');
    if (reducedMotion() || ms === 0) {
      setShown(target);
      return;
    }
    const ease = bezier(EASING_POINTS.out);
    const decimals = (String(target).split('.')[1] ?? '').length;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      /* asked for less motion mid-count (or a capture that emulates it): the end value now */
      const p = reducedMotion() ? 1 : Math.min(1, (now - t0) / ms);
      const v = start + (target - start) * ease(p);
      setShown(p === 1 ? target : Number(v.toFixed(decimals)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setShown(target);
    };
  }, [target]);

  return { shown, diff, changeKey };
}

/** "+3" or "−2" (a real minus sign), with an optional unit. */
export function formatDiff(diff: number, unit = '') {
  const decimals = (String(Math.abs(diff)).split('.')[1] ?? '').length;
  return `${diff > 0 ? '+' : '−'}${Math.abs(diff).toFixed(Math.min(decimals, 1))}${unit}`;
}

/**
 * "Changed values glow once" (rule "Motion that shows what happened", item 1):
 * returns 0 on first paint and a new number each time a word or number value
 * changes; key the value on it with the glow class so the glow plays once per
 * change. Other nodes never glow.
 */
export function useChangeKey(value: ReactNode): number {
  const last = useRef(value);
  const [n, setN] = useState(0);
  useEffect(() => {
    const plain = typeof value === 'string' || typeof value === 'number';
    if (plain && value !== last.current && last.current !== undefined) setN((k) => k + 1);
    last.current = value;
  }, [value]);
  return n;
}

/** Reduced motion as React state, so a part can turn its CSS motion off in JS too (a story can then
 * mock matchMedia and see the end state). Follows the setting while mounted. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(reducedMotion);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(m.matches);
    m.addEventListener?.('change', on);
    return () => m.removeEventListener?.('change', on);
  }, []);
  return reduced;
}
