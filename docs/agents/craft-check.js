// craft-check.js: Elleta's READ FIRST rules (maintaining.md) as an automatic check.
// Read-only. Run with use_figma or figma_execute after every write, beside pixel-check.
// Set ROOTS to the ids you changed (parts, screens, sections). Pass = issues 0, or each
// remaining line is a named exception in the part's description.
// Rules covered: 1, 7, 9, 10, 12, 13, 14, 15, 16, 19, one line on doc pages, AAA type, two fonts, screens, CodeBlock syntax runs, duplicate variant names, loose › arrows, target marks.
// Each finding names its rule number so the fix can be looked up in maintaining.md.
const ROOTS = ['PUT:ID'];
const OVERLAY = /focus|ring|scrim|badge|hit area|overlay|halo|target|track|pin spot|wash|popup|pointer/i; // rule 7 named overlays
const DRAWING = /arc|gauge|art|drawing|logo|wordmark|mark|pattern|illustration|chart|vector|icon|glyph|ring|segment|pointer|sparkline/i;  // data marks and brand art
const NAV_WORDS = /^(open|show|see|view|go to|more|details|browse)\b/i;                               // rule 12
const out = [];
const path = n => { const a = []; for (let x = n; x && x.type !== 'PAGE' && a.length < 4; x = x.parent) a.unshift(x.name.slice(0, 26)); return a.join(' › '); };
const add = (rule, n, d) => out.push(`R${rule} · ${path(n)} [${n.id}] · ${d}`);
const num = v => typeof v === 'number';
const inDrawing = n => { for (let x = n; x && x.type !== 'PAGE'; x = x.parent) if (DRAWING.test(x.name)) return true; return false; };
const mainName = async n => { if (n.type !== 'INSTANCE') return ''; const m = await n.getMainComponentAsync(); if (!m) return ''; return (m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name + '/' : '') + m.name; };

for (const id of ROOTS) {
  const root = await figma.getNodeByIdAsync(id); if (!root) { out.push('MISSING ' + id); continue; }
  const all = [root, ...(root.findAll ? root.findAll(n => n.visible) : [])];
  const logos = {};
  for (const n of all) {
    const insideInstance = (() => { for (let x = n.parent; x && x.type !== 'PAGE'; x = x.parent) if (x.type === 'INSTANCE') return true; return false; })();
    // R7 build like code: absolute children must be named overlays; containers use auto layout; no fixed-height text
    if (!insideInstance && n.layoutPositioning === 'ABSOLUTE' && !OVERLAY.test(n.name) && !inDrawing(n)) add(7, n, 'absolute but not a named overlay');
    if (!insideInstance && (n.type === 'FRAME' || n.type === 'COMPONENT') && 'children' in n && n.children.length > 1 && n.layoutMode === 'NONE' && !inDrawing(n) && n.type !== 'SECTION') add(7, n, 'container without auto layout');
    if (!insideInstance && n.type === 'TEXT' && n.textAutoResize === 'NONE') add(7, n, 'fixed-height text box');
    // R7 targets: interactive parts under 44 need a Hit area
    if (n.type === 'INSTANCE' && !inDrawing(n) && /\b(button|link|tab|nav|row|chip|toggle|switch|checkbox|radio|slider)\b/i.test(n.name) && (n.width < 44 || n.height < 44)) {
      const hit = n.findOne ? n.findOne(x => /hit area/i.test(x.name)) : null;
      if (!hit && !insideInstance) add(7, n, `target ${Math.round(n.width)}×${Math.round(n.height)} with no Hit area`);
    }
    // R9 one-side edges on rounded shapes
    if ('cornerRadius' in n && (num(n.cornerRadius) ? n.cornerRadius > 0 : true) && Array.isArray(n.strokes) && n.strokes.some(s => s.visible !== false) && num(n.strokeTopWeight)) {
      const sides = [n.strokeTopWeight, n.strokeRightWeight, n.strokeBottomWeight, n.strokeLeftWeight].filter(w => w > 0).length;
      // only matters where a one-side edge meets a rounded corner
      const r = num(n.cornerRadius) ? [n.cornerRadius,n.cornerRadius,n.cornerRadius,n.cornerRadius] : [n.topLeftRadius||0,n.topRightRadius||0,n.bottomRightRadius||0,n.bottomLeftRadius||0];
      const w = [n.strokeTopWeight, n.strokeRightWeight, n.strokeBottomWeight, n.strokeLeftWeight];
      const touches = (w[0]>0&&(r[0]>0||r[1]>0))||(w[1]>0&&(r[1]>0||r[2]>0))||(w[2]>0&&(r[2]>0||r[3]>0))||(w[3]>0&&(r[3]>0||r[0]>0));
      if (sides > 0 && sides < 4 && touches && !/underline|divider|hairline|rule/i.test(n.name)) add(9, n, `edge on ${sides} side(s) bends round a rounded corner`);
    }
    if (Array.isArray(n.effects)) for (const e of n.effects) if (e.visible !== false && e.type === 'INNER_SHADOW' && (e.radius || 0) === 0 && ((e.offset.x !== 0) !== (e.offset.y !== 0))) add(9, n, 'one-side inset stripe');
    // R10 spacing on the 4-point scale
    if (!insideInstance && n.layoutMode && n.layoutMode !== 'NONE') {
      const vals = [n.itemSpacing, n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].filter(num);
      const off = vals.filter(v => v > 0 && v % 4 !== 0 && v !== 2 && v !== 6);
      if (off.length) add(10, n, `spacing off the 4-point scale: ${[...new Set(off)].join(', ')}`);
    }
    // Target marks: every target mark is an instance of _Target mark (4 wide, bar + 8 tall), never drawn or scaled
    // (decided 18 Nov).
    if (/^(Mark|Target mark)$/.test(n.name) && /target|legend/i.test(path(n)) && (await mainName(n)) !== '_Target mark') add('Target', n, 'target mark is not the _Target mark part');
    // R12 the › arrow is the Trailing part (24 glyph, frame fills the row height, 44 Hit area), never a loose
    // Icon (decided 18 Nov).
    if (n.type === 'INSTANCE' && /^Icon\/name=NavArrowRight/.test(await mainName(n))) {
      const p = n.parent, inTrailing = (await mainName(p)) === 'Trailing' || (p && p.name === 'Trailing');
      if (!inTrailing && !/link|story/i.test(path(n))) add(12, n, '› is a loose Icon: use the Trailing part (24, centred on the row)');
    }
    // R12 arrows go, buttons do: a button that only navigates
    if (n.type === 'INSTANCE' && /^button/i.test(await mainName(n))) {
      const label = n.findOne ? n.findOne(x => x.type === 'TEXT') : null;
      if (label && NAV_WORDS.test(label.characters.trim())) add(12, n, `button "${label.characters.trim()}" only navigates: use the › arrow row`);
    }
    // R12 counts say of what and which way
    if (n.type === 'TEXT' && /\b\d+\s*(of|\/)\s*\d+\b\s*$/i.test(n.characters.trim()) && n.characters.trim().split(/\s+/).length > 2) add(12, n, `count "${n.characters.trim().slice(0, 30)}" doesn't say what or which way`);
    // R13 one logo per job, counted per screen (18 Nov: a flow of six screens has six sidebars, and each may
    // carry the logo once). A screen is the nearest ancestor named "Screen n…" or "n · …"; otherwise the root.
    if (n.type === 'INSTANCE') { const mn = await mainName(n); if (/logo|wordmark|brand\s*\//i.test(mn)) {
      let scr = root; for (let x = n.parent; x && x !== root && x.type !== 'PAGE'; x = x.parent) if (/^(screen \d|\d+ · )/i.test(x.name)) { scr = x; break; }
      const k = scr.name.slice(0, 30) + ' › ' + mn; logos[k] = (logos[k] || 0) + 1; } }
    // R14 doc pages are template instances
    if (n.type === 'FRAME' && /doc page/i.test(n.name)) add(14, n, 'doc page is a plain frame, not an instance of Doc / Component page');
    // Reading text: 16px floor, line height 1.5 on multi-line text
    if (n.type === 'TEXT' && !insideInstance) {
      const fs = n.fontSize; if (num(fs) && fs < 16) add('AAA', n, `text ${fs}px under the 16px floor`);
      const lh = n.lineHeight; if (n.height > (num(fs) ? fs * 2.2 : 40) && lh && lh !== figma.mixed && ((lh.unit === 'PERCENT' && lh.value < 150) || (lh.unit === 'PIXELS' && num(fs) && lh.value < fs * 1.5))) add('AAA', n, 'multi-line text under line height 1.5');
      // Two fonts: Geist Mono never for a sentence
      // Chip type B (18 Nov): titles Lexend, subtext and numbers Geist Mono. Flag a Geist Mono title and a long Geist Mono paragraph.
      if (n.fontName !== figma.mixed && /geist mono/i.test(n.fontName.family) && /title|heading|name/i.test(n.name) && !/\d/.test(n.characters)) add('Type', n, 'title in Geist Mono (titles are Lexend)');
      if (n.fontName !== figma.mixed && /geist mono/i.test(n.fontName.family) && n.characters.trim().split(/\s+/).length > 14) add('Type', n, 'paragraph in Geist Mono (paragraphs stay Lexend)');
      if (n.fontName !== figma.mixed && /dm sans|inter/i.test(n.fontName.family) && /chip/i.test(path(n))) add('Type', n, `${n.fontName.family} on a Chip screen`);
    }
    // R1 tokens: colours bound to variables or styles
    if (!insideInstance && 'fills' in n && Array.isArray(n.fills)) {
      const bad = n.fills.some(f => f.visible !== false && f.type === 'SOLID' && !(f.boundVariables && f.boundVariables.color)) && !(n.fillStyleId && typeof n.fillStyleId === 'string');
      if (bad && !inDrawing(n)) add(1, n, 'hard-coded fill colour');
    }
    // Doc pages: labels, lines and table cells stay on one line; widen the specimen or shorten the copy
    // (decided 18 Nov).
    if (n.type === 'TEXT' && /doc/i.test(root.name) && /^(Use|Line|Task|Answer|Cell \d|Prop|Values|Default|Rule|State)$/.test(n.name) && n.characters.trim()
        && !(() => { for (let x = n.parent; x && x !== root; x = x.parent) if (x.type === 'FRAME' && /^(Box|Row|Specimens)$/.test(x.name)) return true; return false; })()) {
      const fs = num(n.fontSize) ? n.fontSize : 16;
      if (n.height > fs * 2.2) add('OneLine', n, `"${n.characters.trim().slice(0, 30)}" wraps at ${Math.round(n.width)} wide`);
    }
    // Code: every run of a CodeBlock code line is bound to a color/content/syntax/* token (decided 18 Nov). Setting text or a style on a line resets its runs to one colour.
    if (n.type === 'TEXT' && n.name === 'Code' && /code ?line|codeblock/i.test(path(n))) {
      for (const s of n.getStyledTextSegments(['fills'])) {
        if (!s.characters.trim()) continue;
        const f = s.fills[0], id = f && f.boundVariables && f.boundVariables.color && f.boundVariables.color.id;
        const v = id ? await figma.variables.getVariableByIdAsync(id) : null;
        if (!v || !/syntax\//.test(v.name)) { add('Code', n, `run "${s.characters.trim().slice(0, 20)}" not bound to a syntax token`); break; }
      }
    }
  }
  // Row: every row is a List item configuration (decided 18 Nov). Flags a hand-built frame, outside any instance, that holds two or more TEXT lines and a Button or ActionChip
  // as direct children or one frame deep: a row shape that should be a List item.
  for (const f of all.filter(x => x.type === 'FRAME' && 'children' in x)) {
    let inInst = false; for (let p = f.parent; p && p.type !== 'PAGE'; p = p.parent) if (p.type === 'INSTANCE') { inInst = true; break; }
    if (inInst) continue;
    const near = [...f.children, ...f.children.filter(c => c.type === 'FRAME').flatMap(c => c.children)].filter(c => c.visible);
    const texts = near.filter(c => c.type === 'TEXT').length;
    let btn = false, tag = false; for (const c of near.filter(c => c.type === 'INSTANCE')) { const mn = await mainName(c); if (/^(Button|ActionChip)\//.test(mn)) btn = true; if (/^(Tag|StatusPill|StatusDot)\//.test(mn)) tag = true; }
    if (texts >= 2 && btn && f.height <= 160) add('Row', f, 'row-shaped frame (title, subtitle, button) not built from List item');
    // 18 Nov (handoff queue 7): also a title / subtitle / Tag stack with no button, like the first Trust by kind of fix card
    else if (texts >= 2 && tag && f.height <= 160) add('Row', f, 'row-shaped frame (title, subtitle, tag) not built from List item');
  }
  // R7 overflow: an auto-layout frame or instance whose child spills out of it (18 Nov: every Section head instance was
  // fixed at 32 tall around a 50 tall title column, so titles sat 5px from the card edge)
  for (const f of all.filter(x => (x.type === 'FRAME' || x.type === 'INSTANCE') && x.layoutMode && x.layoutMode !== 'NONE' && !x.clipsContent)) {
    const ov = f.children.find(c => c.visible && c.layoutPositioning !== 'ABSOLUTE' && !inDrawing(c) && !/^(arrow|tail)$/i.test(c.name) /* Docs Kit flow banner arrow pokes out by design */ && (c.y < -0.5 || c.y + c.height > f.height + 0.5 || c.x < -0.5 || c.x + c.width > f.width + 0.5));
    if (ov) add(7, f, `"${ov.name}" spills out of its ${Math.round(f.width)}×${Math.round(f.height)} auto-layout box`);
  }
  // Seg: no small Segmented control on a CHIP main page (decided 18 Nov). Views under the page header are Tabs. Flags a SegmentedControl size=sm, and size=sm Segments set
  // straight into a frame (a hand-built track), anywhere under a CHIP screen or page-content part.
  for (const i of all.filter(x => x.type === 'INSTANCE')) {
    const m = await i.getMainComponentAsync(); if (!m) continue;
    const setName = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : '';
    const chip = /chip|content|screen/i.test(path(i));
    if (chip && setName === 'SegmentedControl' && /size=sm/.test(m.name)) add('Seg', i, 'small Segmented control on a CHIP main page: use size md (decided 18 Nov); Tabs only when it switches whole views');
    else if (chip && /^Segment/.test(setName) && /size=sm/.test(m.name) && i.parent && i.parent.type === 'FRAME') add('Seg', i.parent, 'hand-built small segment track on a CHIP main page');
  }
  // R19 card groups keep column edges: in a wrapping group (auto layout GRID or WRAP, or a vertical stack of card
  // rows), every card's left and right edge lines up with a card edge in the row above, within 1px. A lone last card
  // spans the same columns as the card above it (decided 18 Nov).
  {
    const isCard = c => c.visible && (c.type === 'INSTANCE' || c.type === 'FRAME') && c.width >= 120 && c.height >= 60 && c.layoutPositioning !== 'ABSOLUTE';
    const edges = cs => cs.flatMap(c => { const b = c.absoluteBoundingBox; return b ? [b.x, b.x + b.width] : []; });
    const checkRows = (grp, rows) => { for (let i = 1; i < rows.length; i++) { if (rows[i - 1].length < 2) continue; const prev = edges(rows[i - 1]); if (!prev.length) continue; // a single full-width card above sets no columns
      for (const c of rows[i]) { const b = c.absoluteBoundingBox; if (!b) continue; for (const e of [b.x, b.x + b.width]) if (!prev.some(p => Math.abs(p - e) <= 1)) { add(19, c, `edge ${Math.round(e)} doesn't line up with a card edge in the row above (${grp.name})`); break; } } } };
    for (const g of all.filter(x => x.layoutMode === 'GRID' || x.layoutWrap === 'WRAP')) {
      const cards = g.children.filter(isCard); const byY = {}; for (const c of cards) { const y = Math.round(c.absoluteBoundingBox.y); (byY[y] = byY[y] || []).push(c); }
      checkRows(g, Object.keys(byY).map(Number).sort((a, b) => a - b).map(y => byY[y]));
    }
    for (const g of all.filter(x => x.layoutMode === 'VERTICAL' && 'children' in x)) {
      const rows = g.children.filter(c => c.visible).map(c => c.layoutMode === 'HORIZONTAL' && c.children.filter(isCard).length >= 2 ? c.children.filter(isCard) : (isCard(c) && /card/i.test(c.name) ? [c] : null)).filter(Boolean);
      if (rows.length >= 2 && rows.some(r => r.length >= 2)) checkRows(g, rows);
    }
  }
  // R20 one text edge beside a leading icon: in a block whose row starts with an icon, every text in that block
  // shares one left edge, within 1px; the icon sits in its own column (decided 18 Nov).
  for (const blk of all.filter(x => x.layoutMode === 'VERTICAL' && 'children' in x)) {
    const lead = blk.children.find(r => r.visible && r.layoutMode === 'HORIZONTAL' && 'children' in r && r.children.length > 1 && r.children[0].visible && /icon|glyph|well|avatar|dot/i.test(r.children[0].name) && r.children.slice(1).some(c => c.type === 'TEXT'));
    if (!lead) continue;
    const after = blk.children.slice(blk.children.indexOf(lead)).filter(c => c.visible); // the icon row and what stacks under it, not a label above
    const texts = after.flatMap(c => c.type === 'TEXT' ? [c] : ('findAll' in c && c.type !== 'INSTANCE' ? c.findAll(t => t.type === 'TEXT' && t.visible) : [])).filter(t => t.characters.trim() && !(() => { for (let x = t.parent; x && x !== blk; x = x.parent) if (x.type === 'INSTANCE') return true; return false; })());
    const xs = texts.map(t => t.absoluteBoundingBox && t.absoluteBoundingBox.x).filter(num);
    if (xs.length > 1 && Math.max(...xs) - Math.min(...xs) > 1) add(20, blk, `texts start at ${[...new Set(xs.map(Math.round))].join('/')} beside a leading icon: icon in its own column, texts in one column`);
  }
  // R15 cards in a row: same height, filled
  for (const row of all.filter(x => x.layoutMode === 'HORIZONTAL' && 'children' in x)) {
    const cards = row.children.filter(c => c.visible && (c.type === 'INSTANCE' || c.type === 'FRAME') && c.width >= 120 && c.height >= 80 && c.layoutPositioning !== 'ABSOLUTE');
    if (cards.length >= 2) {
      const hs = cards.map(c => Math.round(c.height)); const notFill = cards.filter(c => c.layoutAlign !== 'STRETCH' && c.layoutSizingVertical !== 'FILL');
      if (Math.max(...hs) - Math.min(...hs) > 1 || notFill.length) add(15, row, `cards in a row differ (${[...new Set(hs)].join('/')}) or don't fill (${notFill.length})`);
    }
  }
  // R16 never clip a shadow
  for (const f of all.filter(x => x.clipsContent && 'findAll' in x && x.absoluteBoundingBox)) {
    const B = f.absoluteBoundingBox;
    const hit = f.findAll(c => c.visible && Array.isArray(c.effects) && c.effects.some(e => e.visible !== false && e.type === 'DROP_SHADOW')).find(c => { const b = c.absoluteBoundingBox; if (!b) return false; const g = Math.max(...c.effects.filter(e => e.type === 'DROP_SHADOW').map(e => (e.radius||0)+(e.spread||0)+Math.abs(e.offset.y))); return b.x - g < B.x || b.y - g < B.y || b.x + b.width + g > B.x + B.width || b.y + b.height + g > B.y + B.height; });
    if (hit && !/mask|roll|clip window/i.test(f.name)) add(16, f, `clips the shadow of "${hit.name}"`);
  }
  for (const [k, v] of Object.entries(logos)) if (v > 1) out.push(`R13 · ${root.name} · ${k} appears ${v} times on one screen`);
  // Sets: two variants with the same name break variant switching (18 Nov: Segment had all 12 twice, so a
  // segment could not be set to selected on the CHIP Components flow).
  for (const set of [root, ...(root.findAll ? root.findAll(x => x.type === 'COMPONENT_SET') : [])].filter(x => x.type === 'COMPONENT_SET')) {
    const seen = {}; for (const c of set.children) seen[c.name] = (seen[c.name] || 0) + 1;
    for (const [k, v] of Object.entries(seen)) if (v > 1) add('Set', set, `variant "${k}" appears ${v} times`);
  }
  // Screens: flow screens are template instances, not drawn frames
  if (root.type === 'SECTION' && /flow/i.test(root.name)) for (const s of root.findAll(x => x.parent && /screen/i.test(x.name) && (x.type === 'FRAME') && x.width >= 1200)) add('Screens', s, 'flow screen is a drawn frame, not an instance of CHIP / Screen');
}
const kinds = {}; out.forEach(l => { const k = l.split(' · ')[0]; kinds[k] = (kinds[k] || 0) + 1; });
return { issues: out.length, kinds, out: out.slice(0, 150) };
