#!/usr/bin/env node
// spec-build: code + Figma data -> one deterministic YAML spec per component (12 Nov 2026).
// Style of Nathan Curtis' specs-cli: structured, compact, token references, no AI interpretation.
//   node scripts/spec-build.mjs <Name> [--figma <figma-spec-read.json>] [--out <path>] [--stdout]
// Default output: specs/components/<Name>.spec.yaml. An existing `guidance:` block is kept as written.
// Code sources: src/components/<Name>/<Name>.tsx and .module.css, tokens/component.json (contract),
//   tokens/bella.css (values), scripts/contrast-pairs.mjs (pairs), the stories in bella-storybook-brand.
// Figma source: the JSON that scripts/figma-spec-read.js returns (read-only plugin script).
// Where code and Figma disagree both are recorded in `mismatch`; neither is picked.
// Needs js-yaml (present in node_modules as a dependency of the Storybook toolchain).

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import yaml from 'js-yaml';

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1] !== '--figma' && args[args.indexOf(a) - 1] !== '--out');
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
if (!name) { console.error('usage: node scripts/spec-build.mjs <Name> [--figma file.json] [--out path] [--stdout]'); process.exit(2); }

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const STORY_ROOTS = [`${homedir()}/DEV/bella-storybook-brand`, ROOT];
const rel = (p) => p.replace(ROOT + '/', '');
const read = (p) => readFileSync(p, 'utf8');
const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const tsxPath = `${ROOT}/src/components/${name}/${name}.tsx`;
const cssPath = `${ROOT}/src/components/${name}/${name}.module.css`;
if (!existsSync(tsxPath)) { console.error(`spec-build: ${rel(tsxPath)} not found`); process.exit(2); }
const tsx = read(tsxPath);
const css = existsSync(cssPath) ? read(cssPath) : '';
const lineOf = (src, index) => src.slice(0, index).split('\n').length;

// ---------- tokens (values) ----------
const bella = read(`${ROOT}/tokens/bella.css`);
function block(re) {
  const m = bella.match(re); if (!m) return {};
  let i = m.index + m[0].length, depth = 1; const start = i;
  while (depth && i < bella.length) { if (bella[i] === '{') depth++; else if (bella[i] === '}') depth--; i++; }
  const vars = {};
  for (const d of bella.slice(start, i - 1).matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars[d[1]] = d[2].trim();
  return vars;
}
const light = block(/:root\s*\{/);
const chip = { ...light, ...block(/\[data-theme=["']?chip["']?\]\s*\{/) };
function resolveVar(vars, n, seen = new Set()) {
  if (seen.has(n) || vars[n] === undefined) return null; seen.add(n);
  const m = vars[n].match(/^var\((--[\w-]+)\)$/);
  return m ? resolveVar(vars, m[1], seen) : vars[n];
}
const lum = (hex) => { const h = hex.replace('#', '').slice(0, 6); const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)]; return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const isHex = (v) => typeof v === 'string' && /^#[0-9a-f]{6,8}$/i.test(v);
const composite = (vars, spec) => {
  const [top, base] = spec.split(' over ');
  if (!base) return resolveVar(vars, top);
  const t = resolveVar(vars, top)?.replace('#', ''); const b = resolveVar(vars, base)?.replace('#', '').slice(0, 6);
  if (!t || !b) return null;
  const a = t.length === 8 ? parseInt(t.slice(6, 8), 16) / 255 : 1;
  return '#' + [0, 2, 4].map((i) => Math.round(parseInt(t.slice(i, i + 2), 16) * a + parseInt(b.slice(i, i + 2), 16) * (1 - a)).toString(16).padStart(2, '0')).join('');
};

// ---------- contract (tokens/component.json) ----------
const contractAll = JSON.parse(read(`${ROOT}/tokens/component.json`)).component || {};
const contract = contractAll[kebab]?.$extensions?.bella || contractAll[name.toLowerCase()]?.$extensions?.bella || null;

// ---------- props from the .tsx ----------
function parseProps() {
  const m = tsx.match(new RegExp(`export interface ${name}Props[^{]*\\{`));
  if (!m) return [];
  let i = m.index + m[0].length, depth = 1; const start = i;
  while (depth && i < tsx.length) { if (tsx[i] === '{') depth++; else if (tsx[i] === '}') depth--; i++; }
  const body = tsx.slice(start, i - 1);
  // defaults from the destructured parameter list
  const defaults = {};
  const fm = tsx.match(new RegExp(`export default function ${name}\\s*\\(\\s*\\{([\\s\\S]*?)\\}\\s*:\\s*${name}Props`));
  if (fm) for (const d of fm[1].matchAll(/(?:^|,|\n)\s*(\w+)(?:\s*:\s*\w+)?\s*=\s*([^,\n]+)/g)) defaults[d[1]] = d[2].trim().replace(/^['"]|['"]$/g, '');
  const out = [];
  // statements split at a top-level ';' so a type with its own braces ({ value: string; label: string }[]) stays one prop (12 Nov: Select options was split in two)
  const stmts = []; { let depth = 0, from = 0; for (let k = 0; k < body.length; k++) { const c = body[k]; if (c === '/' && body[k + 1] === '*') { k = body.indexOf('*/', k) + 1; continue; } if ('{[(<'.includes(c) && !(c === '<' && body[k - 1] === '=')) depth++; else if ('}])>'.includes(c) && !(c === '>' && body[k - 1] === '=')) depth--; else if (c === ';' && depth === 0) { stmts.push({ text: body.slice(from, k + 1), start: from }); from = k + 1; } } }
  for (const st of stmts) {
    const p = st.text.match(/^\s*(?:\/\*\*([\s\S]*?)\*\/\s*)?(\w+)(\?)?:\s*([\s\S]+);\s*$/); if (!p) continue;
    const type = p[4].trim().replace(/\s+/g, ' ');
    const lits = [...type.matchAll(/['"]([^'"]+)['"]/g)].map((x) => x[1]); // 13 Nov: double-quoted unions too (Combobox placement)
    const entry = { name: p[2], required: !p[3], type };
    { const ref = type.match(/^(\w+)Props\['(\w+)'\]$/); if (ref && ref[1] !== name) { try { const t2 = readFileSync(`${ROOT}/src/components/${ref[1]}/${ref[1]}.tsx`, 'utf8'); const m2 = t2.match(new RegExp(`\\b${ref[2]}\\??:\\s*((?:'[^']+'\\s*\\|?\\s*)+);`)); if (m2) entry.values = [...m2[1].matchAll(/'([^']+)'/g)].map((x) => x[1]); } catch { /* referenced component not found: leave untyped */ } } } // 13 Nov: AvatarProps['size'] resolved from the referenced component, so Sizes is no longer n/a
    if (lits.length && /^(('[^']+'|"[^"]+")\s*\|?\s*)+$/.test(type)) entry.values = lits;
    else if (type === 'boolean') entry.values = [true, false];
    else if (/^\d+( \| \d+)+$/.test(type)) entry.values = type.split(' | '); // 13 Nov (Columns): a numeric union (count?: 2 | 3) is a variant of string values
    if (defaults[p[2]] !== undefined) entry.default = defaults[p[2]] === 'true' ? true : defaults[p[2]] === 'false' ? false : defaults[p[2]];
    if (p[1]) entry.doc = p[1].replace(/^\s*\*\s?/gm, '').replace(/\s+/g, ' ').trim();
    entry.at = `${rel(tsxPath)}:${lineOf(tsx, start + st.start + (st.text.includes('*/') ? st.text.indexOf('*/') + 2 : 0) + st.text.slice(st.text.includes('*/') ? st.text.indexOf('*/') + 2 : 0).search(/\w+\??:/))}`;
    out.push(entry);
  }
  return out;
}
const props = parseProps();

// ---------- CSS rules with line numbers ----------
function cssRules(src) {
  const rules = []; const stack = []; let buf = '', line = 1, bufLine = 1, inComment = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (!inComment && ch === '/' && src[i + 1] === '*') inComment = true;
    if (inComment) { if (ch === '\n') line++; if (ch === '/' && src[i - 1] === '*') inComment = false; continue; }
    if (ch === '\n') line++;
    if (ch === '{') { stack.push({ sel: buf.trim().replace(/\s+/g, ' '), line: bufLine, start: i, decls: [] }); buf = ''; bufLine = line; }
    else if (ch === '}') {
      const top = stack.pop();
      if (top) {
        const body = buf; let l = bufLine;
        let from = top.start; /* line numbers come from the source text itself: comments inside a rule are skipped in the buffer, which shifted every line after them (12 Nov night: Card radius css:22 read as 23) */
        for (const d of body.split(';')) { const t = d.trim(); const dm = t.match(/^([\w-]+)\s*:\s*([\s\S]+)$/); if (dm) { const hit = src.slice(from, i).search(new RegExp('(^|[\\s;{}])' + dm[1].replace(/[-]/g, '\\-') + '\\s*:')); const at = hit < 0 ? from : from + hit + (/^[\s;{}]/.test(src[from + hit]) ? 1 : 0); top.decls.push({ prop: dm[1], value: dm[2].replace(/\s+/g, ' '), line: src.slice(0, at).split('\n').length }); from = at + dm[1].length; } l += d.split('\n').length - 1; }
        const media = stack.filter((s) => s.sel.startsWith('@')).map((s) => s.sel).join(' ');
        if (!top.sel.startsWith('@')) rules.push({ selector: top.sel, media, line: top.line, decls: top.decls });
      }
      buf = ''; bufLine = line;
    } else { if (buf.trim() === '' && ch.trim() !== '') bufLine = line; buf += ch; }
  }
  return rules;
}
const rules = cssRules(css);
const varsIn = (v) => [...v.matchAll(/var\((--[\w-]+)/g)].map((m) => m[1]);
const stateOf = (sel) => {
  const s = [];
  if (/:hover/.test(sel)) s.push('hover'); if (/:focus-visible|:focus\b/.test(sel)) s.push('focus-visible'); if (/:active/.test(sel)) s.push('active');
  if (/:disabled|\[disabled|aria-disabled/.test(sel)) s.push('disabled'); if (/:visited/.test(sel)) s.push('visited');
  for (const a of sel.matchAll(/\[(aria-[\w-]+|data-[\w-]+)([^\]]*)\]/g)) s.push(`[${a[1]}${a[2]}]`);
  return s.length ? s.join(' ') : 'rest';
};
const partOf = (sel) => { const last = sel.split(/[\s>+~]+/).filter(Boolean).pop() || ''; const classes = [...last.matchAll(/\.([\w-]+)/g)].map((m) => m[1]); const base = new RegExp(`^${name}$`, 'i'); return classes.length ? (classes[0].toLowerCase() === name.toLowerCase() ? 'root' : classes[0]) : 'root'; };
const rootClass = (() => { const f = rules.find((r) => /^\.[\w-]+$/.test(r.selector) && !r.media); return f ? f.selector.slice(1) : null; })();

const tokenRows = [];
for (const r of rules) {
  if (r.media.includes('prefers-reduced-motion')) continue;
  for (const d of r.decls) for (const t of varsIn(d.value)) {
    const sels = r.selector.split(',').map((s) => s.trim());
    tokenRows.push({ part: partOf(sels[0]) === rootClass || partOf(sels[0]) === 'root' ? 'root' : partOf(sels[0]), state: stateOf(r.selector), property: d.prop, token: t, selector: r.selector, at: `${rel(cssPath)}:${d.line}` });
  }
}
const allTokens = [...new Set(tokenRows.map((t) => t.token))].sort();
const tokenValues = {}; for (const t of allTokens) tokenValues[t] = { light: resolveVar(light, t), chip: resolveVar(chip, t) };

// ---------- variants and states ----------
const cssStates = [...new Set(rules.flatMap((r) => stateOf(r.selector).split(' ')).filter((s) => s !== 'rest'))];
const variantProps = props.filter((p) => p.values && p.name !== 'disabled' && !/^(aria|external|iconOnly)/.test(p.name) && p.values.every((v) => typeof v === 'string'));
const variants = Object.fromEntries(variantProps.map((p) => [p.name, { values: p.values, default: p.default ?? null, at: p.at }]));
const booleans = props.filter((p) => p.type === 'boolean').map((p) => p.name);
const states = { contract: contract?.states || [], css: cssStates };

// ---------- sizes ----------
const sizeProp = props.find((p) => p.name === 'size' && p.values);
const sizes = sizeProp ? sizeProp.values.map((v) => {
  const rs = rules.filter((r) => new RegExp(`\\.${v}\\b|\\.${v === 'default' ? '__none__' : v}\\b`).test(r.selector) && !r.media);
  const dims = rs.flatMap((r) => r.decls.filter((d) => /^(min-)?(height|width)$|^padding|^gap$/.test(d.prop)).map((d) => ({ property: d.prop, value: d.value, at: `${rel(cssPath)}:${d.line}` })));
  return { value: v, default: sizeProp.default === v, css: dims };
}) : [];

// ---------- motion ----------
const motion = { transitions: [], reducedMotion: null };
for (const r of rules) for (const d of r.decls) {
  if (/^transition(-property)?$/.test(d.prop) || /^animation$/.test(d.prop)) {
    const reduced = r.media.includes('prefers-reduced-motion');
    if (reduced) { motion.reducedMotion = { selector: r.selector, declaration: `${d.prop}: ${d.value}`, at: `${rel(cssPath)}:${d.line}` }; continue; }
    const toks = varsIn(d.value);
    motion.transitions.push({
      selector: r.selector, state: stateOf(r.selector), declaration: `${d.prop}: ${d.value}`,
      properties: d.prop === 'transition' ? d.value.split(/,\s*(?![^(]*\))/).map((x) => x.trim().split(' ')[0]) : [d.value],
      durations: toks.filter((t) => /duration/.test(t)).map((t) => ({ token: t, value: resolveVar(light, t) })),
      easings: toks.filter((t) => /easing/.test(t)).map((t) => ({ token: t, value: resolveVar(light, t) })),
      at: `${rel(cssPath)}:${d.line}`,
    });
  }
}
// 13 Nov patch (ResourceCard): the lift is Card's (Card.module.css), composed in through <Card>; guarded by component name so other specs do not change
let motionCssPath = cssPath;
if (name === 'ResourceCard' && !motion.transitions.length && /from '\.\.\/Card\/Card'/.test(tsx)) {
  const cardCss = `${ROOT}/src/components/Card/Card.module.css`; motionCssPath = cardCss;
  for (const r of cssRules(read(cardCss))) for (const d of r.decls) {
    if (!/^transition(-property)?$/.test(d.prop)) continue;
    if (r.media.includes('prefers-reduced-motion')) { motion.reducedMotion = { selector: r.selector, declaration: `${d.prop}: ${d.value}`, at: `${rel(cardCss)}:${d.line}` }; continue; }
    const toks = varsIn(d.value);
    motion.transitions.push({ selector: r.selector, state: stateOf(r.selector), declaration: `${d.prop}: ${d.value}`,
      properties: d.value.split(/,\s*(?![^(]*\))/).map((x) => x.trim().split(' ')[0]),
      durations: toks.filter((t) => /duration/.test(t)).map((t) => ({ token: t, value: resolveVar(light, t) })),
      easings: toks.filter((t) => /easing/.test(t)).map((t) => ({ token: t, value: resolveVar(light, t) })), at: `${rel(cardCss)}:${d.line}` });
  }
}
const hasMedia = motionCssPath !== cssPath ? !!motion.reducedMotion : rules.some((r) => r.media.includes('prefers-reduced-motion'));

// ---------- a11y facts ----------
function jsx() {
  const rm = tsx.search(/\breturn\s*\(?\s*\n?\s*</); const from = rm >= 0 ? rm : 0;
  const tags = [...tsx.slice(from).matchAll(/<(a|button|input|select|textarea|nav|ul|ol|li|details|summary|label|section|header|div|span)\b([^>]*)>/g)];
  return { tags, from };
}
const NATIVE_ROLE = { a: 'link', button: 'button', input: 'textbox', select: 'combobox', textarea: 'textbox', nav: 'navigation', ul: 'list', ol: 'list', li: 'listitem', details: 'group', summary: 'button', section: 'region', header: 'banner' };
const KEYS = { a: ['Enter follows the link'], button: ['Enter activates', 'Space activates'], summary: ['Enter toggles', 'Space toggles'], select: ['Arrow keys change the value'], input: ['Type to enter text'], textarea: ['Type to enter text'] };
const a11y = (() => {
  const { tags, from } = jsx(); const first = tags[0];
  const facts = { element: null, role: null, nameSource: null, keyboard: [], aria: [], focusRing: [], disabled: null, reducedMotion: null, contract: contract?.a11y || null };
  if (first) {
    const tag = first[1]; const at = `${rel(tsxPath)}:${lineOf(tsx, from + first.index)}`;
    facts.element = { tag, at };
    const roleAttr = tsx.match(/role=["'{]+([\w-]+)/);
    facts.role = { value: roleAttr ? roleAttr[1] : NATIVE_ROLE[tag] || null, source: roleAttr ? 'role attribute' : 'native element', at };
    if (KEYS[tag]) facts.keyboard = KEYS[tag].map((k) => ({ key: k, source: 'native element', at }));
  }
  const keyNames = [...new Set([...tsx.matchAll(/['"](ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|Enter|Escape)['"]/g)].map((m) => m[1]))];
  for (const k of keyNames) { const m = tsx.match(new RegExp(`['"]${k === ' ' ? ' ' : k}['"]`)); facts.keyboard.push({ key: k === ' ' ? 'Space' : k, source: 'handler in the .tsx', at: `${rel(tsxPath)}:${lineOf(tsx, m.index)}` }); }
  for (const a of tsx.matchAll(/\b(aria-[\w-]+)=\{?["']?([^"'}\s]*)/g)) facts.aria.push({ attribute: a[1], value: a[2] || null, at: `${rel(tsxPath)}:${lineOf(tsx, a.index)}` });
  const al = props.find((p) => p.name === 'ariaLabel');
  const rootAria = first && first[2].match(/aria-label=\{?["']?([\w.]+)/);
  const rootAriaProp = rootAria && props.find((p) => p.name === rootAria[1]);
  if (rootAria) facts.nameSource = { value: `aria-label from the ${rootAria[1]} prop${rootAriaProp && !rootAriaProp.required ? '' : ' (required)'}`, at: `${rel(tsxPath)}:${lineOf(tsx, from + first.index)}` };
  else facts.nameSource = al ? { value: 'visible content, or aria-label from the ariaLabel prop', at: al.at } : { value: 'visible content', at: facts.element?.at || null };
  const fr = rules.find((r) => /:focus-visible/.test(r.selector) && r.decls.some((d) => /outline/.test(d.prop)));
  if (fr) facts.focusRing = fr.decls.filter((d) => /outline|border-radius|box-shadow/.test(d.prop)).map((d) => ({ property: d.prop, value: d.value, tokens: varsIn(d.value).map((t) => ({ token: t, value: resolveVar(chip, t) })), at: `${rel(cssPath)}:${d.line}` }));
  const dp = props.find((p) => p.name === 'disabled');
  facts.disabled = dp ? { prop: 'disabled', at: dp.at, doc: dp.doc || null } : { prop: null, note: 'no disabled prop' };
  facts.reducedMotion = hasMedia ? motion.reducedMotion : null;
  return facts;
})();

// ---------- contrast (contrast-pairs.mjs, computed in the chip theme) ----------
const pairSrc = read(`${ROOT}/scripts/contrast-pairs.mjs`);
const BAR = { AAA: 7, AA: 4.5, NON_TEXT: 3 };
const compPrefix = `--component-${kebab}-`;
const nameRe = new RegExp(`\\b${kebab.replace('-', '[ -]')}\\b`, 'i');
const contrast = { pairs: [], derived: [] };
for (const m of pairSrc.matchAll(/^\s*\['([^']+)',\s*'(--[\w-]+)',\s*'([^']+)',\s*(AAA|AA|NON_TEXT)\]/gm)) {
  const [, label, fg, bg, bar] = m;
  const bgTok = bg.split(' over ')[0];
  const ownFg = fg.startsWith(compPrefix) || allTokens.includes(fg) || nameRe.test(label.split(/ on /)[0]); /* item 24: the role before ' on ' names the component, never the surface it sits on ('on the card' is not Card's own pair) */
  const surface = ['--color-semantic-background', '--color-semantic-surface-card'].includes(bgTok) || bgTok.startsWith(compPrefix);
  if (!ownFg || !surface || /^--component-/.test(bgTok) && !bgTok.startsWith(compPrefix)) continue;
  const f = composite(chip, fg), b = composite(chip, bg);
  if (!isHex(f) || !isHex(b)) continue;
  const r = ratio(f, b);
  contrast.pairs.push({ label, foreground: fg, background: bg, foregroundHex: f, backgroundHex: b, ratio: Math.round(r * 100) / 100, bar: BAR[bar], barName: bar, pass: r >= BAR[bar], theme: 'chip', at: `scripts/contrast-pairs.mjs:${lineOf(pairSrc, m.index)}` });
}
// text colours the CSS sets, against the two page surfaces: measured, no verdict
const colourTokens = [...new Set(tokenRows.filter((t) => t.property === 'color').map((t) => t.token))];
for (const t of colourTokens) for (const surf of ['--color-semantic-background', '--color-semantic-surface-card']) {
  const f = resolveVar(chip, t), b = resolveVar(chip, surf);
  if (isHex(f) && isHex(b)) contrast.derived.push({ foreground: t, background: surf, ratio: Math.round(ratio(f, b) * 100) / 100, theme: 'chip' });
}

// ---------- code example (first real usage in the stories) ----------
function example() {
  for (const root of STORY_ROOTS) {
    const p = `${root}/src/components/${name}/${name}.stories.tsx`; if (!existsSync(p)) continue;
    const src = read(p); const lines = src.split('\n');
    const im = lines.findIndex((l) => new RegExp(`^import ${name} from`).test(l));
    const idx = lines.findIndex((l, i) => i > im && new RegExp(`<${name}[\\s>/]`).test(l));
    if (idx < 0) continue;
    // take the element: from its line to the closing tag or self-close, at most 6 lines
    let end = idx; const closeRe = new RegExp(`</${name}>|/>\\s*$`);
    while (end < lines.length - 1 && end - idx < 5 && !closeRe.test(lines[end])) end++;
    const indent = lines[idx].match(/^\s*/)[0].length;
    let body = lines.slice(idx, end + 1).map((l) => l.slice(Math.min(indent, l.match(/^\s*/)[0].length)));
    // a one-line element inside prose: keep only the element
    if (body.length === 1) { const em = body[0].match(new RegExp(`<${name}\\b[^>]*?/>|<${name}\\b[^>]*>[^<]*</${name}>`)); if (em) body = [em[0]]; }
    const pkgName = JSON.parse(read(`${ROOT}/package.json`)).name;
    return { file: `${p.replace(homedir(), '~')}`, lines: `${idx + 1}-${end + 1}`, import: `import ${name} from '@bella/components/${name}/${name}';`, importSource: 'the style the Button doc page uses (CHIP import path)', code: body.join('\n') };
  }
  return null;
}
const codeExample = example();

// ---------- links ----------
const storyTitle = (() => { for (const root of STORY_ROOTS) { const p = `${root}/src/components/${name}/${name}.stories.tsx`; if (existsSync(p)) { const m = read(p).match(/title:\s*'([^']+)'/); if (m) return m[1]; } } return null; })();
const storybook = storyTitle ? `https://emcdanie.github.io/bella/?path=/docs/${storyTitle.toLowerCase().replace(/[\/\s]+/g, '-')}--docs` : null;
const github = `https://github.com/emcdanie/bella/blob/main/src/components/${name}/${name}.tsx`;

// ---------- Figma ----------
const figmaFile = opt('--figma');
const figma = figmaFile ? JSON.parse(read(resolve(figmaFile))) : null;
// 13 Nov (AvatarStack): a size the code has but Figma does not draw (xs) is not shown on the page (no stand-in); the mismatch row still lists it
if (figma && figma.props) { const fk = Object.keys(figma.props).find((k) => k.toLowerCase() === 'size' && figma.props[k].type === 'VARIANT'); if (fk) { const fv = figma.props[fk].values || []; if (fv.every((v) => sizes.some((z) => z.value === v))) { for (let i = sizes.length - 1; i >= 0; i--) if (!fv.includes(sizes[i].value)) sizes.splice(i, 1); if (variants.size && variants.size.values) variants.size = { ...variants.size, values: variants.size.values.filter((v) => fv.includes(v)) }; } } }
const normName = (n) => n.replace(/#\d+:\d+$/, '');
const figmaToCss = (v) => '--' + v.replace(/\//g, '-');
const tokenOfBound = (b) => Object.entries(b || {}).map(([field, v]) => ({ field, variable: v, css: [].concat(v).map((x) => (x === 'RAW' ? 'RAW' : figmaToCss(x))) }));
const NAME_IS_TEXT = (n) => n.type === 'TEXT' && n.name === n.text;
function figmaTree(n, depth = 0) {
  const out = { name: NAME_IS_TEXT(n) ? '(text content)' : n.name, type: n.type };
  if (n.instanceOf) out.instanceOf = n.instanceOf; if (n.hidden) out.hidden = true; if (n.text !== undefined) out.text = n.text;
  if (n.width !== undefined) out.size = `${n.width}x${n.height}`;
  const t = tokenOfBound(n.bound); if (t.length) out.tokens = t.map((x) => ({ field: x.field, variable: x.variable }));
  if (n.children) out.children = n.children.map((c) => figmaTree(c, depth + 1));
  return out;
}
const partsOf = (root) => { const out = []; const walk = (n, depth) => { if (n.hidden) return; if (n.name !== (root.name) && /\s\d+$/.test(n.name) && out.some((o) => o.name === n.name.replace(/\s\d+$/, ''))) return; if (depth > 0 && ['TEXT', 'RECTANGLE', 'ELLIPSE', 'VECTOR', 'INSTANCE'].includes(n.type)) out.push({ n: out.length + 1, name: NAME_IS_TEXT(n) ? 'Text' : n.name.replace(/\s\d+$/, ''), type: n.type, from: 'figma layer tree order' }); (n.children || []).forEach((c) => walk(c, depth + 1)); }; walk(root, 0); return out; };

const mismatch = [];
const priorGuidance = (() => { try { return yaml.load(read(resolve(opt('--out') || `${ROOT}/specs/components/${name}.spec.yaml`)))?.guidance; } catch { return null; } })(); // guidance.noFigmaVariant: props Figma draws no variant for (e.g. Heading `as`, no visual change)
if (!figma) mismatch.push({ field: 'figma', code: 'read', figma: 'not read (no --figma file passed)' });
else {
  const sameSet = (a, b) => [...a].map(String).sort().join('|') === [...b].map(String).sort().join('|');
  const lc = (a) => a.map((x) => String(x).toLowerCase());
  const figVariantProps = Object.entries(figma.props).filter(([, d]) => d.type === 'VARIANT').map(([k, d]) => [normName(k), d.values]);
  const figBools = Object.entries(figma.props).filter(([, d]) => d.type === 'BOOLEAN').map(([k]) => normName(k).toLowerCase());
  for (const [k, vals] of figVariantProps) {
    const codeProp = props.find((p) => p.name.toLowerCase() === k.toLowerCase().replace(/\s+/g, ''));
    if (codeProp?.values) { if (!sameSet(lc(codeProp.values), lc(vals))) mismatch.push({ field: `props.${codeProp.name}.values`, code: codeProp.values, figma: vals }); }
    else if (k.toLowerCase() === 'state') {
      const codeStates = states.contract.length ? states.contract : cssStates;
      // a contract state can be a value of the state variant or a true/false variant of its own name (disabled, error): together they are the states Figma draws
      const presence = figVariantProps.filter(([n, v]) => n.toLowerCase() !== 'state' && sameSet(lc(v), ['false', 'true'])).map(([n]) => n.toLowerCase());
      const figStates = [...vals, ...presence.filter((n) => lc(codeStates).includes(n))];
      if (!sameSet(lc(codeStates), lc(figStates))) mismatch.push({ field: 'states', code: { contract: states.contract, css: cssStates }, figma: figStates });
    } else if (k.toLowerCase() === 'icon only' || k.toLowerCase() === 'icononly') { if (!props.find((p) => p.name === 'iconOnly')) mismatch.push({ field: `props.${k}`, code: 'no such prop', figma: vals }); }
    else if (props.find((p) => p.name.toLowerCase() === k.toLowerCase()) && (sameSet(lc(vals), ['false', 'true']) || sameSet(lc(vals), ['off', 'on']))) { /* a presence variant of a prop that is not a literal union (error?: string, multiline) */ }
    else mismatch.push({ field: `props.${k}`, code: 'no such prop', figma: vals });
  }
  for (const p of variantProps) if (!(priorGuidance?.noFigmaVariant || []).includes(p.name) && !figVariantProps.find(([k]) => k.toLowerCase().replace(/\s+/g, '') === p.name.toLowerCase())) mismatch.push({ field: `props.${p.name}`, code: p.values, figma: 'no such variant property' });
  for (const b of booleans) if (!['disabled', 'external', 'iconOnly'].includes(b) || true) { if (!figBools.some((x) => x.replace(/\s+/g, '') === b.toLowerCase() || x.replace(/^show\s*/, '') === b.toLowerCase() || (/^hide/.test(b) && x.replace(/\s+/g, '') === 'show' + b.slice(4).toLowerCase())) && !figVariantProps.some(([k]) => k.toLowerCase().replace(/\s+/g, '') === b.toLowerCase())) mismatch.push({ field: `props.${b}`, code: 'boolean prop', figma: 'not in the set' }); }
  const cssSet = new Set(allTokens);
  const seenFig = new Set();
  // a Figma binding is compared with the tokens the CSS uses for the SAME property (colour, font size, radius, height, spacing), never with every token of the component (12 Nov: the Input rows listed all 16 tokens)
  const CSS_FOR = { fills: /^(color|background)/, strokes: /^(border|outline|box-shadow)/, fontSize: /^font-size$/, fontFamily: /^font-family$/, fontWeight: /^font-weight$/, topLeftRadius: /radius/, topRightRadius: /radius/, bottomLeftRadius: /radius/, bottomRightRadius: /radius/, cornerRadius: /radius/, minHeight: /^min-height$/, minWidth: /^min-width$/, itemSpacing: /^gap$/, paddingLeft: /^padding/, paddingRight: /^padding/, paddingTop: /^padding/, paddingBottom: /^padding/, lineHeight: /^line-height$/ };
  const walk = (n) => {
    if (n.type === 'INSTANCE' && priorGuidance?.skipInstanceTokens) return; /* 13 Nov (Drawer): guidance.skipInstanceTokens: an instance's bindings are its own component's (Button's padding, fill, edge), compared in that component's spec, not with this component's CSS list */
    for (const t of tokenOfBound(n.bound)) for (let i = 0; i < t.css.length; i++) {
      const c = t.css[i]; const v = [].concat(t.variable)[i];
      if (c === 'RAW') { mismatch.push({ field: `figma.layers.${n.name}.${t.field}`, code: null, figma: 'raw value, no variable' }); continue; }
      if (!/^--(typography|color|spacing|radius|size|motion|ring|shadow|component)/.test(c) || ['fontFamily', 'fontWeight'].includes(t.field)) continue;
      const field = /Radius$/.test(t.field) ? 'radius' : t.field; // four corners are one row
      const key = `${n.name}${field}${c}`; if (seenFig.has(key)) continue; seenFig.add(key);
      const want = CSS_FOR[t.field]; const rowsFor = tokenRows.filter((r) => r.state === 'rest' && (want ? want.test(r.property) : true));
      const codeTokens = [...new Set(rowsFor.map((r) => r.token))];
      if (codeTokens.includes(c)) continue; // the code uses this very token for this property
      if (!rowsFor.length) continue; // the code sets nothing for this property on the rest state: nothing to compare
      const figVal = resolveVar(chip, c);
      mismatch.push({ field: `tokens.${NAME_IS_TEXT(n) ? '(text content)' : n.name}.${field}`, code: codeTokens, figma: v, sameValueInChip: figVal !== null && codeTokens.some((x) => resolveVar(chip, x) === figVal) });
    }
    (n.children || []).forEach(walk);
  };
  walk(figma.layers);
  if (storybook && figma.documentationLinks?.[0] && figma.documentationLinks[0] !== storybook) mismatch.push({ field: 'links.storybook', code: storybook, figma: figma.documentationLinks[0] });
  // a size prop in code and the heights Figma draws
  if (sizeProp && !(priorGuidance?.noFigmaVariant || []).includes('size') && !figVariantProps.some(([k]) => k.toLowerCase() === 'size')) mismatch.push({ field: 'sizes', code: sizeProp.values, figma: 'no size variant property' });
}

// ---------- not applicable ----------
const notApplicable = [];
if (!sizes.length) notApplicable.push({ section: 'Sizes', why: 'no size prop in ' + rel(tsxPath) });
else if ((priorGuidance?.noFigmaVariant || []).includes('size')) notApplicable.push({ section: 'Sizes', why: 'size is the container width, not a drawn variant (guidance.noFigmaVariant)' }); // 13 Nov BrandWordmark
if (!motion.transitions.length) notApplicable.push({ section: 'Behaviour and motion', why: 'no transition or animation in ' + rel(cssPath) });
if (!codeExample && !priorGuidance?.codeExample) notApplicable.push({ section: 'Code', why: 'no usage in the stories' });
if (!props.length) notApplicable.push({ section: 'Properties', why: 'no props interface' });

// ---------- guidance: kept from an existing spec, never generated ----------
const outPath = resolve(opt('--out') || `${ROOT}/specs/components/${name}.spec.yaml`);
let guidance = { lead: null, whenToUse: [], doDont: [], anatomyParts: [], inContext: [] };
if (existsSync(outPath)) { let old; try { old = yaml.load(read(outPath)); } catch (e) { console.error(`spec-build: the existing spec ${rel(outPath)} does not parse (${e.message.split('\n')[0]}); fix it, the guidance block would be lost`); process.exit(4); } if (old?.guidance) guidance = { ...guidance, ...old.guidance }; }

if (guidance.contrastOnly) contrast.pairs.length = 0; /* item 24/25: only the rows named in guidance.contrastExtra (pairs the CSS really uses, on the surface the CSS sets); the generic pair list and contract prose are never rendered */
// extra contrast rows the pairs list does not hold, named in guidance.contrastExtra [{ label, foreground, background, bar }]: the focus ring, every non-text part, hover text; computed in Chip like the rest
for (const x of guidance.contrastExtra || []) { const f = composite(chip, x.foreground), b = composite(chip, x.background); if (!isHex(f) || !isHex(b)) continue; const r = ratio(f, b); contrast.pairs.push({ label: x.label, foreground: x.foreground, background: x.background, foregroundHex: f, backgroundHex: b, ratio: Math.round(r * 100) / 100, bar: BAR[x.bar], barName: x.bar, pass: r >= BAR[x.bar], theme: 'chip', at: 'guidance.contrastExtra' }); }

// the disabled text pair where a disabled state exists (12 Nov, Input round 2 item 22): measured on the card, judged as a label (AA); shown so the page says what disabled looks like
for (const r of tokenRows.filter((t) => t.state === 'disabled' && t.property === 'color')) { const f = composite(chip, `--${r.token.replace(/^--/, '')}`), b = composite(chip, '--color-semantic-surface'); if (!isHex(f) || !isHex(b) || contrast.pairs.some((p) => p.foreground === r.token && /disabled/.test(p.label))) continue; const q = ratio(f, b); contrast.pairs.push({ label: 'disabled text', foreground: r.token, background: '--color-semantic-surface', foregroundHex: f, backgroundHex: b, ratio: Math.round(q * 100) / 100, bar: BAR.AA, barName: 'AA', pass: q >= BAR.AA, theme: 'chip', at: r.at }); }
// target size from the CSS (the tallest min-height token on the rest state), never typed
{ const mh = tokenRows.filter((t) => t.property === 'min-height' && t.state === 'rest').map((t) => parseInt(resolveVar(chip, t.token), 10)).filter(Number.isFinite); a11y.targetPx = mh.length ? Math.max(...mh) : null; }
// keys that come from the .tsx aria wiring (Input round 2 item 21): one chip per attribute, never only Role / Name / Tab stop
a11y.ariaChips = [...new Map([...tsx.matchAll(/['"]?\b(aria-[\w-]+)['"]?\s*(?:=|:)\s*(\{[^}]*\}|"[^"]*"|[^,\n]+)/g)].map((m) => [m[1], { kind: 'ARIA', value: `${m[1]}${/^"/.test(m[2]) ? '=' + m[2] : ''}`, at: `${rel(tsxPath)}:${lineOf(tsx, m.index)}` }])).values(), ...[...tsx.matchAll(/\brole=["{']+(alert|status|group)/g)].map((m) => ({ kind: 'ARIA', value: `role=${m[1]}`, at: `${rel(tsxPath)}:${lineOf(tsx, m.index)}` })), ...(/\brequired\b/.test(tsx.replace(/required:|required\?/g, '')) && props.some((p) => p.name === 'required') ? [{ kind: 'ARIA', value: 'required', at: props.find((p) => p.name === 'required').at }] : [])];

const leadSrc = contract?.description ? (() => { const d = contract.description; let c = -1, dp = 0; for (let i = 0; i < d.length; i++) { const ch = d[i]; if (ch === '(') dp++; else if (ch === ')') dp = Math.max(0, dp - 1); else if (dp === 0 && (ch === ':' || ch === ';')) { c = i; break; } } const first = d.split(/(?<=\.)\s/)[0]; return (c >= 15 ? d.slice(0, c) : first).replace(/\s*\([^)]*\d{4}[^)]*\)/g, '').replace(/\.$/, '') + '.'; })() : null;
const spec = {
  name,
  lead: leadSrc ? { text: leadSrc, source: 'tokens/component.json description, up to the first colon or semicolon' } : null,
  category: contract?.category || null,
  rendersAs: contract?.rendersAs || null,
  links: { storybook, github, storyTitle },
  props: props.map(({ name: n, type, values, default: d, required, doc, at }) => ({ name: n, type, ...(values ? { values } : {}), ...(d !== undefined ? { default: d } : {}), required, ...(doc ? { doc } : {}), at })),
  variants,
  states,
  sizes,
  anatomy: {
    scaleWidth: guidance.anatomyScaleWidth || 480,
    parts: guidance.anatomyParts && guidance.anatomyParts.length ? guidance.anatomyParts.map((a, i) => ({ n: i + 1, name: a.name, type: 'GUIDANCE', ...(a.layer ? { layer: a.layer } : {}), ...(a.at ? { at: a.at } : {}), ...(a.side ? { side: a.side } : {}), from: 'guidance.anatomyParts (a component whose parts sit in one row needs them named by hand)' })) : figma ? partsOf(figma.layers) : (contract?.anatomy || []).map((a, i) => ({ n: i + 1, name: a.title, type: a.kind, from: 'component.json anatomy order' })),
    figma: figma ? figmaTree(figma.layers) : null,
    code: (contract?.anatomy || []).map((a) => ({ key: a.key, title: a.title, kind: a.kind, trigger: a.trigger || null, token: a.token, detail: a.detail })),
  },
  tokens: { used: tokenRows, values: tokenValues },
  motion: { ...motion, reducedMotionQuery: hasMedia },
  a11y,
  contrast,
  codeExample: guidance.codeExample ? { ...(codeExample || {}), ...guidance.codeExample } : codeExample, // guidance.codeExample { import, code, lines } shows more of the real story (e.g. the panel a tab owns)
  usage: contract ? { use: contract.usage || [], dont: contract.dont || [], source: 'tokens/component.json' } : null,
  figma: figma ? { nodeId: figma.nodeId, fileKey: figma.fileKey, props: figma.props, variants: figma.variants, defaultVariant: figma.defaultVariant, annotations: figma.annotations, documentationLinks: figma.documentationLinks } : null,
  mismatch,
  notApplicable,
  guidance,
};
const text = '# SCHEMA: best-effort, in the style of specs-cli; verify against specs-cli docs\n# Generated by scripts/spec-build.mjs. Do not edit by hand except the `guidance:` block.\n' + yaml.dump(spec, { lineWidth: 140, noRefs: true, skipInvalid: true });

// ---------- {{templates}}: guidance text is computed from token values, never typed (12 Nov, item 9) ----------
// {{--token}} -> its Chip value; {{ratio --fg --bg}} -> the measured ratio, 2 decimals. An unknown token or colour stops the build.
const tpl = (v) => {
  if (typeof v === 'string') return v.replace(/\{\{([^}]+)\}\}/g, (m, e) => {
    e = e.trim(); const r = e.match(/^ratio\s+(--[\w-]+(?: over --[\w-]+)?)\s+(--[\w-]+)$/);
    if (r) { const f = composite(chip, r[1]), b = composite(chip, r[2]); if (!isHex(f) || !isHex(b)) throw new Error(`template ${m}: not a colour`); return ratio(f, b).toFixed(2); }
    const val = resolveVar(chip, e); if (val === null) throw new Error(`template ${m}: no such token`); return val;
  });
  if (Array.isArray(v)) return v.map(tpl);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, tpl(x)]));
  return v;
};
// lint: a number typed into guidance text that no token, contrast pair or measured size backs is reported (never silently shipped)
const known = new Set([...Object.values(tokenValues).flatMap((x) => [x.light, x.chip]).filter(Boolean).map((x) => String(x).replace(/px$/, '')), ...contrast.pairs.map((p) => p.ratio.toFixed(2)), ...(a11y.targetPx ? [String(a11y.targetPx)] : []), ...[...css.matchAll(/(\d+(?:\.\d+)?)px\b/g)].map((m) => m[1])]); /* 13 Nov: a px literal in the component's own CSS (TypingDots lift) backs a guidance number */
const typed = []; (function scan(v, path) { if (typeof v === 'string') { for (const m of v.matchAll(/(\d+(?:\.\d+)?)(px|:1)\b/g)) if (!/\{\{/.test(v.slice(Math.max(0, m.index - 4), m.index)) && !known.has(m[1]) && !known.has(Number(m[1]).toFixed(2))) typed.push(`${path}: "${m[0]}"`); } else if (Array.isArray(v)) v.forEach((x, i) => scan(x, `${path}[${i}]`)); else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) scan(x, `${path}.${k}`); })(guidance, 'guidance');
if (typed.length) console.error('spec-build: typed numbers in guidance with no token behind them (use {{--token}} or {{ratio --fg --bg}}):\n  ' + typed.join('\n  '));
if (args.includes('--json')) { // the fill script's input: the saved spec with guidance templates expanded
  const saved = existsSync(outPath) ? yaml.load(read(outPath)) : spec; saved.guidance = tpl(saved.guidance || {}); process.stdout.write(JSON.stringify(saved)); process.exit(0);
}

// ---------- NDA scan, then write ----------
const ndaPath = `${homedir()}/.claude/nda-terms.txt`;
if (existsSync(ndaPath)) {
  const terms = read(ndaPath).split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  for (const t of terms) { if (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) { console.error(`spec-build: NDA term "${t}" matched; not saved`); process.exit(3); } }
}
if (args.includes('--stdout')) process.stdout.write(text);
else { mkdirSync(dirname(outPath), { recursive: true }); writeFileSync(outPath, text); console.log(`${outPath} (${text.split('\n').length} lines, ${mismatch.length} mismatch)`); }
