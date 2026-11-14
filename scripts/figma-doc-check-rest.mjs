#!/usr/bin/env node
// figma-doc-check-rest: the doc-page check that never touches the Figma plugin (13 Nov 2026).
// Same fail kinds and output shape as figma-doc-check.js, run in node over REST node JSON.
// Usage: node scripts/figma-doc-check-rest.mjs <nodes.json> [more.json ...] [--approved 718:126751,26:320] [--json out.json]
//        [--subject Pin|Leader] [--min-type 16] [--min-lh 1.5] [--has-focus] [--width-only-tag]
// Input: output of figma_get_file_data (verbosity 'full') for one page root or one section; several files are merged (fetch one section per file).
// Reads { nodes: { id: {...node} } }, a bare node, REST { nodes: { id: { document } } }, or an array of these.
// Output: { pass, counts, fails, notChecked, ms }. `pass` covers only what REST can show; read notChecked before trusting it.
import fs from 'node:fs';

const argv = process.argv.slice(2);
const files = [], opt = {};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--')) { const k = a.slice(2); const nxt = argv[i + 1]; if (nxt === undefined || nxt.startsWith('--')) opt[k] = true; else { opt[k] = nxt; i++; } }
  else files.push(a);
}
if (!files.length) { console.error('usage: node scripts/figma-doc-check-rest.mjs <nodes.json> [more.json] [--approved ids] [--json out.json]'); process.exit(2); }
const t0 = Date.now();
const minType = Number(opt['min-type'] || 16), minLH = Number(opt['min-lh'] || 1.5), cap = 40;

// ---- load roots
const roots = [];
const pull = (j) => {
  if (Array.isArray(j)) return j.forEach(pull);
  if (j && j.nodes && typeof j.nodes === 'object') return Object.values(j.nodes).forEach((v) => pull(v && v.document ? v.document : v));
  if (j && j.document && j.document.type !== 'DOCUMENT') return roots.push(j.document);
  if (j && j.type && j.id) roots.push(j);
};
for (const f of files) pull(JSON.parse(fs.readFileSync(f, 'utf8')));
if (!roots.length) { console.error('no nodes found in input'); process.exit(2); }

// ---- index
const all = [], byId = new Map(), parent = new Map(), depthOf = new Map();
const walk = (n, p, d) => { all.push(n); byId.set(n.id, n); parent.set(n.id, p); depthOf.set(n.id, d); for (const c of n.children || []) walk(c, n, d + 1); };
roots.forEach((r) => walk(r, null, 0));
const root = roots[0];
const P = (n) => parent.get(n.id) || null;
const within = (n, test) => { for (let p = n; p; p = P(p)) if (test(p)) return p; return null; };
const insideInstance = (n) => { for (let p = P(n); p; p = P(p)) if (p.type === 'INSTANCE') return p; return null; };
const vis = (n) => n.visible !== false;
const hiddenUp = (n) => !!within(n, (p) => p.visible === false);
const box = (n) => n.absoluteBoundingBox || null;
const rbox = (n) => n.absoluteRenderBounds || null;
const mainName = (n) => (n.type === 'INSTANCE' ? n.name : ''); // REST gives componentId only; the instance name stands in for the main name
const instances = all.filter((n) => n.type === 'INSTANCE');
const texts = all.filter((n) => n.type === 'TEXT');
const drawnText = texts.filter((n) => vis(n) && (n.characters || '').trim() && !hiddenUp(n));
const textsOf = (i) => { const out = []; const q = [i]; while (q.length) { const x = q.pop(); if (x.type === 'TEXT') out.push(x.characters || ''); (x.children || []).forEach((c) => q.push(c)); } return out; };
const sizing = (n) => [n.layoutSizingHorizontal, n.layoutSizingVertical];
const fillHug = (n) => sizing(n).some((s) => s === 'FILL' || s === 'HUG');
const overlap = (a, b) => a && b && a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 && a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1;
const ANNOT = /^(Pin|Pin label|Leader|Size tag|Measure|Doc \/ Measure tag|Bracket|Baseline|Target|Focus ring)/i;
const isAnnot = (n) => ANNOT.test(n.name || '');
const isCode = (n) => !!within(n, (p) => p.type === 'INSTANCE' && /^(CodeBlock|Code line)$/.test(p.name));

const fails = [], counts = {};
const fail = (check, n, detail) => { counts[check] = (counts[check] || 0) + 1; if (counts[check] <= cap) fails.push({ check, node: n ? `${n.id} ${n.name}` : '', detail }); };
const sectionMemo = new Map();
const sectionOf = (n) => { if (!sectionMemo.has(n.id)) sectionMemo.set(n.id, within(n, (p) => /^Section/.test(p.name)) || root); return sectionMemo.get(n.id); };
const isDoc = all.some((n) => /^Section · /.test(n.name));
const subject = opt.subject || null;

// ---- 2. style overrides on instances (the REST `overrides` array carries the same fields as the plugin)
{
  const CONTENT = new Set(['characters', 'text', 'componentProperties', 'name', 'exposedInstances', 'pluginData', 'sharedPluginData', 'componentPropertyReferences', 'annotations']);
  const rootModes = !!(root.explicitVariableModes && Object.keys(root.explicitVariableModes).length);
  const inSpec = (n) => !!within(n, (p) => /^Specimen · scaled/.test(p.name));
  const seen = new Set(); let unresolved = 0;
  for (const i of instances) for (const ov of i.overrides || []) {
    const node = byId.get(ov.id);
    if (!node) { unresolved++; continue; }
    const textChanged = ov.overriddenFields.includes('characters');
    for (const f of ov.overriddenFields) {
      if (CONTENT.has(f)) continue;
      if (f === 'styledTextSegments' && textChanged) continue;
      if (['layoutPositioning', 'width', 'height', 'rotation', 'x', 'y'].includes(f) && ANNOT.test(mainName(node) || node.name)) continue;
      if (['primaryAxisSizingMode', 'counterAxisSizingMode'].includes(f) && fillHug(node)) continue;
      if (['width', 'height', 'fontSize', 'lineHeight', 'letterSpacing', 'strokeWeight', 'cornerRadius', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing', 'effects', 'boundVariables', 'textAutoResize'].includes(f) && inSpec(node)) continue;
      if (f === 'explicitVariableModes' && /^(CodeBlock|Code line)$/.test(i.name)) continue;
      if (f === 'explicitVariableModes' && node === root) continue;
      if (f === 'effects' && rootModes) continue;
      if (f === 'visible' && node.componentPropertyReferences && node.componentPropertyReferences.visible) continue;
      if ((f === 'width' || f === 'height') && fillHug(node)) continue;
      if ((f === 'fills' || f === 'styledTextSegments' || f === 'textStyleId') && node.type === 'TEXT' && isCode(node)) continue;
      const key = ov.id + '|' + f; if (seen.has(key)) continue; seen.add(key);
      fail('override', node, `${i.name}: ${f}`);
    }
  }
  if (unresolved) counts.overrideUnresolved = unresolved; // override ids below the fetched depth: not a fail, listed in notChecked
}

// ---- 3. code runs: bound to a syntax variable (needs per-run fills: not in REST for runs; whole-node binding only)
const codeNote = [];
for (const t of drawnText.filter(isCode)) {
  const b = t.boundVariables && (t.boundVariables.fills || (t.fills && t.fills[0] && t.fills[0].boundVariables && t.fills[0].boundVariables.color));
  if (!b && !(t.styleOverrideTable && Object.keys(t.styleOverrideTable).length)) fail('code', t, `"${(t.characters || '').slice(0, 20)}" not bound to a variable (REST shows no variable name: syntax binding not verified)`);
}

// ---- 4. pins numbered 01..n, leader ends
const SECTIONS = new Map();
for (const i of instances) { const mn = mainName(i); if (mn !== 'Pin' && mn !== 'Pin label') continue; const s = sectionOf(i); if (!SECTIONS.has(s)) SECTIONS.set(s, []); SECTIONS.get(s).push(i); }
for (const [sec, insts] of SECTIONS) {
  const kinds = { Pin: [], 'Pin label': [] }; let registered = false;
  for (const i of insts) {
    const mn = mainName(i);
    if (subject === 'Pin' && mn === 'Pin') continue;
    const ii = insideInstance(i); if (ii && /^Pin/.test(mainName(ii))) continue;
    const num = textsOf(i).find((c) => /^\d{2}$/.test(c)); if (!num) continue;
    kinds[mn].push(num); registered = true;
  }
  if (!registered) continue;
  const names = {};
  for (const i of insts) { if (mainName(i) !== 'Pin label') continue; const tx = textsOf(i); const num = tx.find((c) => /^\d{2}$/.test(c)), label = tx.find((c) => !/^\d{2}$/.test(c)); if (!num) continue; if (names[num] && names[num] !== label) fail('pins', sec, `${num} names two parts: ${names[num]} and ${label}`); names[num] = label; }
  const nums = [...new Set([...kinds.Pin, ...kinds['Pin label']])].map(Number).sort((a, b) => a - b);
  nums.forEach((n, k) => { if (n !== k + 1) fail('pins', sec, `numbers ${nums.map((x) => String(x).padStart(2, '0')).join(',')} are not 01..${nums.length}`); });
  for (const kind of ['Pin', 'Pin label']) { const s = new Set(); for (const n of kinds[kind]) { if (s.has(n)) fail('pins', sec, `${kind} ${n} appears twice`); s.add(n); } }
}
const ANNOT2 = /^(Pin|Pin label|Leader|Size tag|Doc \/ Measure tag|Bracket|Baseline|Target|Focus ring)$/i;
const BR = /^(Bracket|Measure)(\s|·|$)/i;
const isSubjLeader = (p) => p.type === 'INSTANCE' && p.name === 'Leader' && !(subject === 'Leader' && !(P(p) && (P(p).children || []).some((c) => c.type === 'INSTANCE' && c.name === 'Pin label')));
const leaders = instances.filter((i) => i.name === 'Leader' && vis(i) && isSubjLeader(i));
const bySec = new Map(); for (const x of all) { const s = sectionOf(x); if (!bySec.has(s)) bySec.set(s, []); bySec.get(s).push(x); }
const annotIds = new Set(instances.filter((i) => ANNOT2.test(i.name) || i.name === 'Grid').map((i) => i.id));
const hasPaint = (x) => ['fills', 'strokes'].some((k) => Array.isArray(x[k]) && x[k].some((p) => p.visible !== false && (p.opacity === undefined || p.opacity > 0)));
const targetsMemo = new Map();
const targetsOf = (sec) => { if (targetsMemo.has(sec)) return targetsMemo.get(sec); const out = []; for (const x of bySec.get(sec) || []) { if (!vis(x) || !['TEXT', 'INSTANCE', 'VECTOR', 'RECTANGLE'].includes(x.type)) continue; if (isAnnot(x) || within(x, isSubjLeader)) continue; const b = box(x); if (b) out.push(b); } targetsMemo.set(sec, out); return out; };
const inkMemo = new Map();
const inkOf = (sec) => {
  if (inkMemo.has(sec)) return inkMemo.get(sec); const out = [];
  for (const x of bySec.get(sec) || []) {
    if (!vis(x) || x === root) continue;
    let b = null, edge = false;
    if (x.type === 'TEXT') { if (!(x.characters || '').trim()) continue; b = rbox(x); }
    else if (['VECTOR', 'LINE', 'STAR', 'REGULAR_POLYGON', 'ELLIPSE', 'BOOLEAN_OPERATION', 'RECTANGLE', 'FRAME', 'INSTANCE', 'COMPONENT'].includes(x.type)) {
      if (!hasPaint(x) && !BR.test(x.name)) continue; b = box(x);
      if (b && Math.min(b.width, b.height) > 48 && (b.width * b.height > 40000 || !(Array.isArray(x.fills) && x.fills.some((p) => p.visible !== false && (p.opacity === undefined || p.opacity > 0))))) edge = true;
      if (BR.test(x.name)) edge = false;
    } else continue;
    if (!b) continue;
    if (within(x, (p) => p.visible === false || annotIds.has(p.id))) continue;
    if (b.width > (box(sec) ? box(sec).width : 1e9) * 0.9 && x.type !== 'TEXT') continue;
    out.push({ b, edge, x });
  }
  inkMemo.set(sec, out); return out;
};
for (const l of leaders) {
  const dots = []; const q = [l]; while (q.length) { const x = q.pop(); if (x.type === 'ELLIPSE' && vis(x)) dots.push(x); (x.children || []).forEach((c) => q.push(c)); }
  const dot = dots[dots.length - 1]; if (!dot) continue; // REST order differs from findAll; last-in-tree is the closest stand-in
  const d = box(dot); if (!d) continue; const sec = sectionOf(l);
  const cx = d.x + d.width / 2, cy = d.y + d.height / 2;
  const sb = box(sec);
  if (!targetsOf(sec).some((b) => cx >= b.x - 4 && cx <= b.x + b.width + 4 && cy >= b.y - 4 && cy <= b.y + b.height + 4 && (!sb || b.width < sb.width * 0.9))) fail('pins', l, 'leader end does not land within 4px of a part');
  const par = P(l); const wr = par && par.type === 'FRAME' && /^Leader/.test(par.name) ? box(par) : null;
  const pts = wr ? [[wr.x, wr.y + wr.height / 2], [wr.x + wr.width, wr.y + wr.height / 2]] : [[cx, cy]];
  let best = Infinity, bx = null;
  for (const [px, py] of pts) for (const it of inkOf(sec)) {
    if (it.x === dot || within(it.x, (p) => p === l)) continue;
    const b = it.b, dx = Math.max(b.x - px, 0, px - (b.x + b.width)), dy = Math.max(b.y - py, 0, py - (b.y + b.height));
    let dist = Math.hypot(dx, dy);
    if (it.x.type === 'TEXT') dist = Math.max(0, dist - d.width / 2);
    if (it.edge && dist === 0) dist = Math.min(px - b.x, b.x + b.width - px, py - b.y, b.y + b.height - py);
    if (dist < best) { best = dist; bx = it.x; }
  }
  if (best > 4) fail('leaderMiss', l, best === Infinity ? 'leader end has nothing visible to point at' : `leader end is ${Math.round(best)}px from the nearest visible part (${bx.type} "${bx.type === 'TEXT' ? (bx.characters || '').slice(0, 20) : bx.name}")`);
}
// pinOverText
if (subject !== 'Pin') {
  const ts = drawnText.map((t) => ({ t, b: box(t), r: rbox(t) }));
  for (const pin of instances.filter((i) => vis(i) && i.name === 'Pin' && !hiddenUp(P(i) || i))) {
    const pb = box(pin); if (!pb) continue;
    for (const { t, b: tb, r: rb } of ts) {
      if (!tb || !rb) continue;
      if (Math.min(pb.x + pb.width, tb.x + tb.width) - Math.max(pb.x, tb.x) <= 2 || Math.min(pb.y + pb.height, tb.y + tb.height) - Math.max(pb.y, tb.y) <= 2) continue;
      if (within(t, (p) => p === pin || p.visible === false || (p.type === 'INSTANCE' && ANNOT2.test(p.name)) || (p.type !== 'TEXT' && ANNOT2.test(p.name)))) continue;
      const ox = Math.min(pb.x + pb.width, rb.x + rb.width) - Math.max(pb.x, rb.x), oy = Math.min(pb.y + pb.height, rb.y + rb.height) - Math.max(pb.y, rb.y);
      if (ox > 2 && oy > 2) fail('pinOverText', pin, `pin sits on "${(t.characters || '').slice(0, 20)}" (${Math.round(ox)} x ${Math.round(oy)}px overlap)`);
    }
  }
}

// ---- 5. layout: overlaps, outside parent, rows fill and share height
for (const n of all) {
  if (!n.children || !n.children.length || n.type === 'INSTANCE' || insideInstance(n)) continue;
  const kids = n.children.filter((c) => vis(c) && !isAnnot(c) && !ANNOT.test(mainName(c)));
  const free = !n.layoutMode || n.layoutMode === 'NONE' ? kids : kids.filter((c) => c.layoutPositioning === 'ABSOLUTE');
  for (let a = 0; a < free.length; a++) for (let b = a + 1; b < free.length; b++) if (overlap(box(free[a]), box(free[b]))) fail('layout', free[a], `overlaps ${free[b].id} ${free[b].name}`);
  const pb = box(n);
  if (pb && n.type !== 'SECTION' && n.type !== 'CANVAS') for (const c of kids) { const cb = box(c); if (cb && (cb.x < pb.x - 1 || cb.y < pb.y - 1 || cb.x + cb.width > pb.x + pb.width + 1 || cb.y + cb.height > pb.y + pb.height + 1)) fail('layout', c, `sticks out of ${n.name}`); }
  if (n.layoutMode === 'VERTICAL' && n.layoutSizingHorizontal !== 'HUG') {
    const rows = kids.filter((c) => (c.type === 'FRAME' || c.type === 'INSTANCE') && c.layoutPositioning !== 'ABSOLUTE');
    if (rows.length > 1) for (const r of rows) if (r.layoutSizingHorizontal !== 'FILL') fail('layout', r, `row in ${n.name} is ${r.layoutSizingHorizontal}, not FILL`);
    const named = rows.filter((r) => /row/i.test(r.name));
    if (named.length > 1) { const h = named.map((r) => Math.round((box(r) || {}).height || 0)); if (Math.max(...h) - Math.min(...h) > 1) fail('layout', n, `rows differ in height: ${h.join(', ')}`); }
  }
}
if (root.type === 'CANVAS') for (const c of root.children || []) if (!['FRAME', 'SECTION', 'COMPONENT', 'COMPONENT_SET'].includes(c.type)) fail('layout', c, 'loose on the canvas, not in a block frame');

// ---- 5b. clipped, overlapText, chipClip, midWordBreak
const clipAnc = (t, f) => { for (let cp = P(t), h = 0; cp && h < 40; cp = P(cp), h++) { if (!cp.clipsContent) continue; if (cp.name === 'Roll') return null; const r = f(cp); if (r) return cp; } return null; };
const outside = (tb, cb) => cb && (tb.x < cb.x - 1 || tb.x + tb.width > cb.x + cb.width + 1 || tb.y < cb.y - 1 || tb.y + tb.height > cb.y + cb.height + 1);
for (const t of drawnText) { const tb = box(t); if (!tb) continue; const cp = clipAnc(t, (c) => outside(tb, box(c))); if (cp) fail('clipped', t, `"${t.characters.slice(0, 20)}" is cut off by ${cp.name}`); }
for (const n of all) { const ts = (n.children || []).filter((c) => c.type === 'TEXT' && vis(c) && (c.characters || '').trim()); for (let a = 0; a < ts.length; a++) for (let b = a + 1; b < ts.length; b++) if (overlap(box(ts[a]), box(ts[b]))) fail('clipped', ts[a], `text overlaps "${ts[b].characters.slice(0, 20)}"`); }
const CHIPY = /\b(chip|pill|tag|badge|tab|row|cell)s?\b/i;
const topOf = (n) => { let p = n; while (P(p)) p = P(p); return p; };
for (const t of drawnText.filter((x) => !isCode(x))) {
  let c = null;
  for (let p = P(t), h = 0; p && h < 6; p = P(p), h++) { if (!['FRAME', 'INSTANCE', 'COMPONENT'].includes(p.type)) continue; if (CHIPY.test(p.name)) { c = p; break; } }
  if (!c) continue;
  const tb = box(t), cb = box(c); if (!tb || !cb) continue;
  if (t.textTruncation === 'ENDING' || (t.style && t.style.textTruncation === 'ENDING')) fail('chipClip', t, `"${t.characters.slice(0, 20)}" in ${c.name} is truncated with an ellipsis`);
  const lay = c.layoutMode && c.layoutMode !== 'NONE' && P(t) === c && t.layoutPositioning !== 'ABSOLUTE';
  const pl = lay ? c.paddingLeft || 0 : 0, pr = lay ? c.paddingRight || 0 : 0, pt = lay ? c.paddingTop || 0 : 0, pbm = lay ? c.paddingBottom || 0 : 0;
  const ix = cb.x + pl, iy = cb.y + pt, iw = cb.width - pl - pr, ih = cb.height - pt - pbm, rb = rbox(t) || tb;
  if (tb.x < ix - 1.5 || tb.x + tb.width > ix + iw + 1.5 || rb.y < iy - 1.5 || rb.y + rb.height > iy + ih + 1.5) fail('chipClip', t, `"${t.characters.slice(0, 20)}" (${Math.round(tb.width)} x ${Math.round(tb.height)}) does not fit the inside of ${c.name} (${Math.round(iw)} x ${Math.round(ih)})`);
  else { const cp = clipAnc(t, (k) => outside(tb, box(k))); if (cp) fail('chipClip', t, `"${t.characters.slice(0, 20)}" in ${c.name} is cut off by ${cp.name}`); }
}
{ // midWordBreak, same calibration as the plugin check
  const calib = new Map();
  for (const x of texts) { const s = x.style; if (!s || !vis(x) || s.textAutoResize !== 'WIDTH_AND_HEIGHT' || (x.characters || '').length < 4 || /\n/.test(x.characters)) continue; const b = box(x); if (!b || b.height > s.fontSize * 2.2) continue; const k = s.fontFamily + '|' + s.fontStyle + '|' + s.fontSize; const e = calib.get(k) || { w: 0, c: 0 }; e.w += b.width; e.c += x.characters.length; calib.set(k, e); }
  for (const t of drawnText.filter((x) => !isCode(x))) {
    const s = t.style; const tb = box(t); if (!s || !tb || s.textAutoResize === 'WIDTH_AND_HEIGHT' || s.textAutoResize === 'TRUNCATE' || tb.height < 24) continue;
    const fs = s.fontSize, lhpx = s.lineHeightPx || fs * 1.3, nLines = tb.height / lhpx; if (nLines < 1.6) continue;
    const words = t.characters.split(/[\s\-–—\/]+/).filter(Boolean); if (!words.length) continue;
    if (words.length === 1) { fail('midWordBreak', t, `"${words[0].slice(0, 24)}" is one word on ${Math.round(nLines)} lines (${Math.round(tb.width)}px wide)`); continue; }
    const e = calib.get(s.fontFamily + '|' + s.fontStyle + '|' + fs), k = e && e.c >= 12 ? e.w / e.c : fs * (/Mono/i.test(s.fontFamily) ? 0.6 : 0.55);
    const longest = words.reduce((a, w) => (w.length > a.length ? w : a), ''), est = longest.length * k;
    if (est > tb.width * 1.15) fail('midWordBreak', t, `"${longest.slice(0, 24)}" is about ${Math.round(est)}px, wider than the ${Math.round(tb.width)}px text box, so it breaks mid-word`);
  }
}

// ---- 6. type floor and reading line height (runs: base style plus styleOverrideTable)
for (const t of texts.filter((x) => vis(x))) {
  const base = t.style || {}, tbl = t.styleOverrideTable || {}, ch = t.characterStyleOverrides || [], chars = t.characters || '';
  const used = new Map(); // style id -> sample text
  for (let i = 0; i < chars.length; i++) { const id = ch[i] || 0; if (!chars[i].trim()) { if (used.has(id)) used.set(id, used.get(id) + chars[i]); continue; } used.set(id, (used.get(id) || '') + chars[i]); }
  for (const [id, sample] of used) {
    const s = id ? { ...base, ...tbl[id] } : base; if (!s.fontSize) continue;
    if (s.fontSize < minType) fail('type', t, `${s.fontSize}px "${sample.slice(0, 20)}"`);
    const reading = chars.length > 60 && !/Mono/i.test(s.fontFamily || '') && !isCode(t);
    if (reading) { const lh = (s.lineHeightPx || s.fontSize * 1.2) / s.fontSize; if (lh < minLH - 0.01) fail('type', t, `line height ${lh.toFixed(2)} on reading text`); }
  }
}

// ---- 7. raw colours (page-owned nodes, not inside instances), stand-ins
const bound = (n, key, p) => !!((p.boundVariables && p.boundVariables.color) || (n.boundVariables && n.boundVariables[key] && [].concat(n.boundVariables[key]).length));
for (const n of all) {
  if (n.type === 'INSTANCE' || insideInstance(n) || n.type === 'CANVAS') continue;
  for (const key of ['fills', 'strokes']) { if (!Array.isArray(n[key])) continue; n[key].forEach((p) => { if (p.type === 'SOLID' && p.visible !== false && !bound(n, key, p)) fail('colour', n, `raw ${key.slice(0, -1)} rgb(${Math.round(p.color.r * 255)},${Math.round(p.color.g * 255)},${Math.round(p.color.b * 255)})`); }); }
}
for (const n of all) {
  if (n.type !== 'FRAME' || insideInstance(n) || n === root) continue;
  const stroked = Array.isArray(n.strokes) && n.strokes.some((s) => s.visible !== false) && (n.strokeWeight || 0) > 0;
  const rounded = (n.cornerRadius || 0) > 0;
  const q = [n]; let hasText = false, hasInst = false; while (q.length) { const x = q.pop(); if (x !== n && x.type === 'TEXT') hasText = true; (x.children || []).forEach((c) => q.push(c)); }
  hasInst = (n.children || []).some((c) => c.type === 'INSTANCE');
  if (stroked && rounded && hasText && !hasInst) fail('stand-in', n, 'drawn like a component; use an instance');
}

// ---- 9. reviewer assertions (doc pages)
if (isDoc) {
  const secs = all.filter((n) => /^Section · /.test(n.name) && vis(n));
  const lines = (t) => Math.round(((box(t) || { height: 0 }).height / ((t.style && t.style.lineHeightPx) || ((t.style && t.style.fontSize) || 16) * 1.25)) * 10) / 10;
  // A2 pinOrder
  for (const sec of secs) {
    const items = [];
    for (const l of all.filter((n) => n.type === 'INSTANCE' && vis(n) && n.name === 'Pin label' && within(n, (p) => p === sec) && !(insideInstance(n) && insideInstance(n).name === 'Pin label'))) { const num = textsOf(l).find((c) => /^\d{2}$/.test(c)), b = box(l); if (num && b) items.push({ l, num: Number(num), b }); }
    const ord = [...items].sort((a, b) => (Math.abs(a.b.y - b.b.y) < 12 ? a.b.x - b.b.x : a.b.y - b.b.y));
    ord.forEach((it, k) => { if (k > 0 && it.num < ord[k - 1].num) fail('pinOrder', it.l, `pin ${String(it.num).padStart(2, '0')} reads after ${String(ord[k - 1].num).padStart(2, '0')} (top to bottom, left to right)`); });
    for (let a = 0; a < items.length; a++) for (let c = a + 1; c < items.length; c++) { const A = items[a].b, B = items[c].b, gx = Math.max(B.x - (A.x + A.width), A.x - (B.x + B.width)), gy = Math.max(B.y - (A.y + A.height), A.y - (B.y + B.height)); if (Math.max(gx, gy) < 8) fail('pinOrder', items[a].l, `label ${items[a].num} is ${Math.round(Math.max(gx, gy))}px from label ${items[c].num}, needs 8`); }
  }
  // A3 rowHeights
  const ROWS = ['Doc / State row', 'Doc / When-to-use card', 'Do / Don’t card', 'Doc / Properties row'];
  for (const n of all) {
    if (!n.children || (n.type === 'INSTANCE' && ROWS.includes(n.name))) continue;
    const kids = n.children.filter((c) => vis(c) && c.type === 'INSTANCE' && ROWS.includes(c.name)); if (kids.length < 2) continue;
    const m0 = kids[0].name, same = kids.filter((c) => c.name === m0);
    if (m0 === 'Doc / Properties row') { const w = same.map((c) => Math.round((box(c) || {}).width || 0)); if (Math.max(...w) - Math.min(...w) > 1) fail('rowHeights', n, `properties rows differ in width: ${w.join(', ')}`); continue; }
    const hs = same.map((c) => Math.round((box(c) || {}).height || 0)); if (Math.max(...hs) - Math.min(...hs) > 1) fail('rowHeights', n, `${m0} heights differ: ${hs.join(', ')}`);
    if (n.layoutMode === 'VERTICAL') for (const c of same) { const pb = box(n), cb = box(c); if (pb && cb && Math.abs(pb.width - cb.width) > 1) fail('rowHeights', c, `${m0} is ${Math.round(cb.width)} wide in a ${Math.round(pb.width)} stack`); }
  }
  // A4 oneLine
  for (const t of drawnText) {
    if (isCode(t)) continue;
    const inHeader = within(t, (p) => p.type === 'INSTANCE' && p.name === 'Component header');
    const sp = within(t, (p) => p.type === 'INSTANCE' && p.name === 'Doc / Specimen');
    const caption = /^(Intro|Caption|Lead|Line|Subtitle|Rule|ARIA|Note)$/.test(t.name) && !inHeader;
    if (inHeader && /^(Lead|Intro|Description)$/.test(t.name)) { if (lines(t) > 2.5) fail('oneLine', t, `header lead is ${lines(t)} lines, max 2`); continue; }
    if ((sp || caption) && lines(t) > 1.6) fail('oneLine', t, `"${t.characters.slice(0, 30)}" wraps to ${Math.round(lines(t))} lines`);
  }
  // A5 overviewNoMeasure
  for (const sec of secs.filter((s) => /Overview$/.test(s.name))) for (const t of texts.filter((x) => vis(x) && within(x, (p) => p === sec))) if (/\d+\s?px|\d+:\d|×/.test(t.characters || '') && !within(t, (p) => p.type === 'INSTANCE' && p.name === 'Doc / Specimen')) fail('overviewNoMeasure', t, `"${t.characters.slice(0, 30)}" is a measurement; it belongs in Accessibility`);
  // A6 focusRingRow
  { const block = all.find((n) => n.type === 'INSTANCE' && n.name === 'Doc / Contrast block');
    const hasFocus = opt['has-focus'] ? true : all.some((n) => n.type === 'INSTANCE' && n.name === 'Doc / State row' && /Focus/i.test(n.name)) || all.some((n) => n.type === 'INSTANCE' && /^State · /.test(n.name) && /Focus/i.test(n.name));
    if (hasFocus && block && !texts.some((x) => within(x, (p) => p === block) && /focus/i.test(x.characters || '') && /Pair|Label|Name/.test(x.name))) fail('focusRingRow', block, 'the component has a focus state but Contrast has no focus-ring row'); }
  // A7 noPlaceholderText
  for (const t of texts.filter((x) => vis(x))) { if (t.characters === ' ' && !isCode(t)) fail('placeholderText', t, 'text is a single space'); if (/^Do this, not that\.?$/i.test((t.characters || '').trim())) fail('placeholderText', t, 'placeholder "Do this, not that."'); }
  // A8 centred
  for (const sec of secs) {
    const stage = all.find((n) => n.name === 'Stage' && n.type === 'FRAME' && within(n, (p) => p === sec)); if (!stage) continue;
    const content = (stage.children || []).find((n) => n.type === 'SLOT' && n.name === 'Content') || (stage.children || []).find((n) => n.name === 'Content'); if (!content) continue;
    const bs = (content.children || []).filter(vis).map(box).filter(Boolean), sb = box(stage); if (!bs.length || !sb) continue;
    const left = Math.min(...bs.map((b) => b.x)) - sb.x, right = sb.x + sb.width - Math.max(...bs.map((b) => b.x + b.width));
    if (Math.abs(left - right) > 8) fail('centred', sec, `${sec.name.replace('Section · ', '')}: left gap ${Math.round(left)}, right gap ${Math.round(right)}`);
  }
  // A10 captionWords
  for (const t of drawnText) { if (isCode(t) || !/^(Intro|Caption|Lead|Line|Subtitle|Rule|ARIA|Note|Description)$/.test(t.name)) continue; const bad = t.characters.match(/aria-|transform|box-shadow|\.tsx|\.css|:\d+/i); if (bad) fail('captionWords', t, `"${t.characters.slice(0, 40)}" has "${bad[0]}": say what a reader sees, not the CSS or ARIA`); }
  // A11 focusRingTags
  const sizeTagText = (n) => { const out = []; const q = [n]; while (q.length) { const x = q.pop(); if (x.type === 'TEXT') out.push(x.characters || ''); (x.children || []).forEach((c) => q.push(c)); } return out.join(' '); };
  for (const fc of all.filter((n) => /^Card · Focus ring/.test(n.name) && vis(n))) { const tags = all.filter((n) => n.type === 'INSTANCE' && n.name === 'Size tag' && within(n, (p) => p === fc)).map(sizeTagText); for (const w of ['width', 'offset', 'radius']) if (!tags.some((x) => new RegExp(w, 'i').test(x))) fail('focusRingTags', fc, `no ${w} tag on the focus ring (has: ${tags.join(' | ') || 'none'})`); }
  if (!opt['width-only-tag']) for (const mc of all.filter((n) => /^Card · Measure/.test(n.name) && vis(n))) for (const tg of all.filter((n) => n.type === 'INSTANCE' && n.name === 'Size tag' && within(n, (p) => p === mc))) { const tx = sizeTagText(tg); if (!/^\d+(\.\d+)? × \d+(\.\d+)?$/.test(tx.trim())) fail('focusRingTags', tg, `size tag reads "${tx}", not "W × H"`); }
  // A13 reducedMotionX
  for (const t of texts.filter((x) => vis(x) && /^Reduced motion/.test(x.characters || ''))) { const sec = within(t, (p) => /^Section · /.test(p.name)); const slot = sec && all.find((n) => n.type === 'SLOT' && within(n, (p) => p === sec)); const tb = box(t), sb = slot && box(slot); if (tb && sb && Math.abs(tb.x - sb.x) > 2) fail('reducedMotionX', t, `reduced-motion line starts at x ${Math.round(tb.x - sb.x)} inside the section; the content edge is 0`); }
  // A14 noCardInCard
  const SELF = new Set(['Card', 'ResourceCard', 'Stat']);
  for (const sp of all.filter((n) => n.type === 'INSTANCE' && n.name === 'Card' && vis(n) && !within(P(n) || n, (p) => /^Don.t · /.test(p.name)))) { const hit = all.find((n) => n !== sp && n.type === 'INSTANCE' && SELF.has(n.name) && within(n, (p) => p === sp)); if (hit) fail('noCardInCard', sp, `${hit.name} sits inside a specimen Card; a component that is a card goes straight on the stone stage`); }
}

// ---- what REST cannot show
const notChecked = [
  'overrides vs the main component: only the REST overrides[] list is read; values are not compared to the main (no component fetch)',
  'main component names: not in REST nodes; instance names stand in (a renamed Pin, Leader or Doc / Specimen is missed)',
  'template key (Doc / Component page) and Section · structure per page: componentId has no library key in this data',
  'code-run syntax variable names and per-run contrast: REST has no variable names or per-run fills (only whole-node binding is tested)',
  'plugin-only checks: A9 scale, A12 codeNamesPage, A15 scaledText (need main component text), deprecated, sameAsDefault, descriptions',
  'textTruncation on runs, hidden-by-property booleans, and any node below the fetched depth',
];
const trunc = instances.filter((i) => (!i.children || !i.children.length) && vis(i)).length;
if (trunc) notChecked.push(`${trunc} visible instances came back without children (depth limit): their inner text, pins and leaders were not read`);
if (counts.overrideUnresolved) notChecked.push(`${counts.overrideUnresolved} override ids point below the fetched depth`);
const approved = String(opt.approved || '').split(',').map((s) => s.trim()).filter(Boolean);
const missing = approved.filter((id) => !byId.has(id));
if (approved.length && missing.length) notChecked.push(`approved ids not in the fetched data (cannot show existence): ${missing.join(', ')}`);
if (!approved.length) notChecked.push('approved ids: none given');

const result = { pass: fails.length === 0, passScope: 'REST-checkable checks only; see notChecked', counts, fails, notChecked, ms: { total: Date.now() - t0, nodes: all.length, instances: instances.length, texts: texts.length } };
if (opt.json && opt.json !== true) fs.writeFileSync(opt.json, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
process.exit(result.pass ? 0 : 1);
