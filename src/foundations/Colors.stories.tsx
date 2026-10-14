import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { leavesUnder, primitive, semanticDark, semanticLight, semanticWarm, semanticWeeDote, walk, SectionTitle, SwatchGrid, TokenTable } from './TokenSheet';

const meta: Meta = {
  title: 'Foundations/Colors',
};
export default meta;

const note: React.CSSProperties = { maxWidth: '60ch', color: 'var(--color-semantic-text-body)' };

/** The palette the semantic tier reads (style unify and brand refresh,
 * 2026-09-22): neutral light and dark steps, three chip fills, the brand
 * pattern, one accent (ochre). */
export const Palette: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>Light</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.light')} />
      <SectionTitle>Dark</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.dark')} />
      <SectionTitle>Chips</SectionTitle>
      <p style={note}>
        Fills only, the same in both themes, always with chip text. Colour lives in
        fills, never in strokes or body text.
      </p>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.chip')} />
      <SectionTitle>Pattern</SectionTitle>
      <p style={note}>
        The brand pattern's colours: the wordmark, PatternField and the favicon only.
        Never a UI or state colour, never recoloured.
      </p>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.pattern')} />
      <SectionTitle>Accent</SectionTitle>
      <p style={note}>
        Ochre is the one accent: a fill with ink text. On light, its lines and the
        focus ring are ochre-deep. It is never text on a light surface.
      </p>
      <SwatchGrid
        leaves={leavesUnder(primitive, 'color.brand').filter((l) => /ochre/.test(l.path))}
      />
    </div>
  ),
};

/** The 2026-07 identity primitives, kept for legacy consumers. The semantic
 * tier no longer reads them. */
export const Legacy: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>2026-07 brand</SectionTitle>
      <p style={note}>Kept for legacy consumers; not read by the semantic tier.</p>
      <SwatchGrid
        leaves={leavesUnder(primitive, 'color.brand').filter((l) => !/ochre/.test(l.path))}
      />
      <SectionTitle>Warm neutrals</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.neutral')} />
      <SectionTitle>Navy scale</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.navy')} />
      <SectionTitle>Warm dark scale</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.night')} />
      <SectionTitle>Status (carried, non-text only)</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.supporting')} />
    </div>
  ),
};

const ROLE_KEYS = [
  'action', 'action-on',
  'attention', 'attention-on',
  'success', 'success-on',
  'info',
  'danger',
  'quiet', 'quiet-on',
];

function roleLeaves(bindings: object) {
  return walk(bindings as never, ['color', 'semantic']).filter((l) =>
    ROLE_KEYS.some((k) => l.path === `color.semantic.${k}`)
  );
}

/** Role tokens: action, attention, success, info, danger, quiet (+ -on pairs).
 * These map The Bar's status semantics to fills. Info and danger are fills
 * only, never text. See Button AllThemes and StatusPill StatusLadder for
 * live use. (Elleta, 14 Oct 2026) */
export const RoleTokens: StoryObj = {
  parameters: { bella: { themeIntegrity: false } },
  render: () => (
    <div>
      {(
        [
          { label: 'light', bindings: semanticLight },
          { label: 'dark', bindings: semanticDark },
          { label: 'warm', bindings: semanticWarm },
          { label: 'wee-dote', bindings: semanticWeeDote },
        ]
      ).map(({ label, bindings }) => (
        <div
          key={label}
          data-theme={label === 'light' ? undefined : label}
          style={{ color: 'var(--color-semantic-text-primary)' }}
        >
          <SectionTitle>{label}</SectionTitle>
          {(label === 'light') && (
            <p style={note}>
              info and danger are fills only. Never text in those colours (AAA fails
              both ways). Button AllThemes and StatusPill StatusLadder show live use.
            </p>
          )}
          <TokenTable
            label={`Role tokens, ${label}`}
            leaves={roleLeaves(bindings as never)}
          />
        </div>
      ))}
    </div>
  ),
};

export const Semantic: StoryObj = {
  render: (_args, { globals }) => {
    const dark = globals.theme === 'dark';
    const bindings = dark ? semanticDark : semanticLight;
    return (
      <div>
        <SectionTitle>Semantic ({dark ? 'dark' : 'light'} bindings)</SectionTitle>
        <p style={note}>
          Chips resolve through the generated CSS custom properties, and the value
          column shows the {dark ? 'dark' : 'light'} set's references; both follow
          the theme toolbar. At narrow widths the table scrolls inside its frame.
        </p>
        <TokenTable
          label={`Semantic colour tokens, ${dark ? 'dark' : 'light'} bindings`}
          leaves={walk(bindings as never, ['color', 'semantic']).filter((l) => !l.value.startsWith('linear-gradient'))}
        />
      </div>
    );
  },
};
