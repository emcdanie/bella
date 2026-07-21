import React from 'react';
import rollup from '../../tokens/bella.json';

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
};

export function walk(node: TokenNode, prefix: string[] = []): TokenLeaf[] {
  if (node === null || typeof node !== 'object') return [];
  if ('$value' in node) {
    const path = prefix.join('.');
    const cssPrefix = path.startsWith('blur.') ? '--bella-' : '--';
    return [
      {
        path,
        cssVar: cssPrefix + path.replace(/\./g, '-'),
        value: String(node.$value),
        description: node.$description,
      },
    ];
  }
  return Object.entries(node)
    .filter(([k]) => !k.startsWith('$'))
    .flatMap(([k, v]) => walk(v as TokenNode, [...prefix, k]));
}

export const primitive = rollup.primitive as unknown as TokenNode;
export const semanticLight = rollup.semantic as unknown as TokenNode;

export function leavesUnder(root: TokenNode, dotted: string): TokenLeaf[] {
  const node = dotted.split('.').reduce<TokenNode | undefined>(
    (n, k) => (n ? (n[k] as TokenNode) : undefined),
    root
  );
  return node ? walk(node, dotted.split('.')) : [];
}

const mono: React.CSSProperties = {
  fontFamily: 'var(--typography-font-family-body)',
  fontSize: 'var(--typography-font-size-tag)',
  letterSpacing: 'var(--typography-letter-spacing-wide)',
};

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 'var(--typography-font-size-3xl)',
        fontWeight: 700,
        margin: 'var(--spacing-10) 0 var(--spacing-5)',
      }}
    >
      {children}
    </h2>
  );
}

export function SwatchGrid({ leaves }: { leaves: TokenLeaf[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 'var(--spacing-3)',
      }}
    >
      {leaves.map((leaf) => (
        <div
          key={leaf.path}
          style={{
            background: 'var(--color-semantic-surface)',
            border: '1px solid var(--color-semantic-border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: 64, background: `var(${leaf.cssVar})` }} />
          <div style={{ padding: 'var(--spacing-3)' }}>
            <div style={{ ...mono, fontWeight: 500 }}>{leaf.path}</div>
            <div style={{ ...mono, color: 'var(--color-semantic-text-secondary)' }}>
              {leaf.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TokenTable({ leaves }: { leaves: TokenLeaf[] }) {
  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        background: 'var(--color-semantic-surface)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
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
                textTransform: 'uppercase',
                color: 'var(--color-semantic-text-secondary)',
                padding: 'var(--spacing-3) var(--spacing-4)',
                borderBottom: '1px solid var(--color-semantic-border-subtle)',
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
            <td style={{ ...mono, padding: 'var(--spacing-3) var(--spacing-4)', borderBottom: '1px solid var(--color-semantic-border-subtle)' }}>
              {leaf.path}
            </td>
            <td style={{ ...mono, padding: 'var(--spacing-3) var(--spacing-4)', borderBottom: '1px solid var(--color-semantic-border-subtle)', color: 'var(--color-semantic-text-secondary)' }}>
              {leaf.value}
            </td>
            <td style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderBottom: '1px solid var(--color-semantic-border-subtle)' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 20,
                  height: 20,
                  borderRadius: 'var(--radius-sm)',
                  background: `var(${leaf.cssVar})`,
                  border: '1px solid var(--color-semantic-border)',
                  verticalAlign: 'middle',
                }}
              />
            </td>
            <td style={{ fontSize: 'var(--typography-font-size-sm)', padding: 'var(--spacing-3) var(--spacing-4)', borderBottom: '1px solid var(--color-semantic-border-subtle)', color: 'var(--color-semantic-text-secondary)' }}>
              {leaf.description ?? ''}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
