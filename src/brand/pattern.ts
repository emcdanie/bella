import tokens from '../../tokens/bella.json';

/* The brand pattern and the wordmark glyphs (brand refresh, 2026-09-22).
 * Ported from docs/reference/wordmark-draft.html and footer-mock.html.
 *
 * The pattern is an animal-print collage: tiger-blue strokes on ochre,
 * leopard on pink, zebra on lime, cream patches with rosettes, ink brush
 * lines, a few coral spots. It is deterministic: the same seed always
 * draws the same pattern (Park-Miller LCG, as in the reference). Colours
 * come from the color.pattern.* primitives, never literals here. */

type Tok = { $value: string };
const P = (tokens as unknown as { primitive: { color: { pattern: Record<string, Tok> } } }).primitive.color.pattern;
const C = {
  ochre: P.ground.$value,
  blue: P.tiger.$value,
  cream: P.cream.$value,
  pale: P.rosette.$value,
  pink: P.pink.$value,
  leaf: P.leopard.$value,
  lime: P.zebra.$value,
  limeL: P['zebra-light'].$value,
  ink: P.ink.$value,
  coral: P.coral.$value,
};

export interface Shape {
  d: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
}

function makeRng(seed: number) {
  let s = Math.max(1, Math.floor(seed)) % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const f = (n: number) => n.toFixed(1);

/** Every shape of the pattern for a W x H field, in paint order. */
export function patternShapes(W: number, H: number, seed: number): Shape[] {
  const rng = makeRng(seed);
  const out: Shape[] = [{ d: `M0 0 H${W} V${H} H0 Z`, fill: C.ochre }];

  const tstroke = (x: number, y: number, len: number, ang: number, w: number, c: string) => {
    const x2 = x + Math.cos(ang) * len;
    const y2 = y + Math.sin(ang) * len;
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    const bend = (rng() - 0.5) * len * 0.5;
    const mx = (x + x2) / 2 + nx * bend;
    const my = (y + y2) / 2 + ny * bend;
    out.push({
      d: `M${f(x)} ${f(y)} Q${f(mx + nx * w)} ${f(my + ny * w)} ${f(x2)} ${f(y2)} Q${f(mx - nx * w * 0.4)} ${f(my - ny * w * 0.4)} ${f(x)} ${f(y)} Z`,
      fill: c,
    });
  };
  const patch = (cx: number, cy: number, r: number, c: string) => {
    let d = '';
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + rng() * 0.5;
      const rr = r * (0.55 + rng() * 0.8);
      d += `${i ? ' L ' : 'M '}${(cx + Math.cos(a) * rr).toFixed(0)} ${(cy + Math.sin(a) * rr).toFixed(0)}`;
    }
    out.push({ d: `${d} Z`, fill: c });
  };
  const spots = (cx: number, cy: number, r: number, c: string, n: number, sz: number) => {
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2;
      const dd = Math.sqrt(rng()) * r;
      const x = cx + Math.cos(a) * dd;
      const y = cy + Math.sin(a) * dd;
      const s = sz * (0.6 + rng() * 0.8);
      out.push({
        d: `M${f(x - s)} ${f(y)} q${f(s * 0.3)} ${f(-s * 1.1)} ${f(s * 1.2)} ${f(-s * 0.6)} q${f(s * 0.9)} ${f(s * 0.5)} ${f(s * 0.3)} ${f(s * 1.3)} q${f(-s * 0.9)} ${f(s * 0.5)} ${f(-s * 1.5)} ${f(-s * 0.7)}z`,
        fill: c,
      });
    }
  };
  const rosettes = (cx: number, cy: number, r: number, c: string, n: number) => {
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2;
      const dd = Math.sqrt(rng()) * r;
      const x = cx + Math.cos(a) * dd;
      const y = cy + Math.sin(a) * dd;
      const s = 7 + rng() * 6;
      out.push({ d: `M${f(x - s)} ${f(y)} a${f(s)} ${f(s * 0.8)} 0 1 1 ${f(s * 1.6)} ${f(s * 0.4)}`, stroke: c, strokeWidth: 3.5 });
    }
  };

  for (let i = 0; i < 4; i++) {
    const x = rng() * W;
    const y = rng() * H;
    patch(x, y, 150 + rng() * 80, C.cream);
    rosettes(x, y, 150, C.pale, 55);
  }
  for (let i = 0; i < 3; i++) {
    const x = rng() * W;
    const y = rng() * H;
    patch(x, y, 120 + rng() * 80, C.pink);
    spots(x, y, 130, C.leaf, 60, 13);
  }
  for (let i = 0; i < 2; i++) {
    const x = rng() * W;
    const y = rng() * H;
    const r = 120 + rng() * 70;
    patch(x, y, r, C.lime);
    for (let k = 0; k < 14; k++) tstroke(x - r + rng() * r * 2, y - r + rng() * r * 2, 60 + rng() * 60, -0.9 + rng() * 0.4, 5, C.limeL);
  }
  for (let i = 0; i < 300; i++) {
    tstroke(rng() * W, rng() * H, 40 + rng() * 80, -1.3 + rng() * 1.1, 6 + rng() * 7, C.blue);
  }
  for (let i = 0; i < 9; i++) {
    tstroke(rng() * W, rng() * H, 160 + rng() * 240, rng() * Math.PI * 2, 7 + rng() * 6, C.ink);
  }
  for (let i = 0; i < 2; i++) {
    const x = rng() * W;
    const y = rng() * H;
    patch(x, y, 90, C.pink);
    spots(x, y, 80, C.coral, 20, 9);
  }
  return out;
}

/* ---- the wordmark glyphs ---------------------------------------------- */

/** The five glyphs on a 100-unit cap height (reference draft 3). The E, A
 * and B bars all sit on the same low line, y 66. */
export const GLYPHS = {
  E: { w: 76, d: 'M76 10 H10 V90 H76 M10 66 H62' },
  L: { w: 72, d: 'M10 0 V90 H72' },
  T: { w: 84, d: 'M0 10 H84 M42 10 V100' },
  A: { w: 90, d: 'M10 100 V42 Q10 10 42 10 H48 Q80 10 80 42 V100 M10 66 H80' },
  B: { w: 84, d: 'M10 0 V100 M10 10 H48 Q74 10 74 38 Q74 66 48 66 H10 M10 66 H58 Q80 66 80 78 Q80 90 58 90 H10' },
} as const;

export type Glyph = keyof typeof GLYPHS;

/** Locked settings (Elleta, 2026-09-22): weight 12, width 58, height 130,
 * tracking 16, soft corners. */
export const LOCK = { weight: 12, width: 58, height: 130, tracking: 16 } as const;

function scaleD(d: string, sx: number, dx: number, sy: number, sw: number) {
  const Y = (v: number) => (v <= 0 ? 0 : v >= 100 ? 100 * sy : sw / 2 + ((v - 10) * (100 * sy - sw)) / 80);
  return d.replace(/([MLHVQ])([^MLHVQ]*)/g, (_m, c: string, a: string) => {
    const n = a.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (c === 'H') return `H${(n[0] * sx + dx).toFixed(1)} `;
    if (c === 'V') return `V${Y(n[0]).toFixed(1)} `;
    return `${c}${n.map((v, i) => (i % 2 ? Y(v).toFixed(1) : (v * sx + dx).toFixed(1))).join(' ')} `;
  });
}

/** The stroke paths for a word at the locked settings, and its viewBox size. */
export function wordPaths(word: string) {
  const sx = LOCK.width / 100;
  const sy = LOCK.height / 100;
  const sw = LOCK.weight;
  let x = sw / 2 + 2;
  const paths: string[] = [];
  for (const ch of word) {
    const g = GLYPHS[ch as Glyph];
    if (!g) throw new Error(`BrandWordmark: no glyph for "${ch}" (E, L, T, A, B only)`);
    paths.push(scaleD(g.d, sx, x, sy, sw));
    x += g.w * sx + LOCK.tracking;
  }
  return { paths, width: x - LOCK.tracking + sw / 2 + 2, height: 100 * sy, strokeWidth: sw };
}
