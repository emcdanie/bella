/* The brand pattern and the wordmark glyphs, plain JS so the components
 * (through pattern.ts) and scripts/build-favicons.mjs share one generator
 * (brand refresh, 2026-09-22). Ported from docs/reference/wordmark-draft.html.
 * Deterministic: the same seed always draws the same pattern (Park-Miller
 * LCG, as in the reference). Colours are passed in; pattern.ts passes the
 * color.pattern.* tokens. */

function makeRng(seed) {
  let s = Math.max(1, Math.floor(seed)) % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const f = (n) => n.toFixed(1);

/** Every shape of the pattern for a W x H field, in paint order. */
export function patternShapesWith(W, H, seed, C) {
  const rng = makeRng(seed);
  const out = [{ d: `M0 0 H${W} V${H} H0 Z`, fill: C.ochre }];

  const tstroke = (x, y, len, ang, w, c) => {
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
  const patch = (cx, cy, r, c) => {
    let d = '';
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + rng() * 0.5;
      const rr = r * (0.55 + rng() * 0.8);
      d += `${i ? ' L ' : 'M '}${(cx + Math.cos(a) * rr).toFixed(0)} ${(cy + Math.sin(a) * rr).toFixed(0)}`;
    }
    out.push({ d: `${d} Z`, fill: c });
  };
  const spots = (cx, cy, r, c, n, sz) => {
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
  const rosettes = (cx, cy, r, c, n) => {
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


export const GLYPHS = {
  E: { w: 76, d: 'M76 10 H10 V90 H76 M10 66 H62' },
  L: { w: 72, d: 'M10 0 V90 H72' },
  T: { w: 84, d: 'M0 10 H84 M42 10 V100' },
  A: { w: 90, d: 'M10 100 V42 Q10 10 42 10 H48 Q80 10 80 42 V100 M10 66 H80' },
  B: { w: 84, d: 'M10 0 V100 M10 10 H48 Q74 10 74 38 Q74 66 48 66 H10 M10 66 H58 Q80 66 80 78 Q80 90 58 90 H10' },
};

/** Locked settings (Elleta, 2026-09-22): weight 12, width 58, height 130,
 * tracking 16, soft corners. */
export const LOCK = { weight: 12, width: 58, height: 130, tracking: 16 };

function scaleD(d, sx, dx, sy, sw) {
  const Y = (v) => (v <= 0 ? 0 : v >= 100 ? 100 * sy : sw / 2 + ((v - 10) * (100 * sy - sw)) / 80);
  return d.replace(/([MLHVQ])([^MLHVQ]*)/g, (_m, c, a) => {
    const n = a.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (c === 'H') return `H${(n[0] * sx + dx).toFixed(1)} `;
    if (c === 'V') return `V${Y(n[0]).toFixed(1)} `;
    return `${c}${n.map((v, i) => (i % 2 ? Y(v).toFixed(1) : (v * sx + dx).toFixed(1))).join(' ')} `;
  });
}

/** The stroke paths for a word at the locked settings, and its viewBox size. */
export function wordPaths(word) {
  const sx = LOCK.width / 100;
  const sy = LOCK.height / 100;
  const sw = LOCK.weight;
  let x = sw / 2 + 2;
  const paths = [];
  for (const ch of word) {
    const g = GLYPHS[ch];
    if (!g) throw new Error(`BrandWordmark: no glyph for "${ch}" (E, L, T, A, B only)`);
    paths.push(scaleD(g.d, sx, x, sy, sw));
    x += g.w * sx + LOCK.tracking;
  }
  return { paths, width: x - LOCK.tracking + sw / 2 + 2, height: 100 * sy, strokeWidth: sw };
}
