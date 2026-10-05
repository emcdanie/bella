#!/usr/bin/env node
// Contrast pairs (brand refresh, 2026-09-22): the declared foreground /
// background pairs, computed from the generated tokens/bella.css in BOTH
// themes, each held to its bar. The a11y notes in the token metadata are
// the record; this is the check that the record is still true. Part of
// `npm run gate`.

import { readFileSync, readdirSync } from 'node:fs';

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

/* A background may be a translucent wash composited over a surface:
 * '<wash var> over <surface var>' (highlight, 2026-10-05). The wash is
 * an 8-digit hex; the composite is what the eye sees. */
function colour(vars, spec) {
  const [top, base] = spec.split(' over ');
  if (!base) return resolve(vars, top);
  const t = resolve(vars, top).replace('#', '');
  const b = resolve(vars, base).replace('#', '').slice(0, 6);
  const a = t.length === 8 ? parseInt(t.slice(6, 8), 16) / 255 : 1;
  return '#' + [0, 2, 4].map((i) => Math.round(parseInt(t.slice(i, i + 2), 16) * a + parseInt(b.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, '0')).join('');
}

/* [label, foreground var, background var, minimum, themes] */
const AAA = 7;
const AA = 4.5;
const NON_TEXT = 3;
const PAIRS = [
  ['ink text on the page', '--color-semantic-text-primary', '--color-semantic-background', AAA],
  ['ink text on panel', '--color-semantic-text-primary', '--color-semantic-surface-card', AAA],
  ['body text on the page', '--color-semantic-text-body', '--color-semantic-background', AAA],
  ['body text on the card', '--color-semantic-text-body', '--color-semantic-surface-card', AAA],
  ['body text on inset', '--color-semantic-text-body', '--color-semantic-surface-inset', AAA],
  ['body text on raised', '--color-semantic-text-body', '--color-semantic-surface-elevated', AAA],
  ['muted text on the page', '--color-semantic-text-secondary', '--color-semantic-background', AAA],
  ['muted text on panel', '--color-semantic-text-secondary', '--color-semantic-surface-card', AAA],
  ['muted text on inset', '--color-semantic-text-secondary', '--color-semantic-surface-inset', AAA],
  ['muted text on raised', '--color-semantic-text-secondary', '--color-semantic-surface-elevated', AAA],
  /* three surface levels (2026-10-03): body text stays AAA on ground and raised in every theme */
  ['ink text on ground', '--color-semantic-text-primary', '--color-semantic-ground', AAA],
  ['ink text on the raised surface', '--color-semantic-text-primary', '--color-semantic-raised', AAA],
  ['muted text on the raised surface', '--color-semantic-text-secondary', '--color-semantic-raised', AAA],
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
  ['quiet action chip label on its hover fill', '--component-action-chip-foreground', '--component-action-chip-quiet-hover-background', AAA],
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
  /* highlight (2026-10-05): the lit state is the ochre wash + a 2px edge,
   * never colour alone. Text on the wash AAA, the edge 3:1 against the
   * wash it sits on and the surface beside it, on ground, card and inset. */
  ...['background', 'surface-card', 'surface-inset'].flatMap((s) => [
    [`text on the highlight wash over ${s}`, '--color-semantic-highlight-text', `--color-semantic-highlight-wash over --color-semantic-${s}`, AAA],
    [`highlight edge on the wash over ${s}`, '--color-semantic-highlight-edge', `--color-semantic-highlight-wash over --color-semantic-${s}`, NON_TEXT],
    [`highlight edge beside ${s}`, '--color-semantic-highlight-edge', `--color-semantic-${s}`, NON_TEXT],
  ]),
  /* chip fills carry chip text */
  ['chip text on c1', '--color-chip-text', '--color-chip-c1', AAA],
  ['chip text on c2', '--color-chip-text', '--color-chip-c2', AAA],
  ['chip text on c3', '--color-chip-text', '--color-chip-c3', AAA],
];

/* Surfaces that must stay visibly apart (2026-10-03): a selected wash the
 * eye cannot find breaks "highlight, never dim". A low floor, not a text
 * bar: these are fills, not marks. The inset fill left this list on
 * 2026-10-04 (Elleta): it is decorative, and where it bounds a field the
 * edge carries the boundary (border-strong, 3:1 on inset and on the card,
 * the pairs above). See the inset rule below. */
const APART = 1.08;
const DISTINCT = [
  ['selected wash vs panel', '--color-semantic-accent-subtle', '--color-semantic-surface-card'],
  ['selected wash vs the page', '--color-semantic-accent-subtle', '--color-semantic-background'],
];

/* Pairs that must stay BELOW a bar: the rule forbids them, and the check
 * proves the rule is still needed (ochre as text or a hairline on light). */
const FORBIDDEN_LIGHT = [
  ['ochre as text on white (forbidden)', '--color-brand-ochre', '--color-light-bg', 4.5],
  ['ochre as a line on panel (forbidden, use ochre-deep)', '--color-brand-ochre', '--color-light-panel', NON_TEXT],
  ['muted text on ground (forbidden in light and warm: AA, not AAA; meta sits on raised)', '--color-light-muted', '--color-light-line', 7],
];

const failures = [];
const lines = [];

/* The inset rule (Elleta, 2026-10-04). The inset fill is decorative; the
 * edge carries the boundary. Every rule in src/components and src/patterns
 * that paints a background from surface-inset (directly or through a
 * component token that is surface-inset) is classified here:
 * - a field you type or choose in (Input, Select, Combobox, Textarea) on
 *   inset must carry border-strong in the same rule, or the gate fails;
 * - INSET_EXEMPT lists every other consumer with its reason;
 * - anything else is unclassified and fails until it is added to one list.
 * src/docs (Storybook docs chrome) is out of scope. */
const INSET_FIELDS = /^src\/components\/(Input|Select|Combobox|Textarea)\//;
const INSET_EXEMPT = {
  'src/patterns/BeforeAfterFrame/BeforeAfterFrame.module.css :: .stage': 'decorative container around a screen, not a control',
  'src/components/Tag/Tag.module.css :: .tag': 'identified by its text, not the fill',
  'src/components/StatusPill/StatusPill.module.css :: .neutral': 'identified by its text, not the fill',
  'src/components/Kbd/Kbd.module.css :: .key': 'identified by its key label, not the fill',
  'src/components/Avatar/Avatar.module.css :: .avatar': 'identified by its initials or image, not the fill',
  'src/components/Input/Input.module.css :: .field:disabled': 'disabled state fill: the disabled styling carries it',
  'src/components/Button/Button.module.css :: .button:disabled': 'disabled state fill: the disabled styling carries it',
  'src/components/Button/Button.module.css :: .secondary:active:not(:disabled)': 'active state fill: the press is the state marker',
  'src/components/NavList/NavList.module.css :: .item:hover': 'hover state fill: transient, the item text carries it',
  'src/components/ActionChip/ActionChip.module.css :: .quiet:hover, .quiet:focus-visible': 'hover and focus state fill: the focus ring and icon carry it',
};
{
  const comp = JSON.parse(readFileSync('tokens/component.json', 'utf8')).component;
  const varsOf = (target) => {
    const out = [];
    const walk = (o, p) => {
      if (!o || typeof o !== 'object') return;
      if ('$value' in o) { if (o.$value === target) out.push(`--component-${p.join('-')}`); return; }
      for (const [k, v] of Object.entries(o)) if (k !== '$extensions') walk(v, [...p, k]);
    };
    walk(comp, []);
    return out;
  };
  const insetVars = ['--color-semantic-surface-inset', ...varsOf('{color.semantic.surface-inset}')];
  const strongVars = ['--color-semantic-border-strong', ...varsOf('{color.semantic.border-strong}')];
  const insetBg = new RegExp(`background(-color)?\\s*:[^;]*var\\((${insetVars.join('|')})\\)`);
  const insetInline = new RegExp(`background(Color)?\\s*:\\s*['"\`][^'"\`]*var\\((${insetVars.join('|')})\\)`);
  const strongEdge = new RegExp(`(border|box-shadow|outline)[a-z-]*\\s*:[^;]*var\\((${strongVars.join('|')})\\)`);
  const cssRules = (css) => {
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const out = [];
    const stack = [];
    let buf = '';
    for (const ch of css) {
      if (ch === '{') { stack.push(buf.trim()); buf = ''; }
      else if (ch === '}') { const sel = stack.pop(); if (buf.trim()) out.push([sel.replace(/\s+/g, ' '), buf]); buf = ''; }
      else buf += ch;
    }
    return out;
  };
  const seen = new Set();
  for (const root of ['src/components', 'src/patterns']) {
    for (const rel of readdirSync(root, { recursive: true })) {
      const file = `${root}/${rel}`;
      if (file.endsWith('.css')) {
        for (const [sel, body] of cssRules(readFileSync(file, 'utf8'))) {
          if (!insetBg.test(body)) continue;
          const key = `${file} :: ${sel}`;
          seen.add(key);
          if (INSET_EXEMPT[key]) { lines.push(`inset  exempt  ${key} (${INSET_EXEMPT[key]})`); continue; }
          if (INSET_FIELDS.test(file)) {
            if (strongEdge.test(body)) lines.push(`inset  field   ${key} carries border-strong`);
            else failures.push(`inset: ${key} is a field on the inset fill without border-strong in the same rule (the edge carries the boundary)`);
            continue;
          }
          failures.push(`inset: ${key} paints the inset fill and is unclassified: add border-strong as a field, or list it in INSET_EXEMPT with a reason`);
        }
      } else if (file.endsWith('.tsx') && !file.endsWith('.stories.tsx') && insetInline.test(readFileSync(file, 'utf8'))) {
        failures.push(`inset: ${file} paints the inset fill in an inline style; move it to CSS and classify it`);
      }
    }
  }
  for (const key of Object.keys(INSET_EXEMPT)) {
    if (!seen.has(key)) failures.push(`inset: INSET_EXEMPT lists ${key}, which no longer paints the inset fill; remove the entry`);
  }
}
for (const [theme, vars] of [['light', light], ['dark', dark], ['warm', warm]]) {
  for (const [label, fg, bg, min] of PAIRS) {
    const r = ratio(colour(vars, fg), colour(vars, bg));
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
console.log(`contrast pairs: ${(PAIRS.length + DISTINCT.length) * 3 + FORBIDDEN_LIGHT.length} checked (light, dark, warm), OK; inset rule: ${Object.keys(INSET_EXEMPT).length} exempt, every consumer classified`);
