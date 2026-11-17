import React from 'react';
import rollup from '../../tokens/bella.json';
import Heading from '../components/Heading/Heading';

/* Token-sheet renderers for the Foundations stories.
 *
 * Names, references, and descriptions come from tokens/bella.json (the
 * generated rollup — real values, never copies). Rendered chips resolve
 * through the generated CSS custom properties, so what you see is what
 * every consumer gets, in whichever theme is active. */

export type TokenLeaf = {
  path: string;
  cssVar: string;
  value: string;
  description?: string;
};

type TokenNode = { [key: string]: TokenNode } & {
  $value?: unknown;
  $description?: string;
  alias?: string;
};

export function walk(node: TokenNode, prefix: string[] = []): TokenLeaf[] {
  if (node === null || typeof node !== 'object') return [];
  if ('$value' in node) {
    const path = prefix.join('.');
    return [
      {
        path,
        cssVar: '--' + path.replace(/\./g, '-'),
        value: node.alias ? `${node.alias} ${String(node.$value)}` : String(node.$value),
        description: node.$description,
      },
    ];
  }
  return Object.entries(node)
    .filter(([k]) => !k.startsWith('$'))
    .flatMap(([k, v]) => walk(v as TokenNode, [...prefix, k]));
}

/* bella.json holds every token per theme as a flat map (path -> entry);
 * rebuild the tree for one theme and one tier. */
type Entry = { $value: unknown; $description?: string; alias?: string; tier: string };
const themes = (rollup as unknown as { themes: Record<string, Record<string, Entry>> }).themes;
export const THEME_IDS = Object.keys(themes);
export function tree(theme: string, tier: string): TokenNode {
  const root = {} as TokenNode;
  for (const [path, e] of Object.entries(themes[theme])) {
    if (e.tier !== tier) continue;
    const segs = path.split('.');
    let n = root;
    for (const k of segs.slice(0, -1)) n = (n[k] ??= {} as TokenNode);
    n[segs[segs.length - 1]] = { $value: e.$value, $description: e.$description, alias: e.alias } as TokenNode;
  }
  return root;
}

export const primitive = tree('bella-light', 'primitive');
export const semanticByTheme = Object.fromEntries(THEME_IDS.map((t) => [t, tree(t, 'semantic')]));

export function leavesUnder(root: TokenNode, dotted: string): TokenLeaf[] {
  const node = dotted.split('.').reduce<TokenNode | undefined>(
    (n, k) => (n ? (n[k] as TokenNode) : undefined),
    root
  );
  return node ? walk(node, dotted.split('.')) : [];
}

/* token names and values are meta: Geist Mono, 13px, ss09, no tracking */
const mono: React.CSSProperties = {
  fontFamily: 'var(--typography-font-family-geist-mono)',
  fontSize: 'var(--typography-font-size-16)',
  letterSpacing: 'var(--typography-letter-spacing-0)',
  fontFeatureSettings: 'var(--typography-font-feature-ss09)',
};

/* A real section heading: the Heading section tier, h2, Newsreader 500. */
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Heading tier="section" as="h2" style={{ margin: 'var(--spacing-40) 0 var(--spacing-20)' }}>
      {children}
    </Heading>
  );
}

export function SwatchGrid({ leaves }: { leaves: TokenLeaf[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--spacing-12)',
      }}
    >
      {leaves.map((leaf) => (
        <div
          key={leaf.path}
          style={{
            background: 'var(--color-background-surface)',
            border: '1px solid var(--color-border-default)',
            borderRadius: 'var(--border-radius-12)',
            overflow: 'hidden',
          }}
        >
          <div data-bella-specimen style={{ height: 64, background: `var(${leaf.cssVar})` }} />
          <div style={{ padding: 'var(--spacing-12)' }}>
            <div style={{ ...mono, fontWeight: 500 }}>{leaf.path}</div>
            <div style={{ ...mono, color: 'var(--color-content-body)' }}>
              {leaf.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* The table keeps its columns; at narrow widths it scrolls inside its own
 * keyboard-reachable region instead of pushing the page sideways. */
export function TokenTable({ leaves, label = 'Token table' }: { leaves: TokenLeaf[]; label?: string }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      style={{
        maxWidth: '100%',
        overflowX: 'auto',
        background: 'var(--color-background-surface)',
        border: '1px solid var(--color-border-default)',
        borderRadius: 'var(--border-radius-12)',
      }}
    >
    <table
      style={{
        width: '100%',
        minWidth: 'calc(var(--spacing-80) * 9)',
        borderCollapse: 'collapse',
      }}
    >
      <thead>
        <tr>
          {['Token', 'Value', 'Preview', 'Description'].map((h) => (
            <th
              key={h}
              style={{
                ...mono,
                textAlign: 'left',
                color: 'var(--color-content-body)',
                padding: 'var(--spacing-12) var(--spacing-16)',
                borderBottom: '1px solid var(--color-border-subtle)',
              }}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {leaves.map((leaf) => (
          <tr key={leaf.path}>
            <td style={{ ...mono, padding: 'var(--spacing-12) var(--spacing-16)', borderBottom: '1px solid var(--color-border-subtle)' }}>
              {leaf.path}
            </td>
            <td style={{ ...mono, padding: 'var(--spacing-12) var(--spacing-16)', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-content-body)' }}>
              {leaf.value}
            </td>
            <td style={{ padding: 'var(--spacing-12) var(--spacing-16)', borderBottom: '1px solid var(--color-border-subtle)' }}>
              {/^(#|rgb|hsl|\{color\.)/.test(leaf.value) ? (
              <span
                data-bella-specimen
                style={{
                  display: 'inline-block',
                  width: 20,
                  height: 20,
                  borderRadius: 'var(--border-radius-4)',
                  background: `var(${leaf.cssVar})`,
                  border: '1px solid var(--color-border-default)',
                  verticalAlign: 'middle',
                }}
              />
              ) : null}
            </td>
            <td style={{ fontSize: 'var(--typography-font-size-18)', padding: 'var(--spacing-12) var(--spacing-16)', borderBottom: '1px solid var(--color-border-subtle)', color: 'var(--color-content-body)' }}>
              {leaf.description ?? ''}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}
