// scratch: same maths as scripts/contrast-pairs.mjs; deleted after the run
import { readFileSync } from 'node:fs';
const css = readFileSync('tokens/bella.css', 'utf8');
function block(re) {
  const m = css.match(re);
  const start = m.index + m[0].length;
  let depth = 1, i = start;
  while (depth && i < css.length) { if (css[i] === '{') depth++; else if (css[i] === '}') depth--; i++; }
  const vars = {};
  for (const d of css.slice(start, i - 1).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[d[1]] = d[2].trim();
  return vars;
}
const base = block(/:root,\s*\[data-theme="bella-light"\]\s*\{/);
const THEMES = {
  'bella-light': base,
  'bella-dark': { ...base, ...block(/\[data-theme="bella-dark"\]\s*\{/) },
  'chip-light': { ...base, ...block(/\[data-theme="chip-light"\]\s*\{/) },
  'chip-dark': { ...base, ...block(/\[data-theme="chip-dark"\]\s*\{/) },
};
function resolve(vars, name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`cycle ${name}`);
  seen.add(name);
  const v = vars[name];
  if (v === undefined) throw new Error(`${name} undefined`);
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  return ref ? resolve(vars, ref[1], seen) : v;
}
function lum(hex) {
  const h = hex.replace('#', '').slice(0, 6);
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const l = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
function colour(vars, spec) {
  const [top, under] = spec.split(' over ');
  const t = resolve(vars, top).replace('#', '');
  if (!under) {
    if (t.length === 8 && t.slice(6) !== 'ff') throw new Error(`${top} translucent`);
    return '#' + t.slice(0, 6);
  }
  const b = colour(vars, under).replace('#', '');
  const a = t.length === 8 ? parseInt(t.slice(6, 8), 16) / 255 : 1;
  return '#' + [0, 2, 4].map((i) => Math.round(parseInt(t.slice(i, i + 2), 16) * a + parseInt(b.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, '0')).join('');
}
const c = (n) => `--color-${n}`;
const S = c('background-surface'), D = c('background-default');
const over = (x, g) => `${x} over ${g}`;
const P = [
  ['nav hover: content-default on nav hover over surface', c('content-default'), over('--nav-list-hover-background', S)],
  ['nav hover: content-subtle on nav hover over surface', c('content-subtle'), over('--nav-list-hover-background', S)],
  ['nav current: label colour on current fill over surface', '--nav-list-label-color', over('--nav-list-current-background', S)],
  ['nav current: content-subtle on current fill over surface', c('content-subtle'), over('--nav-list-current-background', S)],
  ['search: content-default on highlight over default', c('content-default'), over(c('background-highlight'), D)],
  ['search: content-default on highlight over surface', c('content-default'), over(c('background-highlight'), S)],
  ['search: content-body on highlight over default', c('content-body'), over(c('background-highlight'), D)],
  ['search: content-body on highlight over surface', c('content-body'), over(c('background-highlight'), S)],
  ['search: content-subtle on highlight over default', c('content-subtle'), over(c('background-highlight'), D)],
  ['search: content-subtle on highlight over surface', c('content-subtle'), over(c('background-highlight'), S)],
  ['content-default on brand-subtle over surface', c('content-default'), over(c('background-brand-subtle'), S)],
  ['content-subtle on brand-subtle over surface', c('content-subtle'), over(c('background-brand-subtle'), S)],
  ['content-default on brand-subtle over default', c('content-default'), over(c('background-brand-subtle'), D)],
  ['content-default on brand-subtle-hover over default', c('content-default'), over(c('background-brand-subtle-hover'), D)],
  ['content-subtle on brand-subtle-hover over surface', c('content-subtle'), over(c('background-brand-subtle-hover'), S)],
  ['step current edge: border-utility-info on info wash over surface', c('border-utility-info'), over(c('background-utility-info'), S)],
  ['pin solid red: on-accent-1 on error-knockout', c('content-on-accent-1'), c('background-utility-error-knockout')],
  ['pin solid red: error-knockout vs surface (ring edge)', c('background-utility-error-knockout'), S],
  ['warning mark vs surface', c('background-utility-warning-mark'), S],
  ['warning mark vs warning wash over surface', c('background-utility-warning-mark'), over(c('background-utility-warning'), S)],
  ['border-subtle track vs surface', c('border-subtle'), S],
  ['border-default vs surface', c('border-default'), S],
  ['border-strong vs surface', c('border-strong'), S],
  ['border-brand vs surface', c('border-brand'), S],
  ['border-utility-success vs border-subtle track', c('border-utility-success'), c('border-subtle')],
  ['border-brand vs border-subtle track', c('border-brand'), c('border-subtle')],
  ['content-subtle on default', c('content-subtle'), D],
  ['content-body on default', c('content-body'), D],
  ['content-default on lane', c('content-default'), c('background-lane')],
];
for (const l of ['error', 'success', 'info', 'warning', 'neutral'])
  P.push([`dot ${l}: border-utility-${l} vs its wash over surface`, c(`border-utility-${l}`), over(c(`background-utility-${l}`), S)]);
const out = {};
for (const [label, fg, bg] of P) {
  const row = Object.entries(THEMES).map(([t, v]) => { try { return [t, ratio(colour(v, fg), colour(v, bg))]; } catch (e) { return [t, NaN]; } });
  const min = Math.min(...row.map((r) => r[1]));
  console.log(`${min.toFixed(2).padStart(6)} min | ${row.map(([t, r]) => `${t.replace('-light', 'L').replace('-dark', 'D')} ${r.toFixed(2)}`).join('  ')} | ${label}`);
}
