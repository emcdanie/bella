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
  variant?: 'yellow' | 'pink' | 'blue' | 'red' | 'neutral';
  /** Figma "style". dashed (default; doc pages) or solid (the stage, 1px, rounded 8 bends). */
  lineStyle?: 'dashed' | 'solid';
  /** Figma "selected": a 2px ink line, to the part whose card is open. */
  selected?: boolean;
  /** How the line lands: a solid arrowhead or a dot. */
  end?: 'arrow' | 'dot';
  /** Extra classes on the SVG. */
  className?: string;
  style?: CSSProperties;
}

const NS = 'http://www.w3.org/2000/svg';

/* An elbow through points with each bend rounded 8 (Figma: "one rounded 8
   bend", guideline 17), never more than half of either segment. */
function rounded(pts: [number, number][]): string {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [cx, cy] = pts[i], [nx, ny] = pts[i + 1];
    const l1 = Math.hypot(cx - px, cy - py), l2 = Math.hypot(nx - cx, ny - cy);
    const r = Math.min(8, l1 / 2, l2 / 2);
    if (r < 0.5) { d += ` L${cx} ${cy}`; continue; }
    const ax = cx - ((cx - px) / l1) * r, ay = cy - ((cy - py) / l1) * r;
    const bx = cx + ((nx - cx) / l2) * r, by = cy + ((ny - cy) / l2) * r;
    d += ` L${ax} ${ay} Q${cx} ${cy} ${bx} ${by}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L${last[0]} ${last[1]}`;
}

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
  lineStyle = 'dashed',
  selected = false,
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
      /* the end mark: spacing-8 (its own --component-leader-end-size was lost in the
         17 Nov token pipeline, so every arrow and dot drew nothing; Figma draws the dot 10, no token) */
      const size = parseFloat(getComputedStyle(svg).getPropertyValue('--spacing-8'));
      const parts: SVGElement[] = [];
      const add = (name: string, cls: string, attrs: Record<string, string | number>) => {
        const el = document.createElementNS(NS, name);
        el.setAttribute('class', cls);
        for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
        parts.push(el);
      };
      const sideways = b.left >= a.right || a.left >= b.right;
      if (lineStyle === 'solid' && sideways) {
        /* the stage (Elleta, 20 Nov: "these annotations are not correct .."): out of the
           label's near side, across, then at most one rounded bend onto the point on the
           part's edge (Figma route straight / bend up / bend down). The end mark sits on
           the part. Level within a pixel: one straight line. */
        const bx = b.left + b.width / 2 - h.left;
        const by = b.top + b.height / 2 - h.top;
        const dir = bx >= a.right - h.left ? 1 : -1;
        const ax = (dir > 0 ? a.right : a.left) - h.left;
        const ay = a.top + a.height / 2 - h.top;
        const level = Math.abs(by - ay) < 1;
        add('path', styles.line, { d: rounded(level ? [[ax, by], [bx, by]] : [[ax, ay], [bx, ay], [bx, by]]) });
        if (end === 'arrow') {
          const v = level ? 0 : by > ay ? 1 : -1;
          add('path', styles.arrow, {
            d: level
              ? `M${bx - dir * size} ${by - size / 2} L${bx} ${by} L${bx - dir * size} ${by + size / 2}`
              : `M${bx - size / 2} ${by - v * size} L${bx} ${by} L${bx + size / 2} ${by - v * size}`,
          });
        } else {
          add('circle', styles.dot, { cx: bx, cy: by, r: size / 2 });
        }
      } else if (sideways) {
        const dir = b.left >= a.right ? 1 : -1;
        const x1 = (dir > 0 ? a.right : a.left) - h.left;
        const x2 = (dir > 0 ? b.left : b.right) - h.left;
        const y1 = a.top + a.height / 2 - h.top;
        const y2 = b.top + b.height / 2 - h.top;
        const mx = (x1 + x2) / 2;
        add('path', styles.line, { d: lineStyle === 'solid' ? rounded([[x1, y1], [mx, y1], [mx, y2], [x2, y2]]) : `M${x1} ${y1} H${mx} V${y2} H${x2}` });
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
        add('path', styles.line, { d: lineStyle === 'solid' ? rounded([[x1, y1], [x1, my], [x2, my], [x2, y2]]) : `M${x1} ${y1} V${my} H${x2} V${y2}` });
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
  }, [from, to, end, lineStyle]);

  return (
    <svg
      ref={ref}
      className={[styles.leader, styles[variant], lineStyle === 'solid' ? styles.solid : '', selected ? styles.selected : '', className].filter(Boolean).join(' ')}
      style={style}
      role="img"
      aria-label={label}
      data-bella-component="leader"
      data-bella-diagram
    />
  );
}
