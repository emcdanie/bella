import React from 'react';
import tokens from '../../tokens/bella.json';

/* Renders the verified contrast record straight from $extensions.bella.a11y
 * in tokens/bella.json. The ratios on this page are never written by hand:
 * the table walks the generated rollup, so a token edit plus a build is the
 * only way the numbers change. */

interface Row {
  path: string;
  value: string;
  note: string;
}

function walk(node: unknown, path: string[], rows: Row[]): void {
  if (node === null || typeof node !== 'object') return;
  const obj = node as Record<string, unknown>;
  if ('$value' in obj) {
    const ext = (obj.$extensions as Record<string, any> | undefined)?.bella;
    const a11y = ext?.a11y;
    if (typeof a11y === 'string') {
      rows.push({
        path: path.join('.'),
        value: typeof obj.$value === 'string' ? obj.$value : '',
        note: a11y,
      });
    }
    return;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    walk(v, [...path, k], rows);
  }
}

function collect(root: unknown, prefix: string[]): Row[] {
  const rows: Row[] = [];
  walk(root, prefix, rows);
  return rows;
}

const cellStyle: React.CSSProperties = {
  padding: 'var(--spacing-2) var(--spacing-3)',
  borderBottom: '1px solid var(--color-semantic-border-subtle)',
  fontSize: 'var(--typography-font-size-sm)',
  verticalAlign: 'top',
  textAlign: 'left',
};

function Section({ title, rows }: { title: string; rows: Row[] }) {
  if (rows.length === 0) return null;
  return (
    <>
      <tr>
        <th colSpan={3} style={{ ...cellStyle, paddingTop: 'var(--spacing-5)' }}>
          {title}
        </th>
      </tr>
      {rows.map((r) => (
        <tr key={r.path}>
          <td style={{ ...cellStyle, whiteSpace: 'nowrap', fontFamily: 'var(--typography-font-family-mono)' }}>
            {r.path}
          </td>
          <td style={cellStyle}>
            {/^#/.test(r.value) ? (
              <span
                aria-hidden="true"
                /* token specimen: renders the token's literal value on
                   purpose; audit:quality's no-literal lint skips it */
                data-bella-specimen=""
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  borderRadius: 'var(--radius-sm)',
                  background: r.value,
                  border: '1px solid var(--color-semantic-border)',
                  verticalAlign: 'middle',
                  marginRight: 'var(--spacing-2)',
                }}
              />
            ) : null}
            <code style={{ fontFamily: 'var(--typography-font-family-mono)' }}>{r.value}</code>
          </td>
          <td style={cellStyle}>{r.note}</td>
        </tr>
      ))}
    </>
  );
}

export default function A11yContrastTable() {
  const primitive = collect(tokens.primitive, []);
  const semanticLight = collect(tokens.semantic, ['semantic']);
  const semanticDark = collect(tokens.semantic_dark_overrides, ['semantic']);
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={cellStyle}>Token</th>
          <th style={cellStyle}>Value</th>
          <th style={cellStyle}>Verified record</th>
        </tr>
      </thead>
      <tbody>
        <Section title="Primitives" rows={primitive} />
        <Section title="Semantic (light)" rows={semanticLight} />
        <Section title="Semantic (dark overrides)" rows={semanticDark} />
      </tbody>
    </table>
  );
}
