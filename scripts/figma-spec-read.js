// figma-spec-read: reads one component set from Figma into plain JSON for scripts/spec-build.mjs (12 Nov 2026).
// Read-only. Plain plugin-API JS, run through the Desktop Bridge (figma_execute). Nothing is written to the file.
// Set READ_OPTS first, then paste this file after it:
//   const READ_OPTS = { fileKey: 'JzN6DXIILH64KHI5MmgH8Q', pageName: '🧩 Link', setName: 'Link' };
// Save the returned `result` as JSON and pass it to: node scripts/spec-build.mjs Link --figma <file>.json
// Never uses loadAllPagesAsync; one page.loadAsync, and an 8s race around every variable lookup.

async function figmaSpecRead(o) {
  if (figma.fileKey !== o.fileKey) throw new Error(`fileKey ${figma.fileKey}, expected ${o.fileKey}`);
  const race = (p) => Promise.race([p, new Promise((r) => setTimeout(() => r(null), 8000))]);
  const page = figma.root.children.find((p) => p.name === o.pageName);
  if (!page) throw new Error(`page ${o.pageName} not found`);
  await page.loadAsync();
  const set = page.findOne((n) => (n.type === 'COMPONENT_SET' || n.type === 'COMPONENT') && n.name === o.setName && n.parent === page) || page.findOne((n) => n.type === 'COMPONENT_SET' && n.name === o.setName);
  if (!set) throw new Error(`component ${o.setName} not found on ${o.pageName}`);

  const varCache = new Map();
  const varName = async (id) => {
    if (varCache.has(id)) return varCache.get(id);
    const v = await race(figma.variables.getVariableByIdAsync(id));
    const name = v ? v.name : `unknown:${id}`;
    varCache.set(id, name); return name;
  };
  const resolveBound = async (n) => {
    const out = {};
    const bv = n.boundVariables || {};
    for (const [field, val] of Object.entries(bv)) {
      const list = Array.isArray(val) ? val : [val];
      const names = [];
      for (const b of list) if (b && b.id) names.push(await varName(b.id));
      if (names.length) out[field] = names.length === 1 ? names[0] : names;
    }
    return out;
  };

  const props = {};
  const defs = set.componentPropertyDefinitions || {};
  for (const [k, d] of Object.entries(defs)) {
    props[k] = { type: d.type, default: d.defaultValue, ...(d.variantOptions ? { values: d.variantOptions } : {}) };
  }
  const first = set.type === 'COMPONENT_SET' ? set.defaultVariant : set;

  const walk = async (n, depth) => {
    const node = { name: n.name, type: n.type };
    if (n.visible === false) node.hidden = true;
    if (n.type === 'TEXT') node.text = n.characters;
    if ('width' in n) { node.width = Math.round(n.width * 100) / 100; node.height = Math.round(n.height * 100) / 100; }
    if (n.type === 'INSTANCE') { const m = await race(n.getMainComponentAsync()); if (m) node.instanceOf = m.parent && m.parent.type === 'COMPONENT_SET' ? m.parent.name : m.name; }
    const bound = await resolveBound(n);
    if (Object.keys(bound).length) node.bound = bound;
    // fills and strokes carry the variable on each paint, not on the node
    for (const key of ['fills', 'strokes']) {
      if (Array.isArray(n[key])) {
        const names = [];
        for (const p of n[key]) { const id = p.boundVariables && p.boundVariables.color && p.boundVariables.color.id; if (id) names.push(await varName(id)); else if (p.type === 'SOLID' && p.visible !== false) names.push('RAW'); }
        if (names.length) (node.bound = node.bound || {})[key] = names.length === 1 ? names[0] : names;
      }
    }
    if (n.componentPropertyReferences && Object.keys(n.componentPropertyReferences).length) node.propRefs = n.componentPropertyReferences;
    if ('children' in n && n.type !== 'INSTANCE' && depth < 8) { node.children = []; for (const c of n.children) node.children.push(await walk(c, depth + 1)); }
    return node;
  };

  const variants = set.type === 'COMPONENT_SET' ? set.children.filter((c) => c.type === 'COMPONENT').map((c) => ({ name: c.name, width: Math.round(c.width), height: Math.round(c.height) })) : [];
  const annotations = (set.annotations || []).map((a) => ({ label: a.label || null, category: a.categoryId || null }));
  return {
    fileKey: o.fileKey, nodeId: set.id, name: set.name, type: set.type,
    description: set.description || '',
    documentationLinks: (set.documentationLinks || []).map((l) => l.uri),
    props, variants, defaultVariant: first.name,
    layers: await walk(first, 0),
    annotations,
  };
}
return await figmaSpecRead(typeof READ_OPTS !== 'undefined' ? READ_OPTS : {});
