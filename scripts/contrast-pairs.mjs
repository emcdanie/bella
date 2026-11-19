#!/usr/bin/env node
// Contrast pairs, computed from the built tokens/bella.css in all four themes
// (BELLA light, BELLA dark, Chip light, Chip dark). Part of `npm run gate`.
// The bar (Elleta, 17 Nov 2026): all text 7:1, status words, labels, code and
// disabled text included; non-text marks 3:1. No pair has a lower bar.
// `--verbose` prints every ratio.

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

const base = block(/:root,\s*\[data-theme="bella-light"\]\s*\{/);
const THEMES = {
  'bella-light': base,
  'bella-dark': { ...base, ...block(/\[data-theme="bella-dark"\]\s*\{/) },
  'chip-light': { ...base, ...block(/\[data-theme="chip-light"\]\s*\{/) },
  'chip-dark': { ...base, ...block(/\[data-theme="chip-dark"\]\s*\{/) },
};

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

/* A translucent fill is composited over what it sits on: '<fill> over <surface>'.
 * Fills that are a tint in some themes (Chip dark: subtle and lane are white at 10%,
 * Elleta, 18 Nov: "A for the dark grey") sit where the parts put them: subtle on a
 * card (the lighter, so the harder case for light text), lane on the page. */
const SITS_ON = { '--color-background-brand-subtle-hover': '--color-background-surface', '--color-background-brand-subtle': '--color-background-surface', '--color-background-subtle': '--color-background-surface', '--color-background-lane': '--color-background-default' };
function colour(vars, spec) {
  let [top, under] = spec.split(' over ');
  if (!under && SITS_ON[top] && resolve(vars, top).replace('#', '').length === 8) under = SITS_ON[top];
  const t = resolve(vars, top).replace('#', '');
  if (!under) {
    if (t.length === 8 && t.slice(6) !== 'ff') throw new Error(`contrast-pairs: ${top} is translucent; say what it sits over`);
    return '#' + t.slice(0, 6);
  }
  const b = colour(vars, under).replace('#', '');
  const a = t.length === 8 ? parseInt(t.slice(6, 8), 16) / 255 : 1;
  return '#' + [0, 2, 4].map((i) => Math.round(parseInt(t.slice(i, i + 2), 16) * a + parseInt(b.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, '0')).join('');
}

const TEXT = 7;
const MARK = 3;
const c = (n) => `--color-${n}`;
const PAGES = ['background-default', 'background-surface', 'background-subtle'];

/* [label, foreground, background, bar] */
const PAIRS = [
  // reading and UI text on every surface it may sit on
  ...['content-default', 'content-body', 'content-subtle', 'content-accent', 'content-link', 'content-brand', 'content-highlight'].flatMap((fg) =>
    PAGES.map((bg) => [`${fg} on ${bg}`, c(fg), c(bg), TEXT])),
  ['content-default on background-default-hover', c('content-default'), c('background-default-hover'), TEXT],
  ['content-default on the highlight over background-default', c('content-default'), `${c('background-highlight')} over ${c('background-default')}`, TEXT],
  ['content-highlight on the highlight over background-surface', c('content-highlight'), `${c('background-highlight')} over ${c('background-surface')}`, TEXT],
  ['content-disabled on background-disabled', c('content-disabled'), c('background-disabled'), TEXT],
  ['content-disabled on background-surface', c('content-disabled'), c('background-surface'), TEXT],
  ['content-lane-subtle on background-lane', c('content-lane-subtle'), c('background-lane'), TEXT],
  // EmptyState (19 Nov 2026): its line on the card and the title on each wash's
  // strongest stop. The line (content/lane-subtle, as Figma) on a wash is 5.3 to
  // 5.5:1 in BELLA dark: reported to the library, not patched in code.
  ['content-lane-subtle on background-surface', c('content-lane-subtle'), c('background-surface'), TEXT],
  ['content-default on the pink wash over background-surface', c('content-default'), `${c('background-wash-pink-strong')} over ${c('background-surface')}`, TEXT],
  ['content-default on the blue wash over background-surface', c('content-default'), `${c('background-wash-blue-strong')} over ${c('background-surface')}`, TEXT],
  ['content-default on the ochre wash over background-surface', c('content-default'), `${c('background-wash-ochre-strong')} over ${c('background-surface')}`, TEXT],
  ['content-default on the navy wash over background-surface', c('content-default'), `${c('background-wash-navy-strong')} over ${c('background-surface')}`, TEXT],
  ['content-default on background-lane', c('content-default'), c('background-lane'), TEXT],
  // BoardLane needs-you (19 Nov 2026): name and order on the warm wash, its edge off the page
  ['content-default on the needs-you wash over background-default', c('content-default'), `${c('background-utility-warning')} over ${c('background-default')}`, TEXT],
  ['content-lane-subtle on the needs-you wash over background-default', c('content-lane-subtle'), `${c('background-utility-warning')} over ${c('background-default')}`, TEXT],
  ['border-utility-warning on background-default', c('border-utility-warning'), c('background-default'), MARK],
  // BoardLane drop space (19 Nov 2026): label and dashed edge on the lane
  ['content-brand on background-lane', c('content-brand'), c('background-lane'), TEXT],
  // text on filled parts
  ['content-knockout on background-knockout', c('content-knockout'), c('background-knockout'), TEXT],
  ['content-brand-knockout on background-brand', c('content-brand-knockout'), c('background-brand'), TEXT],
  ['content-brand-knockout on background-brand-hover', c('content-brand-knockout'), c('background-brand-hover'), TEXT],
  ['content-brand on background-brand-subtle', c('content-brand'), c('background-brand-subtle'), TEXT],
  ['content-brand on background-brand-subtle-hover', c('content-brand'), c('background-brand-subtle-hover'), TEXT],
  ['content-on-accent-1 on background-accent-1', c('content-on-accent-1'), c('background-accent-1'), TEXT],
  ['content-on-accent-1 on background-accent-1-hover', c('content-on-accent-1'), c('background-accent-1-hover'), TEXT],
  ['content-default on background-accent-subtle', c('content-default'), c('background-accent-subtle'), TEXT],
  // status words on their washes, on the page and on cards; ink on the strong fills
  ...['error', 'success', 'info', 'warning', 'neutral'].flatMap((s) => [
    ...['background-surface', 'background-default'].map((g) =>
      [`content-utility-${s} on its wash over ${g}`, c(`content-utility-${s}`), `${c(`background-utility-${s}`)} over ${c(g)}`, TEXT]),
    ...(s === 'neutral' ? [] : [[`content-utility-${s} on background-surface`, c(`content-utility-${s}`), c('background-surface'), TEXT]]),
  ]),
  ...['error', 'success', 'info', 'warning'].map((s) =>
    [`content-utility-on-status on background-utility-${s}-knockout`, c('content-utility-on-status'), c(`background-utility-${s}-knockout`), TEXT]),
  // code
  ...['foreground', 'keyword', 'string', 'number', 'comment', 'function', 'tag', 'attr', 'punct', 'line-number'].map((s) =>
    [`syntax ${s} on the code ground`, c(`content-syntax-${s}`), c('background-syntax-background'), TEXT]),
  ['code on an added line', c('content-syntax-foreground'), c('background-syntax-add'), TEXT],
  ['code on a removed line', c('content-syntax-foreground'), c('background-syntax-del'), TEXT],
  // marks: control edges, focus ring, status edges, icons, filled plates
  ...['border-strong', 'border-focus', 'border-ink', 'border-brand', 'content-icon-subtle'].flatMap((fg) =>
    PAGES.map((bg) => [`${fg} on ${bg}`, c(fg), c(bg), MARK])),
  ['border-focus on background-lane', c('border-focus'), c('background-lane'), MARK],
  ['border-strong on background-lane', c('border-strong'), c('background-lane'), MARK],
  ...['error', 'success', 'info', 'warning', 'neutral'].map((s) =>
    [`border-utility-${s} on background-surface`, c(`border-utility-${s}`), c('background-surface'), MARK]),
  // the primary button's boundary is its border-brand edge (checked above with the marks), not the fill
  ['primary edge on background-lane', c('border-brand'), c('background-lane'), MARK],
  ['secondary button edge on background-surface', '--button-color-border-default', c('background-surface'), MARK],
  ['secondary button edge on background-default', '--button-color-border-default', c('background-default'), MARK],
];

/* Fills that must stay visibly apart (lanes off the page, selection off the card). */
const APART = 1.08;
const DISTINCT = [
  ['lane vs the page', c('background-lane'), c('background-default')],
  ['selected wash vs the card', c('background-accent-subtle'), c('background-surface')],
];

/* Pairs that must stay BELOW a bar in BELLA light: proof the rule is still needed. */
const FORBIDDEN_LIGHT = [
  ['ochre as text on white (forbidden)', '--color-brand-ochre-300', '--color-neutral-white', 4.5],
];

const failures = [];
const lines = [];

/* The inset rule (Elleta, 2026-10-04): the subtle fill is decorative and the
 * edge carries the boundary. A field you type or choose in on the subtle fill
 * carries border-strong in the same rule; every other consumer is listed. */
const INSET_FIELDS = /^src\/components\/(Input|Select|Combobox|Textarea)\//;
const INSET_EXEMPT = {
  'src/patterns/BeforeAfterFrame/BeforeAfterFrame.module.css :: .stage': 'decorative container around a screen, not a control',
  'src/components/StatusPill/StatusPill.module.css :: .neutral': 'identified by its text, not the fill',
  'src/components/Kbd/Kbd.module.css :: .key': 'identified by its key label, not the fill',
  'src/components/Avatar/Avatar.module.css :: .avatar': 'identified by its initials or image, not the fill',
  'src/components/Input/Input.module.css :: .field:disabled': 'disabled state fill: the disabled styling carries it',
  'src/components/Button/Button.module.css :: .button:disabled': 'disabled state fill: the disabled styling carries it',
  'src/components/ActionChip/ActionChip.module.css :: .quiet:hover, .quiet:focus-visible': 'hover and focus state fill: the focus ring and icon carry it',
  'src/components/AvatarStack/AvatarStack.module.css :: .overflow': 'identified by its +N count text, not the fill',
  'src/components/ChatBubble/ChatBubble.module.css :: .received': 'a message bubble, identified by its text, not a control',
  'src/components/TypingDots/TypingDots.module.css :: .root': 'a typing indicator, identified by its dots, not a control',
  'src/components/Stat/Stat.module.css :: .iconWell': 'an icon well, identified by its icon, not the fill',
  'src/components/PageHeader/PageHeader.module.css :: .iconWell': 'an icon well, identified by its icon, not the fill',
  'src/components/Button/Button.module.css :: .secondary:hover:not(:disabled), .secondary:focus-visible': 'hover and focus state fill: transient, the label and focus ring carry it',
  'src/components/Button/Button.module.css :: .secondary:active:not(:disabled)': 'pressed state fill: transient, the label carries it',
  'src/components/Button/Button.module.css :: .tertiary:hover:not(:disabled), .tertiary:active:not(:disabled), .tertiary:focus-visible': 'tertiary hover, pressed and focus fill (Figma Button 26:320): transient, the ink label and the focus ring carry it',
  'src/components/NavItem/NavItem.module.css :: .item:hover': 'hover state fill (light blue in Chip): transient, the item label and icon carry it',
  'src/components/TreeItem/TreeItem.module.css :: .row:hover': 'hover state fill (light blue in Chip): transient, the row label carries it',
  'src/components/ClientSwitcher/ClientSwitcher.module.css :: .switcher:hover': 'hover state fill (light blue in Chip): transient, the name and logo carry it',
  'src/components/ListRow/ListRow.module.css :: .interactive:active': 'pressed state fill: transient, the row text carries it',
};
{
  // part tokens that point at the subtle fill or the strong edge count as those tokens
  const all = JSON.parse(readFileSync('tokens/bella.json', 'utf8')).themes;
  const pointsAt = (target) => [`--${target.replaceAll('.', '-')}`, ...new Set(Object.values(all).flatMap((t) =>
    Object.values(t).filter((e) => e.tier === 'component' && e.alias === `{${target}}`).map((e) => e.css)))];
  const alt = (names) => names.map((n) => n.replace(/[-]/g, '\\-')).join('|');
  const insetVars = alt(pointsAt('color.background.subtle'));
  const strongVars = alt(pointsAt('color.border.strong'));
  const insetBg = new RegExp(`background(-color)?\\s*:[^;]*var\\((${insetVars})\\)`);
  const insetInline = new RegExp(`background(Color)?\\s*:\\s*['"\`][^'"\`]*var\\((${insetVars})\\)`);
  const strongEdge = new RegExp(`(border|box-shadow|outline)[a-z-]*\\s*:[^;]*var\\((${strongVars})\\)`);
  const cssRules = (src) => {
    src = src.replace(/\/\*[\s\S]*?\*\//g, '');
    const out = [];
    const stack = [];
    let buf = '';
    for (const ch of src) {
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
            else failures.push(`inset: ${key} is a field on the subtle fill without border-strong in the same rule (the edge carries the boundary)`);
            continue;
          }
          failures.push(`inset: ${key} paints the subtle fill and is unclassified: add border-strong as a field, or list it in INSET_EXEMPT with a reason`);
        }
      } else if (file.endsWith('.tsx') && !file.endsWith('.stories.tsx') && insetInline.test(readFileSync(file, 'utf8'))) {
        failures.push(`inset: ${file} paints the subtle fill in an inline style; move it to CSS and classify it`);
      }
    }
  }
  for (const key of Object.keys(INSET_EXEMPT)) {
    if (!seen.has(key)) failures.push(`inset: INSET_EXEMPT lists ${key}, which no longer paints the subtle fill; remove the entry`);
  }
}

let checked = 0;
for (const [theme, vars] of Object.entries(THEMES)) {
  for (const [label, fg, bg, bar] of PAIRS) {
    const r = ratio(colour(vars, fg), colour(vars, bg));
    checked++;
    lines.push(`${theme.padEnd(12)} ${r.toFixed(2).padStart(6)}:1  >= ${bar}  ${label}`);
    if (r < bar) failures.push(`${theme}: ${label} is ${r.toFixed(2)}:1, needs ${bar}:1 (${fg} on ${bg})`);
  }
  for (const [label, a, b] of DISTINCT) {
    const r = ratio(colour(vars, a), colour(vars, b));
    checked++;
    lines.push(`${theme.padEnd(12)} ${r.toFixed(2).padStart(6)}:1  >= ${APART}  ${label}`);
    if (r < APART) failures.push(`${theme}: ${label} is ${r.toFixed(2)}:1, the eye cannot find it (needs ${APART}:1)`);
  }
}
for (const [label, fg, bg, under] of FORBIDDEN_LIGHT) {
  const r = ratio(colour(base, fg), colour(base, bg));
  checked++;
  lines.push(`bella-light  ${r.toFixed(2).padStart(6)}:1  <  ${under}  ${label}`);
  if (r >= under) failures.push(`bella-light: ${label} now passes (${r.toFixed(2)}:1); the rule forbidding it needs review`);
}

if (process.argv.includes('--verbose')) console.log(lines.join('\n'));
if (failures.length) {
  console.error(`contrast pairs: ${failures.length} failing\n  - ${failures.join('\n  - ')}`);
  process.exit(1);
}
console.log(`contrast pairs: ${checked} checked across ${Object.keys(THEMES).length} themes (text 7:1, marks 3:1), OK; inset rule: ${Object.keys(INSET_EXEMPT).length} exempt, every consumer classified`);
