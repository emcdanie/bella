// figma-doc-fill: renders one component doc page in Figma from its YAML spec (12 Nov 2026).
// Plugin JS for the Desktop Bridge (figma_execute). Input is specs/components/<Name>.spec.yaml loaded as JSON
// (node -e "console.log(JSON.stringify(require('js-yaml').load(require('fs').readFileSync(F,'utf8'))))"). Nothing is read from anywhere else.
// Set the two constants first, then paste this file after them:
//   const FILL_DATA = { ...spec as JSON... };
//   const FILL_OPTS = { fileKey: 'JzN6DXIILH64KHI5MmgH8Q', pageName: '🧩 Link', setId: '298:6681', x: 0, y: 0, modelId: '718:126751' };
// Returns { pageId, filled: [...], skipped: [...], needsReview: [...], needsGuidance: [...] }.
// Rules it follows: ONE fresh Doc / Component page instance; only text, properties and slot content are set; slot content is a
// fresh instance of the component's own variants or of a Docs Kit piece, placed BEFORE its nested parts are edited; never a clone;
// code is coloured token by token with the syntax variables; pins are 01..n in anatomy order; sections the spec marks
// notApplicable, or that need `guidance:` text the spec does not carry, are removed and listed. No loadAllPagesAsync, no
// getNodeByIdAsync on nested ids, an 8s race around every import or lookup.
// TIME BUDGET + PROTOCOL (13 Nov): FILL_OPTS.budgetMs defaults to 8000 (0 = no limit). The clock is read before EVERY block 1..13; a block never starts after the budget, and the heavy ones
//   (7 Anatomy, 9 Accessibility, 11 Properties) never start after 4s. Blocks not run come back as nextOnly (with rootId): call again with FILL_OPTS = { ...same, only: nextOnly, rootId } until nextOnly is empty.
//   A block cannot resume mid-way (it rebuilds its slot), so the cut is always between blocks. Then check: part 'page' once, then per section id each part, looped on cursor (see figma-doc-check.js).
// 13 Nov round 10: guidance.sampleText (optional) = the sample word for pictures whose Docs Kit text ('Design systems', 'Label', 'Button') is hard-coded in a layer; whenToUse[].visualText wins.
// Written before BellaComponents was free to write in: tested only by `node --check` until the first Link run.

async function figmaDocFill(D, O) {
  if (figma.fileKey !== O.fileKey) throw new Error(`fileKey ${figma.fileKey}, expected ${O.fileKey}`);
  const filled = [], skipped = [], needsReview = [], needsGuidance = [];
  const race = (p, label) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 8s: ' + (label || ''))), 8000))]);
  const KEYS = {
    page: '3d0e87427f15858ef477f6dcf970faa52c39f9c4', specimen: '9785b4c35a182e0544be432990e3f7c894cd059d', stateRow: 'e335bf6dfa3e17f91e339a1a53097585be829514',
    whenCard: 'df82f2e79fa5bc8f38994ca8536013af61fd0caa', doDont: '5479070e03c5b32644ddff6ae40a3d04d69b2014', a11yNote: 'bc000deba80b4b1273f77df84809ef8c522d41c2',
    contrastBlock: '5df0c3f74733b4767e3533f06866bf9cf87c652f', contrastRow: 'c2685f2c640e9c0ae9c132e7ed2a556d54f408bd', verdict: 'a6ee8a2382c77845eb1166e9f53d30a4f4f87c43',
    propRow: 'bccd15046d8ac1037dd5a504a2b67e7b5100e7f7', codeBlock: 'daf58932d33f9155e3055789cf9295240b2ef5d2', codeLine: 'eedf595ad94b46f57b37a03285f2e30232354a4d',
    measure: '561c893906ec95a55c1d2b24e237216cc11bc6b4',
    header: '421c755e4e2359375610edcff7c5694cd97b787a', section: 'af8d5a8387b694285ae993fc2f57efd7b0ee7e1a',
    textSecondary: '66ed59e565423ac9b904d59e136396a0af68dc41', gap: '49e2e246952e1db05f542a0d5b434ce4cb77eda0', pad: 'c098d24725fc8651ac220d7d38fdf6a8adc4b340', top: 'bf087453f8585296d04c54932be1715385270440', // Body spacing variables: spacing/16, spacing/20, spacing/12
  };
  const SYN = { keyword: 'cd4f4d0835c55a7cc9c610f29984d815729535a3', foreground: 'e44bbffb35e3500634bc18a53d70c2f965c6d109', string: '2d238d43fe8d65d47ede7bfeae5a9e73c699a40f', punct: '0c90332a4af30f75fc9fe2d7aa99e50a2d00cd16', tag: '64b1e4573f12967d4ee7585841ee9cbc51eb7df4', attr: 'c8ac5666fbfc8435aa6108ff622c895dbae2800d' };
  const PIN_COLOURS = ['yellow', 'pink', 'blue', 'red'];
  const INTRO = { Overview: 'Live in its default state.', 'When to use': 'Start from the task; use what is under it.', States: 'One row per state.', Sizes: 'Every size at its real height.', Behaviour: 'What moves, and how fast.', Accessibility: 'What keyboards and screen readers meet.', Code: 'Import from BELLA and use it as written.', Properties: 'Every prop, its values and its default.', 'Do / Don’t': null, 'In context': null };

  const T0 = Date.now(); const BUDGET = O.budgetMs === 0 ? 1e12 : (O.budgetMs || 8000); const decided = {}; const deferred = []; /* 13 Nov round 3 (item 9): no block starts after 8s (O.budgetMs, 0 = no limit); a heavy block (7 Anatomy, 9 Accessibility, 11 Properties) never starts after 4s (heavy blocks cannot resume mid-way: they rebuild their slot); the blocks left come back as nextOnly, with rootId, for the next call */
  const want = (i) => { if (i in decided) return decided[i]; let ok = !O.only || O.only.includes(i); if (ok && Date.now() - T0 > ([7, 9, 11].includes(i) ? Math.min(BUDGET, 4000) : BUDGET)) { ok = false; deferred.push(i); } /* clock checked before EVERY block (want is called at each one), heavier cut-off for the three slow ones */ decided[i] = ok; return ok; };
  // ---------- helpers ----------
  const base = (k) => k.replace(/#\d+:\d+$/, '');
  const setProps = (inst, map) => {
    const out = {};
    const lowMap = {}; for (const mk0 of Object.keys(map)) lowMap[mk0.toLowerCase()] = mk0;
    const exact = new Set(Object.keys(inst.componentProperties).map(base));
    const typeOk = (pv, v) => (typeof v === 'boolean' ? pv.type === 'BOOLEAN' || pv.type === 'VARIANT' : typeof v === 'string' || typeof v === 'number' ? pv.type === 'TEXT' || pv.type === 'VARIANT' || pv.type === 'INSTANCE_SWAP' : true);
    for (const [key, pv] of Object.entries(inst.componentProperties)) { const bk = base(key); if (Object.prototype.hasOwnProperty.call(map, bk)) out[key] = map[bk]; else if (Object.prototype.hasOwnProperty.call(lowMap, bk.toLowerCase())) { const mk1 = lowMap[bk.toLowerCase()]; if (exact.has(mk1)) continue; /* the exact-case name belongs to another property (variant label vs TEXT Label) */ if (typeOk(pv, map[mk1])) out[key] = map[mk1]; } } /* 13 Nov round 8: exact name first; the case-insensitive fallback only reaches a property of the matching TYPE, and never one whose exact-case twin exists (label: on no longer writes "on" into TEXT Label) */
    inst.setProperties(out);
  };
  const importKey = (k) => { if (globalThis.__noImport && k !== KEYS.page) return Promise.reject(new Error('library imports are stalled')); return Promise.race([figma.importComponentByKeyAsync(k), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 4s: import ' + k)), 4000))]).catch(async (e) => { if (/timeout/.test(String(e))) { globalThis.__noImport = true; throw e; } return race(figma.importComponentSetByKeyAsync(k), 'importSet ' + k).then((s) => s.defaultVariant); }); }; /* a stalled library import is tried once (4s); after that every piece comes from its main on the model page */
  const ovf = new Map(); /* instance id -> how far a part of its main component is drawn below it (measured on the main component: walking an instance can leave dangling sublayers) */
  const mainCache = globalThis.__mainCache || (globalThis.__mainCache = {}); /* kept between staged calls */
  const model = await race(figma.getNodeByIdAsync(O.modelId), 'model page');
  if (!model) throw new Error('model page ' + O.modelId + ' missing');
  const mainByName = async (name) => { // a component main found through an existing instance on the approved model page: no keys needed
    if (mainCache[name]) return mainCache[name];
    for (const i of model.findAll((n) => n.type === 'INSTANCE')) {
      const m = await race(i.getMainComponentAsync(), 'main of ' + i.name).catch(() => null);
      if (!m) continue; const nm = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name;
      if (!mainCache[nm]) mainCache[nm] = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.defaultVariant : m;
      if (mainCache[name]) break;
    }
    if (!mainCache[name]) throw new Error('component ' + name + ' not found on the model page');
    return mainCache[name];
  };
  const piece = async (key, fallbackName) => { try { return await importKey(key); } catch (e) { return await mainByName(fallbackName); } };
  const place = async (key, fallbackName, parent, props) => { const c = await piece(key, fallbackName); const i = c.createInstance(); try { parent.appendChild(i); } catch (e) { i.remove(); throw e; } /* never leave a loose instance on the page */ if (props) setProps(i, props); return i; };
  const loadFonts = async (n) => { // walks child by child: an edited instance can hold dangling sublayers that make findAll throw
    const fs = new Map(); const walk = (x) => { try { if (x.type === 'TEXT') for (const s of x.getStyledTextSegments(['fontName'])) fs.set(s.fontName.family + s.fontName.style, s.fontName); if ('children' in x) for (const c of x.children) walk(c); } catch (e) { /* dangling sublayer */ } }; walk(n); for (const f of fs.values()) await lf(f); };
  const textNode = (root, name) => root.findOne((n) => n.type === 'TEXT' && n.name === name);
  const slotOf = (n, name) => n.findOne((x) => x.type === 'SLOT' && (!name || x.name === name));
  const cardSlot = (card) => slotOf(card, 'Content');
  const clearSlot = (find) => { try { find().appendChild(figma.createFrame()); } catch (e) { /* none */ } for (let t = 0; t < 60; t++) { let c0 = null; try { c0 = find().children[0]; } catch (e) { /* none */ } if (!c0) break; try { c0.remove(); } catch (e) { break; } } }; /* 13 Nov, shared by every block: a slot's template children turn into dangling nodes after the first removal ('in remove ... does not exist'; Code lines, Contrast rows, Do/Don't Visual, Card content). An append first makes the content an override, then the slot is re-read after every removal. Never remove template children by id from a stale list. */
  // a frame the page itself needs (rows, columns): no clipping, hugs its height, fills or hugs its width, so nothing is cut off
  const mk = (name, mode, gap, parent, fillW) => { const f = figma.createFrame(); f.name = name; f.layoutMode = mode; f.itemSpacing = gap; f.fills = []; f.clipsContent = false; parent.appendChild(f); f.layoutSizingHorizontal = fillW ? 'FILL' : 'HUG'; f.layoutSizingVertical = 'HUG'; return f; };
  // a specimen goes into a Card's content slot in place of the slot's placeholder; specimen cards hug it, so a wide component is not cut off
  const putIn = (card, inst, wide) => { clearSlot(() => cardSlot(card)); const cs = cardSlot(card); cs.appendChild(inst); if (G.fillSpecimens) inst.layoutSizingHorizontal = 'FILL'; /* guidance.fillSpecimens: a component fixed wide in Figma (Heading) wraps inside the card instead of being cut off */
    { const extra = ovf.get(inst.id) || 0; if (extra > 12) { const sf = figma.createFrame(); sf.name = 'Specimen · with overflow'; sf.fills = []; sf.clipsContent = false; cs.appendChild(sf); sf.appendChild(inst); inst.x = 0; inst.y = 0; sf.resize(inst.width, inst.height + extra + 8); } } /* a part drawn outside the instance (the Select option list) gets room, so the card does not cut it off */
    if (!wide && !G.fillSpecimens && inst.width > card.width - 24) wide = true; /* 13 Nov (wide specimens): a specimen wider than its card's room gets the full row (States, Properties): real size, never scaled */
    if (wide) { card.layoutSizingHorizontal = 'FILL'; const sp = card.parent; if (sp && sp.type === 'INSTANCE' && /Specimen/.test(sp.name)) sp.layoutSizingHorizontal = 'FILL'; } }; /* wide: the Docs Kit Specimen and Card are 300px fixed and clip a wider component, so they fill their row instead and share its width */
  const synVar = {}; const getSyn = async (k) => (synVar[k] = synVar[k] || (await impVar('color/semantic/syntax-' + k)));
  const bindFill = async (t, from, to, k) => { const v = await getSyn(k); const paint = figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v); t.setRangeFills(from, to, [paint]); };

  // JSX line -> [text, syntaxKey] runs

  // contrast swatch: a 96x56 tile on the pair's background, with 'Aa' (text) or a 4px edge (non-text) in its foreground; fills and text bound to the semantic variables
  let libKeys = globalThis.__libKeys || null; /* kept between staged calls: listing every library collection takes seconds */
  // variables already imported into the file are found by id from the model page's bound variables (no library call); only a variable the model page does not use goes to the library, which can stall
  const scanVarIds = async () => { const seen = new Set(); const collect = (b) => { if (!b) return; for (const v of Object.values(b)) for (const x of (Array.isArray(v) ? v : [v])) if (x && x.id) seen.add(x.id); }; for (const n of [...model.findAll(() => true), ...(typeof set !== 'undefined' && set ? set.findAll(() => true) : [])]) { collect(n.boundVariables); for (const k of ['fills', 'strokes']) if (Array.isArray(n[k])) for (const q of n[k]) collect(q.boundVariables); } const ids = {}; for (const id of seen) { const v = await figma.variables.getVariableByIdAsync(id).catch(() => null); if (v) ids[v.name] = id; } return ids; };
  const impVar = async (name) => { const oc = globalThis.__varObjs || (globalThis.__varObjs = {}); if (oc[name]) return oc[name]; if (!globalThis.__varIds) globalThis.__varIds = await scanVarIds(); if (globalThis.__varIds[name]) { const hit = await race(figma.variables.getVariableByIdAsync(globalThis.__varIds[name]), 'variable ' + name).catch(() => null); if (hit) return (oc[name] = hit); } return (oc[name] = await impVarLib(name)); }; /* objects are kept for the session: one await per variable */
  const impVarLib = async (name) => { if (!libKeys) { libKeys = {}; const cols = await race(figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync(), 'collections'); for (const c of cols) { if (/^docs/.test(c.name)) continue; for (const v of await race(figma.teamLibrary.getVariablesInLibraryCollectionAsync(c.key), 'variables of ' + c.name)) if (!libKeys[v.name]) libKeys[v.name] = v.key; } globalThis.__libKeys = libKeys; } if (!libKeys[name]) throw new Error('no variable ' + name); return race(figma.variables.importVariableByKeyAsync(libKeys[name]), 'variable ' + name); };
  const bindP = (v) => figma.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', v);
  const makeSwatch = async (sw, p) => {
    const vmap = (D.guidance && D.guidance.contrastVarMap) || {}; const vn = (t) => vmap[t] || (t.startsWith('--color-semantic-') ? 'color/semantic/' + t.slice(17) : null);
    const rv = async (t) => { if (vn(t)) return impVar(vn(t)); if (!/^--component-/.test(t)) throw new Error('no variable for ' + t); /* 13 Nov: a component/* variable is followed to the semantic variable it aliases (Chip mode); contrastVarMap stays as the override */
      if (!libKeys) await impVarLib('?').catch(() => null); const wn = t.slice(2); const nm = Object.keys(libKeys || {}).find((k) => k.replace(/\//g, '-') === wn); if (!nm) throw new Error('no component variable for ' + t);
      let v = await impVar(nm); for (let i = 0; i < 4; i++) { if (/^color\/semantic\//.test(v.name)) break; const col = await race(figma.variables.getVariableCollectionByIdAsync(v.variableCollectionId), 'collection'); const md = col && (col.modes.find((m) => m.name === 'Chip') || col.modes[0]); const val = md && v.valuesByMode[md.modeId]; if (!val || val.type !== 'VARIABLE_ALIAS') break; const nx = await race(figma.variables.getVariableByIdAsync(val.id), 'alias').catch(() => null); if (!nx) break; v = nx; } return v; };
    const f = figma.createFrame(); f.name = 'Swatch fill'; f.layoutMode = 'VERTICAL'; f.primaryAxisAlignItems = 'CENTER'; f.counterAxisAlignItems = 'CENTER'; f.clipsContent = false; sw.appendChild(f); f.resize(96, 56);
    f.fills = [bindP(await rv(p.background.split(' over ')[0]))]; f.strokes = [bindP(await impVar('color/semantic/border-subtle'))]; f.strokeWeight = 1;
    const fg = await rv(p.foreground);
    if (p.barName === 'NON_TEXT') { const r = figma.createRectangle(); r.name = 'Edge sample'; f.appendChild(r); r.resize(64, 4); r.fills = [bindP(fg)]; }
    else { let wst = 'Regular'; try { const mn = (set.type === 'COMPONENT_SET' ? set.defaultVariant : set).findOne((n) => n.type === 'TEXT' && n.visible); const fnm = mn && mn.fontName; if (G.contrastFontStyle) wst = G.contrastFontStyle; else if (fnm && fnm !== figma.mixed && /^(Medium|SemiBold|Bold)$/.test(fnm.style)) wst = fnm.style; } catch (e) { /* Regular */ } /* 13 Nov: the sample is set in the component's label weight */ try { await lf({ family: 'DM Sans', style: wst }); } catch (e) { wst = 'Regular'; await lf({ family: 'DM Sans', style: wst }); } const t = figma.createText(); const sample = (D.guidance && D.guidance.contrastSample) || 'Aa'; t.name = sample; t.fontName = { family: 'DM Sans', style: wst }; t.fontSize = sample.length > 3 ? 16 : 24; /* a word has to fit the 96px tile */ t.characters = sample; /* the swatch shows the real use ('Workspace', 'Link'), not 'Aa' */ f.appendChild(t); t.fills = [bindP(fg)]; if (t.width > 80) { t.characters = 'Aa'; t.fontSize = 24; t.name = 'Aa'; } /* 13 Nov: a sample that clips the 96px tile falls back to Aa */ }
  };

  // a component set on a page: top level or inside a section; never page.findOne, which walks every set-aside page too and times out
  const findSet = (pg, name) => { const hit = (arr) => arr.find((n) => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === name); let h = hit(pg.children); if (h) return h; for (const c of pg.children) if (c.type === 'SECTION' && (h = hit(c.children))) return h; return null; };
  // v2 helpers: the Button page's Accessibility, Anatomy, Behaviour and Properties pieces, built from fresh instances and variable-bound frames, text and lines
  // every font load goes through one cached, time-limited call: repeated or concurrent loads of one font can hang
  const lf = async (f) => { const fk = globalThis.__fonts || (globalThis.__fonts = {}); const k = f.family + '|' + f.style; if (!fk[k]) { await race(figma.loadFontAsync(f), 'font ' + k); fk[k] = true; } };
  const ptxt = async (parent, text, o) => { o = o || {}; let font = { family: o.family || 'DM Sans', style: o.style || 'Regular' }; try { await lf(font); } catch (e) { font = { family: font.family, style: 'Regular' }; await lf(font); } const t = figma.createText(); try { parent.appendChild(t); t.name = o.name || String(text).slice(0, 24); t.fontName = font; t.fontSize = o.size || 16; t.lineHeight = { unit: 'PERCENT', value: 150 }; t.characters = String(text); } catch (e) { t.remove(); throw e; } /* append first, remove on any failure: 13 Nov, six empty texts were left loose on the current page (Button) */ t.fills = [bindP(await impVar(o.fill || 'color/semantic/text-primary'))]; return t; };
  const prect = async (parent, name, w, h, x, y, varName) => { const r = figma.createRectangle(); r.name = name; parent.appendChild(r); r.resize(w, h); r.x = x; r.y = y; r.fills = [bindP(await impVar(varName))]; return r; };
  const pline = async (parent, name, len, x, y, vertical) => { const l = figma.createLine(); l.name = name; parent.appendChild(l); l.resize(len, 0); if (vertical) l.rotation = -90; l.x = x; l.y = y; l.strokes = [bindP(await impVar('color/brand/pink-deep'))]; l.strokeWeight = 2; l.dashPattern = [4, 4]; return l; };
  const placeBB = (node, X, Y) => { const bb = node.absoluteBoundingBox; node.x += X - bb.x; node.y += Y - bb.y; };
  const mkLeader = async (parent, len, colour, rot) => { const L = (await mainByName('Leader')).createInstance(); parent.appendChild(L); setProps(L, { variant: colour, end: 'dot' }); L.resize(len, L.height); if (rot) L.rotation = rot; return L; };
  const localMain = async (name) => { if (name === D.name) return set.type === 'COMPONENT_SET' ? set.defaultVariant : set; /* 13 Nov: the component's own picture is the set itself (a Docs Kit piece can share its name: Section) */ const here = findSet(pageNode, name); if (here) return here.defaultVariant || here; try { return await mainByName(name); } catch (e) { const pg = figma.root.children.find((p) => p.name === '🧩 ' + name); if (!pg) throw e; await race(pg.loadAsync(), 'page ' + name); const st = findSet(pg, name); if (!st) throw e; return st.defaultVariant || st; } };
  const localCard = async () => { const pg = figma.root.children.find((p) => p.name === '🧩 Card'); await race(pg.loadAsync(), 'Card page'); const cs = findSet(pg, 'Card'); return cs.children.find((v) => /variant=default/.test(v.name) && /state=resting/.test(v.name) && /padding=default/.test(v.name) && /Clip content=true/.test(v.name)) || cs.defaultVariant; };
  const plainCard = async (parent) => { if (G.pictureOnStone) { const f = mk('Stone', 'VERTICAL', 0, parent, true); return { card: f, slot: f }; } /* guidance.pictureOnStone: a component that is a card sits straight on the stage, never on a white specimen Card */ const c = (await localCard()).createInstance(); parent.appendChild(c); setProps(c, { 'Show content': true, 'Show title': false, 'Show text': false, Media: false }); clearSlot(() => cardSlot(c)); const cs = cardSlot(c); return { card: c, slot: cs }; };
  const instFor = async (setName, variantName) => { let main = setName ? await localMain(setName) : (set.type === 'COMPONENT_SET' ? set.defaultVariant : set); if (variantName && main.parent && main.parent.type === 'COMPONENT_SET') main = main.parent.children.find((v) => v.name === variantName) || main; const made = main.createInstance(); if ((!setName || setName === D.name) && (G.baseProps || Object.keys(exText.props).length)) { try { await loadFonts(main); applyBase(made); } catch (e) { /* kept as drawn */ } } return made; };

  const tokenize = (line) => {
    const runs = []; const push = (t, k) => { if (t) runs.push([t, k]); }; let s = line;
    const imp = s.match(/^import\s+(\{?)\s*([\w]+)\s*(\}?)\s+from\s+('[^']*');?$/);
    if (imp) { push('import', 'keyword'); push(imp[1] ? ' { ' : ' ', imp[1] ? 'punct' : 'foreground'); push(imp[2], 'foreground'); push(imp[3] ? ' } ' : ' ', imp[3] ? 'punct' : 'foreground'); push('from', 'keyword'); push(' ', 'foreground'); push(imp[4], 'string'); if (s.endsWith(';')) push(';', 'punct'); return runs; }
    let inTag = false;
    while (s.length) {
      let m;
      if (!inTag && (m = s.match(/^<\/?/)) ) { push(m[0], 'punct'); s = s.slice(m[0].length); const t = s.match(/^[A-Za-z][\w.]*/); if (t) { push(t[0], 'tag'); s = s.slice(t[0].length); } inTag = true; continue; }
      if (!inTag) { m = s.match(/^[^<]+/); push(m[0], 'foreground'); s = s.slice(m[0].length); continue; }
      if ((m = s.match(/^\s+/))) { push(m[0], 'foreground'); s = s.slice(m[0].length); continue; }
      if ((m = s.match(/^\/?>/))) { push(m[0], 'punct'); s = s.slice(m[0].length); inTag = false; continue; }
      if ((m = s.match(/^([\w-]+)(=)/))) { push(m[1], 'attr'); push(m[2], 'punct'); s = s.slice(m[0].length); continue; }
      if ((m = s.match(/^"[^"]*"|^'[^']*'/))) { push(m[0], 'string'); s = s.slice(m[0].length); continue; }
      if ((m = s.match(/^\{([^{}]*)\}/))) { push('{', 'punct'); push(m[1], 'foreground'); push('}', 'punct'); s = s.slice(m[0].length); continue; }
      if ((m = s.match(/^[\w-]+/))) { push(m[0], 'attr'); s = s.slice(m[0].length); continue; }
      push(s[0], 'punct'); s = s.slice(1);
    }
    return runs;
  };

  // ---------- 1. the page ----------
  const pageNode = figma.root.children.find((p) => p.name === O.pageName);
  if (!pageNode) throw new Error('page ' + O.pageName + ' not found');
  await race(pageNode.loadAsync(), 'loadAsync');
  const set = await race(figma.getNodeByIdAsync(O.setId), 'component set');
  if (!set) throw new Error('set ' + O.setId + ' not found');
  // O.only: run a few blocks per call (try-block numbers 1..14 in order) when the whole page does not fit in one 30s call; O.rootId continues a page
  const pageTemplate = async () => { /* 13 Nov round 4 (item 4): the library import of the Doc / Component page stalls 10s+ at times. Try it once with a 4s race; then the main component of the model page (O.modelId), then the main of any '... — component page' instance on this page. */
    try { return await Promise.race([figma.importComponentByKeyAsync(KEYS.page), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 4s: import page template')), 4000))]); }
    catch (e0) {
      const why = String(e0); const isPage = (m) => m && (m.key === KEYS.page || /^Doc \/ Component page/.test(m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name));
      const tryMain = async (inst) => { try { const m = await race(inst.getMainComponentAsync(), 'main of ' + inst.name); return isPage(m) ? m : null; } catch (e1) { return null; } };
      let m = null; if (model.type === 'INSTANCE') m = await tryMain(model);
      if (m) { needsReview.push('Page template: library import failed (' + why + '); used the main component of the model page ' + O.modelId); return m; }
      for (const c of pageNode.children) { if (c.type === 'INSTANCE' && / — component page$/.test(c.name)) { m = await tryMain(c); if (m) break; } }
      if (m) { needsReview.push('Page template: library import failed (' + why + '); used the main component of an existing doc page (' + O.pageName + ')'); return m; }
      throw new Error('page template import failed (' + why + ') and no model or existing doc page offers its main component');
    }
  };
  const root = O.rootId ? await race(figma.getNodeByIdAsync(O.rootId), 'root') : (await pageTemplate()).createInstance();
  if (!O.rootId) { pageNode.appendChild(root); root.name = `${D.name} — component page`; root.x = O.x || 0; root.y = O.y || 0; }
  if (!O.rootId) { // The template's default slot content breaks on the first override (its last four sections turn into dangling nodes, 12 Nov), so Header, Body and the 11 sections go in as fresh instances of the same pieces, as on the ActionChip page.
    const slot0 = root.children[0].children.find((c) => c.type === 'SLOT');
    { const f0 = figma.createFrame(); slot0.appendChild(f0); } /* 13 Nov: an append first makes the slot content an override; only then can the template's default Header and Body be removed (else the 2nd removal is a dangling node, deterministic, 'in remove ... 452:17865;718:143033') */
    for (let t = 0; t < 6; t++) { const s0c = root.children[0].children.find((c) => c.type === 'SLOT'); let c0 = null; try { c0 = s0c.children[0]; } catch (e) { /* none */ } if (!c0) break; c0.remove(); } /* 13 Nov: removing one default child leaves the next as a dangling node; the slot is re-read after every removal */
    const hdr0 = (await piece(KEYS.header, 'Component header')).createInstance(); slot0.appendChild(hdr0); hdr0.name = 'Header'; hdr0.layoutSizingHorizontal = 'FILL';
    const bf = figma.createFrame(); bf.name = 'Body'; bf.layoutMode = 'VERTICAL'; bf.fills = []; bf.clipsContent = true; slot0.appendChild(bf); bf.layoutSizingHorizontal = 'FILL'; bf.layoutSizingVertical = 'HUG';
    for (const [f, name] of [['itemSpacing', 'spacing/16'], ['paddingLeft', 'spacing/20'], ['paddingRight', 'spacing/20'], ['paddingBottom', 'spacing/20'], ['paddingTop', 'spacing/12']]) bf.setBoundVariable(f, await impVar(name)); /* variables are found by name among those the model page already uses: no library call */
    const secMain = await piece(KEYS.section, 'Section');
    for (const label of ['Overview', 'When to use', 'States', 'Sizes', 'Anatomy', 'Behaviour and motion', 'In context', 'Do / Don’t', 'Accessibility', 'Code', 'Properties']) { const s0 = secMain.createInstance(); bf.appendChild(s0); s0.name = 'Section · ' + label; s0.layoutSizingHorizontal = 'FILL'; setProps(s0, { Label: label }); }
  }
  if (!O.rootId) await loadFonts(root); /* staged calls (O.rootId) skip it: fonts stay loaded for the session, and walking a filled page takes tens of seconds */

  const G = D.guidance || {};
  try { await loadFonts(set.type === 'COMPONENT_SET' ? set.defaultVariant : set); } catch (e) { /* fonts load again where text is set */ }
  // the component's own variants, as fresh instances
  const figProps = (D.figma && D.figma.props) || {};
  const chipify = async (n) => { chipified.push(n); /* recorded BEFORE any mode is set: a throw half way (one collection set, the next refused) used to leave the node out of the list and the mode on it */ try { await impVar('color/semantic/text-primary'); if (!globalThis.__chipCols) { const cids = new Set(); for (const id of Object.values(globalThis.__varIds || {})) { const v = await figma.variables.getVariableByIdAsync(id).catch(() => null); if (v) cids.add(v.variableCollectionId); } const cols = []; for (const cid of cids) { const col = await figma.variables.getVariableCollectionByIdAsync(cid); const m = col && col.modes.find((x) => x.name === 'Chip'); if (m) cols.push([col, m.modeId]); } globalThis.__chipCols = cols; } for (const [col, mid] of globalThis.__chipCols) { try { n.setExplicitVariableModeForCollection(col, mid); } catch (e1) { needsReview.push('Chip mode on a specimen (' + col.name + '): ' + e1); } } } catch (e) { needsReview.push('Chip mode on a specimen: ' + e); } }; /* 13 Nov: specimens that are measured are measured in the mode the page renders (Chip), not Light */
  const clearTree = async (top0) => { /* 13 Nov (item 3): every node under a chipified specimen (nested instances too: PageHeader inside PageHeader) and the frame that holds it lose their explicit modes; only the page root keeps its Chip mode. Children are read one by one (a dangling sublayer throws); capped at 3000 nodes. */
    const cols = new Map(); let seen = 0; const todo = [top0]; if (top0.parent && top0.parent !== root && top0.parent.type !== 'PAGE') todo.push({ one: top0.parent });
    const clearOne = async (x) => { if (x === root) return; let ks = []; try { ks = Object.keys(x.explicitVariableModes || {}); } catch (e) { return; } for (const cid of ks) { try { if (!cols.has(cid)) cols.set(cid, await figma.variables.getVariableCollectionByIdAsync(cid)); const col = cols.get(cid); if (col) x.clearExplicitVariableModeForCollection(col); } catch (e) { /* reported by the read-back in unchip */ } } };
    const walk = async (x) => { if (++seen > 3000) return; try { if (x.removed) return; } catch (e) { return; } await clearOne(x); let kids = []; try { kids = 'children' in x ? [...x.children] : []; } catch (e) { return; } for (const c of kids) await walk(c); };
    for (const t of todo) { if (t.one) await clearOne(t.one); else await walk(t); }
    if (seen > 3000) needsReview.push('Chip mode: more than 3000 nodes under ' + top0.name + ', the rest was not cleared');
  };
  const chipified = []; const unchip = async () => { for (const n of chipified.splice(0)) { /* 13 Nov round 4 (item 3): every collection is cleared on its own (one refusal no longer skips the rest), then what is still explicit on the node is read back and cleared by its collection id, and a node that still carries a mode is reported */
    try { if (n.removed) continue; await clearTree(n); for (const [col] of (globalThis.__chipCols || [])) { try { n.clearExplicitVariableModeForCollection(col); } catch (e1) { /* retried below */ } }
      let left = []; try { left = Object.keys(n.explicitVariableModes || {}); } catch (e2) { left = []; }
      for (const cid of left) { try { const col = await figma.variables.getVariableCollectionByIdAsync(cid); if (col) n.clearExplicitVariableModeForCollection(col); } catch (e3) { /* reported below */ } }
      try { left = Object.keys(n.explicitVariableModes || {}); } catch (e4) { left = []; }
      if (left.length) needsReview.push('Chip mode still explicit on ' + n.id + ' ' + n.name + ' (' + left.length + ' collection' + (left.length === 1 ? '' : 's') + ')');
    } catch (e) { needsReview.push('Chip mode not cleared on a specimen: ' + e); } } }; /* 13 Nov round 3 (item 1): a specimen is set to Chip only to be measured; its explicit mode is cleared again (the page root carries Chip), so the overrides check finds no explicitVariableModes on a specimen. Called at the end of every block that chipifies, in its catch too, and last before the return (nextOnly included). */
  const exText = (() => { /* 13 Nov round 3 (item 3): the strings of the verbatim code example, read from the example itself, so the page specimens show them (codeNamesPage) and the example never has to be rewritten */
    const out = { props: {}, all: [] }; try { const ex = G.codeExample ? { ...(D.codeExample || {}), ...G.codeExample } : D.codeExample; const code = ex && ex.code; if (!code || G.baseFromExample === false) return out;
      const i0 = code.search(new RegExp('<' + D.name + '(?=[\\s>/])')); if (i0 >= 0) { let j = i0 + D.name.length + 1, depth = 0, q = null; for (; j < code.length; j++) { const ch = code[j]; if (q) { if (ch === q) q = null; continue; } if (ch === '"' || ch === "'") { q = ch; continue; } if (ch === '{') depth++; else if (ch === '}') depth--; else if (ch === '>' && depth === 0) break; }
        const tag = code.slice(i0, j + 1); for (const m of tag.matchAll(/\s([A-Za-z][\w-]*)=(?:"([^"]*)"|'([^']*)'|\{\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)\s*\})/g)) { const v = [m[2], m[3], m[4], m[5], m[6]].find((x) => x !== undefined); if (/^(title|label|ariaLabel|aria-label|name|id|alt|placeholder|value)$/.test(m[1]) && v) out.props[m[1]] = v; }
        if (!/\/>$/.test(tag)) { const cm = code.slice(j + 1).match(new RegExp('^\\s*([^<>{}]+?)\\s*</' + D.name + '>')); if (cm && cm[1].trim()) out.props.children = cm[1].trim(); } }
      for (const line of code.split('\n')) { for (const m of line.matchAll(/(?:title|label|ariaLabel|aria-label|name|id|alt|placeholder|value)=["']([^"']+)["']/g)) out.all.push(m[1]); const inner = line.match(/>([^<>{}]+)</); if (inner) out.all.push(inner[1].trim()); }
      out.all = out.all.filter((x) => x.length >= 3 && !/^(#|https?:|\/)/.test(x) && !['default', 'peek', 'true', 'false'].includes(x));
    } catch (e) { /* none */ } return out; })();
  const shownEx = new Set(); const DEFAULT_WORDS = ['Design systems', 'Label', 'Button'];
  const applyBase = (inst) => { if (G.baseProps) setProps(inst, G.baseProps); for (const [k, v] of Object.entries(exText.props)) for (const [pk, pv] of Object.entries(inst.componentProperties)) if (pv.type === 'TEXT' && base(pk).toLowerCase() === k.toLowerCase()) { try { inst.setProperties({ [pk]: v }); shownEx.add(v); } catch (e) { /* kept as drawn */ } }
    { const smp = exText.props.children || exText.props.label || exText.props.title || G.sampleText; if (smp && !shownEx.has(smp)) { try { let did = false; for (const tn of inst.findAll((n) => n.type === 'TEXT' && n.visible && DEFAULT_WORDS.includes(String(n.characters).trim()))) { tn.characters = smp; did = true; } if (did) shownEx.add(smp); } catch (e) { /* kept as drawn */ } } } }; /* 13 Nov round 10 (item 1): the component's own sample (the story's children / label, or guidance.sampleText) replaces the Docs Kit default word that is hard-coded in a layer and has no TEXT property (Tag 'Design systems') */ /* guidance.baseProps first, then the example's own strings (TEXT properties only) */
  const figVariantName = (n) => Object.keys(figProps).find((k) => base(k).toLowerCase().replace(/\s+/g, '') === n.toLowerCase() && figProps[k].type === 'VARIANT');
  const variantComp = set.type === 'COMPONENT_SET' ? set : null;
  const makeInstance = (variantProps) => {
    let comp = set.type === 'COMPONENT_SET' ? set.defaultVariant : set;
    if (variantComp && variantProps) {
      const want = Object.entries(variantProps).map(([k, v]) => `${k}=${v}`);
      const hit = variantComp.children.find((c) => want.every((w) => c.name.split(', ').includes(w))) || variantComp.children.find((c) => want.every((w) => c.name.toLowerCase().split(', ').includes(w.toLowerCase())));
      if (hit) comp = hit;
    }
    const made = comp.createInstance(); if (/^Section/.test(D.name) && made.name === D.name) made.name = 'Specimen · ' + D.name; /* 13 Nov: the check treats an instance named 'Section...' as a doc section, so its text and parts were not found for leaders (Section: leaderMiss 185px). A specimen layer is named as a specimen. */ try { applyBase(made); } catch (e) { needsReview.push('baseProps: ' + e); } /* guidance.baseProps: sample text and booleans every specimen gets, so none wraps */
    try { const bt = comp.absoluteBoundingBox; if (bt) { let bm = bt.y + bt.height; for (const d of comp.findAll((n) => n.layoutPositioning === 'ABSOLUTE')) { const db = d.absoluteBoundingBox; if (db) bm = Math.max(bm, db.y + db.height); } ovf.set(made.id, bm - (bt.y + bt.height)); } } catch (e) { /* nothing measured */ }
    return made;
  };
  const stateValue = (s) => { const k = figVariantName('state'); if (!k) return null; const vals = figProps[k].values || []; const norm = (x) => x.toLowerCase().replace(/-visible$/, ''); return vals.find((v) => norm(v) === norm(s)) || null; };

  // sections by label: found once, right after the instance is placed, from direct children (findOne over an edited instance can hit dangling nodes)
  const content = root.children[0].children.find((c) => c.type === 'SLOT'); // Page card > Content slot > Header, Body: direct children only, never findOne over an edited instance
  const bodyFrame = content.children.find((n) => n.type === 'FRAME' && n.name === 'Body');
  const SECS = {};
  for (const s of bodyFrame.children) if (s.name.startsWith('Section · ')) { const stage = s.children.find((c) => c.name === 'Stage'); SECS[s.name.slice(10)] = { sec: s, slot: stage && stage.children.find((c) => c.type === 'SLOT') }; }
  const HEADER = content.children.find((n) => n.type === 'INSTANCE' && n.name === 'Header');
  const sectionOf = (label) => (SECS[label] && !SECS[label].gone ? SECS[label].sec : null);
  const secSlot = (label) => (SECS[label] && !SECS[label].gone ? SECS[label].slot : null);
  const emptySlot = (label) => { try { const s0 = secSlot(label); if (s0 && s0.children.length) clearSlot(() => secSlot(label)); } catch (e) { needsReview.push('empty slot ' + label + ': ' + e); } }; /* 13 Nov round 3 (item 6): a block starts from an empty slot (append a temp frame, remove the children, the temp goes last), so running it again never adds a second copy */
  const setSection = (label, intro) => { const s = sectionOf(label); if (!s) return; setProps(s, { 'Show intro': true, Intro: intro, 'Show count': false }); };
  const removeSection = (label, why, guidanceNeeded) => { const s = sectionOf(label); if (s) { s.remove(); SECS[label].gone = true; } (guidanceNeeded ? needsGuidance : skipped).push(guidanceNeeded ? { section: label, needs: why } : { section: label, why }); };

  // ---------- 2. header ----------
  if (want(1)) try {
    setProps(HEADER, { Path: 'Components / ' + D.name, Title: D.name, Description: (D.guidance && D.guidance.lead) || (D.lead && D.lead.text) || '', 'React tag': `<${D.name}>`, Storybook: 'Storybook ↗', Source: 'Code ↗', 'Show icon links': false, Status: 'For review', 'Status colour': 'For review' });
    filled.push('Header');
  } catch (e) { skipped.push({ section: 'Header', why: String(e) }); }

  // ---------- 3. Overview ----------
  if (want(2)) try {
    const slot = secSlot('Overview'); emptySlot('Overview'); setSection('Overview', (D.guidance && D.guidance.overviewIntro) || INTRO.Overview);
    const first = Object.entries(D.variants || {}).find(([k]) => figVariantName(k)); /* only a prop Figma really draws as a variant: a code-only prop (Input type) would show identical specimens */
    const items = (D.guidance && D.guidance.overview && D.guidance.overview.length) ? D.guidance.overview.map((o) => ({ use: o.use, vp: o.vp || null, props: o.props || null, line: o.line || null })) : first ? first[1].values.slice(0, 4).map((v) => ({ use: v, vp: { [base(figVariantName(first[0]))]: v } })) : [{ use: D.name, vp: null }]; /* guidance.overview [{ use, vp, props }] names what each specimen shows */
    if (!G.overviewIntro && items.length >= 2) setSection('Overview', 'Each variant, live.'); /* 13 Nov: with two or more specimens the lead says so */ const ov = mk('Overview', 'VERTICAL', 32, slot, true); /* as on the Button page: the specimens, then an At a glance row */
    const row = mk('Overview · specimens', 'HORIZONTAL', 24, ov, true);
    for (const it of items) {
      const sp = await place(KEYS.specimen, 'Doc / Specimen', row, { Use: it.use, 'Show token': false, 'Show line': !!it.line, ...(it.line ? { Line: it.line } : {}), Label: 'above' }); /* the caption says what the specimen shows (guidance.overview[].line), never the title again */
      const card = sp.findOne((n) => n.type === 'INSTANCE' && n.name === 'Card'); setProps(card, { 'Show content': true, 'Show title': false, 'Show text': false });
      const oi = makeInstance(it.vp); putIn(card, oi, true); if (it.props) { await loadFonts(oi); setProps(oi, it.props); } try { const cs1 = cardSlot(card); const ob = oi.absoluteBoundingBox, sb1 = cs1 && cs1.absoluteBoundingBox; if (ob && sb1 && oi.width < cs1.width - 24 && Math.abs((ob.x + ob.width / 2) - (sb1.x + sb1.width / 2)) > 4) { if (cs1.layoutMode === 'VERTICAL') cs1.counterAxisAlignItems = 'CENTER'; else if (cs1.layoutMode === 'HORIZONTAL') cs1.primaryAxisAlignItems = 'CENTER'; } } catch (e) { needsReview.push('Overview centre: ' + e); } /* 13 Nov round 3 (item 10): a specimen narrower than its card is centred in it */ /* placed first: setting a boolean on an unplaced instance leaves dangling sublayers (Slider marks/hint, 13 Nov) */
    }
    if (!G.fillSpecimens && items.length > 1) { try { const bad = row.children.some((sp) => { const cd = sp.findOne((n) => n.type === 'INSTANCE' && n.name === 'Card'); const cs1 = cd && cardSlot(cd); const i1 = cs1 && cs1.children[0]; return i1 && cs1.width + 1 < i1.width; }); if (bad) { row.layoutMode = 'VERTICAL'; row.itemSpacing = 24; row.layoutSizingHorizontal = 'FILL'; row.layoutSizingVertical = 'HUG';
      for (const sp of row.children) { sp.layoutSizingHorizontal = 'FILL'; }
      /* 13 Nov round 4 (item 2): round 3 set HUG on the Doc / Specimen only and swallowed a refusal; the Specimen (121px) and its inner Card stay fixed, so the specimen was clipped and the At a glance row sat on it. Now every level from the specimen's own Card slot up to the Doc / Specimen hugs; where Figma refuses (a level without auto layout), that level is resized to hold the content (+ its bottom padding), measured from the bounds, and anything still short is reported. */
      for (const sp of row.children) { try { const cd = sp.findOne((n) => n.type === 'INSTANCE' && n.name === 'Card'); const cs1 = cd && cardSlot(cd); const i1 = cs1 && cs1.children[0]; if (!i1) continue;
        const chain = []; for (let q = i1.parent; q; q = q.parent) { chain.push(q); if (q === sp) break; if (q === row) break; }
        for (const q of chain) { if (!('layoutSizingVertical' in q)) continue; if (q.layoutMode === 'NONE' && q !== sp) continue; try { if (q.layoutSizingVertical !== 'HUG') q.layoutSizingVertical = 'HUG'; } catch (e3) { /* grown below */ } }
        for (const q of chain) { const qb = q.absoluteBoundingBox, ib = i1.absoluteBoundingBox; if (!qb || !ib) continue; const want = ib.y + ib.height + (('paddingBottom' in q && q.layoutMode !== 'NONE' ? q.paddingBottom : 0) || 0); if (qb.y + qb.height < want - 0.5) { try { if (q.layoutSizingVertical !== 'FIXED') q.layoutSizingVertical = 'FIXED'; } catch (e4) { /* already fixed */ } try { q.resize(q.width, qb.height + (want - (qb.y + qb.height))); } catch (e5) { needsReview.push('Overview stacked specimen: ' + q.name + ' stays ' + Math.round(qb.height) + 'px tall (' + e5 + ')'); } } }
        const sb = sp.absoluteBoundingBox, ib2 = i1.absoluteBoundingBox; if (sb && ib2 && sb.y + sb.height < ib2.y + ib2.height - 0.5) needsReview.push('Overview stacked specimen "' + sp.name + '" is still ' + Math.round(sb.y + sb.height - (ib2.y + ib2.height)) + 'px short of its content');
      } catch (e2) { needsReview.push('Overview stacked specimen: ' + e2); } }
    } } catch (e) { needsReview.push('Overview wide rows: ' + e); } } /* 13 Nov (wide specimens): specimens that do not fit side by side are shown one per row at real size, each in the full width of the section (Section 1056, ScoreStrip 760); nothing is scaled */
    { /* At a glance (item 11): chips computed from the spec, then guidance.glance */
      const stN = (() => { const k = figVariantName('state'); const shown = (x) => { const n = x.replace(/-visible$/, ''); if (stateValue(n)) return true; const bk = figVariantName(n); return !!(bk && (figProps[bk].values || []).map(String).includes('true')); }; /* 13 Nov: only contract states the States section can show (a Figma variant exists) */ if (D.states.contract && D.states.contract.length) return D.states.contract.filter((x) => !(G.statesSkip || []).includes(x)).filter(shown).length; return k ? (figProps[k].values || []).length : (D.states.css || []).length + 1; })(); /* the contract's states, not only the values of one Figma variant (disabled and error are variants of their own) */
      const chips = [stN === 0 ? 'No states' : `${stN} state${stN === 1 ? '' : 's'}`]; if (D.sizes && D.sizes.length) chips.push(`${D.sizes.length} size${D.sizes.length === 1 ? '' : 's'}`); /* no measurements in Overview (A5): the target size lives in Accessibility */ for (const g of G.glance || []) chips.push(g);
      const gl = mk('At a glance', 'HORIZONTAL', 12, ov, true); gl.counterAxisAlignItems = 'CENTER'; gl.layoutWrap = 'WRAP';
      await ptxt(gl, 'At a glance', { name: 'Label', style: 'SemiBold' });
      for (const c of chips) { const ti = (await mainByName('Tag')).createInstance(); gl.appendChild(ti); setProps(ti, { Label: c, children: c, variant: 'default' }); for (const [tk, tv] of Object.entries(ti.componentProperties)) if (tv.type === 'TEXT' && tv.value !== c) ti.setProperties({ [tk]: c }); /* 13 Nov: any text prop (children#id, Label) gets the chip text */ }
    }
    filled.push('Overview');
  } catch (e) { skipped.push({ section: 'Overview', why: String(e) }); }

  // ---------- 4. When to use / Do-Don't / In context come from guidance only ----------
  if (want(3)) try {
    if (!(G.whenToUse && G.whenToUse.length)) removeSection('When to use', 'guidance.whenToUse is empty', true);
    else {
      const slot = secSlot('When to use'); emptySlot('When to use'); setSection('When to use', INTRO['When to use']);
      const cols = G.whenColumns || 0; /* guidance.whenColumns: 2 puts the cards in a grid, for a component too wide for four cards in a row */ const grid = cols ? mk('Choices', 'VERTICAL', 24, slot, true) : null; const row = cols ? null : mk('Choices', 'HORIZONTAL', 24, slot, false); let rowN = null, nCard = 0, wideRow = null; const wideRows = [];
      const textOnly = (c, w, why) => { needsReview.push('When to use: "' + w.task + '" shown as text only (' + why + ')'); try { const k = c.findOne((n) => n.type === 'INSTANCE' && n.name === 'Card'); if (k) setProps(k, { 'Show content': false }); } catch (e) { /* kept */ } try { /* 13 Nov round 9: no picture slot at all, never an empty white box: the picture frame is hidden (and the card=off slot too) unless the task or answer text lives inside it; the component name joins the answer text */ const txs = c.findAll((n) => n.type === 'TEXT'); const k2 = c.findOne((n) => n.type === 'INSTANCE' && n.name === 'Card'); const holdsText = (box) => box && txs.some((t) => { let p = t.parent; while (p && p !== c) { if (p === box) return String(t.characters || '').trim().length > 0 && (String(t.characters).trim() === String(w.task).trim() || (w.answer && String(t.characters).includes(String(w.answer).slice(0, 12)))); p = p.parent; } return false; }); if (k2 && !holdsText(k2)) k2.visible = false; for (const sl of c.findAll((n) => n.type === 'SLOT')) { if (!holdsText(sl) && !sl.children.length) sl.visible = false; } const nm = w.visual || w.component || w.use || w.name || ''; if (nm) { const at = txs.find((t) => w.answer && String(t.characters).trim() === String(w.answer).trim()); if (at && !String(at.characters).includes(nm)) at.characters = at.characters + ' · ' + nm; } } catch (e) { /* kept */ } }; /* 13 Nov round 8: a row without a usable picture keeps its card with the task and the component name as text, never an empty card and never dropped */
      // a card's picture is the component the answer names (guidance.whenToUse[].visual): this one, one on the model page, or the main set on its own '🧩 <Name>' page
      const localMain = async (name) => { if (name === D.name) return set.type === 'COMPONENT_SET' ? set.defaultVariant : set; /* 13 Nov: the component's own picture is the set itself (a Docs Kit piece can share its name: Section) */ const here = findSet(pageNode, name); if (here) return here.defaultVariant || here; try { return await mainByName(name); } catch (e) { const pg = figma.root.children.find((p) => p.name === '🧩 ' + name); if (!pg) throw e; await race(pg.loadAsync(), 'page ' + name); const st = findSet(pg, name); if (!st) throw e; return st.defaultVariant || st; } };
      const SELFC = new Set(['Card', 'ResourceCard', 'Stat', ...(G.selfCards || [])]);
      const holdsCard = async (m0, nm) => { if (SELFC.has(nm)) return true; try { const names = []; const look = async (x, d) => { let ch = []; try { ch = 'children' in x ? [...x.children] : []; } catch (e) { return; } for (const q of ch) { if (q.type === 'INSTANCE') { const mm = await race(q.getMainComponentAsync(), 'main of ' + q.name).catch(() => null); const mn = mm ? (mm.parent && mm.parent.type === 'COMPONENT_SET' ? mm.parent.name : mm.name) : ''; names.push(mn); } if (d < 2 && q.type !== 'INSTANCE') await look(q, d + 1); else if (d < 2 && q.type === 'INSTANCE') await look(q, d + 1); } }; await look(m0, 0); return names.some((x) => SELFC.has(x)); } catch (e) { return false; } }; /* a component whose root holds a Card (Columns cells, SidebarLayout, Drawer): found in its first two levels */
      for (const w of G.whenToUse) {
        if (cols && nCard % cols === 0) rowN = mk('Choices · row', 'HORIZONTAL', 24, grid, true); nCard++;
        const c = await place(KEYS.whenCard, 'Doc / When-to-use card', cols ? rowN : row, { Task: w.task, Answer: w.visual ? w.answer : (() => { const nm0 = w.component || w.use || w.name || ''; return nm0 && !String(w.answer || '').includes(nm0) ? (w.answer ? w.answer + ' · ' + nm0 : nm0) : w.answer; })(), Kind: w.kind || 'Instead' }); c.name = 'When · ' + w.task; if (cols) c.layoutSizingHorizontal = 'FILL';
        if (!w.visual) textOnly(c, w, 'no picture in guidance.whenToUse[].visual');
        if (w.visual) { try { const card0 = c.findOne((n) => n.type === 'INSTANCE' && n.name === 'Card'); let main = await localMain(w.visual); if (w.visualVariant && main.parent && main.parent.type === 'COMPONENT_SET') main = main.parent.children.find((v) => v.name === w.visualVariant) || main; const vi = main.createInstance(); if (/^Section/.test(D.name) && vi.name === D.name) vi.name = 'Specimen · ' + D.name;
          const ownBP = w.visual === D.name && (G.baseProps || Object.keys(exText.props).length) && !w.visualTexts; /* this component's own picture gets the one-line sample too; 13 Nov round 3: applied after the picture is placed (before, it left dangling sublayers: Section round 2) */
          const cardW = card0 ? card0.width : c.width; const offKey = G.pictureOnStone ? Object.keys(c.componentProperties).find((k) => base(k).toLowerCase() === 'card' && c.componentProperties[k].type === 'VARIANT') : null; let off = false; if (offKey) { try { c.setProperties({ [offKey]: 'off' }); off = true; } catch (e3) { needsReview.push('When to use: card=off not set (' + e3 + ')'); } } const card = off ? (c.findOne((n) => n.type === 'INSTANCE' && n.name === 'Card') || c) : card0; /* 13 Nov round 3 (item 4): guidance.pictureOnStone puts a card-type picture on the stone (the When card's card=off) when the published piece exposes that property; otherwise unchanged */
          const sf = figma.createFrame(); sf.name = 'Specimen · fitted'; sf.fills = []; sf.clipsContent = false; let room = (cols && grid && grid.width > 100 ? Math.floor((grid.width - 24 * (cols - 1)) / cols) : cardW) - 24; let keepW = !!G.noNarrow; if (!keepW) { try { keepW = !!main.findOne((n) => n.name === 'Canvas'); } catch (e4) { /* none */ } } /* a component whose Canvas is fixed width is never narrowed (ScaledFrame) */
          const slotW = Math.floor(slot.width || 0); const ownWide = !G.fillSpecimens && vi.width > room + (keepW ? 0 : 24); /* 13 Nov round 3 (item 5): a picture that does not fit the card's room (and fits the row) gets its own full-width row at real size, never squeezed to a card */
          if (ownWide) { wideRow = mk('Choices · wide', 'HORIZONTAL', 24, cols ? grid : slot, true); wideRows.push(wideRow); if (cols) { grid.insertChild(grid.children.indexOf(rowN) + 1, wideRow); } else { slot.insertChild(slot.children.indexOf(row), wideRow); row.layoutSizingHorizontal = 'FILL'; } wideRow.appendChild(c); if (cols) { nCard--; if (!rowN.children.length) rowN.remove(); } /* 13 Nov round 8: in a grid a wide picture also takes its own full-width row, the other cards keep their columns */ c.layoutSizingHorizontal = 'FILL'; room = Math.floor(wideRow.width) - 48; } /* 13 Nov (wide specimens): one row frame per wide card, so rowHeights holds */ /* 13 Nov: in a FILL grid the card's own width is not final yet, so the room comes from the grid */
          if (vi.width > room && vi.layoutSizingHorizontal === 'FIXED' && !keepW) { vi.resize(room, vi.height); if ('layoutMode' in vi && vi.layoutMode !== 'NONE') vi.layoutSizingVertical = 'HUG'; } /* 13 Nov: narrowed, not scaled: the height follows the wrapped text, so nested parts do not overlap and the scaledText check sees no scaling */
          if (vi.width > room && !keepW) { const bt = vi.findAll((n) => n.type === 'TEXT' && n.boundVariables && n.boundVariables.fontSize).length; if (bt || room / vi.width < 0.6) { sf.remove(); vi.remove(); throw new Error('too wide for the card unscaled (a scaled picture keeps bound text sizes); pick a narrower visualVariant'); } vi.rescale(room / vi.width); sf.name = 'Specimen · scaled'; } sf.appendChild(vi); /* edited before it joins the card: an instance edited inside a slot can leave dangling sublayers */ sf.resize(vi.width, vi.height);
          const cardType = !off && (G.pictureOnStone || await holdsCard(main, w.visual)); /* 13 Nov round 5: a card-type picture (Card, ResourceCard, Stat, Columns cells, anything with a Card at its root) never sits in the Docs Kit When card's own Card (noCardInCard) until card=off is published: card and picture are stacked in one 'Choice' frame on the stage row, the card keeps its label and task text with its content hidden */
          if (off && card === c) { const hs = () => c.findOne((n) => n.type === 'SLOT'); if (!hs()) throw new Error('card=off exposes no slot'); clearSlot(hs); hs().appendChild(sf); }
          else if (cardType) { try { setProps(card0, { 'Show content': false }); } catch (e5) { needsReview.push('When to use: card content not hidden on "' + w.task + '" (' + e5 + ')'); } const par0 = c.parent, ix0 = par0.children.indexOf(c); const wr = mk('Choice · ' + w.task, 'VERTICAL', 12, par0, !!cols); par0.insertChild(ix0, wr); wr.appendChild(c); c.layoutSizingHorizontal = 'FILL'; c.layoutSizingVertical = 'HUG'; wr.appendChild(sf); if (cols) sf.layoutSizingHorizontal = 'FIXED'; }
          else putIn(card, sf, ownWide);
          if (w.visualText) { await loadFonts(vi); const tn = vi.findOne((n) => n.type === 'TEXT'); if (tn) tn.characters = w.visualText; } if (w.visualTexts) { await loadFonts(vi); for (const [nm, tx] of Object.entries(w.visualTexts)) { const tn = vi.findOne((n) => n.type === 'TEXT' && n.name === nm); if (tn) tn.characters = tx; } } /* guidance visualTexts { layer name: text }: a shorter placeholder in the picture */
          { await loadFonts(vi); const dtx = vi.findAll((n) => n.type === 'TEXT' && n.visible && DEFAULT_WORDS.includes(String(n.characters).trim())); if (dtx.length) { const smp = w.visualText || (w.visual === D.name ? (exText.props.children || exText.props.label || exText.props.title) : null) || G.sampleText || null; if (smp) { for (const tn of dtx) tn.characters = smp; } else needsReview.push('When to use: the "' + w.visual + '" picture on "' + w.task + '" still shows its Docs Kit default text "' + dtx[0].characters + '"; set guidance.whenToUse[].visualText (or visualTexts, or guidance.sampleText)'); } } /* 13 Nov round 10 (item 1): every picture's text comes from the spec; a default word left over is reported, and the check's placeholder fails it */
          if (ownBP) { await loadFonts(vi); applyBase(vi); }
          if (sf.name === 'Specimen · fitted') { if (vi.height > 480 && !G.noCrop) { sf.name = 'Specimen · cropped'; sf.clipsContent = true; sf.resize(vi.width, 480); const hl = figma.createRectangle(); hl.name = 'Crop edge'; sf.appendChild(hl); hl.resize(vi.width, 1); hl.x = 0; hl.y = 479; hl.fills = [bindP(await impVar('color/semantic/border-subtle'))]; } else if (Math.abs(sf.width - vi.width) > 0.5 || Math.abs(sf.height - vi.height) > 0.5) sf.resize(vi.width, vi.height); } /* 13 Nov round 3 (item 5): a picture taller than 480 shows its top part, cut by a hairline, never mostly blank */
        } catch (e) { textOnly(c, w, 'no picture for ' + w.visual + ': ' + e); } }
      }
      for (const rw of (cols ? grid.children : [row, ...wideRows])) for (const c of rw.children) { if (/^Choice · /.test(c.name)) { try { c.layoutSizingVertical = 'FILL'; } catch (e) { /* hug */ } continue; } c.layoutSizingVertical = 'FILL'; } /* A3: cards in one row share one height; a Choice frame (card + picture on the stone) fills the row, its card hugs */
      for (const rw of (cols ? [...grid.children] : [row, ...wideRows])) { try { const kids = [...rw.children].filter((c) => c.visible !== false); if (kids.length < 2) continue; const mx = Math.max(...kids.map((c) => c.height)); if (kids.every((c) => Math.abs(c.height - mx) <= 1)) continue; for (const c of kids) { try { c.layoutSizingVertical = 'FIXED'; } catch (e) { /* resized below */ } c.resize(c.width, mx); } } catch (e) { needsReview.push('When to use: row heights not equalised (' + e + ')'); } } /* 13 Nov round 10 (item 5): FILL left a taller card (TypingDots ChatThread) beside shorter ones; every card in a row takes the tallest height */
      if (wideRow && !cols && !row.children.length) row.remove(); /* 13 Nov: no empty row behind a full-width card */
      filled.push('When to use');
    }
  } catch (e) { skipped.push({ section: 'When to use', why: String(e) }); }

  if (want(4)) try {
    if (!(G.doDont && G.doDont.length)) removeSection('Do / Don’t', 'guidance.doDont is empty', true);
    else if (!G.doDontIntro && !(G.doDontIntro = 'How to use ' + D.name + ' well, and what to avoid.')) throw new Error('guidance.doDontIntro is missing'); /* the build fails instead of shipping 'Do this, not that.' */
    else {
      const slot = secSlot('Do / Don’t'); emptySlot('Do / Don’t'); setSection('Do / Don’t', G.doDontIntro);
      const wrap = figma.createFrame(); wrap.name = 'Pairs'; wrap.layoutMode = 'VERTICAL'; wrap.itemSpacing = 48; wrap.fills = []; slot.appendChild(wrap); wrap.layoutSizingHorizontal = 'FILL'; wrap.layoutSizingVertical = 'HUG'; /* as on the Button page: Pairs fill the slot, gap 48 */
      let n = 0;
      for (const p of G.doDont) {
        const pair = figma.createFrame(); pair.name = 'Pair ' + (++n); pair.layoutMode = 'HORIZONTAL'; pair.itemSpacing = 32; pair.fills = []; wrap.appendChild(pair); pair.layoutSizingHorizontal = 'FILL'; pair.layoutSizingVertical = 'HUG';
        for (const [kind, side] of [['Do', p.do], ['Don\'t', p.dont]]) {
          const c = await place(KEYS.doDont, 'Do / Don’t card', pair, { Rule: side.rule, Kind: kind }); c.name = `${kind} · ${side.rule}`; c.layoutSizingHorizontal = 'FILL'; c.layoutSizingVertical = 'HUG';
          clearSlot(() => slotOf(c, 'Visual')); const vs0 = slotOf(c, 'Visual'); let vs; if (G.pictureOnStone) vs = vs0; else { const vcard = await plainCard(vs0); vcard.card.layoutSizingHorizontal = 'FILL'; vs = vcard.slot; } /* guidance.pictureOnStone: a component that is a card sits straight on the stage, never on a white specimen Card */ /* the picture sits on a white Card, as on the Button page */
          const inst = side.set ? await instFor(side.set, side.variant) : makeInstance(side.vp ? side.vp : side.state && figVariantName('state') ? { [base(figVariantName('state'))]: stateValue(side.state) || side.state } : null); vs.appendChild(inst); if (side.nestCard) { await loadFonts(inst); setProps(inst, { 'Show content': true, 'Show title': false, 'Show text': false }); clearSlot(() => cardSlot(inst)); const cs2 = cardSlot(inst); const inner = makeInstance(side.vp ? side.vp : null); cs2.appendChild(inner); inner.layoutSizingHorizontal = 'FILL'; } /* side.nestCard: a Card inside a Card, the misuse itself */ /* side.vp: any variant props; side.props: component properties (text, booleans) */
          if (side.props) { if (Object.values(side.props).some((v) => typeof v === 'string' && !v.trim())) throw new Error(`Do/Don't "${side.rule}": a property set to blank fakes a state the code can't produce`); /* a Don't is a real misuse the component can render */ await loadFonts(inst); setProps(inst, side.props); }
          if (side.texts) { await loadFonts(inst); for (const [nm, tx] of Object.entries(side.texts)) { const tns2 = inst.findAll((n) => n.type === 'TEXT' && n.name === nm); for (const tn of tns2) tn.characters = tx; if (!tns2.length) needsReview.push(`Do/Don't "${side.rule}": no text layer named ${nm}`); } } /* side.texts { layer name: text }: the wording being judged, set on a nested text (HelperText Message) */
          if (side.text) { await loadFonts(inst); if (typeof side.text === 'object' && !Array.isArray(side.text)) { for (const [nm3, tx3] of Object.entries(side.text)) { const tns3 = inst.findAll((n) => n.type === 'TEXT' && n.name === nm3); for (const tn of tns3) tn.characters = tx3; if (!tns3.length) needsReview.push(`Do/Don't "${side.rule}": no text layer named ${nm3}`); } /* 13 Nov: side.text { layer name: text } */ } else if (Array.isArray(side.text)) { const tns = inst.findAll((n) => n.type === 'TEXT' && n.visible); side.text.forEach((tx, ti) => { if (tns[ti] && tx) tns[ti].characters = tx; }); /* 13 Nov: side.text as a list sets every text the side needs, in tree order */ } else { const tn = inst.findOne((n) => n.type === 'TEXT'); if (tn) tn.characters = side.text; } } /* the real component with the real wording being judged */
          if (!side.set && !side.state && !side.text && !side.texts && !side.vp && !side.props) needsReview.push(`Do/Don't "${side.rule}": no guidance state given, shows the default instance`);
        }
      }
      for (const pr of wrap.children) { for (const cc of pr.children) cc.layoutSizingVertical = 'FILL'; } /* the two cards of a pair share one height */
      filled.push('Do / Don’t');
    }
  } catch (e) { skipped.push({ section: 'Do / Don’t', why: String(e) }); }
  if (want(4)) try { // In context: the real component inside a real sentence (guidance.inContext: { before, text, after }); no stand-ins
    const ic = G.inContext;
    if (!(ic && (ic.text || (ic.form && ic.form.length) || (ic.stack && ic.stack.length)))) removeSection('In context', 'needs a real screen; the spec carries none', true);
    else if (ic.stack) { /* a screen: a toolbar row of the component above a list of other real components, centred in one white Card */
      const slot = secSlot('In context'); emptySlot('In context'); setSection('In context', ic.intro || G.inContextIntro || 'In use.');
      const pc = await plainCard(slot); pc.card.layoutSizingHorizontal = 'FILL';
      const col = mk('Screen', 'VERTICAL', 16, pc.slot, true); col.counterAxisAlignItems = 'CENTER'; col.paddingTop = col.paddingRight = col.paddingBottom = col.paddingLeft = 32;
      const bars = []; let listW = 0;
      for (const it of ic.stack) {
        if (it.row) { const r = mk('Toolbar', 'HORIZONTAL', 16, col, false); r.counterAxisAlignItems = 'CENTER'; for (const x of it.row) { const xi = x.set ? await instFor(x.set, x.variant) : makeInstance(x.vp || null); r.appendChild(xi); await loadFonts(xi); if (x.props) setProps(xi, x.props); } bars.push(r); }
        else { const xi = it.set ? await instFor(it.set, it.variant) : makeInstance(it.vp || null); col.appendChild(xi); await loadFonts(xi); if (it.props) setProps(xi, it.props); listW = Math.max(listW, xi.width); }
      }
      for (const r of bars) { r.layoutSizingHorizontal = 'FIXED'; r.resize(listW || r.width, r.height); r.layoutSizingVertical = 'HUG'; } /* the toolbar is as wide as the list under it, so the two read as one screen */
      filled.push('In context');
    }
    else if (ic.form) { /* a form: real instances in one white Card, labels as they are used */
      const slot = secSlot('In context'); emptySlot('In context'); setSection('In context', ic.intro || G.inContextIntro || 'In use.');
      const pc = await plainCard(slot); pc.card.layoutSizingHorizontal = 'FILL';
      const col = mk('Form', 'VERTICAL', 24, pc.slot, true); col.paddingTop = col.paddingRight = col.paddingBottom = col.paddingLeft = 32;
      for (const f of ic.form) { const fi = makeInstance(f.vp || null); col.appendChild(fi); fi.layoutSizingHorizontal = 'FILL'; await loadFonts(fi); if (f.props) setProps(fi, f.props); }
      filled.push('In context');
    }
    else {
      const slot = secSlot('In context'); emptySlot('In context'); setSection('In context', G.inContextIntro || 'Inside a sentence.');
      const pc = await plainCard(slot); pc.card.layoutSizingHorizontal = 'FILL';
      const rowc = mk('Sentence', 'HORIZONTAL', 0, pc.slot, false); /* ic.gap: -3 cancels the link's own side padding, so no space opens before punctuation */ rowc.counterAxisAlignItems = 'BASELINE'; /* words and the link share one baseline */ rowc.paddingTop = rowc.paddingBottom = rowc.paddingLeft = rowc.paddingRight = 32;
      if (ic.before) await ptxt(rowc, ic.before, { name: 'Before', size: 20 });
      const tail = mk('Link and what follows', 'HORIZONTAL', ic.gap || 0, rowc, false); tail.counterAxisAlignItems = 'BASELINE'; /* ic.gap (-3) cancels the link's own side padding between the link and the punctuation after it, and only there */
      const li = makeInstance(null); tail.appendChild(li); await loadFonts(li); { const tn = li.findOne((n) => n.type === 'TEXT'); if (tn) tn.characters = ic.text; }
      if (ic.after) await ptxt(tail, ic.after, { name: 'After', size: 20 });
      filled.push('In context');
    }
  } catch (e) { skipped.push({ section: 'In context', why: String(e) }); }

  // ---------- 5. States ----------
  if (want(5)) try {
    const states = (D.states.contract && D.states.contract.length ? D.states.contract : D.states.css).filter((x) => !((G.statesSkip) || []).includes(x)); /* guidance.statesSkip: a state the platform draws (the Select popup) is never redrawn in BELLA style (item 27) */
    const stateVp = (s) => { const n = s.replace(/-visible$/, ''); const sv = stateValue(n); if (sv) return { [base(figVariantName('state'))]: sv }; const bk = figVariantName(n); if (bk && (figProps[bk].values || []).map(String).includes('true')) return { [base(bk)]: 'true' }; return null; }; /* a contract state is a value of the state variant, or a true/false variant of its own name (disabled, error) */
    const rows = []; for (const s of states) { const v = stateVp(s); if (v) rows.push([s, v]); else skipped.push({ section: 'States', why: `state "${s}" has no matching Figma variant` }); }
    if (!rows.length) removeSection('States', 'no state matches a Figma variant'); else {
      const slot = secSlot('States'); emptySlot('States'); setSection('States', INTRO.States);
      const col = mk('States · rows', 'VERTICAL', 16, slot, true);
      for (const [s, v] of rows) {
        const r = await place(KEYS.stateRow, 'Doc / State row', col, { State: (s === 'resting' ? 'default' : s.replace(/-visible$/, '')).replace(/^./, (c) => c.toUpperCase()) }); /* 'Default', not 'Resting' (Elleta, Card round 2) */ r.name = 'State · ' + s; r.layoutSizingHorizontal = 'FILL';
        const card = r.findOne((n) => n.type === 'INSTANCE' && n.name === 'Card'); setProps(card, { 'Show content': true, 'Show title': false, 'Show text': false });
        { const tg = (G.stateTags || {})[s]; /* guidance.stateTags { state: 'what differs' }: a state that looks like Default says so in a pink tag (rule 30) */
          if (tg) { clearSlot(() => cardSlot(card)); const cs0 = cardSlot(card); const holder = mk('State specimen', 'HORIZONTAL', 24, cs0, false); /* made inside the slot: a frame cannot be moved into an instance afterwards; the tag sits beside the specimen so every row keeps one height */ holder.counterAxisAlignItems = 'CENTER'; holder.appendChild(makeInstance(v)); const tgi = (await mainByName('Size tag')).createInstance(); holder.appendChild(tgi); setProps(tgi, { Value: tg, variant: 'pink' }); }
          else putIn(card, makeInstance(v), false); }
      }
      if (G.statesEqualHeight) { const mx = Math.max(...col.children.map((c) => c.height)); for (const c of col.children) { c.layoutSizingVertical = 'FIXED'; c.resize(c.width, mx); } } /* guidance.statesEqualHeight: an open state is taller than a closed one; every row takes the tallest height (rule: rows in one section share one height) */
      filled.push('States');
    }
  } catch (e) { skipped.push({ section: 'States', why: String(e) }); }

  // ---------- 6. Sizes ----------
  if (want(6)) try {
    const na = (D.notApplicable || []).find((x) => x.section === 'Sizes');
    if (na || !(D.sizes && D.sizes.length)) removeSection('Sizes', na ? na.why : 'no sizes'); else {
      const szName = figVariantName('size'); const slot = secSlot('Sizes'); emptySlot('Sizes'); setSection('Sizes', INTRO.Sizes);
      const row = figma.createFrame(); row.name = 'Sizes · row'; row.layoutMode = 'HORIZONTAL'; row.itemSpacing = 48; row.counterAxisAlignItems = 'MIN'; row.fills = []; slot.appendChild(row); /* 13 Nov round 10 (item 4): tops aligned and every Measured band as tall as the tallest specimen, so the labels share one baseline and the tags too */
      row.layoutSizingHorizontal = 'HUG'; row.layoutSizingVertical = 'HUG'; row.clipsContent = false; /* 13 Nov: the row grows with the labelled columns */ for (const s of D.sizes) { const i = makeInstance(szName ? { [base(szName)]: s.value } : null); if (G.sizesMeasured === false) { row.appendChild(i); continue; } await chipify(i); /* 13 Nov: every size has its label, a measured bracket and tag, and the 44px target where the component is a control (guidance.sizesTarget true/false overrides) */
        const col = mk('Size · ' + s.value, 'VERTICAL', 12, row, false); col.counterAxisAlignItems = 'CENTER'; await ptxt(col, String(s.value), { name: 'Label', style: 'SemiBold' }); const ms = mk('Measured', 'HORIZONTAL', 8, col, false); ms.counterAxisAlignItems = 'CENTER'; const hh = Math.round(i.height); const tgt = G.sizesTarget === false ? 0 : (G.sizesTarget === true || (D.a11y && D.a11y.targetPx)) ? 44 : 0;
        if (tgt) { const tf = mk('Target · 44', 'VERTICAL', 0, ms, false); tf.primaryAxisAlignItems = 'CENTER'; tf.counterAxisAlignItems = 'CENTER'; tf.layoutSizingHorizontal = 'FIXED'; tf.layoutSizingVertical = 'FIXED'; tf.resize(Math.max(tgt, Math.round(i.width)), Math.max(tgt, hh)); tf.strokes = [bindP(await impVar('color/brand/pink-deep'))]; tf.strokeWeight = 1; tf.dashPattern = [4, 4]; tf.appendChild(i); } else ms.appendChild(i);
        const bk2 = figma.createFrame(); bk2.name = 'Bracket · height'; bk2.fills = []; bk2.clipsContent = false; ms.appendChild(bk2); bk2.resize(10, hh); await prect(bk2, 'stem', 2, hh, 4, 0, 'color/brand/pink-deep'); await prect(bk2, 'tick top', 10, 2, 0, 0, 'color/brand/pink-deep'); await prect(bk2, 'tick bottom', 10, 2, 0, hh - 2, 'color/brand/pink-deep');
        const tags = mk('Tags', 'HORIZONTAL', 8, col, false); const tg1 = (await mainByName('Size tag')).createInstance(); tags.appendChild(tg1); setProps(tg1, { Value: hh + 'px', variant: 'pink' }); if (tgt) { const tg2 = (await mainByName('Size tag')).createInstance(); tags.appendChild(tg2); setProps(tg2, { Value: tgt + ' target', variant: 'pink' }); } }
      { try { const msx = row.findAll((n) => n.name === 'Measured' && n.type === 'FRAME' && n.parent && /^Size · /.test(n.parent.name)); if (msx.length) { const mxh = Math.max(...msx.map((m) => m.height)); for (const m of msx) { m.layoutSizingVertical = 'FIXED'; m.counterAxisAlignItems = 'CENTER'; m.resize(m.width, mxh); } const lbs = row.findAll((n) => n.type === 'TEXT' && n.name === 'Label' && n.parent && /^Size · /.test(n.parent.name)); const ys = lbs.map((t) => Math.round(t.absoluteBoundingBox.y)); if (ys.length && Math.max(...ys) - Math.min(...ys) > 1) needsReview.push('Sizes: labels are not on one line (' + ys.join(', ') + ')'); const nCol = row.children.filter((c) => /^Size · /.test(c.name)).length; if (G.sizesMeasured !== false && nCol !== D.sizes.length) needsReview.push('Sizes: ' + nCol + ' specimens for ' + D.sizes.length + ' sizes'); } } catch (e) { needsReview.push('Sizes: band not equalised (' + e + ')'); } }
      if (!szName) needsReview.push('Sizes: Figma has no size variant, every size shows the default instance');
      await unchip(); filled.push('Sizes');
    }
  } catch (e) { skipped.push({ section: 'Sizes', why: String(e) }); await unchip(); }

  // ---------- 7. Anatomy: pins in tree order, parts found on the placed, scaled specimen ----------
  if (want(7)) try {
    const slot = secSlot('Anatomy'); emptySlot('Anatomy'); const parts = (D.anatomy.parts || []).map((p0) => { const g0 = (G.anatomyParts || []).find((a) => String(a.name).toLowerCase() === String(p0.name).toLowerCase()); return g0 ? { ...p0, ...(g0.layer ? { layer: g0.layer } : {}), ...(g0.at ? { at: g0.at } : {}), ...(g0.side ? { side: g0.side } : {}) } : p0; }).slice(0, 8); /* 13 Nov round 9: guidance.anatomyParts is the hand-edited truth; anatomy.parts built before an edit lost layer/at/side (CodeBlock pins 4 and 5: 'Line number' and 'Marked line' looked up by their display names) */
    setSection('Anatomy', `${parts.length} part${parts.length === 1 ? '' : 's'}: ${parts.map((p) => p.name.toLowerCase()).join(', ')}.`);
    let W = 1048; const PAD = 16, GAP = 52; /* pin labels are 40px high: at least 12px clear between two labels */
    const acard = await plainCard(slot); acard.card.name = 'Card · Anatomy'; acard.card.layoutSizingHorizontal = 'FILL'; /* the specimen sits on a white BellaComponents Card */
    const diagram = figma.createFrame(); diagram.name = 'Anatomy diagram'; diagram.clipsContent = false; acard.slot.appendChild(diagram); diagram.fills = [];
    const spec = figma.createFrame(); spec.name = 'Specimen · scaled'; spec.fills = []; spec.clipsContent = false; diagram.appendChild(spec);
    const inst = makeInstance(null); spec.appendChild(inst); await chipify(inst); if (G.anatomyProps) setProps(inst, G.anatomyProps); for (const pt of parts) { const key = String(pt.name).toLowerCase().replace(/\s+/g, ''); for (const [ck, cv] of Object.entries(inst.componentProperties)) { if (base(ck).toLowerCase().replace(/^(show|has)\s*/, '').replace(/\s+/g, '') !== key || (G.anatomyProps && base(ck) in G.anatomyProps)) continue; if (cv.type === 'BOOLEAN' && cv.value === false) inst.setProperties({ [ck]: true }); else if (cv.type === 'VARIANT' && cv.value === 'false') { try { inst.setProperties({ [ck]: 'true' }); } catch (e) { /* no true option */ } } } } /* 13 Nov: a part only a boolean/variant shows (Avatar Ring) is switched on in the anatomy specimen */ /* guidance.anatomyProps: show an optional part (leading: true) so it can be pinned */
    const k = G.anatomyScale || Math.max(1, Math.min(4, ((D.anatomy && D.anatomy.scaleWidth) || 480) / inst.width)); /* guidance.anatomyScale: 1 for a component whose text sizes are variable-bound (rescale does not scale them) */ inst.rescale(k); spec.resize(inst.width, inst.height);
    const labelMain = await mainByName('Pin label'); let wideAn = false, shiftX = null;
    { /* 13 Nov (wide specimens): pin labels beside the specimen must not reach it. When the centred margins are too small for the widest label, the specimen is moved to make room (diagram widened up to the card's room); when the specimen leaves no room at all (Section, 1056), every label goes above or below it on a vertical leader */
      try { const slotW = Math.floor(acard.slot.width) || 1134, sw0 = Math.ceil(spec.width); const lw = { left: 0, right: 0 };
        for (const pt of parts) { const sd = pt.side === 'right' ? 'right' : pt.side === 'bottom' ? 'bottom' : 'left'; if (sd === 'bottom') continue; const pr = labelMain.createInstance(); diagram.appendChild(pr); try { setProps(pr, { Label: pt.name }); lw[sd] = Math.max(lw[sd], pr.width); } finally { pr.remove(); } }
        const nl = lw.left ? lw.left + PAD + 12 : 0, nr = lw.right ? lw.right + PAD + 12 : 0;
        if (sw0 + 2 * PAD > W || (W - sw0) / 2 < Math.max(nl, nr)) { const total = nl + sw0 + nr; if (sw0 + 2 * PAD <= slotW && total <= slotW) { W = Math.max(W, Math.min(slotW, total)); shiftX = nl + (W - total) / 2; } else { wideAn = true; W = Math.min(slotW, Math.max(W, sw0 + 2 * PAD)); } }
      } catch (e) { needsReview.push('Anatomy: label widths not measured (' + e + ')'); } }
    const hasBottom = parts.some((p) => p.side === 'bottom'); const H = Math.max(spec.height + 80, parts.length * GAP + 40) + (hasBottom ? 90 : 0); diagram.resize(W, H);
    spec.x = shiftX != null ? shiftX : (W - spec.width) / 2; spec.y = hasBottom ? 40 : (H - spec.height) / 2; /* a part in the middle of the specimen gets its label below, on a vertical leader (side: bottom) */
    const dbox = diagram.absoluteBoundingBox; const last = { left: -1e9, right: -1e9 };
    const ownFind = (nm) => { const hit = inst.findOne((n) => n.name === nm && n.visible !== false); if (!hit) return hit; const inNested = (x) => { let q = x.parent; while (q && q !== inst) { if (q.type === 'INSTANCE') return true; q = q.parent; } return false; }; if (!inNested(hit)) return hit; /* 13 Nov round 3: the depth-first hit sits in a nested instance (Drawer Footer -> NavList footer): breadth-first through the component's own layers first, nested instances not entered */ let lvl = [inst]; while (lvl.length) { const nx = []; for (const n of lvl) { let ch = []; try { ch = 'children' in n ? [...n.children] : []; } catch (e) { /* dangling */ } for (const c of ch) { if (c.name === nm && c.visible !== false) return c; if (c.type !== 'INSTANCE') nx.push(c); } } lvl = nx; } return hit; };
    const findPart = (p) => (p.layer === 'root' ? inst : p.type === 'TEXT' ? inst.findOne((n) => n.type === 'TEXT') : (/#\d+$/.test(p.layer || '') ? inst.findAll((n) => n.name === p.layer.replace(/#\d+$/, '') && n.visible !== false)[+p.layer.match(/#(\d+)$/)[1] - 1] : ownFind(p.layer || p.name))); // a part may name its layer ("Name#3": the 3rd layer of that name), or 'root' for the whole specimen
    const inkBoxes = (nd) => { const out = []; const hasP = (x) => ['fills', 'strokes'].some((k) => k in x && Array.isArray(x[k]) && x[k].some((q) => q.visible !== false && (q.opacity === undefined || q.opacity > 0))); const walk = (x) => { try { if (x.visible === false) return; if (x.type === 'TEXT') { if (String(x.characters).trim()) { const rb = x.absoluteRenderBounds; if (rb) out.push({ b: rb, txt: true }); } return; } if (['VECTOR', 'LINE', 'STAR', 'POLYGON', 'ELLIPSE', 'BOOLEAN_OPERATION', 'RECTANGLE', 'FRAME', 'INSTANCE', 'COMPONENT'].includes(x.type) && hasP(x)) { const bb = x.absoluteBoundingBox; if (bb) { const big = Math.min(bb.width, bb.height) > 48 && (bb.width * bb.height > 40000 || !(x.fills && Array.isArray(x.fills) && x.fills.some((q) => q.visible !== false && (q.opacity === undefined || q.opacity > 0)))); if (!big) out.push({ b: bb, txt: false }); } } if ('children' in x) for (const ch of x.children) walk(ch); } catch (e) { /* dangling */ } }; walk(nd); return out; };
    const ownPaint = (x) => ['fills', 'strokes'].some((k) => k in x && Array.isArray(x[k]) && x[k].some((q) => q.visible !== false && (q.opacity === undefined || q.opacity > 0)));
    const partInk = (nd, mode) => { if (nd.type === 'TEXT') return { b: nd.absoluteRenderBounds || nd.absoluteBoundingBox, txt: true }; /* 13 Nov round 10 (item 3): a part that paints itself (a pill, a ring, a disc, a key cap: fill or stroke, any size) is aimed at by ITS OWN bounds (the layer named in anatomyParts), never at the text or the inner shape inside it; 'big' no longer skips it (Tag pill, Avatar ring) */ if (ownPaint(nd) && nd.absoluteBoundingBox) return { b: nd.absoluteBoundingBox, txt: false }; const all = inkBoxes(nd); if (!all.length) return { b: nd.absoluteBoundingBox, txt: false }; const key = { left: (o) => o.b.x, right: (o) => -(o.b.x + o.b.width), below: (o) => -(o.b.y + o.b.height), above: (o) => o.b.y }[mode] || ((o) => o.b.x); return all.slice().sort((a, b) => key(a) - key(b))[0]; }; /* 13 Nov round 3 (item 7): a leader to a frame or instance ends on the part's visible ink on the side it comes from (a text's glyph box, a painted shape), not on the part's empty box (SectionHeader Heading 107px, SidebarLayout Aside 22px, Drawer Close 18px off) */
    let dotRv = null; const dotR = async () => { if (dotRv != null) return dotRv; const pr = await mkLeader(diagram, 40, 'pink', 0); try { const d = pr.findAll((x) => x.type === 'ELLIPSE' && x.visible).pop(); const lb = pr.absoluteBoundingBox, db = d && d.absoluteBoundingBox; dotRv = db ? Math.max(0, Math.min(12, (lb.x + lb.width) - (db.x + db.width / 2))) : 3; } finally { pr.remove(); } return dotRv; }; /* how far the dot's centre sits from the leader's tip */
    // pins are numbered in reading order: top to bottom, then left to right, measured on the placed specimen
    let ordered = parts.map((p) => { const nd = findPart(p); const bb = nd && nd.absoluteBoundingBox; const yy = bb ? (p.at === 'top' ? bb.y + 4 : p.at === 'bottom' ? (bb.height > 12 ? bb.y + bb.height - 2 : bb.y + bb.height / 2) : bb.y + bb.height / 2) : 1e9; return { p, yy, xx: bb ? (p.side === 'right' ? bb.x + bb.width : bb.x) : 0 }; }).sort((a, b) => ((a.p.side === 'bottom') - (b.p.side === 'bottom')) || (Math.abs(a.yy - b.yy) > 12 ? a.yy - b.yy : a.xx - b.xx)).map((o) => o.p); /* labels below the specimen come after the ones beside it: pins are numbered as the labels read */
    if (!wideAn) { try { const lastS = { left: -1e9, right: -1e9 }; for (const p of ordered) { const nd = findPart(p); if (!nd || p.side === 'bottom') continue; const sd = p.side === 'right' ? 'right' : 'left'; const bb = (nd.type === 'TEXT' && nd.absoluteRenderBounds) || nd.absoluteBoundingBox; const ty = p.at === 'top' ? bb.y + 4 : p.at === 'bottom' ? (bb.height > 12 ? bb.y + bb.height - 2 : bb.y + bb.height / 2) : bb.y + bb.height / 2; const ly = Math.max(ty - 20, lastS[sd] + GAP); const cyl = ly + 20; if (cyl < bb.y - 4 || cyl > bb.y + bb.height + 4) { wideAn = true; break; } lastS[sd] = ly; } } catch (e) { /* kept beside */ } } /* 13 Nov: stacked text parts (ScoreStrip Name over Kind) are too close for two 40px labels on one side: a label pushed away from its part cannot be reached by a straight leader, so the labels go above and below, each leader aimed at its own part */
    let wideDone = false;
    if (wideAn) { /* 13 Nov (wide specimen, no room beside it): labels above (parts in the upper half) or below (lower half) on vertical leaders; each leader is placed at an x inside its own part where no other text is crossed; numbered above left to right, then below left to right; labels kept 12px apart */
      try {
        const sb0 = spec.absoluteBoundingBox; const texts = []; for (const t of inst.findAll((n) => n.type === 'TEXT' && n.visible !== false)) { try { const rb = t.absoluteRenderBounds; if (rb && String(t.characters).trim()) texts.push({ t, rb }); } catch (e) { /* dangling */ } }
        const inside = (t, nd) => { let q = t; while (q) { if (q === nd) return true; q = q.parent; } return false; };
        const clear = (xx, y0, y1, nd) => !texts.some(({ t, rb }) => !inside(t, nd) && xx > rb.x - 3 && xx < rb.x + rb.width + 3 && y1 > rb.y && y0 < rb.y + rb.height);
        const infos = [];
        for (const p of ordered) { const nd = findPart(p); if (!nd) { needsReview.push(`Anatomy: no layer "${p.name}" on the placed instance, pin not placed`); continue; } const bb0 = (nd.type === 'TEXT' && nd.absoluteRenderBounds) || nd.absoluteBoundingBox; const f = ((bb0.y + bb0.height / 2) - sb0.y) / sb0.height; const d0 = (p.side === 'bottom' || f > 0.5) ? 'below' : 'above'; const ibx = nd.type === 'TEXT' ? null : partInk(nd, d0); const bb = ibx ? ibx.b : bb0; let pick = null;
          for (const dir of [d0, d0 === 'above' ? 'below' : 'above']) { for (const fr of [0.5, 0.25, 0.75, 0.1, 0.9]) { const xx = bb.x + Math.max(2, Math.min(bb.width - 2, bb.width * fr)); const y0 = dir === 'above' ? sb0.y - 200 : bb.y + bb.height, y1 = dir === 'above' ? bb.y : sb0.y + sb0.height + 200; if (clear(xx, y0, y1, nd)) { pick = { dir, x: xx }; break; } } if (pick) break; }
          if (!pick) { pick = { dir: d0, x: bb.x + bb.width / 2 }; needsReview.push(`Anatomy: the leader to "${p.name}" crosses other text in the specimen`); }
          infos.push({ p, bb, dir: pick.dir, x: pick.x, txt: nd.type === 'TEXT' || !!(ibx && ibx.txt) }); }
        const grp = { above: infos.filter((i) => i.dir === 'above').sort((a, b) => a.x - b.x), below: infos.filter((i) => i.dir === 'below').sort((a, b) => a.x - b.x) };
        const topBand = grp.above.length ? 96 : 24, botBand = grp.below.length ? 96 : 24; const ox0 = spec.x, oy0 = spec.y; diagram.resize(W, spec.height + topBand + botBand); spec.x = (W - spec.width) / 2; spec.y = topBand; { const ddx = spec.x - ox0, ddy = spec.y - oy0; for (const it of infos) { it.bb = { x: it.bb.x + ddx, y: it.bb.y + ddy, width: it.bb.width, height: it.bb.height }; it.x += ddx; } } /* the measured boxes move with the specimen */
        ordered = [...grp.above, ...grp.below].map((i) => i.p); let n0 = 0;
        for (const g of ['above', 'below']) { const items = grp[g];
          for (const it of items) { n0++; it.n = n0; const colour = PIN_COLOURS[(n0 - 1) % 4]; const label = labelMain.createInstance(); diagram.appendChild(label); setProps(label, { Label: it.p.name, variant: colour }); const pin = label.findOne((n) => n.type === 'INSTANCE' && n.name === 'Pin'); if (pin) setProps(pin, { Number: String(n0).padStart(2, '0'), variant: colour }); it.label = label; it.colour = colour; }
          let prevR = PAD - 12; for (const it of items) { const w1 = it.label.width, xr = it.x - dbox.x; it.lo = Math.max(PAD, prevR + 12, xr - (w1 - 14)); it.hi = Math.min(xr - 14, W - PAD - w1); it.lx = it.lo; prevR = it.lx + w1; } /* leftmost place where the label still holds its leader (14px in from either end), 12px from the one before */
          let bnd = W - PAD; for (let j = items.length - 1; j >= 0; j--) { const it = items[j], w1 = it.label.width; const top1 = Math.max(it.lo, Math.min(it.hi, bnd - w1)); it.lx = Math.max(it.lo, Math.min((it.x - dbox.x) - w1 / 2, top1)); bnd = it.lx - 12; } /* then each label moves toward the centre of its leader as far as its neighbours allow, so a leader stays inside its own part */
          for (const it of items) { it.label.x = it.lx; it.label.y = g === 'above' ? 8 : spec.y + spec.height + 48; const lxp = Math.min(Math.max(it.x - dbox.x, it.label.x + 14), it.label.x + it.label.width - 14); if (Math.abs(lxp - (it.x - dbox.x)) > 0.5 && (lxp + dbox.x < it.bb.x - 4 || lxp + dbox.x > it.bb.x + it.bb.width + 4)) needsReview.push(`Anatomy: the leader to "${it.p.name}" is ${Math.round(Math.abs(lxp - (it.x - dbox.x)))}px off its part (label pushed aside)`);
            if (g === 'below') { const topY = it.bb.y + it.bb.height + (it.txt ? 2 : -1) - dbox.y; const L = await mkLeader(diagram, it.label.y - (topY - 5), it.colour, 90); placeBB(L, dbox.x + lxp - 8, dbox.y + topY - 5); }
            else { const ty0 = it.bb.y + (it.txt ? -2 : 1) - dbox.y, yTop = it.label.y + it.label.height; const L = await mkLeader(diagram, ty0 + 5 - yTop, it.colour, -90); placeBB(L, dbox.x + lxp - 8, dbox.y + yTop); } } }
        wideDone = true;
      } catch (e) { needsReview.push('Anatomy: wide layout failed (' + e + ')'); }
    }
    setSection('Anatomy', `${ordered.length} part${ordered.length === 1 ? '' : 's'}: ${ordered.map((p) => p.name.toLowerCase()).join(', ')}.`); /* the lead lists the parts in pin order */
    let idx = 0;
    for (const p of (wideDone ? [] : ordered)) {
      idx++; const side = p.side === 'right' ? 'right' : p.side === 'bottom' ? 'bottom' : 'left'; const node = findPart(p); const colour = PIN_COLOURS[(idx - 1) % 4];
      if (!node) { needsReview.push(`Anatomy: no layer "${p.name}" on the placed instance, pin ${idx} not placed`); continue; }
      const ink = node.type === 'TEXT' ? null : partInk(node, side === 'right' ? 'right' : side === 'bottom' ? 'below' : 'left'); const b = ink ? ink.b : (node.type === 'TEXT' && node.absoluteRenderBounds) || node.absoluteBoundingBox; /* 13 Nov: a text part is aimed at its glyph box */ const isTxt = ink ? ink.txt : node.type === 'TEXT'; const legacyGap = node.type === 'TEXT' && (G.anatomyTextGap != null || /^(Pin|Leader)$/.test(D.name)); const r1 = (side === 'bottom' || legacyGap) ? 0 : await dotR();
      const ty = (p.at === 'top' ? b.y + 4 : p.at === 'bottom' ? (b.height > 12 ? b.y + b.height - 2 : b.y + b.height / 2) : b.y + b.height / 2) - dbox.y; /* `at` lets parts that share one row land at different heights, still inside their own box */
      const tx = (!legacyGap && side !== 'bottom' ? (isTxt ? (side === 'right' ? b.x + b.width + 2 - r1 : b.x - 2 + r1) : (side === 'right' ? b.x + b.width - 2 - r1 : b.x + 2 + r1)) : node.type === 'TEXT' ? (side === 'right' ? b.x + b.width + (/^(Pin|Leader)$/.test(D.name) ? -5 : (G.anatomyTextGap != null ? G.anatomyTextGap : 3)) : b.x - (/^(Pin|Leader)$/.test(D.name) ? -5 : (G.anatomyTextGap != null ? G.anatomyTextGap : 3))) : (side === 'right' ? b.x + b.width - 6 : b.x + 6)) - dbox.x; /* a leader to text ends just before it, not inside the words */ /* `side` puts the label left or right of the specimen */
      if (side === 'bottom') {
        const label = labelMain.createInstance(); diagram.appendChild(label); setProps(label, { Label: p.name, variant: colour }); const pin = label.findOne((n) => n.type === 'INSTANCE' && n.name === 'Pin'); if (pin) setProps(pin, { Number: String(idx).padStart(2, '0'), variant: colour });
        const cxp = b.x + b.width / 2 - dbox.x; const topY = b.y + b.height - 1 - dbox.y; label.x = cxp - label.width / 2; label.y = spec.y + spec.height + 48;
        const L = await mkLeader(diagram, label.y - (topY - 5), colour, 90); placeBB(L, dbox.x + cxp - 8, dbox.y + topY - 5); continue;
      }
      const ly = Math.max(ty - 20, last[side] + GAP); if (ly > ty - 20 + 1) needsReview.push(`Anatomy: pin ${idx} pushed down ${Math.round(ly - (ty - 20))}px to clear the pin above it`); last[side] = ly;
      const label = labelMain.createInstance(); diagram.appendChild(label); setProps(label, { Label: p.name, variant: colour });
      const pin = label.findOne((n) => n.type === 'INSTANCE' && n.name === 'Pin'); if (pin) setProps(pin, { Number: String(idx).padStart(2, '0'), variant: colour });
      label.x = side === 'right' ? W - PAD - label.width : PAD; label.y = ly;
      const w = Math.max(24, side === 'right' ? label.x - tx : tx - (label.x + label.width));
      const L = await mkLeader(diagram, w, colour, side === 'right' ? 180 : 0);
      if (side === 'right') placeBB(L, dbox.x + tx, dbox.y + ly + 20 - L.height / 2); else { L.x = label.x + label.width; L.y = ly + 20 - L.height / 2; }
      const lb = L.absoluteBoundingBox; const lyc = lb.y + lb.height / 2; const dy = lyc < b.y ? lyc - b.y : lyc > b.y + b.height ? lyc - (b.y + b.height) : 0; if (Math.abs(dy) > 4) throw new Error('Anatomy: leader ' + idx + ' ("' + p.name + '") ends ' + Math.round(Math.abs(dy)) + 'px from its part'); { const tip = side === 'right' ? lb.x : lb.x + lb.width; const dxo = tip < b.x ? b.x - tip : tip > b.x + b.width ? tip - (b.x + b.width) : 0; if (dxo > 4) throw new Error('Anatomy: leader ' + idx + ' ("' + p.name + '") ends ' + Math.round(dxo) + 'px from its part'); } /* 13 Nov: assertion, a leader ends within 4px of its part */ if (Math.abs(dy) > 3) needsReview.push(`Anatomy: leader ${idx} is ${Math.round(dy)}px off its part`);
      try { /* 13 Nov round 10 (item 3): a leader never runs over another part's text; the last 8px at the dot end are the part itself */ const xa = side === 'right' ? lb.x + 8 : lb.x, xb = side === 'right' ? lb.x + lb.width : lb.x + lb.width - 8; for (const tx2 of inst.findAll((n) => n.type === 'TEXT' && n.visible && String(n.characters).trim())) { let own = false; for (let q = tx2; q; q = q.parent) if (q === node) own = true; if (own) continue; const rb2 = tx2.absoluteRenderBounds; if (rb2 && lyc > rb2.y + 1 && lyc < rb2.y + rb2.height - 1 && xb > rb2.x + 1 && xa < rb2.x + rb2.width - 1) needsReview.push(`Anatomy: leader ${idx} ("${p.name}") crosses the text "${String(tx2.characters).slice(0, 20)}"`); } } catch (e2) { /* not measured */ }
    }
    { /* assertion: pin n sits above (or, at one height, left of) pin n+1; labels stay 8px clear of each other and of the specimen */
      const labs = []; for (const ch of diagram.children) if (ch.type === 'INSTANCE' && /^Pin label/.test(ch.name)) { const pn = ch.findOne((n) => n.type === 'INSTANCE' && n.name === 'Pin'); const num = pn && pn.componentProperties ? Object.entries(pn.componentProperties).find(([k]) => /^Number/.test(k)) : null; labs.push({ n: num ? Number(num[1].value) : 0, b: ch.absoluteBoundingBox }); }
      labs.sort((a, b) => a.n - b.n); const sb = spec.absoluteBoundingBox;
      for (let i = 1; i < labs.length; i++) { const a = labs[i - 1], b = labs[i]; if (b.b.y + 1 < a.b.y) needsReview.push(`ASSERT anatomy order: pin ${b.n} sits above pin ${a.n}`); }
      for (let i = 0; i < labs.length; i++) { for (let j = i + 1; j < labs.length; j++) { const a = labs[i].b, b = labs[j].b; if (a.x < b.x + b.width + 8 && b.x < a.x + a.width + 8 && a.y < b.y + b.height + 8 && b.y < a.y + a.height + 8) needsReview.push(`ASSERT anatomy: labels ${labs[i].n} and ${labs[j].n} are under 8px apart`); } const a = labs[i].b; if (a.x < sb.x + sb.width + 8 && sb.x < a.x + a.width + 8 && a.y < sb.y + sb.height + 8 && sb.y < a.y + a.height + 8) needsReview.push(`ASSERT anatomy: label ${labs[i].n} is under 8px from the specimen`); }
    }
    await unchip(); filled.push('Anatomy');
  } catch (e) { skipped.push({ section: 'Anatomy', why: String(e) }); await unchip(); }

  // ---------- 8. Behaviour and motion ----------
  if (want(8)) try {
    const m = D.motion && D.motion.transitions || [];
    if (!m.length) removeSection('Behaviour and motion', 'no transition in the CSS module'); else {
      const slot = secSlot('Behaviour and motion'); emptySlot('Behaviour and motion'); setSection('Behaviour and motion', G.motionIntro || INTRO.Behaviour);
      const content = mk('Content', 'VERTICAL', 32, slot, true); content.counterAxisAlignItems = 'CENTER';
      const col = mk('Motion', 'VERTICAL', 40, content, true); col.paddingLeft = col.paddingRight = 49; /* the right-hand column stays inside the stage padding */
      const t0 = m[0]; const curve = (t0.durations[0] && t0.easings[0]) ? `${t0.durations[0].value} · ${t0.easings[0].value}` : '';
      const defs = (D.guidance && D.guidance.motionRows && D.guidance.motionRows.length) ? D.guidance.motionRows : [];
      if (!defs.length && !(G.motionTags && G.motionTags.length)) needsGuidance.push({ section: 'Behaviour and motion', needs: 'guidance.motionRows (a before and an after variant per row) is empty' });
      if (!defs.length && G.motionTags && G.motionTags.length) { /* 13 Nov (TypingDots): a keyframe animation with no variant to show before and after: the live specimen beside pink tags, one per measured value */
        const pc = await plainCard(col); pc.card.layoutSizingHorizontal = 'FILL';
        const body = mk('Motion picture', 'HORIZONTAL', 48, pc.slot, false); body.counterAxisAlignItems = 'CENTER';
        body.appendChild(await instFor());
        const list = mk('Motion tags', 'VERTICAL', 12, body, false);
        for (const t of G.motionTags) { const rw = mk('Row · ' + t.value, 'HORIZONTAL', 16, list, false); rw.counterAxisAlignItems = 'CENTER'; const tw = mk('Tag', 'HORIZONTAL', 0, rw, false); const tg = (await mainByName('Size tag')).createInstance(); tw.appendChild(tg); setProps(tg, { Value: t.value, variant: 'pink' }); tw.layoutSizingHorizontal = 'FIXED'; tw.resize(150, tw.height); await ptxt(rw, t.plain, { name: 'Plain' }); }
      }
      for (const r of defs) {
        const wide = ((set.type === 'COMPONENT_SET' ? set.defaultVariant : set).width) > 230; /* a wide component (Card, 320) cannot sit two across beside a title column: the title goes above and the frames get the room */
        const row0 = mk('Row · ' + r.title, wide ? 'VERTICAL' : 'HORIZONTAL', wide ? 16 : 32, col, true); if (!wide) row0.counterAxisAlignItems = 'CENTER';
        { const tt = await ptxt(row0, r.title, { name: 'Title', style: 'SemiBold' }); if (!wide) { tt.textAutoResize = 'HEIGHT'; tt.resize(160, tt.height); } }
        const row = wide ? mk('Row body', 'HORIZONTAL', 32, row0, true) : row0; if (wide) row.counterAxisAlignItems = 'CENTER';
        const pc = await plainCard(row); pc.card.layoutSizingHorizontal = 'FILL';
        const fr = mk('Frames card', G.motionStack ? 'VERTICAL' : 'HORIZONTAL', 32, pc.slot, false); /* guidance.motionStack: a component too wide for two frames across (Disclosure, 480) stacks before above after */ fr.primaryAxisAlignItems = 'CENTER'; fr.counterAxisAlignItems = 'CENTER';
        for (const side of [r.before, r.after]) { const f = mk('Frame · ' + side.caption, 'VERTICAL', 8, fr, false); f.counterAxisAlignItems = 'CENTER'; const box = mk('Box', 'VERTICAL', 0, f, false); box.counterAxisAlignItems = 'CENTER'; box.appendChild(await instFor(r.set, side.variant)); await ptxt(f, side.caption, { name: 'Caption' }); }
        const vals = mk('Values', 'VERTICAL', 12, row, false); vals.layoutSizingHorizontal = 'FIXED'; vals.resize(320, vals.height); const v = mk('Value', 'VERTICAL', 2, vals, true); { const pt = await ptxt(v, r.plain, { name: 'Plain', size: 18 }); pt.layoutSizingHorizontal = 'FILL'; } { const ct = await ptxt(v, curve, { name: 'Curve', family: 'Geist Mono' }); try { ct.layoutSizingHorizontal = 'FILL'; ct.textAutoResize = 'HEIGHT'; ct.textAlignHorizontal = 'LEFT'; } catch (e) { /* kept hug */ } } /* 13 Nov round 8: the curve wraps inside its column, never clips */ /* card FILLS, title and values columns are fixed: the right-hand text starts at one x on every row */
      }
      if (G.reducedMotionLine) { const nt = await ptxt(content, G.reducedMotionLine, { name: 'Note', fill: 'color/semantic/text-secondary' }); nt.layoutSizingHorizontal = 'FILL'; nt.textAutoResize = 'HEIGHT'; nt.textAlignHorizontal = 'LEFT'; } /* guidance.reducedMotionLine: the CSS reduced-motion block, worded as it reads (rule 31), left-aligned with the section */ else if (D.motion.reducedMotion) { const props = [...new Set(m.flatMap((t) => t.properties))].map((x) => x.replace(/^background$/, 'background').replace(/-/g, ' ')); const none = /none/.test(D.motion.reducedMotion.declaration); await ptxt(content, 'Reduced motion: ' + (none ? 'no transition; ' + props.join(' and ') + ' change at once' : D.motion.reducedMotion.declaration) + '.', { name: 'Note', fill: 'color/semantic/text-secondary' }); } /* generated from the CSS reduced-motion rule and the properties that transition */
      filled.push('Behaviour and motion');
    }
  } catch (e) { skipped.push({ section: 'Behaviour and motion', why: String(e) }); }

  // ---------- 9. Accessibility: notes from a11y, contrast from the measured pairs ----------
  if (want(9)) try {
    const slot = secSlot('Accessibility'); emptySlot('Accessibility'); setSection('Accessibility', INTRO.Accessibility); const A = D.a11y;
    const wrap = mk('Accessibility · facts', 'VERTICAL', 32, slot, false); wrap.resize(803, wrap.height); wrap.layoutSizingVertical = 'HUG';
    // the measure card: the specimen with a size bracket and a measured tag, a leader into a branching bracket, stacked Role / Name / Tab stop chips
    const mcard = await plainCard(wrap); mcard.card.name = 'Card · Measure'; mcard.card.layoutSizingHorizontal = 'FILL';
    const dia = mk('Diagram', 'HORIZONTAL', 0, mcard.slot, false); dia.paddingTop = dia.paddingRight = dia.paddingBottom = dia.paddingLeft = 32; dia.counterAxisAlignItems = 'CENTER';
    const specF = mk('Specimen', 'VERTICAL', 28, dia, false); specF.counterAxisAlignItems = 'CENTER';
    const measured = mk('Measured', 'HORIZONTAL', 12, specF, false); measured.counterAxisAlignItems = 'CENTER';
    const bracketN = ('a11yBracket' in G) ? G.a11yBracket : D.a11y.targetPx; /* from the code (min-height); none for an inline text link, which is exempt from the target size */ let sizeNum = null;
    if (bracketN) { sizeNum = await ptxt(measured, String(bracketN), { name: 'Size', fill: 'color/semantic/text-secondary' });
    const brk = figma.createFrame(); brk.name = 'Bracket · size'; brk.fills = []; brk.clipsContent = false; measured.appendChild(brk); brk.resize(10, bracketN);
    await prect(brk, 'stem', 2, brk.height, 4, 0, 'color/brand/pink-deep'); await prect(brk, 'tick top', 10, 2, 0, 0, 'color/brand/pink-deep'); await prect(brk, 'tick bottom', 10, 2, 0, brk.height - 2, 'color/brand/pink-deep'); }
    const specInst = makeInstance(null); measured.appendChild(specInst); await chipify(specInst);
    if (G.a11ySpecimenWidth) { try { specInst.layoutSizingHorizontal = 'FIXED'; } catch (e) { /* 13 Nov: a sizing setter that throws (ChatThread) must not skip Accessibility; resize alone narrows it */ } try { specInst.resize(G.a11ySpecimenWidth, specInst.height); } catch (e) { needsReview.push('a11ySpecimenWidth: ' + e); } } /* guidance.a11ySpecimenWidth: a component fixed wide in Figma (Heading, 880) is narrowed so the chips beside it fit */
    const wRow = mk('Bracket · width row', 'HORIZONTAL', 0, specF, true); wRow.paddingLeft = sizeNum ? sizeNum.width + 12 + 10 + 12 : 0; const wb = figma.createFrame(); wb.name = 'Bracket · width'; wb.fills = []; wb.clipsContent = false; wRow.appendChild(wb); wb.resize(specInst.width, 10); /* the width is a horizontal bracket under the specimen; the tag hangs from its middle */
    await prect(wb, 'line', specInst.width, 2, 0, 4, 'color/brand/pink-deep'); await prect(wb, 'tick left', 2, 10, 0, 0, 'color/brand/pink-deep'); await prect(wb, 'tick right', 2, 10, specInst.width - 2, 0, 'color/brand/pink-deep');
    const tagRow = mk('Measured tag', 'HORIZONTAL', 0, specF, true); tagRow.primaryAxisAlignItems = 'CENTER'; tagRow.paddingLeft = sizeNum ? sizeNum.width + 12 + 10 + 12 : 0;
    const tag = (await mainByName('Size tag')).createInstance(); tagRow.appendChild(tag); setProps(tag, { Value: (D.guidance && D.guidance.a11yTag !== 'WxH' && D.guidance.a11yTag) || (bracketN ? `${Math.round(specInst.width)} × ${bracketN}` : G.a11yTag === 'WxH' ? `${Math.round(specInst.width)} × ${Math.round(specInst.height)}` : `${Math.round(specInst.width)} wide`), variant: 'pink' }); /* guidance.a11yTag: what the code says (padding, min-height), not the Figma box */
    const lv = await mkLeader(specF, 33, 'pink', 90); lv.layoutPositioning = 'ABSOLUTE'; { const wbb = wb.absoluteBoundingBox; const sb = specInst.absoluteBoundingBox; placeBB(lv, sb.x + sb.width / 2 - 8, wbb.y + 5); }
    const lf = mk('Leader', 'HORIZONTAL', 0, dia, false); lf.paddingLeft = 16; await mkLeader(lf, 64, 'pink', 180);
    const bf = mk('Branch', 'HORIZONTAL', 0, dia, false);
    const cw = mk('Chips wrap', 'HORIZONTAL', 0, dia, false); const chips = mk('Chips', 'VERTICAL', 8, cw, false);
    const chipDefs = (D.guidance && D.guidance.a11yChips) || [];
    if (!chipDefs.length) needsGuidance.push({ section: 'Accessibility', needs: 'guidance.a11yChips (Role, Name, Tab stop) is empty' });
    for (const c of chipDefs) { /* 13 Nov round 6: the A11y note set has only the kinds Role, Name and Focus order. Any other kind (Keys, Description, Live, State ...) is placed as the closest existing kind with the kind written into the label; mapped and failed chips are listed in needsReview, never thrown */
      const KNOWN = ['Role', 'Name', 'Focus order']; let kind = c.kind, val = c.value;
      if (!KNOWN.includes(kind)) { const k0 = String(kind || ''); kind = /focus|tab|order/i.test(k0) ? 'Focus order' : /role|state|live|aria|region|landmark|expanded|selected|checked/i.test(k0) ? 'Role' : 'Name'; val = (k0 ? k0 + ': ' : '') + (c.value || ''); needsReview.push(`Accessibility chip: kind "${k0}" is not in the A11y note set; placed as ${kind} with label "${val}"`); }
      try { await place(KEYS.a11yNote, 'A11y note', chips, { Kind: kind, Value: val, 'Focus number': c.num || (/not in (the )?tab|not focusable|no tab stop/i.test(c.value || '') ? '—' : '01') }); } catch (e) { needsReview.push(`Accessibility chip "${c.kind}: ${c.value}" not placed (${e})`); }
    }
    let stacked = false; /* 13 Nov (wide specimens, long chips): when the specimen, the leader and the chips do not fit the measure card side by side, the chips sit in a wrapping row UNDER the specimen (never over it); a specimen wider than the card widens the facts column to the full width of the section */
    try { const avail = mcard.card.width - 8; if (dia.width + 24 > avail) { stacked = true; dia.layoutMode = 'VERTICAL'; dia.itemSpacing = 24; dia.counterAxisAlignItems = 'MIN'; lf.remove(); bf.remove(); chips.layoutMode = 'HORIZONTAL'; chips.layoutWrap = 'WRAP'; chips.itemSpacing = 12; chips.counterAxisSpacing = 8; if (specF.width + 64 > avail) { wrap.layoutSizingHorizontal = 'FILL'; dia.paddingLeft = dia.paddingRight = 8; } dia.layoutSizingHorizontal = 'FILL'; cw.layoutSizingHorizontal = 'FILL'; chips.layoutSizingHorizontal = 'FILL'; { const wbb2 = wb.absoluteBoundingBox, sb2 = specInst.absoluteBoundingBox; placeBB(lv, sb2.x + sb2.width / 2 - 8, wbb2.y + 1); } /* the width tag's leader is placed again after the restack, with its dot 4px above where it was (the check wants the dot on the bracket line within 4px) */ } } catch (e) { needsReview.push('Accessibility: chips not restacked (' + e + ')'); }
    if (!stacked) {
    const cy = chips.children.map((c) => c.y + c.height / 2); const br = figma.createFrame(); br.name = 'Bracket · branch'; br.fills = []; br.clipsContent = false; bf.appendChild(br); br.resize(24, chips.height);
    if (cy.length > 1) await pline(br, 'Stem', cy[cy.length - 1] - cy[0], 1, cy[0], true); for (const y of cy) await pline(br, 'Tick', 23, 1, y, false);
    try { /* 13 Nov round 10 (item 2): the leader into the Role / Name bracket STARTS on the specimen (its dot on the right edge, at mid height), not 16px out in empty space: the chips are centred on the specimen's mid height, the leader is absolute and as long as the gap needs */
      const sb0 = specInst.absoluteBoundingBox, fb0 = specF.absoluteBoundingBox; const ch0 = chips.height; const off0 = sb0.y + sb0.height / 2 - fb0.y;
      dia.counterAxisAlignItems = 'MIN'; if (ch0 / 2 > off0) specF.paddingTop = Math.ceil(ch0 / 2 - off0); else { const pt0 = Math.floor(off0 - ch0 / 2); bf.paddingTop = pt0; cw.paddingTop = pt0; }
      const old0 = lf.children[0]; const dc0 = (() => { const d = old0.findAll((x) => x.type === 'ELLIPSE' && x.visible).pop(); const b = d && d.absoluteBoundingBox; return b ? b.x + b.width / 2 : null; })(); const lb0 = old0.absoluteBoundingBox; const r0 = dc0 != null ? Math.max(1, Math.min(12, dc0 - lb0.x)) : 5; /* the dot sits at the left tip: its centre r0 in from it */
      lf.paddingLeft = 0; lf.layoutSizingHorizontal = 'FIXED'; lf.layoutSizingVertical = 'FIXED'; lf.resize(80, 20); old0.remove();
      const sb1 = specInst.absoluteBoundingBox, lfb = lf.absoluteBoundingBox; const tx0 = sb1.x + sb1.width - 1, tY = sb1.y + sb1.height / 2; lf.resize(80, Math.max(20, 2 * (tY - lfb.y)));
      const len0 = (lfb.x + lfb.width) - (tx0 - r0); const L0 = await mkLeader(lf, len0, 'pink', 180); L0.layoutPositioning = 'ABSOLUTE'; placeBB(L0, tx0 - r0, tY - L0.absoluteBoundingBox.height / 2);
      const wbb3 = wb.absoluteBoundingBox, sb3 = specInst.absoluteBoundingBox; placeBB(lv, sb3.x + sb3.width / 2 - 8, wbb3.y + 5); /* the width tag's leader moved with the padding: placed again */
    } catch (e) { needsReview.push('Accessibility: the leader into the bracket was not moved onto the specimen (' + e + ')'); } }
    const cap = mk('Caption row', 'VERTICAL', 0, wrap, true); { const rt = await ptxt(cap, (D.guidance && D.guidance.a11yRule) || '', { name: 'Rule', fill: 'color/semantic/text-secondary' }); try { rt.layoutSizingHorizontal = 'FILL'; rt.textAutoResize = 'HEIGHT'; rt.textAlignHorizontal = 'LEFT'; } catch (e) { /* kept hug */ } } /* 13 Nov round 8: the rule caption wraps to its column at line height 1.5 */
    if ((A.ariaChips || []).length && G.ariaLine) { const at0 = await ptxt(cap, typeof G.ariaLine === 'string' ? G.ariaLine : 'Set in the markup: ' + [...new Set(A.ariaChips.map((a) => a.value))].join(', ') + '.', { name: 'ARIA', fill: 'color/semantic/text-secondary' }); at0.layoutSizingHorizontal = 'FILL'; at0.textAutoResize = 'HEIGHT'; } /* keys from the .tsx aria wiring (the Docs Kit note has only Role, Name and Focus order kinds) */
    { /* focus ring (item 12): the focus variant at 2x, the code's width and offset as pink tags, each leader asserted to land on what it measures */
      const fr = A.focusRing || []; const stN = figVariantName('state') ? stateValue('focus') : null;
      const wTok = (fr.find((f) => f.property === 'outline') || { tokens: [] }).tokens.find((t) => /width/.test(t.token)); const oTok = (fr.find((f) => f.property === 'outline-offset') || { tokens: [] }).tokens[0];
      if (stN && wTok && oTok) try {
        const fcard = await plainCard(wrap); fcard.card.name = 'Card · Focus ring'; fcard.card.layoutSizingHorizontal = 'FILL';
        const dia2 = figma.createFrame(); dia2.name = 'Focus ring diagram'; dia2.fills = []; dia2.clipsContent = false; fcard.slot.appendChild(dia2);
        const hold = figma.createFrame(); hold.name = 'Specimen · scaled'; hold.fills = []; hold.clipsContent = false; dia2.appendChild(hold);
        const fi = makeInstance({ [base(figVariantName('state'))]: stN }); hold.appendChild(fi); const KK = G.focusRingScale || 2; fi.rescale(KK); /* guidance.focusRingScale: a component 480 wide (Disclosure) shows its focus state at 1x so the diagram fits its card */ hold.resize(fi.width, fi.height);
        const ring = fi.findOne((n) => n.name === 'Focus ring');
        if (!ring) { fcard.card.remove(); needsReview.push('Accessibility: the focus variant has no layer named Focus ring; focus card left out'); }
        else {
          const hugTag = (t) => { try { t.layoutSizingHorizontal = 'HUG'; for (const x of t.findAll((n) => n.type === 'TEXT')) x.textAutoResize = 'WIDTH_AND_HEIGHT'; } catch (e) { /* kept */ } }; /* 13 Nov: a pill hugs its text, so a first glyph ('‹4 radius') is never cut */ const wPx = parseFloat(wTok.value), oPx = parseFloat(oTok.value); const tagW = (await mainByName('Size tag')).createInstance(); dia2.appendChild(tagW); setProps(tagW, { Value: `${wTok.value} width`, variant: 'pink' }); hugTag(tagW); const tagO = (await mainByName('Size tag')).createInstance(); dia2.appendChild(tagO); setProps(tagO, { Value: `${oTok.value} offset`, variant: 'pink' }); hugTag(tagO);
          const TH = tagW.height, GAPV = 44, Wd = 740; const Hd = hold.height + 2 * (TH + GAPV); dia2.resize(Wd, Hd); hold.x = (Wd - hold.width) / 2; hold.y = TH + GAPV;
          const db = dia2.absoluteBoundingBox; const rb = ring.absoluteBoundingBox; const eb = ring.parent.absoluteBoundingBox; const sw = ring.strokeWeight; const al = ring.strokeAlign;
          const bandTop = rb.y + (al === 'INSIDE' ? sw / 2 : al === 'OUTSIDE' ? -sw / 2 : 0); const ringInnerBottom = rb.y + rb.height - (al === 'INSIDE' ? sw : al === 'CENTER' ? sw / 2 : 0); const gapMid = (eb.y + eb.height + ringInnerBottom) / 2;
          const cx = eb.x + eb.width / 2 - db.x;
          tagW.x = cx - tagW.width / 2; tagW.y = 0; tagO.x = cx - tagO.width / 2; tagO.y = Hd - TH;
          /* 13 Nov round 9: the leader's END is its dot's CENTRE (what the check measures), not the bounding box tip: the tip sits half a dot (5px) past the centre, which left every focus-ring leader 5-11px short while the old assert read 0 */
          const dotC = (L) => { try { const d = L.findAll((x) => x.type === 'ELLIPSE' && x.visible).pop(); const b = d && d.absoluteBoundingBox; return b ? { x: b.x + b.width / 2, y: b.y + b.height / 2, r: b.width / 2 } : null; } catch (e) { return null; } };
          const mkLd = async (len, rot, X, tip, targetY, dotAtBottom) => { const L = await mkLeader(dia2, len, 'pink', rot); const c0 = dotC(L); const r = c0 ? c0.r : 5; L.resize(L.width + r, L.height); placeBB(L, X, dotAtBottom ? tip : tip - r); const c1 = dotC(L); if (c1) L.y += targetY - c1.y; return L; };
          const lw = await mkLd(bandTop - db.y - TH, -90, db.x + cx - 8, db.y + TH, bandTop, true);
          const lo = await mkLd((Hd - TH) - (gapMid - db.y), 90, db.x + cx - 8, gapMid, gapMid, false);
          const chk = (L, which, target, nm) => { const b = L.absoluteBoundingBox; const dc = dotC(L); const endY = dc ? dc.y : (which === 'bottom' ? b.y + b.height : b.y); if (Math.abs(endY - target) > 4 || eb.x + eb.width / 2 < b.x - 1 || eb.x + eb.width / 2 > b.x + b.width + 1) needsReview.push(`ASSERT focus ring: the ${nm} leader ends ${Math.round(endY - target)}px from what it measures`); };
          chk(lw, 'bottom', bandTop, 'width'); chk(lo, 'top', gapMid, 'offset');
          const gotW = sw / KK, gotO = (rb.y + rb.height - (al === 'INSIDE' ? sw : al === 'CENTER' ? sw / 2 : 0) - (eb.y + eb.height)) / KK;
          if (Math.abs(gotW - wPx) > 0.6) needsReview.push(`Focus ring: the code says ${wTok.value} wide, Figma draws ${gotW}px`); if (Math.abs(gotO - oPx) > 0.6) needsReview.push(`Focus ring: the code says ${oTok.value} offset, Figma draws ${Math.round(gotO * 10) / 10}px`);
          if (G.focusRingRadius) { const tagR = (await mainByName('Size tag')).createInstance(); dia2.appendChild(tagR); setProps(tagR, { Value: G.focusRingRadius, variant: 'pink' }); hugTag(tagR); const cxr = rb.x + rb.width - 56 - db.x; tagR.x = cxr - tagR.width / 2; tagR.y = 0; const lr = await mkLd(bandTop - db.y - TH, -90, db.x + cxr - 8, db.y + TH, bandTop, true); chk(lr, 'bottom', bandTop, 'radius'); } /* guidance.focusRingRadius ('16 radius'): the ring follows the card corner */
          else needsReview.push('Focus ring: radius tag not built (set guidance.focusRingRadius)');
        }
      } catch (e) { needsReview.push('Accessibility: focus ring card failed (' + e + ')'); }
    }
    // contrast: one line per pair, "role · short token #hex on short token #hex", values read from the variables
    const skipC = (D.guidance && D.guidance.contrastSkip) || []; const vmap0 = (D.guidance && D.guidance.contrastVarMap) || {}; const short = (t) => (vmap0[t] ? vmap0[t].split('/').pop() : t.replace(/^--color-semantic-/, '').replace(/^--component-/, '')); /* a role name, never a raw component token */ const up = (h) => String(h || '').toUpperCase();
    const usedTok = D.tokens && D.tokens.used ? new Set(D.tokens.used.map((t) => t.token)) : null; const rows = (D.contrast.pairs || []).filter((p) => p.theme === 'chip' && !(skipC.includes(p.foreground) && p.at !== 'guidance.contrastExtra') && (G.contrastAll || !usedTok || p.at === 'guidance.contrastExtra' || usedTok.has(p.foreground))); /* 13 Nov: only pairs the component's CSS uses (or guidance.contrastExtra) */
    { const onCard = new Set(rows.filter((p) => !/-background$/.test(p.background)).map((p) => p.foreground + '|' + p.barName)); rows.splice(0, rows.length, ...rows.filter((p) => !(/-background$/.test(p.background) && onCard.has(p.foreground + '|' + p.barName)))); } /* the specimen sits on a card: a row on the page background is dropped when the card has one for the same colour */
    { const byFg = new Map(); for (const p of rows) { const k = String(p.foregroundHex).toLowerCase() + '|' + String(p.backgroundHex).toLowerCase() + '|' + p.barName; /* one row per colour pair and verdict */ const cur = byFg.get(k); if (!cur || (/surface-card/.test(p.background) && !/surface-card/.test(cur.background))) byFg.set(k, p); } rows.splice(0, rows.length, ...rows.filter((p) => byFg.get(String(p.foregroundHex).toLowerCase() + '|' + String(p.backgroundHex).toLowerCase() + '|' + p.barName) === p)); } /* one row per pair, on the card the specimen sits on (surface) when the list has both */
    if (rows.length) {
      const block = await place(KEYS.contrastBlock, 'Doc / Contrast block', wrap, null); block.layoutSizingHorizontal = 'FILL';
      const rs = slotOf(block) || block; try { if (rs.type === 'SLOT') rs.resetSlot(); } catch (e) { /* not a slot */ } /* 13 Nov: resetSlot turns the stale default rows (dangling after the Docs Kit changed) back into real ones, so the loop below can remove them */ try { rs.appendChild(figma.createFrame()); } catch (e) { /* none */ } for (let t = 0; t < 40; t++) { let c0 = null; try { c0 = [...(slotOf(block) || block).children].find((x) => { try { return x.name !== 'Head'; } catch (e) { return true; } }); } catch (e) { /* none */ } if (!c0) break; try { c0.remove(); } catch (e) { break; } } /* 13 Nov: an append first, then re-read the slot after every removal: the template's stale rows ('Primary label ... 7.50:1', dangling 441:871;718:145990) no longer survive above the real rows (ChatThread REQUEST) */ /* 13 Nov: reading .name of a dangling default row threw and skipped Accessibility (ResourceCard, Slider) */
      for (const p of rows) {
        const r = await piece(KEYS.contrastRow, 'Doc / Contrast row').then((c) => c.createInstance()); try { rs.appendChild(r); } catch (e) { r.remove(); throw e; }
        const bar = p.barName === 'AAA' ? 'AAA body (7:1)' : p.barName === 'AA' ? 'AA label (4.5:1)' : 'non-text (3:1)';
        const role0 = p.label.split(/ on /)[0]; const role = role0.charAt(0).toUpperCase() + role0.slice(1);
        setProps(r, { Pair: role + ' · ' + short(p.foreground) + ' ' + up(p.foregroundHex) + ' on ' + short(p.background.split(' over ')[0]) + ' ' + up(p.backgroundHex), Ratio: p.ratio.toFixed(2) + ':1', 'Show note': false }); try { const pt0 = r.findOne((n) => n.type === 'TEXT' && String(n.characters).indexOf(role) === 0); if (pt0 && pt0.height > 30) { r.layoutSizingVertical = 'HUG'; pt0.textAutoResize = 'HEIGHT'; } } catch (e) { needsReview.push('contrast row hug: ' + e); } /* 13 Nov round 3 (item 8): a label that wraps to two lines makes its row hug, never clip */
        { const sw = r.children.find((c) => c.type === 'SLOT'); if (sw) { for (const ch of [...sw.children]) ch.remove(); try { await makeSwatch(sw, p); } catch (e) { needsReview.push('Accessibility: no swatch for ' + p.label + ' (' + e + ')'); } } }
        const v = r.findOne((n) => n.type === 'INSTANCE' && /Verdict/.test(n.name)); if (v) setProps(v, { Verdict: p.pass ? 'Pass · ' + bar : 'Below ' + p.bar + ':1 · ' + bar, result: p.pass ? 'pass' : 'fail' });
      }
    }
    await unchip(); filled.push('Accessibility');
  } catch (e) { skipped.push({ section: 'Accessibility', why: String(e) }); await unchip(); }

  // ---------- 10. Code ----------
  if (want(10)) try {
    let sbLine = false; let ex = G.codeExample ? { ...(D.codeExample || {}), ...G.codeExample } : D.codeExample; if (ex && !G.codeExample && /\{\s*\.\.\.args\s*\}|\bas string\[\]|\bkeys as\b/.test(ex.code || '')) { ex = null; sbLine = true; needsReview.push('Code: the story line is `' + String(((D.codeExample || {}).code || '')).split('\n')[0].slice(0, 60) + '` (args spread or a cast), and guidance.codeExample is absent: needs a real example with its file name'); } /* 13 Nov round 6: skipped, not thrown; a builder writes the example */
    if (!ex) { if (sbLine) removeSection('Code', 'needs a real example with its file name (guidance.codeExample)', true); else removeSection('Code', 'no usage in the stories'); } else {
      const slot = secSlot('Code'); emptySlot('Code'); setSection('Code', INTRO.Code);
      const cb = await place(KEYS.codeBlock, 'CodeBlock', slot, { Title: (D.guidance && D.guidance.codeTitle) || (ex.file ? String(ex.file).split('/').pop() : 'Example') } /* the file name only when line 1 is in that file */);
      const lines = [ex.import, '', ...ex.code.split('\n')]; { const lsf = () => slotOf(cb, 'Lines'); lsf().appendChild(figma.createFrame()); for (let t = 0; t < 60; t++) { let c0 = null; try { c0 = lsf().children[0]; } catch (e) { /* none */ } if (!c0) break; try { c0.remove(); } catch (e) { break; } } } /* 13 Nov: the CodeBlock's default lines are dangling after the first removal (any block order); append first, then re-read the slot after every removal */ const ls = slotOf(cb, 'Lines');
      let n = 0;
      for (const text of lines) {
        n++; const line = await place(KEYS.codeLine, 'Code line', ls, { Number: String(n), Code: text || ' ', kind: 'plain' }); line.layoutSizingHorizontal = 'FILL';
        const t = textNode(line, 'Code'); await lf(t.getRangeFontName(0, 1));
        t.characters = text || ' '; await bindFill(t, 0, t.characters.length, 'foreground');
        let pos = 0; for (const [s, kind] of tokenize(text)) { if (kind !== 'foreground') await bindFill(t, pos, pos + s.length, kind); pos += s.length; }
        /* 13 Nov code lines: a line is fixed in height and does not wrap, so a long one drew over the next (PageHeader). The text wraps (auto height, after the colouring so every run keeps its token) and the line hugs it; a line Figma will not hug is resized to the text; the check's codeOverlap fails any overlap that is left. */
        try { t.textAutoResize = 'HEIGHT'; } catch (e) { needsReview.push('Code line ' + n + ': text kept fixed height (' + e + ')'); }
        try { line.layoutSizingVertical = 'HUG'; } catch (e) { try { const need = t.height + Math.max(0, line.height - t.height); if (line.height + 0.5 < t.height) line.resize(line.width, need); } catch (e2) { needsReview.push('Code line ' + n + ' could not hug its text (' + e2 + ')'); } }
        try { if (line.height + 0.5 < t.height) line.resize(line.width, t.height); } catch (e) { /* kept */ }
      }
      filled.push('Code');
    }
  } catch (e) { skipped.push({ section: 'Code', why: String(e) }); }

  // ---------- 11. Properties ----------
  if (want(11)) try {
    const skip = new Set((D.props || []).filter((p) => /@deprecated/.test(p.doc || '')).map((p) => p.name)); /* every prop in the interface is listed, className included; a @deprecated prop never is (rule 29) */
    const props = (D.props || []).filter((p) => !skip.has(p.name));
    if (!props.length) removeSection('Properties', 'no props'); else {
      const slot = secSlot('Properties'); emptySlot('Properties'); setSection('Properties', INTRO.Properties);
      const cardPg = figma.root.children.find((p) => p.name === '🧩 Card'); await race(cardPg.loadAsync(), 'Card page'); const cardSet = findSet(cardPg, 'Card'); /* BellaComponents' own Card (its Show title / Media properties hide the layers; the Docs Kit's copy does not) */ const card = (cardSet.children.find((v) => /variant=default/.test(v.name) && /state=resting/.test(v.name) && /padding=flush/.test(v.name) && /Clip content=true/.test(v.name)) || cardSet.defaultVariant).createInstance(); slot.appendChild(card); setProps(card, { 'Show content': true, 'Show title': false, 'Show text': false, Media: false, padding: 'flush' }); /* as on the Button page: a flush Card holding the table */
      card.layoutSizingHorizontal = 'FILL'; clearSlot(() => cardSlot(card)); const cs = cardSlot(card); /* 13 Nov: template placeholder rows in the Card slot go */
      const head = await place(KEYS.propRow, 'Doc / Properties row', cs, { Prop: 'Prop', Values: 'Values', Default: 'Default', Kind: 'Header' }); head.layoutSizingHorizontal = 'FILL'; head.name = 'Head · Properties';
      for (const p of props) {
        const vals0 = (D.guidance && D.guidance.propValues && D.guidance.propValues[p.name]) || (p.values ? p.values.map(String).join(' · ') : p.type); /* guidance.propValues: a long type shown on one line */ const vals = p.required && !/required/.test(vals0) ? vals0 + ' · required' : vals0; /* 13 Nov: required is a marker beside the values; Default says — */ const def = p.default !== undefined ? String(p.default) : p.required ? '—' : p.type === 'boolean' ? 'false' : 'none'; /* a boolean defaults to false; a required prop says so in Default */
        const r = await place(KEYS.propRow, 'Doc / Properties row', cs, { Prop: p.name, Values: vals, Default: def, Kind: 'Row' }); r.layoutSizingHorizontal = 'FILL'; r.layoutSizingVertical = 'HUG'; r.name = 'Row · ' + p.name; /* rows hug at the Button row height, text-only rows too */
        const sp = slotOf(r, 'Specimens'); const vn = p.values && figVariantName(p.name); const ps = D.guidance && D.guidance.propSpecimens && D.guidance.propSpecimens[p.name]; const noted = D.guidance && D.guidance.propNotes && D.guidance.propNotes[p.name]; const bk = p.type === 'boolean' && Object.keys(figProps).find((k) => base(k).toLowerCase().replace(/\s+/g, '') === p.name.toLowerCase() && figProps[k].type === 'BOOLEAN' && !noted);
        if (sp && ps) { for (const ch of [...sp.children]) ch.remove(); for (const x of ps) { const si = x.vp ? makeInstance(x.vp) : await instFor(x.set, x.variant); /* 13 Nov round 9: the instance is placed in its cell BEFORE nested props are set (an edited loose instance left a dangling sublayer: Select leading) */ if (x.onDark) { const dk = mk('Dark ground', 'VERTICAL', 0, sp, false); dk.paddingTop = dk.paddingBottom = dk.paddingLeft = dk.paddingRight = 16; dk.fills = [bindP(await impVar(G.darkGround || 'color/semantic/surface-inverse'))]; dk.appendChild(si); } else sp.appendChild(si); if (x.props) { await loadFonts(si); setProps(si, x.props); } } const tw2 = sp.children.reduce((a, c) => a + c.width, 0) + 16 * (sp.children.length - 1); if (tw2 > 470) { const stk = mk('Specimens · stacked', 'VERTICAL', 16, sp, false); for (const c of [...sp.children]) if (c !== stk) stk.appendChild(c); if (G.fillSpecimens) { stk.layoutSizingHorizontal = 'FILL'; for (const k of stk.children) k.layoutSizingHorizontal = 'FILL'; } } } /* real specimens named in guidance.propSpecimens; onDark puts a fixed-light specimen on the dark ground */ else if (sp && vn) { for (const v of p.values.slice(0, 8)) sp.appendChild(makeInstance({ [base(vn)]: String(v) })); /* 13 Nov round 10 (item 4): one specimen per value (Avatar size 3 of 4, Leader variant 3 of 4, AvatarStack size 3 of 4); a row too wide for the cell stacks below */ const tw = sp.children.reduce((a, c) => a + c.width, 0) + 16 * (sp.children.length - 1); if (tw > 470) { const stk = mk('Specimens · stacked', 'VERTICAL', 16, sp, false); for (const c of [...sp.children]) if (c !== stk) stk.appendChild(c); if (G.fillSpecimens) { stk.layoutSizingHorizontal = 'FILL'; for (const k of stk.children) k.layoutSizingHorizontal = 'FILL'; } } /* a slot's own direction cannot be changed, so the specimens stack in a frame of ours */ /* two wide specimens stack instead of being cut off by the cell */ } else if (sp && bk) { for (const ch of [...sp.children]) ch.remove(); for (const v of [true, false]) { const bi = makeInstance(null); sp.appendChild(bi); setProps(bi, { [base(bk)]: v }); } } /* a boolean the component draws is shown on and off */ else if (sp) { for (const ch of [...sp.children]) ch.remove(); if (noted) { const nt = await ptxt(sp, noted, { name: 'Note', fill: 'color/semantic/text-secondary' }); try { nt.layoutSizingHorizontal = 'FILL'; nt.textAutoResize = 'HEIGHT'; nt.textAlignHorizontal = 'LEFT'; } catch (e) { /* kept hug */ } } /* 13 Nov: a prop with no variant to show puts its note (guidance.propNotes) in the Specimens cell, never an empty column (ListRow, ScoreStrip, Icon) */ else { const z = figma.createFrame(); z.name = 'Empty cell'; z.fills = []; z.clipsContent = false; sp.appendChild(z); z.resize(1, 44); } } /* nothing real to show: an empty 44px cell, so the row hugs at the Button row height instead of the slot's 100px placeholder */ /* a prop with nothing real to show keeps an empty Specimens cell: no prose in mono */
      }
      /* 13 Nov (wide specimens): a prop's specimens wider than the Specimens cell (470) move to a full-width row right under the prop's row, at real size; the cell keeps the prop's note, never empty */
      if (!G.fillSpecimens) for (const r of [...cs.children]) { try { if (!/^Row · /.test(r.name) || r.type !== 'INSTANCE') continue; const sp3 = slotOf(r, 'Specimens'); if (!sp3) continue; const kids0 = [...sp3.children].filter((c) => c.type === 'INSTANCE' || /^(Specimens · stacked|Dark ground)$/.test(c.name)); if (!kids0.length || Math.max(...kids0.map((c) => c.width)) <= 470) continue; const pn = r.name.slice(6); const wf = mk('Specimens · wide · ' + pn, 'VERTICAL', 16, cs, true); wf.paddingTop = wf.paddingBottom = 16; wf.paddingLeft = wf.paddingRight = 24; cs.insertChild(cs.children.indexOf(r) + 1, wf); for (const c of kids0) wf.appendChild(c); const nt0 = (D.guidance && D.guidance.propNotes && D.guidance.propNotes[pn]) || 'Shown below at full width.'; const nt = await ptxt(sp3, nt0, { name: 'Note', fill: 'color/semantic/text-secondary' }); try { nt.layoutSizingHorizontal = 'FILL'; nt.textAutoResize = 'HEIGHT'; } catch (e) { /* kept hug */ } } catch (e) { needsReview.push('Properties wide specimens: ' + e); } }
      for (const r of [...cs.children]) { try { if (!/^Row · /.test(r.name) || r.type !== 'INSTANCE') continue; const sp4 = slotOf(r, 'Specimens'); if (!sp4) continue; const kh = Math.max(0, ...[...sp4.children].map((c) => c.height)); if (kh && sp4.height + 1 < kh) { try { sp4.layoutSizingVertical = 'HUG'; } catch (e) { sp4.resize(sp4.width, kh + 16); } try { r.layoutSizingVertical = 'HUG'; } catch (e) { /* kept */ } } } catch (e) { needsReview.push('Properties row height: ' + e); } } /* 13 Nov: a specimen taller than the Specimens cell makes the cell and its row hug it (Stat: the Delta line was cut at about 100px) */
      if (G.propSpecimenRoom !== false) for (const rw of cs.children) { /* 13 Nov: a specimen whose ring, stroke or shadow is drawn outside its box gets padding in the Specimens slot, so the cell does not clip it */
        const sp2 = rw.type === 'INSTANCE' ? slotOf(rw, 'Specimens') : null; if (!sp2) continue; const sis = []; for (const c of sp2.children) { if (c.type === 'INSTANCE') sis.push(c); else if (c.name === 'Specimens · stacked') for (const k of c.children) if (k.type === 'INSTANCE') sis.push(k); }
        for (const si of sis) { const rb = si.absoluteRenderBounds, bb = si.absoluteBoundingBox; if (!rb || !bb) continue; const pd = Math.ceil(Math.max(bb.x - rb.x, rb.x + rb.width - bb.x - bb.width, bb.y - rb.y, rb.y + rb.height - bb.y - bb.height)); if (pd < 2) continue; const par = si.parent; const ix = par.children.indexOf(si); const w2 = figma.createFrame(); w2.name = 'Specimen · with room'; w2.fills = []; w2.clipsContent = false; w2.layoutMode = 'HORIZONTAL'; w2.paddingTop = w2.paddingRight = w2.paddingBottom = w2.paddingLeft = pd; par.insertChild(ix, w2); w2.layoutSizingHorizontal = 'HUG'; w2.layoutSizingVertical = 'HUG'; w2.appendChild(si); } }
      for (const ch of [...cs.children]) if (!/^(Row · |Head · |Specimens · wide · )/.test(ch.name)) { const ex = (D.guidance && D.guidance.propExtra) || []; if (!ex.length) ch.remove(); } /* 13 Nov: a template row the fill did not fill is removed (rows added by propExtra are named below, so the sweep runs after them) */
      for (const x of (D.guidance && D.guidance.propExtra) || []) { /* item fields and other rows the interface does not list: guidance.propExtra [{ name, values, default, specimens | note }] */
        const r = await place(KEYS.propRow, 'Doc / Properties row', cs, { Prop: x.name, Values: x.values, Default: x.default, Kind: 'Row' }); r.layoutSizingHorizontal = 'FILL'; r.name = 'Row · ' + x.name; const sp = slotOf(r, 'Specimens'); for (const ch of [...sp.children]) ch.remove();
        for (const y of x.specimens || []) { const si = await instFor(y.set, y.variant); sp.appendChild(si); if (y.props) setProps(si, y.props); }
        if (!(x.specimens || []).length && x.note) await ptxt(sp, x.note, { name: 'Rule', family: 'Geist Mono' });
      }
      filled.push('Properties');
    }
  } catch (e) { skipped.push({ section: 'Properties', why: String(e) }); }

  // ---------- 12. Dev Mode notes: accessibility, motion, development ----------
  if (want(12)) try {
    const cats = await figma.annotations.getAnnotationCategoriesAsync(); const cat = (n) => (cats.find((c) => c.label === n) || {}).id;
    const put = (node, category, md) => { if (node && cat(category) && md && !(node.annotations || []).some((a) => a.labelMarkdown === md)) node.annotations = [...(node.annotations || []).map((a) => (a.labelMarkdown ? { labelMarkdown: a.labelMarkdown, categoryId: a.categoryId } : { label: a.label, categoryId: a.categoryId })), { labelMarkdown: md, categoryId: cat(category) }]; /* 13 Nov: existing annotations keep only one of label / labelMarkdown */ };
    const A = D.a11y; const at = (x) => (x && x.at ? ` (${x.at})` : '');
    const chip = (k) => { const c = ((D.guidance && D.guidance.a11yChips) || []).find((x) => x.kind === k); return c ? c.value : null; }; /* the hand-checked chips win over the first tag in the file */
    const a11yMd = [chip('Role') ? `Role: ${chip('Role')}` : `Element: ${A.element ? A.element.tag : 'n/a'}${at(A.element)}\nRole: ${A.role ? A.role.value : 'n/a'}${at(A.role)}`, `Name: ${chip('Name') || (A.nameSource ? A.nameSource.value : 'n/a')}`, ...(A.keyboard || []).map((k) => `Keyboard: ${k.key}${at(k)}`), ...(A.focusRing || []).map((f) => `Focus ring: ${f.property} ${f.value}${at(f)}`), `Disabled: ${A.disabled && A.disabled.prop ? 'prop ' + A.disabled.prop : 'no disabled prop'}`, `Reduced motion: ${A.reducedMotion ? A.reducedMotion.declaration + at(A.reducedMotion) : 'no query'}`].join('\n');
    const motMd = (D.motion.transitions || []).map((t) => `${t.state}: ${t.declaration}${at(t)}`).join('\n');
    const devMd = `Code: ${D.links.github}\nStorybook: ${D.links.storybook}`;
    const sec = (l) => { const sl = secSlot(l); return sl && sl.children[0]; };
    put(sec('Accessibility'), 'Accessibility', a11yMd); put(sec('Behaviour and motion'), 'Motion', motMd); put(sec('Overview'), 'Development', devMd);
    filled.push('Dev Mode notes');
  } catch (e) { skipped.push({ section: 'Dev Mode notes', why: String(e) }); }

  // ---------- 13. place the doc page 200px left of its component set, top-aligned (move the page, not the set) ----------
  if (want(13)) try { // one theme per page: every collection of the page root goes to Chip. Last, because an explicit mode on the root makes every later edit crawl (each change re-resolves the whole filled page).
    await impVar('color/semantic/text-primary'); const cids = new Set(); for (const id of Object.values(globalThis.__varIds || {})) { const v = await figma.variables.getVariableByIdAsync(id).catch(() => null); if (v) cids.add(v.variableCollectionId); } /* the collections of the variables the page already uses: no library call */
    for (const cid of cids) { const col = await figma.variables.getVariableCollectionByIdAsync(cid); const m = col && col.modes.find((x) => x.name === 'Chip'); if (m) root.setExplicitVariableModeForCollection(col, m.modeId); }
    filled.push('Chip mode on the page root');
  } catch (e) { skipped.push({ section: 'Chip mode', why: String(e) }); }
  if (want(13)) try { const sb = set.absoluteBoundingBox; /* a set inside a section has section-relative x and y */ root.x = sb.x - 200 - root.width; root.y = sb.y; filled.push('Doc page moved: 200px left of the set, top-aligned (the set stays where it is)'); } catch (e) { skipped.push({ section: 'Doc page placement', why: String(e) }); }

  await unchip(); { const unshown = [...new Set(exText.all)].filter((x) => !shownEx.has(x)); if (unshown.length && (!O.only || O.only.includes(2))) needsReview.push('codeNamesPage: example strings the specimens cannot show (no TEXT property of that name): ' + unshown.slice(0, 8).join(' | ')); }
  // 13 Nov canvasOverlap + looseOnCanvas: the page that holds the target; its visible top-level nodes must not intersect by more than 1px, and only frames, sections, components, sets and doc pages may sit at the top level.
  const canvasScan = async () => {
    const out = []; let pg = root; while (pg && pg.type !== 'PAGE') pg = pg.parent; if (!pg) return out;
    const tl = pg.children.filter((n) => n.visible !== false); const num = (n) => parseInt(String(n.id).split(':').pop().replace(/\D/g, ''), 10) || 0;
    const bx = (n) => { const b = n.absoluteBoundingBox; return b ? `${Math.round(b.x)},${Math.round(b.y)} ${Math.round(b.width)}x${Math.round(b.height)}` : 'no box'; };
    for (const n of tl) { if (['TEXT', 'VECTOR', 'RECTANGLE', 'LINE', 'ELLIPSE'].includes(n.type)) out.push({ check: 'looseOnCanvas', a: n, detail: `top-level ${n.type} "${n.name}" at ${bx(n)} is not inside a frame, section or component` });
      else if (n.type === 'INSTANCE') { let m = null; try { m = await n.getMainComponentAsync(); } catch (e) {} if (!(n.id === root.id || (m && /^Doc \/ Component page/.test(m.name)))) out.push({ check: 'looseOnCanvas', a: n, detail: `top-level INSTANCE "${n.name}" at ${bx(n)} is loose on the canvas (only doc pages, sets, components and sections belong there)` }); } }
    for (let i = 0; i < tl.length; i++) { const A = tl[i].absoluteBoundingBox; if (!A) continue; for (let j = i + 1; j < tl.length; j++) { const B = tl[j].absoluteBoundingBox; if (!B) continue;
      const w = Math.min(A.x + A.width, B.x + B.width) - Math.max(A.x, B.x), h = Math.min(A.y + A.height, B.y + B.height) - Math.max(A.y, B.y);
      if (w > 1 && h > 1) { const [p, q] = num(tl[i]) >= num(tl[j]) ? [tl[i], tl[j]] : [tl[j], tl[i]]; out.push({ check: 'canvasOverlap', a: p, detail: `top-level frames overlap by ${Math.round(w)}x${Math.round(h)}: ${p.id} "${p.name}" [${bx(p)}] (newer) over ${q.id} "${q.name}" [${bx(q)}]` }); } } }
    return out;
  };
  try { const cs = await canvasScan(); if (cs.length) needsReview.push('canvasOverlap: ' + cs.length + ' on the page canvas (frames over frames or loose nodes): ' + cs.slice(0, 6).map((c) => c.check + ' ' + c.detail).join(' | ')); } catch (e) { needsReview.push('canvasOverlap: scan failed: ' + e); }
  return { pageId: root.id, rootId: root.id, filled, skipped, needsReview, needsGuidance, nextOnly: deferred, ms: Date.now() - T0 };
}
return await figmaDocFill(typeof FILL_DATA !== 'undefined' ? FILL_DATA : {}, typeof FILL_OPTS !== 'undefined' ? FILL_OPTS : {});
