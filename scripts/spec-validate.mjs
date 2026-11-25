#!/usr/bin/env node
// spec-validate: check every specs/components/*.spec.yaml against specs/component.schema.json,
// plus the checks a schema cannot make (20 Nov 2026, authoring harness step 1).
//   node scripts/spec-validate.mjs [file ...] [--json] [--quiet]
// No files = every spec. Exit 1 when any spec has an error. Warnings never fail the run.
// Each error names the file, the path inside it, what is wrong and what is expected.

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, resolve, basename } from 'node:path';
import { homedir } from 'node:os';
import yaml from 'js-yaml';
import Ajv from 'ajv';

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const PARTS = `${homedir()}/DEV/bella-parts/src/components`;
const args = process.argv.slice(2);
const flag = (k) => args.includes(k);
const files = args.filter((a) => !a.startsWith('--')).map((f) => resolve(f));
const targets = files.length ? files : readdirSync(`${ROOT}/specs/components`).filter((f) => f.endsWith('.spec.yaml')).sort().map((f) => `${ROOT}/specs/components/${f}`);
const rel = (p) => p.replace(ROOT + '/', '');

const schema = JSON.parse(readFileSync(`${ROOT}/specs/component.schema.json`, 'utf8'));
const ajv = new Ajv({ allErrors: true, strict: false });
const validate = ajv.compile(schema);

// tokens that exist: every custom property declared in tokens/bella.css (any theme block)
// plus bella-parts' own tokens/bella.css: the part code is written against it and it runs ahead of this copy until the next sync
const tokenFiles = [`${ROOT}/tokens/bella.css`, `${PARTS}/../../tokens/bella.css`].filter((f) => existsSync(f));
const declared = new Set(tokenFiles.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1])));
// parts that exist: a spec here, or a component folder in bella-parts
const specNames = new Set(readdirSync(`${ROOT}/specs/components`).map((f) => f.replace('.spec.yaml', '')));
const partNames = new Set(existsSync(PARTS) ? readdirSync(PARTS) : []);

const show = (v) => (v === undefined ? 'nothing' : JSON.stringify(v));
function expected(e) {
  const p = e.params;
  switch (e.keyword) {
    case 'required': return `a "${p.missingProperty}" field`;
    case 'additionalProperties': return `no "${p.additionalProperty}" field (allowed: see the schema definition for this kind of spec)`;
    case 'enum': return `one of ${p.allowedValues.map((v) => JSON.stringify(v)).join(', ')}`;
    case 'const': return JSON.stringify(p.allowedValue);
    case 'type': return `type ${p.type}`;
    case 'pattern': return `text matching ${p.pattern}${e.parentSchema?.description ? ` (${e.parentSchema.description})` : ''}`;
    case 'minItems': return `at least ${p.limit} item(s)`;
    case 'minLength': return 'non-empty text';
    case 'minimum': return `${p.limit} or more`;
    default: return e.message;
  }
}

const results = [];
for (const file of targets) {
  const errors = []; const warnings = [];
  const err = (path, what, exp) => errors.push({ path, what, expected: exp });
  const warn = (path, what) => warnings.push({ path, what });
  let spec;
  try { spec = yaml.load(readFileSync(file, 'utf8')); }
  catch (e) { err('/', `YAML does not parse: ${e.message.split('\n')[0]}`, 'valid YAML'); results.push({ file, kind: '?', errors, warnings }); continue; }
  const kind = spec?.status || 'code';

  // 1. schema
  if (!validate(spec)) {
    for (const e of validate.errors) {
      if (e.keyword === 'if' || e.keyword === 'allOf') continue; // wrappers; the real error is listed beside them
      const at = e.keyword === 'required' ? `${e.instancePath}/${e.params.missingProperty}` : e.keyword === 'additionalProperties' ? `${e.instancePath}/${e.params.additionalProperty}` : e.instancePath || '/';
      const got = e.keyword === 'required' ? 'missing' : e.keyword === 'additionalProperties' ? 'unknown field' : `got ${show(e.data)}`;
      err(at, got, expected(e));
    }
  }

  // 2. checks the schema cannot make
  if (spec && typeof spec === 'object') {
    if (basename(file) !== `${spec.name}.spec.yaml`) err('/name', `name ${show(spec.name)} does not match the file name`, `${basename(file).replace('.spec.yaml', '')}`);
    const tokenRows = Array.isArray(spec.tokens?.used) ? spec.tokens.used : [];
    // a code part may set its own custom property (in its .module.css or inline from its .tsx): local, not a BELLA token
    const ownSrc = (() => { try { const d = `${PARTS}/${spec.name}`; return readdirSync(d).filter((f) => /\.(css|tsx)$/.test(f) && !f.includes('.stories.')).map((f) => readFileSync(`${d}/${f}`, 'utf8')).join('\n'); } catch { return ''; } })();
    const local = (t) => kind === 'code' && new RegExp(`${t}\\s*:|['"\`]${t}['"\`]`).test(ownSrc);
    // read with a fallback, var(--x, 0px): a hook a parent may set (SidebarLayout --dock-height), not a missing BELLA token
    const hook = (t) => kind === 'code' && new RegExp(`var\\(\\s*${t}\\s*,`).test(ownSrc);
    const undeclared = [...new Set(tokenRows.map((r) => r?.token).filter((t) => t && !declared.has(t)))];
    const set = undeclared.filter(local), hooks = undeclared.filter((t) => !local(t) && hook(t));
    const locals = [...set, ...hooks];
    if (set.length) warn('/tokens/used', `${set.length} local custom propert${set.length > 1 ? 'ies' : 'y'} set by the part itself, not BELLA tokens: ${set.join(', ')}`);
    if (hooks.length) warn('/tokens/used', `${hooks.length} outside hook${hooks.length > 1 ? 's' : ''} read with a fallback (a parent sets it; not a BELLA token): ${hooks.join(', ')}`);
    tokenRows.forEach((r, i) => { if (r?.token && !declared.has(r.token) && !locals.includes(r.token)) err(`/tokens/used/${i}/token`, `${r.token} is not declared in tokens/bella.css`, 'an existing token (BELLA: "No new variables: bind only to existing tokens")'); });
    for (const [v, list] of Object.entries(spec.variants?.addTokens || {})) list.forEach((t, i) => { if (!declared.has(t)) err(`/variants/addTokens/${v}/${i}`, `${t} is not declared in tokens/bella.css`, 'an existing token'); });
    const enumOk = (path, values, def) => { if (Array.isArray(values) && def !== undefined && def !== null && !values.map(String).includes(String(def))) err(path, `default ${show(def)} is not one of the values`, `one of ${values.map(show).join(', ')}`); };
    (spec.props || []).forEach((p, i) => p && enumOk(`/props/${i}/default`, p.values, p.default));
    if (kind !== 'figma-only') for (const [k, v] of Object.entries(spec.variants || {})) v && enumOk(`/variants/${k}/default`, v.values, v.default);
    if (kind === 'figma-only' && spec.variants) {
      const { count, names = [], default: def } = spec.variants;
      if (count !== names.length) err('/variants/count', `count ${count} but ${names.length} names listed`, `${names.length}`);
      if (def && names.length && !names.includes(def)) err('/variants/default', `default ${show(def)} is not among the variant names`, 'one of variants.names');
      if (spec.tokens?.raw?.length) warn('/tokens/raw', `${spec.tokens.raw.length} value(s) not bound to a token in Figma: ${spec.tokens.raw.slice(0, 4).join(', ')}${spec.tokens.raw.length > 4 ? ', …' : ''}`);
      if (spec.tokens?.missingInCode?.length) warn('/tokens/missingInCode', `${spec.tokens.missingInCode.length} Figma token(s) with no CSS variable yet: ${spec.tokens.missingInCode.slice(0, 4).join(', ')}`);
    }
    if (kind === 'draft') {
      const parts = spec.anatomy?.parts || [];
      parts.forEach((p, i) => { if (p.n !== i + 1) err(`/anatomy/parts/${i}/n`, `numbered ${p.n}`, `${i + 1} (pins count 1, 2, 3 in order)`); });
      const partSet = new Set(['root', ...parts.map((p) => p.name)]);
      const dup = parts.map((p) => p.name).filter((n, i, a) => a.indexOf(n) !== i); if (dup.length) err('/anatomy/parts', `part name used twice: ${dup.join(', ')}`, 'one name per part');
      const props = new Map((spec.props || []).map((p) => [p.name, p]));
      parts.forEach((p, i) => { if (p.prop && !props.has(p.prop)) err(`/anatomy/parts/${i}/prop`, `no prop called ${p.prop}`, `one of ${[...props.keys()].join(', ')}`); });
      tokenRows.forEach((r, i) => {
        if (r.part && !partSet.has(r.part)) err(`/tokens/used/${i}/part`, `no anatomy part called ${r.part}`, `root or one of ${[...partSet].slice(1).join(', ')}`);
        if (r.variant) { const [k, v] = r.variant.split('='); const p = props.get(k); if (!p) err(`/tokens/used/${i}/variant`, `no prop called ${k}`, 'an enum or boolean prop'); else if (p.values && !p.values.map(String).includes(v)) err(`/tokens/used/${i}/variant`, `${k} has no value ${v}`, `one of ${p.values.join(', ')}`); }
      });
      for (const [k] of Object.entries(spec.variants || {})) { const p = props.get(k); if (!p) err(`/variants/${k}`, `variant axis ${k} has no prop`, 'a prop of type enum or boolean with the same name'); else if (!['enum', 'boolean'].includes(p.type)) err(`/variants/${k}`, `prop ${k} is ${p.type}`, 'enum or boolean (few variant axes)'); }
      for (const [k, p] of props) if (p.type === 'enum' && !spec.variants?.[k]) err(`/variants/${k}`, `enum prop ${k} is not a variant axis`, `variants.${k} with the same values and default`);
      (spec.composedOf || []).forEach((n, i) => { if (!specNames.has(n) && !partNames.has(n)) err(`/composedOf/${i}`, `${n} is not a BELLA part`, 'a part with a spec or a folder in bella-parts/src/components (Atomic: build from library parts)'); });
      parts.forEach((p, i) => { if (p.instanceOf && !(spec.composedOf || []).includes(p.instanceOf)) err(`/anatomy/parts/${i}/instanceOf`, `${p.instanceOf} is used but not in composedOf`, 'every instance listed in composedOf'); });
      const a = spec.a11y || {};
      const interactive = (a.keyboard || []).length > 0 || ['button', 'a', 'input', 'select', 'textarea'].includes(a.element) || /^(button|link|tab|menuitem|option|switch|checkbox|radio)$/.test(a.role || '');
      if (interactive && !(a.targetPx >= 44)) err('/a11y/targetPx', `interactive but target is ${show(a.targetPx)}`, '44 or more (BELLA: 44 tap targets)');
      if (!tokenRows.some((r) => r.part === 'root')) err('/tokens/used', 'no token on the root', 'at least one root row (surface, padding or gap)');
      const states = new Set(spec.states || []);
      tokenRows.forEach((r, i) => { const map = { hover: 'hover', 'focus-visible': 'focus', active: 'pressed', disabled: 'disabled', selected: 'selected', current: 'current', error: 'error' }; if (r.state && r.state !== 'rest' && !states.has(map[r.state])) err(`/tokens/used/${i}/state`, `row styles ${r.state} but states does not list ${map[r.state]}`, `states to include ${map[r.state]}`); });
      if (interactive && !tokenRows.some((r) => r.state === 'focus-visible')) err('/tokens/used', 'interactive but no focus-visible row', 'outline rows bound to --focus-ring-width and --color-border-focus');
    }
  }
  results.push({ file, kind, errors, warnings });
}

const failed = results.filter((r) => r.errors.length);
if (flag('--json')) process.stdout.write(JSON.stringify({ passed: results.length - failed.length, failed: failed.length, results: results.map((r) => ({ ...r, file: rel(r.file) })) }, null, 2) + '\n');
else {
  for (const r of results) {
    if (!r.errors.length && (flag('--quiet') || !r.warnings.length)) continue;
    console.log(`${r.errors.length ? 'FAIL' : 'pass'}  ${rel(r.file)}  (${r.kind})`);
    for (const e of r.errors) console.log(`  ✗ ${e.path}\n      wrong:    ${e.what}\n      expected: ${e.expected}`);
    if (!flag('--quiet')) for (const w of r.warnings) console.log(`  ! ${w.path}  ${w.what}`);
  }
  const byKind = {}; for (const r of results) { byKind[r.kind] ??= [0, 0]; byKind[r.kind][r.errors.length ? 1 : 0]++; }
  console.log(`\nspec-validate: ${results.length - failed.length} pass, ${failed.length} fail, ${results.reduce((n, r) => n + r.warnings.length, 0)} warnings · ${Object.entries(byKind).map(([k, [p, f]]) => `${k} ${p}/${p + f}`).join(' · ')}`);
}
if (!files.length && !flag('--json')) { // full run: also the Figma-name round trip (scripts/spec-figma-names.mjs)
  const { spawnSync } = await import('node:child_process');
  const r = spawnSync('node', [`${ROOT}/scripts/spec-figma-names.mjs`], { encoding: 'utf8' });
  console.log('\n' + r.stdout.trim().split('\n').slice(0, 2).join('\n') + (r.status ? '\n' + r.stdout.split('\n').filter((l) => /COLLIDE|MISSING/.test(l)).join('\n') + r.stderr : ''));
  if (r.status) failed.push({ names: true });
}
process.exitCode = failed.length ? 1 : 0; // exitCode, not exit(): exit() cuts a piped --json at 64 KB
