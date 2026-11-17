// BELLA token build: Figma Foundations export (tokens/figma/, DTCG) -> Style Dictionary -> CSS, JSON, docs.
// Do not edit a built file or anything in tokens/figma/ by hand: change Figma, re-export, run `npm run build`.
//
// Outputs:
//   (tokens/figma/shadow.json holds the Figma effect styles; the rest is the variables export)
//   tokens/bella.css              :root + four [data-theme] blocks, small-screen sizes under one media query
//   tokens/bella.json             every token per theme: resolved value, alias, type, description, CSS name
//   docs/bella.css                copy of tokens/bella.css for the GitHub Pages site
//   docs/tokens.md                token reference table
//   .storybook/theme-values.json  values the Storybook manager theme reads
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FIGMA = path.join(ROOT, 'tokens/figma');
const rel = (p) => path.join(FIGMA, p);

// The four themes, from the export's own $themes.json (Figma modes).
const THEMES = JSON.parse(fs.readFileSync(rel('$themes.json'), 'utf8')).map((t) => ({
  id: t.id.replace(/^bella-chip-/, ''), // bella-light, bella-dark, chip-light, chip-dark
  name: t.name,
  sets: ['shadow', ...Object.keys(t.selectedTokenSets)], // shadow.json: effect styles, not in $themes.json
}));
const DEFAULT_THEME = 'bella-light';
// BELLA themes swap to the small-screen sizes below this width (breakpoint/768 in Figma).
const SMALL_SCREEN = '(max-width: 767px)';

// ---- transforms ----
const tierOf = (token) => {
  const f = token.filePath.replaceAll('\\', '/');
  // shadows are Figma effect styles, the same in every theme: Tier 1 with the ramps
  if (f.endsWith('/primitive.json') || f.endsWith('/shadow.json')) return 'primitive';
  if (f.includes('/breakpoints/')) return 'breakpoint';
  if (f.includes('/semantic/')) return 'semantic';
  return 'component';
};

// Name: the Figma code syntax (WEB) rule, path joined with "-". Fails if Figma's field ever disagrees.
StyleDictionary.registerTransform({
  name: 'bella/name',
  type: 'name',
  transform: (token) => {
    const name = token.path.join('-');
    const cs = token.$extensions?.figma?.codeSyntax;
    if (cs && cs !== `var(--${name})`) {
      throw new Error(`code syntax ${cs} does not match its path ${token.path.join('/')}`);
    }
    return name;
  },
});
// Figma has no time type: motion durations and staggers are numbers of milliseconds.
StyleDictionary.registerTransform({
  name: 'bella/ms',
  type: 'value',
  filter: (token) => /^motion\.(duration|stagger)\./.test(token.path.join('.')) && typeof token.$value === 'number',
  transform: (token) => `${token.$value}ms`,
});
// Figma holds the face name only; CSS needs it quoted, with the generic family as the browser's fallback.
const GENERIC = { newsreader: 'serif', 'geist-mono': 'monospace' };
StyleDictionary.registerTransform({
  name: 'bella/font-family',
  type: 'value',
  filter: (token) => token.path.slice(0, 2).join('.') === 'typography.font-family',
  transform: (token) => `"${token.$value}", ${GENERIC[token.path[2]] ?? 'sans-serif'}`,
});

async function load(sets) {
  const sd = new StyleDictionary({
    source: sets.map((s) => rel(`${s}.json`)),
    log: { verbosity: 'silent', warnings: 'disabled' },
    platforms: { css: { transforms: ['bella/name', 'bella/ms', 'bella/font-family', 'shadow/css/shorthand'] } },
  });
  const { allTokens } = await sd.getPlatformTokens('css');
  return allTokens;
}

// A token whose Figma value is one alias is written as var() of that token, so a theme is a remap.
const ALIAS = /^\{([^}]+)\}$/;
const cssValue = (t) => {
  const o = t.original.$value;
  if (typeof o === 'string' && ALIAS.test(o)) return `var(--${o.match(ALIAS)[1].replaceAll('.', '-')})`;
  return String(t.$value);
};
const declare = (tokens, indent = '  ') => tokens.map((t) => `${indent}--${t.name}: ${cssValue(t)};`).join('\n');

// ---- build every theme ----
const byTheme = {};
for (const theme of THEMES) byTheme[theme.id] = await load(theme.sets);
const small = await load(['shadow', 'primitive', 'breakpoints/small']);

// Names must be unique within a theme, and every theme carries the same names.
const names = (list) => list.map((t) => t.name).sort().join('\n');
for (const theme of THEMES) {
  const list = byTheme[theme.id];
  const seen = new Set();
  for (const t of list) {
    if (seen.has(t.name)) throw new Error(`${theme.name}: two tokens named --${t.name}`);
    seen.add(t.name);
  }
  if (names(list) !== names(byTheme[DEFAULT_THEME])) throw new Error(`${theme.name}: token names differ from BELLA light`);
}

// ---- bella.css ----
const notPrimitive = (list) => list.filter((t) => tierOf(t) !== 'primitive');
const header = `/* BELLA tokens, built by tokens/build.mjs (Style Dictionary) from the Figma Foundations export in tokens/figma/.
 * Do not edit. Change Figma, re-export, run \`npm run build\`.
 * Themes: set data-theme on <html> or any wrapper to ${THEMES.map((t) => `"${t.id}"`).join(', ')}.
 * No attribute = BELLA light. */`;
const blocks = [header, ''];
const def = byTheme[DEFAULT_THEME];
blocks.push(`:root,\n[data-theme="${DEFAULT_THEME}"] {`);
blocks.push('  /* Tier 1: ramps and scales, the same in every theme */');
blocks.push(declare(def.filter((t) => tierOf(t) === 'primitive')));
blocks.push('\n  /* Breakpoint sizes, Tier 2 and Tier 3: BELLA light */');
blocks.push(declare(notPrimitive(def)));
blocks.push('}\n');
// Shadows with a -dark twin in Figma (shadow/card-ink-dark …) take the twin in the dark themes.
const darkTwins = def.filter((t) => t.path[0] === 'shadow' && t.name.endsWith('-dark'))
  .map((t) => t.name.replace(/-dark$/, ''))
  .filter((base) => def.some((t) => t.name === base));
for (const theme of THEMES.filter((t) => t.id !== DEFAULT_THEME)) {
  blocks.push(`[data-theme="${theme.id}"] {`);
  blocks.push(`  /* Breakpoint sizes, Tier 2 and Tier 3: ${theme.name} */`);
  blocks.push(declare(notPrimitive(byTheme[theme.id])));
  if (!theme.id.endsWith('-dark') && darkTwins.length) {
    blocks.push('\n  /* Shadows: back to the light ones inside a dark root */');
    blocks.push(darkTwins.map((n) => `  --${n}: ${cssValue(def.find((t) => t.name === n))};`).join('\n'));
  }
  if (theme.id.endsWith('-dark')) {
    blocks.push('\n  /* Shadows: the Figma -dark twins */');
    blocks.push(darkTwins.map((n) => `  --${n}: var(--${n}-dark);`).join('\n'));
  }
  blocks.push('}\n');
}
blocks.push(`/* Small screens, BELLA themes only (Chip keeps its own sizes) */`);
blocks.push(`@media ${SMALL_SCREEN} {`);
blocks.push(`  :root:not([data-theme^="chip"]),\n  [data-theme^="bella"] {`);
blocks.push(declare(small.filter((t) => tierOf(t) === 'breakpoint'), '    '));
blocks.push('  }\n}');
const css = blocks.join('\n') + '\n';
fs.writeFileSync(path.join(ROOT, 'tokens/bella.css'), css);
fs.writeFileSync(path.join(ROOT, 'docs/bella.css'), css);

// ---- bella.json ----
const entry = (t) => {
  const o = t.original.$value;
  const e = { $value: t.$value, $type: t.$type };
  if (typeof o === 'string' && ALIAS.test(o)) e.alias = o;
  if (t.$description) e.$description = t.$description;
  e.css = `--${t.name}`;
  e.tier = tierOf(t);
  return e;
};
const json = {
  $metadata: {
    name: 'BELLA',
    source: 'Figma Foundations, exported as DTCG to tokens/figma/; built by tokens/build.mjs (Style Dictionary).',
    themes: Object.fromEntries(THEMES.map((t) => [t.id, t.name])),
    default: DEFAULT_THEME,
    smallScreen: { media: SMALL_SCREEN, appliesTo: THEMES.filter((t) => t.id.startsWith('bella')).map((t) => t.id) },
  },
  themes: Object.fromEntries(THEMES.map((t) => [t.id, Object.fromEntries(byTheme[t.id].map((tk) => [tk.path.join('.'), entry(tk)]))])),
  smallScreen: Object.fromEntries(small.filter((t) => tierOf(t) === 'breakpoint').map((tk) => [tk.path.join('.'), entry(tk)])),
};
fs.writeFileSync(path.join(ROOT, 'tokens/bella.json'), JSON.stringify(json, null, 2) + '\n');

// ---- .storybook/theme-values.json (manager chrome) ----
const val = (theme, p) => {
  const t = byTheme[theme].find((x) => x.name === p.replaceAll('.', '-'));
  if (!t) throw new Error(`theme-values: ${p} missing in ${theme}`);
  return String(t.$value);
};
const L = (p) => val('bella-light', p);
const D = (p) => val('bella-dark', p);
const themeValues = {
  $note: 'Built by tokens/build.mjs from the Figma export. Do not edit by hand.',
  bg: L('color.background.default'),
  panel: L('color.background.surface'),
  line: L('color.border.default'),
  control: L('color.border.strong'),
  ink: L('color.content.default'),
  muted: L('color.content.subtle'),
  inkHover: L('color.background.brand.hover'),
  darkBg: D('color.background.default'),
  darkSurface: D('color.background.surface'),
  darkLine: D('color.border.default'),
  darkControl: D('color.border.strong'),
  darkInk: D('color.content.default'),
  darkMuted: D('color.content.subtle'),
  fontBody: L('typography.font-family.dm-sans'),
  fontMono: L('typography.font-family.geist-mono'),
  radiusMd: L('border.radius.8'),
  radiusLg: L('border.radius.12'),
};
fs.writeFileSync(path.join(ROOT, '.storybook/theme-values.json'), JSON.stringify(themeValues, null, 2) + '\n');

// ---- docs/tokens.md ----
const esc = (s) => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ');
const md = [
  '# BELLA tokens',
  '',
  'Built by `tokens/build.mjs` from the Figma Foundations export. Do not edit. Values per theme; an arrow means the token points at another token.',
  '',
];
const TIERS = [['primitive', 'Tier 1: ramps and scales'], ['breakpoint', 'Breakpoint sizes'], ['semantic', 'Tier 2: shared meaning'], ['component', 'Tier 3: part tokens']];
for (const [tier, title] of TIERS) {
  md.push(`## ${title}`, '');
  if (tier === 'primitive') {
    md.push('| CSS name | Value | Description |', '|---|---|---|');
    for (const t of def.filter((x) => tierOf(x) === tier)) md.push(`| \`--${t.name}\` | \`${esc(cssValue(t))}\` | ${esc(t.$description ?? '')} |`);
  } else {
    md.push(`| CSS name | ${THEMES.map((t) => t.name).join(' | ')} |`, `|---|${THEMES.map(() => '---').join('|')}|`);
    for (const t of def.filter((x) => tierOf(x) === tier)) {
      const cells = THEMES.map((th) => {
        const x = byTheme[th.id].find((y) => y.name === t.name);
        const o = x.original.$value;
        return typeof o === 'string' && ALIAS.test(o) ? `→ \`${o.slice(1, -1)}\` \`${esc(x.$value)}\`` : `\`${esc(x.$value)}\``;
      });
      md.push(`| \`--${t.name}\` | ${cells.join(' | ')} |`);
    }
  }
  md.push('');
}
fs.writeFileSync(path.join(ROOT, 'docs/tokens.md'), md.join('\n'));

console.log(`tokens: ${def.length} per theme, ${THEMES.length} themes, ${small.filter((t) => tierOf(t) === 'breakpoint').length} small-screen sizes`);
