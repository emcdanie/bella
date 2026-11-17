import React from 'react';
import tokens from '../../tokens/bella.json';

/* The main text and mark pairs, computed from tokens/bella.json in all four
 * themes. Nothing here is hand-written: a Figma change plus a build is the only
 * way a ratio changes. The full list is checked by scripts/contrast-pairs.mjs
 * in the gate (text 7:1, marks 3:1). */

type Entry = { $value: string };
const themes = (tokens as unknown as { themes: Record<string, Record<string, Entry>>; $metadata: { themes: Record<string, string> } });

const PAIRS: [string, string, string, number][] = [
  ['Text on the page', 'color.content.default', 'color.background.default', 7],
  ['Text on a card', 'color.content.default', 'color.background.surface', 7],
  ['Body text on a card', 'color.content.body', 'color.background.surface', 7],
  ['Muted text on the page', 'color.content.subtle', 'color.background.default', 7],
  ['Muted text on the subtle fill', 'color.content.subtle', 'color.background.subtle', 7],
  ['Label on the primary button', 'color.content.brand-knockout', 'color.background.brand', 7],
  ['Control edge on a card', 'color.border.strong', 'color.background.surface', 3],
  ['Focus ring on the page', 'color.border.focus', 'color.background.default', 3],
];

function lum(hex: string) {
  const h = hex.replace('#', '').slice(0, 6);
  const c = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const l = c.map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
}
function ratio(a: string, b: string) {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

const cellStyle: React.CSSProperties = {
  padding: 'var(--spacing-8) var(--spacing-12)',
  borderBottom: 'var(--border-width-1) solid var(--color-border-subtle)',
  fontSize: 'var(--typography-font-size-18)',
  verticalAlign: 'top',
  textAlign: 'left',
};

export default function A11yContrastTable() {
  const ids = Object.keys(themes.themes);
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={cellStyle}>Pair</th>
          <th style={cellStyle}>Needs</th>
          {ids.map((id) => (
            <th key={id} style={cellStyle}>{themes.$metadata.themes[id]}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {PAIRS.map(([label, fg, bg, bar]) => (
          <tr key={label}>
            <td style={cellStyle}>{label}</td>
            <td style={cellStyle}>{bar}:1</td>
            {ids.map((id) => {
              const r = ratio(themes.themes[id][fg].$value, themes.themes[id][bg].$value);
              return (
                <td key={id} style={cellStyle}>
                  {r.toFixed(2)}:1 {r >= bar ? 'pass' : 'fails'}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
