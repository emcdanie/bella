import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

// Repo root, resolved from this file's own location: scripts/ -> repo root.
const BELLA = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGE = Number(process.env.STAGE || 3);
const OUT = process.env.OUT || path.join(BELLA, 'bella.dsds.yaml');

const bella = JSON.parse(fs.readFileSync(path.join(BELLA, 'tokens/bella.json'), 'utf8'));
const componentJson = JSON.parse(fs.readFileSync(path.join(BELLA, 'tokens/component.json'), 'utf8')).component;

// ---------- token flattening ----------
const LAYERS = { primitive: 'primitive', semantic: 'semantic', component: 'component' };
function flatten(node, segs, out) {
  if (node && typeof node === 'object') {
    if ('$value' in node) {
      out.push({
        segs: [...segs],
        value: node.$value,
        type: node.$type ?? null,
        desc: node.$description ?? null,
        ext: node.$extensions?.bella ?? null,
      });
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      flatten(v, [...segs, k], out);
    }
  }
}

const raw = [];
for (const layer of ['primitive', 'semantic', 'component']) {
  flatten(bella[layer], [layer], raw);
}

// DSDS id from bella.json's own addressing scheme:
//   primitive.color.brand.iris -> color.brand.iris      (the alias form bella.json itself uses)
//   semantic.accent            -> color.semantic.accent (ditto, see component token $values)
//   component.button.primary.* -> component.button.primary.*
function idFor(segs) {
  const [layer, ...rest] = segs;
  if (layer === 'primitive') return rest.join('.');
  if (layer === 'semantic') return ['color', 'semantic', ...rest].join('.');
  return segs.join('.');
}
const ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*$/;

const tokens = raw.map((t) => ({ ...t, id: idFor(t.segs), layer: t.segs[0] }));
const byId = new Map(tokens.map((t) => [t.id, t]));

for (const t of tokens) if (!ID_RE.test(t.id)) console.error('BAD TOKEN ID:', t.id);

// ---------- names: last segment, widened until unique ----------
const title = (s) => s.split('-').map((w) => (/^\d/.test(w) ? w : w[0].toUpperCase() + w.slice(1))).join(' ');
function nameFor(t, taken) {
  const segs = t.segs.slice(1);
  for (let n = 1; n <= segs.length; n++) {
    const cand = segs.slice(-n).map(title).join(' ');
    if (!taken.has(cand)) { taken.add(cand); return cand; }
  }
  const fall = segs.map(title).join(' ');
  taken.add(fall);
  return fall;
}
const takenNames = new Set();
for (const t of tokens) t.name = nameFor(t, takenNames);

// ---------- helpers ----------
const REVIEW_RE = /^Verified\s+(\d{4}-\d{2}-\d{2})[,:]?\s*(.*)$/s;
function reviewedFrom(a11y) {
  if (!a11y || typeof a11y !== 'string') return null;
  const m = a11y.match(REVIEW_RE);
  if (m) return [{ date: m[1], by: 'human:elleta', note: m[2].trim() }];
  return [{ by: 'human:elleta', note: a11y.trim() }];
}

// bella `related` entries look like "color.brand.navy (dark-mode page)" - keep the
// pointer only when the id half really resolves; otherwise the prose is dropped
// rather than guessed at.
function relatedRefs(ext) {
  if (!ext?.related) return null;
  const refs = [];
  for (const r of ext.related) {
    const head = r.split(/[\s(]/)[0].trim().replace(/\/$/, '');
    const cands = [head, `color.semantic.${head}`, head.replace(/^semantic\./, 'color.semantic.')];
    const hit = cands.find((c) => byId.has(c));
    if (!hit) continue;
    const note = r.slice(head.length).trim().replace(/^\((.*)\)$/, '$1');
    const ref = { to: hit, rel: 'relates-to' };
    if (note) ref.note = note;
    refs.push(ref);
  }
  return refs.length ? refs : null;
}

function groupFor(t) {
  const segs = t.segs.slice(1);
  if (t.layer === 'semantic') return 'color.semantic';
  return segs.length > 1 ? (t.layer === 'component' ? ['component', ...segs.slice(0, -1)].join('.') : segs.slice(0, -1).join('.')) : t.layer;
}

function tokenTypeFor(t) {
  if (!t.type) return null;
  const map = { fontFamily: 'fontFamily', fontWeight: 'fontWeight', cubicBezier: 'cubicBezier' };
  const v = map[t.type] ?? t.type;
  return /^[a-z][a-zA-Z0-9]*$/.test(v) ? v : null;
}

const isAlias = (v) => typeof v === 'string' && /^\{.+\}$/.test(v);

const NORMATIVE = [
  [/^Parent background must be/, 'Parent background MUST be'],
  [/new work should reference/, 'new work SHOULD reference'],
];
function rfc(text) {
  let out = text;
  for (const [re, rep] of NORMATIVE) out = out.replace(re, rep);
  return out;
}

// Every entry needs a `description`. 168 of the 400 tokens have no $description in
// bella.json, so one is DERIVED from the file (never invented) and the entry is
// marked `origin.method: generated` so a reader can tell the two apart.
function descFor(t) {
  if (t.desc) return t.desc;
  if (isAlias(t.value)) {
    const target = t.value.slice(1, -1);
    return `${title(t.layer)}-tier alias. Resolves to \`${target}\` in \`tokens/bella.json\`.`;
  }
  return `${title(t.layer)}-tier ${t.type ?? 'value'}, declared literally in \`tokens/bella.json\`.`;
}

// ---------- token entries ----------
function tokenEntry(t) {
  const e = { kind: 'token', id: t.id, name: t.name, description: descFor(t) };

  const md = {};
  md.origin = t.desc
    ? { method: 'extracted', author: 'machine-assisted', note: 'Description and usage rules extracted from tokens/bella.json; the DTCG file stays the source of truth for the value.' }
    : { method: 'generated', author: 'machine-generated', note: 'bella.json carries no $description for this token. This line is derived from its layer and its $value, not authored by BELLA.' };
  const reviewed = reviewedFrom(t.ext?.a11y);
  if (reviewed) md.reviewed = reviewed;
  md.tags = [t.layer, t.segs[1]].filter(Boolean);
  md.group = groupFor(t);
  e.metadata = md;

  const sections = [];
  if (t.ext?.usage?.length) {
    sections.push({
      kind: 'guidelines', for: 'all', framing: 'when-to-use',
      title: 'Where it is used',
      items: t.ext.usage.map((u) => ({ level: 'may', statement: rfc(u) })),
    });
  }
  const ctxReq = (t.ext?.a11y && typeof t.ext.a11y === 'object') ? t.ext.a11y.contextRequirement : null;
  const howTo = [];
  if (ctxReq) howTo.push({ level: 'must', statement: rfc(ctxReq), checkedBy: 'manual', tags: ['accessibility'] });
  for (const d of t.ext?.dont ?? []) howTo.push({ level: 'must-not', statement: rfc(d) });
  if (howTo.length) {
    sections.push({ kind: 'guidelines', for: 'all', title: 'How to use it', items: howTo });
  }
  if (sections.length) e.sections = sections;

  const rel = relatedRefs(t.ext);
  if (rel) e.related = rel;

  const tt = tokenTypeFor(t);
  if (tt) e.tokenType = tt;
  e.source = { href: './tokens/bella.json', rel: 'file', role: t.segs.join('.') };

  const ext = {};
  if (isAlias(t.value)) ext.alias = t.value;
  if (Object.keys(ext).length) e.$extensions = { 'design.bella': { context: 'The DTCG alias target. DSDS token entries deliberately hold no value, so the alias itself has no typed field.', ...ext } };
  return e;
}

// ---------- components ----------
// Only the 12 contracts in tokens/component.json that have a real implementation
// in src/components/ - the same test scripts/contract-parity.mjs applies.
const IMPL = {
  avatar: 'Avatar', button: 'Button', card: 'Card', 'filter-chip': 'FilterChip',
  heading: 'Heading', icon: 'Icon', input: 'Input', 'resource-card': 'ResourceCard',
  'segmented-control': 'SegmentedControl', select: 'Select', 'status-pill': 'StatusPill', tag: 'Tag',
};

// Variant descriptions, quoted from the component's own TSDoc. A variant with no
// sentence about it in the source is left out rather than described from guesswork.
const VARIANT_DESC = {
  button: {
    primary: 'The raised keycap, the one 3D moment in a view; render at most ONE per view.',
    secondary: 'The flat accent outline.',
    tertiary: 'The text tier: accent and underlined, nothing else.',
  },
  card: {
    default: 'Theme-aware: the inner panel renders the semantic surface (paper in light, navy card in dark) and inks follow the semantic cascade, so a light page structurally cannot show a dark card.',
    peek: 'The one recorded exception: a fixed always-light paper panel meant to float light on navy; its inks are re-scoped so dark mode cannot render light-on-light. There is no fixed-dark variant.',
  },
  heading: {
    hero: 'The 6xl hero step.',
    page: 'The 5xl display step.',
    section: 'The 3xl section tier.',
  },
  tag: {
    default: 'The quiet neutral wash.',
    accent: 'The accent wash (subtle fill, accent text), the generic form of the portfolio’s per-case identity tint.',
  },
  'status-pill': {
    accent: 'The quiet accent ring (the portfolio’s "Current focus").',
    success: 'Wears the carried sage tint, non-text roles only per the recorded decision; the pending status ladder (issue #1) will restyle it.',
    info: 'Wears the carried steel tint, non-text roles only per the recorded decision; the pending status ladder (issue #1) will restyle it.',
  },
};

// Boolean traits only where the source says what the state is. Bare entries in the
// contract's `states` array carry no sentence, so they stay in $extensions instead
// of becoming traits with invented descriptions.
const BOOL_TRAITS = {
  button: [{ id: 'disabled', description: 'Disabled state: muted surface, no elevation, no affordances. Buttons only, not links.', setBy: 'consumer' }],
  card: [{ id: 'media-scrim', description: 'The ink-mix scrim over media, on by default; disable per instance when the cover carries no text.', setBy: 'consumer' }],
  'filter-chip': [{ id: 'pressed', description: 'The real state. Rendered as aria-pressed; the fill is its paint.', setBy: 'consumer' }],
  avatar: [{ id: 'ring', description: 'Accent ring, separated from the disc by a gap of ground. A rest state, never a hover one.', setBy: 'consumer' }],
  input: [
    { id: 'multiline', description: 'Renders a textarea instead of a single-line input.', setBy: 'consumer' },
    { id: 'required', description: 'Marks the field as required, passed straight through to the native control.', setBy: 'consumer' },
    { id: 'disabled', description: 'Disables the native control.', setBy: 'consumer' },
  ],
};

const ENUM_EXTRA = {
  button: { id: 'shape', description: 'Outline shape, quoted from the Button TSDoc.', setBy: 'consumer',
    values: [{ id: 'default', description: 'The keycap radius every tier shares.' }, { id: 'pill', description: 'Rounds the ends fully (e.g. a nav call to action).' }] },
  avatar: { id: 'size', description: 'Step from the avatar ramp: sm 32, md 48, lg 80.', setBy: 'consumer',
    values: [{ id: 'sm', description: '32px disc.' }, { id: 'md', description: '48px disc.' }, { id: 'lg', description: '80px disc.' }] },
  icon: { id: 'size', description: 'Size step from the icon ramp: sm 16, md 20, lg 24.', setBy: 'consumer',
    values: [{ id: 'sm', description: '16px glyph.' }, { id: 'md', description: '20px glyph.' }, { id: 'lg', description: '24px glyph.' }] },
  input: { id: 'type', description: 'Input type for the single-line control.', setBy: 'consumer',
    values: [{ id: 'text', description: 'Free text.' }, { id: 'email', description: 'Email address.' }, { id: 'url', description: 'URL.' }] },
};

const QUALITY_CHECK = { href: './scripts/audit-quality-docs.mjs', rel: 'lint-rule', role: 'audit:quality' };
const PARITY_CHECK = { href: './scripts/contract-parity.mjs', rel: 'lint-rule', role: 'contract parity' };

function componentEntry(key) {
  const c = componentJson[key].$extensions.bella;
  const Pascal = IMPL[key];
  const e = { kind: 'component', id: key, name: c.name, description: c.description };

  const md = {
    origin: { method: 'extracted', author: 'machine-assisted', note: 'Extracted from the BELLA contract in tokens/component.json and the component’s own TSDoc. Not hand-written for this document.' },
  };
  const reviewed = reviewedFrom(c.a11y);
  if (reviewed) md.reviewed = reviewed;
  md.tags = ['component', key];
  e.metadata = md;

  const sections = [];
  if (c.usage?.length) {
    sections.push({
      kind: 'guidelines', for: 'all', framing: 'when-to-use', title: 'Where it is used',
      items: c.usage.map((u) => ({ level: 'may', statement: u })),
    });
  }
  if (c.dont?.length) {
    sections.push({
      kind: 'guidelines', for: 'all', title: 'Do not',
      items: c.dont.map((d) => {
        const it = { level: 'must-not', statement: d };
        if (/audit:quality|contract-enforced/i.test(d)) { it.checks = [QUALITY_CHECK]; it.checkedBy = 'automated'; }
        return it;
      }),
    });
  }
  if (c.restState?.atRest?.length) {
    sections.push({
      kind: 'definitions', for: 'all',
      title: 'At rest',
      description: c.restState.description,
      context: 'anatomy',
      items: [
        ...c.restState.atRest.map((layer) => ({ term: layer, definition: 'Trigger: rest. Paints at rest.' })),
        ...(c.restState.triggered ?? []).map((t) => ({
          term: t.layer,
          definition: `Trigger: ${t.on.join(', ')}${t.theme ? ` (${t.theme} theme only)` : ''}. Inert at rest${t.asserted ? '; audit:quality asserts it' : ''}.`,
        })),
      ],
    });
  }
  if (sections.length) e.sections = sections;

  e.refs = [{ href: `./src/components/${Pascal}/${Pascal}.stories.tsx`, rel: 'storybook', role: 'CSF story source' }];
  e.sourceFiles = [{ platform: 'react', file: `./src/components/${Pascal}/${Pascal}.tsx` }];
  e.specs = [{ href: './tokens/component.json', rel: 'contract', role: 'BELLA component contract ($extensions.bella)', note: 'Checked against the exported Props interface by scripts/contract-parity.mjs.' }];

  const traits = [];
  if (c.variants?.length && VARIANT_DESC[key]) {
    const values = c.variants.filter((v) => VARIANT_DESC[key][v]).map((v) => ({ id: v, description: VARIANT_DESC[key][v] }));
    if (values.length) traits.push({ kind: 'enum', id: key === 'heading' ? 'tier' : 'variant', description: key === 'heading' ? 'Visual tier on the display ramp.' : 'Which visual treatment to render.', setBy: 'consumer', values });
  }
  if (ENUM_EXTRA[key]) traits.push({ kind: 'enum', ...ENUM_EXTRA[key] });
  for (const b of BOOL_TRAITS[key] ?? []) traits.push({ kind: 'boolean', ...b });
  if (traits.length) e.traits = traits;

  // The natural home for "Heading MUST NOT sit inside Card" is a combo. It cannot go
  // there: DSDS-09 does not consult this document's own entries unless the document
  // declares a top-level `rel: file` ref, so `subject: heading` / `items: [card]`
  // fails as "no known entry" even though both entries are in this file. The rule
  // stays a guideline statement, and the machine-checkable form stays in
  // $extensions.design.bella.restState.invariants where audit:quality reads it.

  const ext = { context: 'BELLA contract facts DSDS has no typed field for: the runtime state list (no per-state description exists to satisfy a trait’s required `description`), and the machine-checked rest-state invariants.' };
  if (c.states?.length) ext.states = c.states;
  if (c.restState) ext.restState = c.restState;
  if (c.note) ext.note = c.note;
  e.$extensions = { 'design.bella': ext };
  return e;
}

// ---------- system, themes, foundations, shared ----------
const system = {
  kind: 'system',
  id: 'bella',
  name: 'BELLA',
  description: 'The design system for ctrl_alt_design: a token contract plus a React component set, editorial by stance.',
  purpose: 'Keeps the work editorial, deliberate, and recognizably not-AI-generic across elleta.design, CHIP, and everything downstream.',
  metadata: {
    context: 'Documented in DSDS from the files that already govern BELLA: tokens/bella.json, AGENTS.md, tokens/component.json and the component sources. No value or rule here is new.',
    origin: { method: 'extracted', author: 'machine-assisted' },
    updated: { date: '2026-09-10', note: 'First DSDS pass over BELLA 0.3.0 plus the unreleased component batch.' },
    tags: ['design-system'],
    organization: 'ctrl_alt_design',
    url: 'https://github.com/emcdanie/bella',
    version: '0.3.0',
    platforms: ['react'],
    license: 'MIT',
  },
  sections: [
    {
      kind: 'guidelines', for: 'all', framing: 'when-to-use', title: 'Inheritance',
      items: [
        { level: 'must', statement: 'A repo that installs BELLA MUST inherit its rules; a downstream ruleset may only extend or tighten them, never relax them.', checkedBy: 'manual' },
        { level: 'must', statement: 'When a consuming repo’s rules conflict with BELLA’s, BELLA wins. Flag the conflict; do not silently resolve it.', checkedBy: 'manual' },
      ],
    },
    {
      kind: 'guidelines', for: 'all', title: 'Token-first',
      items: [
        { level: 'must', statement: 'Reference tokens by path (`color.brand.iris`, `spacing.4`, `typography.font-size.base`). Consuming apps read `tokens/bella.json` as the source of truth.', checkedBy: 'manual' },
        { level: 'must', statement: 'When the token you need does not exist yet, stop and ask.', checkedBy: 'manual' },
        { level: 'must', statement: 'A value written `TBD` in the token JSON is a genuine unknown. Stop and ask; do not fill it in.', checkedBy: 'manual' },
        { level: 'must-not',
          statement: 'Never hard-code a hex value, an arbitrary pixel number, or a one-off font size. Colour, spacing, radius, and type MUST resolve through a BELLA token.',
          checks: [QUALITY_CHECK], checkedBy: 'automated' },
      ],
    },
    {
      kind: 'guidelines', for: 'all', title: 'Aesthetic stance',
      description: 'Editorial. Confident. Closer to a magazine or a well-set book than a SaaS dashboard.',
      items: [
        { level: 'should', statement: 'When in doubt, the answer is more type, less chrome. Asymmetry is fine, often better.', checkedBy: 'manual' },
        { level: 'should-not', statement: 'Avoid gradient-on-gradient hero blobs, rounded-and-pastel-everything "friendly AI" UI, emoji in headings, centred everything, and stock iconography where typography would do.', checkedBy: 'manual' },
      ],
    },
  ],
  refs: [
    { href: './AGENTS.md', rel: 'external-link', role: 'the prose rules this document is extracted from' },
    { href: './CHANGELOG.md', rel: 'external-link', role: 'release history' },
    { to: 'bella-a11y', rel: 'relates-to', note: 'The accessibility bar every entry is held to.' },
  ],
};

const themes = [
  {
    kind: 'theme', id: 'light', name: 'Light',
    description: 'The default theme. Warm off-white ground, plum-black ink, iris as the single accent.',
    metadata: { origin: { method: 'extracted', author: 'machine-assisted' }, tags: ['theme'] },
    colorScheme: 'light',
    source: { href: './tokens/semantic/light.json', rel: 'file', role: 'DTCG source for this theme’s semantic values.' },
  },
  {
    kind: 'theme', id: 'dark', name: 'Dark',
    description: 'Navy, not black. Elevation climbs lighter, and the accent flips from iris to periwinkle.',
    metadata: { origin: { method: 'extracted', author: 'machine-assisted' }, tags: ['theme'] },
    extends: [{ to: 'light', rel: 'extends' }],
    colorScheme: 'dark',
    source: { href: './tokens/semantic/dark.json', rel: 'file', role: 'DTCG source for the tokens dark redeclares; anything it does not redeclare falls back to light.' },
  },
];

const foundations = [
  {
    kind: 'entry', id: 'foundation-color', name: 'Colour',
    description: 'A named-colour brand model, one theme-flipping accent, and warm neutrals in place of pure white and pure black.',
    metadata: { origin: { method: 'extracted', author: 'machine-assisted' }, tags: ['foundation', 'color'] },
    sections: [
      {
        kind: 'guidelines', for: 'all', title: 'The palette is decided',
        items: [
          { level: 'must', statement: 'Dark mode is navy (`color.brand.navy`), and dark elevation MUST climb lighter: page, then `color.navy.card`, then `color.navy.raised`.', checkedBy: 'manual' },
          { level: 'may', statement: 'White alpha is permitted as a translucent glass overlay only; the warmth comes from the ground showing through.', checkedBy: 'manual' },
          { level: 'should-not', statement: 'Supporting `steel` and `sage` are carried from the April identity for status states in non-text roles only. Do not design new status UI around them without asking.', checkedBy: 'manual' },
          { level: 'must-not', statement: '`#ffffff` is banned as a solid fill. The default canvas is `color.brand.ground`; cards and raised surfaces are `color.neutral.paper`, separated from the page by lift and shadow, not darkness.', checks: [QUALITY_CHECK], checkedBy: 'automated' },
          { level: 'must-not', statement: 'Iris and periwinkle are one accent in two modes. Never two accents, and never paired with a second accent colour. Amber is retired.', checkedBy: 'manual' },
        ],
      },
      {
        kind: 'guidelines', for: 'all', title: 'Accessibility', description: 'The AAA-minded AA bar, recorded 2026-07-21.',
        items: [
          { level: 'must', checkedBy: 'assisted', tags: ['accessibility'], refs: [{ to: 'bella-a11y#aaa-for-ink-and-body-text', rel: 'same-as' }] },
          { level: 'must', checkedBy: 'assisted', tags: ['accessibility'], refs: [{ to: 'bella-a11y#worst-ground-wins', rel: 'same-as' }] },
          { level: 'must-not', checkedBy: 'assisted', tags: ['accessibility'], refs: [{ to: 'bella-a11y#the-accent-always-theme-flips', rel: 'same-as' }] },
        ],
      },
    ],
    refs: [
      { to: 'color.brand.iris', rel: 'composes', note: 'One member of the `color.brand` group. Every token whose `metadata.group` starts with `color` is part of this foundation; DSDS has no token-group entity to point at as a unit, so the group name is the only handle.' },
    ],
  },
  {
    kind: 'entry', id: 'foundation-typography', name: 'Typography',
    description: 'Exactly two faces, Unique for display and Geist for everything else, over a set of size floors that are bugs to go below.',
    metadata: { origin: { method: 'extracted', author: 'machine-assisted' }, tags: ['foundation', 'typography'] },
    sections: [
      {
        kind: 'guidelines', for: 'all', title: 'The type lock',
        items: [
          { level: 'must', statement: 'Unique (`typography.font-family.display`, Bold/700 the only cut) MUST be reserved for display headings, the home hero headline, and the keycap brand lockup.', checks: [QUALITY_CHECK], checkedBy: 'automated' },
          { level: 'must', statement: 'Geist (`typography.font-family.body`) carries everything else. Eyebrows are Geist caps with `typography.letter-spacing.wider`; the tracking is the look.', checkedBy: 'manual' },
          { level: 'must-not', statement: 'Unique MUST NOT render below 24px, MUST NOT take negative tracking, and MUST NOT be used for body, UI, card titles, eyebrows, nav, buttons, or chips. The keycap brand lockup is the single recorded sub-24 exception.', checks: [QUALITY_CHECK], checkedBy: 'automated' },
          { level: 'must-not', statement: '`typography.font-family.mono` is retired and repointed to Geist for legacy consumers. Do not reintroduce a mono family.', checkedBy: 'manual' },
        ],
      },
      {
        kind: 'guidelines', for: 'all', title: 'Size floors', description: 'Floors, not defaults. Going below is a bug.',
        items: [
          { level: 'must', statement: 'Body text MUST be at least 16px (`typography.font-size.base`).', checks: [QUALITY_CHECK], checkedBy: 'automated' },
          { level: 'must', statement: 'Card titles MUST be at least 20px (`typography.font-size.xl`) at weight 700.', checkedBy: 'assisted' },
          { level: 'must', statement: 'Section headings MUST be at least 32px (`typography.font-size.3xl`).', checkedBy: 'assisted' },
          { level: 'should', statement: 'Fine print, captions, and metadata live at 13-14px and SHOULD be rare. If you are reaching for 12px, rethink the layout.', checkedBy: 'manual' },
          { level: 'must-not', statement: 'Nothing, anywhere, renders below 13px (`typography.font-size.tag`).', checks: [QUALITY_CHECK], checkedBy: 'automated' },
        ],
      },
    ],
    refs: [
      { to: 'typography.font-size.base', rel: 'composes', note: 'One step on the type ramp. Every token in the `typography.font-size` group is a step on the same scale; DSDS has no token-group entity, so the group name is the only handle.' },
    ],
  },
  {
    kind: 'entry', id: 'foundation-spacing', name: 'Spacing and Surface',
    description: 'A 4px-based spacing ramp, a radius tier per surface class, and one light source shared by every raised object.',
    metadata: { origin: { method: 'extracted', author: 'machine-assisted' }, tags: ['foundation', 'spacing'] },
    sections: [
      {
        kind: 'guidelines', for: 'all', title: 'Surface behavior',
        items: [
          { level: 'must', statement: 'One light source, upper-left: highlights top-left, shadows down-right, on orbs, keycaps, and cards alike.', checkedBy: 'manual' },
          { level: 'must', statement: 'Cards take their radius from the token tier: `radius.xl` for `card.default`, `radius.2xl` elevated, `radius.3xl` glass. Buttons take `radius.md`; the primary keycap plate takes `radius.lg`.', checks: [PARITY_CHECK], checkedBy: 'assisted' },
          { level: 'should', statement: 'Cards lift on hover with `motion.transform.hover-lift`. The lift is the tell: cards are objects, not panels.', checkedBy: 'manual' },
          { level: 'should', statement: 'Hover transitions are quick (at most 250ms) and eased.', checkedBy: 'manual' },
          { level: 'must-not', statement: 'The elevation tokens (`shadow.orb*`, `shadow.key-*`, `shadow.switch-*`) are a token lock. Do not flatten them; the depth IS the system.', checkedBy: 'manual' },
          { level: 'must-not', statement: 'No bouncing and no spring physics.', checkedBy: 'manual' },
        ],
      },
    ],
    refs: [
      { to: 'spacing.4', rel: 'composes', note: 'One step on the spacing ramp. Every token in the `spacing` group is a step on the same scale; DSDS has no token-group entity, so the group name is the only handle.' },
    ],
  },
];

const shared = [
  {
    id: 'bella-a11y',
    name: 'The BELLA Accessibility Bar',
    description: 'AAA-minded AA, recorded by Elleta on 2026-07-21. Stated once here and referenced from the entries it governs.',
    sections: [
      {
        kind: 'guidelines', for: 'all', title: 'AAA-minded AA',
        items: [
          { id: 'aaa-for-ink-and-body-text', level: 'must',
            statement: 'Both ink ladders MUST be verified AAA on every surface they sit on. Body text never drops below AAA.',
            evidence: [{ href: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html', rel: 'external-link', role: 'WCAG 2.2 SC 1.4.6 (AAA)' }],
            checkedBy: 'assisted', tags: ['accessibility', 'contrast'] },
          { id: 'aa-where-the-accent-speaks', level: 'must',
            statement: 'Accent text, buttons, and links MUST be AA-verified per token. Iris tops out at 5.96:1 on light surfaces, so AAA accent text is not attainable and is not the bar.',
            evidence: [{ href: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html', rel: 'external-link', role: 'WCAG 2.2 SC 1.4.3 (AA)' }],
            checkedBy: 'assisted', tags: ['accessibility', 'contrast'] },
          { id: 'worst-ground-wins', level: 'must',
            statement: 'A text token MUST pass AA normal text on the worst surface it is allowed to sit on, or its usage metadata MUST forbid that surface. Verified ratios are recorded per token, dated.',
            checkedBy: 'assisted', tags: ['accessibility', 'contrast'] },
          { id: 'the-accent-always-theme-flips', level: 'must-not',
            statement: 'Iris in light, periwinkle in dark. Each fails its opposite ground so hard (2.64:1 and 2.24:1) that it MUST NOT appear there even as decoration; the failure includes the 3:1 non-text minimum.',
            checkedBy: 'assisted', tags: ['accessibility', 'contrast'] },
        ],
      },
    ],
  },
];

// ---------- assemble ----------
const entries = [];
if (STAGE >= 1) entries.push(system);
if (STAGE >= 2) {
  for (const t of tokens) entries.push(tokenEntry(t));
  entries.push(...themes);
}
if (STAGE >= 3) for (const key of Object.keys(componentJson)) if (IMPL[key]) entries.push(componentEntry(key));
if (STAGE >= 1) entries.push(...foundations);

const doc = { schemaVersion: '0.20.1', $schema: 'https://designsystemdocspec.org/v0.20.1/dsds.bundled.yaml', name: 'BELLA', entries, shared };

let body = yaml.dump(doc, { lineWidth: -1, noRefs: true, quotingType: '"', forceQuotes: false });
body = body.replace(/^schemaVersion: 0\.20\.1$/m, 'schemaVersion: "0.20.1"');
fs.writeFileSync(OUT, body);
console.error(`stage ${STAGE}: ${entries.length} entries, ${shared.length} shared -> ${OUT}`);
