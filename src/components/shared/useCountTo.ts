import { useEffect, useRef, useState } from 'react';
import { EASING_POINTS } from '../EasingCurve/EasingCurve';

/* Numbers move to the new value and show the difference once (rule "Motion
 * that shows what happened", item 5, Elleta 21 Nov). Shared by Stat and
 * SystemHealth so both count the same way: motion/duration/450 on
 * motion/easing/out, read from the tokens; reduced motion jumps to the new
 * value. Nothing moves on first paint. */

function bezier([x1, y1, x2, y2]: [number, number, number, number]) {
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

function tokenMs(name: string) {
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

export default function useCountTo(target: number): CountTo {
  const [shown, setShown] = useState(target);
  const [diff, setDiff] = useState<number | null>(null);
  const [changeKey, setChangeKey] = useState(0);
  const from = useRef(target);

  useEffect(() => {
    const start = from.current;
    if (start === target) return;
    from.current = target;
    setDiff(target - start);
    setChangeKey((k) => k + 1);
    const ms = tokenMs('--motion-duration-450');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || ms === 0) {
      setShown(target);
      return;
    }
    const ease = bezier(EASING_POINTS.out);
    const decimals = (String(target).split('.')[1] ?? '').length;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
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
