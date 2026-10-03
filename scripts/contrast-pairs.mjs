#!/usr/bin/env node
// Contrast pairs (brand refresh, 2026-09-22): the declared foreground /
// background pairs, computed from the generated tokens/bella.css in BOTH
// themes, each held to its bar. The a11y notes in the token metadata are
// the record; this is the check that the record is still true. Part of
// `npm run gate`.

import { readFileSync } from 'node:fs';

const css = readFileSync('tokens/bella.css', 'utf8');

function block(selectorRe) {
  const m = css.match(selectorRe);
  if (!m) throw new Error(`contrast-pairs: block ${selectorRe} not found in bella.css`);
  const start = m.index + m[0].length;
  let depth = 1;
  let i = start;
  while (depth && i < css.length) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') depth--;
    i++;
  }
  const vars = {};
  for (const d of css.slice(start, i - 1).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[d[1]] = d[2].trim();
  return vars;
}

const light = block(/:root\s*\{/);
const dark = { ...light, ...block(/\[data-theme=["']?dark["']?\]\s*\{/) };
const warm = { ...light, ...block(/\[data-theme=["']?warm["']?\]\s*\{/) };

function resolve(vars, name, seen = new Set()) {
  if (seen.has(name)) throw new Error(`cycle at ${name}`);
  seen.add(name);
  const v = vars[name];
  if (v === undefined) throw new Error(`contrast-pairs: ${name} is not defined`);
  const ref = v.match(/^var\((--[\w-]+)\)$/);
  return ref ? resolve(vars, ref[1], seen) : v;
}

function lum(hex) {
  const h = hex.replace('#', '').slice(0, 6);
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const l = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/* [label, foreground var, background var, minimum, themes] */
const AAA = 7;
const AA = 4.5;
const NON_TEXT = 3;
const PAIRS = [
  ['ink text on the page', '--color-semantic-text-primary', '--color-semantic-background', AAA],
  ['ink text on panel', '--color-semantic-text-primary', '--color-semantic-surface-card', AAA],
  ['muted text on the page', '--color-semantic-text-secondary', '--color-semantic-background', AAA],
  ['muted text on panel', '--color-semantic-text-secondary', '--color-semantic-surface-card', AAA],
  ['muted text on inset', '--color-semantic-text-secondary', '--color-semantic-surface-inset', AAA],
  ['muted text on raised', '--color-semantic-text-secondary', '--color-semantic-surface-elevated', AAA],
  ['ink text on an ochre fill', '--color-semantic-text-on-accent', '--color-semantic-accent', AAA],
  ['link on the page', '--color-semantic-link', '--color-semantic-background', AAA],
  ['primary button label on the ink plate', '--component-button-primary-foreground', '--component-button-primary-fill-hi', AAA],
  ['primary button label on the hover plate', '--component-button-primary-foreground', '--component-button-primary-fill-hi-hover', AAA],
  ['secondary button label on panel', '--component-button-secondary-foreground', '--color-semantic-surface-card', AAA],
  ['focus ring on the page', '--color-semantic-focus-ring', '--color-semantic-background', NON_TEXT],
  ['focus ring on panel', '--color-semantic-focus-ring', '--color-semantic-surface-card', NON_TEXT],
  ['control border on the page', '--color-semantic-border-strong', '--color-semantic-background', NON_TEXT],
  ['control border on panel', '--color-semantic-border-strong', '--color-semantic-surface-card', NON_TEXT],
  ['control border on inset', '--color-semantic-border-strong', '--color-semantic-surface-inset', NON_TEXT],
  ['control border on raised', '--color-semantic-border-strong', '--color-semantic-surface-elevated', NON_TEXT],
  ['ink plate against panel', '--component-button-primary-fill-hi', '--color-semantic-surface-card', NON_TEXT],
  ['selected tab bar (ink) on the page', '--component-tabs-indicator', '--color-semantic-background', NON_TEXT],
  ['current nav item: ink on its wash', '--color-semantic-text-primary', '--component-nav-list-current-background', AAA],
  ['score bar (ink) on its track', '--component-score-strip-track-fill', '--component-score-strip-track', NON_TEXT],
  ['ink text on inset', '--color-semantic-text-primary', '--color-semantic-surface-inset', AAA],
  ['selected table row: ink on ochre', '--component-data-table-selected-foreground', '--component-data-table-selected-background', AAA],
  ['table header label on its panel', '--color-semantic-text-secondary', '--component-data-table-header-background', AAA],
  ['drawer text on its panel', '--component-drawer-foreground', '--component-drawer-background', AAA],
  ['stat sparkline (ink) on panel', '--component-stat-trend-stroke', '--color-semantic-surface-card', NON_TEXT],
  ['combobox option text on its list', '--component-combobox-foreground', '--component-combobox-list-background', AAA],
  ['combobox group heading on its list', '--component-combobox-group-foreground', '--component-combobox-list-background', AAA],
  ['combobox active option: ink on ochre', '--component-combobox-active-foreground', '--component-combobox-active-background', AAA],
  ['combobox field border on the page', '--component-combobox-border', '--color-semantic-background', NON_TEXT],
  ['action chip label on the page', '--component-action-chip-foreground', '--color-semantic-background', AAA],
  ['action chip label on its hover wash', '--component-action-chip-foreground', '--component-action-chip-hover-background', AAA],
  ['action chip border on panel', '--component-action-chip-border', '--color-semantic-surface-card', NON_TEXT],
  ['disclosure title on panel', '--component-disclosure-foreground', '--color-semantic-surface-card', AAA],
  ['disclosure summary on panel', '--component-disclosure-meta-foreground', '--color-semantic-surface-card', AA],
  ['neutral status pill label on its inset fill', '--color-semantic-text-secondary', '--color-semantic-surface-inset', AAA],
  ['slider track on panel', '--component-slider-track', '--color-semantic-surface-card', NON_TEXT],
  ['slider fill on panel', '--component-slider-fill', '--color-semantic-surface-card', NON_TEXT],
  ['slider thumb edge on panel', '--component-slider-thumb-border', '--color-semantic-surface-card', NON_TEXT],
  ['page title on the page', '--component-page-header-foreground', '--color-semantic-background', AAA],
  ['page meta and lede on the page', '--component-page-header-meta-foreground', '--color-semantic-background', AAA],
  /* status (2026-09-22): text AA, borders 3:1, on every surface they sit on */
  ['danger text on the page', '--color-semantic-danger-text', '--color-semantic-background', AA],
  ['danger text on panel', '--color-semantic-danger-text', '--color-semantic-surface-card', AA],
  ['danger text on raised', '--color-semantic-danger-text', '--color-semantic-surface-elevated', AA],
  ['danger text on its wash', '--color-semantic-danger-text', '--color-semantic-danger-subtle', AA],
  ['ink text on the danger wash', '--color-semantic-text-primary', '--color-semantic-danger-subtle', AAA],
  ['danger border on panel', '--color-semantic-danger-border', '--color-semantic-surface-card', NON_TEXT],
  ['success text on the page', '--color-semantic-success-text', '--color-semantic-background', AA],
  ['success text on panel', '--color-semantic-success-text', '--color-semantic-surface-card', AA],
  ['success text on raised', '--color-semantic-success-text', '--color-semantic-surface-elevated', AA],
  ['success text on its wash', '--color-semantic-success-text', '--color-semantic-success-subtle', AA],
  ['ink text on the success wash', '--color-semantic-text-primary', '--color-semantic-success-subtle', AAA],
  ['success border on panel', '--color-semantic-success-border', '--color-semantic-surface-card', NON_TEXT],
  /* chip fills carry chip text */
  ['chip text on c1', '--color-chip-text', '--color-chip-c1', AAA],
  ['chip text on c2', '--color-chip-text', '--color-chip-c2', AAA],
  ['chip text on c3', '--color-chip-text', '--color-chip-c3', AAA],
];

/* Surfaces that must stay visibly apart (2026-10-03): a selected wash or
 * an inset the eye cannot find breaks "highlight, never dim". A low floor,
 * not a text bar: these are fills, not marks. */
const APART = 1.08;
const DISTINCT = [
  ['selected wash vs panel', '--color-semantic-accent-subtle', '--color-semantic-surface-card'],
  ['selected wash vs the page', '--color-semantic-accent-subtle', '--color-semantic-background'],
  ['inset vs panel', '--color-semantic-surface-inset', '--color-semantic-surface-card'],
];

/* Pairs that must stay BELOW a bar: the rule forbids them, and the check
 * proves the rule is still needed (ochre as text or a hairline on light). */
const FORBIDDEN_LIGHT = [
  ['ochre as text on white (forbidden)', '--color-brand-ochre', '--color-light-bg', 4.5],
  ['ochre as a line on panel (forbidden, use ochre-deep)', '--color-brand-ochre', '--color-light-panel', NON_TEXT],
];

const failures = [];
const lines = [];
for (const [theme, vars] of [['light', light], ['dark', dark], ['warm', warm]]) {
  for (const [label, fg, bg, min] of PAIRS) {
    const r = ratio(resolve(vars, fg), resolve(vars, bg));
    lines.push(`${theme.padEnd(5)} ${r.toFixed(2).padStart(6)}:1  >= ${min}  ${label}`);
    if (r < min) failures.push(`${theme}: ${label} is ${r.toFixed(2)}:1, needs ${min}:1 (${fg} on ${bg})`);
  }
}
for (const [theme, vars] of [['light', light], ['dark', dark], ['warm', warm]]) {
  for (const [label, a, b] of DISTINCT) {
    const r = ratio(resolve(vars, a), resolve(vars, b));
    lines.push(`${theme.padEnd(5)} ${r.toFixed(2).padStart(6)}:1  >= ${APART}  ${label}`);
    if (r < APART) failures.push(`${theme}: ${label} is ${r.toFixed(2)}:1, the eye cannot find it (needs ${APART}:1; ${a} vs ${b})`);
  }
}
for (const [label, fg, bg, under] of FORBIDDEN_LIGHT) {
  const r = ratio(resolve(light, fg), resolve(light, bg));
  lines.push(`light ${r.toFixed(2).padStart(6)}:1  <  ${under}  ${label}`);
  if (r >= under) failures.push(`light: ${label} now passes (${r.toFixed(2)}:1); the rule forbidding it needs review`);
}

if (process.argv.includes('--verbose')) console.log(lines.join('\n'));
if (failures.length) {
  console.error(`contrast pairs: ${failures.length} failing\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log(`contrast pairs: ${(PAIRS.length + DISTINCT.length) * 3 + FORBIDDEN_LIGHT.length} checked (light, dark, warm), OK`);
