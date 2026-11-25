#!/usr/bin/env node
// spec-figma-names: keeps the Figma name of every property in every spec, checks the name round trip, and
// lets a spec mark props that exist only in code (23 Nov 2026, Elleta: "Yes, 1 to 3").
//   node scripts/spec-figma-names.mjs --write [Name ...]   run after spec-build: adds `figmaName` to each code prop that
//                                                          has a Figma property, and drops the "in code, not in Figma"
//                                                          mismatch for props listed in guidance.codeOnly
//   node scripts/spec-figma-names.mjs [--strict] [--names] check (default): round trip, collisions, counts
//   --names  also prints Figma property names that are not sentence case (list for a rename after Tue 24 Nov)
// A code prop maps to a Figma property when its doc says `Figma "<name>"` and that property exists in the spec's
// figma block, or when converting the Figma name to code style gives the prop name.
// Round trip: converting figmaName to code style must give `name`; two props of one part must not collide.
// Exit 1 on collisions or a figmaName that is not in the Figma read; `--strict` also fails on lossy names.
// Token values: --write also resolves both sides of every tokens.* mismatch through tokens/bella.css (BELLA light) and sets
//   sameValueInChip: true when the Figma token's value equals the value of a code token on that field (same value, other name).
//   CSS file: $BELLA_CSS or ~/DEV/bella-parts/tokens/bella.css.
// guidance.codeOnly: [{ name, why }] marks a prop with nothing to draw (DOM, behaviour, accessibility state).
// guidance.nameOverrides: { "<Figma name>": "<code name>" } fixes a conversion that is wrong (Figma "URL" -> url, not uRL);
//   --write renames the prop and its references, the round trip expects the override, collisions still fail.
// Value pairs (judgment, recorded only when both sides draw the same thing): a prop's `valuePairs: [{ figma, code, why }]`
//   and guidance.statePairs: [{ figma, code, why }]; --write drops the values / states mismatch they make equal.

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { existsSync } from 'node:fs';
import yaml from 'js-yaml';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const DIR = `${ROOT}/specs/components`;
const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const only = args.filter((a) => !a.startsWith('--'));
const camel = (s) => s.replace(/[^A-Za-z0-9]+(.)?/g, (m, c) => (c ? c.toUpperCase() : '')).replace(/^./, (c) => c.toLowerCase());
const base = (k) => k.replace(/#\d+:\d+$/, '');
const convert = (s, fig) => (s.guidance?.nameOverrides || {})[fig] ?? camel(fig);
const yq = (s) => (/^[A-Za-z][A-Za-z0-9 ]*$/.test(s) ? s : JSON.stringify(s));
const files = readdirSync(DIR).filter((f) => f.endsWith('.spec.yaml')).map((f) => f.replace('.spec.yaml', '')).filter((n) => !only.length || only.includes(n)).sort();


/** Token values from bella.css, BELLA light (the :root block): { '--name': 'value' }. */
function tokenValues() {
  const file = process.env.BELLA_CSS || `${homedir()}/DEV/bella-parts/tokens/bella.css`;
  if (!existsSync(file)) return null;
  const css = readFileSync(file, 'utf8');
  const start = css.indexOf(':root'); const end = css.indexOf('[data-theme="bella-dark"]');
  const vars = {}; for (const m of css.slice(start, end > start ? end : undefined).matchAll(/^\s*(--[\w-]+):\s*([^;]+);/gm)) vars[m[1]] = m[2].trim();
  return vars;
}
const resolveVar = (vars, name, depth = 0) => { let v = vars[name]; if (v == null || depth > 8) return null; const m = /^var\((--[\w-]+)\)$/.exec(v); return m ? resolveVar(vars, m[1], depth + 1) : v; };
const cssName = (t) => '--' + String(t).replace(/\//g, '-');

/** Maps each code prop to its Figma property: first by the doc's `Figma "<name>"` (exact case), then by converting the
 *  Figma name to code style; a Figma property is claimed by one code prop only (the doc match wins). */
function mapProps(s, figKeys) {
  const map = new Map(); const claimed = new Set();
  for (const prop of s.props || []) {
    const m = /Figma "([^"]+)"/.exec(prop.doc || '');
    const hit = m && figKeys.find((k) => k === m[1]);
    if (hit && !claimed.has(hit)) { map.set(prop.name, hit); claimed.add(hit); }
  }
  for (const prop of s.props || []) {
    if (map.has(prop.name)) continue;
    const hit = figKeys.find((k) => !claimed.has(k) && convert(s, k) === prop.name);
    if (hit) { map.set(prop.name, hit); claimed.add(hit); }
  }
  return map;
}

if (flag('--write')) {
  let written = 0, dropped = 0, renamed = 0, paired = 0, valued = 0, deduped = 0; const vars = tokenValues();
  for (const n of files) {
    const p = `${DIR}/${n}.spec.yaml`;
    let text = readFileSync(p, 'utf8');
    const s = yaml.load(text);
    if (!s.figma && s.status !== 'figma-only') continue;
    const figKeys = [...new Set(s.figma ? Object.keys(s.figma.props || {}).map(base) : (s.props || []).map((x) => x.figmaName).filter(Boolean))];
    const map = mapProps(s, figKeys);
    for (const prop of s.figma ? s.props || [] : []) { // figma-only specs keep the figmaName they were drawn with
      const fn = map.get(prop.name) || null;
      if (prop.figmaName === fn || (!fn && !prop.figmaName)) continue;
      const re = new RegExp(`(^  - name: ${prop.name}\\n)(    figmaName: [^\\n]*\\n)?`, 'm');
      if (!re.test(text)) continue;
      text = text.replace(re, fn ? `$1    figmaName: ${yq(fn)}\n` : '$1'); written++;
    }
    for (const [fig, code] of Object.entries(s.guidance?.nameOverrides || {})) {
      const old = (s.props || []).find((x) => x.figmaName === fig)?.name;
      if (old && old !== code) { text = text.replace(new RegExp(`(^  - name: )${old}$`, 'm'), `$1${code}`).replace(new RegExp(`(characters: |boundToProps[^\\n]*: )${old}$`, 'gm'), `$1${code}`); renamed++; }
    }
    const pairsOf = (list) => Object.fromEntries((list || []).map((x) => [x.figma, x.code]));
    for (const m of s.mismatch || []) {
      let pairs = null, c = m.code, g = m.figma;
      if (m.field === 'states') { pairs = pairsOf(s.guidance?.statePairs); c = m.code?.contract; }
      else if (m.field.startsWith('props.') && m.field.endsWith('.values')) pairs = pairsOf((s.props || []).find((x) => x.name === m.field.slice(6, -7))?.valuePairs);
      if (!pairs || !Array.isArray(c) || !Array.isArray(g)) continue;
      const mapped = new Set(g.map((v) => pairs[v] ?? v));
      if (c.every((v) => mapped.has(v)) && mapped.size === new Set(c).size) {
        const re = new RegExp(`^  - field: ${m.field}\\n(?:    [^\\n]*\\n|      [^\\n]*\\n)*`, 'm');
        if (re.test(text)) { text = text.replace(re, ''); paired++; }
      }
    }
    for (const c of s.guidance?.codeOnly || []) {
      const re = new RegExp(`^  - field: props\\.${c.name}\\n(?:    [^\\n]*\\n|      [^\\n]*\\n)*`, 'm');
      if (re.test(text)) { text = text.replace(re, ''); dropped++; }
    }
    if (vars) { // same value, other name: mark tokens.* mismatches whose Figma value equals a code token's value
      const mm = yaml.load(text).mismatch || [];
      const head = text.indexOf('\nmismatch:\n'); const blocks = [...text.slice(head).matchAll(/^  - field: /gm)].map((x) => head + x.index);
      let out = text.slice(0, blocks[0] ?? text.length), flagged = [];
      mm.forEach((m, i) => {
        let block = text.slice(blocks[i], blocks[i + 1] ?? text.length);
        if (m.field.startsWith('tokens.') && m.sameValueInChip === false) {
          const codeVals = [].concat(m.code).map((c) => resolveVar(vars, String(c))).filter((x) => x != null);
          const figVals = [].concat(m.figma).map((f) => resolveVar(vars, cssName(f)));
          if (figVals.length && figVals.every((v) => v != null && codeVals.includes(v))) { block = block.replace('sameValueInChip: false', 'sameValueInChip: true'); valued++; }
        }
        out += block;
      });
      if (mm.length) text = out;
    }
    { // identical mismatch entries (a pattern with hundreds of identical raw fills) are one finding, not hundreds
      const head = text.indexOf('\nmismatch:\n');
      if (head >= 0) {
        const starts = [...text.slice(head).matchAll(/^  - field: /gm)].map((x) => head + x.index);
        const seen = new Set(); let out = text.slice(0, starts[0] ?? text.length);
        starts.forEach((s, i) => { const b = text.slice(s, starts[i + 1] ?? text.length); if (!seen.has(b)) { seen.add(b); out += b; } else deduped++; });
        text = out;
      }
    }
    text = text.replace(/^mismatch:\n(?=\S)/m, 'mismatch: []\n'); // every mismatch dropped: keep the key an array
    writeFileSync(p, text);
  }
  console.log(`spec-figma-names: ${written} figmaName lines written, ${dropped} code-only mismatches dropped, ${renamed} name overrides applied, ${paired} value-pair mismatches dropped, ${valued} token mismatches marked same value, ${deduped} duplicate mismatches removed`);
  process.exit(0);
}

let specs = 0, props = 0, withFig = 0, ok = 0, fail = 0;
const failures = [], collisions = [], missing = [], notSentence = [], codeOnlyOut = [];
for (const n of files) {
  const s = yaml.load(readFileSync(`${DIR}/${n}.spec.yaml`, 'utf8'));
  specs++;
  const figKeys = s.figma?.props ? [...new Set(Object.keys(s.figma.props).map(base))] : null;
  const seen = new Map();
  for (const prop of s.props || []) {
    props++;
    if (!prop.figmaName) continue;
    withFig++;
    if (figKeys && !figKeys.includes(prop.figmaName)) missing.push(`${n}: figmaName "${prop.figmaName}" (prop ${prop.name}) is not in the Figma read`);
    const conv = convert(s, prop.figmaName);
    if (conv === prop.name) ok++; else { fail++; failures.push(`${n}: "${prop.figmaName}" -> ${conv}, code name ${prop.name}`); }
    if (seen.has(conv)) collisions.push(`${n}: "${seen.get(conv)}" and "${prop.figmaName}" both become ${conv}`);
    seen.set(conv, prop.figmaName);
  }
  for (const k of figKeys || []) if (flag('--names') && (/^[a-z]/.test(k) || /[a-z][A-Z]/.test(k))) notSentence.push(`${n}: ${k}`);
  for (const c of s.guidance?.codeOnly || []) codeOnlyOut.push(`${n}.${c.name}: ${c.why}`);
}
console.log(`spec-figma-names: read ${specs} specs, ${props} properties, ${withFig} with a figmaName`);
console.log(`${ok} of ${withFig} properties convert without loss${fail ? ` (${fail} do not)` : ''}`);
for (const l of failures) console.log('  lossy   ' + l);
for (const l of collisions) console.log('  COLLIDE ' + l);
for (const l of missing) console.log('  MISSING ' + l);
if (flag('--names')) { console.log(`\nFigma property names not in sentence case (${notSentence.length}):`); for (const l of notSentence) console.log('  ' + l); }
if (codeOnlyOut.length) { console.log(`\nMarked code-only (${codeOnlyOut.length}):`); for (const l of codeOnlyOut) console.log('  ' + l); }
if (!specs || !withFig) { console.error('spec-figma-names: read nothing, refusing to pass'); process.exit(1); }
process.exit(collisions.length || missing.length || (flag('--strict') && fail) ? 1 : 0);
