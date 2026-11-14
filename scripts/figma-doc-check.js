// figma-doc-check: the one check every Figma build passes before Elleta sees it (12 Nov 2026).
// Read-only. Plain plugin-API JS, run through the Desktop Bridge (figma_execute) or use_figma.
// The top-level `return` is for the plugin runner, which wraps code in an async function (node --check rejects it).
// Set CHECK_OPTS first, then paste this file after it:
//   const CHECK_OPTS = { fileKey: '9R4rDMroYpx0lfMB75lBE6', target: '452:20540', approved: ['452:20540'], budgetMs: 12000 };
// PROTOCOL (13 Nov, sections): a doc page (instance of Doc / Component page) is NEVER walked whole. Without CHECK_OPTS.section a doc-page target returns at once
//   { pass: null, partial: true, sections: [ids], names, hint } after reading only the page's direct structure (the units that hold the Section · frames: header, sections, footer).
//   1. part: 'page' once: template, approved ids, root Chip mode; returns { sections, names, hasFocus, rootChip }. Pass hasFocus on to every unit call (CHECK_OPTS.hasFocus).
//   2. for each id in sections: for each part in overrides | layout | text | paint | rules: CHECK_OPTS = { ...opts, part, section: id }, looped on cursor until a call returns without `partial`.
//   3. CHECK_OPTS = { merge: [every result, in order] }: passed only when the page result passed and every section x part has a final (non-partial) result with no fails.
//   Non-doc targets (a section frame, a block, a small page) still run whole, or per part with merge, as before.
// TIME BUDGET (13 Nov): no call can run long. The tree walk and every part are resumable. When Date.now() - start > budgetMs (default 12000) the call stops and returns
//   { pass: null, partial: true, part, step, cursor, section, counts, fails }. Pass cursor back: CHECK_OPTS = { ...sameOpts, cursor: r.cursor }. Loop until a call returns without `partial`.
//   The walk is chunked: a call that runs out of time while walking returns part 'walk' with cursor.walk; the walked node list is kept in globalThis.__docCheckWalk (keyed by cursor.walkId) and the next call continues it.
//   If the sandbox drops that cache, the resumed call walks the unit in one go (no worse than before). Every call does at least one item, so a loop always advances.
//   The cursor carries the resolved main-component names ({ mains }). Pass the SAME part, target and section on every call of a loop. A call without a cursor always walks fresh (no stale cache across parts).
// Options: fileKey (required), target (node id to check; ANY node, so a builder can check one section at a time), approved (ids that must exist), docPage (true: root must be Doc / Component page),
//   section (id of one unit of a doc page; see PROTOCOL), hasFocus (from the page result), descriptions (true: check component descriptions in target), budgetMs (12000), cursor (resume),
//   widthOnlyTag, codeExempt[], reducedMotionText, selfCards[], deprecated[], sameAsDefault[] (12 Nov night rules A10-A14 and 29-31, see the rules block), minType (16), minLineHeight (1.5).
//   13 Nov round 10: specText [strings the spec gave for pictures: Overview / When to use pictures showing 'Label' / 'Button' / 'Design systems' outside it fail placeholder; 'Design systems' fails even without it], sizes (number: size specimens the Sizes section must show), sizeCountSkip [prop names].
// Returns { pass, counts, fails: [{ check, node, detail }] } (pass is null on a partial). Fails are capped per check (maxPerCheck, 40).

// H:begin (pure helpers of the 13 Nov round 10 checks; mock-tested in node)
const DC_DEFAULT_WORDS = ['Design systems', 'Label', 'Button'];
function dcDist(cx, cy, b) { return Math.hypot(Math.max(b.x - cx, 0, cx - (b.x + b.width)), Math.max(b.y - cy, 0, cy - (b.y + b.height))); }
function dcStrictlyIn(cx, cy, b, m) { m = m == null ? 1 : m; return cx > b.x + m && cx < b.x + b.width - m && cy > b.y + m && cy < b.y + b.height - m; }
function dcSpread(a) { return a.length ? Math.max(...a) - Math.min(...a) : 0; }
function dcValueCount(txt) { const t = String(txt || '').trim(); if (!/^[\w.+-]+( · [\w.+-]+)+$/.test(t)) return 0; return t.split(' · ').filter((x) => x !== 'required').length; }
function dcDefaultWordFails(texts, specText) { /* texts: strings drawn in a When to use / Overview picture; specText: the strings the spec gave (undefined = not supplied) */ const out = []; for (const c0 of texts) { const c = String(c0).trim(); if (!DC_DEFAULT_WORDS.includes(c)) continue; if (Array.isArray(specText) && specText.includes(c)) continue; if (c === 'Design systems' || (Array.isArray(specText) && specText.length)) out.push(c); } return out; }
// H:end
async function figmaDocCheck(o) {
  const startedAt = Date.now();
  const budget = o.budgetMs || 12000;
  const fails = [];
  const counts = {};
  const cap = o.maxPerCheck || 40;
  const run = (p) => !o.part || [].concat(o.part).includes(p); // one call must stay under the bridge's 32s cap: part = page | overrides | layout | text | paint | rules
  const fail = (check, node, detail) => {
    counts[check] = (counts[check] || 0) + 1;
    if (counts[check] <= cap) fails.push({ check, node: node ? `${node.id} ${node.name}` : '', detail });
  };
  const minType = o.minType || 16;
  const minLH = o.minLineHeight || 1.5;
  const ANNOT = /^(Pin|Pin label|Leader|Size tag|Measure|Doc \/ Measure tag|Bracket|Baseline|Target|Focus ring)/i; // these overlap on purpose
  const cur = o.cursor || null;
  const first = !cur; // file, approved and template checks run on the first call of a loop only, so a merge does not count them twice
  const lazy = (f) => { let d = false, v; return () => (d ? v : ((d = true), (v = f()))); };

  // 1. File, target, doc-page structure
  if (figma.fileKey !== o.fileKey) return { pass: false, counts: { file: 1 }, fails: [{ check: 'file', node: '', detail: `fileKey ${figma.fileKey}, expected ${o.fileKey}` }] };
  // no loadAllPagesAsync: it takes over 30s in BellaComponents, and getNodeByIdAsync works without it
  const pageRoot = o.target ? await figma.getNodeByIdAsync(o.target) : figma.currentPage;
  if (!pageRoot) return { pass: false, counts, fails: fails.concat([{ check: 'file', node: '', detail: `target ${o.target} not found` }]) };
  const top = pageRoot.parent;
  const subject = o.subject || ((/^(Pin|Leader)\s+[—–-]\s+component page/i.exec(String(pageRoot.name || '')) || [])[1] || '').replace(/^./, (c) => c.toUpperCase()) || ''; /* 13 Nov round 8: the page's subject, from CHECK_OPTS.subject or the root's name "<Name> — component page" */
  const TEMPLATE_KEY = '3d0e87427f15858ef477f6dcf970faa52c39f9c4';
  let rootMain = null;
  if (pageRoot.type === 'INSTANCE' && !o.section) { try { rootMain = await pageRoot.getMainComponentAsync(); } catch (e) {} }
  const isDoc = !!o.docPage || (!!rootMain && rootMain.key === TEMPLATE_KEY);
  const doPage = first && !o.section && (!isDoc || run('page')); // file-level checks run once per loop: on the page part for a doc page

  if (doPage) for (const id of o.approved || []) if (!(await figma.getNodeByIdAsync(id))) fail('approved', null, `approved frame ${id} is missing`);
  // 1b. A doc page is an instance of the published Docs Kit "Doc / Component page" (opts.docPage: true)
  if (o.docPage && doPage && (!rootMain || rootMain.key !== TEMPLATE_KEY)) fail('template', pageRoot, `root is ${pageRoot.type}${rootMain ? ' of ' + rootMain.name : ''}, not Doc / Component page`);

  // The page's direct structure: the container that holds the Section · frames, and its children (header, sections, footer), found without walking into any section.
  const SECT = /^Section · /;
  const nm = (n) => { try { return n.name || ''; } catch (e) { return ''; } };
  const kidsOf = (n) => { try { return 'children' in n ? n.children.slice() : []; } catch (e) { return []; } };
  const pageUnits = () => {
    const q = [[pageRoot, 0]]; let seen = 0;
    while (q.length) {
      const [n, d] = q.shift(); if (++seen > 400) break;
      const kids = kidsOf(n);
      if (kids.some((c) => SECT.test(nm(c)))) return { container: n, units: kids };
      if (d < 5) for (const c of kids) if (['FRAME', 'INSTANCE', 'SLOT', 'GROUP', 'COMPONENT'].includes(c.type)) q.push([c, d + 1]);
    }
    return null;
  };
  // 13 Nov canvasOverlap + looseOnCanvas: the page that holds the target; its visible top-level nodes must not intersect by more than 1px, and only frames, sections, components, sets and doc pages may sit at the top level.
  const canvasScan = async () => {
    const out = []; let pg = pageRoot; while (pg && pg.type !== 'PAGE') pg = pg.parent; if (!pg) return out;
    const tl = pg.children.filter((n) => n.visible !== false); const num = (n) => parseInt(String(n.id).split(':').pop().replace(/\D/g, ''), 10) || 0;
    const bx = (n) => { const b = n.absoluteBoundingBox; return b ? `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}` : 'no box'; };
    for (const n of tl) { if (['TEXT', 'VECTOR', 'RECTANGLE', 'LINE', 'ELLIPSE'].includes(n.type)) out.push({ check: 'looseOnCanvas', a: n, detail: `top-level ${n.type} "${n.name}" at ${bx(n)} is not inside a frame, section or component` });
      else if (n.type === 'INSTANCE') { let m = null; try { m = await n.getMainComponentAsync(); } catch (e) {} if (!(m && m.key === TEMPLATE_KEY)) out.push({ check: 'looseOnCanvas', a: n, detail: `top-level INSTANCE "${n.name}" at ${bx(n)} is loose on the canvas (only doc pages, sets, components and sections belong there)` }); } }
    for (let i = 0; i < tl.length; i++) { const A = tl[i].absoluteBoundingBox; if (!A) continue; for (let j = i + 1; j < tl.length; j++) { const B = tl[j].absoluteBoundingBox; if (!B) continue;
      const w = Math.min(A.x + A.width, B.x + B.width) - Math.max(A.x, B.x), h = Math.min(A.y + A.height, B.y + B.height) - Math.max(A.y, B.y);
      if (w > 1 && h > 1) { const [p, q] = num(tl[i]) >= num(tl[j]) ? [tl[i], tl[j]] : [tl[j], tl[i]]; out.push({ check: 'canvasOverlap', a: p, detail: `top-level frames overlap by ${Math.round(w)}x${Math.round(h)}: ${p.id} "${p.name}" [${bx(p)}] (newer) over ${q.id} "${q.name}" [${bx(q)}]` }); } } }
    return out;
  };
  if (isDoc && !o.section) {
    const pu = pageUnits();
    const ids = pu ? pu.units.map((c) => c.id) : [], names = pu ? pu.units.map(nm) : [];
    if (!(o.part && run('page'))) return { pass: null, partial: true, sections: ids, names, hint: 'run each part per section with CHECK_OPTS.section = id (part page once first)', counts, fails };
    if (!pu) fail('sections', pageRoot, 'no Section · frames found under the page');
    let hasFocus = false;
    if (pu) for (const c of pu.units) { if (!/States/.test(nm(c))) continue; try { if (c.findAll((x) => x.type === 'INSTANCE' && /^State · /.test(x.name) && /Focus/i.test(x.name)).length) hasFocus = true; } catch (e) {} }
    try { for (const c of await canvasScan()) fail(c.check, c.a, c.detail); } catch (e) { fail('canvasOverlap', pageRoot, 'canvas scan failed: ' + e); }
    let rootChip = false; try { rootChip = !!(pageRoot.explicitVariableModes && Object.keys(pageRoot.explicitVariableModes).length); } catch (e) {}
    return { pass: fails.length === 0, part: 'page', sections: ids, names, hasFocus, rootChip, resumed: false, counts, fails, ms: { total: Date.now() - startedAt } };
  }
  let root = pageRoot; // the node this call walks: the page (small targets) or one unit of a doc page
  if (o.section) {
    const pu = pageUnits(); const unit = pu && pu.units.find((c) => c.id === o.section);
    if (!unit) return { pass: false, counts: { file: 1 }, fails: [{ check: 'file', node: '', detail: `section ${o.section} not found under ${o.target || 'the current page'}` }] };
    root = unit;
  }

  // Walk (resumable). The list is kept in globalThis.__docCheckWalk between the calls of one cursor loop; a call without a cursor always walks fresh.
  const GL = typeof globalThis !== 'undefined' ? globalThis : {};
  let W = cur && cur.walkId && GL.__docCheckWalk && GL.__docCheckWalk.id === cur.walkId ? GL.__docCheckWalk : null;
  const walkAll = !!(cur && cur.walkId && !W); // cache lost: walk this unit in one go
  if (!W) W = { id: Math.random().toString(36).slice(2) + Date.now().toString(36), all: [], pmap: new Map(), stack: [], dang: 0, cyc: 0, seen: new Set(), walked: false, started: false };
  const all = W.all;
  const pmap = W.pmap; // parent lookups over the bridge cost ~0.3ms each: cache them while walking
  const P = (n) => (pmap.has(n.id) ? pmap.get(n.id) : n.parent);
  let walkedHere = false;
  if (!W.walked) {
    // 13 Nov (round 2): the clock is tested per node AND per child read (a node with thousands of children no longer runs one 20s call); the stack holds frames { n, kids, j } so a stop resumes inside a node's children.
    const openKids = (n) => {
      if (!('children' in n)) return;
      let kids; try { kids = n.children; } catch (e) { W.dang++; return; } /* an instance edited by property can hold a sublayer the API cannot read; counted, not a fail (like staleOverride) */
      W.stack.push({ n, kids, j: 0 });
    };
    if (!W.started) { W.started = true; W.seen.add(root.id); all.push(root); openKids(root); }
    let k = 0;
    while (W.stack.length) {
      if (!walkAll && k > 0 && Date.now() - startedAt > budget) {
        GL.__docCheckWalk = W;
        return { pass: null, partial: true, part: 'walk', step: 'walk', section: o.section || null, cursor: { walk: true, walkId: W.id, part: null, mains: (cur && cur.mains) || {} }, resumed: !first, counts, fails, ms: { total: Date.now() - startedAt, walked: all.length, pending: W.stack.length } };
      }
      const f = W.stack[W.stack.length - 1];
      if (f.j >= f.kids.length) { W.stack.pop(); continue; }
      const c = f.kids[f.j++]; k++;
      try { void c.name; void c.visible; } catch (e) { W.dang++; continue; }
      // 13 Nov cycle guard: a Columns specimen in a wide Properties row returns the page itself as a cell's children. Skip a node already visited or equal to an ancestor (the stack is the path from the root); counted as walkCycle, not a fail.
      if (W.seen.has(c.id) || W.stack.some((q) => q.n.id === c.id)) { W.cyc++; continue; }
      W.seen.add(c.id);
      pmap.set(c.id, f.n); all.push(c); openKids(c);
    }
    W.walked = true; walkedHere = true;
  }
  if (walkedHere && W.dang && (first || (cur && cur.walk))) counts.danglingSublayer = W.dang; // counted once per loop, when the walk finishes
  if (walkedHere && W.cyc && (first || (cur && cur.walk))) counts.walkCycle = W.cyc; // counted once per loop, visible but not a fail
  const walkMs = Date.now() - startedAt;
  const byId = new Map(all.map((n) => [n.id, n])); // getNodeByIdAsync hangs on nested override ids
  const mainName = new Map(); // instance id -> main component (or set) name; carried in the cursor
  if (cur && cur.mains) for (const k of Object.keys(cur.mains)) mainName.set(k, cur.mains[k]);
  const nameByMain = new Map(); // main component id -> display name: the parent lookups run once per main, not once per instance
  const mainOf = async (i) => {
    if (mainName.has(i.id)) return mainName.get(i.id);
    let m = null; try { m = await i.getMainComponentAsync(); } catch (e) {}
    let name = null;
    if (m) { if (nameByMain.has(m.id)) name = nameByMain.get(m.id); else { name = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name; nameByMain.set(m.id, name); } }
    mainName.set(i.id, name); return name;
  };
  const insideInstance = (n) => { let p = P(n); while (p && p !== top) { if (p.type === 'INSTANCE') return p; p = P(p); } return null; };
  const within = (n, test) => { let p = n; while (p) { if (test(p)) return p; p = P(p); } return null; };
  const box = (n) => n.absoluteBoundingBox;
  const overlap = (a, b) => a && b && a.x < b.x + b.width - 1 && b.x < a.x + a.width - 1 && a.y < b.y + b.height - 1 && b.y < a.y + a.height - 1;
  const lum = (c) => { const f = (v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const solidBg = (n) => { let p = P(n); while (p) { if ('fills' in p && Array.isArray(p.fills)) { const f = p.fills.find((x) => x.type === 'SOLID' && x.visible !== false && (x.opacity ?? 1) > 0.9); if (f) return f.color; } p = P(p); } return null; };
  const varName = async (paint) => { const id = paint && paint.boundVariables && paint.boundVariables.color && paint.boundVariables.color.id; if (!id) return null; const v = await figma.variables.getVariableByIdAsync(id); return v ? v.name : 'unknown'; };

  const instances = all.filter((n) => n.type === 'INSTANCE');

  // Budgeted steps. A step walks a stable list by index; past the budget it stops and the cursor says where (part, step, i).
  const STOP = { stop: true };
  const isDang = (e) => e !== STOP && /does not exist|get_visible|get visible|node with id|dangling|has been removed|removed node/i.test(String((e && e.message) || e)); /* 13 Nov round 9: a node whose properties throw (an instance edited by property that kept a sublayer the API cannot read, Select leading) is skipped and counted as danglingSublayer; any other error still aborts */
  const dangSkip = (e) => { if (!isDang(e)) throw e; counts.danglingSublayer = (counts.danglingSublayer || 0) + 1; };
  let stopAt = null;
  const stepCur = cur && cur.part ? cur : null; // a walk cursor has no step: the steps start from the top
  let reached = !stepCur; // with a cursor, steps before the one it names are skipped: an earlier call already did them
  let resumeI = stepCur ? stepCur.i || 0 : 0;
  // 13 Nov (round 2): budget INSIDE an item. An item's function can loop through `inner(list, body, tag)`: the clock is tested per element, and a stop returns a cursor { i, j, k, st } that resumes inside the item.
  // tag numbers the loops of one item in order (loops with a lower tag than the cursor's are skipped: their result is in the state object); `S()` returns the item's small JSON state, kept in the cursor (st).
  let subJ = stepCur ? stepCur.j || 0 : 0, subTag = stepCur ? stepCur.k || 0 : 0, pendSt = stepCur ? stepCur.st || null : null, curSt = null, curPart = null, curStep = null, curI = 0;
  const over = () => Date.now() - startedAt > budget;
  const S = () => { curSt = pendSt || {}; pendSt = null; return curSt; };
  const inner = async (list, body, tag) => {
    tag = tag || 0;
    if (subTag > tag) return;
    const j0 = subTag === tag ? subJ : 0;
    for (let j = j0; j < list.length; j++) {
      if (j > j0 && over()) { stopAt = { part: curPart, step: curStep, i: curI, j, k: tag, st: curSt }; throw STOP; }
      try { await body(list[j], j); } catch (e) { dangSkip(e); }
    }
  };
  const step = async (part, name, listFn, fn) => {
    if (part === 'mains' ? !['overrides', 'layout', 'text', 'rules'].some(run) : !run(part)) return;
    let i = 0, resumedHere = false;
    if (!reached) { if (stepCur.part === part && stepCur.step === name) { reached = true; i = resumeI; resumeI = 0; resumedHere = true; } else return; }
    let list; try { list = listFn(); } catch (e) { dangSkip(e); list = []; } const i0 = i;
    for (; i < list.length; i++) {
      if (i > i0 && over()) { stopAt = { part, step: name, i }; throw STOP; }
      curPart = part; curStep = name; curI = i; curSt = null;
      if (!(resumedHere && i === i0)) { subJ = 0; subTag = 0; pendSt = null; }
      try { await fn(list[i], i); } catch (e) { dangSkip(e); }
      subJ = 0; subTag = 0; pendSt = null; // a resume point applies to the first item only
    }
  };

  // 0. Main-component names for every instance (cached per main id; resumable, and carried in the cursor)
  const sectionMemo = new Map();
  const SPEC_SEC = /^Section · (Overview|When to use|States|Sizes|Properties|Do \/ Don[’']t)/;
  const isSubjSpecimen = (i) => { /* 13 Nov round 8: on the Pin and Leader pages an instance of the documented component is a specimen, not an annotation, in Overview / When to use / States / Sizes / Properties / Do-Don't and inside a "Specimen" frame of Anatomy or Accessibility; only the layers beside it count */
    if (!subject || i.type !== 'INSTANCE' || (mainName.get(i.id) || '') !== subject) return false;
    if (within(i, (p) => SPEC_SEC.test(nm(p)))) return true;
    if (i.layoutPositioning !== 'ABSOLUTE' && within(i, (p) => /^Specimen/.test(nm(p)))) return true;
    return subject === 'Leader' && !(i.parent && i.parent.children.some((c) => c.type === 'INSTANCE' && mainName.get(c.id) === 'Pin label')); /* earlier rule: a leader with no Pin label beside it */
  };
  const inSubj = (n) => !!subject && !!within(n, isSubjSpecimen);
  const sectionOf = (n) => { if (sectionMemo.has(n.id)) return sectionMemo.get(n.id); const s = within(n, (p) => /^Section/.test(p.name)) || root; sectionMemo.set(n.id, s); return s; };
  const codeMemo = new Map();
  const isCode = (n) => { if (codeMemo.has(n.id)) return codeMemo.get(n.id); const r = within(n, (p) => p.type === 'INSTANCE' && /^(CodeBlock|Code line)$/.test(mainName.get(p.id) || '')); codeMemo.set(n.id, r); return r; };
  const visibleText = lazy(() => all.filter((n) => n.type === 'TEXT' && n.visible));
  const hidMemo = new Map(); const hiddenUp = (p) => { if (!p) return false; if (hidMemo.has(p.id)) return hidMemo.get(p.id); const r = p.visible === false || hiddenUp(P(p)); hidMemo.set(p.id, r); return r; }; // one visibility read per node, not one climb per text
  const drawnText = lazy(() => visibleText().filter((n) => n.characters.trim() && !hiddenUp(P(n)))); // text inside a hidden layer (a Tab's hidden Count) is not drawn, so it cannot be cut off

  try {
    await step('mains', 'mains', () => instances, (i) => mainOf(i));

    if (run('overrides')) {
    // 2. Style overrides on instances (content is allowed: text, slot children, properties)
    // Speed (13 Nov): per-node facts (sizing, scaled-specimen ancestry) are read once and cached; the same node+field is reported once even when an outer and an inner instance both list it; no children are read here.
    const CONTENT = new Set(['characters', 'text', 'componentProperties', 'name', 'exposedInstances', 'pluginData', 'sharedPluginData', 'componentPropertyReferences', 'annotations']); // Dev Mode notes are content
    const rootModes = lazy(() => !!(pageRoot.explicitVariableModes && Object.keys(pageRoot.explicitVariableModes).length));
    const sizeMemo = new Map(); const sizing = (n) => { if (!sizeMemo.has(n.id)) sizeMemo.set(n.id, [n.layoutSizingHorizontal, n.layoutSizingVertical]); return sizeMemo.get(n.id); };
    const fillHug = (n) => { const s = sizing(n); return ['FILL', 'HUG'].includes(s[0]) || ['FILL', 'HUG'].includes(s[1]); };
    const specMemo = new Map(); const inSpec = (n) => { if (!specMemo.has(n.id)) specMemo.set(n.id, !!within(n, (p) => /^Specimen · scaled/.test(p.name))); return specMemo.get(n.id); };
    const seenOv = new Set();
    await step('overrides', 'ov', () => instances, async (i) => {
      let ovs = []; try { ovs = i.overrides || []; } catch (e) {}
      await inner(ovs, (ov) => {
        const node = byId.get(ov.id);
        if (!node) { counts.staleOverride = (counts.staleOverride || 0) + 1; return; } // id of a replaced slot default: not drawn, not a fail
        const textChanged = ov.overriddenFields.includes('characters');
        for (const f of ov.overriddenFields) {
          if (CONTENT.has(f)) continue;
          if (f === 'styledTextSegments' && textChanged) continue; // Figma flags runs whenever text is set
          if (node && ['layoutPositioning', 'width', 'height', 'rotation', 'x', 'y'].includes(f) && ANNOT.test(mainName.get(node.id) || node.name)) continue; // where a pin, leader or tag sits, and how long a leader runs, is page content
          if (node && ['primaryAxisSizingMode', 'counterAxisSizingMode'].includes(f) && fillHug(node)) continue; // follows the fill/hug choice

          if (['width', 'height', 'fontSize', 'lineHeight', 'letterSpacing', 'strokeWeight', 'cornerRadius', 'paddingLeft', 'paddingRight', 'paddingTop', 'paddingBottom', 'itemSpacing', 'effects', 'boundVariables', 'textAutoResize'].includes(f) && inSpec(node || i)) continue; // Anatomy magnifies one specimen with rescale()
          if (f === 'explicitVariableModes' && /^(CodeBlock|Code line)$/.test(mainName.get(i.id) || '')) continue; // code blocks are dark on purpose
          if (f === 'explicitVariableModes' && node === pageRoot) continue; // the page root's own theme: Chip
          if (f === 'effects' && rootModes()) continue; // the page root is in Chip mode: Figma flags shadows that resolve per mode, with the same values as the component's
          if (f === 'visible' && node && node.componentPropertyReferences && node.componentPropertyReferences.visible) continue;
          if ((f === 'width' || f === 'height') && node && fillHug(node)) continue;
          if ((f === 'fills' || f === 'styledTextSegments' || f === 'textStyleId') && node && node.type === 'TEXT' && isCode(node)) continue; // code colours are checked in 3
          const key = ov.id + '|' + f; if (seenOv.has(key)) { counts.overrideRepeat = (counts.overrideRepeat || 0) + 1; continue; } seenOv.add(key); // same node and field already reported
          fail('override', node || i, `${mainName.get(i.id)}: ${f}`);
        }
      });
    });

    // 3. Code runs: bound to a syntax variable, readable on the block
    await step('overrides', 'code', () => visibleText().filter((n) => isCode(n)), async (t) => {
      const bg = solidBg(t);
      await inner(t.getStyledTextSegments(['fills']), async (s) => {
        if (!s.characters.trim()) return;
        const p = s.fills && s.fills[0];
        const vn = await varName(p);
        if (!vn || !/syntax|^component\/code-block\/(?!background|border|current|add|del|font-size)/.test(vn)) fail('code', t, `"${s.characters.slice(0, 20)}" not bound to a syntax variable (${vn || 'raw'})`);
        if (p && p.color && bg) {
          const r = ratio(p.color, bg); const need = /line-number/.test(vn || '') ? 3 : 4.5;
          if (r < need) fail('code', t, `"${s.characters.slice(0, 20)}" ${r.toFixed(2)}:1 on the block, needs ${need}`);
        }
      });
    });
    }

    if (run('layout')) {
    // 4. Pins: 01..n per section, no repeats per kind; leader dots land on something
    const pinTexts = new Map(); const textsOf = (i) => { if (!pinTexts.has(i.id)) pinTexts.set(i.id, i.findAll((x) => x.type === 'TEXT').map((x) => x.characters)); return pinTexts.get(i.id); };
    await step('layout', 'pins', () => {
      const groups = new Map(); // section -> its Pin and Pin label instances, in page order
      for (const i of instances) { const mn = mainName.get(i.id) || ''; if (mn !== 'Pin' && mn !== 'Pin label') continue; const s = sectionOf(i); if (!groups.has(s)) groups.set(s, []); groups.get(s).push(i); }
      return [...groups].map(([sec, insts]) => ({ sec, insts }));
    }, async ({ sec, insts }) => {
      const st = S(); st.kinds = st.kinds || { Pin: [], 'Pin label': [] }; st.names = st.names || {}; // kept in the cursor: a stop inside this group resumes here
      const kinds = st.kinds; const names = st.names;
      await inner(insts, (i) => {
        const mn = mainName.get(i.id) || '';
        if (isSubjSpecimen(i)) return; /* 13 Nov: on the Pin page a Pin specimen is not an annotation (round 8: by area, not by name) */
        if (insideInstance(i) && /^Pin/.test(mainName.get(insideInstance(i).id) || '')) return;
        const num = textsOf(i).find((c) => /^\d{2}$/.test(c));
        if (!num) return;
        kinds[mn].push(num);
      }, 0);
      const registered = kinds.Pin.length + kinds['Pin label'].length > 0;
      if (!registered) return;
      // the same number on two different part names is a repeat (e.g. "01 Label" and "01 Edge")
      await inner(insts, (i) => {
        if ((mainName.get(i.id) || '') !== 'Pin label') return;
        const texts = textsOf(i);
        const num = texts.find((c) => /^\d{2}$/.test(c)); const label = texts.find((c) => !/^\d{2}$/.test(c));
        if (!num) return;
        if (names[num] && names[num] !== label) fail('pins', sec, `${num} names two parts: ${names[num]} and ${label}`); names[num] = label;
      }, 1);
      const nums = [...new Set([...kinds.Pin, ...kinds['Pin label']])].map(Number).sort((a, b) => a - b);
      nums.forEach((n, k) => { if (n !== k + 1) fail('pins', sec, `numbers ${nums.map((x) => String(x).padStart(2, '0')).join(',')} are not 01..${nums.length}`); });
      for (const kind of ['Pin', 'Pin label']) { const seen = new Set(); for (const n of kinds[kind]) { if (seen.has(n)) fail('pins', sec, `${kind} ${n} appears twice`); seen.add(n); } }
    });

    const leaders = lazy(() => instances.filter((i) => mainName.get(i.id) === 'Leader' && i.visible && !isSubjSpecimen(i))); /* 13 Nov: on the Leader page a specimen leader (no Pin label beside it) is the subject, not an annotation */
    const bySec = lazy(() => { const m = new Map(); for (const x of all) { const s = sectionOf(x); if (!m.has(s)) m.set(s, []); m.get(s).push(x); } return m; });
    const isSubjLeader = (p) => p.type === 'INSTANCE' && mainName.get(p.id) === 'Leader' && !isSubjSpecimen(p);
    // candidate targets per section, with their boxes (not annotations, not inside a leader): built once per section, on demand
    const targetsMemo = new Map();
    const targetsOf = (sec) => { if (targetsMemo.has(sec)) return targetsMemo.get(sec); const out = []; for (const x of bySec().get(sec) || []) { if (!x.visible || !['TEXT', 'INSTANCE', 'VECTOR', 'RECTANGLE'].includes(x.type)) continue; if ((!inSubj(x) && (ANNOT.test(x.name) || ANNOT.test(mainName.get(x.id) || ''))) || within(x, isSubjLeader)) continue; const b = box(x); if (b) out.push(b); } targetsMemo.set(sec, out); return out; };
    // 13 Nov leaderMiss: the existing check accepts any instance box (a whole specimen), so a leader can end in empty space inside it. Here the end must lie within 4px of VISIBLE ink: a text's absoluteRenderBounds, a visible-paint vector/shape, or (frame, rectangle) its whole area when it is small (min side <= 48) or filled and part-sized (up to 40000 px2: a Disc, a Key), and only its edge band when it is larger (a Surface, a Stage, a stroke-only frame).
    const ANNOT2 = /^(Pin|Pin label|Leader|Size tag|Doc \/ Measure tag|Bracket|Baseline|Target|Focus ring)$/i;
    const annotIds = lazy(() => new Set(instances.filter((i) => ((ANNOT2.test(mainName.get(i.id) || '') || ANNOT2.test(i.name)) && !inSubj(i)) || i.name === 'Grid' || mainName.get(i.id) === 'Grid').map((i) => i.id))); // the stage's Grid lines are backdrop, not a part
    const BR = /^(Bracket|Measure)(\s|·|$)/i;
    const hasPaint = (x) => ['fills', 'strokes'].some((k) => k in x && Array.isArray(x[k]) && x[k].some((p) => p.visible !== false && (p.opacity === undefined || p.opacity > 0)));
    const inkMemo = new Map();
    const inkOf = (sec) => {
      if (inkMemo.has(sec)) return inkMemo.get(sec); const out = []; const inkSeen = new Set();
      const addInk = (x) => {
        if (inkSeen.has(x.id)) return; inkSeen.add(x.id);
        if (!x.visible || x === root) return;
        let b = null, edge = false;
        if (x.type === 'TEXT') { if (!x.characters.trim()) return; b = x.absoluteRenderBounds; }
        else if (['VECTOR', 'LINE', 'STAR', 'POLYGON', 'ELLIPSE', 'BOOLEAN_OPERATION', 'RECTANGLE', 'FRAME', 'INSTANCE', 'COMPONENT'].includes(x.type)) { if (!hasPaint(x) && !BR.test(x.name)) return; b = box(x); try { /* 13 Nov round 9: the ink of a stroked shape is its VISIBLE stroke bounds (the fill measures the same): an outside stroke grows the box by its weight, a centred one by half */ if (b && typeof x.strokeWeight === 'number' && Array.isArray(x.strokes) && x.strokes.some((q) => q.visible !== false && (q.opacity === undefined || q.opacity > 0)) && (x.strokeAlign === 'OUTSIDE' || x.strokeAlign === 'CENTER')) { const g = x.strokeAlign === 'OUTSIDE' ? x.strokeWeight : x.strokeWeight / 2; b = { x: b.x - g, y: b.y - g, width: b.width + 2 * g, height: b.height + 2 * g }; } } catch (e) { /* box kept */ } if (b && Math.min(b.width, b.height) > 48 && (b.width * b.height > 40000 || !(x.fills && Array.isArray(x.fills) && x.fills.some((p) => p.visible !== false && (p.opacity === undefined || p.opacity > 0))))) edge = true; if (BR.test(x.name)) edge = false; /* a Bracket / Measure group counts whole: a leader into a branching bracket ends on its line or tick */ }
        else return;
        if (!b) return;
        if (within(x, (p) => p.visible === false || annotIds().has(p.id))) return;
        if (b.width > sec.width * 0.9 && x.type !== 'TEXT') return;
        out.push({ b, edge, x });
      };
      for (const x of bySec().get(sec) || []) addInk(x);
      // 13 Nov round 6: text and shapes inside NESTED instances (any depth, visible only) count as ink too; the annotation layers are still left out by addInk (annotIds / hidden ancestors) and by ANNOT here
      for (const inst of bySec().get(sec) || []) {
        if (inst.type !== 'INSTANCE' || !inst.visible || annotIds().has(inst.id) || (!inSubj(inst) && (ANNOT.test(inst.name) || ANNOT.test(mainName.get(inst.id) || ''))) || within(P(inst), (p) => p.type === 'INSTANCE')) continue;
        let sub; try { sub = inst.findAll((n) => n.visible !== false && (n.type === 'TEXT' || hasPaint(n)) && (!ANNOT.test(n.name) || inSubj(n))); } catch (e) { continue; }
        for (const n of sub) { if (n.type !== 'TEXT' && !['VECTOR', 'LINE', 'STAR', 'POLYGON', 'ELLIPSE', 'BOOLEAN_OPERATION', 'RECTANGLE', 'FRAME', 'INSTANCE', 'COMPONENT'].includes(n.type)) continue; if (within(n, (p) => p.visible === false || (!inSubj(p) && (ANNOT.test(p.name) || ANNOT.test(mainName.get(p.id) || ''))))) continue; addInk(n); }
      }
      inkMemo.set(sec, out); return out;
    };
    await step('layout', 'leaders', () => leaders(), (l) => {
      const dot = l.findAll((x) => x.type === 'ELLIPSE' && x.visible).pop();
      if (!dot) return;
      const d = box(dot); if (!d) return; const sec = sectionOf(l);
      { const cx = d.x + d.width / 2, cy = d.y + d.height / 2;
        const hit = targetsOf(sec).some((b) => cx >= b.x - 4 && cx <= b.x + b.width + 4 && cy >= b.y - 4 && cy <= b.y + b.height + 4 && b.width < sec.width * 0.9);
        if (!hit) fail('pins', l, 'leader end does not land within 4px of a part'); }
      const wr = l.parent && l.parent.type === 'FRAME' && /^Leader/.test(l.parent.name) ? box(l.parent) : null; // a branching leader: the dot is the junction, the wrapper frame's left or right edge is where the line meets the bracket
      const pts = wr ? [[wr.x, wr.y + wr.height / 2], [wr.x + wr.width, wr.y + wr.height / 2]] : [[d.x + d.width / 2, d.y + d.height / 2]];
      let best = Infinity, bx = null;
      for (const [cx, cy] of pts) for (const it of inkOf(sec)) {
        if (it.x === dot || within(it.x, (p) => p === l)) continue;
        const b = it.b; const dx = Math.max(b.x - cx, 0, cx - (b.x + b.width)), dy = Math.max(b.y - cy, 0, cy - (b.y + b.height));
        let dist = Math.hypot(dx, dy);
        if (it.x.type === 'TEXT') dist = Math.max(0, dist - d.width / 2); // the dot is 10px wide: its near edge touching the glyph box counts (ChatThread Delivered: centre 8.8px, edge 3.8px)
        if (it.edge && dist === 0) dist = Math.min(cx - b.x, b.x + b.width - cx, cy - b.y, b.y + b.height - cy);
        if (dist < best) { best = dist; bx = it.x; }
      }
      if (wr) { /* 13 Nov round 10 (item 2): a branching leader STARTS at its dot, which must sit on the specimen (not on a bracket, a tag or a number, and not in empty space beside it) */ let bs = Infinity, bn = null; const cx0 = d.x + d.width / 2, cy0 = d.y + d.height / 2; for (const it of inkOf(sec)) { if (it.x === dot || within(it.x, (p) => p === l || BR.test(nm(p)))) continue; let dd = dcDist(cx0, cy0, it.b); if (it.x.type === 'TEXT') dd = Math.max(0, dd - d.width / 2); if (it.edge && dd === 0) dd = Math.min(cx0 - it.b.x, it.b.x + it.b.width - cx0, cy0 - it.b.y, it.b.y + it.b.height - cy0); if (dd < bs) { bs = dd; bn = it.x; } } if (bs > 4) fail('leaderMiss', l, bs === Infinity ? 'leader start (its dot) has no specimen to sit on' : `leader start (its dot) is ${Math.round(bs)}px from the nearest part of the specimen (${bn.type} "${bn.type === 'TEXT' ? bn.characters.slice(0, 20) : bn.name}"): it must start on the specimen`); }
      else if (/Anatomy/.test(nm(sec)) && !/^(Pin|Leader)$/.test(subject)) { /* 13 Nov round 10 (item 3): an anatomy leader ends on the part's own edge, never inside a text's glyph box (text parts are aimed at their left or right edge, 2px out) */ const cx1 = d.x + d.width / 2, cy1 = d.y + d.height / 2; for (const it of inkOf(sec)) { if (it.x.type !== 'TEXT' || within(it.x, (p) => p === l)) continue; if (dcStrictlyIn(cx1, cy1, it.b, 1)) { fail('leaderOnText', l, `leader end sits inside the text "${it.x.characters.slice(0, 20)}" (its glyph box): aim at the named part's own edge`); break; } } }
      if (best > 4) fail('leaderMiss', l, best === Infinity ? 'leader end has nothing visible to point at' : `leader end is ${Math.round(best)}px from the nearest visible part (${bx.type} "${bx.type === 'TEXT' ? bx.characters.slice(0, 20) : bx.name}")`);
    });

    // 13 Nov pinOverText: a Pin disc never sits on text. Pin instance bounds vs a visible TEXT's render bounds (not an annotation's own text, not text inside the pin), overlap over 2px both ways.
    const ANNOT3 = /^(Pin|Pin label|Leader|Size tag|Doc \/ Measure tag|Bracket|Baseline|Target|Focus ring)$/i;
    const ptexts = lazy(() => { const texts = all.filter((n) => n.type === 'TEXT' && n.visible && n.characters.trim()); return { texts, tbs: texts.map((t) => box(t)) }; });
    await step('layout', 'pinOverText', () => (true ? instances.filter((i) => i.visible && mainName.get(i.id) === 'Pin' && !isSubjSpecimen(i) && !within(P(i), (p) => p.visible === false)) : []), (pin) => {
      const { texts, tbs } = ptexts();
      const pb = box(pin); if (!pb) return;
      texts.forEach((t, k) => {
        const tb = tbs[k]; if (!tb) return;
        if (Math.min(pb.x + pb.width, tb.x + tb.width) - Math.max(pb.x, tb.x) <= 2 || Math.min(pb.y + pb.height, tb.y + tb.height) - Math.max(pb.y, tb.y) <= 2) return;
        if (within(t, (p) => p === pin || p.visible === false || ANNOT3.test(mainName.get(p.id) || '') || (p.type !== 'TEXT' && ANNOT3.test(p.name)))) return;
        const rb = t.absoluteRenderBounds; if (!rb) return;
        const ox = Math.min(pb.x + pb.width, rb.x + rb.width) - Math.max(pb.x, rb.x), oy = Math.min(pb.y + pb.height, rb.y + rb.height) - Math.max(pb.y, rb.y);
        if (ox > 2 && oy > 2) fail('pinOverText', pin, `pin sits on "${t.characters.slice(0, 20)}" (${Math.round(ox)} x ${Math.round(oy)}px overlap)`);
      });
    });

    // 5. Layout: overlaps, outside parent, rows fill and share height
    await step('layout', 'layout', () => all, async (n) => {
      if (!('children' in n) || n.type === 'INSTANCE' || insideInstance(n)) return;
      const kids = n.children.filter((c) => c.visible && !ANNOT.test(c.name) && !ANNOT.test(mainName.get(c.id) || ''));
      const free = n.layoutMode === 'NONE' || n.layoutMode === undefined ? kids : kids.filter((c) => c.layoutPositioning === 'ABSOLUTE');
      const fb = free.length > 1 ? free.map(box) : []; // each box read once per node, not once per pair
      await inner(free.length > 1 ? free : [], (fa, a) => { for (let b = a + 1; b < free.length; b++) if (overlap(fb[a], fb[b])) fail('layout', fa, `overlaps ${free[b].id} ${free[b].name}`); }, 0);
      const pb = box(n);
      if (pb && n.type !== 'SECTION' && n.type !== 'PAGE') await inner(kids, (c) => { const cb = box(c); if (cb && (cb.x < pb.x - 1 || cb.y < pb.y - 1 || cb.x + cb.width > pb.x + pb.width + 1 || cb.y + cb.height > pb.y + pb.height + 1)) fail('layout', c, `sticks out of ${n.name}`); }, 1);
      if (n.layoutMode === 'VERTICAL' && n.layoutSizingHorizontal !== 'HUG') {
        const rows = kids.filter((c) => (c.type === 'FRAME' || c.type === 'INSTANCE') && c.layoutPositioning !== 'ABSOLUTE');
        if (rows.length > 1) for (const r of rows) if (r.layoutSizingHorizontal !== 'FILL') fail('layout', r, `row in ${n.name} is ${r.layoutSizingHorizontal}, not FILL`);
        const named = rows.filter((r) => /row/i.test(r.name));
        if (named.length > 1) { const h = named.map((r) => Math.round(r.height)); if (Math.max(...h) - Math.min(...h) > 1) fail('layout', n, `rows differ in height: ${h.join(', ')}`); }
      }
    });
    await step('layout', 'canvas', () => (root.type === 'PAGE' ? root.children : []), (c) => { if (!['FRAME', 'SECTION', 'COMPONENT', 'COMPONENT_SET'].includes(c.type)) fail('layout', c, 'loose on the canvas, not in a block frame'); });
    }

    if (run('text')) {
    // 5b. Text cut off by a clipping parent, or two texts drawn on top of each other in one row
    await step('text', 'clipped', () => drawnText(), (t) => {
      const tb = box(t); if (!tb) return;
      // every clipping ancestor counts, not only the nearest: a Card inside a narrow slot is cut off by the slot
      for (let cp = P(t), hops = 0; cp && cp !== top && hops < 40; cp = P(cp), hops++) {
        if (!('clipsContent' in cp) || !cp.clipsContent) continue;
        if (cp.name === 'Roll') break; // Button's hover-roll copy is hidden by design
        const cb = box(cp);
        if (cb && (tb.x < cb.x - 1 || tb.x + tb.width > cb.x + cb.width + 1 || tb.y < cb.y - 1 || tb.y + tb.height > cb.y + cb.height + 1)) { fail('clipped', t, `"${t.characters.slice(0, 20)}" is cut off by ${cp.name}`); break; }
      }
    });
    await step('text', 'overlapText', () => all, async (n) => {
      if (!('children' in n)) return;
      const texts = n.children.filter((c) => c.type === 'TEXT' && c.visible && c.characters.trim());
      if (texts.length < 2) return;
      const tbx = texts.map(box);
      await inner(texts, (ta, a) => { for (let b = a + 1; b < texts.length; b++) if (overlap(tbx[a], tbx[b])) fail('clipped', ta, `text overlaps "${texts[b].characters.slice(0, 20)}"`); });
    });

    // 13 Nov chipClip: text inside a chip, pill, tag, badge, tab, cell or row (nearest ancestor by name or main component name, within 6 levels) must fit that container's inner box (padding counts for direct children), carry no ellipsis (textTruncation ENDING), and not be cut by any clipping ancestor (its box reaches past the clipping frame).
    // 13 Nov midWordBreak: a text that wraps (autoResize HEIGHT or NONE, over 1.6 lines) never breaks inside a word. Plugin API has no per-line or per-range bounds, so: (a) exact: one word (no space, hyphen or slash) on two or more lines is broken mid-word; (b) estimate: the longest word's width (chars x the average char width measured from single-line auto-width texts of the same font, style and size on this page; 0.55 em fallback) is over 1.15 x the node's width.
    const CHIPY = /\b(chip|pill|tag|badge|tab|row|cell)s?\b/i;
    const chipTexts = lazy(() => drawnText().filter((n) => !isCode(n)));
    await step('text', 'chipClip', () => chipTexts(), (t) => {
      let c = null;
      for (let p = P(t), h = 0; p && p !== top && h < 6; p = P(p), h++) { if (!['FRAME', 'INSTANCE', 'COMPONENT'].includes(p.type)) continue; if (CHIPY.test(p.name) || CHIPY.test(mainName.get(p.id) || '')) { c = p; break; } }
      if (!c) return;
      const tb = box(t), cb = box(c); if (!tb || !cb) return;
      if (t.textTruncation === 'ENDING') fail('chipClip', t, `"${t.characters.slice(0, 20)}" in ${c.name} is truncated with an ellipsis`);
      const lay = c.layoutMode && c.layoutMode !== 'NONE' && P(t) === c && t.layoutPositioning !== 'ABSOLUTE';
      const pl = lay ? c.paddingLeft || 0 : 0, pr = lay ? c.paddingRight || 0 : 0, pt = lay ? c.paddingTop || 0 : 0, pbm = lay ? c.paddingBottom || 0 : 0;
      const ix = cb.x + pl, iy = cb.y + pt, iw = cb.width - pl - pr, ih = cb.height - pt - pbm;
      const rb = t.absoluteRenderBounds || tb;
      if (tb.x < ix - 1.5 || tb.x + tb.width > ix + iw + 1.5 || rb.y < iy - 1.5 || rb.y + rb.height > iy + ih + 1.5) fail('chipClip', t, `"${t.characters.slice(0, 20)}" (${Math.round(tb.width)} x ${Math.round(tb.height)}) does not fit the inside of ${c.name} (${Math.round(iw)} x ${Math.round(ih)})`);
      else for (let cp = P(t), hops = 0; cp && cp !== top && hops < 40; cp = P(cp), hops++) {
        if (cp.name === 'Roll') break; // Button's hover-roll copy is hidden by design
        if (!('clipsContent' in cp) || !cp.clipsContent) continue;
        const kb = box(cp);
        if (kb && (tb.x < kb.x - 1 || tb.x + tb.width > kb.x + kb.width + 1 || tb.y < kb.y - 1 || tb.y + tb.height > kb.y + kb.height + 1)) { fail('chipClip', t, `"${t.characters.slice(0, 20)}" in ${c.name} is cut off by ${cp.name}`); break; }
      }
    });
    const calib = new Map(); let calibDone = false;
    const calibrate = () => { calibDone = true; for (const x of all) { if (x.type !== 'TEXT' || !x.visible || x.textAutoResize !== 'WIDTH_AND_HEIGHT' || x.characters.length < 4 || /\n/.test(x.characters)) continue; if (typeof x.fontSize !== 'number' || x.fontName === figma.mixed) continue; const b = box(x); if (!b || b.height > x.fontSize * 2.2) continue; const k = x.fontName.family + '|' + x.fontName.style + '|' + x.fontSize; const e = calib.get(k) || { w: 0, c: 0 }; e.w += b.width; e.c += x.characters.length; calib.set(k, e); } };
    await step('text', 'midWordBreak', () => chipTexts(), (t) => {
      if (t.textAutoResize === 'WIDTH_AND_HEIGHT' || t.textAutoResize === 'TRUNCATE' || t.height < 24) return;
      const sg = t.getStyledTextSegments(['fontSize', 'fontName', 'lineHeight'])[0]; if (!sg) return;
      const fs = sg.fontSize, lh = sg.lineHeight;
      const lhpx = lh.unit === 'PIXELS' ? lh.value : lh.unit === 'PERCENT' ? (lh.value / 100) * fs : fs * 1.3;
      const nLines = t.height / lhpx; if (nLines < 1.6) return;
      const words = t.characters.split(/[\s\-–—\/]+/).filter(Boolean); if (!words.length) return;
      if (words.length === 1) { fail('midWordBreak', t, `"${words[0].slice(0, 24)}" is one word on ${Math.round(nLines)} lines (${Math.round(t.width)}px wide)`); return; }
      if (!calibDone) calibrate();
      const e = calib.get(sg.fontName.family + '|' + sg.fontName.style + '|' + fs); const k = e && e.c >= 12 ? e.w / e.c : fs * (/Mono/i.test(sg.fontName.family) ? 0.6 : 0.55);
      const longest = words.reduce((a, w) => (w.length > a.length ? w : a), ''); const est = longest.length * k;
      if (est > t.width * 1.15) fail('midWordBreak', t, `"${longest.slice(0, 24)}" is about ${Math.round(est)}px, wider than the ${Math.round(t.width)}px text box, so it breaks mid-word`);
    });

    // 13 Nov codeOverlap: code lines are texts inside CodeBlock / Code line INSTANCES, so the layout test (skips instance insides) and overlapText (siblings only) never compared them.
    // A line that does not wrap and has a fixed height spills past its own box, so box vs box looks clean: compare what is drawn (absoluteRenderBounds). Fails when a code line's ink goes past its own box, or two code lines of one block overlap.
    await step('text', 'codeOverlap', () => { const g = new Map(); for (const t of drawnText()) { const c0 = isCode(t); if (!c0) continue; const c = within(t, (p) => p.type === 'INSTANCE' && mainName.get(p.id) === 'CodeBlock') || c0; /* one group per block, not per Code line instance */ if (!g.has(c)) g.set(c, []); g.get(c).push(t); } return [...g.values()]; }, async (ts) => {
      const items = ts.map((t) => ({ t, b: box(t), r: t.absoluteRenderBounds })).filter((x) => x.b && x.r);
      for (const x of items) if (x.r.y + x.r.height > x.b.y + x.b.height + 1.5 || x.r.x + x.r.width > x.b.x + x.b.width + 1.5) fail('codeOverlap', x.t, `code line "${x.t.characters.slice(0, 24)}" draws ${Math.round(x.r.width)} x ${Math.round(x.r.height)} past its ${Math.round(x.b.width)} x ${Math.round(x.b.height)} box (wraps over the next line)`);
      await inner(items, (_x, a) => { for (let c = a + 1; c < items.length; c++) if (overlap(items[a].r, items[c].r)) fail('codeOverlap', items[a].t, `code line "${items[a].t.characters.slice(0, 24)}" overlaps "${items[c].t.characters.slice(0, 24)}"`); });
    });

    // 6. Type floor and reading line height
    await step('text', 'type', () => visibleText(), async (t) => {
      await inner(t.getStyledTextSegments(['fontSize', 'lineHeight', 'fontName']), (s) => {
        if (!s.characters.trim()) return;
        if (s.fontSize < minType) fail('type', t, `${s.fontSize}px "${s.characters.slice(0, 20)}"`);
        const reading = t.characters.length > 60 && !/Mono/i.test(s.fontName.family) && !isCode(t);
        if (reading) {
          const lh = s.lineHeight.unit === 'PERCENT' ? s.lineHeight.value / 100 : s.lineHeight.unit === 'PIXELS' ? s.lineHeight.value / s.fontSize : 1.2;
          if (lh < minLH - 0.01) fail('type', t, `line height ${lh.toFixed(2)} on reading text`);
        }
      });
    });
    }

    if (run('paint')) {
    // 7. Raw colours where a variable should be bound (nodes owned by this page, not inside instances)
    await step('paint', 'colour', () => all, (n) => {
      if (n.type === 'INSTANCE' || insideInstance(n) || n.type === 'PAGE') return;
      for (const key of ['fills', 'strokes']) {
        if (!(key in n) || !Array.isArray(n[key])) continue;
        n[key].forEach((p) => { if (p.type === 'SOLID' && p.visible !== false && !(p.boundVariables && p.boundVariables.color)) fail('colour', n, `raw ${key.slice(0, -1)} rgb(${Math.round(p.color.r * 255)},${Math.round(p.color.g * 255)},${Math.round(p.color.b * 255)})`); });
      }
    });

    // 7b. No stand-ins (Elleta, 12 Nov: "just make sure to use teh compoenents yes"): a page-owned frame that is styled
    // like a control or card (visible stroke and corner radius, holding text) should be a component instance
    await step('paint', 'standIn', () => all, (n) => {
      if (n.type !== 'FRAME' || insideInstance(n) || n === root) return;
      const stroked = Array.isArray(n.strokes) && n.strokes.some((s) => s.visible !== false) && (n.strokeWeight || 0) > 0;
      const rounded = (typeof n.cornerRadius === 'number' ? n.cornerRadius : 0) > 0;
      const holdsText = n.findAll ? n.findAll((x) => x.type === 'TEXT').length > 0 && n.children.every((c) => c.type !== 'INSTANCE') : false;
      if (stroked && rounded && holdsText) fail('stand-in', n, 'drawn like a component; use an instance');
    });

    // 8. Descriptions follow the Purpose pattern (model: Card 136:130 in BellaComponents)
    if (o.descriptions) {
      const PARTS = ['Purpose', 'Use', "Don't use", 'States', 'Parts', 'Code', 'Links'];
      await step('paint', 'descriptions', () => all.filter((n) => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && !(n.parent && n.parent.type === 'COMPONENT_SET'))), (c) => {
        if (/^Set aside/.test(c.name)) return;
        const parts = (c.description || '').split(/\n\s*\n+/).map((p) => p.trim()).filter(Boolean);
        const heads = parts.map((p) => PARTS.find((h) => p.startsWith(h + ' ')) || '?');
        if (heads.join('|') !== PARTS.join('|')) fail('description', c, `parts: ${heads.join(', ') || 'empty'}`);
      });
    }
    }

    // 9. Reviewer assertions (12 Nov night, check-assertions.md A1-A9): the misses reviewers kept finding after builders reported them fixed.
    if (run('rules')) {
    if (o.docPage) {
      const secs = lazy(() => all.filter((n) => /^Section · /.test(n.name) && n.visible));
      const lineH = (t) => { const s = t.getStyledTextSegments(['fontSize', 'lineHeight'])[0]; if (!s) return 20; const lh = s.lineHeight; return lh.unit === 'PIXELS' ? lh.value : lh.unit === 'PERCENT' ? (lh.value / 100) * s.fontSize : s.fontSize * 1.25; };
      const lines = (t) => Math.round(t.height / lineH(t) * 10) / 10;
      const mainOfNode = (n) => (n.type === 'INSTANCE' ? mainName.get(n.id) || '' : '');
      const specimenInst = lazy(() => all.filter((n) => n.type === 'INSTANCE' && mainOfNode(n) === 'Doc / Specimen'));
      const one = () => [0];

      // A1 leaderEnd: a leader's end dot sits within 4px of a real part (text, vector, rectangle or instance), never in empty space or on a whole-section container
      // (covered by the leader check in 4, which also runs for measure tags and brackets because their leaders are Leader instances)

      // A2 pinOrder: pin numbers rise in reading order (top to bottom, then left to right) and labels are at least 8px apart
      await step('rules', 'A2', () => secs(), async (sec) => {
        const labels = all.filter((n) => n.type === 'INSTANCE' && n.visible && mainOfNode(n) === 'Pin label' && within(n, (p) => p === sec) && !(insideInstance(n) && mainOfNode(insideInstance(n)) === 'Pin label'));
        const items = [];
        for (const l of labels) { const num = l.findAll((x) => x.type === 'TEXT').map((x) => x.characters).find((c) => /^\d{2}$/.test(c)); const b = box(l); if (num && b) items.push({ l, num: Number(num), b }); }
        const ord = [...items].sort((a, b) => (Math.abs(a.b.y - b.b.y) < 12 ? a.b.x - b.b.x : a.b.y - b.b.y));
        if (subTag === 0) ord.forEach((it, k) => { if (k > 0 && it.num < ord[k - 1].num) fail('pinOrder', it.l, `pin ${String(it.num).padStart(2, '0')} reads after ${String(ord[k - 1].num).padStart(2, '0')} (top to bottom, left to right)`); });
        await inner(items, (_x, a) => { for (let c = a + 1; c < items.length; c++) { const A = items[a].b, B = items[c].b; const gapX = Math.max(B.x - (A.x + A.width), A.x - (B.x + B.width)), gapY = Math.max(B.y - (A.y + A.height), A.y - (B.y + B.height)); if (Math.max(gapX, gapY) < 8) fail('pinOrder', items[a].l, `label ${items[a].num} is ${Math.round(Math.max(gapX, gapY))}px from label ${items[c].num}, needs 8`); } }, 1);
      });

      // A3 rowHeights: rows in one stack share one height (±1) and fill the width; cards in one row share one height
      const ROWS = ['Doc / State row', 'Doc / When-to-use card', 'Do / Don’t card', 'Doc / Properties row'];
      await step('rules', 'A3', () => all, (n) => {
        if (!('children' in n) || n.type === 'INSTANCE' && ROWS.includes(mainOfNode(n))) return;
        let kids; try { kids = n.children.filter((c) => c.visible && c.type === 'INSTANCE' && ROWS.includes(mainOfNode(c))); } catch (e) { return; }
        if (kids.length < 2) return;
        const m0 = mainOfNode(kids[0]); const same = kids.filter((c) => mainOfNode(c) === m0);
        if (m0 === 'Doc / Properties row') { const w = same.map((c) => Math.round(c.width)); if (Math.max(...w) - Math.min(...w) > 1) fail('rowHeights', n, `properties rows differ in width: ${w.join(', ')}`); return; }
        const hs = same.map((c) => Math.round(c.height)); if (Math.max(...hs) - Math.min(...hs) > 1) fail('rowHeights', n, `${m0} heights differ: ${hs.join(', ')}`);
        if (n.layoutMode === 'VERTICAL') for (const c of same) { const pb = box(n), cb = box(c); if (pb && cb && Math.abs(pb.width - cb.width) > 1) fail('rowHeights', c, `${m0} is ${Math.round(cb.width)} wide in a ${Math.round(pb.width)} stack`); }
      });

      // 13 Nov round 10 (item 5) rowHeight, When to use: the cards (or the Choice frames that hold a card and its picture) of one row share one height
      await step('rules', 'A3b', () => all.filter((n) => n.visible && /^Choices( · row| · wide)?$/.test(n.name) && 'children' in n), (n) => {
        let kids; try { kids = n.children.filter((c) => c.visible); } catch (e) { return; }
        if (kids.length < 2) return; const hs = kids.map((c) => Math.round(c.height)); if (dcSpread(hs) > 1) fail('rowHeight', n, `When to use cards in one row differ in height: ${hs.join(', ')}`);
      });

      // 13 Nov round 10 (item 4) labelAlign + sizeCount: Sizes labels on one baseline, one specimen per size (opts.sizes = how many the spec lists); a Properties row that lists k values shows k specimens
      await step('rules', 'A3c', () => secs().filter((s) => /Sizes$/.test(s.name)), (sec) => {
        const cols = sec.findAll((n) => n.type === 'FRAME' && /^Size · /.test(n.name) && n.visible);
        const ys = []; for (const c of cols) { const lb = c.findOne((x) => x.type === 'TEXT' && x.name === 'Label' && x.visible); const b = lb && box(lb); if (b) ys.push(Math.round(b.y)); }
        if (ys.length > 1 && dcSpread(ys) > 1) fail('labelAlign', sec, `size labels sit at different heights: ${ys.join(', ')}`);
        if (typeof o.sizes === 'number' && cols.length !== o.sizes) fail('sizeCount', sec, `${cols.length} size specimens for ${o.sizes} sizes`);
      });
      await step('rules', 'A3d', () => all.filter((n) => n.type === 'INSTANCE' && n.visible && mainOfNode(n) === 'Doc / Properties row' && /^Row · (size|sizes|variant|variants|tone|colou?r|kind|intent)$/i.test(n.name) && !(o.sizeCountSkip || []).includes(n.name.slice(6))), (r) => {
        let k = 0; for (const t of r.findAll((x) => x.type === 'TEXT' && x.visible)) { if (within(t, (p) => p.type === 'SLOT' || p.name === 'Specimens')) continue; k = Math.max(k, dcValueCount(t.characters)); }
        const sp = r.findOne((x) => x.name === 'Specimens'); if (!k || !sp) return;
        const nested = (x) => { let p = P(x); while (p && p !== sp) { if (p.type === 'INSTANCE') return true; p = P(p); } return false; }; const insts = sp.findAll((x) => x.type === 'INSTANCE' && x.visible && !nested(x)); const hasNote = sp.findAll((x) => x.type === 'TEXT' && x.visible && x.characters.trim()).some((x) => x.name === 'Note');
        if (insts.length && !hasNote && insts.length < k) fail('sizeCount', r, `${r.name} lists ${k} values but shows ${insts.length} specimens`);
      });

      // 13 Nov round 10 (item 1) placeholder: a picture in Overview or When to use never shows the Docs Kit's sample word ("Design systems", and "Label" / "Button" when CHECK_OPTS.specText lists the strings the spec gave)
      await step('rules', 'A7d', () => visibleText().filter((t) => within(t, (p) => /^Section · (Overview|When to use)$/.test(nm(p))) && DC_DEFAULT_WORDS.includes(t.characters.trim())), (t) => {
        if (!within(t, (p) => /^Specimen · /.test(nm(p)) || (p.type === 'INSTANCE' && ['Card'].includes(mainOfNode(p))))) return;
        if (within(t, (p) => /^At a glance$/.test(nm(p)))) return;
        const bad = dcDefaultWordFails([t.characters], o.specText); if (bad.length) fail('placeholder', t, `"${bad[0]}" in a ${within(t, (p) => /^Section · /.test(nm(p))) ? nm(within(t, (p) => /^Section · /.test(nm(p)))) : 'picture'} picture is the Docs Kit's sample text; the spec gave its own`);
      });

      // A4 oneLine: text inside a specimen, and every caption, intro and lead except the header lead, is one line
      await step('rules', 'A4', () => drawnText(), (t) => {
        if (isCode(t)) return;
        const sp = within(t, (p) => p.type === 'INSTANCE' && mainOfNode(p) === 'Doc / Specimen');
        const caption = /^(Intro|Caption|Lead|Line|Subtitle|Rule|ARIA|Note)$/.test(t.name) && !within(t, (p) => p.type === 'INSTANCE' && mainOfNode(p) === 'Component header');
        const headerLead = within(t, (p) => p.type === 'INSTANCE' && mainOfNode(p) === 'Component header') && /^(Lead|Intro|Description)$/.test(t.name);
        if (headerLead) { if (lines(t) > 2.5) fail('oneLine', t, `header lead is ${lines(t)} lines, max 2`); return; }
        if ((sp || caption) && lines(t) > 1.6) fail('oneLine', t, `"${t.characters.slice(0, 30)}" wraps to ${Math.round(lines(t))} lines`);
      });

      // A5 overviewNoMeasure: no measurements in Overview
      await step('rules', 'A5', () => secs().filter((s) => /Overview$/.test(s.name)), (sec) => inner(sec.findAll((n) => n.type === 'TEXT' && n.visible), (t) => { if (/\d+\s?px|\d+:\d|×/.test(t.characters) && !within(t, (p) => p.type === 'INSTANCE' && mainOfNode(p) === 'Doc / Specimen')) fail('overviewNoMeasure', t, `"${t.characters.slice(0, 30)}" is a measurement; it belongs in Accessibility`); }));

      // A6 focusRingRow: a component with a focus state has a focus-ring row in Contrast
      await step('rules', 'A6', one, () => {
        const block = all.find((n) => n.type === 'INSTANCE' && mainOfNode(n) === 'Doc / Contrast block');
        let hasFocus = o.hasFocus !== undefined ? o.hasFocus : all.some((n) => n.type === 'INSTANCE' && mainOfNode(n) === 'Doc / State row' && /Focus/i.test(n.name));
        if (o.hasFocus === undefined && !hasFocus && block && root !== pageRoot) { const pu = pageUnits(); if (pu) for (const c of pu.units) { if (c.id === root.id) continue; try { if (c.findAll((x) => x.type === 'INSTANCE' && /^State · /.test(x.name) && /Focus/i.test(x.name)).length) hasFocus = true; } catch (e) {} } } // the State rows live in another unit of the page
        if (hasFocus && block) { const rows = block.findAll((n) => n.type === 'TEXT' && /focus/i.test(n.characters) && /Pair|Label|Name/.test(n.name)); if (!rows.length) fail('focusRingRow', block, 'the component has a focus state but Contrast has no focus-ring row'); }
      });

      // A7 noPlaceholderText: no placeholder copy, no blank text
      await step('rules', 'A7', () => visibleText(), (t) => {
        if (t.characters === ' ' && !isCode(t)) fail('placeholderText', t, 'text is a single space');
        if (/^Do this, not that\.?$/i.test(t.characters.trim())) fail('placeholderText', t, 'placeholder "Do this, not that."');
        if (o.storyExists && t.characters.trim() === 'Example' && within(t, (p) => p.type === 'INSTANCE' && mainOfNode(p) === 'CodeBlock')) fail('placeholderText', t, 'code title is "Example" but the component has a story file');
      });

      // 13 Nov round 8, placeholder: a section still showing the Docs Kit's default copy (a fill that timed out half-way) or an empty slot fails. The strings are what the fill replaces; CHECK_OPTS.placeholders adds more.
      { const DEFAULT_COPY = [/^One sentence on what this section shows and how to read it\.?$/i, /^Design systems$/, /^Label$/, /^Do this, not that\.?$/i, /^(Short )?(Title|Heading|Lorem ipsum)( goes here)?\.?$/i, /^npm install @?[\w\/-]*$/, /^import \{ ?Component ?\} from ['"]/, /^<Component[ \/>]/, ...(o.placeholders || []).map((x) => (x instanceof RegExp ? x : new RegExp('^' + String(x).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i')))];
        const SEC_HEAD = /^Section · /;
        const secOwn = (t) => { const p = insideInstance(t); return p; }; // nearest instance around the text
        await step('rules', 'A7b', () => visibleText(), (t) => {
          const sec = within(t, (p) => SEC_HEAD.test(nm(p))); if (!sec) return;
          const c = t.characters.trim(); if (!c) return;
          const own = secOwn(t); const direct = !own || SEC_HEAD.test(nm(own)) || own === sec; // text of the Section piece itself, not inside a specimen
          const hit = DEFAULT_COPY.find((re) => re.test(c)); if (!hit) return;
          { const hi = DEFAULT_COPY.indexOf(hit); if (!direct && !(hi === 0 || hi >= 5)) return; } // short words like "Label" or "Heading" are real text inside a specimen; the lead sentence, code lines and your own strings count anywhere
          fail('placeholder', t, `"${c.slice(0, 40)}" in ${nm(sec)} is the Docs Kit's default text`);
        });
        await step('rules', 'A7c', () => secs(), (sec) => {
          const stage = sec.findOne((n) => n.name === 'Stage' && n.type === 'FRAME') || sec; const content = stage.findOne((n) => n.type === 'SLOT' && n.name === 'Content') || stage.findOne((n) => n.name === 'Content');
          if (!content) return; let k; try { k = content.children.filter((c) => c.visible); } catch (e) { return; }
          if (!k.length) fail('placeholder', sec, `${nm(sec)} has an empty slot`);
        }); }

      // A8 centred: each section's content group sits in the middle of its stage (left and right gaps within 8px)
      await step('rules', 'A8', () => secs(), (sec) => {
        const stage = sec.findOne((n) => n.name === 'Stage' && n.type === 'FRAME'); if (!stage) return;
        const content = stage.findOne((n) => n.type === 'SLOT' && n.name === 'Content') || stage.findOne((n) => n.name === 'Content'); if (!content) return;
        let kids; try { kids = content.children.filter((c) => c.visible); } catch (e) { return; }
        const bs = kids.map(box).filter(Boolean); if (!bs.length) return; const sb = box(stage);
        const left = Math.min(...bs.map((b) => b.x)) - sb.x, right = sb.x + sb.width - Math.max(...bs.map((b) => b.x + b.width));
        if (Math.abs(left - right) > 8) fail('centred', sec, `${sec.name.replace('Section · ', '')}: left gap ${Math.round(left)}, right gap ${Math.round(right)}`);
      });

      // A9 scale: inside one specimen, relative type sizes follow the code. opts.scale = [{ small: 'HelperText', large: 'Value' }]: the layer named small is smaller than the layer named large
      await step('rules', 'A9', () => (o.scale || []).flatMap((rule) => specimenInst().map((sp) => ({ rule, sp }))), ({ rule, sp }) => {
        const size = (nm) => { const t = sp.findAll((x) => x.type === 'TEXT' && x.visible && x.name === nm)[0]; return t ? t.fontSize : null; };
        const a = size(rule.small), b = size(rule.large); if (a && b && !(a < b)) fail('scale', sp, `${rule.small} ${a}px is not smaller than ${rule.large} ${b}px`);
      });

      // A10 captionWords (12 Nov night, Card review): captions, leads and rules carry no CSS or ARIA words and no file paths
      await step('rules', 'A10', () => drawnText(), (t) => {
        if (isCode(t) || !/^(Intro|Caption|Lead|Line|Subtitle|Rule|ARIA|Note|Description)$/.test(t.name)) return;
        const bad = t.characters.match(/aria-|transform|box-shadow|\.tsx|\.css|:\d+/i);
        if (bad) fail('captionWords', t, `"${t.characters.slice(0, 40)}" has "${bad[0]}": say what a reader sees, not the CSS or ARIA`);
      });

      // A11 focusRingTags: a focus-ring card carries width, offset AND radius tags; a size tag in the measure card reads "W × H" (opts.widthOnlyTag: true for an inline link, which is exempt)
      await step('rules', 'A11a', () => all.filter((n) => /^Card · Focus ring/.test(n.name) && n.visible), (fc) => {
        const tags = fc.findAll((n) => n.type === 'INSTANCE' && mainOfNode(n) === 'Size tag').map((n) => n.findAll((x) => x.type === 'TEXT').map((x) => x.characters).join(' '));
        for (const w of ['width', 'offset', 'radius']) if (!tags.some((x) => new RegExp(w, 'i').test(x))) fail('focusRingTags', fc, `no ${w} tag on the focus ring (has: ${tags.join(' | ') || 'none'})`);
      });
      if (!o.widthOnlyTag) await step('rules', 'A11b', () => all.filter((n) => /^Card · Measure/.test(n.name) && n.visible).flatMap((mc) => mc.findAll((n) => n.type === 'INSTANCE' && mainOfNode(n) === 'Size tag')), (tg) => { const tx = tg.findAll((x) => x.type === 'TEXT').map((x) => x.characters).join(' '); if (!/^\d+(\.\d+)? × \d+(\.\d+)?$/.test(tx.trim())) fail('focusRingTags', tg, `size tag reads "${tx}", not "W × H"`); });

      // A12 codeNamesPage: a string in the code example that names page content (title, label, id, text between tags) appears on the page, outside the code. opts.codeExempt: strings to skip
      const pageText = lazy(() => all.filter((n) => n.type === 'TEXT' && n.visible && !isCode(n)).map((n) => n.characters.toLowerCase()).join('\n'));
      const pageTextFull = lazy(() => (root === pageRoot ? '' : pageRoot.findAll((n) => n.type === 'TEXT' && n.visible).map((n) => n.characters.toLowerCase()).join('\n'))); // unit call: the string may be said in another section; read the page only when it is missing here
      const exempt = new Set([...(o.codeExempt || []), 'default', 'peek', 'true', 'false']);
      await step('rules', 'A12', () => all.filter((n) => n.type === 'TEXT' && n.visible && isCode(n) && n.name === 'Code').map((n) => n.characters), (line) => {
        if (/^\s*import\s/.test(line)) return;
        const found = [];
        for (const m of line.matchAll(/(?:title|label|ariaLabel|aria-label|name|id|alt|placeholder|value)=["']([^"']+)["']/g)) found.push(m[1]);
        const inner = line.match(/>([^<>{}]+)</); if (inner) found.push(inner[1].trim());
        for (const str of found) { if (str.length < 3 || exempt.has(str) || /^(#|https?:|\/)/.test(str)) continue; if (!pageText().includes(str.toLowerCase()) && !pageTextFull().includes(str.toLowerCase())) fail('codeNamesPage', null, `code says "${str}" but no text on the page says it`); }
      });

      // A13 reducedMotionX: the reduced-motion line starts at the left edge of its section's content (the stage slot)
      await step('rules', 'A13', () => all.filter((n) => n.type === 'TEXT' && n.visible && /^Reduced motion/.test(n.characters)), (t) => {
        const sec = within(t, (p) => /^Section · /.test(p.name)); const slot = sec && sec.findOne((n) => n.type === 'SLOT'); const tb = box(t), sb = slot && box(slot);
        if (tb && sb && Math.abs(tb.x - sb.x) > 2) fail('reducedMotionX', t, `reduced-motion line starts at x ${Math.round(tb.x - sb.x)} inside the section; the content edge is 0`);
        if (o.reducedMotionText && t.characters.trim() !== o.reducedMotionText) fail('reducedMotionX', t, `line is "${t.characters.slice(0, 50)}", the CSS says "${o.reducedMotionText}"`);
      });

      // A14 noCardInCard: a specimen Card (the white one) never wraps a component whose own root has a fill and a radius (Card, ResourceCard, Stat). Exempt: inside a "Don't" card, where the nesting is the lesson. opts.selfCards: other names
      const SELF = new Set(['Card', 'ResourceCard', 'Stat', ...(o.selfCards || [])]);
      await step('rules', 'A14', () => all.filter((n) => n.type === 'INSTANCE' && mainOfNode(n) === 'Card' && n.visible && !within(P(n), (p) => /^Don.t · /.test(p.name))), (sp) => {
        const hit = sp.findOne((n) => n !== sp && n.type === 'INSTANCE' && SELF.has(mainOfNode(n)));
        if (hit) fail('noCardInCard', sp, `${mainOfNode(hit)} sits inside a specimen Card; a component that is a card goes straight on the stone stage`);
      });

      // A15 scaledText (13 Nov, Select review): in a rescaled specimen every text is rescaled by the same factor as its component (the label too, not only the value)
      await step('rules', 'A15', () => all.filter((n) => /^Specimen · scaled/.test(n.name) && n.visible).flatMap((sp) => sp.findAll((n) => n.type === 'INSTANCE' && n.visible && !insideInstance(n) || (n.type === 'INSTANCE' && n.parent === sp))), async (inst) => {
        let m = null; try { m = await inst.getMainComponentAsync(); } catch (e) {} if (!m || !m.height) return;
        // 13 Nov: scale comes from fixed-size parts (same-named non-text descendants whose width is fixed in the instance), never from overall height: Show icon / Show bar booleans change the height without scaling anything. Without such a part, height counts only when no boolean differs from the component's defaults.
        const st = S(); st.rs = st.rs || [];
        await inner(inst.findAll((x) => x.visible && x.type !== 'TEXT' && x.type !== 'INSTANCE' && x.layoutSizingHorizontal === 'FIXED' && x.width >= 8), (q) => { const mq = m.findOne((x) => x.type === q.type && x.name === q.name); if (mq && mq.width >= 8) st.rs.push(q.width / mq.width); }, 0);
        let s = null; { const rs = st.rs.slice(); if (rs.length) { rs.sort((u, v) => u - v); s = rs[Math.floor(rs.length / 2)]; } }
        if (s === null) { const defs = (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent : m).componentPropertyDefinitions || {}; const cp = inst.componentProperties || {}; const same = Object.keys(cp).every((k) => !defs[k] || defs[k].type !== 'BOOLEAN' || defs[k].defaultValue === cp[k].value); if (!same) return; s = inst.height / m.height; }
        if (s < 1.2) return;
        await inner(inst.findAll((x) => x.type === 'TEXT' && x.visible && x.characters.trim()), (t) => {
          const mt = m.findOne((x) => x.type === 'TEXT' && x.name === t.name); if (!mt || typeof mt.fontSize !== 'number' || typeof t.fontSize !== 'number') return;
          if (Math.abs(t.fontSize / mt.fontSize - s) > 0.15 * s) fail('scaledText', t, `"${t.characters.slice(0, 20)}" is ${t.fontSize}px in a ${s.toFixed(1)}x specimen; the component draws it at ${mt.fontSize}px, so it should be about ${Math.round(mt.fontSize * s)}px`);
        }, 1);
      });

      // 29 deprecatedProps: props marked @deprecated never appear on the page (opts.deprecated: ['accent', 'mediaScrim'])
      await step('rules', 'deprecated', () => o.deprecated || [], (d) => {
        for (const t of all.filter((n) => n.type === 'TEXT' && n.visible && n.characters.trim() === d)) fail('deprecatedProp', t, `"${d}" is deprecated and has no place on the page`);
        for (const r of all.filter((n) => n.name === 'Row · ' + d)) fail('deprecatedProp', r, `a Properties row for deprecated "${d}"`);
      });

      // 30 sameAsDefault: a state that looks like Default gets a pink tag saying the difference, or the section says "interactive cards only" (opts.sameAsDefault: ['hover', 'focus'] as State row names)
      await step('rules', 'sameAsDefault', () => o.sameAsDefault || [], (st) => {
        const row = all.find((n) => n.name === 'State · ' + st && n.visible); if (!row) return;
        const tagged = row.findAll((n) => n.type === 'INSTANCE' && mainOfNode(n) === 'Size tag').length > 0;
        const sec = within(row, (p) => /^Section · /.test(p.name)); const said = sec && sec.findAll((n) => n.type === 'TEXT' && /interactive cards only/i.test(n.characters)).length > 0;
        if (!tagged && !said) fail('sameAsDefault', row, `state "${st}" looks like Default and has no pink tag naming the difference`);
      });
    }
    }
  } catch (e) { if (e !== STOP) throw e; }

  const ms = { walk: walkMs, total: Date.now() - startedAt, nodes: all.length, instances: instances.length };
  if (stopAt) { GL.__docCheckWalk = W; return { pass: null, partial: true, part: stopAt.part, step: stopAt.step, section: o.section || null, cursor: { part: stopAt.part, step: stopAt.step, i: stopAt.i, j: stopAt.j, k: stopAt.k, st: stopAt.st, walkId: W.id, mains: Object.fromEntries(mainName) }, resumed: !first, counts, fails, ms }; }
  if (stepCur && !reached) { fail('cursor', null, `cursor names ${stepCur.part}/${stepCur.step}, which did not run: pass the same part and target as the call that returned it`); }
  if (GL.__docCheckWalk && GL.__docCheckWalk.id === W.id) delete GL.__docCheckWalk;
  return { pass: fails.length === 0, part: [].concat(o.part || 'all').join('+'), section: o.section || null, resumed: !first, counts, fails, ms };
}
// merge: CHECK_OPTS = { merge: [result1, result2, ...] } returns one verdict. A partial result counts as not passed, unless the next result in the list is the call that resumed it (resumed: true):
// then the chain is one part and only its last call decides; a chain that ends on a partial is reported under `incomplete`. With a page result (part 'page', which lists `sections`), pass also needs
// a final non-partial result for every section x part (overrides, layout, text, paint, rules); missing ones are listed under `incomplete`. A bare `sections` partial (a doc page run without a part) is incomplete.
function figmaDocCheckMerge(rs) {
  const PARTS = ['overrides', 'layout', 'text', 'paint', 'rules'];
  const counts = {}; const fails = []; const incomplete = [];
  const done = new Set(); let page = null;
  rs.forEach((r, k) => {
    for (const [key, v] of Object.entries(r.counts || {})) counts[key] = (counts[key] || 0) + v;
    fails.push(...(r.fails || []));
    if (r.partial && r.sections && !r.part) { incomplete.push('doc page run without a part: run part page, then each part per section'); return; }
    if (r.partial) { if (!(rs[k + 1] && rs[k + 1].resumed)) incomplete.push(`${r.section ? r.section + ' ' : ''}${r.part}/${r.step} at item ${r.cursor && r.cursor.i !== undefined ? r.cursor.i : '?'}`); return; }
    if (r.part === 'page' && r.sections) page = r;
    const ps = String(r.part || '').split('+'); for (const p of (ps.includes('all') ? PARTS : ps)) done.add((r.section || '') + '|' + p);
  });
  if (page) for (const id of page.sections) for (const p of PARTS) if (!done.has(id + '|' + p)) incomplete.push(`${id} ${p}: not run`);
  return { pass: incomplete.length === 0 && fails.length === 0 && rs.every((r) => r.partial || r.pass === true), parts: rs.map((r) => (r.section ? r.section + ':' : '') + r.part), incomplete, counts, fails };
}
if (typeof CHECK_OPTS !== 'undefined' && CHECK_OPTS.merge) return figmaDocCheckMerge(CHECK_OPTS.merge);
return await figmaDocCheck(typeof CHECK_OPTS !== 'undefined' ? CHECK_OPTS : {});
