import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { leavesUnder, primitive, semanticDark, semanticLight, walk, SectionTitle, SwatchGrid, TokenTable } from './TokenSheet';

const meta: Meta = {
  title: 'Foundations/Colors',
};
export default meta;

const note: React.CSSProperties = { maxWidth: '60ch', color: 'var(--color-semantic-text-secondary)' };

/** The palette the semantic tier reads (style unify, 2026-09-22): neutral
 * light and dark steps, three chip fills, one accent in two modes. */
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
      <SectionTitle>Accent</SectionTitle>
      <p style={note}>
        Iris in light, periwinkle in dark: one accent, interactive only (links and
        the focus ring).
      </p>
      <SwatchGrid
        leaves={leavesUnder(primitive, 'color.brand').filter((l) => /iris|periwinkle/.test(l.path))}
      />
    </div>
  ),
};

/** The 2026-07 identity primitives, kept for legacy consumers. The semantic
 * tier no longer reads them, except navy as the dark text-on-accent. */
export const Legacy: StoryObj = {
  render: () => (
    <div>
      <SectionTitle>2026-07 brand</SectionTitle>
      <p style={note}>Kept for legacy consumers; not read by the semantic tier.</p>
      <SwatchGrid
        leaves={leavesUnder(primitive, 'color.brand').filter((l) => !/iris|periwinkle/.test(l.path))}
      />
      <SectionTitle>Iris / periwinkle ramp</SectionTitle>
      <SwatchGrid leaves={leavesUnder(primitive, 'color.iris')} />
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
