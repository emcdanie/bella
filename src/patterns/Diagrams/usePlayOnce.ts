import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/**
 * Play once when in view, then hold (style unify, 2026-09-22).
 *
 * The static render is the FINISHED frame. Once mounted, `armed` hides what
 * the reveal will draw (motion-allowed only), and `playing` runs the reveal
 * from its first keyframe when the element is in view. An element already in
 * view at mount plays straight away, before paint, so it never shows a blank
 * armed frame. No JavaScript and reduced motion both show the finished
 * diagram, and a screenshot with animations disabled fast-forwards to it.
 */
export function usePlayOnce<T extends Element>(threshold = 0.5) {
  const ref = useRef<T | null>(null);
  const [run, setRun] = useState(0);
  const [armed, setArmed] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setArmed(true);
    const r = el.getBoundingClientRect();
    const visible = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    if (r.height > 0 && visible / r.height >= threshold) {
      setRun(1);
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setRun(1);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setRun((n) => n + 1);
          io.disconnect();
        }
      },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  const replay = useCallback(() => setRun((n) => n + 1), []);

  /* `run` doubles as a React key: a new value remounts the animated layer,
     which restarts every CSS animation from its first keyframe */
  return { ref, armed, playing: run > 0, run, replay };
}
