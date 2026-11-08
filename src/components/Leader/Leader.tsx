import React, { useEffect, useRef, type CSSProperties } from 'react';
import styles from './Leader.module.css';

export interface LeaderProps {
  /** Selector of the element the line starts at, inside the same positioned parent. */
  from: string;
  /** Selector of the element the line ends at, inside the same positioned parent. */
  to: string;
  /** What the line ties together, for assistive tech: "Pin 1 points to the focus ring". */
  label: string;
  /** The pop colour of the line: match its Pin. */
  variant?: 'yellow' | 'pink' | 'blue' | 'red';
  /** How the line lands: a solid arrowhead or a dot. */
  end?: 'arrow' | 'dot';
  /** Extra classes on the SVG. */
  className?: string;
  style?: CSSProperties;
}

const NS = 'http://www.w3.org/2000/svg';

/**
 * A dashed elbow line, measured from one element to another, from the site's
 * hero leaders (elleta.design). It goes sideways when its ends are side by
 * side and down when they are stacked, and redraws when anything resizes.
 * A labelled image, like every diagram in BELLA, because the line is meaning too.
 */
export default function Leader({
  from,
  to,
  label,
  variant = 'pink',
  end = 'arrow',
  className,
  style,
}: LeaderProps) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    const host = svg?.parentElement;
    if (!svg || !host) return undefined;
    let raf = 0;

    const draw = () => {
      raf = 0;
      const a = host.querySelector(from)?.getBoundingClientRect();
      const b = host.querySelector(to)?.getBoundingClientRect();
      if (!a || !b) {
        svg.replaceChildren();
        return;
      }
      const h = host.getBoundingClientRect();
      const size = parseFloat(getComputedStyle(svg).getPropertyValue('--component-leader-end-size'));
      const parts: SVGElement[] = [];
      const add = (name: string, cls: string, attrs: Record<string, string | number>) => {
        const el = document.createElementNS(NS, name);
        el.setAttribute('class', cls);
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
        parts.push(el);
      };
      const sideways = b.left >= a.right || a.left >= b.right;
      if (sideways) {
        const dir = b.left >= a.right ? 1 : -1;
        const x1 = (dir > 0 ? a.right : a.left) - h.left;
        const x2 = (dir > 0 ? b.left : b.right) - h.left;
        const y1 = a.top + a.height / 2 - h.top;
        const y2 = b.top + b.height / 2 - h.top;
        const mx = (x1 + x2) / 2;
        add('path', styles.line, { d: `M${x1} ${y1} H${mx} V${y2} H${x2}` });
        if (end === 'arrow') {
          add('path', styles.arrow, { d: `M${x2 - dir * size} ${y2 - size / 2} L${x2} ${y2} L${x2 - dir * size} ${y2 + size / 2}` });
        } else {
          add('circle', styles.dot, { cx: x2, cy: y2, r: size / 2 });
        }
      } else {
        const dir = b.top >= a.bottom ? 1 : -1;
        const y1 = (dir > 0 ? a.bottom : a.top) - h.top;
        const y2 = (dir > 0 ? b.top : b.bottom) - h.top;
        const x1 = a.left + a.width / 2 - h.left;
        const x2 = b.left + b.width / 2 - h.left;
        const my = (y1 + y2) / 2;
        add('path', styles.line, { d: `M${x1} ${y1} V${my} H${x2} V${y2}` });
        if (end === 'arrow') {
          add('path', styles.arrow, { d: `M${x2 - size / 2} ${y2 - dir * size} L${x2} ${y2} L${x2 + size / 2} ${y2 - dir * size}` });
        } else {
          add('circle', styles.dot, { cx: x2, cy: y2, r: size / 2 });
        }
      }
      svg.replaceChildren(...parts);
    };

    const queue = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };
    draw();
    const ro = new ResizeObserver(queue);
    ro.observe(host);
    for (const sel of [from, to]) {
      const el = host.querySelector(sel);
      if (el) ro.observe(el);
    }
    window.addEventListener('resize', queue);
    document.fonts?.ready.then(queue);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', queue);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [from, to, end]);

  return (
    <svg
      ref={ref}
      className={[styles.leader, styles[variant], className].filter(Boolean).join(' ')}
      style={style}
      role="img"
      aria-label={label}
      data-bella-component="leader"
      data-bella-diagram
    />
  );
}
